
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Event } from "@/types/event";
import { useMemo } from "react";

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

export const useOptimizedEventSearch = (filters: SearchFilters = {}) => {
  // Create a stable query key based on filters
  const queryKey = useMemo(() => 
    ["events", "optimized-search", JSON.stringify(filters)], 
    [filters]
  );

  const { data: events = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select(`
          id,
          title,
          description,
          date,
          time,
          venue,
          address,
          price,
          category,
          image_url,
          current_attendees,
          max_attendees,
          tags,
          profiles!events_organizer_id_fkey (
            first_name,
            last_name
          )
        `)
        .eq("is_active", true);

      // Apply filters efficiently using indexed columns
      if (filters.category) {
        query = query.eq("category", filters.category);
      }

      if (filters.location) {
        query = query.ilike("venue", `%${filters.location}%`);
      }

      if (filters.dateRange?.start && filters.dateRange?.end) {
        query = query
          .gte("date", filters.dateRange.start)
          .lte("date", filters.dateRange.end);
      } else {
        // Default to future events only
        query = query.gte("date", new Date().toISOString().split('T')[0]);
      }

      if (filters.priceRange) {
        if (filters.priceRange.min > 0) {
          query = query.gte("price", filters.priceRange.min);
        }
        if (filters.priceRange.max > 0) {
          query = query.lte("price", filters.priceRange.max);
        }
      }

      if (filters.searchTerm) {
        query = query.or(`title.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
      }

      // Use indexed columns for ordering
      query = query
        .order("date", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(100);

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
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: Object.keys(filters).length > 0 || filters.searchTerm !== undefined,
  });

  return { events, isLoading };
};
