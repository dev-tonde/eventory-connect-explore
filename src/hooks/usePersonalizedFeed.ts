import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/EnhancedAuthContext';

interface PersonalizedEvent {
  event_id: string;
  title: string;
  description: string;
  venue: string;
  event_date: string;
  event_time: string;
  category: string;
  tags: string[];
  image_url: string;
  match_score: number;
}

export const usePersonalizedFeed = (limit: number = 20) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['personalized-events', user?.id, limit],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .rpc('get_personalized_events', {
          p_user_id: user.id,
          p_limit: limit,
        });

      if (error) throw error;
      return data as PersonalizedEvent[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUserInterests = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-interests', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_interest_follows')
        .select(`
          id,
          followed_at,
          interest_tags (
            id,
            name,
            category,
            description,
            color_hex
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};