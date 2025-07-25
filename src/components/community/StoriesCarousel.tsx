import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock, Eye } from "lucide-react";

interface StoriesCarouselProps {
  communityId: string;
}

interface Story {
  id: string;
  organizer_id: string;
  photo_id: string;
  is_pinned: boolean;
  display_order: number;
  expires_at: string;
  created_at: string;
  photos?: {
    file_url: string;
    caption?: string;
    uploaded_by: string;
  };
}

export const StoriesCarousel: React.FC<StoriesCarouselProps> = ({ communityId }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ["community-stories", communityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stories")
        .select(`
          *,
          photos (
            file_url,
            caption,
            uploaded_by
          )
        `)
        .gt("expires_at", new Date().toISOString())
        .order("is_pinned", { ascending: false })
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Story[];
    },
  });

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? stories.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === stories.length - 1 ? 0 : prev + 1));
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ${diffMins}m`;
    }
    return `${diffMins}m`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-16 h-16 bg-gray-200 rounded-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (stories.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No active stories</h3>
          <p className="text-gray-500 mb-4">
            Community stories and highlights will appear here
          </p>
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Create Story
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Story Thumbnails */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Community Stories</h3>
            <span className="text-sm text-gray-500">{stories.length} active</span>
          </div>
          
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {stories.map((story, index) => (
              <button
                key={story.id}
                onClick={() => setCurrentIndex(index)}
                className={`relative flex-shrink-0 w-16 h-16 rounded-full overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? "border-purple-500 scale-110"
                    : "border-gray-300 hover:border-purple-300"
                }`}
              >
                <img
                  src={story.photos?.file_url || "/placeholder.svg"}
                  alt="Story thumbnail"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
                {story.is_pinned && (
                  <div className="absolute top-0 right-0 w-3 h-3 bg-yellow-400 rounded-full border border-white" />
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Story Display */}
      {stories[currentIndex] && (
        <Card>
          <CardContent className="p-0">
            <div className="relative">
              {/* Story Image */}
              <div className="aspect-video bg-gray-900 rounded-t-lg overflow-hidden">
                <img
                  src={stories[currentIndex].photos?.file_url || "/placeholder.svg"}
                  alt="Story"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              </div>

              {/* Story Controls */}
              <div className="absolute inset-0 flex items-center justify-between p-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handlePrevious}
                  className="bg-black/20 hover:bg-black/40 text-white border-none"
                  disabled={stories.length <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleNext}
                  className="bg-black/20 hover:bg-black/40 text-white border-none"
                  disabled={stories.length <= 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Story Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    by {stories[currentIndex].photos?.uploaded_by || "Unknown"}
                  </span>
                  <div className="flex items-center gap-1 text-xs">
                    <Clock className="h-3 w-3" />
                    <span>{getTimeRemaining(stories[currentIndex].expires_at)}</span>
                  </div>
                </div>
                {stories[currentIndex].photos?.caption && (
                  <p className="text-sm opacity-90">
                    {stories[currentIndex].photos.caption}
                  </p>
                )}
              </div>

              {/* Progress Indicators */}
              <div className="absolute top-4 left-4 right-4">
                <div className="flex gap-1">
                  {stories.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 flex-1 rounded-full ${
                        index === currentIndex
                          ? "bg-white"
                          : index < currentIndex
                          ? "bg-white/70"
                          : "bg-white/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Story Navigation */}
      {stories.length > 1 && (
        <div className="flex justify-center">
          <div className="flex gap-2">
            {stories.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? "bg-purple-500" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};