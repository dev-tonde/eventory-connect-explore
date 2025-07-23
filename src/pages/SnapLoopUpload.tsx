import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GuestUploadForm } from "@/components/snaploop/GuestUploadForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MapPin, Camera } from "lucide-react";

export default function SnapLoopUpload() {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId");

  const { data: event, isLoading, error } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      if (!eventId) throw new Error("No event ID provided");
      
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });

  if (!eventId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h1 className="text-xl font-semibold mb-2">Invalid Upload Link</h1>
            <p className="text-muted-foreground">
              This upload link is missing event information. Please get a new link from the event organizer.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading event details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h1 className="text-xl font-semibold mb-2">Event Not Found</h1>
            <p className="text-muted-foreground mb-4">
              We couldn't find the event you're trying to upload photos for.
            </p>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
            <Camera className="h-4 w-4" />
            SnapLoop
          </div>
          <h1 className="text-3xl font-bold mb-2">Share Your Photos</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Help capture the memories from this event by uploading your photos!
          </p>
        </div>

        {/* Event Info */}
        <Card className="max-w-2xl mx-auto mb-8">
          <CardHeader>
            <CardTitle className="text-xl">{event.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(event.date).toLocaleDateString()} at {event.time}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{event.venue}</span>
              </div>
            </div>
            {event.description && (
              <p className="text-sm text-muted-foreground mt-4 line-clamp-2">
                {event.description}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Upload Form */}
        <GuestUploadForm eventId={eventId} />

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Powered by SnapLoop • Photos are reviewed before appearing publicly
          </p>
        </div>
      </div>
    </div>
  );
}