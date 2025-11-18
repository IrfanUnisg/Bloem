-- ============================================
-- 🔧 FIX: Items not showing in Browse
-- ============================================
-- ROOT CAUSE: Store RLS policy blocks items from inactive stores
-- The stores table has: USING (active = true)
-- This means items won't show if their store is not active!

-- SOLUTION: Ensure the store is both verified AND active

-- 1. Check current store status
SELECT 
  id,
  name,
  verified,
  active,
  owner_id,
  created_at
FROM stores
WHERE name = 'vintage sg';  -- Replace with your store name

-- 2. If store exists but not active/verified, fix it:
UPDATE stores
SET 
  verified = true,
  active = true,
  updated_at = NOW()
WHERE name = 'vintage sg'  -- Replace with your store name
RETURNING id, name, verified, active;

-- 3. Verify the fix - check if items now appear in browse query
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
AND i.title ILIKE '%north face%';  -- Replace with your item title

-- 4. Test the full browse query (what the app actually runs)
SELECT 
  i.*,
  jsonb_build_object(
    'id', u.id,
    'name', u.name,
    'avatar', u.avatar
  ) as seller,
  jsonb_build_object(
    'id', s.id,
    'name', s.name,
    'city', s.city,
    'address', s.address
  ) as store
FROM items i
LEFT JOIN users u ON i.seller_id = u.id
LEFT JOIN stores s ON i.store_id = s.id
WHERE i.status = 'FOR_SALE'
ORDER BY i.created_at DESC
LIMIT 20;

-- ============================================
-- 💡 EXPLANATION
-- ============================================
-- 
-- The Browse page query joins items with stores:
--   items JOIN stores ON items.store_id = stores.id
--
-- The stores table has an RLS policy:
--   "Public can view active stores" USING (active = true)
--
-- This means:
-- - If store.active = false, the JOIN returns NULL
-- - Row is filtered out by RLS
-- - Item doesn't appear in browse results
--
-- Even though the item itself is FOR_SALE!
--
-- The fix is simple:
--   Make sure store is: verified = true AND active = true
--
-- This should be done through the admin approval flow at:
--   /admin/stores → Approve the store
--
-- But if needed, you can manually fix with the UPDATE above.
-- ============================================

-- 5. Alternative: Update ALL stores to be active (ONLY FOR DEVELOPMENT)
-- ⚠️ DO NOT USE IN PRODUCTION
-- UPDATE stores SET verified = true, active = true WHERE verified = false OR active = false;
