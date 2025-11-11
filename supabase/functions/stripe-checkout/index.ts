import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.5.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2024-11-20.acacia',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { orderId } = await req.json()

    if (!orderId) {
      throw new Error('Order ID required')
    }

    // Fetch order details
    const { data: order, error } = await supabaseClient
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          item:items(*)
        ),
        buyer:users!orders_buyer_id_fkey(*),
        store:stores!orders_store_id_fkey(*)
      `)
      .eq('id', orderId)
      .single()

    if (error || !order) {
      throw new Error('Order not found')
    }

    // Check if payment intent already exists
    if (order.payment_intent_id) {
      // Retrieve existing payment intent
      const existingIntent = await stripe.paymentIntents.retrieve(order.payment_intent_id)
      
      if (existingIntent.status === 'succeeded') {
        throw new Error('Order has already been paid')
      }

      return new Response(
        JSON.stringify({
          clientSecret: existingIntent.client_secret,
          paymentIntentId: existingIntent.id,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // Convert to cents
      currency: 'eur',
      metadata: {
        orderId: order.id,
        orderNumber: order.order_number,
        storeId: order.store_id,
        buyerId: order.buyer_id,
      },
      description: `Bloem Order ${order.order_number}`,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    // Update order with payment intent ID
    await supabaseClient
      .from('orders')
      .update({
        payment_intent_id: paymentIntent.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
