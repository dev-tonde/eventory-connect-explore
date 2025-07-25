import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, Calendar, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CommunityFeedProps {
  communityId: string;
}

interface FeedItem {
  id: string;
  type: "event" | "announcement" | "photo";
  title: string;
  content: string;
  author_name: string;
  created_at: string;
  image_url?: string;
  event_date?: string;
  venue?: string;
  likes_count?: number;
  comments_count?: number;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({ communityId }) => {
  const { data: feedItems = [], isLoading } = useQuery({
    queryKey: ["community-feed", communityId],
    queryFn: async () => {
      // Get recent events from this community
      const { data: events } = await supabase
        .from("events")
        .select(`
          id,
          title,
          description,
          date,
          venue,
          image_url,
          created_at,
          profiles!events_organizer_id_fkey(first_name, last_name, username)
        `)
        .gte("date", new Date().toISOString().split("T")[0])
        .order("created_at", { ascending: false })
        .limit(5);

      // Get recent photos
      const { data: photos } = await supabase
        .from("photos")
        .select("*")
        .eq("moderation_status", "approved")
        .order("created_at", { ascending: false })
        .limit(5);

      // Combine and format as feed items
      const feedItems: FeedItem[] = [];

      events?.forEach((event) => {
        const authorName = event.profiles?.first_name && event.profiles?.last_name
          ? `${event.profiles.first_name} ${event.profiles.last_name}`
          : event.profiles?.username || "Unknown";

        feedItems.push({
          id: event.id,
          type: "event",
          title: event.title,
          content: event.description || "",
          author_name: authorName,
          created_at: event.created_at,
          image_url: event.image_url,
          event_date: event.date,
          venue: event.venue,
        });
      });

      photos?.forEach((photo) => {
        feedItems.push({
          id: photo.id,
          type: "photo",
          title: "New Photo Shared",
          content: photo.caption || "A new photo was shared in the community",
          author_name: photo.uploaded_by || "Guest",
          created_at: photo.created_at,
          image_url: photo.file_url,
          likes_count: photo.likes_count,
          comments_count: photo.comments_count,
        });
      });

      // Sort by creation date
      return feedItems.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/6" />
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-32 bg-gray-200 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (feedItems.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No activity yet</h3>
            <p>Be the first to share something with this community!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {feedItems.map((item) => (
        <Card key={item.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            {/* Post Header */}
            <div className="flex items-center gap-3 mb-4">
              <Avatar>
                <AvatarFallback>
                  {item.author_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-medium">{item.author_name}</h4>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                </p>
              </div>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Post Content */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <p className="text-gray-700">{item.content}</p>

              {/* Event Details */}
              {item.type === "event" && (
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {item.event_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(item.event_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                  {item.venue && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{item.venue}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Post Image */}
              {item.image_url && (
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                </div>
              )}
            </div>

            {/* Post Actions */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span>{item.likes_count || 0}</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span>{item.comments_count || 0}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};