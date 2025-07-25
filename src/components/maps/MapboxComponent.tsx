import { useState, useEffect, useCallback, useRef } from "react";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { Event } from "@/types/event";
import { supabase } from "@/integrations/supabase/client";

interface MapboxComponentProps {
  events: Event[];
  selectedEvent?: Event | null;
  onEventSelect?: (event: Event) => void;
  className?: string;
  center?: { lat: number; lng: number };
}

// Fallback coordinates for Cape Town
const DEFAULT_CENTER = { lat: -33.9249, lng: 18.4241 };

const MapboxComponent = ({
  events,
  selectedEvent,
  onEventSelect,
  className = "",
  center = DEFAULT_CENTER
}: MapboxComponentProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapCenter, setMapCenter] = useState(center);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

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
        if (map.current) {
          map.current.setCenter([location.lng, location.lat]);
        }
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

  // Parse coordinates from event data
  const parseCoordinates = (event: Event) => {
    // Simple geocoding for major cities
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

  // Initialize Mapbox
  useEffect(() => {
    const initializeMap = async () => {
      if (!mapContainer.current) return;

      try {
        // Get Mapbox token from edge function
        const { data, error } = await supabase.functions.invoke('mapbox-config');
        
        if (error || !data?.accessToken) {
          console.error('Failed to get Mapbox token:', error);
          return;
        }

        mapboxgl.accessToken = data.accessToken;

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [mapCenter.lng, mapCenter.lat],
          zoom: 10
        });

        // Add navigation controls
        map.current.addControl(
          new mapboxgl.NavigationControl({
            visualizePitch: true,
          }),
          'top-right'
        );

        map.current.on('load', () => {
          setIsMapLoaded(true);
        });

        // Auto-get location on mount
        getCurrentLocation();

      } catch (error) {
        console.error('Error initializing Mapbox:', error);
      }
    };

    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [mapCenter.lat, mapCenter.lng, getCurrentLocation]);

  // Add event markers
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add event markers
    eventsWithCoords.forEach((event, index) => {
      if (!event.coordinates) return;

      const el = document.createElement('div');
      el.className = 'w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg cursor-pointer flex items-center justify-center text-white text-xs font-bold hover:scale-110 transition-transform';
      el.textContent = (index + 1).toString();
      el.addEventListener('click', () => onEventSelect?.(event));

      const marker = new mapboxgl.Marker(el)
        .setLngLat([event.coordinates.lng, event.coordinates.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <h4 class="font-semibold text-sm">${event.title}</h4>
                <p class="text-xs text-gray-600">${event.location}</p>
                <p class="text-xs font-semibold text-purple-600 mt-1">
                  ${Number(event.price) === 0 ? "Free" : `R${Number(event.price).toFixed(2)}`}
                </p>
              </div>
            `)
        )
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    // Add user location marker if available
    if (userLocation && map.current) {
      const userEl = document.createElement('div');
      userEl.className = 'w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg';
      
      const userMarker = new mapboxgl.Marker(userEl)
        .setLngLat([userLocation.lng, userLocation.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML('<div class="p-2"><h4 class="font-semibold text-sm">Your Location</h4></div>')
        )
        .addTo(map.current);

      markersRef.current.push(userMarker);
    }

    // Fit map to show all events
    if (eventsWithCoords.length > 0 && map.current) {
      const bounds = new mapboxgl.LngLatBounds();
      eventsWithCoords.forEach(event => {
        if (event.coordinates) {
          bounds.extend([event.coordinates.lng, event.coordinates.lat]);
        }
      });
      
      if (userLocation) {
        bounds.extend([userLocation.lng, userLocation.lat]);
      }

      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    }
  }, [eventsWithCoords, userLocation, isMapLoaded, onEventSelect]);

  return (
    <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`}>
      {/* Map Container */}
      <div ref={mapContainer} className="aspect-video" />

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
            <MapPin className="h-4 w-4 text-primary" />
            <span>{eventsWithCoords.length} Events</span>
          </div>
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

      {/* Loading State */}
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapboxComponent;