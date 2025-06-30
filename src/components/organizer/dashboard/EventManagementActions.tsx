
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Star, 
  Edit, 
  Trash2, 
  Users, 
  DollarSign,
  Share2,
  BarChart3,
  MessageSquare,
  Wand2,
  Crown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EventManagementActionsProps {
  event: any;
  onEventUpdate?: () => void;
}

const EventManagementActions = ({ event, onEventUpdate }: EventManagementActionsProps) => {
  const { toast } = useToast();
  const [isPostponeDialogOpen, setIsPostponeDialogOpen] = useState(false);
  const [isFeaturedDialogOpen, setIsFeaturedDialogOpen] = useState(false);
  const [postponeReason, setPostponeReason] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [featuredDuration, setFeaturedDuration] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCancelEvent = async () => {
    setIsProcessing(true);
    try {
      // Here you would implement the actual cancellation logic
      toast({
        title: "Event Cancelled",
        description: "The event has been successfully cancelled. Attendees will be notified.",
      });
      onEventUpdate?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePostponeEvent = async () => {
    if (!newDate || !newTime || !postponeReason.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to postpone the event.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Here you would implement the actual postponement logic
      toast({
        title: "Event Postponed",
        description: "The event has been postponed. Attendees will be notified of the new date and time.",
      });
      setIsPostponeDialogOpen(false);
      setPostponeReason("");
      setNewDate("");
      setNewTime("");
      onEventUpdate?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to postpone event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMakeFeatured = async () => {
    if (!featuredDuration) {
      toast({
        title: "Select Duration",
        description: "Please select a featured duration.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Here you would implement the payment processing for featured events
      const prices = {
        "1-2weeks": 500,
        "3-4weeks": 800,
        "indefinite": 1200
      };

      // Check if organizer has 10k+ followers for free indefinite featuring
      const hasLargeFollowing = false; // This would be checked from the database

      if (featuredDuration === "indefinite" && hasLargeFollowing) {
        toast({
          title: "Featured Event Activated",
          description: "Your event is now featured indefinitely due to your large following!",
        });
      } else {
        const price = prices[featuredDuration as keyof typeof prices];
        toast({
          title: "Payment Required",
          description: `Featured event package: R${price}. Redirecting to payment...`,
        });
        // Here you would integrate with payment processing
      }

      setIsFeaturedDialogOpen(false);
      setFeaturedDuration("");
      onEventUpdate?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process featured event request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getFeaturedPrice = (duration: string) => {
    const prices = {
      "1-2weeks": 500,
      "3-4weeks": 800,
      "indefinite": 1200
    };
    return prices[duration as keyof typeof prices] || 0;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit className="h-5 w-5 text-blue-600" />
          Event Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {/* Edit Event */}
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2 hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>

          {/* Analytics */}
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2 hover:bg-green-50 focus:ring-2 focus:ring-green-500 transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>

          {/* Manage Attendees */}
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2 hover:bg-purple-50 focus:ring-2 focus:ring-purple-500 transition-colors"
          >
            <Users className="h-4 w-4" />
            Attendees
          </Button>

          {/* Social Share */}
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2 hover:bg-indigo-50 focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>

          {/* Create Poster */}
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2 hover:bg-pink-50 focus:ring-2 focus:ring-pink-500 transition-colors"
          >
            <Wand2 className="h-4 w-4" />
            Poster
          </Button>

          {/* Community Chat */}
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2 hover:bg-orange-50 focus:ring-2 focus:ring-orange-500 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            Chat
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 pt-4 border-t">
          {/* Make Featured */}
          <Dialog open={isFeaturedDialogOpen} onOpenChange={setIsFeaturedDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50 focus:ring-2 focus:ring-yellow-500 transition-colors"
              >
                <Crown className="h-4 w-4" />
                Make Featured
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-600" />
                  Feature Your Event
                </DialogTitle>
                <DialogDescription>
                  Choose a featured duration to boost your event's visibility on the platform.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="duration">Featured Duration</Label>
                  <Select value={featuredDuration} onValueChange={setFeaturedDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-2weeks">1-2 Weeks - R500</SelectItem>
                      <SelectItem value="3-4weeks">3-4 Weeks - R800</SelectItem>
                      <SelectItem value="indefinite">Until Event Date - R1,200</SelectItem>
                    </SelectContent>
                  </Select>
                  {featuredDuration && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded border text-sm">
                      <strong>Price: R{getFeaturedPrice(featuredDuration)}</strong>
                      {featuredDuration === "indefinite" && (
                        <p className="text-xs text-gray-600 mt-1">
                          Free for organizers with 10k+ followers
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsFeaturedDialogOpen(false)}
                  className="hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleMakeFeatured} 
                  disabled={isProcessing || !featuredDuration}
                  className="bg-yellow-600 hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500 transition-colors"
                >
                  {isProcessing ? "Processing..." : "Continue to Payment"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Postpone Event */}
          <Dialog open={isPostponeDialogOpen} onOpenChange={setIsPostponeDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2 border-orange-300 text-orange-700 hover:bg-orange-50 focus:ring-2 focus:ring-orange-500 transition-colors"
              >
                <Clock className="h-4 w-4" />
                Postpone
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  Postpone Event
                </DialogTitle>
                <DialogDescription>
                  Set a new date and time for your event. Attendees will be notified automatically.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="new-date">New Date</Label>
                  <Input
                    id="new-date"
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="new-time">New Time</Label>
                  <Input
                    id="new-time"
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="reason">Reason for Postponement</Label>
                  <Textarea
                    id="reason"
                    placeholder="Explain why the event is being postponed..."
                    value={postponeReason}
                    onChange={(e) => setPostponeReason(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsPostponeDialogOpen(false)}
                  className="hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handlePostponeEvent} 
                  disabled={isProcessing}
                  className="bg-orange-600 hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 transition-colors"
                >
                  {isProcessing ? "Postponing..." : "Postpone Event"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Cancel Event */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2 border-red-300 text-red-700 hover:bg-red-50 focus:ring-2 focus:ring-red-500 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Cancel Event
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Cancel Event
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel this event? This action cannot be undone. 
                  All attendees will be notified and refunds will be processed automatically.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 transition-colors">
                  Keep Event
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleCancelEvent}
                  disabled={isProcessing}
                  className="bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition-colors"
                >
                  {isProcessing ? "Cancelling..." : "Cancel Event"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Event Status Indicators */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Badge variant="outline" className="text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date(event.date).toLocaleDateString()}
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            {event.current_attendees || 0}/{event.max_attendees} attending
          </Badge>
          <Badge variant="outline" className="text-xs">
            <DollarSign className="h-3 w-3 mr-1" />
            R{event.price}
          </Badge>
          {event.is_featured && (
            <Badge className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventManagementActions;
