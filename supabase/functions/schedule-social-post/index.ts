import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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

serve(async (req) => {
  const origin = req.headers.get("origin");
  const responseHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: responseHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Validate and sanitize input
    interface SchedulePostRequestBody {
      userId: string;
      eventId: string;
      posterId?: string;
      platform: string;
      caption: string;
      scheduledFor: string;
    }
    let body: SchedulePostRequestBody;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...responseHeaders, "Content-Type": "application/json" },
      });
    }

    const { userId, eventId, posterId, platform, caption, scheduledFor } = body;

    // Basic validation
    if (
      !userId ||
      typeof userId !== "string" ||
      !eventId ||
      typeof eventId !== "string" ||
      !platform ||
      typeof platform !== "string" ||
      !caption ||
      typeof caption !== "string" ||
      !scheduledFor ||
      typeof scheduledFor !== "string"
    ) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid required fields" }),
        {
          status: 400,
          headers: { ...responseHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Optionally: sanitize caption to prevent XSS
    const sanitizedCaption = caption.replace(/<[^>]*>?/gm, "").slice(0, 500);

    // Optionally: validate scheduledFor is a valid future ISO date
    const scheduledDate = new Date(scheduledFor);
    if (isNaN(scheduledDate.getTime()) || scheduledDate < new Date()) {
      return new Response(
        JSON.stringify({ error: "Invalid or past scheduledFor date" }),
        {
          status: 400,
          headers: { ...responseHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Insert scheduled post into database
    const { data: scheduledPost, error } = await supabaseClient
      .from("scheduled_posts")
      .insert({
        user_id: userId,
        event_id: eventId,
        poster_id: posterId,
        platform,
        caption: sanitizedCaption,
        scheduled_for: scheduledFor,
        status: "scheduled",
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    console.log("Successfully scheduled post:", scheduledPost.id);

    return new Response(
      JSON.stringify({
        success: true,
        scheduledPost,
      }),
      {
        headers: { ...responseHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in schedule-social-post function:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: {
        ...getCorsHeaders(origin),
        "Content-Type": "application/json",
      },
    });
  }
});
