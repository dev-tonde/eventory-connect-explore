import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }

  try {
    // Get Google Analytics configuration from environment
    const measurementId = Deno.env.get('GOOGLE_ANALYTICS_ID');
    const streamId = Deno.env.get('GOOGLE_ANALYTICS_STREAM_ID');
    
    if (!measurementId) {
      throw new Error('Google Analytics measurement ID not configured');
    }

    return new Response(
      JSON.stringify({ 
        measurementId: measurementId,
        streamId: streamId,
        success: true 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error) {
    console.error('Error in google-analytics-config function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get Google Analytics configuration' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

serve(handler);