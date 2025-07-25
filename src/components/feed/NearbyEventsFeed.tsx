import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Camera, Heart, Clock, RefreshCw } from "lucide-react";
import { useNearbyEvents } from "@/hooks/useNearbyEvents";
import { formatDistanceToNow } from "date-fns";

export function NearbyEventsFeed() {
  const { nearbyEvents, isLoading, error, refetch, currentLocation } = useNearbyEvents();

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />
            <h3 className="text-lg font-medium">Location needed</h3>
            <p className="text-sm text-muted-foreground">
              Enable location access to see nearby events
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Nearby Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-20 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (nearbyEvents.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Nearby Events
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <Clock className="mx-auto h-8 w-8 text-muted-foreground" />
            <h3 className="text-lg font-medium">No events nearby</h3>
            <p className="text-sm text-muted-foreground">
              No events happening within 50km right now
            </p>
            {currentLocation && (
              <p className="text-xs text-muted-foreground">
                Searching near {currentLocation.city || 'your location'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Nearby Events ({nearbyEvents.length})
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {nearbyEvents.map((event) => (
          <Card key={event.event_id} className="border border-border/50">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Event Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{event.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {event.venue}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {event.distance_km}km away
                      </Badge>
                      {event.photo_count > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <Camera className="h-3 w-3 mr-1" />
                          {event.photo_count} photos
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Mood Indicator */}
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-background"
                    style={{ backgroundColor: event.mood_color }}
                    title="Current event mood"
                  />
                </div>

                {/* Recent Photos */}
                {event.recent_photos.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Recent photos
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {event.recent_photos.slice(0, 3).map((photo) => (
                        <div key={photo.id} className="aspect-square relative group cursor-pointer">
                          <img
                            src={photo.thumbnail_url || photo.image_url}
                            alt={photo.caption || "Event photo"}
                            className="w-full h-full object-cover rounded-md"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-md" />
                          {photo.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1 rounded-b-md">
                              <p className="text-white text-xs truncate">
                                {photo.caption}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Photo metadata */}
                    {event.recent_photos[0] && (
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>by {event.recent_photos[0].uploaded_by || 'Guest'}</span>
                        <span>
                          {formatDistanceToNow(new Date(event.recent_photos[0].created_at), { addSuffix: true })}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* View Event Button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => window.open(`/event/${event.event_id}`, '_blank')}
                >
                  View Event
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {currentLocation && (
          <p className="text-xs text-muted-foreground text-center">
            Showing events within 50km of {currentLocation.city || 'your location'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}