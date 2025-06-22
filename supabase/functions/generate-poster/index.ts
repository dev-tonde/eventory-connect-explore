
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { eventTitle, eventDate, eventLocation, templateId, socialPlatform, customPrompt } = await req.json();

    console.log('Generating poster for:', { eventTitle, socialPlatform, templateId });

    // Fetch template details
    const { data: template } = await supabaseClient
      .from('poster_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (!template) {
      throw new Error('Template not found');
    }

    // Build AI prompt for poster generation
    const dimensions = template.dimensions as { width: number, height: number };
    const designData = template.design_data as any;
    
    let prompt = `Create a professional event poster for "${eventTitle}". `;
    prompt += `Event details: Date: ${eventDate}, Location: ${eventLocation}. `;
    prompt += `Style: ${designData.color_scheme || 'vibrant'} colors, ${designData.layout || 'center'} layout. `;
    prompt += `Platform: ${socialPlatform}. Size: ${dimensions.width}x${dimensions.height}px. `;
    prompt += `Make it eye-catching and professional. `;
    if (customPrompt) {
      prompt += `Additional requirements: ${customPrompt}`;
    }

    console.log('AI Prompt:', prompt);

    // Generate image using OpenAI DALL-E
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: dimensions.width === dimensions.height ? '1024x1024' : 
               dimensions.width > dimensions.height ? '1792x1024' : '1024x1792',
        quality: 'standard',
        response_format: 'url'
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const imageUrl = data.data[0].url;

    console.log('Generated image URL:', imageUrl);

    // Download and convert image to base64
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));

    return new Response(JSON.stringify({ 
      imageUrl,
      imageData: base64Image,
      dimensions: template.dimensions
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-poster function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
