import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Download, Heart, Camera, Clock, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface EventSummary {
  id: string;
  event_id: string;
  organizer_message: string;
  mood_timeline: any[];
  top_photos: string[];
  highlight_reel_url: string;
  share_token: string;
  event: {
    title: string;
    date: string;
    venue: string;
    organizer_id: string;
  };
}

export function PostEventSummary() {
  const { shareToken } = useParams<{ shareToken: string }>();

  const { data: summary, isLoading } = useQuery({
    queryKey: ["event-summary", shareToken],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_summaries")
        .select(`
          *,
          event:events (
            title,
            date,
            venue,
            organizer_id
          )
        `)
        .eq("share_token", shareToken)
        .eq("is_public", true)
        .single();

      if (error) throw error;
      return data as EventSummary;
    },
    enabled: !!shareToken,
  });

  const { data: topPhotos } = useQuery({
    queryKey: ["summary-photos", summary?.top_photos],
    queryFn: async () => {
      if (!summary?.top_photos?.length) return [];

      const { data, error } = await supabase
        .from("snaploop_uploads")
        .select("*")
        .in("id", summary.top_photos)
        .eq("approved", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!summary?.top_photos?.length,
  });

  const shareEvent = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: `${summary?.event.title} - Event Summary`,
        text: "Check out this amazing event summary!",
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-32 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Summary Not Found</h3>
            <p className="text-muted-foreground">
              This event summary doesn't exist or is no longer public.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">{summary.event.title}</h1>
            <p className="text-xl mb-6">
              {format(new Date(summary.event.date), "EEEE, MMMM d, yyyy")} • {summary.event.venue}
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="secondary" onClick={shareEvent}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Summary
              </Button>
              {summary.highlight_reel_url && (
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Reel
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Organizer Message */}
          {summary.organizer_message && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Thank You Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-6 rounded-lg">
                  <p className="text-lg leading-relaxed">{summary.organizer_message}</p>
                  <div className="mt-4 text-sm text-muted-foreground">
                    — The Event Organizers
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mood Timeline */}
          {summary.mood_timeline && summary.mood_timeline.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Event Mood Journey
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={summary.mood_timeline}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis domain={[1, 5]} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="avg_mood" 
                        stroke="#8884d8" 
                        strokeWidth={3}
                        dot={{ fill: "#8884d8", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Photos */}
          {topPhotos && topPhotos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Most Loved Photos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topPhotos.slice(0, 6).map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.thumbnail_url || photo.image_url}
                        alt={photo.caption || "Event photo"}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      {photo.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 rounded-b-lg">
                          <p className="text-white text-sm">{photo.caption}</p>
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary">
                          <Heart className="h-3 w-3 mr-1" />
                          Top Pick
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Highlight Reel */}
          {summary.highlight_reel_url && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Event Highlight Reel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Highlight reel video player would go here</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Footer */}
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">
                Powered by Eventory • Creating memorable experiences
              </p>
              <Button variant="outline">
                Discover More Events
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}