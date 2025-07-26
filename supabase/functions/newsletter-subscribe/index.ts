import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsletterSubscriptionRequest {
  email: string;
  genre: string;
  firstName?: string;
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
    const { email, genre, firstName }: NewsletterSubscriptionRequest = await req.json();
    
    // Extract first name from email if not provided
    const extractFirstName = (email: string): string => {
      const emailPrefix = email.split('@')[0];
      const cleanName = emailPrefix
        .replace(/[.\-_]/g, ' ')
        .split(' ')[0];
      return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    };
    
    const userFirstName = firstName || extractFirstName(email);

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

    // Initialize Supabase client and Resend
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

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

    // Send welcome email with personalized first name
    try {
      const emailResponse = await resend.emails.send({
        from: "Eventory <welcome@lovable.app>",
        to: [email],
        subject: `Welcome to Eventory, ${userFirstName}!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #7c3aed; text-align: center;">Welcome to Eventory!</h1>
            
            <p>Hi ${userFirstName},</p>
            
            <p>Thank you for subscribing to our newsletter! We're excited to have you in our community.</p>
            
            <p>You'll now receive personalized event recommendations for <strong>${genre}</strong> events delivered straight to your inbox every week.</p>
            
            <div style="background: linear-gradient(135deg, #7c3aed, #3b82f6); padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
              <h2 style="color: white; margin: 0;">What to expect:</h2>
              <ul style="color: white; text-align: left; margin: 10px 0;">
                <li>🎯 Curated ${genre.toLowerCase()} events near you</li>
                <li>🎟️ Early bird discounts and exclusive offers</li>
                <li>🤖 AI-powered recommendations just for you</li>
                <li>📱 Real-time event updates and reminders</li>
              </ul>
            </div>
            
            <p>Ready to discover amazing events? <a href="https://eventory.lovable.app/events" style="color: #7c3aed; text-decoration: none;">Browse events now</a></p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            
            <p style="font-size: 14px; color: #6b7280; text-align: center;">
              You can unsubscribe at any time by clicking <a href="#" style="color: #6b7280;">here</a>.<br>
              © 2024 Eventory. All rights reserved.
            </p>
          </div>
        `,
      });
      
      console.log("Welcome email sent successfully:", emailResponse);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail the subscription if email fails
    }

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