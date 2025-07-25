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
    const { uploadId, imageUrl } = await req.json();
    
    if (!uploadId || !imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing uploadId or imageUrl' }),
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

    console.log('Analyzing image for upload:', uploadId);

    // Analyze image with OpenAI Vision
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Analyze this event photo and categorize it with relevant tags. 
            Return a JSON array of tags from these categories: 
            ['stage', 'performance', 'crowd', 'dancing', 'group_selfie', 'solo_selfie', 'food', 'drinks', 'dj', 'band', 'lights', 'backstage', 'venue', 'outdoor', 'indoor', 'night', 'day', 'close_up', 'wide_shot', 'candid', 'posed']
            
            Return ONLY a JSON array like: ["stage", "performance", "crowd"]`
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, await response.text());
      return new Response(
        JSON.stringify({ error: 'Failed to analyze image' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResult = await response.json();
    const aiContent = aiResult.choices[0]?.message?.content?.trim() || '[]';
    
    console.log('AI analysis result:', aiContent);

    let tags: string[] = [];
    try {
      // Parse the AI response as JSON
      tags = JSON.parse(aiContent);
      if (!Array.isArray(tags)) {
        console.error('AI response is not an array:', aiContent);
        tags = [];
      }
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', aiContent, error);
      tags = [];
    }

    // Update the snaploop upload with tags
    const { error: updateError } = await supabase
      .from('snaploop_uploads')
      .update({ tags })
      .eq('id', uploadId);

    if (updateError) {
      console.error('Database update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update upload with tags' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully tagged upload:', uploadId, 'with tags:', tags);

    return new Response(
      JSON.stringify({ success: true, tags }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-snaploop-image function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});