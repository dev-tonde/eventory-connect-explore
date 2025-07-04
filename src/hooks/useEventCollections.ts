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

/**
 * Custom hook to fetch and generate dynamic event collections.
 */
export const useEventCollections = () => {
  return useQuery<EventCollection[]>({
    queryKey: ["event-collections"],
    queryFn: async () => {
      const collections: EventCollection[] = [];

      // Fetch upcoming active events
      const { data: upcomingEvents, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_active", true)
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true });

      if (error) throw error;
      if (!upcomingEvents) return collections;

      // Transform events to Event type
      const events: Event[] = upcomingEvents.map((event) => ({
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
        organizer: event.organizer || "Organizer",
        attendeeCount: event.current_attendees || 0,
        maxAttendees: event.max_attendees || 100,
        tags: event.tags || [],
      }));

      // This Weekend Collection
      const today = new Date();
      const dayOfWeek = today.getDay();
      const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
      const saturday = new Date(today);
      saturday.setDate(today.getDate() + daysUntilSaturday);
      const sunday = new Date(saturday);
      sunday.setDate(saturday.getDate() + 1);

      const thisWeekend = events.filter((event) => {
        const eventDate = new Date(event.date);
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
          tags: ["weekend", "featured"],
        });
      }

      // Free Events Collection
      const freeEvents = events.filter((event) => event.price === 0);
      if (freeEvents.length > 0) {
        collections.push({
          id: "free-events",
          name: "Free Events",
          description: "Amazing events that won't cost you a penny",
          image_url: "/placeholder.svg",
          events: freeEvents.slice(0, 8),
          curator: "Eventory",
          tags: ["free", "budget-friendly"],
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
          tags: ["popular", "trending"],
        });
      }

      // Category-based collections (minimum 3 events per category)
      const categories = [...new Set(events.map((event) => event.category))];
      categories.forEach((category) => {
        const categoryEvents = events
          .filter((event) => event.category === category)
          .slice(0, 6);

        if (categoryEvents.length >= 3) {
          collections.push({
            id: `${category.toLowerCase().replace(/\s+/g, "-")}-collection`,
            name: `${category} Events`,
            description: `Discover the best ${category.toLowerCase()} events`,
            image_url: "/placeholder.svg",
            events: categoryEvents,
            curator: "Eventory",
            tags: [category.toLowerCase()],
          });
        }
      });

      // Upcoming This Month
      const thisMonth = events.filter((event) => {
        const eventDate = new Date(event.date);
        const now = new Date();
        return (
          eventDate.getMonth() === now.getMonth() &&
          eventDate.getFullYear() === now.getFullYear()
        );
      });

      if (thisMonth.length > 0) {
        collections.push({
          id: "this-month",
          name: "This Month",
          description: "Don't miss these events happening this month",
          image_url: "/placeholder.svg",
          events: thisMonth.slice(0, 8),
          curator: "Eventory",
          tags: ["monthly", "upcoming"],
        });
      }

      // Only return collections with at least one event
      return collections.filter((collection) => collection.events.length > 0);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
