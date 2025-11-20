-- ============================================
-- 🔍 DEBUG: Why can't third user see the item?
-- ============================================
-- Run this to check EVERYTHING about your item

-- 1. Check the specific item (replace with your item title)
SELECT 
  i.id,
  i.title,
  i.status,
  i.price,
  i.created_at,
  i.listed_at,
  i.is_consignment,
  i.seller_id,
  i.store_id,
  s.name as store_name,
  s.verified as store_verified,
  s.active as store_active,
  s.owner_id as store_owner_id,
  u.name as seller_name,
  u.email as seller_email
FROM items i
LEFT JOIN stores s ON i.store_id = s.id
LEFT JOIN users u ON i.seller_id = u.id
WHERE i.title ILIKE '%north face%'  -- Change this to your item title
ORDER BY i.created_at DESC;

-- 2. Check ALL FOR_SALE items
SELECT 
  i.id,
  i.title,
  i.status,
  i.price,
  s.name as store_name,
  s.verified,
  s.active
FROM items i
JOIN stores s ON i.store_id = s.id
WHERE i.status = 'FOR_SALE'
ORDER BY i.listed_at DESC;

-- 3. Check if RLS is blocking (run as different users)
-- This will show you what the database sees
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'items';

-- 4. Check all active RLS policies on items
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'items'
ORDER BY policyname;

-- 5. Check if there are any JOIN issues with stores table
SELECT 
  i.id,
  i.title,
  i.store_id,
  s.id as actual_store_id,
  s.name,
  s.verified,
  s.active
FROM items i
LEFT JOIN stores s ON i.store_id = s.id
WHERE i.status = 'FOR_SALE'
AND s.id IS NULL;  -- This should return NO rows

-- 6. Test the exact query the Browse page uses
-- (This is what the Edge Function runs)
SELECT 
  i.*,
  row_to_json(u.*) as seller,
  row_to_json(s.*) as store
FROM items i
LEFT JOIN users u ON i.seller_id = u.id
LEFT JOIN stores s ON i.store_id = s.id
WHERE i.status = 'FOR_SALE'
ORDER BY i.created_at DESC
LIMIT 10;

-- ============================================
-- 🔧 POTENTIAL FIXES
-- ============================================

-- If store is not verified/active:
-- UPDATE stores 
-- SET verified = true, active = true 
-- WHERE name = 'vintage sg';

-- If item status is wrong:
-- UPDATE items 
-- SET status = 'FOR_SALE', listed_at = NOW() 
-- WHERE title ILIKE '%north face%';

-- If you need to check what a specific user can see:
-- SET ROLE authenticated;
-- SET request.jwt.claims.sub = 'user-id-here';
-- SELECT * FROM items WHERE status = 'FOR_SALE';
-- RESET ROLE;
