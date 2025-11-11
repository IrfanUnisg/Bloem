-- Fix: Allow store owners and buyers to update orders
-- Store owners need to update orders when processing checkout
-- Buyers need to update orders when canceling

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
DROP POLICY IF EXISTS "Store owners can update store orders" ON orders;

-- Allow buyers to update their own orders (for cancellation)
CREATE POLICY "Buyers can update their own orders"
ON orders FOR UPDATE
TO authenticated
USING (auth.uid()::text = buyer_id)
WITH CHECK (auth.uid()::text = buyer_id);

-- Allow store owners to update orders in their store (for completion)
CREATE POLICY "Store owners can update store orders"
ON orders FOR UPDATE
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

-- Also allow users to delete/cancel their own orders
DROP POLICY IF EXISTS "Buyers can delete their orders" ON orders;
CREATE POLICY "Buyers can delete their orders"
ON orders FOR DELETE
TO authenticated
USING (auth.uid()::text = buyer_id);
