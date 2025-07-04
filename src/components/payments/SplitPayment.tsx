import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Plus, X, CreditCard, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface SplitPaymentProps {
  totalAmount: number;
  eventTitle: string;
  onSplitComplete?: (splitData: SplitPaymentData) => void;
  onCancel?: () => void;
}

interface SplitPaymentData {
  organizer: string;
  participants: string[];
  amountPerPerson: number;
  splitId: string;
}

// Sanitize email to prevent XSS
const sanitizeEmail = (email: string) =>
  typeof email === "string"
    ? email.replace(/[<>]/g, "").trim().toLowerCase()
    : "";

const SplitPayment = ({
  totalAmount,
  eventTitle,
  onSplitComplete,
  onCancel,
}: SplitPaymentProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [participants, setParticipants] = useState<string[]>([
    user?.email || "",
  ]);
  const [newParticipant, setNewParticipant] = useState("");
  const [isCreatingSplit, setIsCreatingSplit] = useState(false);

  const amountPerPerson =
    participants.length > 0 ? totalAmount / participants.length : totalAmount;

  const addParticipant = () => {
    const email = sanitizeEmail(newParticipant);
    if (!email) return;

    if (participants.includes(email)) {
      toast({
        title: "Duplicate email",
        description: "This person is already in the split.",
        variant: "destructive",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setParticipants([...participants, email]);
    setNewParticipant("");
  };

  const removeParticipant = (email: string) => {
    if (email === user?.email) {
      toast({
        title: "Cannot remove yourself",
        description: "You cannot remove yourself from the split.",
        variant: "destructive",
      });
      return;
    }
    setParticipants(participants.filter((p) => p !== email));
  };

  const createSplit = async () => {
    if (participants.length < 2) {
      toast({
        title: "Need more participants",
        description: "You need at least 2 people to split a payment.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingSplit(true);

    try {
      const splitId = Math.random().toString(36).substr(2, 9);
      const splitData: SplitPaymentData = {
        organizer: user?.email || "",
        participants,
        amountPerPerson,
        splitId,
      };

      // Store split payment request (localStorage for demo; replace with backend in production)
      const existingSplits = JSON.parse(
        localStorage.getItem("eventory_split_payments") || "[]"
      );
      const newSplit = {
        id: splitId,
        eventTitle,
        totalAmount,
        amountPerPerson,
        organizer: user?.email,
        participants,
        status: "pending",
        createdAt: new Date().toISOString(),
        payments: participants.map((email) => ({
          email,
          paid: email === user?.email,
          paidAt: email === user?.email ? new Date().toISOString() : null,
        })),
      };

      existingSplits.push(newSplit);
      localStorage.setItem(
        "eventory_split_payments",
        JSON.stringify(existingSplits)
      );

      // Mock notifications
      participants.forEach((email) => {
        if (email !== user?.email) {
          // Replace with real notification logic
          console.log(
            `Sending split payment request to ${email} for $${amountPerPerson.toFixed(
              2
            )}`
          );
        }
      });

      toast({
        title: "Split payment created!",
        description: `Split payment requests sent to ${
          participants.length - 1
        } people.`,
      });

      onSplitComplete?.(splitData);
    } catch (error) {
      toast({
        title: "Error creating split",
        description: "Failed to create split payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingSplit(false);
    }
  };

  const copyShareLink = () => {
    const shareLink = `${window.location.origin}/split-payment/${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    navigator.clipboard.writeText(shareLink);
    toast({
      title: "Link copied!",
      description: "Share this link with your friends to join the split.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" aria-hidden="true" />
          Split Payment
        </CardTitle>
        <p className="text-sm text-gray-600">
          Split the cost of tickets for "{eventTitle}" with friends
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Amount Display */}
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            ${totalAmount.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">Total Amount</div>
        </div>

        {/* Amount Per Person */}
        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="text-xl font-semibold text-green-700">
            ${amountPerPerson.toFixed(2)} per person
          </div>
          <div className="text-sm text-green-600">
            Split between {participants.length}{" "}
            {participants.length === 1 ? "person" : "people"}
          </div>
        </div>

        {/* Add Participants */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add participants by email
          </label>
          <div className="flex gap-2">
            <Input
              type="email"
              value={newParticipant}
              onChange={(e) => setNewParticipant(e.target.value)}
              placeholder="friend@example.com"
              onKeyDown={(e) => e.key === "Enter" && addParticipant()}
              aria-label="Add participant email"
            />
            <Button
              onClick={addParticipant}
              variant="outline"
              size="sm"
              type="button"
              aria-label="Add participant"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>

        {/* Participants List */}
        <div>
          <h4 className="font-medium mb-3">
            Participants ({participants.length})
          </h4>
          <div className="space-y-2">
            {participants.map((email, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" aria-hidden="true" />
                  <span className="text-sm">{email}</span>
                  {email === user?.email && (
                    <Badge variant="secondary" className="text-xs">
                      You
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-green-600">
                    ${amountPerPerson.toFixed(2)}
                  </span>
                  {email !== user?.email && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeParticipant(email)}
                      type="button"
                      aria-label={`Remove ${email}`}
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Share Options */}
        <div className="border-t pt-4">
          <Button
            variant="outline"
            className="w-full mb-3"
            onClick={copyShareLink}
            type="button"
            aria-label="Copy share link"
          >
            <Share2 className="h-4 w-4 mr-2" aria-hidden="true" />
            Copy Share Link
          </Button>
          <p className="text-xs text-gray-500 text-center">
            Share this link to let others join the split payment
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            type="button"
            aria-label="Cancel split"
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={createSplit}
            disabled={isCreatingSplit || participants.length < 2}
            type="button"
            aria-label="Create split"
          >
            {isCreatingSplit ? (
              "Creating Split..."
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" aria-hidden="true" />
                Create Split
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Each participant will receive a payment request for their share
        </p>
      </CardContent>
    </Card>
  );
};

export default SplitPayment;
// This component allows users to split a payment for an event with friends.
// It includes functionality to add participants, calculate the amount per person, and create a split payment request.
// Participants can be added by email, and the component handles duplicate emails and invalid formats.
// It also provides a shareable link for others to join the split payment.
