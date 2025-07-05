import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SMSTemplate {
  to: string;
  message: string;
  template?: 'event_reminder' | 'ticket_confirmation' | 'event_update' | 'verification';
  template_data?: Record<string, any>;
}

export function useSMSNotification() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendSMS = async (smsData: SMSTemplate) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('twilio-sms', {
        body: smsData,
      });

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to send SMS';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const sendEventReminderSMS = async (
    to: string,
    userName: string,
    eventTitle: string,
    eventDate: string,
    eventTime: string,
    eventVenue: string
  ) => {
    return sendSMS({
      to,
      message: '',
      template: 'event_reminder',
      template_data: {
        user_name: userName,
        event_title: eventTitle,
        event_date: eventDate,
        event_time: eventTime,
        event_venue: eventVenue
      }
    });
  };

  const sendTicketConfirmationSMS = async (
    to: string,
    eventTitle: string,
    eventDate: string,
    eventTime: string,
    ticketNumber: string,
    totalPrice: number
  ) => {
    return sendSMS({
      to,
      message: '',
      template: 'ticket_confirmation',
      template_data: {
        event_title: eventTitle,
        event_date: eventDate,
        event_time: eventTime,
        ticket_number: ticketNumber,
        total_price: totalPrice
      }
    });
  };

  const sendEventUpdateSMS = async (
    to: string,
    eventTitle: string,
    updateMessage: string
  ) => {
    return sendSMS({
      to,
      message: '',
      template: 'event_update',
      template_data: {
        event_title: eventTitle,
        update_message: updateMessage
      }
    });
  };

  const sendVerificationSMS = async (to: string, code: string) => {
    return sendSMS({
      to,
      message: '',
      template: 'verification',
      template_data: { code }
    });
  };

  return {
    sendSMS,
    sendEventReminderSMS,
    sendTicketConfirmationSMS,
    sendEventUpdateSMS,
    sendVerificationSMS,
    isLoading,
    error,
  };
}