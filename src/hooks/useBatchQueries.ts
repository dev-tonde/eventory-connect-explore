
import { useQueries } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useBatchUserData = () => {
  const { user } = useAuth();

  const results = useQueries({
    queries: [
      {
        queryKey: ["user-tickets", user?.id],
        queryFn: async () => {
          if (!user) return [];
          const { data, error } = await supabase
            .from("tickets")
            .select(`
              id,
              quantity,
              total_price,
              purchase_date,
              events!inner (
                title,
                date,
                time,
                venue
              )
            `)
            .eq("user_id", user.id)
            .eq("status", "active")
            .order("purchase_date", { ascending: false })
            .limit(10);

          if (error) throw error;
          return data;
        },
        enabled: !!user,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
      {
        queryKey: ["user-favorites", user?.id],
        queryFn: async () => {
          if (!user) return [];
          const { data, error } = await supabase
            .from("favorites")
            .select("event_id")
            .eq("user_id", user.id);

          if (error) throw error;
          return data.map(fav => fav.event_id);
        },
        enabled: !!user,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
      {
        queryKey: ["user-notifications", user?.id],
        queryFn: async () => {
          if (!user) return [];
          const { data, error } = await supabase
            .from("user_notifications")
            .select("*")
            .eq("user_id", user.id)
            .eq("is_read", false)
            .order("created_at", { ascending: false })
            .limit(5);

          if (error) throw error;
          return data;
        },
        enabled: !!user,
        staleTime: 1 * 60 * 1000, // 1 minute for notifications
      },
    ],
  });

  return {
    tickets: results[0].data || [],
    ticketsLoading: results[0].isLoading,
    favorites: results[1].data || [],
    favoritesLoading: results[1].isLoading,
    notifications: results[2].data || [],
    notificationsLoading: results[2].isLoading,
    isLoading: results.some(result => result.isLoading),
  };
};
