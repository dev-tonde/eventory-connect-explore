/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface OfflineTicket {
  id: string;
  eventId: string;
  ticketNumber: string;
  qrCode: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  quantity: number;
  status: string;
  cachedAt: number;
}

/**
 * Custom hook for offline ticket access and validation.
 * Handles syncing, caching, and offline lookup.
 */
export const useOfflineTickets = () => {
  const { user } = useAuth();
  const [offlineTickets, setOfflineTickets] = useState<OfflineTicket[]>([]);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  // Listen for online/offline status changes
  useEffect(() => {
    const handleOnlineStatus = () => setIsOnline(navigator.onLine);

    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);

    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  }, []);

  // Load tickets from localStorage
  const loadOfflineTickets = useCallback(() => {
    try {
      if (!user) return;
      const stored = localStorage.getItem(`offline_tickets_${user.id}`);
      if (stored) {
        const tickets = JSON.parse(stored);
        setOfflineTickets(tickets);
      }
    } catch (error) {
      console.error("Error loading offline tickets:", error);
    }
  }, [user]);

  // Sync tickets from Supabase and cache them
  const syncTickets = useCallback(async () => {
    if (!user || !isOnline) return;

    try {
      const { data: tickets, error } = await supabase
        .from("tickets")
        .select(
          `
          id,
          event_id,
          ticket_number,
          qr_code,
          quantity,
          status,
          events (
            title,
            date,
            venue
          )
        `
        )
        .eq("user_id", user.id)
        .eq("status", "active");

      if (error) {
        console.error("Error syncing tickets:", error);
        return;
      }

      const offlineTickets: OfflineTicket[] = (tickets || []).map(
        (ticket: any) => ({
          id: ticket.id,
          eventId: ticket.event_id,
          ticketNumber: ticket.ticket_number || "",
          qrCode: ticket.qr_code || "",
          eventTitle: ticket.events?.title || "",
          eventDate: ticket.events?.date || "",
          eventVenue: ticket.events?.venue || "",
          quantity: ticket.quantity,
          status: ticket.status,
          cachedAt: Date.now(),
        })
      );

      // Store in localStorage for offline access
      localStorage.setItem(
        `offline_tickets_${user.id}`,
        JSON.stringify(offlineTickets)
      );

      setOfflineTickets(offlineTickets);

      // Optionally cache event images for offline viewing
      cacheEventImages(offlineTickets);
    } catch (error) {
      console.error("Error syncing tickets:", error);
    }
  }, [user, isOnline, cacheEventImages]);

  // Cache event images for offline viewing (optional, requires service worker)
  const cacheEventImages = useCallback(async (tickets: OfflineTicket[]) => {
    if (!("serviceWorker" in navigator)) return;

    const imageUrls = tickets
      .map((ticket) => `/api/events/${ticket.eventId}/image`)
      .filter(Boolean);

    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "CACHE_IMAGES",
        urls: imageUrls,
      });
    }
  }, []);

  // Load offline tickets on mount and when user changes
  useEffect(() => {
    loadOfflineTickets();
  }, [loadOfflineTickets]);

  // Sync tickets when online
  useEffect(() => {
    if (isOnline) {
      syncTickets();
    }
  }, [isOnline, syncTickets]);

  // Find ticket by QR code
  const getTicketByQR = useCallback(
    (qrData: string) =>
      offlineTickets.find((ticket) => ticket.qrCode === qrData),
    [offlineTickets]
  );

  // Validate ticket (online if possible, otherwise offline)
  const validateTicket = useCallback(
    async (ticketId: string) => {
      if (isOnline) {
        try {
          const { data, error } = await supabase
            .from("tickets")
            .select("status")
            .eq("id", ticketId)
            .single();

          if (error) throw error;
          return data.status === "active";
        } catch {
          return false;
        }
      } else {
        const ticket = offlineTickets.find((t) => t.id === ticketId);
        return ticket?.status === "active";
      }
    },
    [isOnline, offlineTickets]
  );

  return {
    offlineTickets,
    isOnline,
    syncTickets,
    getTicketByQR,
    validateTicket,
    loadOfflineTickets,
  };
};
