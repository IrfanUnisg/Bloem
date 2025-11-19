-- Fix the infinite recursion in order_items RLS policies

-- Drop all existing policies on order_items
DROP POLICY IF EXISTS "Store owners can read their order items" ON order_items;
DROP POLICY IF EXISTS "Buyers can read their order items" ON order_items;
DROP POLICY IF EXISTS "Sellers can read order items for their items" ON order_items;
DROP POLICY IF EXISTS "Users can view order items for their orders" ON order_items;

-- Create simple, non-recursive policies

-- 1. Buyers can see order_items for orders they purchased
CREATE POLICY "Buyers read order_items" ON order_items
  FOR SELECT
  USING (
    order_id::text IN (
      SELECT id::text FROM orders WHERE buyer_id::text = auth.uid()::text
    )
  );

-- 2. Store owners can see order_items for their store's orders
CREATE POLICY "Store owners read order_items" ON order_items
  FOR SELECT
  USING (
    order_id::text IN (
      SELECT o.id::text FROM orders o
      JOIN stores s ON o.store_id::text = s.id::text
      WHERE s.owner_id::text = auth.uid()::text
    )
  );

-- 3. Sellers can see order_items for items they sold
CREATE POLICY "Sellers read order_items" ON order_items
  FOR SELECT
  USING (
    item_id::text IN (
      SELECT id::text FROM items WHERE seller_id::text = auth.uid()::text
    )
  );

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'order_items'
ORDER BY policyname;
