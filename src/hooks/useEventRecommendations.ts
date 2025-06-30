
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Event } from "@/types/event";

interface EventRecommendation {
  event: Event;
  score: number;
  reasons: string[];
}

export const useEventRecommendations = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["event-recommendations", user?.id],
    queryFn: async (): Promise<EventRecommendation[]> => {
      if (!user) return [];

      // Get user's event history and preferences
      const { data: userTickets } = await supabase
        .from("tickets")
        .select("event_id, events(category, tags)")
        .eq("user_id", user.id);

      const { data: userFavorites } = await supabase
        .from("favorites")
        .select("event_id, events(category, tags)")
        .eq("user_id", user.id);

      // Analyze user preferences
      const categories = new Map<string, number>();
      const tags = new Map<string, number>();

      [...(userTickets || []), ...(userFavorites || [])].forEach(item => {
        if (item.events) {
          const event = item.events as any;
          categories.set(event.category, (categories.get(event.category) || 0) + 1);
          if (event.tags) {
            event.tags.forEach((tag: string) => {
              tags.set(tag, (tags.get(tag) || 0) + 1);
            });
          }
        }
      });

      // Get upcoming events
      const { data: upcomingEvents } = await supabase
        .from("events")
        .select("*")
        .eq("is_active", true)
        .gte("date", new Date().toISOString().split('T')[0])
        .order("date", { ascending: true })
        .limit(20);

      if (!upcomingEvents) return [];

      // Score events based on user preferences
      const recommendations: EventRecommendation[] = upcomingEvents.map(event => {
        let score = 0;
        const reasons: string[] = [];

        // Category matching
        const categoryScore = categories.get(event.category) || 0;
        if (categoryScore > 0) {
          score += categoryScore * 10;
          reasons.push(`You've attended ${categoryScore} ${event.category} events`);
        }

        // Tag matching
        if (event.tags) {
          event.tags.forEach((tag: string) => {
            const tagScore = tags.get(tag) || 0;
            if (tagScore > 0) {
              score += tagScore * 5;
              reasons.push(`Matches your interest in ${tag}`);
            }
          });
        }

        // Price preference (favor events in similar price range)
        const avgPrice = [...(userTickets || [])].reduce((sum, ticket) => {
          return sum + (ticket.events as any)?.price || 0;
        }, 0) / (userTickets?.length || 1);

        if (Math.abs(event.price - avgPrice) < 50) {
          score += 5;
          reasons.push("Price matches your typical spending");
        }

        // Time-based boost for events happening soon
        const daysUntil = Math.ceil((new Date(event.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (daysUntil <= 7) {
          score += 3;
          reasons.push("Happening soon");
        }

        return {
          event: {
            id: event.id,
            title: event.title,
            description: event.description || "",
            date: event.date,
            time: event.time,
            location: event.venue,
            address: event.address || "",
            price: Number(event.price),
            category: event.category,
            image: event.image_url || "/placeholder.svg",
            organizer: "Organizer",
            attendeeCount: event.current_attendees || 0,
            maxAttendees: event.max_attendees || 100,
            tags: event.tags || []
          } as Event,
          score,
          reasons
        };
      });

      return recommendations
        .filter(rec => rec.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
