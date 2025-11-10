import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `BLM-${timestamp}-${random}`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const url = new URL(req.url)
    const method = req.method

    if (method === 'GET') {
      const userId = url.searchParams.get('userId')
      const storeId = url.searchParams.get('storeId')
      const status = url.searchParams.get('status')

      let query = supabaseClient
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            item:items(*)
          ),
          buyer:users!orders_buyerId_fkey(id, name, email, phone),
          store:stores!orders_storeId_fkey(id, name, address, city, phone)
        `)
        .order('createdAt', { ascending: false })

      if (userId) query = query.eq('buyerId', userId)
      if (storeId) query = query.eq('storeId', storeId)
      if (status) query = query.eq('status', status)

      const { data: orders, error } = await query

      if (error) throw error

      return new Response(JSON.stringify({ orders }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (method === 'POST') {
      const { userId, itemIds, storeId } = await req.json()

      if (!userId || !itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
        throw new Error('User ID and item IDs required')
      }

      // Fetch all items
      const { data: items, error: itemsError } = await supabaseClient
        .from('items')
        .select('*, store:stores!items_storeId_fkey(*)')
        .in('id', itemIds)
        .eq('status', 'FOR_SALE')

      if (itemsError) throw itemsError

      if (!items || items.length !== itemIds.length) {
        throw new Error('Some items are not available')
      }

      // Verify all items are from the same store
      const itemStoreId = storeId || items[0].storeId
      const allSameStore = items.every((item: any) => item.storeId === itemStoreId)

      if (!allSameStore) {
        throw new Error('All items must be from the same store')
      }

      // Calculate pricing
      const subtotal = items.reduce((sum: number, item: any) => sum + item.price, 0)
      const serviceFee = 0
      const tax = 0
      const total = subtotal + serviceFee + tax

      // Get store commission rate
      const store = items[0].store
      const commissionRate = store.commissionRate || 0.20
      const platformFeeRate = 0.05

      // Create order
      const { data: order, error: orderError } = await supabaseClient
        .from('orders')
        .insert({
          orderNumber: generateOrderNumber(),
          status: 'RESERVED',
          pickupMethod: 'IN_STORE',
          subtotal,
          serviceFee,
          tax,
          total,
          buyerId: userId,
          storeId: itemStoreId,
          createdAt: new Date().toISOString(),
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items and update item statuses
      for (const item of items) {
        const priceAtPurchase = item.price
        const platformFee = priceAtPurchase * platformFeeRate
        const storeCommission = item.isConsignment ? priceAtPurchase * commissionRate : 0
        const sellerPayout = item.isConsignment
          ? priceAtPurchase - storeCommission - platformFee
          : 0

        // Create order item
        await supabaseClient.from('order_items').insert({
          orderId: order.id,
          itemId: item.id,
          priceAtPurchase,
          sellerPayout,
          storeCommission,
          platformFee,
          createdAt: new Date().toISOString(),
        })

        // Update item status to RESERVED
        await supabaseClient
          .from('items')
          .update({ status: 'RESERVED', updatedAt: new Date().toISOString() })
          .eq('id', item.id)

        // Create transaction record if consignment
        if (item.isConsignment && item.sellerId) {
          await supabaseClient.from('transactions').insert({
            amount: priceAtPurchase,
            sellerEarnings: sellerPayout,
            storeCommission,
            platformFee,
            status: 'PENDING',
            orderId: order.id,
            itemId: item.id,
            sellerId: item.sellerId,
            createdAt: new Date().toISOString(),
          })
        }
      }

      // Clear cart items
      await supabaseClient
        .from('cart_items')
        .delete()
        .eq('userId', userId)
        .in('itemId', itemIds)

      // Fetch complete order
      const { data: completeOrder } = await supabaseClient
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            item:items(*)
          ),
          buyer:users!orders_buyerId_fkey(*),
          store:stores!orders_storeId_fkey(*)
        `)
        .eq('id', order.id)
        .single()

      return new Response(JSON.stringify({ order: completeOrder }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
