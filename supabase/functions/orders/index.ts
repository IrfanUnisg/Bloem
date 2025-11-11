import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
          buyer:users!orders_buyer_id_fkey(id, name, email, phone),
          store:stores!orders_store_id_fkey(id, name, address, city, phone)
        `)
        .order('created_at', { ascending: false })

      if (userId) query = query.eq('buyer_id', userId)
      if (storeId) query = query.eq('store_id', storeId)
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

      // Fetch ALL items first (without status filter) to see what's wrong
      const { data: allItems, error: allItemsError } = await supabaseClient
        .from('items')
        .select('*, store:stores!items_store_id_fkey(*)')
        .in('id', itemIds)

      if (allItemsError) throw allItemsError

      console.log('DEBUG: Requested item IDs:', itemIds)
      console.log('DEBUG: Found items:', allItems?.length)
      console.log('DEBUG: Item statuses:', allItems?.map((i: any) => ({ id: i.id, title: i.title, status: i.status })))

      // Filter for FOR_SALE items
      const items = allItems?.filter((item: any) => item.status === 'FOR_SALE') || []

      console.log('DEBUG: FOR_SALE items:', items.length)

      if (!items || items.length === 0) {
        const itemStatuses = allItems?.map((i: any) => `${i.title}: ${i.status}`).join(', ')
        throw new Error(`No items available for purchase. Item statuses: ${itemStatuses}`)
      }

      if (items.length !== itemIds.length) {
        const unavailableItems = allItems?.filter((item: any) => item.status !== 'FOR_SALE')
        const unavailableDetails = unavailableItems?.map((i: any) => `${i.title} (status: ${i.status})`).join(', ')
        throw new Error(`Some items are not available: ${unavailableDetails}`)
      }

      // Verify all items are from the same store
      const itemStoreId = storeId || items[0].store_id
      const allSameStore = items.every((item: any) => item.store_id === itemStoreId)

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
          order_number: generateOrderNumber(),
          status: 'RESERVED',
          pickup_method: 'IN_STORE',
          subtotal,
          service_fee: serviceFee,
          tax,
          total,
          buyer_id: userId,
          store_id: itemStoreId,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items and update item statuses
      for (const item of items) {
        const priceAtPurchase = item.price
        const platformFee = priceAtPurchase * platformFeeRate
        const storeCommission = item.is_consignment ? priceAtPurchase * commissionRate : 0
        const sellerPayout = item.is_consignment
          ? priceAtPurchase - storeCommission - platformFee
          : 0

        // Create order item
        await supabaseClient.from('order_items').insert({
          order_id: order.id,
          item_id: item.id,
          price_at_purchase: priceAtPurchase,
          seller_payout: sellerPayout,
          store_commission: storeCommission,
          platform_fee: platformFee,
          created_at: new Date().toISOString(),
        })

        // Update item status to RESERVED
        await supabaseClient
          .from('items')
          .update({ status: 'RESERVED', updated_at: new Date().toISOString() })
          .eq('id', item.id)

        // Create transaction record if consignment
        if (item.is_consignment && item.seller_id) {
          await supabaseClient.from('transactions').insert({
            amount: priceAtPurchase,
            seller_earnings: sellerPayout,
            store_commission: storeCommission,
            platform_fee: platformFee,
            status: 'PENDING',
            order_id: order.id,
            item_id: item.id,
            seller_id: item.seller_id,
            created_at: new Date().toISOString(),
          })
        }
      }

      // Clear cart items
      await supabaseClient
        .from('cart_items')
        .delete()
        .eq('user_id', userId)
        .in('item_id', itemIds)

      // Fetch complete order
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
