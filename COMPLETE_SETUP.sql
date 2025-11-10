-- ========================================
-- COMPLETE SETUP: STORAGE + RLS POLICIES
-- ========================================

-- ========================================
-- PART 1: STORAGE BUCKET SETUP
-- ========================================

-- Create storage bucket for item images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'items',
  'items',
  true,
  52428800, -- 50 MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload item images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own item images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own item images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for item images" ON storage.objects;

-- Set up storage policies for the items bucket
CREATE POLICY "Authenticated users can upload item images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'items');

CREATE POLICY "Users can update their own item images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'items');

CREATE POLICY "Users can delete their own item images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'items');

CREATE POLICY "Public read access for item images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'items');

-- ========================================
-- PART 2: TABLE RLS POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE dropoff_slots ENABLE ROW LEVEL SECURITY;

-- ========================================
-- USERS TABLE POLICIES
-- ========================================

DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Public can view basic user info" ON users;

CREATE POLICY "Users can view their own profile"
ON users FOR SELECT
TO authenticated
USING (auth.uid()::text = id);

CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid()::text = id)
WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Public can view basic user info"
ON users FOR SELECT
TO public
USING (true);

-- ========================================
-- STORES TABLE POLICIES
-- ========================================

DROP POLICY IF EXISTS "Public can view active stores" ON stores;
DROP POLICY IF EXISTS "Store owners can manage their stores" ON stores;

CREATE POLICY "Public can view active stores"
ON stores FOR SELECT
TO public
USING (active = true);

CREATE POLICY "Store owners can manage their stores"
ON stores FOR ALL
TO authenticated
USING (auth.uid()::text = owner_id)
WITH CHECK (auth.uid()::text = owner_id);

-- ========================================
-- ITEMS TABLE POLICIES
-- ========================================

DROP POLICY IF EXISTS "Public can view FOR_SALE items" ON items;
DROP POLICY IF EXISTS "Authenticated users can view all items" ON items;
DROP POLICY IF EXISTS "Authenticated users can insert items" ON items;
DROP POLICY IF EXISTS "Users can update their own items" ON items;
DROP POLICY IF EXISTS "Users can delete their own items" ON items;
DROP POLICY IF EXISTS "Store owners can manage store items" ON items;

CREATE POLICY "Public can view FOR_SALE items"
ON items FOR SELECT
TO public
USING (status = 'FOR_SALE');

CREATE POLICY "Authenticated users can view all items"
ON items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert items"
ON items FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid()::text = seller_id OR
  seller_id IS NULL
);

CREATE POLICY "Users can update their own items"
ON items FOR UPDATE
TO authenticated
USING (auth.uid()::text = seller_id)
WITH CHECK (auth.uid()::text = seller_id);

CREATE POLICY "Users can delete their own items"
ON items FOR DELETE
TO authenticated
USING (auth.uid()::text = seller_id);

CREATE POLICY "Store owners can manage store items"
ON items FOR ALL
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

-- ========================================
-- CART_ITEMS TABLE POLICIES
-- ========================================

DROP POLICY IF EXISTS "Users can manage their own cart" ON cart_items;

CREATE POLICY "Users can manage their own cart"
ON cart_items FOR ALL
TO authenticated
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- ========================================
-- ORDERS TABLE POLICIES
-- ========================================

DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Store owners can view store orders" ON orders;

CREATE POLICY "Users can view their own orders"
ON orders FOR SELECT
TO authenticated
USING (auth.uid()::text = buyer_id);

CREATE POLICY "Users can create orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = buyer_id);

CREATE POLICY "Store owners can view store orders"
ON orders FOR SELECT
TO authenticated
USING (
  store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()::text
  )
);

-- ========================================
-- ORDER_ITEMS TABLE POLICIES
-- ========================================

DROP POLICY IF EXISTS "Users can view order items for their orders" ON order_items;
DROP POLICY IF EXISTS "Users can insert order items" ON order_items;

CREATE POLICY "Users can view order items for their orders"
ON order_items FOR SELECT
TO authenticated
USING (
  order_id IN (
    SELECT id FROM orders WHERE buyer_id = auth.uid()::text
  )
);

CREATE POLICY "Users can insert order items"
ON order_items FOR INSERT
TO authenticated
WITH CHECK (
  order_id IN (
    SELECT id FROM orders WHERE buyer_id = auth.uid()::text
  )
);

-- ========================================
-- TRANSACTIONS TABLE POLICIES
-- ========================================

DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Store owners can view store transactions" ON transactions;

CREATE POLICY "Users can view their own transactions"
ON transactions FOR SELECT
TO authenticated
USING (auth.uid()::text = seller_id);

CREATE POLICY "Store owners can view store transactions"
ON transactions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders o
    WHERE o.id = order_id
    AND o.store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()::text
    )
  )
);

-- ========================================
-- PAYOUTS TABLE POLICIES
-- ========================================

DROP POLICY IF EXISTS "Users can view their own payouts" ON payouts;

CREATE POLICY "Users can view their own payouts"
ON payouts FOR SELECT
TO authenticated
USING (
  auth.uid()::text = seller_id OR
  store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()::text
  )
);

-- ========================================
-- ANALYTICS TABLE POLICIES
-- ========================================

DROP POLICY IF EXISTS "Store owners can view their analytics" ON analytics;

CREATE POLICY "Store owners can view their analytics"
ON analytics FOR ALL
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

-- ========================================
-- DROPOFF_SLOTS TABLE POLICIES
-- ========================================

DROP POLICY IF EXISTS "Public can view dropoff slots" ON dropoff_slots;
DROP POLICY IF EXISTS "Store owners can manage dropoff slots" ON dropoff_slots;

CREATE POLICY "Public can view dropoff slots"
ON dropoff_slots FOR SELECT
TO public
USING (available = true);

CREATE POLICY "Store owners can manage dropoff slots"
ON dropoff_slots FOR ALL
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
