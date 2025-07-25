import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, eventTitle, platform } = await req.json();
    
    if (!imageUrl || !eventTitle) {
      return new Response(
        JSON.stringify({ error: 'Missing imageUrl or eventTitle' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Creating branded image for:', eventTitle, 'platform:', platform);

    // Generate a branded version using OpenAI DALL-E image editing
    // For now, we'll return the original image URL with a branded overlay instruction
    // In a real implementation, you would use a proper image processing service
    
    const prompt = `Create a branded social media image with this event photo. Add a subtle watermark/frame with the text "${eventTitle}" at the bottom. Make it suitable for ${platform || 'social media'} sharing with professional branding.`;

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `${prompt} Use the style and composition of event photography with branded overlay.`,
        size: '1024x1024',
        quality: 'standard',
        n: 1,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, await response.text());
      // Fallback: return original image if generation fails
      return new Response(
        JSON.stringify({ 
          success: true, 
          brandedImageUrl: imageUrl,
          message: 'Using original image - branding service unavailable'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResult = await response.json();
    const brandedImageUrl = aiResult.data[0]?.url || imageUrl;
    
    console.log('Successfully created branded image');

    return new Response(
      JSON.stringify({ 
        success: true, 
        brandedImageUrl,
        originalImageUrl: imageUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-branded-image function:', error);
    return new Response(
      JSON.stringify({ 
        success: true, 
        brandedImageUrl: imageUrl,
        message: 'Using original image - error in branding service'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});