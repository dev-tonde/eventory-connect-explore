import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  // Default: block or allow none if not trusted
  return { ...corsHeaders, "Access-Control-Allow-Origin": "null" };
}

serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const responseHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: responseHeaders });
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
        // Mark as processing (idempotency: only update if still pending)
        const { error: updateError } = await supabase
          .from("email_notifications")
          .update({ status: "processing" })
          .eq("id", notification.id)
          .eq("status", "pending");

        if (updateError) throw updateError;

        // Here you would integrate with your email service (Resend, SendGrid, etc.)
        // For now, we'll just simulate sending and mark as sent
        console.log(
          `Would send email: ${notification.subject} to ${notification.recipient_email}`
        );

        // Mark as sent
        const { error: sentError } = await supabase
          .from("email_notifications")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
          })
          .eq("id", notification.id);

        if (sentError) throw sentError;
      } catch (emailError: unknown) {
        console.error(`Failed to send email ${notification.id}:`, emailError);

        // Mark as failed, but avoid leaking sensitive error info
        let errorMessage = "Unknown error";
        if (
          typeof emailError === "object" &&
          emailError !== null &&
          "message" in emailError &&
          typeof (emailError as { message?: string }).message === "string"
        ) {
          errorMessage = (emailError as { message: string }).message.slice(
            0,
            500
          );
        }
        await supabase
          .from("email_notifications")
          .update({
            status: "failed",
            error_message: errorMessage,
          })
          .eq("id", notification.id);
      }
    }

    return new Response(JSON.stringify({ processed: notifications.length }), {
      headers: { "Content-Type": "application/json", ...responseHeaders },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Error processing email notifications:", error);
    let errorMessage = "Internal server error";
    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as { message?: string }).message === "string"
    ) {
      errorMessage = (error as { message: string }).message;
    }
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json", ...responseHeaders },
      status: 500,
    });
  }
});
