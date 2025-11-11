-- Fix: Allow store owners to update items in their store
-- The issue is that store owners need to be able to update item status
-- when approving/rejecting dropoffs

-- Drop the old restrictive policies
DROP POLICY IF EXISTS "Users can update their own items" ON items;
DROP POLICY IF EXISTS "Store owners can manage store items" ON items;

-- Recreate with proper logic: Users can update their own items OR store owners can update items in their store
CREATE POLICY "Users and store owners can update items"
ON items FOR UPDATE
TO authenticated
USING (
  auth.uid()::text = seller_id OR
  store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()::text
  )
)
WITH CHECK (
  auth.uid()::text = seller_id OR
  store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()::text
  )
);

-- Also allow store owners to delete items from their store
DROP POLICY IF EXISTS "Users can delete their own items" ON items;

CREATE POLICY "Users and store owners can delete items"
ON items FOR DELETE
TO authenticated
USING (
  auth.uid()::text = seller_id OR
  store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()::text
  )
);
