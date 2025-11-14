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

    const url = new URL(req.url)
    const method = req.method

    if (method === 'GET') {
      // Get items with filtering
      const category = url.searchParams.get('category')
      const minPrice = url.searchParams.get('minPrice')
      const maxPrice = url.searchParams.get('maxPrice')
      const size = url.searchParams.get('size')
      const condition = url.searchParams.get('condition')
      const storeId = url.searchParams.get('storeId')
      const status = url.searchParams.get('status') || 'FOR_SALE'
      const limit = parseInt(url.searchParams.get('limit') || '50')
      const offset = parseInt(url.searchParams.get('offset') || '0')

      let query = supabaseClient
        .from('items')
        .select(`
          *,
          seller:users!items_seller_id_fkey(id, name, avatar),
          store:stores!items_store_id_fkey(id, name, city, address)
        `)
        .eq('status', status)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })

      if (category) query = query.eq('category', category)
      if (size) query = query.eq('size', size)
      if (condition) query = query.eq('condition', condition)
      if (storeId) query = query.eq('store_id', storeId)
      if (minPrice) query = query.gte('price', parseFloat(minPrice))
      if (maxPrice) query = query.lte('price', parseFloat(maxPrice))

      const { data: items, error } = await query

      if (error) throw error

      return new Response(JSON.stringify({ items }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (method === 'POST') {
      const body = await req.json()
      const {
        title,
        description,
        category,
        brand,
        size,
        color,
        condition,
        price,
        images,
        store_id,
        seller_id,
        is_consignment = true,
        hanger_fee = 2.0,
      } = body

      // Generate unique QR code
      const qrCode = `BLM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      const { data: item, error } = await supabaseClient
        .from('items')
        .insert({
          title,
          description,
          category,
          brand,
          size,
          color,
          condition,
          price: parseFloat(price),
          images: images || [],
          qr_code: qrCode,
          store_id,
          seller_id,
          is_consignment,
          hanger_fee: parseFloat(hanger_fee),
          status: 'PENDING_DROPOFF',
          uploaded_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ item }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      })
    }

    // Method not allowed
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error:', errorMessage)
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
