import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { Event } from "@/types/event";

interface GoogleMapComponentProps {
  events: Event[];
  selectedEvent?: Event | null;
  onEventSelect?: (event: Event) => void;
  className?: string;
  center?: { lat: number; lng: number };
}

// Fallback coordinates for Cape Town
const DEFAULT_CENTER = { lat: -33.9249, lng: 18.4241 };

const GoogleMapComponent = ({
  events,
  selectedEvent,
  onEventSelect,
  className = "",
  center = DEFAULT_CENTER
}: GoogleMapComponentProps) => {
  const [mapCenter, setMapCenter] = useState(center);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Get user's current location
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser");
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(location);
        setMapCenter(location);
        setIsLoadingLocation(false);
      },
      (error) => {
        console.warn("Error getting location:", error);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  }, []);

  // Auto-get location on mount
  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  // Parse coordinates from event data
  const parseCoordinates = (event: Event) => {
    // Fallback: simple geocoding for major cities
    const geocodeMap: { [key: string]: { lat: number; lng: number } } = {
      "cape town": { lat: -33.9249, lng: 18.4241 },
      "johannesburg": { lat: -26.2041, lng: 28.0473 },
      "durban": { lat: -29.8587, lng: 31.0218 },
      "pretoria": { lat: -25.7479, lng: 28.2293 },
      "port elizabeth": { lat: -33.9608, lng: 25.6022 },
      "stellenbosch": { lat: -33.9321, lng: 18.8602 },
      "bloemfontein": { lat: -29.0852, lng: 26.1596 }
    };

    const location = event.location?.toLowerCase() || "";
    const address = event.address?.toLowerCase() || "";
    
    for (const [city, coords] of Object.entries(geocodeMap)) {
      if (location.includes(city) || address.includes(city)) {
        return coords;
      }
    }

    return null;
  };

  // Filter events that have valid coordinates
  const eventsWithCoords = events
    .map(event => ({
      ...event,
      coordinates: parseCoordinates(event)
    }))
    .filter(event => event.coordinates !== null);

  // Calculate bounds to fit all events
  const getBounds = () => {
    if (eventsWithCoords.length === 0) return null;

    let minLat = eventsWithCoords[0].coordinates!.lat;
    let maxLat = eventsWithCoords[0].coordinates!.lat;
    let minLng = eventsWithCoords[0].coordinates!.lng;
    let maxLng = eventsWithCoords[0].coordinates!.lng;

    eventsWithCoords.forEach(event => {
      const { lat, lng } = event.coordinates!;
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    });

    return { minLat, maxLat, minLng, maxLng };
  };

  const bounds = getBounds();

  // Mock map since we don't have Google Maps API integrated
  return (
    <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`}>
      {/* Mock Map Interface */}
      <div className="aspect-video bg-gradient-to-br from-blue-100 to-green-100 relative">
        {/* Map Controls */}
        <div className="absolute top-4 right-4 space-y-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={getCurrentLocation}
            disabled={isLoadingLocation}
            className="shadow-lg"
          >
            {isLoadingLocation ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            {isLoadingLocation ? "Finding..." : "My Location"}
          </Button>
        </div>

        {/* Mock Map Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-8 bg-white/80 rounded-lg backdrop-blur-sm">
            <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Interactive Map View</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {eventsWithCoords.length} events with location data
            </p>
            {userLocation && (
              <Badge variant="outline" className="mb-2">
                📍 Your location detected
              </Badge>
            )}
          </div>
        </div>

        {/* Event Pins */}
        {eventsWithCoords.map((event, index) => (
          <div
            key={event.id}
            className="absolute w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
            style={{
              left: `${20 + (index % 5) * 15}%`,
              top: `${30 + Math.floor(index / 5) * 20}%`
            }}
            onClick={() => onEventSelect?.(event)}
            title={event.title}
          >
            <div className="w-full h-full bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {index + 1}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Event Info */}
      {selectedEvent && (
        <Card className="absolute bottom-4 left-4 right-4 p-4 shadow-lg bg-white/95 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={selectedEvent.image || "/placeholder.svg"}
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">
                {selectedEvent.title}
              </h4>
              <p className="text-xs text-muted-foreground">
                {selectedEvent.location}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {selectedEvent.category}
                </Badge>
                <span className="text-xs font-semibold text-primary">
                  {Number(selectedEvent.price) === 0
                    ? "Free"
                    : `R${Number(selectedEvent.price).toFixed(2)}`}
                </span>
              </div>
            </div>
            <Button size="sm" asChild>
              <a href={`/event/${selectedEvent.id}`}>
                View
              </a>
            </Button>
          </div>
        </Card>
      )}

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Event Location</span>
          </div>
          {userLocation && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Your Location</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleMapComponent;