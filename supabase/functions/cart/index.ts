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

    const url = new URL(req.url)
    const method = req.method

    if (method === 'GET') {
      const userId = url.searchParams.get('userId')
      if (!userId) {
        throw new Error('User ID required')
      }

      const { data: cartItems, error } = await supabaseClient
        .from('cart_items')
        .select(`
          *,
          item:items!cart_items_item_id_fkey(
            *,
            store:stores!items_store_id_fkey(id, name, city, address),
            seller:users!items_seller_id_fkey(id, name)
          )
        `)
        .eq('user_id', userId)
        .order('added_at', { ascending: false })

      if (error) throw error

      // Filter out items that are no longer available
      const availableCartItems = (cartItems || []).filter(
        (ci: any) => ci.item?.status === 'FOR_SALE'
      )

      return new Response(JSON.stringify({ cartItems: availableCartItems }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (method === 'POST') {
      const { userId, itemId } = await req.json()

      if (!userId || !itemId) {
        throw new Error('User ID and Item ID required')
      }

      // Check if item exists and is available
      const { data: item, error: itemError } = await supabaseClient
        .from('items')
        .select('*')
        .eq('id', itemId)
        .single()

      if (itemError || !item) {
        throw new Error('Item not found')
      }

      if (item.status !== 'FOR_SALE') {
        throw new Error('Item is not available')
      }

      // Check if already in cart
      const { data: existing } = await supabaseClient
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('item_id', itemId)
        .single()

      if (existing) {
        throw new Error('Item already in cart')
      }

      // Add to cart
      const { data: cartItem, error } = await supabaseClient
        .from('cart_items')
        .insert({
          user_id: userId,
          item_id: itemId,
          quantity: 1,
          added_at: new Date().toISOString(),
        })
        .select(`
          *,
          item:items!cart_items_item_id_fkey(
            *,
            store:stores!items_store_id_fkey(*),
            seller:users!items_seller_id_fkey(*)
          )
        `)
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ cartItem }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      })
    }

    if (method === 'DELETE') {
      const userId = url.searchParams.get('userId')
      const cartItemId = url.searchParams.get('cartItemId')

      if (!userId) {
        throw new Error('User ID required')
      }

      if (cartItemId) {
        // Remove specific item
        const { error } = await supabaseClient
          .from('cart_items')
          .delete()
          .eq('id', cartItemId)
          .eq('userId', userId)

        if (error) throw error

        return new Response(JSON.stringify({ message: 'Item removed from cart' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      } else {
        // Clear entire cart
        const { error } = await supabaseClient
          .from('cart_items')
          .delete()
          .eq('userId', userId)

        if (error) throw error

        return new Response(JSON.stringify({ message: 'Cart cleared' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }
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
