-- Fix RLS policies for order_items table
-- Run this entire script in Supabase SQL Editor

-- 1. Drop existing policies
DROP POLICY IF EXISTS "Store owners can read their order items" ON order_items;
DROP POLICY IF EXISTS "Buyers can read their order items" ON order_items;
DROP POLICY IF EXISTS "Sellers can read order items for their items" ON order_items;

-- 2. Create new comprehensive policy for store owners
CREATE POLICY "Store owners can read their order items" ON order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN stores s ON o.store_id::text = s.id::text
      WHERE o.id::text = order_items.order_id::text
      AND s.owner_id::text = auth.uid()::text
    )
  );

-- 3. Allow buyers to read their order items
CREATE POLICY "Buyers can read their order items" ON order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id::text = order_items.order_id::text
      AND o.buyer_id::text = auth.uid()::text
    )
  );

-- 4. Sellers can read order_items for items they sold
CREATE POLICY "Sellers can read order items for their items" ON order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM items i
      WHERE i.id::text = order_items.item_id::text
      AND i.seller_id::text = auth.uid()::text
    )
  );

-- 5. Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'order_items';
