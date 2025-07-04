import type { PricingRule, EventPricingData } from "@/types/pricing";

/**
 * Determines which pricing rules currently apply to an event.
 */
export const calculateAppliedRules = (
  rules: PricingRule[],
  currentAttendees: number,
  maxAttendees: number,
  eventDate: Date
): PricingRule[] => {
  const now = new Date();
  const daysUntilEvent = Math.ceil(
    (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const attendanceRatio =
    maxAttendees > 0 ? currentAttendees / maxAttendees : 0;

  return rules.filter((rule) => {
    switch (rule.rule_type) {
      case "early_bird":
        return daysUntilEvent > rule.threshold_value;
      case "surge":
        return daysUntilEvent <= rule.threshold_value;
      case "capacity":
        return attendanceRatio >= rule.threshold_value;
      case "time_decay":
        return daysUntilEvent <= rule.threshold_value;
      case "group_discount":
        // Implement group discount logic if needed
        return false;
      default:
        return false;
    }
  });
};

/**
 * Calculates when the next price change will occur and what it will be.
 */
export const calculateNextPriceChange = (
  appliedRules: PricingRule[],
  event: EventPricingData,
  basePrice: number
) => {
  const now = new Date();
  const eventDate = new Date(`${event.date}T${event.time}`);
  const daysUntilEvent = Math.ceil(
    (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Example: Surge pricing begins 7 days before event
  if (daysUntilEvent > 7) {
    return {
      newPrice: +(basePrice * 1.2).toFixed(2),
      changeTime: new Date(
        eventDate.getTime() - 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
      reason: "Surge pricing begins (7 days before event)",
    };
  }

  return undefined;
};

/**
 * Returns a mock price history for demonstration/testing.
 */
export const getMockPriceHistory = (basePrice: number) => {
  const now = new Date();
  return [
    {
      price: +basePrice.toFixed(2),
      timestamp: now.toISOString(),
      reason: "Base price",
    },
    {
      price: +(basePrice * 0.8).toFixed(2),
      timestamp: new Date(now.getTime() - 86400000).toISOString(),
      reason: "Early bird discount",
    },
  ];
};
