-- Fix infinite recursion in items table policies

-- Drop the recursive policy
DROP POLICY IF EXISTS "Users can read accessible items" ON items;
DROP POLICY IF EXISTS "Sellers can read items in their order_items" ON items;

-- List all current policies on items
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'items';

-- Create simple, non-recursive policies for items

-- 1. Public can see items for sale
CREATE POLICY "Public read items for sale" ON items
  FOR SELECT
  USING (status = 'FOR_SALE');

-- 2. Users can see their own items (as seller)
CREATE POLICY "Users read own items" ON items
  FOR SELECT
  USING (seller_id::text = auth.uid()::text);

-- 3. Store owners can see all items in their store
CREATE POLICY "Store owners read store items" ON items
  FOR SELECT
  USING (
    store_id::text IN (
      SELECT id::text FROM stores WHERE owner_id::text = auth.uid()::text
    )
  );

-- 4. Buyers can see items they've purchased (SOLD/RESERVED items in their orders)
-- This is the tricky one - use a simple direct query without recursion
CREATE POLICY "Buyers read purchased items" ON items
  FOR SELECT
  USING (
    status IN ('SOLD', 'RESERVED')
    AND id::text IN (
      SELECT oi.item_id::text 
      FROM order_items oi
      JOIN orders o ON o.id::text = oi.order_id::text
      WHERE o.buyer_id::text = auth.uid()::text
    )
  );

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'items'
ORDER BY policyname;
