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
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Share2, Send, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface EnhancedSocialSchedulerProps {
  posterId?: string;
  eventId?: string;
  imageUrl?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

// Sanitize text to prevent XSS
const sanitizeText = (text: string) =>
  typeof text === "string" ? text.replace(/[<>]/g, "").trim() : "";

const platformIcons = {
  facebook: "🔵",
  instagram: "📷",
  twitter: "🐦",
  linkedin: "💼",
};

const EnhancedSocialScheduler = ({
  posterId,
  eventId,
  imageUrl,
  isOpen,
  onClose,
}: EnhancedSocialSchedulerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [platform, setPlatform] = useState("");
  const [caption, setCaption] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [scheduledPosts, setScheduledPosts] = useState<any[]>([]);
  const [socialPosts, setSocialPosts] = useState<any[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchScheduledPosts();
      fetchSocialPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchScheduledPosts = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("scheduled_posts")
        .select("*")
        .eq("user_id", user.id)
        .order("scheduled_for", { ascending: false });
      if (error) {
        console.error("Error fetching scheduled posts:", error);
        return;
      }
      if (data) setScheduledPosts(data);
    } catch (error) {
      console.error("Error in fetchScheduledPosts:", error);
    }
  };

  const fetchSocialPosts = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("social_posts")
        .select("*")
        .eq("user_id", user.id)
        .order("posted_at", { ascending: false });
      if (error) {
        console.error("Error fetching social posts:", error);
        return;
      }
      if (data) setSocialPosts(data);
    } catch (error) {
      console.error("Error in fetchSocialPosts:", error);
    }
  };

  const postNow = async () => {
    if (!platform || !caption || !user) {
      toast({
        title: "Error",
        description: "Please fill in platform and caption fields.",
        variant: "destructive",
      });
      return;
    }
    setIsPosting(true);
    try {
      const { error } = await supabase.functions.invoke("post-to-social", {
        body: {
          platform,
          caption: sanitizeText(caption),
          imageUrl,
          userId: user.id,
          posterId,
          eventId,
        },
      });
      if (error) throw error;
      toast({
        title: "Posted Successfully!",
        description: `Your post has been shared on ${platform}.`,
      });
      setPlatform("");
      setCaption("");
      fetchSocialPosts();
      onClose?.();
    } catch (error) {
      console.error("Error posting to social media:", error);
      toast({
        title: "Posting Failed",
        description: "Failed to post to social media. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const schedulePost = async () => {
    if (!platform || !caption || !scheduledDate || !scheduledTime || !user) {
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
      setPlatform("");
      setCaption("");
      setScheduledDate("");
      setScheduledTime("");
      setShowScheduleModal(false);
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" aria-hidden="true" />
            Social Media Publishing
          </CardTitle>
          <CardDescription>
            Post immediately or schedule your content for later
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preview */}
          {imageUrl && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Eye className="h-4 w-4" aria-hidden="true" />
                Preview
              </h4>
              <img
                src={imageUrl}
                alt="Post preview"
                className="w-32 h-32 object-cover rounded-lg"
                loading="lazy"
                width={128}
                height={128}
              />
            </div>
          )}

          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform
            </label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Select social media platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="facebook">🔵 Facebook</SelectItem>
                <SelectItem value="instagram">📷 Instagram</SelectItem>
                <SelectItem value="twitter">🐦 Twitter</SelectItem>
                <SelectItem value="linkedin">💼 LinkedIn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Caption
            </label>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write your post caption..."
              className="h-32"
              maxLength={platform === "twitter" ? 280 : 2200}
              aria-label="Post caption"
            />
            <p className="text-xs text-gray-500 mt-1">
              {caption.length}/{platform === "twitter" ? 280 : 2200} characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={postNow}
              disabled={isPosting || !platform || !caption}
              className="flex-1"
              type="button"
              aria-label="Post Now"
            >
              {isPosting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Posting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" aria-hidden="true" />
                  Post Now
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowScheduleModal(true)}
              disabled={!platform || !caption}
              className="flex-1"
              type="button"
              aria-label="Schedule Post"
            >
              <Calendar className="h-4 w-4 mr-2" aria-hidden="true" />
              Schedule
            </Button>
          </div>

          {/* Schedule Modal Content */}
          {showScheduleModal && (
            <div className="border-t pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar
                      className="inline h-4 w-4 mr-1"
                      aria-hidden="true"
                    />
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
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1"
                  type="button"
                  aria-label="Cancel Scheduling"
                >
                  Cancel
                </Button>
                <Button
                  onClick={schedulePost}
                  disabled={isScheduling}
                  className="flex-1"
                  type="button"
                  aria-label="Schedule Post"
                >
                  {isScheduling ? "Scheduling..." : "Schedule Post"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Posts */}
      {socialPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
            <CardDescription>
              Your recently published social media posts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {socialPosts.slice(0, 5).map((post) => (
                <div
                  key={post.id}
                  className="flex items-start gap-3 p-3 border rounded-lg"
                >
                  <div className="text-2xl">
                    {platformIcons[post.platform as keyof typeof platformIcons]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="capitalize">
                        {sanitizeText(post.platform)}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {post.posted_at
                          ? new Date(post.posted_at).toLocaleDateString()
                          : ""}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {sanitizeText(post.caption)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedSocialScheduler;
// This component allows users to schedule and post content to social media platforms.
// It includes functionality to select a platform, write a caption, and either post immediately or schedule for later.
// The component fetches and displays recent posts, allowing users to see their social media activity.
// It also provides a modal for scheduling posts with date and time selection.
// The component uses Supabase for backend operations and includes basic sanitization to prevent XSS attacks.
