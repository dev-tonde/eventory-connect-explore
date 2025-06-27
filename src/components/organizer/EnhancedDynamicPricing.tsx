
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Users, 
  DollarSign,
  Settings,
  AlertCircle,
  Info
} from "lucide-react";
import { useDynamicPricing } from "@/hooks/useDynamicPricing";

interface EnhancedDynamicPricingProps {
  eventId: string;
  basePrice: number;
  attendeeCount: number;
  maxAttendees: number;
  eventDate: string;
  onPriceUpdate: (newPrice: number) => void;
  isEditable?: boolean;
}

interface PricingRule {
  id?: string;
  rule_type: 'early_bird' | 'surge' | 'capacity' | 'time_decay';
  threshold_value: number;
  price_multiplier: number;
  description: string;
  is_active: boolean;
  min_price?: number;
  max_price?: number;
}

const EnhancedDynamicPricing = ({
  eventId,
  basePrice,
  attendeeCount,
  maxAttendees,
  eventDate,
  onPriceUpdate,
  isEditable = false
}: EnhancedDynamicPricingProps) => {
  const { priceData, currentPrice, pricingRules, updatePricingRule, isLoading } = useDynamicPricing(eventId, basePrice);
  
  const [isDynamicPricingEnabled, setIsDynamicPricingEnabled] = useState(false);
  const [minPrice, setMinPrice] = useState<number>(basePrice * 0.5);
  const [maxPrice, setMaxPrice] = useState<number>(basePrice * 2);
  const [showSettings, setShowSettings] = useState(false);
  
  const [newRule, setNewRule] = useState<Partial<PricingRule>>({
    rule_type: 'early_bird',
    threshold_value: 30,
    price_multiplier: 0.8,
    description: 'Early bird discount',
    is_active: true
  });

  useEffect(() => {
    if (priceData) {
      onPriceUpdate(priceData.currentPrice);
    }
  }, [priceData, onPriceUpdate]);

  const handleToggleDynamicPricing = () => {
    setIsDynamicPricingEnabled(!isDynamicPricingEnabled);
  };

  const handleAddRule = () => {
    if (newRule.rule_type && newRule.threshold_value && newRule.price_multiplier) {
      updatePricingRule({
        event_id: eventId,
        rule_type: newRule.rule_type,
        threshold_value: newRule.threshold_value,
        price_multiplier: newRule.price_multiplier,
        description: newRule.description || '',
        is_active: newRule.is_active || true,
        min_price: minPrice,
        max_price: maxPrice
      });
      
      setNewRule({
        rule_type: 'early_bird',
        threshold_value: 30,
        price_multiplier: 0.8,
        description: 'Early bird discount',
        is_active: true
      });
    }
  };

  const getPriceChangeIndicator = () => {
    if (currentPrice > basePrice) {
      return <TrendingUp className="h-4 w-4 text-red-500" />;
    } else if (currentPrice < basePrice) {
      return <TrendingDown className="h-4 w-4 text-green-500" />;
    }
    return null;
  };

  const getActivePriceReason = () => {
    if (!priceData?.appliedRules || priceData.appliedRules.length === 0) {
      return null;
    }
    
    return priceData.appliedRules.map(rule => rule.description).join(' + ');
  };

  const ruleTypeLabels = {
    early_bird: 'Early Bird',
    surge: 'Surge Pricing',
    capacity: 'Capacity Based',
    time_decay: 'Time Decay'
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Dynamic Pricing
          </span>
          {isEditable && (
            <div className="flex items-center gap-2">
              <Switch
                checked={isDynamicPricingEnabled}
                onCheckedChange={handleToggleDynamicPricing}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Price Display */}
        <div className="flex items-center gap-4">
          <div className="text-3xl font-bold text-purple-600">
            ${currentPrice}
            {basePrice !== currentPrice && (
              <span className="text-lg text-gray-500 line-through ml-2">
                ${basePrice}
              </span>
            )}
          </div>
          {getPriceChangeIndicator()}
        </div>

        {/* Active Price Rules */}
        {getActivePriceReason() && (
          <Badge variant="secondary" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {getActivePriceReason()}
          </Badge>
        )}

        {/* Price Constraints */}
        {isDynamicPricingEnabled && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minPrice">Minimum Price</Label>
              <Input
                id="minPrice"
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                min="0"
                step="0.01"
                disabled={!isEditable}
              />
            </div>
            <div>
              <Label htmlFor="maxPrice">Maximum Price</Label>
              <Input
                id="maxPrice"
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                min="0"
                step="0.01"
                disabled={!isEditable}
              />
            </div>
          </div>
        )}

        {/* Price Predictions */}
        {priceData?.nextPriceChange && (
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Next price change: ${priceData.nextPriceChange.newPrice} on{' '}
              {new Date(priceData.nextPriceChange.changeTime).toLocaleDateString()}
              <br />
              <span className="text-sm">{priceData.nextPriceChange.reason}</span>
            </AlertDescription>
          </Alert>
        )}

        {/* Current Rules */}
        {pricingRules.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Active Pricing Rules</h4>
            {pricingRules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{ruleTypeLabels[rule.rule_type]}</div>
                  <div className="text-sm text-gray-600">{rule.description}</div>
                  <div className="text-xs text-gray-500">
                    Multiplier: {rule.price_multiplier}x | Threshold: {rule.threshold_value}
                  </div>
                </div>
                <Badge variant={rule.is_active ? "default" : "secondary"}>
                  {rule.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Add New Rule (Admin/Organizer Only) */}
        {isEditable && showSettings && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium">Add New Pricing Rule</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ruleType">Rule Type</Label>
                  <select
                    id="ruleType"
                    value={newRule.rule_type}
                    onChange={(e) => setNewRule({
                      ...newRule,
                      rule_type: e.target.value as PricingRule['rule_type']
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="early_bird">Early Bird</option>
                    <option value="surge">Surge Pricing</option>
                    <option value="capacity">Capacity Based</option>
                    <option value="time_decay">Time Decay</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="threshold">Threshold</Label>
                  <Input
                    id="threshold"
                    type="number"
                    value={newRule.threshold_value}
                    onChange={(e) => setNewRule({
                      ...newRule,
                      threshold_value: Number(e.target.value)
                    })}
                    placeholder="Days or percentage"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="multiplier">Price Multiplier</Label>
                  <Input
                    id="multiplier"
                    type="number"
                    step="0.1"
                    value={newRule.price_multiplier}
                    onChange={(e) => setNewRule({
                      ...newRule,
                      price_multiplier: Number(e.target.value)
                    })}
                    placeholder="1.0 = no change"
                  />
                </div>
                
                <div className="flex items-end">
                  <Button onClick={handleAddRule} className="w-full">
                    Add Rule
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="ruleDescription">Description</Label>
                <Input
                  id="ruleDescription"
                  value={newRule.description}
                  onChange={(e) => setNewRule({
                    ...newRule,
                    description: e.target.value
                  })}
                  placeholder="Brief description of the rule"
                />
              </div>
            </div>
          </>
        )}

        {/* Pricing Warnings */}
        {currentPrice !== basePrice && (
          <Alert className={currentPrice > basePrice ? "border-orange-200 bg-orange-50" : "border-green-200 bg-green-50"}>
            <AlertCircle className={`h-4 w-4 ${currentPrice > basePrice ? "text-orange-600" : "text-green-600"}`} />
            <AlertDescription className={currentPrice > basePrice ? "text-orange-800" : "text-green-800"}>
              {currentPrice > basePrice ? (
                <>Price has increased by ${(currentPrice - basePrice).toFixed(2)}. This may affect demand.</>
              ) : (
                <>Price has decreased by ${(basePrice - currentPrice).toFixed(2)}. Limited time discount active!</>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedDynamicPricing;
