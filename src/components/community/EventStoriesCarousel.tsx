import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Clock, Play, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/EnhancedAuthContext';

interface Story {
  id: string;
  event_id: string;
  user_id: string;
  file_url: string;
  file_type: 'image' | 'video';
  caption?: string;
  expires_at: string;
  is_pinned: boolean;
  display_order: number;
  created_at: string;
  views_count: number;
}

interface EventStoriesCarouselProps {
  eventId: string;
}

export const EventStoriesCarousel: React.FC<EventStoriesCarouselProps> = ({ eventId }) => {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: stories, isLoading } = useQuery({
    queryKey: ['event-stories', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_stories')
        .select('*')
        .eq('event_id', eventId)
        .gt('expires_at', new Date().toISOString())
        .order('is_pinned', { ascending: false })
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Story[];
    },
    enabled: !!eventId,
  });

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const nextStory = () => {
    if (stories && currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-64 bg-muted animate-pulse rounded-lg" />
    );
  }

  if (!stories || stories.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Stories Yet</h3>
        <p className="text-muted-foreground mb-4">Be the first to share a moment from this event!</p>
        <Button>Upload Story</Button>
      </Card>
    );
  }

  const currentStory = stories[currentIndex];

  return (
    <div className="relative">
      <Card className="overflow-hidden">
        <div className="relative aspect-video bg-black">
          {currentStory.file_type === 'image' ? (
            <img
              src={currentStory.file_url}
              alt={currentStory.caption || 'Event story'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="relative w-full h-full">
              <video
                src={currentStory.file_url}
                className="w-full h-full object-cover"
                controls
                preload="metadata"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Play className="h-16 w-16 text-white" />
              </div>
            </div>
          )}
          
          {/* Story overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30">
            {/* Top bar with time remaining */}
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="bg-black/50 text-white">
                <Clock className="h-3 w-3 mr-1" />
                {getTimeRemaining(currentStory.expires_at)}
              </Badge>
            </div>

            {/* Pinned badge */}
            {currentStory.is_pinned && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-primary">Pinned</Badge>
              </div>
            )}

            {/* Bottom caption and info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              {currentStory.caption && (
                <p className="text-sm mb-2">{currentStory.caption}</p>
              )}
              <div className="flex items-center justify-between text-xs opacity-80">
                <span>{stories.length} stories</span>
                <span>{currentStory.views_count} views</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation */}
      {stories.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
            onClick={prevStory}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
            onClick={nextStory}
            disabled={currentIndex === stories.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Story indicators */}
      {stories.length > 1 && (
        <div className="flex justify-center mt-4 gap-1">
          {stories.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-primary' : 'bg-muted'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};