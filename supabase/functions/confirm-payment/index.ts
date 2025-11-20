// @ts-nocheck - Deno edge function
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.5.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Map database snake_case to frontend camelCase
function mapOrderFields(order: any): any {
  if (!order) return null
  
  return {
    ...order,
    orderNumber: order.order_number || order.orderNumber,
    createdAt: order.created_at || order.createdAt,
    updatedAt: order.updated_at || order.updatedAt,
    completedAt: order.completed_at || order.completedAt,
    pickupMethod: order.pickup_method || order.pickupMethod,
    serviceFee: order.service_fee ?? order.serviceFee,
    paymentIntentId: order.payment_intent_id || order.paymentIntentId,
    paymentMethod: order.payment_method || order.paymentMethod,
    buyerId: order.buyer_id || order.buyerId,
    storeId: order.store_id || order.storeId,
    // Map nested items
    items: order.items?.map((oi: any) => ({
      ...oi,
      orderId: oi.order_id || oi.orderId,
      itemId: oi.item_id || oi.itemId,
      priceAtPurchase: oi.price_at_purchase ?? oi.priceAtPurchase,
      sellerPayout: oi.seller_payout ?? oi.sellerPayout,
      storeCommission: oi.store_commission ?? oi.storeCommission,
      platformFee: oi.platform_fee ?? oi.platformFee,
      createdAt: oi.created_at || oi.createdAt,
    })) || order.items,
  }
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
      // Ensure cart is cleared for this order's items
      const itemIds = order.items.map((oi) => oi.item_id)
      await supabaseClient
        .from('cart_items')
        .delete()
        .eq('user_id', order.buyer_id)
        .in('item_id', itemIds)
      
      const mappedOrder = mapOrderFields(order)
      
      return new Response(
        JSON.stringify({ order: mappedOrder, message: 'Order already completed' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    const itemIds = order.items.map((oi) => oi.item_id)

    // Update items to SOLD status (payment succeeded)
    const { error: itemsUpdateError } = await supabaseClient
      .from('items')
      .update({
        status: 'SOLD',
        sold_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .in('id', itemIds)

    if (itemsUpdateError) {
      console.error('Failed to update item status:', itemsUpdateError)
      throw new Error('Failed to mark items as sold. Please contact support.')
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
      console.error('Failed to update order status:', updateError)
      throw new Error('Failed to complete order. Please contact support.')
    }

    // Clear cart items ONLY after successful payment and order completion
    const { error: cartClearError } = await supabaseClient
      .from('cart_items')
      .delete()
      .eq('user_id', order.buyer_id)
      .in('item_id', itemIds)

    if (cartClearError) {
      console.error('Failed to clear cart items:', cartClearError)
      // Don't throw here - order is completed, cart can be cleared manually
    }

    // Create transactions for each item
    for (const orderItem of order.items) {
      const item = orderItem.item

      // Calculate earnings breakdown
      const itemPrice = orderItem.price_at_purchase
      const storeCommission = orderItem.store_commission
      const sellerPayout = orderItem.seller_payout
      const platformFee = orderItem.platform_fee

      const { error: transactionError } = await supabaseClient
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

      if (transactionError) {
        console.error('Failed to create transaction:', transactionError)
        // Don't throw here - order is completed, transactions can be created manually
      }
    }

    console.log(`Order ${order.order_number} completed successfully`)

    const mappedOrder = mapOrderFields(updatedOrder)

    return new Response(
      JSON.stringify({
        order: mappedOrder,
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
