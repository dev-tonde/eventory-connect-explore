/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Sanitize text to prevent XSS
const sanitizeText = (text: string) =>
  typeof text === "string" ? text.replace(/[<>]/g, "").trim() : "";

interface SocialSchedulerProps {
  posterId?: string;
  eventId?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const SocialScheduler = ({
  posterId,
  eventId,
  isOpen,
  onClose,
}: SocialSchedulerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [platform, setPlatform] = useState("");
  const [caption, setCaption] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledPosts, setScheduledPosts] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchScheduledPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Defensive: Only allow known platforms
  const allowedPlatforms = ["instagram", "facebook", "twitter", "linkedin"];

  const fetchScheduledPosts = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("scheduled_posts")
      .select(
        `
        *,
        generated_posters (
          event_id,
          image_data
        )
      `
      )
      .eq("user_id", user.id)
      .order("scheduled_for", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch scheduled posts.",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      setScheduledPosts(data);
    }
  };

  const schedulePost = async () => {
    if (
      !platform ||
      !caption ||
      !scheduledDate ||
      !scheduledTime ||
      !user ||
      !allowedPlatforms.includes(platform)
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsScheduling(true);
    try {
      const scheduledFor = new Date(
        `${scheduledDate}T${scheduledTime}`
      ).toISOString();

      const { error } = await supabase.functions.invoke(
        "schedule-social-post",
        {
          body: {
            userId: user.id,
            eventId: eventId || "demo",
            posterId,
            platform,
            caption: sanitizeText(caption),
            scheduledFor,
          },
        }
      );

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Post scheduled for ${platform} on ${scheduledDate} at ${scheduledTime}.`,
      });

      // Reset form
      setPlatform("");
      setCaption("");
      setScheduledDate("");
      setScheduledTime("");

      // Refresh scheduled posts
      fetchScheduledPosts();
      onClose?.();
    } catch (error) {
      console.error("Error scheduling post:", error);
      toast({
        title: "Error",
        description: "Failed to schedule post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const cancelScheduledPost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from("scheduled_posts")
        .update({ status: "cancelled" })
        .eq("id", postId);

      if (error) throw error;

      toast({
        title: "Post Cancelled",
        description: "The scheduled post has been cancelled.",
      });

      fetchScheduledPosts();
    } catch (error) {
      console.error("Error cancelling post:", error);
      toast({
        title: "Error",
        description: "Failed to cancel post.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" aria-hidden="true" />
            Schedule Social Media Post
          </CardTitle>
          <CardDescription>
            Schedule your generated poster to be posted on social media
            platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform
            </label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Select social media platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Caption
            </label>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write your post caption..."
              className="h-24"
              maxLength={platform === "twitter" ? 280 : 2200}
              aria-label="Post caption"
            />
            <p className="text-xs text-gray-500 mt-1">
              {caption.length}/{platform === "twitter" ? 280 : 2200} characters
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" aria-hidden="true" />
                Date
              </label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                aria-label="Schedule date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline h-4 w-4 mr-1" aria-hidden="true" />
                Time
              </label>
              <Input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                aria-label="Schedule time"
              />
            </div>
          </div>

          <Button
            onClick={schedulePost}
            disabled={isScheduling}
            className="w-full"
            type="button"
            aria-label="Schedule Post"
          >
            {isScheduling ? "Scheduling..." : "Schedule Post"}
          </Button>
        </CardContent>
      </Card>

      {scheduledPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Posts</CardTitle>
            <CardDescription>
              Manage your upcoming social media posts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scheduledPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                      {post.generated_posters?.image_data && (
                        <img
                          src={`data:image/png;base64,${post.generated_posters.image_data}`}
                          alt="Poster thumbnail"
                          className="w-full h-full object-cover"
                          loading="lazy"
                          width={48}
                          height={48}
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium capitalize">
                        {sanitizeText(post.platform)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {post.scheduled_for
                          ? new Date(post.scheduled_for).toLocaleDateString()
                          : ""}{" "}
                        at{" "}
                        {post.scheduled_for
                          ? new Date(post.scheduled_for).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : ""}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {sanitizeText(post.status)}
                      </p>
                    </div>
                  </div>

                  {post.status === "scheduled" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelScheduledPost(post.id)}
                      type="button"
                      aria-label="Cancel scheduled post"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SocialScheduler;
// This component allows users to schedule and post content to social media platforms.
// It includes functionality to select a platform, write a caption, and either post immediately or schedule for later.
// The component fetches and displays recent posts, allowing users to see their social media activity.
// It also provides a modal for scheduling posts with date and time selection.
// The component uses Supabase for backend operations and includes basic sanitization to prevent XSS attacks.
