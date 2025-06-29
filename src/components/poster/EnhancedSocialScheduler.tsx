import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const EnhancedSocialScheduler = ({ posterId, eventId, imageUrl, isOpen, onClose }: EnhancedSocialSchedulerProps) => {
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

  useEffect(() => {
    if (user) {
      fetchScheduledPosts();
      fetchSocialPosts();
    }
  }, [user]);

  const fetchScheduledPosts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_for', { ascending: false });

      if (error) {
        console.error('Error fetching scheduled posts:', error);
        return;
      }

      if (data) {
        setScheduledPosts(data);
      }
    } catch (error) {
      console.error('Error in fetchScheduledPosts:', error);
    }
  };

  const fetchSocialPosts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('social_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('posted_at', { ascending: false });

      if (error) {
        console.error('Error fetching social posts:', error);
        return;
      }

      if (data) {
        setSocialPosts(data);
      }
    } catch (error) {
      console.error('Error in fetchSocialPosts:', error);
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
      const { data, error } = await supabase.functions.invoke('post-to-social', {
        body: {
          platform,
          caption,
          imageUrl,
          userId: user.id,
          posterId,
          eventId
        }
      });

      if (error) throw error;

      toast({
        title: "Posted Successfully!",
        description: `Your post has been shared on ${platform}.`,
      });

      // Reset form and refresh posts
      setPlatform("");
      setCaption("");
      fetchSocialPosts();
      onClose?.();

    } catch (error) {
      console.error('Error posting to social media:', error);
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
      const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();

      const { data, error } = await supabase.functions.invoke('schedule-social-post', {
        body: {
          userId: user.id,
          eventId: eventId || 'demo',
          posterId: posterId,
          platform,
          caption,
          scheduledFor
        }
      });

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
      
      fetchScheduledPosts();
      onClose?.();

    } catch (error) {
      console.error('Error scheduling post:', error);
      toast({
        title: "Error",
        description: "Failed to schedule post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const platformIcons = {
    facebook: "🔵",
    instagram: "📷",
    twitter: "🐦",
    linkedin: "💼"
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
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
                <Eye className="h-4 w-4" />
                Preview
              </h4>
              <img 
                src={imageUrl} 
                alt="Post preview" 
                className="w-32 h-32 object-cover rounded-lg"
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
              maxLength={platform === 'twitter' ? 280 : 2200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {caption.length}/{platform === 'twitter' ? 280 : 2200} characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={postNow} 
              disabled={isPosting || !platform || !caption}
              className="flex-1"
            >
              {isPosting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Posting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Post Now
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => {
                const modal = document.getElementById('schedule-modal');
                if (modal) modal.style.display = 'block';
              }}
              disabled={!platform || !caption}
              className="flex-1"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
          </div>

          {/* Schedule Modal Content */}
          <div id="schedule-modal" style={{ display: 'none' }} className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Date
                </label>
                <Input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Time
                </label>
                <Input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
            </div>

            <Button 
              onClick={schedulePost} 
              disabled={isScheduling}
              className="w-full"
            >
              {isScheduling ? 'Scheduling...' : 'Schedule Post'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Posts */}
      {socialPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
            <CardDescription>Your recently published social media posts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {socialPosts.slice(0, 5).map((post) => (
                <div key={post.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="text-2xl">
                    {platformIcons[post.platform as keyof typeof platformIcons]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="capitalize">
                        {post.platform}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(post.posted_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{post.caption}</p>
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
