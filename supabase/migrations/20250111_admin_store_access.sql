-- Allow admins to view all stores (including pending/inactive)
-- This is needed for the admin stores approval page

-- First, check if admins table exists, if not create it
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('SUPER', 'SUPPORT', 'FINANCE')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on admins table
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Admins can view their own admin record
DROP POLICY IF EXISTS "Admins can view their own record" ON admins;
CREATE POLICY "Admins can view their own record"
ON admins FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id);

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

-- Add admin policy for updating stores (for approval/rejection)
DROP POLICY IF EXISTS "Admins can update all stores" ON stores;
CREATE POLICY "Admins can update all stores"
ON stores FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()::text))
WITH CHECK (is_admin(auth.uid()::text));

-- Add admin policies for other tables as needed
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
