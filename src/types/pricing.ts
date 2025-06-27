
export interface PricingRule {
  id: string;
  event_id: string;
  rule_type: 'early_bird' | 'surge' | 'capacity' | 'time_decay' | 'group_discount';
  threshold_value: number;
  price_multiplier: number;
  description: string;
  is_active: boolean;
}

export interface DynamicPriceData {
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

export interface PricePoint {
  price: number;
  timestamp: string;
  reason: string;
}

export interface EventPricingData {
  current_attendees: number;
  max_attendees: number;
  date: string;
  time: string;
}
