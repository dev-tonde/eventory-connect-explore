import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface HighlightReel {
  id: string;
  event_id: string;
  organizer_id: string;
  status: 'generating' | 'completed' | 'failed';
  video_url?: string;
  thumbnail_url?: string;
  duration_seconds: number;
  photo_count: number;
  generation_data: any;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

interface Photo {
  photo_id: string;
  file_url: string;
  likes_count: number;
  created_at: string;
  caption?: string;
}

export const useHighlightReel = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reels, setReels] = useState<HighlightReel[]>([]);
  const [currentReel, setCurrentReel] = useState<HighlightReel | null>(null);
  const { toast } = useToast();

  // Generate highlight reel
  const generateHighlightReel = async (
    eventId: string,
    organizerId: string,
    options: {
      duration?: number;
      photoCount?: number;
      style?: string;
    } = {}
  ) => {
    setIsGenerating(true);
    
    try {
      // First, get top photos for the event
      const { data: photos, error: photosError } = await supabase.rpc('get_top_photos_for_highlight', {
        event_uuid: eventId,
        limit_count: options.photoCount || 20
      });

      if (photosError) throw photosError;

      if (!photos || photos.length === 0) {
        throw new Error('No approved photos found for this event');
      }

      // Create highlight reel record
      const { data: reel, error: reelError } = await supabase
        .from('highlight_reels')
        .insert({
          event_id: eventId,
          organizer_id: organizerId,
          status: 'generating',
          duration_seconds: options.duration || 60,
          photo_count: photos.length,
          generation_data: {
            photos: photos,
            style: options.style || 'slideshow',
            transitions: ['fade', 'slide', 'zoom'],
            music_style: 'upbeat'
          }
        })
        .select()
        .single();

      if (reelError) throw reelError;

      setCurrentReel(reel as HighlightReel);

      // Call edge function to generate video
      const { data: generationResult, error: genError } = await supabase.functions.invoke('generate-highlight-reel', {
        body: {
          reelId: reel.id,
          eventId,
          photos,
          options: {
            duration: options.duration || 60,
            style: options.style || 'slideshow',
            ...options
          }
        }
      });

      if (genError) throw genError;

      toast({
        title: "Highlight Reel Generation Started",
        description: "Your 60-second highlight reel is being created. You'll be notified when it's ready!",
      });

      return reel;
    } catch (error) {
      console.error('Error generating highlight reel:', error);
      
      // Update reel status to failed if we created one
      if (currentReel) {
        await supabase
          .from('highlight_reels')
          .update({ 
            status: 'failed', 
            error_message: error instanceof Error ? error.message : 'Unknown error'
          })
          .eq('id', currentReel.id);
      }

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate highlight reel",
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // Get highlight reels for an event/organizer
  const fetchHighlightReels = async (eventId: string, organizerId: string) => {
    try {
      const { data, error } = await supabase
        .from('highlight_reels')
        .select('*')
        .eq('event_id', eventId)
        .eq('organizer_id', organizerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReels((data || []) as HighlightReel[]);
      return data as HighlightReel[];
    } catch (error) {
      console.error('Error fetching highlight reels:', error);
      return [];
    }
  };

  // Check generation status
  const checkGenerationStatus = async (reelId: string) => {
    try {
      const { data, error } = await supabase
        .from('highlight_reels')
        .select('*')
        .eq('id', reelId)
        .single();

      if (error) throw error;

      setCurrentReel(data as HighlightReel);
      
      if ((data as HighlightReel).status === 'completed') {
        toast({
          title: "Highlight Reel Complete!",
          description: "Your highlight reel is ready to view and share.",
        });
      } else if ((data as HighlightReel).status === 'failed') {
        toast({
          title: "Generation Failed",
          description: (data as HighlightReel).error_message || "Failed to generate highlight reel",
          variant: "destructive",
        });
      }

      return data;
    } catch (error) {
      console.error('Error checking generation status:', error);
      return null;
    }
  };

  // Download highlight reel
  const downloadHighlightReel = async (reel: HighlightReel) => {
    if (!reel.video_url) return;

    try {
      // Create download link
      const link = document.createElement('a');
      link.href = reel.video_url;
      link.download = `highlight-reel-${reel.event_id}-${reel.id}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: "Your highlight reel is downloading...",
      });
    } catch (error) {
      console.error('Error downloading highlight reel:', error);
      toast({
        title: "Download Error",
        description: "Failed to download highlight reel",
        variant: "destructive",
      });
    }
  };

  // Share highlight reel
  const shareHighlightReel = async (reel: HighlightReel, platform: string) => {
    if (!reel.video_url) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Event Highlight Reel',
          text: 'Check out this amazing event highlight reel!',
          url: reel.video_url,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(reel.video_url);
        toast({
          title: "Link Copied",
          description: "Highlight reel link copied to clipboard!",
        });
      }
    } catch (error) {
      console.error('Error sharing highlight reel:', error);
      toast({
        title: "Share Error",
        description: "Failed to share highlight reel",
        variant: "destructive",
      });
    }
  };

  return {
    isGenerating,
    reels,
    currentReel,
    generateHighlightReel,
    fetchHighlightReels,
    checkGenerationStatus,
    downloadHighlightReel,
    shareHighlightReel
  };
};