import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  content: string;
  template?: 'welcome' | 'event_reminder' | 'ticket_confirmation' | 'event_update';
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
    const { to, subject, content, template, template_data }: EmailRequest = await req.json();

    if (!to || !subject || !content) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, content' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Get SendGrid API key from environment
    const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY');
    if (!sendgridApiKey) {
      throw new Error('SendGrid API key not configured');
    }

    // Prepare email content based on template
    let emailContent = content;
    let emailSubject = subject;

    if (template && template_data) {
      switch (template) {
        case 'welcome':
          emailSubject = `Welcome to EventPlatform, ${template_data.name}!`;
          emailContent = `
            <h1>Welcome to EventPlatform!</h1>
            <p>Hi ${template_data.name},</p>
            <p>Welcome to our event platform! We're excited to have you join our community.</p>
            <p>You can now:</p>
            <ul>
              <li>Discover amazing events in your area</li>
              <li>Create and organize your own events</li>
              <li>Connect with like-minded people</li>
            </ul>
            <p>Get started by exploring our events page!</p>
            <p>Best regards,<br>The EventPlatform Team</p>
          `;
          break;
        case 'event_reminder':
          emailSubject = `Reminder: ${template_data.event_title} is tomorrow!`;
          emailContent = `
            <h1>Event Reminder</h1>
            <p>Hi ${template_data.user_name},</p>
            <p>This is a friendly reminder that you have an upcoming event:</p>
            <div style="border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px;">
              <h2>${template_data.event_title}</h2>
              <p><strong>Date:</strong> ${template_data.event_date}</p>
              <p><strong>Time:</strong> ${template_data.event_time}</p>
              <p><strong>Venue:</strong> ${template_data.event_venue}</p>
              ${template_data.event_address ? `<p><strong>Address:</strong> ${template_data.event_address}</p>` : ''}
            </div>
            <p>We look forward to seeing you there!</p>
            <p>Best regards,<br>The EventPlatform Team</p>
          `;
          break;
        case 'ticket_confirmation':
          emailSubject = `Ticket Confirmation - ${template_data.event_title}`;
          emailContent = `
            <h1>Ticket Confirmation</h1>
            <p>Hi ${template_data.user_name},</p>
            <p>Your ticket purchase has been confirmed!</p>
            <div style="border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px;">
              <h2>${template_data.event_title}</h2>
              <p><strong>Ticket Number:</strong> ${template_data.ticket_number}</p>
              <p><strong>Quantity:</strong> ${template_data.quantity}</p>
              <p><strong>Total Price:</strong> R${template_data.total_price}</p>
              <p><strong>Date:</strong> ${template_data.event_date}</p>
              <p><strong>Time:</strong> ${template_data.event_time}</p>
              <p><strong>Venue:</strong> ${template_data.event_venue}</p>
            </div>
            <p>Please present this confirmation or your QR code at the event entrance.</p>
            <p>Best regards,<br>The EventPlatform Team</p>
          `;
          break;
        case 'event_update':
          emailSubject = `Event Update: ${template_data.event_title}`;
          emailContent = `
            <h1>Event Update</h1>
            <p>Hi ${template_data.user_name},</p>
            <p>There's been an update to an event you're attending:</p>
            <div style="border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px;">
              <h2>${template_data.event_title}</h2>
              <p><strong>Update:</strong> ${template_data.update_message}</p>
              <p><strong>Date:</strong> ${template_data.event_date}</p>
              <p><strong>Time:</strong> ${template_data.event_time}</p>
              <p><strong>Venue:</strong> ${template_data.event_venue}</p>
            </div>
            <p>Thank you for your attention to this update.</p>
            <p>Best regards,<br>The EventPlatform Team</p>
          `;
          break;
      }
    }

    // Send email via SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }],
            subject: emailSubject,
          }
        ],
        from: {
          email: 'noreply@eventplatform.co.za',
          name: 'EventPlatform'
        },
        content: [
          {
            type: 'text/html',
            value: emailContent
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SendGrid API error:', errorText);
      throw new Error(`SendGrid API error: ${response.status}`);
    }

    // Log email to database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabase
      .from('email_notifications')
      .insert({
        recipient_email: to,
        subject: emailSubject,
        content: emailContent,
        email_type: template || 'generic',
        status: 'sent',
        sent_at: new Date().toISOString(),
        template_data: template_data || {}
      });

    console.log('Email sent successfully to:', to);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully' 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error) {
    console.error('Error in sendgrid-email function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send email', details: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

serve(handler);