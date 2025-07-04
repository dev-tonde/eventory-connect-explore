/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Check, Clock, AlertCircle, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Sanitize email to prevent XSS
const sanitizeEmail = (email: string) =>
  typeof email === "string"
    ? email.replace(/[<>]/g, "").trim().toLowerCase()
    : "";

interface SplitPaymentStatusProps {
  splitId: string;
}

interface SplitPayment {
  id: string;
  eventTitle: string;
  totalAmount: number;
  amountPerPerson: number;
  organizer: string;
  participants: string[];
  status: "pending" | "partial" | "complete";
  createdAt: string;
  payments: {
    email: string;
    paid: boolean;
    paidAt: string | null;
  }[];
}

const SplitPaymentStatus = ({ splitId }: SplitPaymentStatusProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [splitData, setSplitData] = useState<SplitPayment | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    loadSplitData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splitId]);

  const loadSplitData = () => {
    const existingSplits = JSON.parse(
      localStorage.getItem("eventory_split_payments") || "[]"
    );
    const split = existingSplits.find((s: SplitPayment) => s.id === splitId);
    setSplitData(split || null);
  };

  const processPayment = async () => {
    if (!splitData || !user?.email) return;

    setIsProcessingPayment(true);

    try {
      // Mock payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update payment status
      const existingSplits = JSON.parse(
        localStorage.getItem("eventory_split_payments") || "[]"
      );
      const splitIndex = existingSplits.findIndex(
        (s: SplitPayment) => s.id === splitId
      );

      if (splitIndex !== -1) {
        const paymentIndex = existingSplits[splitIndex].payments.findIndex(
          (p: any) => sanitizeEmail(p.email) === sanitizeEmail(user.email)
        );

        if (paymentIndex !== -1) {
          existingSplits[splitIndex].payments[paymentIndex].paid = true;
          existingSplits[splitIndex].payments[paymentIndex].paidAt =
            new Date().toISOString();

          // Update overall status
          const paidCount = existingSplits[splitIndex].payments.filter(
            (p: any) => p.paid
          ).length;
          const totalCount = existingSplits[splitIndex].payments.length;

          if (paidCount === totalCount) {
            existingSplits[splitIndex].status = "complete";
          } else if (paidCount > 0) {
            existingSplits[splitIndex].status = "partial";
          } else {
            existingSplits[splitIndex].status = "pending";
          }

          localStorage.setItem(
            "eventory_split_payments",
            JSON.stringify(existingSplits)
          );
          loadSplitData();

          toast({
            title: "Payment successful!",
            description: `Your share of $${splitData.amountPerPerson.toFixed(
              2
            )} has been paid.`,
          });
        }
      }
    } catch (error) {
      toast({
        title: "Payment failed",
        description:
          "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (!splitData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle
            className="h-12 w-12 text-gray-400 mx-auto mb-4"
            aria-hidden="true"
          />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Split not found
          </h3>
          <p className="text-gray-500">
            The split payment you're looking for doesn't exist.
          </p>
        </CardContent>
      </Card>
    );
  }

  const userPayment = splitData.payments.find(
    (p) => sanitizeEmail(p.email) === sanitizeEmail(user?.email || "")
  );
  const paidCount = splitData.payments.filter((p) => p.paid).length;
  const progressPercentage = (paidCount / splitData.payments.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" aria-hidden="true" />
          Split Payment Status
        </CardTitle>
        <p className="text-sm text-gray-600">{splitData.eventTitle}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600 mb-2">
            {paidCount} / {splitData.payments.length}
          </div>
          <div className="text-sm text-gray-600 mb-3">
            participants have paid
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Amount Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-semibold text-blue-700">
              ${splitData.totalAmount.toFixed(2)}
            </div>
            <div className="text-sm text-blue-600">Total Amount</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-semibold text-green-700">
              ${splitData.amountPerPerson.toFixed(2)}
            </div>
            <div className="text-sm text-green-600">Your Share</div>
          </div>
        </div>

        {/* Payment Status */}
        <div>
          <h4 className="font-medium mb-3">Payment Status</h4>
          <div className="space-y-2">
            {splitData.payments.map((payment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {sanitizeEmail(payment.email)}
                  </span>
                  {sanitizeEmail(payment.email) ===
                    sanitizeEmail(user?.email || "") && (
                    <Badge variant="secondary" className="text-xs">
                      You
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {payment.paid ? (
                    <>
                      <Check
                        className="h-4 w-4 text-green-500"
                        aria-hidden="true"
                      />
                      <Badge variant="default" className="bg-green-500">
                        Paid
                      </Badge>
                    </>
                  ) : (
                    <>
                      <Clock
                        className="h-4 w-4 text-orange-500"
                        aria-hidden="true"
                      />
                      <Badge variant="secondary">Pending</Badge>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Action */}
        {userPayment && !userPayment.paid && (
          <div className="border-t pt-4">
            <Button
              className="w-full"
              onClick={processPayment}
              disabled={isProcessingPayment}
              type="button"
              aria-label={`Pay $${splitData.amountPerPerson.toFixed(2)}`}
            >
              {isProcessingPayment ? (
                "Processing Payment..."
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" aria-hidden="true" />
                  Pay ${splitData.amountPerPerson.toFixed(2)}
                </>
              )}
            </Button>
          </div>
        )}

        {/* Status Messages */}
        {splitData.status === "complete" && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
            <Check
              className="h-5 w-5 text-green-500 mx-auto mb-1"
              aria-hidden="true"
            />
            <p className="text-sm text-green-700 font-medium">
              Split payment complete! All participants have paid.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SplitPaymentStatus;
// This component displays the status of a split payment for an event.
// It shows the total amount, amount per person, payment status for each participant, and allows the user to pay their share if they haven't already.
// The component fetches split payment data from local storage and updates it upon payment.
// It also provides visual feedback on the payment progress and status of each participant.
// The user's email is sanitized to prevent XSS attacks, ensuring safe rendering of user-generated content.
