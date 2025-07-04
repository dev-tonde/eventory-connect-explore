import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface RevenueData {
  totalRevenue: number;
  monthlyRevenue: number;
  ticketsSold: number;
  averageTicketPrice: number;
  topEvents: Array<{
    eventId: string;
    eventTitle: string;
    revenue: number;
    ticketsSold: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    revenue: number;
    tickets: number;
  }>;
  revenueByCategory: Array<{
    category: string;
    revenue: number;
  }>;
}

/**
 * Custom hook to fetch and calculate revenue analytics for organizers.
 */
export const useRevenueAnalytics = () => {
  const { user, profile } = useAuth();

  return useQuery<RevenueData>({
    queryKey: ["revenue-analytics", user?.id],
    queryFn: async () => {
      if (!user || profile?.role !== "organizer") {
        return {
          totalRevenue: 0,
          monthlyRevenue: 0,
          ticketsSold: 0,
          averageTicketPrice: 0,
          topEvents: [],
          monthlyTrend: [],
          revenueByCategory: [],
        };
      }

      // Get organizer's events
      const { data: organizerEvents, error: eventsError } = await supabase
        .from("events")
        .select("id, title, category, price")
        .eq("organizer_id", user.id);

      if (eventsError || !organizerEvents) {
        throw new Error("Failed to fetch events");
      }

      const eventIds = organizerEvents.map((event) => event.id);
      if (eventIds.length === 0) {
        return {
          totalRevenue: 0,
          monthlyRevenue: 0,
          ticketsSold: 0,
          averageTicketPrice: 0,
          topEvents: [],
          monthlyTrend: [],
          revenueByCategory: [],
        };
      }

      // Get tickets for organizer's events
      const { data: tickets, error: ticketsError } = await supabase
        .from("tickets")
        .select("event_id, total_price, quantity, purchase_date")
        .in("event_id", eventIds)
        .eq("payment_status", "completed");

      if (ticketsError || !tickets) {
        return {
          totalRevenue: 0,
          monthlyRevenue: 0,
          ticketsSold: 0,
          averageTicketPrice: 0,
          topEvents: [],
          monthlyTrend: [],
          revenueByCategory: [],
        };
      }

      // Calculate total revenue and tickets sold
      const totalRevenue = tickets.reduce(
        (sum, ticket) => sum + Number(ticket.total_price),
        0
      );
      const ticketsSold = tickets.reduce(
        (sum, ticket) => sum + Number(ticket.quantity),
        0
      );
      const averageTicketPrice =
        ticketsSold > 0 ? totalRevenue / ticketsSold : 0;

      // Calculate monthly revenue (current month)
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const monthlyRevenue = tickets
        .filter((ticket) => {
          const ticketDate = new Date(ticket.purchase_date);
          return (
            ticketDate.getMonth() === currentMonth &&
            ticketDate.getFullYear() === currentYear
          );
        })
        .reduce((sum, ticket) => sum + Number(ticket.total_price), 0);

      // Calculate top events by revenue
      const eventRevenue = new Map<
        string,
        { revenue: number; tickets: number; title: string }
      >();
      tickets.forEach((ticket) => {
        const event = organizerEvents.find((e) => e.id === ticket.event_id);
        if (event) {
          const current = eventRevenue.get(ticket.event_id) || {
            revenue: 0,
            tickets: 0,
            title: event.title,
          };
          eventRevenue.set(ticket.event_id, {
            revenue: current.revenue + Number(ticket.total_price),
            tickets: current.tickets + Number(ticket.quantity),
            title: event.title,
          });
        }
      });

      const topEvents = Array.from(eventRevenue.entries())
        .map(([eventId, data]) => ({
          eventId,
          eventTitle: data.title,
          revenue: data.revenue,
          ticketsSold: data.tickets,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Calculate monthly trend (last 6 months)
      const monthlyTrend = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });

        const monthTickets = tickets.filter((ticket) => {
          const ticketDate = new Date(ticket.purchase_date);
          return (
            ticketDate.getMonth() === date.getMonth() &&
            ticketDate.getFullYear() === date.getFullYear()
          );
        });

        monthlyTrend.push({
          month,
          revenue: monthTickets.reduce(
            (sum, ticket) => sum + Number(ticket.total_price),
            0
          ),
          tickets: monthTickets.reduce(
            (sum, ticket) => sum + Number(ticket.quantity),
            0
          ),
        });
      }

      // Calculate revenue by category
      const categoryRevenue = new Map<string, number>();
      tickets.forEach((ticket) => {
        const event = organizerEvents.find((e) => e.id === ticket.event_id);
        if (event) {
          const current = categoryRevenue.get(event.category) || 0;
          categoryRevenue.set(
            event.category,
            current + Number(ticket.total_price)
          );
        }
      });

      const revenueByCategory = Array.from(categoryRevenue.entries())
        .map(([category, revenue]) => ({ category, revenue }))
        .sort((a, b) => b.revenue - a.revenue);

      return {
        totalRevenue,
        monthlyRevenue,
        ticketsSold,
        averageTicketPrice,
        topEvents,
        monthlyTrend,
        revenueByCategory,
      };
    },
    enabled: !!user && profile?.role === "organizer",
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
