import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Event } from "@/types/event";
import { useMemo } from "react";

interface UseOptimizedEventsOptions {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

/**
 * Custom hook to fetch and categorize optimized events.
 */
export const useOptimizedEvents = (options: UseOptimizedEventsOptions = {}) => {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 10 * 60 * 1000, // 10 minutes
  } = options;

  const {
    data: events = [],
    isLoading,
    error,
  } = useQuery<Event[]>({
    queryKey: ["optimized-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(
          `
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
        `
        )
        .eq("is_active", true)
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map((event) => ({
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
          : "Unknown Organizer",
        attendeeCount: event.current_attendees || 0,
        maxAttendees: event.max_attendees || 100,
        tags: event.tags || [],
      })) as Event[];
    },
    enabled,
    staleTime,
    gcTime: cacheTime,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Memoize derived data to avoid unnecessary recalculations
  const categorizedEvents = useMemo(() => {
    const categories: Record<string, Event[]> = {};
    events.forEach((event) => {
      if (!categories[event.category]) {
        categories[event.category] = [];
      }
      categories[event.category].push(event);
    });
    return categories;
  }, [events]);

  const upcomingEvents = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return events.filter((event) => event.date >= today);
  }, [events]);

  return {
    events,
    categorizedEvents,
    upcomingEvents,
    isLoading,
    error,
  };
};
