-- ========================================
-- COMPREHENSIVE FIX FOR ALL IDENTIFIED ISSUES
-- Run this in Supabase SQL Editor
-- ========================================

-- 1. Fix store owners ability to update items in their store
DROP POLICY IF EXISTS "Users can update their own items" ON items;
DROP POLICY IF EXISTS "Store owners can manage store items" ON items;
DROP POLICY IF EXISTS "Users and store owners can update items" ON items;

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

DROP POLICY IF EXISTS "Users can delete their own items" ON items;
DROP POLICY IF EXISTS "Users and store owners can delete items" ON items;

CREATE POLICY "Users and store owners can delete items"
ON items FOR DELETE
TO authenticated
USING (
  auth.uid()::text = seller_id OR
  store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()::text
  )
);

-- 2. Fix order permissions for store owners
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
DROP POLICY IF EXISTS "Store owners can update store orders" ON orders;
DROP POLICY IF EXISTS "Buyers can update their own orders" ON orders;

CREATE POLICY "Buyers can update their own orders"
ON orders FOR UPDATE
TO authenticated
USING (auth.uid()::text = buyer_id)
WITH CHECK (auth.uid()::text = buyer_id);

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

DROP POLICY IF EXISTS "Buyers can delete their orders" ON orders;
CREATE POLICY "Buyers can delete their orders"
ON orders FOR DELETE
TO authenticated
USING (auth.uid()::text = buyer_id);

-- 3. Admin access to stores (for approval page)
-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins WHERE admins.user_id = is_admin.user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add admin policy for stores table
DROP POLICY IF EXISTS "Admins can view all stores" ON stores;
CREATE POLICY "Admins can view all stores"
ON stores FOR SELECT
TO authenticated
USING (is_admin(auth.uid()::text));

DROP POLICY IF EXISTS "Admins can update all stores" ON stores;
CREATE POLICY "Admins can update all stores"
ON stores FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()::text))
WITH CHECK (is_admin(auth.uid()::text));

-- 4. Admin policies for other tables
DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
TO authenticated
USING (is_admin(auth.uid()::text));

DROP POLICY IF EXISTS "Admins can view all items" ON items;
CREATE POLICY "Admins can view all items"
ON items FOR SELECT
TO authenticated
USING (is_admin(auth.uid()::text));

DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
TO authenticated
USING (is_admin(auth.uid()::text));

DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
CREATE POLICY "Admins can view all transactions"
ON transactions FOR SELECT
TO authenticated
USING (is_admin(auth.uid()::text));

-- 5. Ensure transactions can be updated (for cancellations)
DROP POLICY IF EXISTS "System can update transactions" ON transactions;
CREATE POLICY "System can update transactions"
ON transactions FOR UPDATE
TO authenticated
USING (
  auth.uid()::text = seller_id OR
  is_admin(auth.uid()::text)
)
WITH CHECK (
  auth.uid()::text = seller_id OR
  is_admin(auth.uid()::text)
);

-- Verify all policies are in place
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
