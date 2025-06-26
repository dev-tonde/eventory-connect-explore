
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CreditCard, User, Mail, Phone, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTickets } from "@/hooks/useTickets";
import { Event } from "@/types/event";
import DynamicPricing from "@/components/pricing/DynamicPricing";
import SplitPayment from "@/components/payments/SplitPayment";

interface TicketPurchaseProps {
  event: Event;
  onPurchaseComplete?: () => void;
}

const TicketPurchase = ({ event, onPurchaseComplete }: TicketPurchaseProps) => {
  const { user, profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { purchaseTicket, isPurchasing } = useTickets();
  const [quantity, setQuantity] = useState(1);
  const [currentPrice, setCurrentPrice] = useState(event.price);
  const [paymentMethod, setPaymentMethod] = useState<'full' | 'split'>('full');
  const [buyerInfo, setBuyerInfo] = useState({
    name: profile ? `${profile.first_name} ${profile.last_name}`.trim() : "",
    email: profile?.email || "",
    phone: "",
  });

  const ticketsRemaining = event.maxAttendees - event.attendeeCount;
  const isLowStock = ticketsRemaining <= 20;
  const isSoldOut = ticketsRemaining <= 0;
  const totalPrice = currentPrice * quantity;

  const handlePriceUpdate = (newPrice: number) => {
    setCurrentPrice(newPrice);
  };

  const handleSplitComplete = (splitData: any) => {
    toast({
      title: "Split payment created!",
      description: "Payment requests have been sent to all participants.",
    });
    onPurchaseComplete?.();
  };

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to purchase tickets.",
        variant: "destructive",
      });
      return;
    }

    if (quantity > ticketsRemaining) {
      toast({
        title: "Not enough tickets",
        description: `Only ${ticketsRemaining} tickets remaining.`,
        variant: "destructive",
      });
      return;
    }

    try {
      await purchaseTicket({
        eventId: event.id,
        quantity,
        totalPrice,
      });
      onPurchaseComplete?.();
    } catch (error) {
      console.error("Purchase error:", error);
    }
  };

  if (isSoldOut) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-600 mb-2">Sold Out</h3>
          <p className="text-gray-600">
            This event is sold out. Check back later for additional tickets.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Purchase Tickets
        </CardTitle>
        {isLowStock && (
          <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-2 rounded">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">
              Only {ticketsRemaining} tickets remaining!
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dynamic Pricing Display */}
        <DynamicPricing
          eventId={event.id}
          basePrice={event.price}
          attendeeCount={event.attendeeCount}
          maxAttendees={event.maxAttendees}
          eventDate={event.date}
          onPriceUpdate={handlePriceUpdate}
        />

        {/* Quantity Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of tickets
          </label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              -
            </Button>
            <Input
              type="number"
              min="1"
              max={Math.min(10, ticketsRemaining)}
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="w-20 text-center"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setQuantity(Math.min(quantity + 1, ticketsRemaining, 10))
              }
              disabled={quantity >= Math.min(10, ticketsRemaining)}
            >
              +
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Maximum 10 tickets per purchase
          </p>
        </div>

        {/* Payment Method Selection */}
        <Tabs value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'full' | 'split')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="full" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Pay Full Amount
            </TabsTrigger>
            <TabsTrigger value="split" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Split Payment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="full" className="space-y-4">
            {/* Buyer Information */}
            <div className="space-y-3">
              <h4 className="font-medium">Buyer Information</h4>

              {isAuthenticated && profile ? (
                <div className="p-4 bg-gray-50 rounded border text-sm text-gray-700 space-y-1">
                  <p className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    {`${profile.first_name} ${profile.last_name}`.trim() || profile.username}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    {profile.email}
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <User className="inline h-4 w-4 mr-1" />
                      Full Name
                    </label>
                    <Input
                      value={buyerInfo.name}
                      onChange={(e) =>
                        setBuyerInfo({ ...buyerInfo, name: e.target.value })
                      }
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Mail className="inline h-4 w-4 mr-1" />
                      Email
                    </label>
                    <Input
                      type="email"
                      value={buyerInfo.email}
                      onChange={(e) =>
                        setBuyerInfo({ ...buyerInfo, email: e.target.value })
                      }
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Phone className="inline h-4 w-4 mr-1" />
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      value={buyerInfo.phone}
                      onChange={(e) =>
                        setBuyerInfo({ ...buyerInfo, phone: e.target.value })
                      }
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </>
              )}
            </div>

            {/* Total & Purchase Button */}
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium">Total:</span>
                <span className="text-xl font-bold">
                  {currentPrice === 0 ? "Free" : `$${totalPrice.toFixed(2)}`}
                </span>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handlePurchase}
                disabled={
                  isPurchasing ||
                  (!isAuthenticated &&
                    (!buyerInfo.name || !buyerInfo.email || !buyerInfo.phone))
                }
              >
                {isPurchasing
                  ? "Processing..."
                  : currentPrice === 0
                  ? "Register for Free"
                  : "Purchase Tickets"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="split">
            <SplitPayment
              totalAmount={totalPrice}
              eventTitle={event.title}
              onSplitComplete={handleSplitComplete}
              onCancel={() => setPaymentMethod('full')}
            />
          </TabsContent>
        </Tabs>

        {/* Show low ticket warning only if 20 or fewer tickets remain */}
        {isLowStock && (
          <div className="text-center text-sm text-gray-600">
            <p>{ticketsRemaining} tickets remaining</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TicketPurchase;
