-- Check RLS policies on items table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'items';

-- Add a policy to allow sellers to read items in order_items for their orders
DROP POLICY IF EXISTS "Sellers can read items in their order_items" ON items;

CREATE POLICY "Sellers can read items in their order_items" ON items
  FOR SELECT
  USING (
    -- Allow if user is the seller
    seller_id::text = auth.uid()::text
    OR
    -- Allow if item is in an order_item that the user can see
    EXISTS (
      SELECT 1 FROM order_items oi
      WHERE oi.item_id::text = items.id::text
    )
  );
