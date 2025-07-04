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
  Vary: "Origin",
};

function getCorsHeaders(origin: string | null): Record<string, string> {
  if (origin && TRUSTED_ORIGINS.includes(origin)) {
    return { ...corsHeaders, "Access-Control-Allow-Origin": origin };
  }
  return { ...corsHeaders, "Access-Control-Allow-Origin": "null" };
}

// UUID validation for user_id
function isValidUUID(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    uuid
  );
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const responseHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: responseHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...responseHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let user_id_param: string | undefined;
    try {
      const body = await req.json();
      user_id_param = body.user_id_param;
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...responseHeaders, "Content-Type": "application/json" },
      });
    }

    if (
      !user_id_param ||
      typeof user_id_param !== "string" ||
      !isValidUUID(user_id_param)
    ) {
      return new Response(
        JSON.stringify({ error: "Valid user_id_param (UUID) is required" }),
        {
          status: 400,
          headers: { ...responseHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Optional: Auth check (recommended for privacy)
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        {
          status: 401,
          headers: { ...responseHeaders, "Content-Type": "application/json" },
        }
      );
    }
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user || user.id !== user_id_param) {
      return new Response(JSON.stringify({ error: "Unauthorized access" }), {
        status: 403,
        headers: { ...responseHeaders, "Content-Type": "application/json" },
      });
    }

    const { data, error } = await supabaseClient
      .from("social_posts")
      .select("*")
      .eq("user_id", user_id_param)
      .order("posted_at", { ascending: false });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return new Response(JSON.stringify(data || []), {
      headers: { ...responseHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in get-user-social-posts function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...responseHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
