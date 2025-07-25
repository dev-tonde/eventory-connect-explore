import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LineupMoodData {
  lineup_id: string;
  artist_name: string;
  average_mood: number;
  total_checkins: number;
  mood_distribution: {
    [key: number]: number;
  };
  comments: Array<{
    comment: string;
    mood_score: number;
    created_at: string;
  }>;
}

export const useLineupAnalytics = (eventId: string) => {
  return useQuery({
    queryKey: ["lineup-analytics", eventId],
    queryFn: async () => {
      if (!eventId) return [];

      // Get lineup items with mood data
      const { data: lineupData, error: lineupError } = await supabase
        .from("event_lineup")
        .select(`
          id,
          artist_name,
          start_time,
          end_time,
          stage_name
        `)
        .eq("event_id", eventId)
        .order("start_time");

      if (lineupError) throw lineupError;

      // Get mood check-ins for each lineup item
      const analyticsData: LineupMoodData[] = [];

      for (const lineup of lineupData || []) {
        const { data: moodData, error: moodError } = await supabase
          .from("mood_checkins")
          .select("mood_score, comment, created_at")
          .eq("lineup_id", lineup.id);

        if (moodError) throw moodError;

        // Calculate analytics
        const moods = moodData || [];
        const totalCheckins = moods.length;
        const averageMood = totalCheckins > 0 
          ? moods.reduce((sum, m) => sum + m.mood_score, 0) / totalCheckins 
          : 0;

        // Mood distribution
        const moodDistribution: { [key: number]: number } = {};
        for (let i = 1; i <= 5; i++) {
          moodDistribution[i] = moods.filter(m => m.mood_score === i).length;
        }

        // Recent comments
        const comments = moods
          .filter(m => m.comment)
          .map(m => ({
            comment: m.comment!,
            mood_score: m.mood_score,
            created_at: m.created_at,
          }))
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5); // Latest 5 comments

        analyticsData.push({
          lineup_id: lineup.id,
          artist_name: lineup.artist_name,
          average_mood: Math.round(averageMood * 100) / 100,
          total_checkins: totalCheckins,
          mood_distribution: moodDistribution,
          comments,
        });
      }

      return analyticsData;
    },
    enabled: !!eventId,
    refetchInterval: 30000, // Refetch every 30 seconds during live events
  });
};