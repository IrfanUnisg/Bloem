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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { itemIds, userId } = await req.json()

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      throw new Error('Item IDs required')
    }

    if (!userId) {
      throw new Error('User ID required')
    }

    // Fetch items and verify they're available
    const { data: items, error: itemsError } = await supabaseClient
      .from('items')
      .select('*, store:stores!items_store_id_fkey(*)')
      .in('id', itemIds)

    if (itemsError || !items || items.length === 0) {
      throw new Error('Items not found')
    }

    // Verify all items are FOR_SALE
    const unavailableItems = items.filter((item: any) => item.status !== 'FOR_SALE')
    if (unavailableItems.length > 0) {
      throw new Error('Some items are no longer available')
    }

    // Calculate total
    const total = items.reduce((sum: number, item: any) => sum + item.price, 0)
    const storeId = items[0].store_id

    // Items stay FOR_SALE - no order created yet

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to cents
      currency: 'eur',
      metadata: {
        itemIds: JSON.stringify(itemIds),
        storeId: storeId,
        buyerId: userId,
      },
      description: `Bloem Purchase - ${items.length} item(s)`,
      automatic_payment_methods: {
        enabled: true,
      },
    })

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
