/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface SplitPayment {
  id: string;
  event_id: string;
  organizer_id: string;
  total_amount: number;
  quantity: number;
  status: "pending" | "partial" | "complete" | "cancelled";
  created_at: string;
  expires_at: string;
  participants: SplitPaymentParticipant[];
}

interface SplitPaymentParticipant {
  id: string;
  email: string;
  amount: number;
  status: "pending" | "paid" | "failed";
  payment_method?: string;
  paid_at?: string;
}

interface CreateSplitPaymentData {
  eventId: string;
  totalAmount: number;
  quantity: number;
  participantEmails: string[];
}

/**
 * Custom hook for managing split payments for event tickets.
 */
export const useSplitPayments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch split payments for the current user
  const { data: splitPayments = [], isLoading } = useQuery<SplitPayment[]>({
    queryKey: ["split-payments", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("split_payments")
        .select(
          `
          *,
          split_payment_participants (*)
        `
        )
        .eq("organizer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((payment) => ({
        ...payment,
        participants: payment.split_payment_participants || [],
      })) as SplitPayment[];
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Create a new split payment
  const createSplitPaymentMutation = useMutation({
    mutationFn: async (data: CreateSplitPaymentData) => {
      if (!user) throw new Error("User not authenticated");

      const { data: result, error } = await supabase.rpc(
        "create_split_payment",
        {
          _event_id: data.eventId,
          _total_amount: data.totalAmount,
          _quantity: data.quantity,
          _participant_emails: data.participantEmails,
        }
      );

      if (error) throw error;

      // Queue email notifications for participants
      await Promise.all(
        data.participantEmails.map((email) =>
          supabase.from("email_notifications").insert({
            user_id: user.id,
            event_id: data.eventId,
            email_type: "split_payment_invite",
            recipient_email: email,
            subject: "You're invited to split a ticket purchase",
            content: `You've been invited to split the cost of tickets. Your share is $${(
              data.totalAmount / data.participantEmails.length
            ).toFixed(2)}.`,
            template_data: {
              splitId: result,
              totalAmount: data.totalAmount,
              shareAmount: data.totalAmount / data.participantEmails.length,
              eventId: data.eventId,
            },
          })
        )
      );

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["split-payments", user?.id] });
      toast({
        title: "Split Payment Created",
        description: "Invitations have been sent to participants.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Split",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Process a participant's split payment contribution
  const processSplitPaymentMutation = useMutation({
    mutationFn: async ({
      splitId,
      participantEmail,
    }: {
      splitId: string;
      participantEmail: string;
    }) => {
      const { data, error } = await supabase.rpc(
        "process_split_payment_contribution",
        {
          _split_id: splitId,
          _participant_email: participantEmail,
          _payment_method: "mock_payment",
        }
      );

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["split-payments", user?.id] });
      toast({
        title: "Payment Successful",
        description: "Your contribution has been processed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get a split payment by its ID
  const getSplitById = (splitId: string) => {
    return splitPayments.find((split) => split.id === splitId);
  };

  return {
    splitPayments,
    isLoading,
    createSplitPayment: createSplitPaymentMutation.mutate,
    isCreatingSplit: createSplitPaymentMutation.isPending,
    processSplitPayment: processSplitPaymentMutation.mutate,
    isProcessingPayment: processSplitPaymentMutation.isPending,
    getSplitById,
  };
};
