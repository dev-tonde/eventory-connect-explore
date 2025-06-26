
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { eventId, prompt, dimensions, socialPlatform, style }: PosterRequest = await req.json();

    // Get event details for context
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (eventError) throw eventError;

    // Create enhanced prompt with event context
    const enhancedPrompt = `Create a professional event poster for: "${event.title}"
    
Event Details:
- Title: ${event.title}
- Date: ${event.date}
- Time: ${event.time}
- Venue: ${event.venue}
- Category: ${event.category}
- Description: ${event.description}

Design Requirements:
- Dimensions: ${dimensions.width}x${dimensions.height}
- Platform: ${socialPlatform || 'general'}
- Style: ${style || 'modern'}
- Additional prompt: ${prompt}

Create an eye-catching, professional poster that includes the event information in an attractive layout.`;

    // In production, integrate with AI services like:
    // - OpenAI DALL-E
    // - Midjourney API
    // - Stable Diffusion
    // - Adobe Firefly
    
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
        status: 'completed',
        image_data: mockPosterData.imageData,
        image_url: mockPosterData.imageUrl
      })
      .select()
      .single();

    if (posterError) throw posterError;

    return new Response(
      JSON.stringify({
        success: true,
        poster: {
          id: poster.id,
          imageUrl: poster.image_url,
          imageData: poster.image_data,
          prompt: poster.prompt,
          dimensions: poster.dimensions
        }
      }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error generating poster:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 500,
      }
    );
  }
});

async function generateMockPoster(prompt: string, dimensions: { width: number; height: number }) {
  // Mock AI poster generation
  // In production, this would call actual AI services
  
  console.log("Generating poster with prompt:", prompt);
  console.log("Dimensions:", dimensions);

  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));

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
    imageUrl: `data:image/svg+xml;base64,${btoa(svgData)}`
  };
}
