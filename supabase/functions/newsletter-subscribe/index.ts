import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsletterSubscriptionRequest {
  email: string;
  genre: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
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
    const { email, genre }: NewsletterSubscriptionRequest = await req.json();

    // Validate input
    if (!email || !genre) {
      return new Response(
        JSON.stringify({ error: 'Email and genre are required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Insert newsletter subscription
    const { data, error } = await supabase
      .from('newsletter_subscriptions')
      .insert([
        {
          email: email.toLowerCase().trim(),
          genre: genre.trim(),
        }
      ])
      .select();

    if (error) {
      console.error('Database error:', error);
      
      // Handle duplicate email
      if (error.code === '23505') {
        return new Response(
          JSON.stringify({ error: 'Email already subscribed' }),
          { 
            status: 409,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Failed to subscribe' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    console.log('Newsletter subscription created:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Successfully subscribed to newsletter',
        subscription: data[0]
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error) {
    console.error('Error in newsletter-subscribe function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

serve(handler);