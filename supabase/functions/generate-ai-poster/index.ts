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
  Vary: "Origin",
};

function getCorsHeaders(origin: string | null): Record<string, string> {
  if (origin && TRUSTED_ORIGINS.includes(origin)) {
    return { ...corsHeaders, "Access-Control-Allow-Origin": origin };
  }
  return { ...corsHeaders, "Access-Control-Allow-Origin": "null" };
}

interface PosterRequest {
  eventId: string;
  prompt: string;
  dimensions: {
    width: number;
    height: number;
  };
  socialPlatform?: string;
  style?: string;
}

// Basic sanitization for strings
function sanitizeString(input: unknown, maxLength = 200): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<[^>]*>?/gm, "")
    .slice(0, maxLength)
    .trim();
}

// Validate PosterRequest input
function validatePosterRequest(data: unknown): {
  isValid: boolean;
  errors: string[];
  sanitized?: PosterRequest;
} {
  const errors: string[] = [];
  if (!data || typeof data !== "object") {
    errors.push("Invalid request body");
    return { isValid: false, errors };
  }
  const eventId = sanitizeString(data.eventId, 50);
  if (!eventId || !/^[0-9a-f-]{36}$/.test(eventId))
    errors.push("Invalid eventId");
  const prompt = sanitizeString(data.prompt, 500);
  if (!prompt) errors.push("Prompt is required");
  const dimensions = data.dimensions;
  if (
    !dimensions ||
    typeof dimensions.width !== "number" ||
    typeof dimensions.height !== "number" ||
    dimensions.width < 100 ||
    dimensions.height < 100 ||
    dimensions.width > 4000 ||
    dimensions.height > 4000
  ) {
    errors.push("Invalid dimensions");
  }
  const socialPlatform = data.socialPlatform
    ? sanitizeString(data.socialPlatform, 30)
    : undefined;
  const style = data.style ? sanitizeString(data.style, 30) : undefined;

  if (errors.length > 0) return { isValid: false, errors };

  return {
    isValid: true,
    errors: [],
    sanitized: {
      eventId,
      prompt,
      dimensions: { width: dimensions.width, height: dimensions.height },
      socialPlatform,
      style,
    },
  };
}

serve(async (req: Request) => {
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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...responseHeaders, "Content-Type": "application/json" },
      });
    }

    const validation = validatePosterRequest(body);
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: validation.errors }),
        {
          status: 400,
          headers: { ...responseHeaders, "Content-Type": "application/json" },
        }
      );
    }
    const { eventId, prompt, dimensions, socialPlatform, style } =
      validation.sanitized!;

    // Get event details for context
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return new Response(JSON.stringify({ error: "Event not found" }), {
        status: 404,
        headers: { ...responseHeaders, "Content-Type": "application/json" },
      });
    }

    // Create enhanced prompt with event context
    const enhancedPrompt = `Create a professional event poster for: "${sanitizeString(
      event.title,
      100
    )}"
    
Event Details:
- Title: ${sanitizeString(event.title, 100)}
- Date: ${sanitizeString(event.date, 40)}
- Time: ${sanitizeString(event.time, 40)}
- Venue: ${sanitizeString(event.venue, 100)}
- Category: ${sanitizeString(event.category, 40)}
- Description: ${sanitizeString(event.description, 300)}

Design Requirements:
- Dimensions: ${dimensions.width}x${dimensions.height}
- Platform: ${socialPlatform || "general"}
- Style: ${style || "modern"}
- Additional prompt: ${prompt}

Create an eye-catching, professional poster that includes the event information in an attractive layout.`;

    // In production, integrate with AI services like OpenAI DALL-E, etc.
    // For now, create a mock response
    const mockPosterData = await generateMockPoster(enhancedPrompt, dimensions);

    // Save the generated poster to database
    const { data: poster, error: posterError } = await supabase
      .from("generated_posters")
      .insert({
        event_id: eventId,
        user_id: req.headers.get("user-id"),
        prompt: enhancedPrompt,
        dimensions,
        social_platform: socialPlatform,
        status: "completed",
        image_data: mockPosterData.imageData,
        image_url: mockPosterData.imageUrl,
      })
      .select()
      .single();

    if (posterError) {
      console.error("Error saving poster:", posterError);
      return new Response(JSON.stringify({ error: "Failed to save poster" }), {
        status: 500,
        headers: { ...responseHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        poster: {
          id: poster.id,
          imageUrl: poster.image_url,
          imageData: poster.image_data,
          prompt: poster.prompt,
          dimensions: poster.dimensions,
        },
      }),
      {
        headers: { ...responseHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error generating poster:", error);
    return new Response(
      JSON.stringify({
        error: (error as Error)?.message || "Internal server error",
      }),
      {
        headers: { ...responseHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

async function generateMockPoster(
  prompt: string,
  dimensions: { width: number; height: number }
) {
  // Mock AI poster generation
  // In production, this would call actual AI services

  console.log("Generating poster with prompt:", prompt);
  console.log("Dimensions:", dimensions);

  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Create a simple SVG poster as mock data
  const svgData = `
    <svg width="${dimensions.width}" height="${dimensions.height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad1)"/>
      <text x="50%" y="30%" text-anchor="middle" fill="white" font-size="24" font-weight="bold">
        AI GENERATED POSTER
      </text>
      <text x="50%" y="50%" text-anchor="middle" fill="white" font-size="16">
        Event Poster Created
      </text>
      <text x="50%" y="70%" text-anchor="middle" fill="white" font-size="12">
        ${dimensions.width} x ${dimensions.height}
      </text>
    </svg>
  `;

  return {
    imageData: `data:image/svg+xml;base64,${btoa(svgData)}`,
    imageUrl: `data:image/svg+xml;base64,${btoa(svgData)}`,
  };
}
