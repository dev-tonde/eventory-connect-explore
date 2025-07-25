import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ShareOptions {
  uploadId: string;
  imageUrl: string;
  eventTitle: string;
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin';
}

export function useSnapLoopSocial() {
  const { toast } = useToast();
  const [isCreatingBrandedImage, setIsCreatingBrandedImage] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const createBrandedImage = async (imageUrl: string, eventTitle: string, platform?: string) => {
    setIsCreatingBrandedImage(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-branded-image', {
        body: { imageUrl, eventTitle, platform }
      });

      if (error) throw error;
      return data.brandedImageUrl;
    } catch (error) {
      console.error('Error creating branded image:', error);
      toast({
        title: "Branding failed",
        description: "Using original image for sharing",
        variant: "destructive",
      });
      return imageUrl; // Fallback to original
    } finally {
      setIsCreatingBrandedImage(false);
    }
  };

  const shareToSocial = async ({ uploadId, imageUrl, eventTitle, platform }: ShareOptions) => {
    setIsSharing(true);
    try {
      // Create branded version first
      const brandedImageUrl = await createBrandedImage(imageUrl, eventTitle, platform);
      
      // Generate share URLs for different platforms
      const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(brandedImageUrl)}&quote=${encodeURIComponent(`Check out this photo from ${eventTitle}!`)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this photo from ${eventTitle}!`)}&url=${encodeURIComponent(brandedImageUrl)}`,
        instagram: brandedImageUrl, // Instagram requires app integration
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(brandedImageUrl)}`
      };

      const shareUrl = shareUrls[platform];

      // Log the share in database
      await supabase
        .from('snaploop_social_shares')
        .insert({
          upload_id: uploadId,
          platform,
          branded_image_url: brandedImageUrl,
          share_url: shareUrl
        });

      // Open share URL (except for Instagram which needs special handling)
      if (platform === 'instagram') {
        // For Instagram, copy image URL and show instructions
        await navigator.clipboard.writeText(brandedImageUrl);
        toast({
          title: "Ready for Instagram!",
          description: "Image URL copied to clipboard. Open Instagram and paste to share.",
        });
      } else {
        window.open(shareUrl, '_blank', 'width=600,height=400');
        toast({
          title: "Shared successfully!",
          description: `Photo shared to ${platform}`,
        });
      }

      return true;
    } catch (error) {
      console.error('Error sharing to social:', error);
      toast({
        title: "Share failed",
        description: "Could not share to social media",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSharing(false);
    }
  };

  const analyzeAndTagImage = async (uploadId: string, imageUrl: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-snaploop-image', {
        body: { uploadId, imageUrl }
      });

      if (error) throw error;
      return data.tags || [];
    } catch (error) {
      console.error('Error analyzing image:', error);
      return [];
    }
  };

  return {
    shareToSocial,
    createBrandedImage,
    analyzeAndTagImage,
    isCreatingBrandedImage,
    isSharing
  };
}