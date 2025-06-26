
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useTickets = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["tickets", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          *,
          events (
            title,
            date,
            time,
            venue,
            image_url
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "active");

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const purchaseTicketMutation = useMutation({
    mutationFn: async ({ eventId, quantity, totalPrice }: {
      eventId: string;
      quantity: number;
      totalPrice: number;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("tickets")
        .insert([{
          user_id: user.id,
          event_id: eventId,
          quantity,
          total_price: totalPrice,
        }])
        .select()
        .single();

      if (error) throw error;

      // Update event attendance count
      await supabase.rpc('increment_event_attendance', {
        event_uuid: eventId,
        increment_by: quantity
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Ticket Purchased",
        description: "Your ticket has been purchased successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Purchase Failed",
        description: "Failed to purchase ticket. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    tickets,
    isLoading,
    purchaseTicket: purchaseTicketMutation.mutate,
    isPurchasing: purchaseTicketMutation.isPending,
  };
};
