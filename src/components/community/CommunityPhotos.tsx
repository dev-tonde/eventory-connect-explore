import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Heart, Download, Share2 } from "lucide-react";

interface CommunityPhotosProps {
  communityId: string;
}

interface Photo {
  id: string;
  file_url: string;
  caption?: string;
  uploaded_by: string;
  likes_count: number;
  created_at: string;
}

export const CommunityPhotos: React.FC<CommunityPhotosProps> = ({ communityId }) => {
  const { data: photos = [], isLoading } = useQuery({
    queryKey: ["community-photos", communityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .eq("moderation_status", "approved")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as Photo[];
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No photos yet</h3>
          <p className="text-gray-500 mb-4">
            Community photos and event memories will appear here
          </p>
          <Button variant="outline">
            <Camera className="h-4 w-4 mr-2" />
            Upload Photo
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Photo Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Community Gallery ({photos.length} photos)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>Total likes: {photos.reduce((sum, photo) => sum + (photo.likes_count || 0), 0)}</span>
            <span>Most recent: {photos[0] ? new Date(photos[0].created_at).toLocaleDateString() : "None"}</span>
          </div>
        </CardContent>
      </Card>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            <img
              src={photo.file_url}
              alt={photo.caption || "Community photo"}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg";
              }}
            />
            
            {/* Overlay on Hover */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Photo Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-xs font-medium">by {photo.uploaded_by}</p>
              {photo.caption && (
                <p className="text-xs opacity-90 line-clamp-2 mt-1">{photo.caption}</p>
              )}
              <div className="flex items-center gap-1 mt-1">
                <Heart className="h-3 w-3" />
                <span className="text-xs">{photo.likes_count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Button */}
      <Card>
        <CardContent className="p-6 text-center">
          <Button className="w-full md:w-auto">
            <Camera className="h-4 w-4 mr-2" />
            Upload New Photo
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            Share your event memories with the community
          </p>
        </CardContent>
      </Card>
    </div>
  );
};