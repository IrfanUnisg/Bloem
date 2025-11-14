// @ts-nocheck - Deno edge function
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { orderId, paymentMethod = 'CARD' } = await req.json()

    if (!orderId) {
      throw new Error('Order ID required')
    }

    // Fetch order
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          item:items(*)
        )
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      throw new Error('Order not found')
    }

    if (order.status !== 'RESERVED') {
      throw new Error('Order cannot be completed')
    }

    // Update order status
    await supabaseClient
      .from('orders')
      .update({
        status: 'COMPLETED',
        payment_method: paymentMethod,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    // Update all items to SOLD
    const itemIds = order.items.map((oi: any) => oi.item_id)
    await supabaseClient
      .from('items')
      .update({
        status: 'SOLD',
        sold_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .in('id', itemIds)

    // Complete all transactions
    await supabaseClient
      .from('transactions')
      .update({
        status: 'COMPLETED',
        completed_at: new Date().toISOString(),
      })
      .eq('order_id', orderId)

    // Fetch updated order
    const { data: completedOrder } = await supabaseClient
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

    return new Response(JSON.stringify({ order: completedOrder }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
