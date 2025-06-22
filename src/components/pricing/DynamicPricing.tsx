
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DynamicPricingProps {
  eventId: string;
  basePrice: number;
  attendeeCount: number;
  maxAttendees: number;
  eventDate: string;
  onPriceUpdate: (newPrice: number) => void;
}

interface PriceRule {
  type: 'time' | 'inventory' | 'demand';
  condition: string;
  multiplier: number;
  active: boolean;
}

const DynamicPricing = ({ 
  eventId, 
  basePrice, 
  attendeeCount, 
  maxAttendees, 
  eventDate,
  onPriceUpdate 
}: DynamicPricingProps) => {
  const [currentPrice, setCurrentPrice] = useState(basePrice);
  const [priceRules, setPriceRules] = useState<PriceRule[]>([]);
  const [priceHistory, setPriceHistory] = useState<{ price: number; timestamp: Date; reason: string }[]>([]);

  useEffect(() => {
    initializePricingRules();
    const interval = setInterval(evaluatePricing, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [attendeeCount, maxAttendees, eventDate]);

  const initializePricingRules = () => {
    const rules: PriceRule[] = [
      {
        type: 'time',
        condition: 'early_bird',
        multiplier: 0.8, // 20% discount for early bird
        active: isEarlyBird()
      },
      {
        type: 'inventory',
        condition: 'high_demand',
        multiplier: 1.2, // 20% increase when 70% sold
        active: (attendeeCount / maxAttendees) >= 0.7
      },
      {
        type: 'inventory',
        condition: 'last_chance',
        multiplier: 1.5, // 50% increase when 90% sold
        active: (attendeeCount / maxAttendees) >= 0.9
      },
      {
        type: 'time',
        condition: 'last_week',
        multiplier: 1.1, // 10% increase in last week
        active: isLastWeek()
      }
    ];
    setPriceRules(rules);
  };

  const isEarlyBird = () => {
    const eventDateTime = new Date(eventDate);
    const now = new Date();
    const daysUntilEvent = (eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilEvent > 30; // Early bird if more than 30 days away
  };

  const isLastWeek = () => {
    const eventDateTime = new Date(eventDate);
    const now = new Date();
    const daysUntilEvent = (eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilEvent <= 7 && daysUntilEvent > 0; // Last week before event
  };

  const evaluatePricing = () => {
    let newPrice = basePrice;
    let appliedRules: string[] = [];
    
    // Update rule statuses
    const updatedRules = priceRules.map(rule => {
      let active = false;
      
      switch (rule.condition) {
        case 'early_bird':
          active = isEarlyBird();
          break;
        case 'high_demand':
          active = (attendeeCount / maxAttendees) >= 0.7 && (attendeeCount / maxAttendees) < 0.9;
          break;
        case 'last_chance':
          active = (attendeeCount / maxAttendees) >= 0.9;
          break;
        case 'last_week':
          active = isLastWeek();
          break;
      }
      
      if (active) {
        newPrice *= rule.multiplier;
        appliedRules.push(rule.condition);
      }
      
      return { ...rule, active };
    });

    setPriceRules(updatedRules);
    
    // Round to nearest dollar
    newPrice = Math.round(newPrice);
    
    if (newPrice !== currentPrice) {
      setCurrentPrice(newPrice);
      onPriceUpdate(newPrice);
      
      // Add to price history
      setPriceHistory(prev => [...prev, {
        price: newPrice,
        timestamp: new Date(),
        reason: appliedRules.join(', ') || 'base_price'
      }].slice(-10)); // Keep last 10 price changes
    }
  };

  const getPriceChangeIndicator = () => {
    if (currentPrice > basePrice) {
      return <TrendingUp className="h-4 w-4 text-red-500" />;
    } else if (currentPrice < basePrice) {
      return <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />;
    }
    return null;
  };

  const getActivePriceReason = () => {
    const activeRules = priceRules.filter(rule => rule.active);
    if (activeRules.length === 0) return null;
    
    const reasons = activeRules.map(rule => {
      switch (rule.condition) {
        case 'early_bird':
          return 'Early Bird Discount';
        case 'high_demand':
          return 'High Demand Pricing';
        case 'last_chance':
          return 'Last Chance Premium';
        case 'last_week':
          return 'Final Week Pricing';
        default:
          return rule.condition;
      }
    });
    
    return reasons.join(' + ');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="text-2xl font-bold text-purple-600">
          ${currentPrice}
          {basePrice !== currentPrice && (
            <span className="text-sm text-gray-500 line-through ml-2">
              ${basePrice}
            </span>
          )}
        </div>
        {getPriceChangeIndicator()}
      </div>

      {getActivePriceReason() && (
        <Badge variant="secondary" className="text-xs">
          <Clock className="h-3 w-3 mr-1" />
          {getActivePriceReason()}
        </Badge>
      )}

      {priceRules.some(rule => rule.active && rule.multiplier > 1) && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Price may increase further based on demand. Book now to secure current rate!
          </AlertDescription>
        </Alert>
      )}

      {priceRules.some(rule => rule.active && rule.multiplier < 1) && (
        <Alert className="border-green-200 bg-green-50">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Limited time discount active! Save ${basePrice - currentPrice} per ticket.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default DynamicPricing;
