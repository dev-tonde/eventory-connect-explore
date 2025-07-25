import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface OfflineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  address?: string;
  image_url?: string;
  category: string;
  price: number;
  organizer_id: string;
  location_coordinates?: [number, number];
  lineup?: OfflineLineupItem[];
  photos?: OfflinePhoto[];
}

export interface OfflineLineupItem {
  id: string;
  artist_name: string;
  start_time: string;
  end_time: string;
  stage_name?: string;
  description?: string;
}

export interface OfflinePhoto {
  id: string;
  image_url: string;
  thumbnail_url?: string;
  caption?: string;
  uploaded_by?: string;
  created_at: string;
}

export interface OfflineEventData {
  events: OfflineEvent[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  isOnline: boolean;
  syncData: () => Promise<void>;
  getEventById: (id: string) => OfflineEvent | null;
}

/**
 * Hook to manage offline event data including lineup and photos
 */
export const useOfflineEventData = (): OfflineEventData => {
  const [events, setEvents] = useState<OfflineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { user } = useAuth();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Load events from localStorage on mount
  useEffect(() => {
    const loadOfflineEvents = () => {
      try {
        const stored = localStorage.getItem("offline-events");
        if (stored) {
          const offlineEvents: OfflineEvent[] = JSON.parse(stored);
          setEvents(offlineEvents);
        }
      } catch (err) {
        console.error("Error loading offline events:", err);
        setError("Failed to load offline events");
      } finally {
        setIsLoading(false);
      }
    };

    loadOfflineEvents();
  }, []);

  // Cache event images for offline viewing
  const cacheEventAssets = useCallback(async (events: OfflineEvent[]) => {
    if (!("serviceWorker" in navigator) || !("caches" in window)) return;

    try {
      const imageUrls: string[] = [];
      
      events.forEach(event => {
        if (event.image_url) imageUrls.push(event.image_url);
        event.photos?.forEach(photo => {
          if (photo.image_url) imageUrls.push(photo.image_url);
          if (photo.thumbnail_url) imageUrls.push(photo.thumbnail_url);
        });
      });

      if (imageUrls.length > 0) {
        const cache = await caches.open("event-assets");
        await Promise.allSettled(
          imageUrls.map(url => 
            fetch(url).then(response => {
              if (response.ok) return cache.put(url, response);
            }).catch(err => console.log('Failed to cache:', url, err))
          )
        );
      }
    } catch (error) {
      console.error("Error caching event assets:", error);
    }
  }, []);

  // Fetch and sync event data with lineup and photos
  const refreshData = useCallback(async () => {
    if (!isOnline) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch events with related data
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select(`
          *,
          event_lineup (*),
          snaploop_uploads (
            id,
            image_url,
            thumbnail_url,
            caption,
            uploaded_by,
            created_at
          )
        `)
        .eq("is_active", true)
        .gte("date", new Date().toISOString().split('T')[0]) // Future events only
        .order("date", { ascending: true })
        .limit(50); // Limit for performance

      if (eventsError) throw eventsError;

      const offlineEvents: OfflineEvent[] = (eventsData || []).map(event => ({
        id: event.id,
        title: event.title,
        description: event.description || "",
        date: event.date,
        time: event.time,
        venue: event.venue,
        address: event.address,
        image_url: event.image_url,
        category: event.category,
        price: Number(event.price),
        organizer_id: event.organizer_id,
        location_coordinates: event.location_coordinates && 
          typeof event.location_coordinates === 'object' &&
          'x' in event.location_coordinates && 
          'y' in event.location_coordinates ? 
          [Number(event.location_coordinates.x), Number(event.location_coordinates.y)] : 
          undefined,
        lineup: event.event_lineup?.map((item: any) => ({
          id: item.id,
          artist_name: item.artist_name,
          start_time: item.start_time,
          end_time: item.end_time,
          stage_name: item.stage_name,
          description: item.description,
        })) || [],
        photos: event.snaploop_uploads?.filter((upload: any) => upload.approved).map((upload: any) => ({
          id: upload.id,
          image_url: upload.image_url,
          thumbnail_url: upload.thumbnail_url,
          caption: upload.caption,
          uploaded_by: upload.uploaded_by,
          created_at: upload.created_at,
        })) || [],
      }));

      setEvents(offlineEvents);
      localStorage.setItem("offline-events", JSON.stringify(offlineEvents));
      
      // Cache assets for offline viewing
      await cacheEventAssets(offlineEvents);
    } catch (err) {
      console.error("Error syncing event data:", err);
      setError("Failed to sync event data");
    } finally {
      setIsLoading(false);
    }
  }, [isOnline, cacheEventAssets]);

  // Sync data when connection is restored
  const syncData = useCallback(async () => {
    if (isOnline) {
      await refreshData();
    }
  }, [isOnline, refreshData]);

  // Get event by ID
  const getEventById = useCallback((id: string): OfflineEvent | null => {
    return events.find(event => event.id === id) || null;
  }, [events]);

  // Auto-sync when online status changes
  useEffect(() => {
    if (isOnline) {
      refreshData();
    }
  }, [isOnline, refreshData]);

  return {
    events,
    isLoading,
    error,
    refreshData,
    isOnline,
    syncData,
    getEventById,
  };
};