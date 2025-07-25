import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface EventRecommendation {
  id: string;
  event_id: string;
  score: number;
  reasoning: string;
  event: {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    venue: string;
    category: string;
    image_url: string;
    price: number;
  };
}

export function useEventRecommendations() {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: recommendations, isLoading, refetch } = useQuery({
    queryKey: ["event-recommendations", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("user_event_recommendations")
        .select(`
          *,
          event:events (
            id,
            title,
            description,
            date,
            time,
            venue,
            category,
            image_url,
            price
          )
        `)
        .eq("user_id", user.id)
        .order("score", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as EventRecommendation[];
    },
    enabled: !!user?.id,
  });

  const generateRecommendations = async () => {
    if (!user?.id) return;
    
    setIsGenerating(true);
    try {
      const { error } = await supabase.functions.invoke('generate-event-recommendations', {
        body: { userId: user.id }
      });

      if (error) throw error;
      
      // Refresh recommendations after generation
      await refetch();
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const markAsViewed = async (recommendationId: string) => {
    await supabase
      .from("user_event_recommendations")
      .update({ viewed: true })
      .eq("id", recommendationId);
  };

  const markAsClicked = async (recommendationId: string) => {
    await supabase
      .from("user_event_recommendations")
      .update({ clicked: true })
      .eq("id", recommendationId);
  };

  return {
    recommendations: recommendations || [],
    isLoading,
    isGenerating,
    generateRecommendations,
    markAsViewed,
    markAsClicked,
    refetch
  };
}