
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get pending email notifications
    const { data: notifications, error } = await supabase
      .from("email_notifications")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .limit(10);

    if (error) throw error;

    console.log(`Processing ${notifications.length} email notifications`);

    for (const notification of notifications) {
      try {
        // Mark as processing
        await supabase
          .from("email_notifications")
          .update({ status: "processing" })
          .eq("id", notification.id);

        // Here you would integrate with your email service (Resend, SendGrid, etc.)
        // For now, we'll just simulate sending and mark as sent
        console.log(`Would send email: ${notification.subject} to ${notification.recipient_email}`);

        // Mark as sent
        await supabase
          .from("email_notifications")
          .update({ 
            status: "sent",
            sent_at: new Date().toISOString()
          })
          .eq("id", notification.id);

      } catch (emailError) {
        console.error(`Failed to send email ${notification.id}:`, emailError);
        
        // Mark as failed
        await supabase
          .from("email_notifications")
          .update({ 
            status: "failed",
            error_message: emailError.message
          })
          .eq("id", notification.id);
      }
    }

    return new Response(
      JSON.stringify({ processed: notifications.length }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error processing email notifications:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 500,
      }
    );
  }
});
