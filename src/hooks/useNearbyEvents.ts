import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEnhancedGeolocation } from "@/hooks/useEnhancedGeolocation";

interface NearbyEvent {
  event_id: string;
  title: string;
  venue: string;
  event_date: string;
  event_time: string;
  distance_km: number;
  mood_color: string;
  photo_count: number;
  recent_photos: Array<{
    id: string;
    image_url: string;
    thumbnail_url: string | null;
    caption: string | null;
    uploaded_by: string | null;
    created_at: string;
  }>;
}

export function useNearbyEvents() {
  const { currentLocation, getCurrentLocation, isLoading: locationLoading } = useEnhancedGeolocation();
  const [refreshInterval] = useState(30000); // Refresh every 30 seconds

  const { data: nearbyEvents, isLoading, error, refetch } = useQuery({
    queryKey: ["nearby-events", currentLocation?.latitude, currentLocation?.longitude],
    queryFn: async () => {
      if (!currentLocation?.latitude || !currentLocation?.longitude) {
        throw new Error("Location not available");
      }

      // Get events within 50km
      const { data: events, error: eventsError } = await supabase
        .rpc('get_events_within_radius', {
          user_lat: currentLocation.latitude,
          user_lng: currentLocation.longitude,
          radius_km: 50
        });

      if (eventsError) throw eventsError;

      if (!events || events.length === 0) {
        return [];
      }

      // Get recent photos for each event
      const eventsWithPhotos = await Promise.all(
        events.map(async (event) => {
          const { data: photos } = await supabase
            .from('snaploop_uploads')
            .select('id, image_url, thumbnail_url, caption, uploaded_by, created_at')
            .eq('event_id', event.event_id)
            .eq('approved', true)
            .order('created_at', { ascending: false })
            .limit(3);

          return {
            ...event,
            recent_photos: photos || []
          };
        })
      );

      return eventsWithPhotos as NearbyEvent[];
    },
    enabled: !!currentLocation?.latitude && !!currentLocation?.longitude,
    refetchInterval: refreshInterval,
    staleTime: 30000, // Consider data stale after 30 seconds
  });

  // Auto-refresh location and data
  useEffect(() => {
    if (!currentLocation && !locationLoading) {
      getCurrentLocation();
    }
  }, [currentLocation, locationLoading, getCurrentLocation]);

  return {
    nearbyEvents: nearbyEvents || [],
    isLoading: locationLoading || isLoading,
    error,
    refetch,
    currentLocation
  };
}