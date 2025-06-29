
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Share2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CommunityMediaShareProps {
  imageUrl: string;
  communityId: string;
  onClose: () => void;
}

const CommunityMediaShare = ({ imageUrl, communityId, onClose }: CommunityMediaShareProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [platform, setPlatform] = useState("");
  const [caption, setCaption] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  const shareToSocial = async () => {
    if (!platform || !caption || !user) {
      toast({
        title: "Error",
        description: "Please select platform and add caption.",
        variant: "destructive",
      });
      return;
    }

    setIsSharing(true);
    try {
      const { data, error } = await supabase.functions.invoke('post-to-social', {
        body: {
          platform,
          caption: `${caption} #CommunityShare #Eventory`,
          imageUrl,
          userId: user.id,
          communityId
        }
      });

      if (error) throw error;

      toast({
        title: "Shared Successfully!",
        description: `Community image shared to ${platform}.`,
      });

      onClose();

    } catch (error) {
      console.error('Error sharing to social media:', error);
      toast({
        title: "Sharing Failed",
        description: "Failed to share to social media. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share to Social Media
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Image Preview */}
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={imageUrl}
              alt="Community image to share"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Platform Selection */}
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger>
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="facebook">🔵 Facebook</SelectItem>
              <SelectItem value="instagram">📷 Instagram</SelectItem>
              <SelectItem value="twitter">🐦 Twitter</SelectItem>
              <SelectItem value="linkedin">💼 LinkedIn</SelectItem>
            </SelectContent>
          </Select>

          {/* Caption */}
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption for your post..."
            className="min-h-[80px]"
          />

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={shareToSocial}
              disabled={isSharing || !platform || !caption}
              className="flex-1"
            >
              {isSharing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sharing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Share
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityMediaShare;
