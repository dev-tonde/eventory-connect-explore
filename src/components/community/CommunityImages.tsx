
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Share2 } from "lucide-react";
import CommunityMediaShare from "./CommunityMediaShare";

interface CommunityImagesProps {
  communityId: string;
}

const CommunityImages = ({ communityId }: CommunityImagesProps) => {
  const [shareImage, setShareImage] = useState<string | null>(null);

  const { data: images = [], isLoading } = useQuery({
    queryKey: ["community-images", communityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_messages")
        .select("*")
        .eq("community_id", communityId)
        .eq("message_type", "image")
        .not("image_url", "is", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading images...</div>;
  }

  return (
    <>
      <Card>
        <CardContent className="p-4">
          {images.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No images shared yet</h3>
              <p className="text-gray-500">Images shared in this community will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image) => (
                <div key={image.id} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image.image_url}
                    alt="Community shared image"
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setShareImage(image.image_url)}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {shareImage && (
        <CommunityMediaShare
          imageUrl={shareImage}
          communityId={communityId}
          onClose={() => setShareImage(null)}
        />
      )}
    </>
  );
};

export default CommunityImages;
