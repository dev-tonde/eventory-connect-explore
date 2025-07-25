import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Heart, MessageCircle, Download, Share2, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SocialShareButtons } from "./SocialShareButtons";

interface SnapLoopGalleryProps {
  eventId: string;
}

interface SnapLoopUpload {
  id: string;
  image_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  uploaded_by: string | null;
  created_at: string;
  file_size: number | null;
  tags: string[] | null;
}

export function SnapLoopGallery({ eventId }: SnapLoopGalleryProps) {
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<SnapLoopUpload | null>(null);

    const { data: uploads, isLoading } = useQuery({
    queryKey: ["snaploop-uploads", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("snaploop_uploads")
        .select("*")
        .eq("event_id", eventId)
        .eq("approved", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SnapLoopUpload[];
    },
  });

  // Get event title for social sharing
  const { data: event } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("title")
        .eq("id", eventId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleShare = async (upload: SnapLoopUpload) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Photo from event`,
          text: upload.caption || "Check out this photo!",
          url: upload.image_url,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(upload.image_url);
      toast({
        title: "Link copied!",
        description: "Image link copied to clipboard",
      });
    }
  };

  const handleDownload = async (upload: SnapLoopUpload) => {
    try {
      const response = await fetch(upload.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `event-photo-${upload.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download started",
        description: "Photo download has begun",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download the photo",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="aspect-square">
            <CardContent className="p-0">
              <div className="w-full h-full bg-muted animate-pulse rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!uploads || uploads.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-muted-foreground">
          <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No photos yet</h3>
          <p>Photos shared by guests will appear here once approved.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Event Photos</h3>
          <p className="text-sm text-muted-foreground">
            {uploads.length} photo{uploads.length !== 1 ? "s" : ""} shared by guests
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {uploads.map((upload) => (
          <Dialog key={upload.id}>
            <DialogTrigger asChild>
              <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg">
                <CardContent className="p-0">
                  <div className="aspect-square relative">
                    <img
                      src={upload.thumbnail_url || upload.image_url}
                      alt={upload.caption || "Event photo"}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    {upload.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                        <p className="text-white text-sm truncate">{upload.caption}</p>
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-2">
                    {upload.uploaded_by && (
                      <Badge variant="secondary" className="text-xs">
                        by {upload.uploaded_by}
                      </Badge>
                    )}
                    {upload.tags && upload.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {upload.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            <Tag className="h-2 w-2 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {upload.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{upload.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            
            <DialogContent className="max-w-4xl">
              <div className="space-y-4">
                <img
                  src={upload.image_url}
                  alt={upload.caption || "Event photo"}
                  className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {upload.caption && (
                      <p className="text-sm text-muted-foreground mb-2">{upload.caption}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {upload.uploaded_by && <span>by {upload.uploaded_by}</span>}
                      <span>•</span>
                      <span>{new Date(upload.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <SocialShareButtons
                      uploadId={upload.id}
                      imageUrl={upload.image_url}
                      eventTitle={event?.title || "Event"}
                      caption={upload.caption || undefined}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(upload)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
}