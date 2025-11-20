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
      // Map nested item fields
      item: oi.item ? {
        ...oi.item,
        qrCode: oi.item.qr_code || oi.item.qrCode,
        isConsignment: oi.item.is_consignment ?? oi.item.isConsignment,
        hangerFee: oi.item.hanger_fee ?? oi.item.hangerFee,
        sellerId: oi.item.seller_id || oi.item.sellerId,
        storeId: oi.item.store_id || oi.item.storeId,
        uploadedAt: oi.item.uploaded_at || oi.item.uploadedAt,
        listedAt: oi.item.listed_at || oi.item.listedAt,
        soldAt: oi.item.sold_at || oi.item.soldAt,
        createdAt: oi.item.created_at || oi.item.createdAt,
        updatedAt: oi.item.updated_at || oi.item.updatedAt,
      } : oi.item,
    })) || order.items,
    // Map nested buyer and store (keep as-is, they're already mapped by Supabase)
    buyer: order.buyer,
    store: order.store,
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

    const { paymentIntentId } = await req.json()

    if (!paymentIntentId) {
      throw new Error('Payment Intent ID required')
    }

    // Verify payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Payment has not succeeded')
    }

    // Extract metadata
    const itemIds = JSON.parse(paymentIntent.metadata.itemIds || '[]')
    const buyerId = paymentIntent.metadata.buyerId
    const storeId = paymentIntent.metadata.storeId

    if (!itemIds.length || !buyerId || !storeId) {
      throw new Error('Invalid payment metadata')
    }

    // Fetch items
    const { data: items, error: itemsError } = await supabaseClient
      .from('items')
      .select('*, store:stores!items_store_id_fkey(*)')
      .in('id', itemIds)

    if (itemsError || !items || items.length === 0) {
      throw new Error('Items not found')
    }

    // Calculate totals
    const platformFeeRate = 0.03
    const subtotal = items.reduce((sum, item) => sum + item.price, 0)
    const consignmentSubtotal = items
      .filter(item => item.is_consignment)
      .reduce((sum, item) => sum + item.price, 0)
    const serviceFee = consignmentSubtotal * 0.10
    const total = subtotal

    // Get store commission rate
    const store = items[0].store
    const commissionRate = store.commission_rate || 0.07

    // Generate order number
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    const orderNumber = `BLM-${timestamp}-${random}`

    // Create order with COMPLETED status (payment already succeeded)
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        order_number: orderNumber,
        status: 'COMPLETED',
        pickup_method: 'IN_STORE',
        payment_method: 'CARD',
        payment_intent_id: paymentIntentId,
        subtotal,
        service_fee: serviceFee,
        tax: 0,
        total,
        buyer_id: buyerId,
        store_id: storeId,
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (orderError) {
      console.error('Failed to create order:', orderError)
      throw new Error('Failed to create order after payment')
    }

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

    // Create order items
    for (const item of items) {
      const priceAtPurchase = item.price
      const platformFee = priceAtPurchase * platformFeeRate
      const storeCommission = item.is_consignment ? priceAtPurchase * commissionRate : 0
      const sellerPayout = item.is_consignment
        ? priceAtPurchase - storeCommission - platformFee
        : 0

      await supabaseClient.from('order_items').insert({
        order_id: order.id,
        item_id: item.id,
        price_at_purchase: priceAtPurchase,
        seller_payout: sellerPayout,
        store_commission: storeCommission,
        platform_fee: platformFee,
        created_at: new Date().toISOString(),
      })
    }

    // Clear cart items ONLY after successful payment and order creation
    const { error: cartClearError } = await supabaseClient
      .from('cart_items')
      .delete()
      .eq('user_id', buyerId)
      .in('item_id', itemIds)

    if (cartClearError) {
      console.error('Failed to clear cart items:', cartClearError)
      // Don't throw here - order is completed, cart can be cleared manually
    }

    // Create transactions for each item
    for (const item of items) {
      const priceAtPurchase = item.price
      const platformFee = priceAtPurchase * platformFeeRate
      const storeCommission = item.is_consignment ? priceAtPurchase * commissionRate : 0
      const sellerPayout = item.is_consignment
        ? priceAtPurchase - storeCommission - platformFee
        : 0

      if (item.is_consignment && item.seller_id) {
        await supabaseClient.from('transactions').insert({
          order_id: order.id,
          item_id: item.id,
          seller_id: item.seller_id,
          amount: priceAtPurchase,
          seller_earnings: sellerPayout,
          store_commission: storeCommission,
          platform_fee: platformFee,
          status: 'COMPLETED',
          completed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        })
      }
    }

    console.log(`Order ${orderNumber} created and completed successfully`)

    // Fetch complete order with all details
    const { data: completeOrder } = await supabaseClient
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
      .eq('id', order.id)
      .single()

    const mappedOrder = mapOrderFields(completeOrder)

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
