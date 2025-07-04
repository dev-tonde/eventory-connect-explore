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
    return (
      <Card>
        <CardContent className="p-8 flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-200 animate-pulse rounded-full mb-4" />
          <div className="h-4 w-1/3 bg-gray-200 animate-pulse rounded mb-2" />
          <div className="h-3 w-1/2 bg-gray-100 animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-4">
          {images.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No images shared yet
              </h3>
              <p className="text-gray-500">
                Images shared in this community will appear here
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden"
                >
                  <img
                    src={
                      image.image_url && image.image_url.startsWith("https://")
                        ? image.image_url
                        : "/placeholder.svg"
                    }
                    alt="Community shared"
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setShareImage(image.image_url)}
                      aria-label="Share image"
                      type="button"
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
// This component displays images shared in a community. It fetches images from the Supabase database and displays them in a grid layout. Each image can be shared using a button that opens a modal for sharing options. The component handles loading states and displays a message when no images are available.
// The images are fetched from the "community_messages" table, filtering by the community ID and ensuring that only messages of type "image" with a non-null image URL are included. The images are displayed in a responsive grid, with a hover effect that shows a share button. When the share button is clicked, a modal opens to allow users to share the image. The component also includes error handling for image loading, displaying a placeholder image if the original fails to load. The overall design is clean and user-friendly, with a focus on accessibility and responsiveness.
// The component uses React Query for data fetching, ensuring efficient and reactive updates. It also includes a loading state that displays a skeleton loader while images are being fetched. The images are displayed in a responsive grid layout, adapting to different screen sizes. The share functionality is implemented using a modal component that allows users to share the selected image with others in the community. The component is designed to be reusable and can be easily integrated into other parts of the application where community images need to be displayed or shared.
