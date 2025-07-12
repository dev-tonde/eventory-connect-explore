import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get analytics configuration from database
    const { data: config, error } = await supabase
      .from('analytics_config')
      .select('config_key, config_value')
      .eq('is_active', true);

    if (error) {
      console.warn('Error fetching analytics config from database:', error);
    }

    // Convert to key-value object
    const configObject: Record<string, string> = {};
    config?.forEach(item => {
      configObject[item.config_key] = item.config_value;
    });

    // Get configuration from database or fallback to environment variables
    const trackingId = configObject.google_analytics_tracking_id || Deno.env.get('GOOGLE_ANALYTICS_ID');
    const measurementId = configObject.google_analytics_measurement_id || Deno.env.get('GOOGLE_ANALYTICS_STREAM_ID');
    
    if (!trackingId && !measurementId) {
      throw new Error('Google Analytics configuration not found');
    }

    const analyticsConfig = {
      trackingId,
      measurementId,
      streamId: measurementId, // Legacy compatibility
      facebookPixelId: configObject.facebook_pixel_id,
      hotjarSiteId: configObject.hotjar_site_id,
      success: true 
    };

    console.log('Providing Google Analytics configuration');

    return new Response(
      JSON.stringify(analyticsConfig),
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