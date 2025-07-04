import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface EventAnalytics {
  views: number;
  clicks: number;
  shares: number;
  favorites: number;
  totalRevenue: number;
  ticketsSold: number;
}

/**
 * Custom hook to fetch and track analytics for a specific event.
 */
export const useEventAnalytics = (eventId?: string) => {
  const { user } = useAuth();

  const { data: analytics, isLoading } = useQuery<EventAnalytics | null>({
    queryKey: ["event-analytics", eventId, user?.id],
    queryFn: async () => {
      if (!user || !eventId) return null;

      // Get analytics data
      const { data: analyticsData = [], error: analyticsError } = await supabase
        .from("event_analytics")
        .select("metric_type")
        .eq("event_id", eventId);

      if (analyticsError) throw analyticsError;

      // Get ticket sales data
      const { data: ticketsData = [], error: ticketsError } = await supabase
        .from("tickets")
        .select("quantity, total_price")
        .eq("event_id", eventId)
        .eq("status", "active");

      if (ticketsError) throw ticketsError;

      // Get favorites count
      const { data: favoritesData = [], error: favoritesError } = await supabase
        .from("favorites")
        .select("id")
        .eq("event_id", eventId);

      if (favoritesError) throw favoritesError;

      const analytics: EventAnalytics = {
        views: analyticsData.filter((a) => a.metric_type === "view").length,
        clicks: analyticsData.filter((a) => a.metric_type === "click").length,
        shares: analyticsData.filter((a) => a.metric_type === "share").length,
        favorites: favoritesData.length,
        totalRevenue: ticketsData.reduce(
          (sum, ticket) => sum + Number(ticket.total_price),
          0
        ),
        ticketsSold: ticketsData.reduce(
          (sum, ticket) => sum + Number(ticket.quantity),
          0
        ),
      };

      return analytics;
    },
    enabled: !!user && !!eventId,
    staleTime: 60 * 1000, // 1 minute
  });

  /**
   * Tracks an event metric (view, click, share, etc.).
   * Uses a stored procedure for views, direct insert for others.
   */
  const trackEvent = async (eventId: string, metricType: string) => {
    if (!eventId) return;
    if (metricType === "view") {
      await supabase.rpc("track_event_view", {
        event_uuid: eventId,
        session_id: null,
      });
    } else {
      await supabase.from("event_analytics").insert({
        event_id: eventId,
        metric_type: metricType,
        user_id: user?.id,
      });
    }
  };

  return {
    analytics,
    isLoading,
    trackEvent,
  };
};
