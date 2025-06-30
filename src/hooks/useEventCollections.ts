
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Event } from "@/types/event";

interface EventCollection {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  events: Event[];
  curator: string;
  tags: string[];
}

export const useEventCollections = () => {
  return useQuery({
    queryKey: ["event-collections"],
    queryFn: async (): Promise<EventCollection[]> => {
      // Get curated collections (this would be managed by admins/curators)
      const collections: EventCollection[] = [];

      // Get upcoming events to create dynamic collections
      const { data: upcomingEvents } = await supabase
        .from("events")
        .select("*")
        .eq("is_active", true)
        .gte("date", new Date().toISOString().split('T')[0])
        .order("date", { ascending: true });

      if (!upcomingEvents) return collections;

      // Transform events to Event type
      const events: Event[] = upcomingEvents.map(event => ({
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
      }));

      // Create dynamic collections
      // This Weekend Collection
      const thisWeekend = events.filter(event => {
        const eventDate = new Date(event.date);
        const today = new Date();
        const dayOfWeek = today.getDay();
        const daysUntilSaturday = 6 - dayOfWeek;
        const saturday = new Date(today);
        saturday.setDate(today.getDate() + daysUntilSaturday);
        const sunday = new Date(saturday);
        sunday.setDate(saturday.getDate() + 1);

        return eventDate >= saturday && eventDate <= sunday;
      });

      if (thisWeekend.length > 0) {
        collections.push({
          id: "this-weekend",
          name: "This Weekend",
          description: "Perfect events to enjoy this weekend",
          image_url: "/placeholder.svg",
          events: thisWeekend.slice(0, 6),
          curator: "Eventory",
          tags: ["weekend", "featured"]
        });
      }

      // Free Events Collection
      const freeEvents = events.filter(event => event.price === 0);
      if (freeEvents.length > 0) {
        collections.push({
          id: "free-events",
          name: "Free Events",
          description: "Amazing events that won't cost you a penny",
          image_url: "/placeholder.svg",
          events: freeEvents.slice(0, 8),
          curator: "Eventory",
          tags: ["free", "budget-friendly"]
        });
      }

      // Popular Events (by attendee count)
      const popularEvents = [...events]
        .sort((a, b) => b.attendeeCount - a.attendeeCount)
        .slice(0, 6);

      if (popularEvents.length > 0) {
        collections.push({
          id: "popular-events",
          name: "Popular Events",
          description: "Events everyone's talking about",
          image_url: "/placeholder.svg",
          events: popularEvents,
          curator: "Eventory",
          tags: ["popular", "trending"]
        });
      }

      // Category-based collections
      const categories = [...new Set(events.map(event => event.category))];
      
      categories.forEach(category => {
        const categoryEvents = events
          .filter(event => event.category === category)
          .slice(0, 6);

        if (categoryEvents.length >= 3) {
          collections.push({
            id: `${category.toLowerCase().replace(/\s+/g, '-')}-collection`,
            name: `${category} Events`,
            description: `Discover the best ${category.toLowerCase()} events`,
            image_url: "/placeholder.svg",
            events: categoryEvents,
            curator: "Eventory",
            tags: [category.toLowerCase()]
          });
        }
      });

      // Upcoming This Month
      const thisMonth = events.filter(event => {
        const eventDate = new Date(event.date);
        const today = new Date();
        return eventDate.getMonth() === today.getMonth() && 
               eventDate.getFullYear() === today.getFullYear();
      });

      if (thisMonth.length > 0) {
        collections.push({
          id: "this-month",
          name: "This Month",
          description: "Don't miss these events happening this month",
          image_url: "/placeholder.svg",
          events: thisMonth.slice(0, 8),
          curator: "Eventory",
          tags: ["monthly", "upcoming"]
        });
      }

      return collections.filter(collection => collection.events.length > 0);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
