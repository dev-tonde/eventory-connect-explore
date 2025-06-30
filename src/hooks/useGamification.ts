
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface UserPoints {
  user_id: string;
  total_points: number;
  level: number;
  badges: string[];
  streak_days: number;
  last_activity: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_required: number;
  category: string;
}

const AVAILABLE_BADGES: Badge[] = [
  { id: "first_event", name: "First Timer", description: "Attended your first event", icon: "🎉", points_required: 10, category: "attendance" },
  { id: "social_butterfly", name: "Social Butterfly", description: "Attended 5 events", icon: "🦋", points_required: 50, category: "attendance" },
  { id: "event_enthusiast", name: "Event Enthusiast", description: "Attended 10 events", icon: "🎯", points_required: 100, category: "attendance" },
  { id: "community_leader", name: "Community Leader", description: "Organized your first event", icon: "👑", points_required: 25, category: "organizing" },
  { id: "review_master", name: "Review Master", description: "Left 10 event reviews", icon: "⭐", points_required: 30, category: "engagement" },
  { id: "early_bird", name: "Early Bird", description: "Booked 5 events more than 30 days in advance", icon: "🐦", points_required: 40, category: "planning" },
  { id: "streak_master", name: "Streak Master", description: "Used the app for 7 consecutive days", icon: "🔥", points_required: 35, category: "engagement" },
];

export const useGamification = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user points and badges
  const { data: userPoints, isLoading } = useQuery({
    queryKey: ["user-points", user?.id],
    queryFn: async (): Promise<UserPoints | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_points" as any)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data as UserPoints || {
        user_id: user.id,
        total_points: 0,
        level: 1,
        badges: [],
        streak_days: 0,
        last_activity: new Date().toISOString(),
      };
    },
    enabled: !!user,
  });

  // Get leaderboard
  const { data: leaderboard = [] } = useQuery({
    queryKey: ["points-leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_points" as any)
        .select(`
          user_id,
          total_points,
          level,
          profiles!user_points_user_id_fkey (
            first_name,
            last_name,
            username
          )
        `)
        .order("total_points", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
  });

  // Award points mutation
  const awardPointsMutation = useMutation({
    mutationFn: async ({ points, action }: { points: number; action: string }) => {
      if (!user) throw new Error("User not authenticated");

      // Check if we can award points for this action today
      const { data: existingReward } = await supabase
        .from("point_transactions" as any)
        .select("*")
        .eq("user_id", user.id)
        .eq("action", action)
        .gte("created_at", new Date().toISOString().split('T')[0])
        .maybeSingle();

      if (existingReward) {
        return; // Already awarded today
      }

      // Award points
      const { error: transactionError } = await supabase
        .from("point_transactions" as any)
        .insert({
          user_id: user.id,
          points,
          action,
          description: `Earned ${points} points for ${action}`,
        });

      if (transactionError) throw transactionError;

      // Update user total points
      const { error: updateError } = await supabase.rpc("update_user_points" as any, {
        p_user_id: user.id,
        p_points: points,
      });

      if (updateError) throw updateError;
    },
    onSuccess: (_, { points, action }) => {
      queryClient.invalidateQueries({ queryKey: ["user-points", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["points-leaderboard"] });
      
      toast({
        title: "Points Earned! 🎉",
        description: `You earned ${points} points for ${action}!`,
      });
    },
  });

  // Calculate level from points
  const calculateLevel = (points: number) => {
    return Math.floor(points / 100) + 1;
  };

  // Get available badges user can earn
  const getAvailableBadges = () => {
    if (!userPoints) return [];
    
    return AVAILABLE_BADGES.filter(badge => 
      !userPoints.badges.includes(badge.id) && 
      userPoints.total_points >= badge.points_required
    );
  };

  // Get earned badges
  const getEarnedBadges = () => {
    if (!userPoints) return [];
    
    return AVAILABLE_BADGES.filter(badge => 
      userPoints.badges.includes(badge.id)
    );
  };

  return {
    userPoints,
    leaderboard,
    isLoading,
    availableBadges: getAvailableBadges(),
    earnedBadges: getEarnedBadges(),
    allBadges: AVAILABLE_BADGES,
    awardPoints: awardPointsMutation.mutate,
    calculateLevel,
  };
};
