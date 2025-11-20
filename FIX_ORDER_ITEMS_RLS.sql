-- Check if order_items exist (bypassing RLS)
-- Run this in Supabase SQL Editor with RLS disabled or as postgres user

-- 1. Check raw order_items data
SELECT 
  oi.id,
  oi.order_id,
  oi.item_id,
  oi.price_at_purchase,
  oi.seller_payout,
  oi.store_commission,
  oi.platform_fee,
  oi.created_at
FROM order_items oi
WHERE oi.order_id::text IN (
  '252018b7-6144-4f04-a7ce-a545e57927a8',
  '2185dde8-bea3-4619-9e4f-cbb2c2d74af3'
);

-- 2. Check RLS policies on order_items
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'order_items';

-- 3. If order_items exist but are blocked by RLS, fix the policy
-- Allow store owners to read order_items for their store's orders
DROP POLICY IF EXISTS "Store owners can read their order items" ON order_items;

CREATE POLICY "Store owners can read their order items" ON order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN stores s ON o.store_id = s.id
      WHERE o.id = order_items.order_id
      AND (
        s.owner_id = auth.uid()
        OR o.buyer_id = auth.uid()
      )
    )
  );

-- 4. Also allow buyers to read their order items
DROP POLICY IF EXISTS "Buyers can read their order items" ON order_items;

CREATE POLICY "Buyers can read their order items" ON order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
      AND o.buyer_id = auth.uid()
    )
  );

-- 5. Sellers can read order_items for items they sold
DROP POLICY IF EXISTS "Sellers can read order items for their items" ON order_items;

CREATE POLICY "Sellers can read order items for their items" ON order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM items i
      WHERE i.id = order_items.item_id
      AND i.seller_id = auth.uid()
    )
  );
