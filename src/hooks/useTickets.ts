
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

      // Use the new database function to increment attendance atomically
      const { error: updateError } = await supabase.rpc('increment_event_attendance', {
        event_uuid: eventId,
        quantity_val: quantity
      });

      if (updateError) throw updateError;

      // Queue email notification for ticket purchase
      await supabase.rpc('queue_email_notification', {
        user_uuid: user.id,
        event_uuid: eventId,
        email_type_val: 'ticket_purchase',
        recipient_email_val: user.email,
        subject_val: 'Ticket Purchase Confirmation',
        content_val: `Your ticket has been confirmed for ${quantity} attendee(s).`,
        template_data_val: { eventId, quantity, totalPrice }
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
