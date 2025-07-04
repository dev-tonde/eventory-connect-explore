import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface OfflineTicket {
  id: string;
  ticketNumber: string;
  qrCode: string;
  event: {
    id: string;
    title: string;
    date: string;
    time: string;
    venue: string;
    image_url?: string;
  } | null;
  purchaseDate: string;
  quantity: number;
  totalPrice: number;
}

export interface OfflineTicketsData {
  tickets: OfflineTicket[];
  isLoading: boolean;
  error: string | null;
  refreshTickets: () => Promise<void>;
  isOnline: boolean;
}

/**
 * Hook to manage offline ticket storage and sync with online data.
 */
export const useOfflineTickets = (): OfflineTicketsData => {
  const [tickets, setTickets] = useState<OfflineTicket[]>([]);
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

  // Load tickets from localStorage on mount
  useEffect(() => {
    const loadOfflineTickets = () => {
      try {
        const stored = localStorage.getItem("offline-tickets");
        if (stored) {
          const offlineTickets: OfflineTicket[] = JSON.parse(stored);
          setTickets(offlineTickets);
        }
      } catch (err) {
        console.error("Error loading offline tickets:", err);
        setError("Failed to load offline tickets");
      } finally {
        setIsLoading(false);
      }
    };

    loadOfflineTickets();
  }, []);

  // Cache event images for offline viewing
  const cacheEventImages = useCallback(async (tickets: OfflineTicket[]) => {
    if (!("serviceWorker" in navigator)) return;

    try {
      const imageUrls = tickets
        .map(ticket => ticket.event?.image_url)
        .filter((url): url is string => Boolean(url));

      if (imageUrls.length > 0 && "caches" in window) {
        const cache = await caches.open("event-images");
        await Promise.allSettled(imageUrls.map(url => cache.add(url)));
      }
    } catch (error) {
      console.error("Error caching event images:", error);
    }
  }, []);

  // Sync tickets with online data
  const refreshTickets = useCallback(async () => {
    if (!user || !isOnline) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          *,
          events (
            id,
            title,
            date,
            time,
            venue,
            image_url
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "active");

      if (error) throw error;

      const offlineTickets: OfflineTicket[] = (data || []).map(ticket => ({
        id: ticket.id,
        ticketNumber: ticket.ticket_number || "",
        qrCode: ticket.qr_code || "",
        event: ticket.events ? {
          id: ticket.events.id,
          title: ticket.events.title,
          date: ticket.events.date,
          time: ticket.events.time,
          venue: ticket.events.venue,
          image_url: ticket.events.image_url
        } : null,
        purchaseDate: ticket.purchase_date || new Date().toISOString(),
        quantity: ticket.quantity,
        totalPrice: Number(ticket.total_price)
      }));

      setTickets(offlineTickets);
      localStorage.setItem("offline-tickets", JSON.stringify(offlineTickets));
      
      // Cache images for offline viewing
      await cacheEventImages(offlineTickets);
    } catch (err) {
      console.error("Error syncing tickets:", err);
      setError("Failed to sync tickets");
    } finally {
      setIsLoading(false);
    }
  }, [user, isOnline, cacheEventImages]);

  // Auto-sync when user or online status changes
  useEffect(() => {
    if (user && isOnline) {
      refreshTickets();
    }
  }, [user, isOnline, refreshTickets]);

  return {
    tickets,
    isLoading,
    error,
    refreshTickets,
    isOnline,
  };
};