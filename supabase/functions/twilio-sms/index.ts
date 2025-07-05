import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SMSRequest {
  to: string;
  message: string;
  template?: 'event_reminder' | 'ticket_confirmation' | 'event_update' | 'verification';
  template_data?: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }

  try {
    const { to, message, template, template_data }: SMSRequest = await req.json();

    if (!to || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, message' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Get Twilio credentials from environment
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      throw new Error('Twilio credentials not configured');
    }

    // Prepare SMS content based on template
    let smsMessage = message;

    if (template && template_data) {
      switch (template) {
        case 'event_reminder':
          smsMessage = `Hi ${template_data.user_name}! Reminder: "${template_data.event_title}" is ${template_data.event_date} at ${template_data.event_time}. Venue: ${template_data.event_venue}. See you there!`;
          break;
        case 'ticket_confirmation':
          smsMessage = `Ticket confirmed! ${template_data.event_title} - ${template_data.event_date} at ${template_data.event_time}. Ticket #${template_data.ticket_number}. Total: R${template_data.total_price}`;
          break;
        case 'event_update':
          smsMessage = `Event Update: ${template_data.event_title} - ${template_data.update_message}`;
          break;
        case 'verification':
          smsMessage = `Your EventPlatform verification code is: ${template_data.code}. This code expires in 10 minutes.`;
          break;
      }
    }

    // Send SMS via Twilio
    const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: to,
          From: twilioPhoneNumber,
          Body: smsMessage,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Twilio API error:', errorData);
      throw new Error(`Twilio API error: ${response.status} - ${errorData.message}`);
    }

    const responseData = await response.json();
    console.log('SMS sent successfully:', responseData.sid);

    // Log SMS to database (you might want to create an sms_notifications table)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // For now, we'll log to a generic notifications table
    // You might want to create a specific sms_notifications table later
    console.log('SMS logged - recipient:', to, 'message length:', smsMessage.length);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SMS sent successfully',
        sid: responseData.sid 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error) {
    console.error('Error in twilio-sms function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send SMS', details: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

serve(handler);