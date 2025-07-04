import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { PricingRule } from "@/types/pricing";

/**
 * Custom hook to fetch and update pricing rules for a specific event.
 */
export const usePricingRules = (eventId: string) => {
  const queryClient = useQueryClient();

  // Fetch active pricing rules for the event
  const { data: pricingRules = [], isLoading } = useQuery<PricingRule[]>({
    queryKey: ["pricing-rules", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricing_rules")
        .select("*")
        .eq("event_id", eventId)
        .eq("is_active", true);

      if (error) throw error;
      return (data || []) as PricingRule[];
    },
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });

  // Mutation to upsert (insert or update) a pricing rule
  const updatePricingRuleMutation = useMutation({
    mutationFn: async (rule: Omit<PricingRule, "id"> & { id?: string }) => {
      const ruleData = {
        event_id: eventId,
        rule_type: rule.rule_type,
        threshold_value: rule.threshold_value,
        price_multiplier: rule.price_multiplier,
        description: rule.description,
        is_active: rule.is_active,
        ...(rule.id && { id: rule.id }),
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

  return {
    pricingRules,
    isLoading,
    updatePricingRule: updatePricingRuleMutation.mutate,
    isUpdatingRule: updatePricingRuleMutation.isPending,
  };
};
