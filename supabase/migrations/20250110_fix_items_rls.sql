-- Enable RLS on items table if not already enabled
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view FOR_SALE items" ON items;
DROP POLICY IF EXISTS "Authenticated users can insert items" ON items;
DROP POLICY IF EXISTS "Users can update their own items" ON items;
DROP POLICY IF EXISTS "Users can delete their own items" ON items;
DROP POLICY IF EXISTS "Store owners can manage store items" ON items;

-- Policy 1: Public can view items that are FOR_SALE
CREATE POLICY "Public can view FOR_SALE items"
ON items
FOR SELECT
TO public
USING (status = 'FOR_SALE');

-- Policy 2: Authenticated users can view all items (for browse/dashboard)
CREATE POLICY "Authenticated users can view all items"
ON items
FOR SELECT
TO authenticated
USING (true);

-- Policy 3: Authenticated users can insert items (upload)
CREATE POLICY "Authenticated users can insert items"
ON items
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid()::text = sellerId OR
  sellerId IS NULL
);

-- Policy 4: Users can update their own items
CREATE POLICY "Users can update their own items"
ON items
FOR UPDATE
TO authenticated
USING (auth.uid()::text = sellerId)
WITH CHECK (auth.uid()::text = sellerId);

-- Policy 5: Users can delete their own items
CREATE POLICY "Users can delete their own items"
ON items
FOR DELETE
TO authenticated
USING (auth.uid()::text = sellerId);

-- Policy 6: Store owners can manage items in their store
CREATE POLICY "Store owners can manage store items"
ON items
FOR ALL
TO authenticated
USING (
  storeId IN (
    SELECT id FROM stores WHERE ownerId = auth.uid()::text
  )
)
WITH CHECK (
  storeId IN (
    SELECT id FROM stores WHERE ownerId = auth.uid()::text
  )
);
