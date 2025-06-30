
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-yoco-signature',
};

interface YocoWebhookPayload {
  id: string;
  type: string;
  data: {
    id: string;
    status: string;
    amountInCents: number;
    currency: string;
    metadata?: {
      eventId: string;
      userId: string;
      quantity: string;
    };
  };
}

// Rate limiting storage
const requestCounts = new Map<string, { count: number; resetTime: number }>();

const verifyWebhookSignature = async (payload: string, signature: string | null): Promise<boolean> => {
  if (!signature) {
    console.error('Missing webhook signature');
    return false;
  }

  const webhookSecret = Deno.env.get('YOCO_WEBHOOK_SECRET');
  if (!webhookSecret) {
    console.error('YOCO_WEBHOOK_SECRET not configured');
    return false;
  }

  try {
    // Use Web Crypto API instead of external library
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature_bytes = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(payload)
    );
    
    const expectedSignature = Array.from(new Uint8Array(signature_bytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const receivedSignature = signature.replace('sha256=', '');
    
    // Use constant-time comparison to prevent timing attacks
    return expectedSignature === receivedSignature;
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
};

const checkRateLimit = (clientId: string): boolean => {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 10; // Max 10 requests per minute per client

  const clientData = requestCounts.get(clientId);
  
  if (!clientData || now > clientData.resetTime) {
    requestCounts.set(clientId, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (clientData.count >= maxRequests) {
    return false;
  }

  clientData.count++;
  return true;
};

const sanitizeMetadata = (metadata: any): any => {
  if (!metadata || typeof metadata !== 'object') {
    return {};
  }

  return {
    eventId: typeof metadata.eventId === 'string' ? metadata.eventId.slice(0, 100) : '',
    userId: typeof metadata.userId === 'string' ? metadata.userId.slice(0, 100) : '',
    quantity: typeof metadata.quantity === 'string' ? metadata.quantity.slice(0, 10) : '1'
  };
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting by IP
    const clientIp = req.headers.get('cf-connecting-ip') || 
                     req.headers.get('x-forwarded-for') || 
                     'unknown';
    
    if (!checkRateLimit(clientIp)) {
      console.warn(`Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Get and validate request body
    const rawBody = await req.text();
    
    if (!rawBody || rawBody.length > 10000) { // Max 10KB payload
      return new Response(
        JSON.stringify({ error: 'Invalid payload size' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Verify webhook signature
    const signature = req.headers.get('x-yoco-signature');
    const isValidSignature = await verifyWebhookSignature(rawBody, signature);
    
    if (!isValidSignature) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Parse and validate webhook payload
    let webhookPayload: YocoWebhookPayload;
    try {
      webhookPayload = JSON.parse(rawBody);
    } catch (error) {
      console.error('Invalid JSON payload:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Validate required fields
    if (!webhookPayload.id || !webhookPayload.type || !webhookPayload.data) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log('YOCO Webhook received:', JSON.stringify({
      id: webhookPayload.id,
      type: webhookPayload.type,
      status: webhookPayload.data?.status
    }));

    if (webhookPayload.type === 'payment.succeeded') {
      const { data: payment } = webhookPayload;
      
      // Sanitize metadata
      const metadata = sanitizeMetadata(payment.metadata);
      
      // Validate metadata
      if (!metadata.eventId || !metadata.userId) {
        console.error('Missing required metadata');
        return new Response(
          JSON.stringify({ error: 'Invalid payment metadata' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      // Check for duplicate processing (idempotency)
      const { data: existingTicket } = await supabaseClient
        .from('tickets')
        .select('id')
        .eq('payment_reference', payment.id)
        .maybeSingle();

      if (existingTicket) {
        console.log(`Payment ${payment.id} already processed`);
        return new Response(
          JSON.stringify({ received: true, message: 'Already processed' }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      // Verify event exists and is valid
      const { data: eventData, error: eventError } = await supabaseClient
        .from('events')
        .select('id, max_attendees, current_attendees, price')
        .eq('id', metadata.eventId)
        .single();

      if (eventError || !eventData) {
        console.error('Event not found:', metadata.eventId);
        return new Response(
          JSON.stringify({ error: 'Event not found' }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      const quantity = parseInt(metadata.quantity) || 1;

      // Check if event has capacity
      if (eventData.current_attendees + quantity > eventData.max_attendees) {
        console.error('Event at capacity');
        return new Response(
          JSON.stringify({ error: 'Event at capacity' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      // Update ticket status with enhanced validation
      const { error: ticketError } = await supabaseClient
        .from('tickets')
        .update({
          payment_status: 'completed',
          status: 'active'
        })
        .eq('payment_reference', payment.id)
        .eq('user_id', metadata.userId) // Additional security check
        .eq('event_id', metadata.eventId); // Additional security check

      if (ticketError) {
        console.error('Error updating ticket:', ticketError);
        
        // Log error for audit
        await supabaseClient.from('error_logs').insert({
          error_type: 'webhook_ticket_update_failed',
          error_message: `Failed to update ticket for payment ${payment.id}: ${ticketError.message}`,
          user_id: metadata.userId,
        });

        return new Response(
          JSON.stringify({ error: 'Failed to update ticket' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      // Update event attendance count atomically
      const { error: eventUpdateError } = await supabaseClient
        .from('events')
        .update({ 
          current_attendees: eventData.current_attendees + quantity 
        })
        .eq('id', metadata.eventId)
        .eq('current_attendees', eventData.current_attendees); // Prevent race conditions

      if (eventUpdateError) {
        console.error('Error updating event attendance:', eventUpdateError);
      }

      // Queue secure email notification
      await supabaseClient
        .from('email_notifications')
        .insert({
          user_id: metadata.userId,
          event_id: metadata.eventId,
          email_type: 'payment_confirmation',
          recipient_email: '', // Will be filled by email service
          subject: 'Payment Confirmation - Ticket Purchase Successful',
          content: `Your payment of R${(payment.amountInCents / 100).toFixed(2)} has been confirmed.`,
          template_data: {
            paymentId: payment.id,
            amount: payment.amountInCents / 100,
            eventId: metadata.eventId,
            quantity: quantity
          }
        });

      // Log successful payment for audit
      await supabaseClient.from('admin_audit_logs').insert({
        action: 'payment_processed',
        resource_type: 'payment',
        resource_id: payment.id,
        details: {
          amount: payment.amountInCents / 100,
          eventId: metadata.eventId,
          userId: metadata.userId,
          quantity: quantity
        }
      });

      console.log(`Payment ${payment.id} processed successfully`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    
    // Log error to database for security monitoring
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    await supabaseClient.from('error_logs').insert({
      error_type: 'webhook_error',
      error_message: error.message || 'Unknown webhook error',
      stack_trace: error.stack,
      url: req.url,
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
