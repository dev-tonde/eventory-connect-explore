
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Event } from "@/types/event";

interface SearchFilters {
  category?: string;
  location?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  searchTerm?: string;
}

export const useEventSearch = (filters: SearchFilters = {}) => {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events", "search", filters],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select(`
          *,
          profiles!events_organizer_id_fkey (
            first_name,
            last_name
          )
        `)
        .eq("is_active", true);

      // Apply filters
      if (filters.category) {
        query = query.eq("category", filters.category);
      }

      if (filters.location) {
        query = query.ilike("venue", `%${filters.location}%`);
      }

      if (filters.dateRange) {
        query = query
          .gte("date", filters.dateRange.start)
          .lte("date", filters.dateRange.end);
      }

      if (filters.priceRange) {
        query = query
          .gte("price", filters.priceRange.min)
          .lte("price", filters.priceRange.max);
      }

      if (filters.searchTerm) {
        query = query.or(`title.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
      }

      query = query.order("date", { ascending: true });

      const { data, error } = await query;
      if (error) throw error;

      return data.map(event => ({
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
        organizer: event.profiles 
          ? `${event.profiles.first_name} ${event.profiles.last_name}`.trim()
          : 'Unknown Organizer',
        attendeeCount: event.current_attendees || 0,
        maxAttendees: event.max_attendees || 100,
        tags: event.tags || []
      })) as Event[];
    },
  });

  return { events, isLoading };
};
