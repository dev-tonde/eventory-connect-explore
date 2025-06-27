
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const webhookPayload: YocoWebhookPayload = await req.json();
    
    console.log('YOCO Webhook received:', JSON.stringify(webhookPayload, null, 2));

    // Verify webhook signature here in production
    // const signature = req.headers.get('x-yoco-signature');

    if (webhookPayload.type === 'payment.succeeded') {
      const { data: payment } = webhookPayload;
      
      // Update ticket status
      const { error: ticketError } = await supabaseClient
        .from('tickets')
        .update({
          payment_status: 'completed',
          status: 'active'
        })
        .eq('payment_reference', payment.id);

      if (ticketError) {
        console.error('Error updating ticket:', ticketError);
        throw ticketError;
      }

      // Send confirmation email
      if (payment.metadata) {
        await supabaseClient
          .from('email_notifications')
          .insert({
            user_id: payment.metadata.userId,
            event_id: payment.metadata.eventId,
            email_type: 'payment_confirmation',
            recipient_email: '', // Will be filled by email service
            subject: 'Payment Confirmation - Ticket Purchase Successful',
            content: `Your payment of R${(payment.amountInCents / 100).toFixed(2)} has been confirmed.`,
            template_data: {
              paymentId: payment.id,
              amount: payment.amountInCents / 100,
              eventId: payment.metadata.eventId,
              quantity: parseInt(payment.metadata.quantity)
            }
          });
      }

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
    
    // Log error to database
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    await supabaseClient.from('error_logs').insert({
      error_type: 'webhook_error',
      error_message: error.message,
      stack_trace: error.stack,
      url: req.url,
    });

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
