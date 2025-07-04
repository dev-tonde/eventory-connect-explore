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

interface SocialPostRequest {
  platform: "facebook" | "instagram" | "twitter" | "linkedin";
  caption: string;
  imageUrl?: string;
  userId: string;
  posterId?: string;
  eventId?: string;
}

function sanitizeCaption(caption: string): string {
  // Remove HTML tags and limit length to 500 chars
  return caption.replace(/<[^>]*>?/gm, "").slice(0, 500);
}

function validateSocialPostRequest(data: unknown): {
  isValid: boolean;
  errors: string[];
  sanitized?: SocialPostRequest;
} {
  const errors: string[] = [];
  const allowedPlatforms = ["facebook", "instagram", "twitter", "linkedin"];

  if (!data || typeof data !== "object") {
    errors.push("Invalid request body");
    return { isValid: false, errors };
  }

  if (!allowedPlatforms.includes(data.platform)) {
    errors.push("Invalid or missing platform");
  }
  if (
    !data.caption ||
    typeof data.caption !== "string" ||
    data.caption.length > 500
  ) {
    errors.push("Invalid or missing caption");
  }
  if (
    !data.userId ||
    typeof data.userId !== "string" ||
    data.userId.length > 100
  ) {
    errors.push("Invalid or missing userId");
  }
  if (
    data.posterId &&
    (typeof data.posterId !== "string" || data.posterId.length > 100)
  ) {
    errors.push("Invalid posterId");
  }
  if (
    data.eventId &&
    (typeof data.eventId !== "string" || data.eventId.length > 100)
  ) {
    errors.push("Invalid eventId");
  }
  if (
    data.imageUrl &&
    (typeof data.imageUrl !== "string" ||
      !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(data.imageUrl))
  ) {
    errors.push("Invalid imageUrl");
  }
  // Instagram requires imageUrl
  if (data.platform === "instagram" && !data.imageUrl) {
    errors.push("Instagram posts require an imageUrl");
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    sanitized: {
      platform: data.platform,
      caption: sanitizeCaption(data.caption),
      imageUrl: data.imageUrl,
      userId: data.userId.trim(),
      posterId: data.posterId?.trim(),
      eventId: data.eventId?.trim(),
    },
  };
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
    // Parse and validate input
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...responseHeaders, "Content-Type": "application/json" },
      });
    }

    const validation = validateSocialPostRequest(body);
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: validation.errors }),
        {
          status: 400,
          headers: { ...responseHeaders, "Content-Type": "application/json" },
        }
      );
    }
    const { platform, caption, imageUrl, userId, posterId, eventId } =
      validation.sanitized!;

    // Auth check (optional, but recommended)
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

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Verify user session
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user || user.id !== userId) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication or user mismatch" }),
        {
          status: 403,
          headers: { ...responseHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Use service role for DB insert
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let postResult;
    switch (platform) {
      case "facebook":
        postResult = await postToFacebook(caption, imageUrl);
        break;
      case "instagram":
        postResult = await postToInstagram(caption, imageUrl);
        break;
      case "twitter":
        postResult = await postToTwitter(caption, imageUrl);
        break;
      case "linkedin":
        postResult = await postToLinkedIn(caption, imageUrl);
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    // Log the successful post
    await serviceClient.from("social_posts").insert({
      user_id: userId,
      platform,
      caption,
      image_url: imageUrl,
      poster_id: posterId,
      event_id: eventId,
      external_post_id: postResult.id,
      status: "posted",
      posted_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        postId: postResult.id,
        platform,
      }),
      {
        headers: { ...responseHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error posting to social media:", error);
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

async function postToFacebook(caption: string, imageUrl?: string) {
  const accessToken = Deno.env.get("META_ACCESS_TOKEN");
  const pageId = Deno.env.get("FACEBOOK_PAGE_ID");

  if (!accessToken || !pageId) {
    throw new Error("Facebook credentials not configured");
  }

  const url = `https://graph.facebook.com/v18.0/${pageId}/photos`;

  const body: Record<string, unknown> = {
    caption,
    access_token: accessToken,
  };

  if (imageUrl) {
    body.url = imageUrl;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Facebook API error: ${error.error?.message || "Unknown error"}`
    );
  }

  return await response.json();
}

async function postToInstagram(caption: string, imageUrl?: string) {
  const accessToken = Deno.env.get("META_ACCESS_TOKEN");
  const instagramAccountId = Deno.env.get("INSTAGRAM_ACCOUNT_ID");

  if (!accessToken || !instagramAccountId) {
    throw new Error("Instagram credentials not configured");
  }

  if (!imageUrl) {
    throw new Error("Instagram posts require an image");
  }

  // Step 1: Create media container
  const containerResponse = await fetch(
    `https://graph.facebook.com/v18.0/${instagramAccountId}/media`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_url: imageUrl,
        caption,
        access_token: accessToken,
      }),
    }
  );

  if (!containerResponse.ok) {
    const error = await containerResponse.json();
    throw new Error(
      `Instagram container error: ${error.error?.message || "Unknown error"}`
    );
  }

  const containerData = await containerResponse.json();

  // Step 2: Publish the media
  const publishResponse = await fetch(
    `https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        creation_id: containerData.id,
        access_token: accessToken,
      }),
    }
  );

  if (!publishResponse.ok) {
    const error = await publishResponse.json();
    throw new Error(
      `Instagram publish error: ${error.error?.message || "Unknown error"}`
    );
  }

  return await publishResponse.json();
}

async function postToTwitter(caption: string, imageUrl?: string) {
  // Twitter implementation would go here
  // For now, return a mock response
  console.log("Twitter posting not yet implemented");
  return { id: "twitter_mock_" + Date.now() };
}

async function postToLinkedIn(caption: string, imageUrl?: string) {
  // LinkedIn implementation would go here
  // For now, return a mock response
  console.log("LinkedIn posting not yet implemented");
  return { id: "linkedin_mock_" + Date.now() };
}
