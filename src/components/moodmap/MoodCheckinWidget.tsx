import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/EnhancedAuthContext";

interface MoodCheckinWidgetProps {
  eventId: string;
  onCheckinComplete?: () => void;
}

const MOOD_OPTIONS = [
  { value: 5, emoji: "😄", label: "Amazing", color: "text-green-500" },
  { value: 4, emoji: "😊", label: "Good", color: "text-green-400" },
  { value: 3, emoji: "😐", label: "Okay", color: "text-yellow-500" },
  { value: 2, emoji: "😞", label: "Not Great", color: "text-orange-500" },
  { value: 1, emoji: "😔", label: "Poor", color: "text-red-500" },
];

export function MoodCheckinWidget({ eventId, onCheckinComplete }: MoodCheckinWidgetProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateSessionToken = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const handleSubmit = async () => {
    if (selectedMood === null) {
      toast({
        title: "Please select a mood",
        description: "Choose how you're feeling right now",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const sessionToken = generateSessionToken();
      
      const { error } = await supabase
        .from("mood_checkins")
        .insert({
          event_id: eventId,
          mood_score: selectedMood,
          comment: comment.trim() || null,
          user_id: user?.id || null,
          session_token: sessionToken,
        });

      if (error) throw error;

      toast({
        title: "Mood shared!",
        description: "Thanks for sharing how you're feeling.",
      });

      // Reset form
      setSelectedMood(null);
      setComment("");
      
      if (onCheckinComplete) {
        onCheckinComplete();
      }

    } catch (error) {
      console.error("Mood checkin error:", error);
      toast({
        title: "Check-in failed",
        description: "There was an error recording your mood. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedMoodData = MOOD_OPTIONS.find(mood => mood.value === selectedMood);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>How are you feeling?</CardTitle>
        <p className="text-sm text-muted-foreground">
          Help us understand the event vibe by sharing your mood
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base font-medium">Your mood right now</Label>
          <div className="grid grid-cols-5 gap-2 mt-3">
            {MOOD_OPTIONS.map((mood) => (
              <button
                key={mood.value}
                type="button"
                onClick={() => setSelectedMood(mood.value)}
                className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                  selectedMood === mood.value
                    ? "border-primary bg-primary/10 scale-105"
                    : "border-muted hover:border-muted-foreground/50"
                }`}
              >
                <div className="text-2xl mb-1">{mood.emoji}</div>
                <div className={`text-xs font-medium ${mood.color}`}>
                  {mood.label}
                </div>
              </button>
            ))}
          </div>
          {selectedMoodData && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              You're feeling <span className={selectedMoodData.color}>{selectedMoodData.label.toLowerCase()}</span>
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="mood-comment">Tell us more (Optional)</Label>
          <Textarea
            id="mood-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What's making you feel this way?"
            maxLength={150}
            rows={3}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {comment.length}/150 characters
          </p>
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full"
          disabled={selectedMood === null || isSubmitting}
        >
          {isSubmitting ? "Sharing..." : "Share My Mood"}
        </Button>
      </CardContent>
    </Card>
  );
}