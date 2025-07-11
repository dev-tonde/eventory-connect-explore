import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserPoints {
  total_points: number;
  level: number;
  streak_days: number;
  badges: string[];
  last_activity: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  requirement: {
    type: 'event_creation' | 'event_attendance' | 'community_participation' | 'streak' | 'referral';
    count: number;
  };
}

interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url: string;
  total_points: number;
  level: number;
  badges: string[];
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_event',
    name: 'Event Creator',
    description: 'Create your first event',
    icon: '🎪',
    points: 100,
    requirement: { type: 'event_creation', count: 1 }
  },
  {
    id: 'event_master',
    name: 'Event Master',
    description: 'Create 10 events',
    icon: '🏆',
    points: 1000,
    requirement: { type: 'event_creation', count: 10 }
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Attend 5 events',
    icon: '🦋',
    points: 250,
    requirement: { type: 'event_attendance', count: 5 }
  },
  {
    id: 'party_animal',
    name: 'Party Animal',
    description: 'Attend 25 events',
    icon: '🎉',
    points: 1000,
    requirement: { type: 'event_attendance', count: 25 }
  },
  {
    id: 'community_helper',
    name: 'Community Helper',
    description: 'Send 50 community messages',
    icon: '🤝',
    points: 200,
    requirement: { type: 'community_participation', count: 50 }
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Maintain a 30-day activity streak',
    icon: '🔥',
    points: 500,
    requirement: { type: 'streak', count: 30 }
  },
  {
    id: 'influencer',
    name: 'Influencer',
    description: 'Refer 5 friends to Eventory',
    icon: '🌟',
    points: 750,
    requirement: { type: 'referral', count: 5 }
  }
];

export function useEnhancedGamification() {
  const { user } = useAuth();
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user points and stats
  const fetchUserPoints = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setUserPoints(data);
      } else {
        // Create initial points record
        await awardPoints('registration', 50);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Award points for specific actions
  const awardPoints = async (action: string, points: number, description?: string) => {
    if (!user) return;

    try {
      // Log the transaction
      await supabase.from('point_transactions').insert({
        user_id: user.id,
        action,
        points,
        description: description || `Points awarded for ${action}`,
      });

      // Update user points using the database function
      await supabase.rpc('update_user_points', {
        p_user_id: user.id,
        p_points: points,
      });

      // Check for new achievements
      await checkAchievements();

      // Refresh user points
      await fetchUserPoints();

      return { success: true };
    } catch (err: any) {
      console.error('Error awarding points:', err);
      return { success: false, error: err.message };
    }
  };

  // Check and award achievements
  const checkAchievements = async () => {
    if (!user) return;

    try {
      // Get user's current stats
      const { data: stats } = await supabase
        .from('user_points')
        .select('badges')
        .eq('user_id', user.id)
        .single();

      const currentBadges = stats?.badges || [];

      // Get user's activity counts
      const [eventsCreated, eventsAttended, messagesCount, streak] = await Promise.all([
        // Events created
        supabase.from('events').select('id').eq('organizer_id', user.id),
        // Events attended (tickets purchased)
        supabase.from('tickets').select('id').eq('user_id', user.id).eq('payment_status', 'completed'),
        // Community messages
        supabase.from('community_messages').select('id').eq('user_id', user.id),
        // Current streak (simplified - could be more complex)
        Promise.resolve(userPoints?.streak_days || 0)
      ]);

      const activityCounts = {
        event_creation: eventsCreated.data?.length || 0,
        event_attendance: eventsAttended.data?.length || 0,
        community_participation: messagesCount.data?.length || 0,
        streak: streak,
        referral: 0, // TODO: Implement referral tracking
      };

      // Check each achievement
      for (const achievement of ACHIEVEMENTS) {
        if (currentBadges.includes(achievement.id)) continue;

        const userCount = activityCounts[achievement.requirement.type];
        if (userCount >= achievement.requirement.count) {
          // Award achievement
          const newBadges = [...currentBadges, achievement.id];
          
          await supabase
            .from('user_points')
            .update({ badges: newBadges })
            .eq('user_id', user.id);

          // Award achievement points
          await awardPoints(
            `achievement_${achievement.id}`,
            achievement.points,
            `Achievement unlocked: ${achievement.name}`
          );

          console.log('Achievement unlocked:', achievement.name);
        }
      }
    } catch (err) {
      console.error('Error checking achievements:', err);
    }
  };

  // Fetch leaderboard
  const fetchLeaderboard = async (limit = 10) => {
    try {
      const { data, error } = await supabase
        .from('user_points')
        .select(`
          user_id,
          total_points,
          level,
          badges,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .order('total_points', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const formattedLeaderboard = data?.map(entry => ({
        user_id: entry.user_id,
        username: (entry.profiles as any)?.username || 'Anonymous',
        avatar_url: (entry.profiles as any)?.avatar_url || null,
        total_points: entry.total_points,
        level: entry.level,
        badges: entry.badges,
      })) || [];

      setLeaderboard(formattedLeaderboard);
      return formattedLeaderboard;
    } catch (err: any) {
      setError(err.message);
      return [];
    }
  };

  // Get user's rank
  const getUserRank = async () => {
    if (!user || !userPoints) return null;

    try {
      const { data, error } = await supabase
        .from('user_points')
        .select('total_points')
        .gt('total_points', userPoints.total_points);

      if (error) throw error;

      return (data?.length || 0) + 1;
    } catch (err) {
      console.error('Error getting user rank:', err);
      return null;
    }
  };

  // Calculate points needed for next level
  const getPointsToNextLevel = () => {
    if (!userPoints) return 0;
    const nextLevelThreshold = userPoints.level * 100;
    return Math.max(0, nextLevelThreshold - userPoints.total_points);
  };

  // Get achievement progress
  const getAchievementProgress = () => {
    return ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      unlocked: userPoints?.badges.includes(achievement.id) || false,
    }));
  };

  // Initialize gamification data
  useEffect(() => {
    if (user) {
      fetchUserPoints();
      fetchLeaderboard();
    }
  }, [user]);

  return {
    userPoints,
    leaderboard,
    achievements: ACHIEVEMENTS,
    isLoading,
    error,
    
    // Actions
    awardPoints,
    checkAchievements,
    fetchLeaderboard,
    getUserRank,
    
    // Computed values
    getPointsToNextLevel,
    getAchievementProgress,
  };
}