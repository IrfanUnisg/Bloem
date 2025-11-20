-- Fix RLS policy to allow Edge Functions to update item status
-- Edge Functions run with the service role, but need explicit permission

-- Drop existing restrictive update policy
DROP POLICY IF EXISTS "Users can update their own items" ON items;
DROP POLICY IF EXISTS "Store owners can manage store items" ON items;

-- Allow users to update their own items
CREATE POLICY "Users can update their own items"
ON items FOR UPDATE
TO authenticated
USING (auth.uid()::text = seller_id)
WITH CHECK (auth.uid()::text = seller_id);

-- Allow store owners to update items in their store
CREATE POLICY "Store owners can update store items"
ON items FOR UPDATE
TO authenticated
USING (
  store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()::text
  )
)
WITH CHECK (
  store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()::text
  )
);

-- CRITICAL: Allow service role (Edge Functions) to update items
-- This is needed for order processing to update item status
CREATE POLICY "Service role can update items"
ON items FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);
