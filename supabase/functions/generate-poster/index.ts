import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

function sanitizeString(input: unknown, maxLength = 200): string {
  if (typeof input !== "string") return "";
  // Remove HTML tags and trim
  return input
    .replace(/<[^>]*>?/gm, "")
    .slice(0, maxLength)
    .trim();
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
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse and sanitize input
    type PosterRequestBody = {
      eventTitle: unknown;
      eventDate: unknown;
      eventLocation: unknown;
      templateId: unknown;
      socialPlatform: unknown;
      customPrompt?: unknown;
    };
    let body: PosterRequestBody;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...responseHeaders, "Content-Type": "application/json" },
      });
    }

    const eventTitle = sanitizeString(body.eventTitle, 100);
    const eventDate = sanitizeString(body.eventDate, 40);
    const eventLocation = sanitizeString(body.eventLocation, 100);
    const templateId = sanitizeString(body.templateId, 50);
    const socialPlatform = sanitizeString(body.socialPlatform, 30);
    const customPrompt = sanitizeString(body.customPrompt, 300);

    if (
      !eventTitle ||
      !eventDate ||
      !eventLocation ||
      !templateId ||
      !socialPlatform
    ) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...responseHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch template details
    const { data: template, error: templateError } = await supabaseClient
      .from("poster_templates")
      .select("*")
      .eq("id", templateId)
      .single();

    if (templateError || !template) {
      return new Response(JSON.stringify({ error: "Template not found" }), {
        status: 404,
        headers: { ...responseHeaders, "Content-Type": "application/json" },
      });
    }

    // Build AI prompt for poster generation
    const dimensions = template.dimensions as { width: number; height: number };
    type DesignData = {
      color_scheme?: string;
      layout?: string;
      [key: string]: unknown;
    };
    const designData = template.design_data as DesignData;

    let prompt = `Create a professional event poster for "${eventTitle}". `;
    prompt += `Event details: Date: ${eventDate}, Location: ${eventLocation}. `;
    prompt += `Style: ${designData?.color_scheme || "vibrant"} colors, ${
      designData?.layout || "center"
    } layout. `;
    prompt += `Platform: ${socialPlatform}. Size: ${dimensions.width}x${dimensions.height}px. `;
    prompt += `Make it eye-catching and professional. `;
    if (customPrompt) {
      prompt += `Additional requirements: ${customPrompt}`;
    }

    // Generate image using OpenAI DALL-E
    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openAIApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size:
            dimensions.width === dimensions.height
              ? "1024x1024"
              : dimensions.width > dimensions.height
              ? "1792x1024"
              : "1024x1792",
          quality: "standard",
          response_format: "url",
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `OpenAI API error: ${error.error?.message || "Unknown error"}`
      );
    }

    const data = await response.json();
    const imageUrl = data.data[0]?.url;
    if (!imageUrl) {
      throw new Error("No image URL returned from OpenAI");
    }

    // Download and convert image to base64
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error("Failed to fetch generated image");
    }
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = btoa(
      String.fromCharCode(...new Uint8Array(imageBuffer))
    );

    return new Response(
      JSON.stringify({
        imageUrl,
        imageData: base64Image,
        dimensions: template.dimensions,
      }),
      {
        headers: { ...responseHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error in generate-poster function:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Internal server error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
