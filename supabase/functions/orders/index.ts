// @ts-nocheck - Deno edge function
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

// Generate unique order number for tracking
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `BLM-${timestamp}-${random}`
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
    // Create client with service role for all order operations
    // This ensures we can fetch items even when they're SOLD (not just FOR_SALE)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    // Get and validate the user authentication from the request
    const authHeader = req.headers.get('Authorization')
    console.log('DEBUG: Auth header present:', !!authHeader)
    
    if (!authHeader) {
      console.error('No authorization header in request')
      throw new Error('No authorization header')
    }

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

      // Map snake_case fields to camelCase for frontend
      const mappedOrders = orders?.map(mapOrderFields) || []

      return new Response(JSON.stringify({ orders: mappedOrders }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (method === 'POST') {
      const { userId, itemIds, storeId } = await req.json()

      console.log('DEBUG: POST /orders - userId:', userId, 'itemIds:', itemIds)

      if (!userId || !itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
        throw new Error('User ID and item IDs required')
      }

      // Verify user from Authorization header
      const userClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        {
          global: {
            headers: { Authorization: authHeader },
          },
        }
      )
      
      const { data: { user }, error: authError } = await userClient.auth.getUser()
      if (authError) {
        console.error('AUTH ERROR:', authError)
        throw new Error(`Authentication failed: ${authError.message}`)
      }
      if (!user) {
        throw new Error('User not authenticated')
      }
      console.log('DEBUG: Authenticated user:', user.id)

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

      // Group items by store to create separate orders for each store
      const itemsByStore = items.reduce((acc: any, item: any) => {
        const storeId = item.store_id
        if (!acc[storeId]) {
          acc[storeId] = []
        }
        acc[storeId].push(item)
        return acc
      }, {})

      const platformFeeRate = 0.03 // 3% platform fee (combined with 7% store commission = 10% total)
      const createdOrders = []

      // Create separate orders for each store
      for (const [currentStoreId, storeItems] of Object.entries(itemsByStore)) {
        const storeItemsArray = storeItems as any[]
        
        // Calculate pricing for this store's items
        const subtotal = storeItemsArray.reduce((sum: number, item: any) => sum + item.price, 0)
        
        // Service fee (10% only on consignment items, deducted from seller payout, shown for transparency)
        const consignmentSubtotal = storeItemsArray
          .filter((item: any) => item.is_consignment)
          .reduce((sum: number, item: any) => sum + item.price, 0)
        const serviceFee = consignmentSubtotal * 0.10
        const tax = 0
        // Buyers pay only the item price; fee is deducted from seller's payout
        const total = subtotal

        // Get store commission rate
        const store = storeItemsArray[0].store
        const commissionRate = store.commissionRate || 0.07

        // Create order with PENDING status (awaiting payment)
        const { data: order, error: orderError } = await supabaseClient
          .from('orders')
          .insert({
            order_number: generateOrderNumber(),
            status: 'PENDING',
            pickup_method: 'IN_STORE',
            subtotal,
            service_fee: serviceFee,
            tax,
            total,
            buyer_id: userId,
            store_id: currentStoreId,
            created_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (orderError) throw orderError

        // Create order items but DON'T change item status (items stay FOR_SALE until payment)
        for (const item of storeItemsArray) {
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

          // DO NOT update item status - items remain FOR_SALE until payment succeeds

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

        createdOrders.push(order)
      }

      // NOTE: Cart items will be cleared AFTER successful payment confirmation
      // in the confirm-payment function, not here during order creation

      // Fetch complete orders with details
      const { data: completeOrders } = await supabaseClient
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
        .in('id', createdOrders.map(o => o.id))

      // Map snake_case fields to camelCase for frontend
      const mappedOrders = completeOrders?.map(mapOrderFields) || []

      // Return the first order for backward compatibility (frontend expects single order)
      // In the future, this can be updated to handle multiple orders
      return new Response(JSON.stringify({ order: mappedOrders[0], orders: mappedOrders }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('ORDERS ERROR:', errorMessage, error)
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
