import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Loader2 } from "lucide-react";
import { useWaitlist } from "@/hooks/useWaitlist";
import { useAuth } from "@/contexts/AuthContext";

interface WaitlistButtonProps {
  eventId: string;
  isEventFull: boolean;
}

// Defensive: sanitize numbers for display (not strictly necessary, but for completeness)
const sanitizeNumber = (num: number | undefined) =>
  typeof num === "number" && isFinite(num) && num >= 0 ? num : 0;

const WaitlistButton = ({ eventId, isEventFull }: WaitlistButtonProps) => {
  const { isAuthenticated } = useAuth();
  const {
    isOnWaitlist,
    waitlistCount,
    waitlistPosition,
    isLoading,
    joinWaitlist,
    leaveWaitlist,
    isJoining,
    isLeaving,
  } = useWaitlist(eventId);

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <Button
        disabled
        size="lg"
        className="w-full"
        aria-label="Loading waitlist status"
      >
        <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
        Loading...
      </Button>
    );
  }

  if (!isEventFull) return null;

  if (isOnWaitlist) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" aria-hidden="true" />
            <span className="text-sm font-medium text-blue-800">
              You're on the waitlist
            </span>
          </div>
          <Badge variant="outline" className="bg-blue-100 text-blue-700">
            Position #{sanitizeNumber(waitlistPosition)}
          </Badge>
        </div>
        <Button
          onClick={() => leaveWaitlist()}
          disabled={isLeaving}
          variant="outline"
          size="lg"
          className="w-full"
          type="button"
          aria-label="Leave Waitlist"
        >
          {isLeaving && (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
          )}
          Leave Waitlist
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-orange-600" aria-hidden="true" />
          <span className="text-sm font-medium text-orange-800">
            Event is full
          </span>
        </div>
        <Badge variant="outline" className="bg-orange-100 text-orange-700">
          {sanitizeNumber(waitlistCount)} waiting
        </Badge>
      </div>
      <Button
        onClick={() => joinWaitlist()}
        disabled={isJoining}
        size="lg"
        className="w-full bg-orange-600 hover:bg-orange-700"
        type="button"
        aria-label="Join Waitlist"
      >
        {isJoining && (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
        )}
        Join Waitlist
      </Button>
    </div>
  );
};

export default WaitlistButton;
// This component allows users to join or leave a waitlist for an event.
// It displays the user's current waitlist status, position, and the number of people waiting.
