/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PaymentData {
  eventId: string;
  quantity: number;
  totalPrice: number;
}

/**
 * Custom hook to process Yoco payments for event tickets.
 */
export const useYocoPayment = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Processes a Yoco payment and returns the result.
   */
  const processPayment = async (
    paymentData: PaymentData,
    paymentMethodId: string
  ): Promise<{ success: boolean; paymentId?: string }> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to complete your purchase.",
        variant: "destructive",
      });
      return { success: false };
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "process-yoco-payment",
        {
          body: {
            amount: paymentData.totalPrice,
            currency: "ZAR",
            eventId: paymentData.eventId,
            quantity: paymentData.quantity,
            userEmail: user.email,
            userId: user.id,
            paymentMethodId,
          },
        }
      );

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Payment Successful!",
          description: `Your ticket purchase of R${paymentData.totalPrice.toFixed(
            2
          )} has been confirmed.`,
        });
        return { success: true, paymentId: data.paymentId };
      } else {
        throw new Error(data?.error || "Payment failed");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description:
          error.message ||
          "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processPayment,
    isProcessing,
  };
};
// This hook provides a function to process Yoco payments for event tickets.
