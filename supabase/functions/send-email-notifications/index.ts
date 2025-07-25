import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Restrict CORS to trusted domains only
const TRUSTED_ORIGINS = [
  "https://eventory.co.za",
  "https://staging.eventory.co.za",
];
const corsHeaders = {
  "Access-Control-Allow-Origin": "", // Will be set dynamically
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function getCorsHeaders(origin: string | null): Record<string, string> {
  if (origin && TRUSTED_ORIGINS.includes(origin)) {
    return { ...corsHeaders, "Access-Control-Allow-Origin": origin };
  }
  return { ...corsHeaders, "Access-Control-Allow-Origin": "null" };
}

interface EmailRequest {
  to: string;
  subject: string;
  html?: string;
  from?: string;
  eventId?: string;
  type: 'rsvp_confirmation' | 'event_reminder' | 'event_update' | 'welcome' | 'custom';
  templateData?: any;
}

interface RSVPConfirmationData {
  userName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  eventAddress: string;
  ticketNumber?: string;
}

interface EventReminderData {
  userName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  eventAddress: string;
  eventDescription: string;
}

function generateRSVPConfirmationHTML(data: RSVPConfirmationData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>RSVP Confirmation</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">RSVP Confirmed! 🎉</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <p style="font-size: 18px; margin-bottom: 20px;">Hi ${data.userName},</p>
        
        <p style="font-size: 16px; margin-bottom: 25px;">
          Thank you for RSVPing to <strong>${data.eventTitle}</strong>! We're excited to see you there.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #667eea;">Event Details</h3>
          <p><strong>📅 Date:</strong> ${data.eventDate}</p>
          <p><strong>🕒 Time:</strong> ${data.eventTime}</p>
          <p><strong>📍 Venue:</strong> ${data.eventVenue}</p>
          <p><strong>🗺️ Address:</strong> ${data.eventAddress}</p>
          ${data.ticketNumber ? `<p><strong>🎫 Ticket Number:</strong> ${data.ticketNumber}</p>` : ''}
        </div>
        
        <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #0066cc;">
            <strong>💡 Tip:</strong> Add this event to your calendar so you don't forget!
          </p>
        </div>
        
        <p style="margin-top: 25px;">
          Looking forward to seeing you at the event!
        </p>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px; border-top: 1px solid #e9ecef; padding-top: 20px;">
          Best regards,<br>
          The Event Team
        </p>
      </div>
    </body>
    </html>
  `;
}

function generateEventReminderHTML(data: EventReminderData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Event Reminder</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Don't Forget! ⏰</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <p style="font-size: 18px; margin-bottom: 20px;">Hi ${data.userName},</p>
        
        <p style="font-size: 16px; margin-bottom: 25px;">
          This is a friendly reminder that <strong>${data.eventTitle}</strong> is coming up soon!
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #ff6b6b; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #ff6b6b;">Event Details</h3>
          <p><strong>📅 Date:</strong> ${data.eventDate}</p>
          <p><strong>🕒 Time:</strong> ${data.eventTime}</p>
          <p><strong>📍 Venue:</strong> ${data.eventVenue}</p>
          <p><strong>🗺️ Address:</strong> ${data.eventAddress}</p>
          <p><strong>📝 Description:</strong> ${data.eventDescription}</p>
        </div>
        
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffeaa7;">
          <p style="margin: 0; color: #856404;">
            <strong>📍 Getting There:</strong> We recommend arriving 15 minutes early to find parking and get settled.
          </p>
        </div>
        
        <p style="margin-top: 25px;">
          We can't wait to see you there!
        </p>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px; border-top: 1px solid #e9ecef; padding-top: 20px;">
          Best regards,<br>
          The Event Team
        </p>
      </div>
    </body>
    </html>
  `;
}

async function sendEmailWithResend(emailData: EmailRequest): Promise<any> {
  let emailHTML = emailData.html || '';
  let emailSubject = emailData.subject;

  // Generate template-based emails
  if (emailData.type === 'rsvp_confirmation' && emailData.templateData) {
    emailHTML = generateRSVPConfirmationHTML(emailData.templateData);
    emailSubject = `RSVP Confirmed: ${emailData.templateData.eventTitle}`;
  } else if (emailData.type === 'event_reminder' && emailData.templateData) {
    emailHTML = generateEventReminderHTML(emailData.templateData);
    emailSubject = `Reminder: ${emailData.templateData.eventTitle} is coming up!`;
  }

  console.log(`Sending ${emailData.type} email to:`, emailData.to);

  return await resend.emails.send({
    from: emailData.from || "Events <noreply@resend.dev>",
    to: [emailData.to],
    subject: emailSubject,
    html: emailHTML,
  });
}

serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const responseHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: responseHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle direct email sending requests
    if (req.method === "POST") {
      const emailData: EmailRequest = await req.json();

      if (!emailData.to || !emailData.subject) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: to, subject" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...responseHeaders },
          }
        );
      }

      try {
        const emailResponse = await sendEmailWithResend(emailData);
        console.log("Email sent successfully:", emailResponse);

        return new Response(JSON.stringify({ 
          success: true,
          emailId: emailResponse.data?.id,
          message: "Email sent successfully"
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...responseHeaders,
          },
        });
      } catch (emailError: any) {
        console.error("Error sending email:", emailError);
        return new Response(
          JSON.stringify({ 
            error: emailError.message,
            details: "Failed to send email"
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...responseHeaders },
          }
        );
      }
    }

    // Handle batch processing of queued emails (original functionality)
    const { data: notifications, error } = await supabase
      .from("email_notifications")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .limit(10);

    if (error) throw error;

    console.log(`Processing ${notifications.length} queued email notifications`);

    for (const notification of notifications) {
      try {
        // Mark as processing (idempotency: only update if still pending)
        const { error: updateError } = await supabase
          .from("email_notifications")
          .update({ status: "processing" })
          .eq("id", notification.id)
          .eq("status", "pending");

        if (updateError) throw updateError;

        // Send email with Resend
        const emailResponse = await resend.emails.send({
          from: notification.from_email || "Events <noreply@resend.dev>",
          to: [notification.recipient_email],
          subject: notification.subject,
          html: notification.content,
        });

        console.log(`Email sent for notification ${notification.id}:`, emailResponse);

        // Mark as sent
        const { error: sentError } = await supabase
          .from("email_notifications")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            external_id: emailResponse.data?.id,
          })
          .eq("id", notification.id);

        if (sentError) throw sentError;
      } catch (emailError: any) {
        console.error(`Failed to send email ${notification.id}:`, emailError);

        // Mark as failed
        await supabase
          .from("email_notifications")
          .update({
            status: "failed",
            error_message: emailError.message?.slice(0, 500) || "Unknown error",
          })
          .eq("id", notification.id);
      }
    }

    return new Response(JSON.stringify({ processed: notifications.length }), {
      headers: { "Content-Type": "application/json", ...responseHeaders },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error processing email notifications:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Internal server error" 
    }), {
      headers: { "Content-Type": "application/json", ...responseHeaders },
      status: 500,
    });
  }
});