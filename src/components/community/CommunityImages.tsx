
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Image as ImageIcon } from "lucide-react";

interface CommunityImagesProps {
  communityId: string;
}

const CommunityImages = ({ communityId }: CommunityImagesProps) => {
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
              <div key={image.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={image.image_url}
                  alt="Community shared image"
                  className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommunityImages;
