import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ModerationRequest {
  text: string;
  contentType: 'event' | 'message' | 'comment' | 'profile';
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
    const { text, contentType }: ModerationRequest = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: text' }),
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

    console.log('Moderating content:', { contentType, textLength: text.length });

    // Use OpenAI's moderation endpoint
    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text,
        model: 'text-moderation-latest',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI moderation API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const moderationResult = await response.json();
    const result = moderationResult.results[0];

    console.log('Moderation result:', result);

    // Extract flagged categories
    const flaggedCategories = Object.entries(result.categories)
      .filter(([_, flagged]) => flagged)
      .map(([category]) => category);

    // Calculate confidence based on category scores
    const maxScore = Math.max(...Object.values(result.category_scores));
    const confidence = result.flagged ? maxScore : 1 - maxScore;

    return new Response(
      JSON.stringify({ 
        flagged: result.flagged,
        categories: flaggedCategories,
        confidence: confidence,
        scores: result.category_scores,
        contentType,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error) {
    console.error('Error in openai-content-moderation function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to moderate content', details: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

serve(handler);