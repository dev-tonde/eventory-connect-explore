
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RefundRequestProps {
  ticketId: string;
  ticketPrice: number;
  onRefundRequested: () => void;
}

const RefundRequest = ({ ticketId, ticketPrice, onRefundRequested }: RefundRequestProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refundReasons = [
    "Event cancelled by organizer",
    "Unable to attend due to illness",
    "Emergency situation",
    "Event details changed significantly",
    "Duplicate purchase",
    "Other"
  ];

  const submitRefundRequest = async () => {
    if (!user || !reason) {
      toast({
        title: "Error",
        description: "Please select a reason for the refund.",
        variant: "destructive",
      });
      return;
    }

    if (reason === "Other" && !customReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a custom reason.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const finalReason = reason === "Other" ? customReason : reason;
      
      const { error } = await supabase
        .from('refund_requests')
        .insert([{
          ticket_id: ticketId,
          user_id: user.id,
          reason: finalReason,
          refund_amount: ticketPrice,
          status: 'pending'
        }]);

      if (error) throw error;

      toast({
        title: "Refund Request Submitted",
        description: "Your refund request has been submitted and will be reviewed within 3-5 business days.",
      });

      onRefundRequested();
    } catch (error) {
      console.error('Error submitting refund request:', error);
      toast({
        title: "Error",
        description: "Failed to submit refund request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Request Refund
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Refund Amount: ${ticketPrice.toFixed(2)}
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Reason for Refund</label>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger>
              <SelectValue placeholder="Select a reason" />
            </SelectTrigger>
            <SelectContent>
              {refundReasons.map((reasonOption) => (
                <SelectItem key={reasonOption} value={reasonOption}>
                  {reasonOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {reason === "Other" && (
          <div>
            <label className="block text-sm font-medium mb-2">Custom Reason</label>
            <Textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Please explain your reason for requesting a refund..."
              className="min-h-[100px]"
            />
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">Refund Policy</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Refunds are processed within 3-5 business days after approval</li>
            <li>• A processing fee may apply depending on the reason</li>
            <li>• Refunds for events within 24 hours may not be eligible</li>
            <li>• You'll receive an email notification about the decision</li>
          </ul>
        </div>

        <Button
          onClick={submitRefundRequest}
          disabled={isSubmitting || !reason}
          className="w-full"
        >
          {isSubmitting ? "Submitting Request..." : "Submit Refund Request"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RefundRequest;
