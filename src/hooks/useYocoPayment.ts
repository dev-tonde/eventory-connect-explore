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
 * Enhanced Yoco payment hook with production-ready features
 */
export const useYocoPayment = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Processes a Yoco payment with enhanced error handling and logging
   */
  const processPayment = async (
    paymentData: PaymentData,
    paymentMethodId: string
  ): Promise<{ success: boolean; paymentId?: string; ticket?: any }> => {
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
      console.log('Processing Yoco payment:', { 
        eventId: paymentData.eventId, 
        amount: paymentData.totalPrice,
        userId: user.id 
      });

      const { data, error } = await supabase.functions.invoke(
        "process-yoco-payment",
        {
          body: {
            amount: Math.round(paymentData.totalPrice * 100), // Convert to cents
            currency: "ZAR",
            eventId: paymentData.eventId,
            quantity: paymentData.quantity,
            userEmail: user.email,
            userId: user.id,
            paymentMethodId,
            metadata: {
              eventId: paymentData.eventId,
              userId: user.id,
              timestamp: new Date().toISOString(),
              source: 'eventory-web'
            }
          },
        }
      );

      if (error) {
        console.error('Payment function error:', error);
        throw error;
      }

      if (data?.success) {
        console.log('Payment processed successfully:', data.paymentId);
        
        toast({
          title: "Payment Successful! 🎉",
          description: `Your ticket purchase of R${paymentData.totalPrice.toFixed(
            2
          )} has been confirmed. You'll receive an email confirmation shortly.`,
        });

        // Track successful payment
        await supabase.from('event_analytics').insert({
          event_id: paymentData.eventId,
          user_id: user.id,
          metric_type: 'payment_success',
          session_id: `payment_${data.paymentId}`,
        });

        return { 
          success: true, 
          paymentId: data.paymentId,
          ticket: data.ticket 
        };
      } else {
        throw new Error(data?.error || "Payment failed");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      
      // Track failed payment
      await supabase.from('error_logs').insert({
        user_id: user.id,
        error_type: 'payment_error',
        error_message: error.message,
        url: window.location.href,
        user_agent: navigator.userAgent,
      });

      const errorMessage = error.message || "There was an error processing your payment. Please try again.";
      
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { success: false };
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Validates payment data before processing
   */
  const validatePaymentData = (paymentData: PaymentData): boolean => {
    if (!paymentData.eventId || !paymentData.quantity || !paymentData.totalPrice) {
      toast({
        title: "Invalid Payment Data",
        description: "Please check your order details and try again.",
        variant: "destructive",
      });
      return false;
    }

    if (paymentData.totalPrice <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Payment amount must be greater than zero.",
        variant: "destructive",
      });
      return false;
    }

    if (paymentData.quantity <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Ticket quantity must be greater than zero.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  return {
    processPayment,
    validatePaymentData,
    isProcessing,
  };
};