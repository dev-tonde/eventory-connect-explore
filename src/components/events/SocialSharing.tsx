
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Share2, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Copy,
  MessageCircle 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Event } from "@/types/event";

interface SocialSharingProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

const SocialSharing = ({ event, isOpen, onClose }: SocialSharingProps) => {
  const { toast } = useToast();
  const [copying, setCopying] = useState(false);

  const eventUrl = `${window.location.origin}/events/${event.id}`;
  const shareText = `Check out ${event.title} - ${event.description?.substring(0, 100)}...`;
  const hashtags = event.tags?.map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ') || '#events';

  const shareOptions = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`,
      color: 'text-blue-600'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(eventUrl)}&hashtags=${encodeURIComponent(hashtags)}`,
      color: 'text-blue-400'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`,
      color: 'text-blue-700'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${eventUrl}`)}`,
      color: 'text-green-600'
    }
  ];

  const handleShare = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
  };

  const copyToClipboard = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(eventUrl);
      toast({
        title: "Link copied!",
        description: "Event link has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please try again or copy the link manually.",
        variant: "destructive",
      });
    } finally {
      setCopying(false);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: shareText,
          url: eventUrl,
        });
      } catch (error) {
        console.log('Native sharing cancelled or failed');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share Event
            </h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>

          <div className="space-y-4">
            {/* Social Media Options */}
            <div className="grid grid-cols-2 gap-3">
              {shareOptions.map((option) => (
                <Button
                  key={option.name}
                  variant="outline"
                  onClick={() => handleShare(option.url)}
                  className="flex items-center gap-2 h-12"
                >
                  <option.icon className={`h-5 w-5 ${option.color}`} />
                  {option.name}
                </Button>
              ))}
            </div>

            {/* Native Share (Mobile) */}
            {navigator.share && (
              <Button
                onClick={handleNativeShare}
                className="w-full flex items-center gap-2"
                variant="outline"
              >
                <Share2 className="h-4 w-4" />
                Share via...
              </Button>
            )}

            {/* Copy Link */}
            <div className="border-t pt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={eventUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border rounded text-sm bg-gray-50"
                />
                <Button
                  onClick={copyToClipboard}
                  disabled={copying}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="h-4 w-4" />
                  {copying ? 'Copying...' : 'Copy'}
                </Button>
              </div>
            </div>

            {/* Event Preview */}
            <div className="bg-gray-50 p-3 rounded text-sm">
              <div className="font-medium">{event.title}</div>
              <div className="text-gray-600 text-xs mt-1">
                {new Date(event.date).toLocaleDateString()} • {event.venue}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialSharing;
