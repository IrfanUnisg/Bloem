-- ============================================
-- 🔍 DIAGNOSE WHY ITEMS NOT SHOWING IN BROWSE
-- ============================================

-- 1. Check all items and their statuses
SELECT 
  i.id,
  i.title,
  i.status,
  i.created_at,
  i.listed_at,
  s.name as store_name,
  s.verified as store_verified,
  s.active as store_active,
  u.name as seller_name
FROM items i
LEFT JOIN stores s ON i.store_id = s.id
LEFT JOIN users u ON i.seller_id = u.id
ORDER BY i.created_at DESC
LIMIT 20;

-- 2. Count items by status
SELECT 
  status, 
  COUNT(*) as count
FROM items
GROUP BY status
ORDER BY count DESC;

-- 3. Check if there are FOR_SALE items
SELECT 
  i.id,
  i.title,
  i.price,
  i.status,
  i.listed_at,
  s.name as store_name,
  s.verified as store_verified,
  s.active as store_active
FROM items i
JOIN stores s ON i.store_id = s.id
WHERE i.status = 'FOR_SALE'
ORDER BY i.listed_at DESC;

-- 4. Check pending items that need acceptance
SELECT 
  i.id,
  i.title,
  i.status,
  i.created_at,
  s.name as store_name,
  s.id as store_id,
  u.name as seller_name
FROM items i
JOIN stores s ON i.store_id = s.id
JOIN users u ON i.seller_id = u.id
WHERE i.status = 'PENDING_DROPOFF'
ORDER BY i.created_at DESC;

-- 5. Check stores status
SELECT 
  id,
  name,
  verified,
  active,
  created_at,
  owner_id
FROM stores
ORDER BY created_at DESC;

-- 6. Check RLS policies on items table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'items';

-- ============================================
-- 🔧 POSSIBLE FIXES
-- ============================================

-- If items exist but status is PENDING_DROPOFF:
-- The store needs to accept them at /store/dropoffs

-- If store is not verified/active:
-- SELECT id, name, verified, active FROM stores;
-- Admin needs to approve at /admin/stores

-- To manually set items to FOR_SALE (EMERGENCY ONLY):
-- UPDATE items 
-- SET status = 'FOR_SALE', listed_at = NOW() 
-- WHERE status = 'PENDING_DROPOFF';

-- To manually verify/activate a store (EMERGENCY ONLY):
-- UPDATE stores 
-- SET verified = true, active = true 
-- WHERE id = 'store-id-here';
