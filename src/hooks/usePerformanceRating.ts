import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface PerformanceRating {
  id: string;
  event_id: string;
  lineup_id: string;
  user_id?: string;
  session_token?: string;
  rating_type: 'thumbs_up' | 'fire' | 'sleeping' | 'thumbs_down';
  rating_value: number;
  created_at: string;
}

interface RatingSummary {
  total_ratings: number;
  thumbs_up: number;
  fire: number;
  sleeping: number;
  thumbs_down: number;
  average_score: number;
  latest_ratings: Array<{
    rating_type: string;
    created_at: string;
  }>;
}

const RATING_CONFIG = {
  thumbs_up: { value: 3, emoji: '👍', label: 'Good' },
  fire: { value: 4, emoji: '🔥', label: 'Amazing' },
  sleeping: { value: 2, emoji: '😴', label: 'Boring' },
  thumbs_down: { value: 1, emoji: '👎', label: 'Poor' }
};

export const usePerformanceRating = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratingSummary, setRatingSummary] = useState<RatingSummary | null>(null);
  const { toast } = useToast();

  // Submit rating
  const submitRating = async (
    eventId: string,
    lineupId: string,
    ratingType: keyof typeof RATING_CONFIG,
    userId?: string
  ) => {
    setIsSubmitting(true);
    
    try {
      const ratingData = {
        event_id: eventId,
        lineup_id: lineupId,
        rating_type: ratingType,
        rating_value: RATING_CONFIG[ratingType].value,
        user_id: userId || null,
        session_token: userId ? null : `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ip_address: null, // Could be populated on server side
        user_agent: navigator.userAgent
      };

      const { error } = await supabase
        .from('performance_ratings')
        .insert(ratingData);

      if (error) throw error;

      toast({
        title: "Rating Submitted",
        description: `Thanks for rating this performance ${RATING_CONFIG[ratingType].emoji}`,
      });

      // Refresh summary after submission
      await fetchRatingSummary(eventId, lineupId);
      
      return true;
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch rating summary
  const fetchRatingSummary = async (eventId: string, lineupId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_performance_ratings_summary', {
        event_uuid: eventId,
        lineup_uuid: lineupId
      });

      if (error) throw error;
      
      // Handle the JSON response from the database function
      const summary = data as unknown as RatingSummary;
      setRatingSummary(summary);
      return summary;
    } catch (error) {
      console.error('Error fetching rating summary:', error);
      return null;
    }
  };

  // Get user's rating for a performance (if logged in)
  const getUserRating = async (eventId: string, lineupId: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('performance_ratings')
        .select('rating_type, created_at')
        .eq('event_id', eventId)
        .eq('lineup_id', lineupId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error fetching user rating:', error);
      return null;
    }
  };

  return {
    isSubmitting,
    ratingSummary,
    submitRating,
    fetchRatingSummary,
    getUserRating,
    RATING_CONFIG
  };
};