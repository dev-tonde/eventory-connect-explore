
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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const {
      amount,
      currency,
      eventId,
      quantity,
      userEmail,
      userId,
      paymentMethodId
    }: PaymentRequest = await req.json();

    // Create payment with YOCO
    const yocoResponse = await fetch('https://online.yoco.com/v1/charges/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('YOCO_SECRET_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: paymentMethodId,
        amountInCents: Math.round(amount * 100), // Convert to cents
        currency: currency.toUpperCase(),
        metadata: {
          eventId,
          userId,
          quantity: quantity.toString(),
        },
      }),
    });

    const yocoData = await yocoResponse.json();

    if (!yocoResponse.ok) {
      console.error('YOCO payment failed:', yocoData);
      return new Response(
        JSON.stringify({ error: 'Payment failed', details: yocoData }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // If payment successful, create ticket record
    if (yocoData.status === 'successful') {
      const { error: ticketError } = await supabaseClient
        .from('tickets')
        .insert({
          user_id: userId,
          event_id: eventId,
          quantity: quantity,
          total_price: amount,
          status: 'active',
          payment_reference: yocoData.id,
        });

      if (ticketError) {
        console.error('Error creating ticket:', ticketError);
        return new Response(
          JSON.stringify({ error: 'Failed to create ticket record' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      // Update event attendance count
      const { data: currentEvent } = await supabaseClient
        .from('events')
        .select('current_attendees')
        .eq('id', eventId)
        .single();

      if (currentEvent) {
        await supabaseClient
          .from('events')
          .update({ 
            current_attendees: (currentEvent.current_attendees || 0) + quantity 
          })
          .eq('id', eventId);
      }

      // Queue email notification
      await supabaseClient
        .from('email_notifications')
        .insert({
          user_id: userId,
          event_id: eventId,
          email_type: 'ticket_purchase_confirmation',
          recipient_email: userEmail,
          subject: 'Ticket Purchase Confirmation',
          content: `Your payment of R${amount.toFixed(2)} has been processed successfully. Ticket quantity: ${quantity}`,
          template_data: {
            eventId,
            quantity,
            totalPrice: amount,
            paymentReference: yocoData.id,
          },
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
