-- First, let's see all current policies on items
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'items';

-- Drop the policy we just created to recreate it properly
DROP POLICY IF EXISTS "Sellers can read items in their order_items" ON items;

-- Create a comprehensive read policy for items
-- This allows users to see:
-- 1. Items with status FOR_SALE (public browsing)
-- 2. Their own items (as seller)
-- 3. Items in orders they can access (as buyer, store owner, or seller)
CREATE POLICY "Users can read accessible items" ON items
  FOR SELECT
  USING (
    -- Public items for sale
    status = 'FOR_SALE'
    OR
    -- Items user owns as seller
    seller_id::text = auth.uid()::text
    OR
    -- Items in store owned by user
    EXISTS (
      SELECT 1 FROM stores s
      WHERE s.id::text = items.store_id::text
      AND s.owner_id::text = auth.uid()::text
    )
    OR
    -- Items in orders where user is buyer
    EXISTS (
      SELECT 1 FROM order_items oi
      JOIN orders o ON o.id::text = oi.order_id::text
      WHERE oi.item_id::text = items.id::text
      AND o.buyer_id::text = auth.uid()::text
    )
  );

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'items'
AND policyname = 'Users can read accessible items';
