import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Share2, Facebook, Twitter, Instagram, Linkedin, Download } from "lucide-react";
import { useSnapLoopSocial } from "@/hooks/useSnapLoopSocial";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SocialShareButtonsProps {
  uploadId: string;
  imageUrl: string;
  eventTitle: string;
  caption?: string;
}

export function SocialShareButtons({ uploadId, imageUrl, eventTitle, caption }: SocialShareButtonsProps) {
  const { shareToSocial, isSharing, isCreatingBrandedImage } = useSnapLoopSocial();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const platforms = [
    { id: 'facebook' as const, name: 'Facebook', icon: Facebook, color: 'bg-blue-600 hover:bg-blue-700' },
    { id: 'twitter' as const, name: 'Twitter', icon: Twitter, color: 'bg-sky-500 hover:bg-sky-600' },
    { id: 'instagram' as const, name: 'Instagram', icon: Instagram, color: 'bg-pink-600 hover:bg-pink-700' },
    { id: 'linkedin' as const, name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700 hover:bg-blue-800' }
  ];

  const handleShare = async (platform: typeof platforms[0]['id']) => {
    const success = await shareToSocial({
      uploadId,
      imageUrl,
      eventTitle,
      platform
    });
    
    if (success) {
      setIsOpen(false);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Photo from ${eventTitle}`,
          text: caption || "Check out this photo!",
          url: imageUrl,
        });
        setIsOpen(false);
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${eventTitle}-photo-${uploadId}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download started",
        description: "Photo download has begun",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download the photo",
        variant: "destructive",
      });
    }
  };

  const isLoading = isSharing || isCreatingBrandedImage;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading}>
          <Share2 className="h-4 w-4 mr-1" />
          {isLoading ? "Creating..." : "Share"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this photo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Native Share (mobile) */}
          {navigator.share && (
            <Button
              onClick={handleNativeShare}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white"
              disabled={isLoading}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share via Device
            </Button>
          )}

          {/* Social Media Platforms */}
          <div className="grid grid-cols-2 gap-2">
            {platforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <Button
                  key={platform.id}
                  onClick={() => handleShare(platform.id)}
                  className={`${platform.color} text-white`}
                  disabled={isLoading}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {platform.name}
                </Button>
              );
            })}
          </div>

          {/* Download Option */}
          <Button
            onClick={handleDownload}
            variant="outline"
            className="w-full"
            disabled={isLoading}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Photo
          </Button>

          {isCreatingBrandedImage && (
            <p className="text-sm text-muted-foreground text-center">
              Creating branded version with watermark...
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}