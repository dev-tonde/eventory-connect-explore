import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Smile, Frown, Meh, ThumbsUp, ThumbsDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Defensive: sanitize text for display and storage
const sanitizeText = (text: string) =>
  typeof text === "string" ? text.replace(/[<>]/g, "").trim() : "";

interface EventSentimentTrackerProps {
  eventId: string;
}

const sentimentOptions = [
  {
    value: "very_positive",
    label: "Very Positive",
    icon: ThumbsUp,
    color: "text-green-600",
  },
  {
    value: "positive",
    label: "Positive",
    icon: Smile,
    color: "text-green-500",
  },
  { value: "neutral", label: "Neutral", icon: Meh, color: "text-gray-500" },
  { value: "negative", label: "Negative", icon: Frown, color: "text-red-500" },
  {
    value: "very_negative",
    label: "Very Negative",
    icon: ThumbsDown,
    color: "text-red-600",
  },
];

const EventSentimentTracker = ({ eventId }: EventSentimentTrackerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSentiment, setSelectedSentiment] = useState<string>("");
  const [feedback, setFeedback] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);

  // Fetch sentiment data
  const { data: sentimentData } = useQuery({
    queryKey: ["event-sentiment", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_sentiment")
        .select("sentiment")
        .eq("event_id", eventId);

      if (error) throw error;

      // Calculate sentiment distribution
      const distribution = sentimentOptions.reduce((acc, option) => {
        acc[option.value] = data.filter(
          (item) => item.sentiment === option.value
        ).length;
        return acc;
      }, {} as Record<string, number>);

      const total = data.length;
      return { distribution, total };
    },
  });

  // Submit feedback mutation
  const submitSentimentMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("event_sentiment").insert({
        event_id: eventId,
        user_id: isAnonymous ? null : user?.id,
        sentiment: selectedSentiment,
        feedback: feedback ? sanitizeText(feedback) : null,
        is_anonymous: isAnonymous,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-sentiment", eventId] });
      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted.",
      });
      setSelectedSentiment("");
      setFeedback("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit feedback.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!selectedSentiment) {
      toast({
        title: "Select a sentiment",
        description: "Please select how you feel about this event.",
        variant: "destructive",
      });
      return;
    }
    submitSentimentMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Live Sentiment Display */}
      <Card>
        <CardHeader>
          <CardTitle>Live Event Sentiment</CardTitle>
        </CardHeader>
        <CardContent>
          {sentimentData && sentimentData.total > 0 ? (
            <div className="space-y-3">
              {sentimentOptions.map((option) => {
                const count = sentimentData.distribution[option.value] || 0;
                const percentage =
                  sentimentData.total > 0
                    ? (count / sentimentData.total) * 100
                    : 0;
                const Icon = option.icon;
                return (
                  <div key={option.value} className="flex items-center gap-3">
                    <Icon
                      className={`h-5 w-5 ${option.color}`}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium w-20">
                      {option.label}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                );
              })}
              <p className="text-sm text-gray-500 mt-3">
                Total responses: {sentimentData.total}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No feedback submitted yet. Be the first to share your thoughts!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Feedback Form */}
      <Card>
        <CardHeader>
          <CardTitle>Share Your Feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>How are you feeling about this event?</Label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {sentimentOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.value}
                    variant={
                      selectedSentiment === option.value ? "default" : "outline"
                    }
                    className="flex flex-col items-center gap-1 h-auto py-3"
                    onClick={() => setSelectedSentiment(option.value)}
                    type="button"
                    aria-label={option.label}
                  >
                    <Icon
                      className={`h-5 w-5 ${option.color}`}
                      aria-hidden="true"
                    />
                    <span className="text-xs">
                      {option.label.split(" ")[0]}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>

          <div>
            <Label htmlFor="feedback">Additional Comments (Optional)</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share more details about your experience..."
              rows={3}
              maxLength={500}
              aria-label="Additional Comments"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
              aria-label="Submit anonymously"
            />
            <Label htmlFor="anonymous">Submit anonymously</Label>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!selectedSentiment || submitSentimentMutation.isPending}
            className="w-full"
            type="button"
            aria-label="Submit Feedback"
          >
            {submitSentimentMutation.isPending
              ? "Submitting..."
              : "Submit Feedback"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventSentimentTracker;
// This component allows users to track and submit their sentiment about an event.
// It fetches existing sentiment data, displays a live sentiment distribution, and provides a form for users to submit their own sentiment and feedback.
// Users can choose to submit their feedback anonymously, and the component handles the submission process with error handling and success notifications.
// The sentiment options include various emotional states, each represented by an icon and color.
// The component uses the Supabase client for data fetching and mutations, and it integrates with the Auth context to access the current user information.
