import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Share2 } from "lucide-react";

interface EventHeaderProps {
  title: string;
  category: string;
  imageUrl?: string;
  onShare: () => void;
  onFavorite: () => void;
}

export const EventHeader: React.FC<EventHeaderProps> = ({
  title,
  category,
  imageUrl,
  onShare,
  onFavorite,
}) => {
  return (
    <div className="space-y-4">
      {/* Hero Image */}
      <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
        <img
          src={imageUrl || "/placeholder.svg"}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
      </div>

      {/* Title and Actions */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          <Badge variant="secondary">{category}</Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onShare}
            className="hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 transition-colors"
            aria-label="Share Event"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onFavorite}
            className="hover:bg-red-50 focus:ring-2 focus:ring-red-500 transition-colors"
            aria-label="Add to Favorites"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};