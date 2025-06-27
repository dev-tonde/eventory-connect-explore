
import type { PricingRule, EventPricingData } from "@/types/pricing";

export const calculateAppliedRules = (
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

export const calculateNextPriceChange = (appliedRules: PricingRule[], event: EventPricingData, basePrice: number) => {
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

export const getMockPriceHistory = (basePrice: number) => {
  return [
    { price: basePrice, timestamp: new Date().toISOString(), reason: "Base price" },
    { price: basePrice * 0.8, timestamp: new Date(Date.now() - 86400000).toISOString(), reason: "Early bird discount" },
  ];
};
