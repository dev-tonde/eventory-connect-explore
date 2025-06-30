
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  amount: number;
  currency: string;
  eventId: string;
  quantity: number;
  userEmail: string;
  userId: string;
  paymentMethodId: string;
}

// Input validation and sanitization
const validateAndSanitizeInput = (data: any): { isValid: boolean; errors: string[]; sanitized?: PaymentRequest } => {
  const errors: string[] = [];
  
  // Validate amount
  if (typeof data.amount !== 'number' || data.amount <= 0 || data.amount > 100000) {
    errors.push('Invalid amount');
  }
  
  // Validate currency
  if (typeof data.currency !== 'string' || !['ZAR', 'USD'].includes(data.currency.toUpperCase())) {
    errors.push('Invalid currency');
  }
  
  // Validate eventId (UUID format)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (typeof data.eventId !== 'string' || !uuidRegex.test(data.eventId)) {
    errors.push('Invalid event ID');
  }
  
  // Validate quantity
  if (typeof data.quantity !== 'number' || data.quantity < 1 || data.quantity > 10) {
    errors.push('Invalid quantity');
  }
  
  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof data.userEmail !== 'string' || !emailRegex.test(data.userEmail)) {
    errors.push('Invalid email');
  }
  
  // Validate userId (UUID format)
  if (typeof data.userId !== 'string' || !uuidRegex.test(data.userId)) {
    errors.push('Invalid user ID');
  }
  
  // Validate payment method ID
  if (typeof data.paymentMethodId !== 'string' || data.paymentMethodId.length < 10 || data.paymentMethodId.length > 100) {
    errors.push('Invalid payment method');
  }
  
  if (errors.length > 0) {
    return { isValid: false, errors };
  }
  
  return {
    isValid: true,
    errors: [],
    sanitized: {
      amount: Math.round(data.amount * 100) / 100, // Round to 2 decimal places
      currency: data.currency.toUpperCase(),
      eventId: data.eventId.trim(),
      quantity: Math.floor(data.quantity),
      userEmail: data.userEmail.toLowerCase().trim(),
      userId: data.userId.trim(),
      paymentMethodId: data.paymentMethodId.trim()
    }
  };
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header and validate user session
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Verify user session
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Parse and validate request body
    const rawData = await req.json();
    const validation = validateAndSanitizeInput(rawData);
    
    if (!validation.isValid) {
      console.error('Input validation failed:', validation.errors);
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.errors }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const data = validation.sanitized!;

    // Verify user matches the authenticated user
    if (data.userId !== user.id) {
      console.error('User ID mismatch:', { provided: data.userId, authenticated: user.id });
      return new Response(
        JSON.stringify({ error: 'Unauthorized user' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Use service role client for database operations
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verify event exists and has capacity
    const { data: eventData, error: eventError } = await serviceClient
      .from('events')
      .select('id, price, max_attendees, current_attendees, is_active')
      .eq('id', data.eventId)
      .single();

    if (eventError || !eventData) {
      return new Response(
        JSON.stringify({ error: 'Event not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    if (!eventData.is_active) {
      return new Response(
        JSON.stringify({ error: 'Event is not active' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Check capacity
    if (eventData.current_attendees + data.quantity > eventData.max_attendees) {
      return new Response(
        JSON.stringify({ error: 'Insufficient capacity' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Verify price matches (prevent price manipulation)
    const expectedTotal = eventData.price * data.quantity;
    if (Math.abs(data.amount - expectedTotal) > 0.01) {
      console.error('Price mismatch:', { expected: expectedTotal, provided: data.amount });
      return new Response(
        JSON.stringify({ error: 'Price mismatch' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Check for duplicate payment attempts
    const { data: existingTicket } = await serviceClient
      .from('tickets')
      .select('id')
      .eq('user_id', data.userId)
      .eq('event_id', data.eventId)
      .eq('payment_status', 'pending')
      .gte('purchase_date', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Last 5 minutes
      .maybeSingle();

    if (existingTicket) {
      return new Response(
        JSON.stringify({ error: 'Duplicate payment attempt detected' }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Create payment with YOCO with enhanced security
    const yocoSecretKey = Deno.env.get('YOCO_SECRET_KEY');
    if (!yocoSecretKey) {
      console.error('YOCO_SECRET_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Payment service unavailable' }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const yocoResponse = await fetch('https://online.yoco.com/v1/charges/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${yocoSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: data.paymentMethodId,
        amountInCents: Math.round(data.amount * 100),
        currency: data.currency,
        metadata: {
          eventId: data.eventId,
          userId: data.userId,
          quantity: data.quantity.toString(),
          timestamp: new Date().toISOString()
        },
      }),
    });

    const yocoData = await yocoResponse.json();

    if (!yocoResponse.ok) {
      console.error('YOCO payment failed:', yocoData);
      
      // Log payment failure for audit
      await serviceClient.from('error_logs').insert({
        error_type: 'payment_failed',
        error_message: `YOCO payment failed: ${JSON.stringify(yocoData)}`,
        user_id: data.userId,
      });

      return new Response(
        JSON.stringify({ error: 'Payment failed', details: yocoData.displayMessage || 'Payment declined' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // If payment successful, create ticket record with proper validation
    if (yocoData.status === 'successful') {
      const { error: ticketError } = await serviceClient
        .from('tickets')
        .insert({
          user_id: data.userId,
          event_id: data.eventId,
          quantity: data.quantity,
          total_price: data.amount,
          status: 'pending', // Will be updated by webhook
          payment_status: 'processing',
          payment_reference: yocoData.id,
          payment_method: 'yoco'
        });

      if (ticketError) {
        console.error('Error creating ticket:', ticketError);
        
        // Log the error but don't expose details to client
        await serviceClient.from('error_logs').insert({
          error_type: 'ticket_creation_failed',
          error_message: `Failed to create ticket: ${ticketError.message}`,
          user_id: data.userId,
        });

        return new Response(
          JSON.stringify({ error: 'Failed to process ticket' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      // Log successful payment initiation
      await serviceClient.from('admin_audit_logs').insert({
        action: 'payment_initiated',
        resource_type: 'payment',
        resource_id: yocoData.id,
        details: {
          amount: data.amount,
          eventId: data.eventId,
          userId: data.userId,
          quantity: data.quantity
        }
      });

      return new Response(
        JSON.stringify({
          success: true,
          paymentId: yocoData.id,
          status: yocoData.status,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Payment not successful', status: yocoData.status }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error processing payment:', error);
    
    // Log error without exposing details
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    await serviceClient.from('error_logs').insert({
      error_type: 'payment_processing_error',
      error_message: error.message || 'Unknown payment error',
      stack_trace: error.stack,
    });

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
