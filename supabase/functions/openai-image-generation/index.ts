import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImageGenerationRequest {
  prompt: string;
  size?: '1024x1024' | '1536x1024' | '1024x1536';
  quality?: 'high' | 'medium' | 'low' | 'auto';
  style?: 'vivid' | 'natural';
  output_format?: 'png' | 'jpeg' | 'webp';
  event_id?: string;
  user_id?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }

  try {
    const { 
      prompt, 
      size = '1024x1024', 
      quality = 'auto',
      style = 'vivid',
      output_format = 'png',
      event_id,
      user_id 
    }: ImageGenerationRequest = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: prompt' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Generating image with prompt:', prompt);

    // Generate image using OpenAI's gpt-image-1 model (most advanced)
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        n: 1,
        size: size,
        quality: quality,
        output_format: output_format,
        // gpt-image-1 always returns base64, so we don't need response_format
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const responseData = await response.json();
    const imageBase64 = responseData.data[0].b64_json;
    const imageUrl = `data:image/${output_format};base64,${imageBase64}`;

    // Save to database if event_id and user_id provided
    if (event_id && user_id) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await supabase
        .from('generated_posters')
        .insert({
          event_id,
          user_id,
          prompt,
          image_data: imageBase64,
          dimensions: { width: size.split('x')[0], height: size.split('x')[1] },
          status: 'completed'
        });
    }

    console.log('Image generated successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        image_url: imageUrl,
        image_base64: imageBase64,
        prompt: prompt,
        size: size
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error) {
    console.error('Error in openai-image-generation function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate image', details: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

serve(handler);