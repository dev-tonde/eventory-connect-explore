import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EmailTemplate {
  to: string;
  subject: string;
  content: string;
  template?: 'welcome' | 'event_reminder' | 'ticket_confirmation' | 'event_update';
  template_data?: Record<string, any>;
}

export function useEmailNotification() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendEmail = async (emailData: EmailTemplate) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('sendgrid-email', {
        body: emailData,
      });

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to send email';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const sendWelcomeEmail = async (to: string, name: string) => {
    return sendEmail({
      to,
      subject: `Welcome to EventPlatform, ${name}!`,
      content: '',
      template: 'welcome',
      template_data: { name }
    });
  };

  const sendEventReminderEmail = async (
    to: string, 
    userName: string, 
    eventTitle: string,
    eventDate: string,
    eventTime: string,
    eventVenue: string,
    eventAddress?: string
  ) => {
    return sendEmail({
      to,
      subject: `Reminder: ${eventTitle} is tomorrow!`,
      content: '',
      template: 'event_reminder',
      template_data: {
        user_name: userName,
        event_title: eventTitle,
        event_date: eventDate,
        event_time: eventTime,
        event_venue: eventVenue,
        event_address: eventAddress
      }
    });
  };

  const sendTicketConfirmationEmail = async (
    to: string,
    userName: string,
    eventTitle: string,
    ticketNumber: string,
    quantity: number,
    totalPrice: number,
    eventDate: string,
    eventTime: string,
    eventVenue: string
  ) => {
    return sendEmail({
      to,
      subject: `Ticket Confirmation - ${eventTitle}`,
      content: '',
      template: 'ticket_confirmation',
      template_data: {
        user_name: userName,
        event_title: eventTitle,
        ticket_number: ticketNumber,
        quantity,
        total_price: totalPrice,
        event_date: eventDate,
        event_time: eventTime,
        event_venue: eventVenue
      }
    });
  };

  const sendEventUpdateEmail = async (
    to: string,
    userName: string,
    eventTitle: string,
    updateMessage: string,
    eventDate: string,
    eventTime: string,
    eventVenue: string
  ) => {
    return sendEmail({
      to,
      subject: `Event Update: ${eventTitle}`,
      content: '',
      template: 'event_update',
      template_data: {
        user_name: userName,
        event_title: eventTitle,
        update_message: updateMessage,
        event_date: eventDate,
        event_time: eventTime,
        event_venue: eventVenue
      }
    });
  };

  return {
    sendEmail,
    sendWelcomeEmail,
    sendEventReminderEmail,
    sendTicketConfirmationEmail,
    sendEventUpdateEmail,
    isLoading,
    error,
  };
}