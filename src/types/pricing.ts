/**
 * Represents a pricing rule applied to an event.
 */
export interface PricingRule {
  id: string;
  event_id: string;
  rule_type:
    | "early_bird"
    | "surge"
    | "capacity"
    | "time_decay"
    | "group_discount";
  threshold_value: number;
  price_multiplier: number;
  description: string;
  is_active: boolean;
}

/**
 * Represents a single price point in the price history.
 */
export interface PricePoint {
  price: number;
  timestamp: string; // ISO date-time string
  reason: string;
}

/**
 * Contains information about dynamic pricing for an event.
 */
export interface DynamicPriceData {
  basePrice: number;
  currentPrice: number;
  appliedRules: PricingRule[];
  priceHistory: PricePoint[];
  nextPriceChange?: {
    newPrice: number;
    changeTime: string; // ISO date-time string
    reason: string;
  };
}

/**
 * Contains event data relevant for pricing calculations.
 */
export interface EventPricingData {
  current_attendees: number;
  max_attendees: number;
  date: string; // ISO date string (YYYY-MM-DD)
  time: string; // ISO time string (HH:mm or HH:mm:ss)
}
