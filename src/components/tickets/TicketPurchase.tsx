/* eslint-disable @typescript-eslint/no-explicit-any */
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
import {
  AlertTriangle,
  CreditCard,
  User,
  Mail,
  Phone,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Event } from "@/types/event";
import DynamicPricing from "@/components/pricing/DynamicPricing";
import SplitPayment from "@/components/payments/SplitPayment";
import YocoPaymentForm from "@/components/payments/YocoPaymentForm";

// Sanitize text to prevent XSS
const sanitizeText = (text: string) =>
  typeof text === "string" ? text.replace(/[<>]/g, "").trim() : "";

interface TicketPurchaseProps {
  event: Event;
  onPurchaseComplete?: () => void;
}

const TicketPurchase = ({ event, onPurchaseComplete }: TicketPurchaseProps) => {
  const { user, profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [currentPrice, setCurrentPrice] = useState(event.price);
  const [paymentMethod, setPaymentMethod] = useState<"full" | "split">("full");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [buyerInfo, setBuyerInfo] = useState({
    name: profile ? `${profile.first_name} ${profile.last_name}`.trim() : "",
    email: profile?.email || "",
    phone: "",
  });

  const ticketsRemaining = event.maxAttendees - event.attendeeCount;
  const isLowStock = ticketsRemaining <= 20 && ticketsRemaining > 0;
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

  const handleProceedToPayment = () => {
    // Validation checks
    if (!event?.id) {
      toast({
        title: "Error",
        description: "Event information is missing. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    if (!isAuthenticated) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to purchase tickets.",
        variant: "destructive",
      });
      return;
    }

    if (quantity < 1 || quantity > 10) {
      toast({
        title: "Invalid quantity",
        description: "Please select between 1 and 10 tickets.",
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

    // Validate buyer information for non-authenticated users
    if (!isAuthenticated) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;

      if (!buyerInfo.name.trim()) {
        toast({
          title: "Name required",
          description: "Please enter your full name.",
          variant: "destructive",
        });
        return;
      }

      if (!emailRegex.test(buyerInfo.email)) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        return;
      }

      if (!phoneRegex.test(buyerInfo.phone.replace(/\s|-|\(|\)/g, ''))) {
        toast({
          title: "Invalid phone number",
          description: "Please enter a valid phone number.",
          variant: "destructive",
        });
        return;
      }
    }

    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    toast({
      title: "Payment Successful!",
      description: "Your tickets have been purchased successfully.",
    });
    onPurchaseComplete?.();
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
  };

  // Defensive: Only allow up to 10 tickets per purchase and never negative
  const handleQuantityChange = (value: number) => {
    const safeValue = Math.max(
      1,
      Math.min(value, Math.min(10, ticketsRemaining))
    );
    setQuantity(safeValue);
  };

  if (isSoldOut) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle
            className="h-12 w-12 text-red-500 mx-auto mb-4"
            aria-hidden="true"
          />
          <h3 className="text-lg font-semibold text-red-600 mb-2">Sold Out</h3>
          <p className="text-gray-600">
            This event is sold out. Check back later for additional tickets.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (showPaymentForm) {
    return (
      <YocoPaymentForm
        eventId={event.id}
        quantity={quantity}
        totalPrice={totalPrice}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" aria-hidden="true" />
          Purchase Tickets
        </CardTitle>
        {isLowStock && (
          <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-2 rounded">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
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
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              type="button"
              aria-label="Decrease ticket quantity"
            >
              -
            </Button>
            <Input
              type="number"
              min={1}
              max={Math.min(10, ticketsRemaining)}
              value={quantity}
              onChange={(e) =>
                handleQuantityChange(Number(e.target.value) || 1)
              }
              className="w-20 text-center"
              aria-label="Ticket quantity"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= Math.min(10, ticketsRemaining)}
              type="button"
              aria-label="Increase ticket quantity"
            >
              +
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Maximum 10 tickets per purchase
          </p>
        </div>

        {/* Payment Method Selection */}
        <Tabs
          value={paymentMethod}
          onValueChange={(value) => setPaymentMethod(value as "full" | "split")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="full"
              className="flex items-center gap-2"
              aria-label="Pay Full Amount"
            >
              <CreditCard className="h-4 w-4" aria-hidden="true" />
              Pay Full Amount
            </TabsTrigger>
            <TabsTrigger
              value="split"
              className="flex items-center gap-2"
              aria-label="Split Payment"
            >
              <Users className="h-4 w-4" aria-hidden="true" />
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
                    <User
                      className="h-4 w-4 text-gray-500"
                      aria-hidden="true"
                    />
                    {sanitizeText(
                      `${profile.first_name} ${profile.last_name}`.trim() ||
                        profile.username
                    )}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail
                      className="h-4 w-4 text-gray-500"
                      aria-hidden="true"
                    />
                    {sanitizeText(profile.email)}
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <User
                        className="inline h-4 w-4 mr-1"
                        aria-hidden="true"
                      />
                      Full Name
                    </label>
                    <Input
                      value={buyerInfo.name}
                      onChange={(e) =>
                        setBuyerInfo({ ...buyerInfo, name: e.target.value })
                      }
                      placeholder="Enter your full name"
                      required
                      aria-label="Full Name"
                      maxLength={80}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Mail
                        className="inline h-4 w-4 mr-1"
                        aria-hidden="true"
                      />
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
                      aria-label="Email"
                      maxLength={120}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Phone
                        className="inline h-4 w-4 mr-1"
                        aria-hidden="true"
                      />
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
                      aria-label="Phone Number"
                      maxLength={20}
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
                  {currentPrice === 0 ? "Free" : `R${totalPrice.toFixed(2)}`}
                </span>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handleProceedToPayment}
                disabled={
                  !isAuthenticated &&
                  (!buyerInfo.name || !buyerInfo.email || !buyerInfo.phone)
                }
                type="button"
                aria-label={
                  currentPrice === 0
                    ? "Register for Free"
                    : "Proceed to Payment"
                }
              >
                {currentPrice === 0
                  ? "Register for Free"
                  : "Proceed to Payment"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="split">
            <SplitPayment
              totalAmount={totalPrice}
              eventTitle={sanitizeText(event.title)}
              onSplitComplete={handleSplitComplete}
              onCancel={() => setPaymentMethod("full")}
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
// This component allows users to purchase tickets for an event.
// It includes dynamic pricing, quantity selection, buyer information input, and payment processing.
// It handles low stock warnings, sold-out events, and provides options for full or split payments.
