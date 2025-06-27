
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

export const useOfflineTickets = () => {
  const { user } = useAuth();
  const [offlineTickets, setOfflineTickets] = useState<OfflineTicket[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  // Load tickets from IndexedDB
  const loadOfflineTickets = useCallback(async () => {
    try {
      const stored = localStorage.getItem(`offline_tickets_${user?.id}`);
      if (stored) {
        const tickets = JSON.parse(stored);
        setOfflineTickets(tickets);
      }
    } catch (error) {
      console.error('Error loading offline tickets:', error);
    }
  }, [user?.id]);

  // Sync tickets when online
  const syncTickets = useCallback(async () => {
    if (!user || !isOnline) return;

    try {
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select(`
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
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (error) throw error;

      const offlineTickets: OfflineTicket[] = tickets?.map((ticket: any) => ({
        id: ticket.id,
        eventId: ticket.event_id,
        ticketNumber: ticket.ticket_number || '',
        qrCode: ticket.qr_code || '',
        eventTitle: ticket.events?.title || '',
        eventDate: ticket.events?.date || '',
        eventVenue: ticket.events?.venue || '',
        quantity: ticket.quantity,
        status: ticket.status,
        cachedAt: Date.now(),
      })) || [];

      // Store in localStorage for offline access
      localStorage.setItem(
        `offline_tickets_${user.id}`,
        JSON.stringify(offlineTickets)
      );
      
      setOfflineTickets(offlineTickets);
    } catch (error) {
      console.error('Error syncing tickets:', error);
    }
  }, [user, isOnline]);

  // Cache event images for offline viewing
  const cacheEventImages = useCallback(async (tickets: OfflineTicket[]) => {
    if (!('serviceWorker' in navigator)) return;

    const imageUrls = tickets
      .map(ticket => `/api/events/${ticket.eventId}/image`)
      .filter(Boolean);

    // Request service worker to cache images
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_IMAGES',
        urls: imageUrls,
      });
    }
  }, []);

  useEffect(() => {
    loadOfflineTickets();
  }, [loadOfflineTickets]);

  useEffect(() => {
    if (isOnline) {
      syncTickets();
    }
  }, [isOnline, syncTickets]);

  const getTicketByQR = useCallback((qrData: string) => {
    return offlineTickets.find(ticket => ticket.qrCode === qrData);
  }, [offlineTickets]);

  const validateTicket = useCallback(async (ticketId: string) => {
    if (isOnline) {
      // Online validation
      try {
        const { data, error } = await supabase
          .from('tickets')
          .select('status')
          .eq('id', ticketId)
          .single();

        if (error) throw error;
        return data.status === 'active';
      } catch {
        return false;
      }
    } else {
      // Offline validation
      const ticket = offlineTickets.find(t => t.id === ticketId);
      return ticket?.status === 'active';
    }
  }, [isOnline, offlineTickets]);

  return {
    offlineTickets,
    isOnline,
    syncTickets,
    getTicketByQR,
    validateTicket,
    loadOfflineTickets,
  };
};
