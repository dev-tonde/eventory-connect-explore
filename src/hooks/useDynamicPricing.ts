import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePricingRules } from "./usePricingRules";
import {
  calculateAppliedRules,
  calculateNextPriceChange,
  getMockPriceHistory,
} from "@/utils/pricingCalculations";
import type { DynamicPriceData, EventPricingData } from "@/types/pricing";

/**
 * Custom hook for dynamic event pricing with real-time updates.
 * Fetches current price, applies pricing rules, and listens for event changes.
 */
export const useDynamicPricing = (eventId: string, basePrice: number) => {
  const { user } = useAuth();
  const [realTimePrice, setRealTimePrice] = useState(basePrice);
  const { pricingRules, updatePricingRule, isUpdatingRule } =
    usePricingRules(eventId);

  // Get current dynamic price from database
  const { data: dynamicPriceData, isLoading } = useQuery<DynamicPriceData>({
    queryKey: ["dynamic-price", eventId],
    queryFn: async () => {
      const { data: price, error } = await supabase.rpc("get_dynamic_price", {
        event_uuid: eventId,
      });

      if (error) throw error;

      const { data: event, error: eventError } = await supabase
        .from("events")
        .select("current_attendees, max_attendees, date, time")
        .eq("id", eventId)
        .single();

      if (eventError) throw eventError;
      if (!event) throw new Error("Event not found");

      const eventData: EventPricingData = {
        current_attendees: event.current_attendees || 0,
        max_attendees: event.max_attendees || 100,
        date: event.date,
        time: event.time,
      };

      const appliedRules = calculateAppliedRules(
        pricingRules,
        eventData.current_attendees,
        eventData.max_attendees,
        new Date(`${eventData.date} ${eventData.time}`)
      );

      return {
        basePrice,
        currentPrice: Number(price) || basePrice,
        appliedRules,
        priceHistory: getMockPriceHistory(basePrice),
        nextPriceChange: calculateNextPriceChange(
          appliedRules,
          eventData,
          basePrice
        ),
      } as DynamicPriceData;
    },
    enabled: !!eventId && pricingRules.length > 0,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  // Real-time price updates based on event changes
  useEffect(() => {
    if (!dynamicPriceData) return;

    const channel = supabase
      .channel("price-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "events",
          filter: `id=eq.${eventId}`,
        },
        async () => {
          // Recalculate price when event data changes
          const { data: newPrice } = await supabase.rpc("get_dynamic_price", {
            event_uuid: eventId,
          });

          if (newPrice) {
            setRealTimePrice(Number(newPrice));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, dynamicPriceData]);

  return {
    priceData: dynamicPriceData,
    currentPrice: realTimePrice,
    isLoading,
    pricingRules,
    updatePricingRule,
    isUpdatingRule,
  };
};
