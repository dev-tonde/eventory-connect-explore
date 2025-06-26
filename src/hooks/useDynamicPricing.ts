
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PricingRule {
  id: string;
  event_id: string;
  rule_type: 'early_bird' | 'surge' | 'capacity' | 'time_decay' | 'group_discount';
  threshold_value: number;
  price_multiplier: number;
  description: string;
  is_active: boolean;
}

interface DynamicPriceData {
  basePrice: number;
  currentPrice: number;
  appliedRules: PricingRule[];
  priceHistory: PricePoint[];
  nextPriceChange?: {
    newPrice: number;
    changeTime: string;
    reason: string;
  };
}

interface PricePoint {
  price: number;
  timestamp: string;
  reason: string;
}

export const useDynamicPricing = (eventId: string, basePrice: number) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [realTimePrice, setRealTimePrice] = useState(basePrice);

  // Get pricing rules for the event
  const { data: pricingRules = [] } = useQuery({
    queryKey: ["pricing-rules", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricing_rules")
        .select("*")
        .eq("event_id", eventId)
        .eq("is_active", true);

      if (error) throw error;
      return data as PricingRule[];
    },
    enabled: !!eventId,
  });

  // Get current dynamic price from database
  const { data: dynamicPriceData, isLoading } = useQuery({
    queryKey: ["dynamic-price", eventId],
    queryFn: async () => {
      const { data: price, error } = await supabase
        .rpc('get_dynamic_price', { event_uuid: eventId });

      if (error) throw error;

      const { data: event } = await supabase
        .from("events")
        .select("current_attendees, max_attendees, date, time")
        .eq("id", eventId)
        .single();

      if (!event) throw new Error("Event not found");

      const appliedRules = calculateAppliedRules(
        pricingRules,
        event.current_attendees || 0,
        event.max_attendees || 100,
        new Date(`${event.date} ${event.time}`)
      );

      return {
        basePrice,
        currentPrice: Number(price) || basePrice,
        appliedRules,
        priceHistory: await getPriceHistory(eventId),
        nextPriceChange: calculateNextPriceChange(appliedRules, event)
      } as DynamicPriceData;
    },
    enabled: !!eventId && pricingRules.length > 0,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  // Create or update pricing rules
  const updatePricingRuleMutation = useMutation({
    mutationFn: async (rule: Omit<PricingRule, 'id'> & { id?: string }) => {
      // Ensure rule_type is always provided
      const ruleData = {
        event_id: eventId,
        rule_type: rule.rule_type,
        threshold_value: rule.threshold_value,
        price_multiplier: rule.price_multiplier,
        description: rule.description,
        is_active: rule.is_active,
        ...(rule.id && { id: rule.id })
      };

      const { data, error } = await supabase
        .from("pricing_rules")
        .upsert(ruleData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing-rules", eventId] });
      queryClient.invalidateQueries({ queryKey: ["dynamic-price", eventId] });
    },
  });

  // Real-time price updates based on event changes
  useEffect(() => {
    if (!dynamicPriceData) return;

    const channel = supabase
      .channel('price-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'events',
          filter: `id=eq.${eventId}`
        },
        async (payload) => {
          // Recalculate price when event data changes
          const { data: newPrice } = await supabase
            .rpc('get_dynamic_price', { event_uuid: eventId });
          
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

  const getPriceHistory = async (eventId: string): Promise<PricePoint[]> => {
    // Mock price history - in production, you'd store this in a separate table
    return [
      { price: basePrice, timestamp: new Date().toISOString(), reason: "Base price" },
      { price: basePrice * 0.8, timestamp: new Date(Date.now() - 86400000).toISOString(), reason: "Early bird discount" },
    ];
  };

  const calculateAppliedRules = (
    rules: PricingRule[],
    currentAttendees: number,
    maxAttendees: number,
    eventDate: Date
  ): PricingRule[] => {
    const now = new Date();
    const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const attendanceRatio = currentAttendees / maxAttendees;

    return rules.filter(rule => {
      switch (rule.rule_type) {
        case 'early_bird':
          return daysUntilEvent > rule.threshold_value;
        case 'surge':
          return daysUntilEvent <= rule.threshold_value;
        case 'capacity':
          return attendanceRatio >= rule.threshold_value;
        case 'time_decay':
          return daysUntilEvent <= rule.threshold_value;
        default:
          return false;
      }
    });
  };

  const calculateNextPriceChange = (appliedRules: PricingRule[], event: any) => {
    // Logic to predict next price change based on rules and event data
    const now = new Date();
    const eventDate = new Date(`${event.date} ${event.time}`);
    const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilEvent > 7) {
      return {
        newPrice: basePrice * 1.2,
        changeTime: new Date(eventDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        reason: "Surge pricing begins (7 days before event)"
      };
    }

    return undefined;
  };

  return {
    priceData: dynamicPriceData,
    currentPrice: realTimePrice,
    isLoading,
    pricingRules,
    updatePricingRule: updatePricingRuleMutation.mutate,
    isUpdatingRule: updatePricingRuleMutation.isPending,
  };
};
