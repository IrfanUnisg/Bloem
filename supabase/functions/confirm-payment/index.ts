// @ts-nocheck - Deno edge function
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Use service role for admin operations
    )

    const { paymentIntentId, orderId } = await req.json()

    if (!paymentIntentId) {
      throw new Error('Payment Intent ID required')
    }

    // Verify payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Payment has not succeeded')
    }

    // Get order
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          item:items(*)
        )
      `)
      .eq('id', orderId || paymentIntent.metadata.orderId)
      .single()

    if (orderError || !order) {
      throw new Error('Order not found')
    }

    if (order.status === 'COMPLETED') {
      // Order already completed
      return new Response(
        JSON.stringify({ order, message: 'Order already completed' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Update order status to COMPLETED
    const { data: updatedOrder, error: updateError } = await supabaseClient
      .from('orders')
      .update({
        status: 'COMPLETED',
        payment_method: 'CARD',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    // Update items to SOLD status
    const itemIds = order.items.map((oi) => oi.item_id)
    await supabaseClient
      .from('items')
      .update({
        status: 'SOLD',
        sold_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .in('id', itemIds)

    // Clear cart items after successful payment
    await supabaseClient
      .from('cart_items')
      .delete()
      .eq('user_id', order.buyer_id)
      .in('item_id', itemIds)

    // Create transactions for each item
    for (const orderItem of order.items) {
      const item = orderItem.item

      // Calculate earnings breakdown
      const itemPrice = orderItem.price_at_purchase
      const storeCommission = orderItem.store_commission
      const sellerPayout = orderItem.seller_payout
      const platformFee = orderItem.platform_fee

      await supabaseClient
        .from('transactions')
        .insert({
          order_id: order.id,
          item_id: item.id,
          seller_id: item.seller_id,
          amount: itemPrice,
          seller_earnings: sellerPayout,
          store_commission: storeCommission,
          platform_fee: platformFee,
          status: 'COMPLETED',
          completed_at: new Date().toISOString(),
        })
    }

    console.log(`Order ${order.order_number} completed successfully`)

    return new Response(
      JSON.stringify({
        order: updatedOrder,
        message: 'Payment confirmed and order completed',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error confirming payment:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
