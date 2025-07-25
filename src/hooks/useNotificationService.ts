import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'ticket_purchase' | 'event_reminder' | 'community';
  eventId?: string;
}

export function useNotificationService() {
  const { user } = useAuth();

  const createNotification = async (params: CreateNotificationParams) => {
    try {
      const { error } = await supabase.functions.invoke('send-notification', {
        body: {
          userId: params.userId,
          title: params.title,
          message: params.message,
          type: params.type || 'info',
          eventId: params.eventId,
        },
      });

      if (error) throw error;
      
      console.log('Notification created successfully');
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  };

  // Send welcome notification
  const sendWelcomeNotification = async (userId: string, userName: string) => {
    return createNotification({
      userId,
      title: 'Welcome to Eventory!',
      message: `Hi ${userName}, welcome to Eventory! Discover amazing events near you.`,
      type: 'success',
    });
  };

  // Send ticket purchase notification
  const sendTicketPurchaseNotification = async (
    userId: string,
    eventTitle: string,
    quantity: number
  ) => {
    return createNotification({
      userId,
      title: 'Ticket Purchase Confirmed',
      message: `Your ${quantity} ticket${quantity > 1 ? 's' : ''} for "${eventTitle}" ${quantity > 1 ? 'have' : 'has'} been confirmed!`,
      type: 'ticket_purchase',
    });
  };

  // Send event reminder notification
  const sendEventReminderNotification = async (
    userId: string,
    eventTitle: string,
    eventId: string
  ) => {
    return createNotification({
      userId,
      title: 'Event Reminder',
      message: `"${eventTitle}" is starting soon! Don't forget to attend.`,
      type: 'event_reminder',
      eventId,
    });
  };

  // Send community notification
  const sendCommunityNotification = async (
    userId: string,
    title: string,
    message: string
  ) => {
    return createNotification({
      userId,
      title,
      message,
      type: 'community',
    });
  };

  return {
    createNotification,
    sendWelcomeNotification,
    sendTicketPurchaseNotification,
    sendEventReminderNotification,
    sendCommunityNotification,
  };
}