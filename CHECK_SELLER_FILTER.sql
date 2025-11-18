-- ============================================
-- 🔍 CHECK: Are you viewing with the seller account?
-- ============================================

-- 1. Find your item and see who the seller is
SELECT 
  i.id as item_id,
  i.title,
  i.status,
  i.seller_id,
  u.name as seller_name,
  u.email as seller_email
FROM items i
LEFT JOIN users u ON i.seller_id = u.id
WHERE i.title ILIKE '%north face%'  -- Your item
ORDER BY i.created_at DESC;

-- 2. List ALL users in your system
SELECT 
  id,
  name,
  email,
  created_at
FROM users
ORDER BY created_at DESC;

-- 3. Check if the browse query would return your item
-- (This simulates what happens BEFORE the seller_id filter)
SELECT 
  i.id,
  i.title,
  i.status,
  i.seller_id,
  s.name as store_name,
  s.active as store_active,
  s.verified as store_verified
FROM items i
LEFT JOIN stores s ON i.store_id = s.id
WHERE i.status = 'FOR_SALE'
ORDER BY i.created_at DESC;

-- ============================================
-- 🎯 THE ISSUE
-- ============================================
-- The Browse page has this code:
--
--   if (user) {
--     filtered = filtered.filter(item => 
--       (item as any).seller_id !== user.id
--     );
--   }
--
-- This means: "Don't show me my own items"
--
-- So if you're logged in as the SELLER (account 1),
-- you will NEVER see your own items in Browse!
--
-- You must log in as a DIFFERENT user (account 3)
-- who is NOT the seller.
-- ============================================

-- 4. To test, you need to know:
--    - What is the seller_id of the item?
--    - What is the user.id of the account you're browsing with?
--    - Are they the same? If YES → item will be hidden!

-- 5. SOLUTION: 
--    Create a completely NEW user account (not the seller)
--    Or browse while logged OUT (anonymous users see all items)
