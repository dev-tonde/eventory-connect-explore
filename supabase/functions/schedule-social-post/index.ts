
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { 
      userId, 
      eventId, 
      posterId, 
      platform, 
      caption, 
      scheduledFor 
    } = await req.json();

    console.log('Scheduling social media post:', { platform, scheduledFor });

    // Insert scheduled post into database
    const { data: scheduledPost, error } = await supabaseClient
      .from('scheduled_posts')
      .insert({
        user_id: userId,
        event_id: eventId,
        poster_id: posterId,
        platform,
        caption,
        scheduled_for: scheduledFor,
        status: 'scheduled'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    console.log('Successfully scheduled post:', scheduledPost.id);

    return new Response(JSON.stringify({ 
      success: true,
      scheduledPost 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in schedule-social-post function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
