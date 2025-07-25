import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailTemplate {
  to: string;
  subject: string;
  template: 'welcome' | 'event_reminder' | 'ticket_confirmation' | 'event_update';
  data: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { to, subject, template, data }: EmailTemplate = await req.json();

    if (!to || !subject || !template) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, template' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate email content based on template
    const emailContent = generateEmailContent(template, data);

    // Store email in database for tracking
    const { error: dbError } = await supabase
      .from('email_notifications')
      .insert({
        recipient_email: to,
        subject,
        content: emailContent,
        email_type: template,
        template_data: data,
        status: 'sent',
      });

    if (dbError) {
      console.error('Database error:', dbError);
    }

    console.log(`Email template ${template} processed for ${to}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email template processed successfully',
        content: emailContent 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in send-email-template function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function generateEmailContent(template: string, data: Record<string, any>): string {
  switch (template) {
    case 'welcome':
      return `
        <h1>Welcome to Eventory, ${data.name || 'User'}!</h1>
        <p>We're excited to have you join our community of event enthusiasts.</p>
        <p>Discover amazing events, connect with others, and create unforgettable memories.</p>
        <p>Happy exploring!</p>
        <p>The Eventory Team</p>
      `;
    
    case 'event_reminder':
      return `
        <h1>Event Reminder: ${data.event_title}</h1>
        <p>Hi ${data.user_name},</p>
        <p>This is a friendly reminder that "${data.event_title}" is happening soon!</p>
        <p><strong>Date:</strong> ${data.event_date}</p>
        <p><strong>Time:</strong> ${data.event_time}</p>
        <p><strong>Venue:</strong> ${data.event_venue}</p>
        ${data.event_address ? `<p><strong>Address:</strong> ${data.event_address}</p>` : ''}
        <p>We can't wait to see you there!</p>
      `;
    
    case 'ticket_confirmation':
      return `
        <h1>Ticket Confirmation - ${data.event_title}</h1>
        <p>Hi ${data.user_name},</p>
        <p>Your ticket purchase has been confirmed!</p>
        <p><strong>Event:</strong> ${data.event_title}</p>
        <p><strong>Ticket Number:</strong> ${data.ticket_number}</p>
        <p><strong>Quantity:</strong> ${data.quantity}</p>
        <p><strong>Total Price:</strong> R${data.total_price}</p>
        <p><strong>Date:</strong> ${data.event_date}</p>
        <p><strong>Time:</strong> ${data.event_time}</p>
        <p><strong>Venue:</strong> ${data.event_venue}</p>
        <p>Please keep this email as your receipt. Show your QR code at the event entrance.</p>
      `;
    
    case 'event_update':
      return `
        <h1>Event Update: ${data.event_title}</h1>
        <p>Hi ${data.user_name},</p>
        <p>There's an important update about "${data.event_title}":</p>
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          ${data.update_message}
        </div>
        <p><strong>Date:</strong> ${data.event_date}</p>
        <p><strong>Time:</strong> ${data.event_time}</p>
        <p><strong>Venue:</strong> ${data.event_venue}</p>
        <p>Thank you for your understanding.</p>
      `;
    
    default:
      return `
        <h1>${data.subject || 'Notification from Eventory'}</h1>
        <p>${data.message || 'Thank you for using Eventory!'}</p>
      `;
  }
}