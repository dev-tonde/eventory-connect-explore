import { useState, useEffect, useRef } from "react";
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
  type: "time" | "inventory" | "demand";
  condition: string;
  multiplier: number;
  active: boolean;
}

// Sanitize text to prevent XSS (defensive, though not used for user input here)
const sanitizeText = (text: string) =>
  typeof text === "string" ? text.replace(/[<>]/g, "").trim() : "";

const DynamicPricing = ({
  eventId,
  basePrice,
  attendeeCount,
  maxAttendees,
  eventDate,
  onPriceUpdate,
}: DynamicPricingProps) => {
  const [currentPrice, setCurrentPrice] = useState(basePrice);
  const [priceRules, setPriceRules] = useState<PriceRule[]>([]);
  const [priceHistory, setPriceHistory] = useState<
    { price: number; timestamp: Date; reason: string }[]
  >([]);

  // Prevent interval memory leak
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializePricingRules();
    evaluatePricing(); // Evaluate immediately on mount/prop change

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(evaluatePricing, 30000); // Check every 30 seconds

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attendeeCount, maxAttendees, eventDate, basePrice]);

  const initializePricingRules = () => {
    const rules: PriceRule[] = [
      {
        type: "time",
        condition: "early_bird",
        multiplier: 0.8,
        active: isEarlyBird(),
      },
      {
        type: "inventory",
        condition: "high_demand",
        multiplier: 1.2,
        active:
          attendeeCount / maxAttendees >= 0.7 &&
          attendeeCount / maxAttendees < 0.9,
      },
      {
        type: "inventory",
        condition: "last_chance",
        multiplier: 1.5,
        active: attendeeCount / maxAttendees >= 0.9,
      },
      {
        type: "time",
        condition: "last_week",
        multiplier: 1.1,
        active: isLastWeek(),
      },
    ];
    setPriceRules(rules);
  };

  const isEarlyBird = () => {
    const eventDateTime = new Date(eventDate);
    const now = new Date();
    const daysUntilEvent =
      (eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilEvent > 30;
  };

  const isLastWeek = () => {
    const eventDateTime = new Date(eventDate);
    const now = new Date();
    const daysUntilEvent =
      (eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilEvent <= 7 && daysUntilEvent > 0;
  };

  const evaluatePricing = () => {
    let newPrice = basePrice;
    const appliedRules: string[] = [];

    // Update rule statuses and apply multipliers
    const updatedRules = priceRules.map((rule) => {
      let active = false;
      switch (rule.condition) {
        case "early_bird":
          active = isEarlyBird();
          break;
        case "high_demand":
          active =
            attendeeCount / maxAttendees >= 0.7 &&
            attendeeCount / maxAttendees < 0.9;
          break;
        case "last_chance":
          active = attendeeCount / maxAttendees >= 0.9;
          break;
        case "last_week":
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

      // Add to price history (keep last 10)
      setPriceHistory((prev) =>
        [
          ...prev,
          {
            price: newPrice,
            timestamp: new Date(),
            reason: appliedRules.join(", ") || "base_price",
          },
        ].slice(-10)
      );
    }
  };

  const getPriceChangeIndicator = () => {
    if (currentPrice > basePrice) {
      return <TrendingUp className="h-4 w-4 text-red-500" aria-hidden="true" />;
    } else if (currentPrice < basePrice) {
      return (
        <TrendingUp
          className="h-4 w-4 text-green-500 rotate-180"
          aria-hidden="true"
        />
      );
    }
    return null;
  };

  const getActivePriceReason = () => {
    const activeRules = priceRules.filter((rule) => rule.active);
    if (activeRules.length === 0) return null;

    const reasons = activeRules.map((rule) => {
      switch (rule.condition) {
        case "early_bird":
          return "Early Bird Discount";
        case "high_demand":
          return "High Demand Pricing";
        case "last_chance":
          return "Last Chance Premium";
        case "last_week":
          return "Final Week Pricing";
        default:
          return sanitizeText(rule.condition);
      }
    });

    return reasons.join(" + ");
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
          <Clock className="h-3 w-3 mr-1" aria-hidden="true" />
          {getActivePriceReason()}
        </Badge>
      )}

      {priceRules.some((rule) => rule.active && rule.multiplier > 1) && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" aria-hidden="true" />
          <AlertDescription className="text-orange-800">
            Price may increase further based on demand. Book now to secure
            current rate!
          </AlertDescription>
        </Alert>
      )}

      {priceRules.some((rule) => rule.active && rule.multiplier < 1) && (
        <Alert className="border-green-200 bg-green-50">
          <AlertCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
          <AlertDescription className="text-green-800">
            Limited time discount active! Save ${basePrice - currentPrice} per
            ticket.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default DynamicPricing;
// This component implements dynamic pricing for events based on various conditions such as time, inventory, and demand.
// It calculates the current price based on base price and active pricing rules, updates the price history, and provides visual indicators for price changes and active pricing reasons.
