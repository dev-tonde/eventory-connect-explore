
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
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // This mutation is now mainly for free tickets or admin purposes
  const purchaseTicketMutation = useMutation({
    mutationFn: async ({ eventId, quantity, totalPrice }: {
      eventId: string;
      quantity: number;
      totalPrice: number;
    }) => {
      if (!user) throw new Error("User not authenticated");

      // Only allow free tickets through this method
      if (totalPrice > 0) {
        throw new Error("Paid tickets must be processed through YOCO payment gateway");
      }

      const { data, error } = await supabase
        .from("tickets")
        .insert([{
          user_id: user.id,
          event_id: eventId,
          quantity,
          total_price: totalPrice,
          payment_status: 'completed',
          payment_method: 'free',
        }])
        .select()
        .single();

      if (error) throw error;

      // Update attendance count
      const { data: currentEvent } = await supabase
        .from("events")
        .select("current_attendees")
        .eq("id", eventId)
        .single();

      if (currentEvent) {
        await supabase
          .from("events")
          .update({ 
            current_attendees: (currentEvent.current_attendees || 0) + quantity 
          })
          .eq("id", eventId);
      }

      // Queue email notification for free tickets
      await supabase
        .from("email_notifications")
        .insert({
          user_id: user.id,
          event_id: eventId,
          email_type: 'free_ticket_confirmation',
          recipient_email: user.email || '',
          subject: 'Free Event Registration Confirmation',
          content: `Your registration for ${quantity} attendee(s) has been confirmed.`,
          template_data: { 
            eventId, 
            quantity, 
            totalPrice: 0,
            ticketId: data.id,
            // Access ticket_number safely if it exists
            ticketNumber: (data as any).ticket_number || null
          }
        });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Registration Successful",
        description: "Your free event registration has been confirmed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register for event. Please try again.",
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
