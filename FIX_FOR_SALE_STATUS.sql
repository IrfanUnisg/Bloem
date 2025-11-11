-- ============================================
-- FIX FOR_SALE STATUS - Complete Solution
-- ============================================

-- Step 1: Check current status distribution
SELECT 
  '=== BEFORE UPDATE ===' as info,
  status,
  COUNT(*) as count
FROM items
GROUP BY status
ORDER BY count DESC;

-- Step 2: Show items that are not FOR_SALE
SELECT 
  '=== ITEMS NOT FOR_SALE ===' as info,
  id,
  title,
  status,
  price,
  store_id,
  created_at
FROM items
WHERE status != 'FOR_SALE'
ORDER BY created_at DESC
LIMIT 20;

-- Step 3: Show cart items and their item statuses
SELECT 
  '=== CART ITEMS STATUS ===' as info,
  ci.id as cart_item_id,
  ci.user_id,
  ci.item_id,
  i.title,
  i.status as item_status,
  i.price
FROM cart_items ci
LEFT JOIN items i ON ci.item_id = i.id
ORDER BY ci.added_at DESC;

-- Step 4: Update ALL items to FOR_SALE (except sold items)
-- This will update items that are PENDING_DROPOFF, RESERVED, REMOVED, etc.
UPDATE items
SET 
  status = 'FOR_SALE',
  updated_at = NOW()
WHERE status NOT IN ('SOLD');

-- Step 5: Verify the update
SELECT 
  '=== AFTER UPDATE ===' as info,
  status,
  COUNT(*) as count
FROM items
GROUP BY status
ORDER BY count DESC;

-- Step 6: Show all FOR_SALE items
SELECT 
  '=== FOR_SALE ITEMS ===' as info,
  id,
  title,
  status,
  price,
  store_id,
  is_consignment
FROM items
WHERE status = 'FOR_SALE'
ORDER BY created_at DESC
LIMIT 20;

-- Step 7: Clean up orphaned cart items (items that don't exist)
DELETE FROM cart_items
WHERE item_id NOT IN (SELECT id FROM items);

-- Step 8: Final verification - cart items with FOR_SALE status
SELECT 
  '=== CART ITEMS WITH FOR_SALE ===' as info,
  ci.id as cart_item_id,
  ci.user_id,
  ci.item_id,
  i.title,
  i.status,
  i.price,
  CASE 
    WHEN i.status = 'FOR_SALE' THEN '✅ OK'
    ELSE '❌ NEEDS FIX'
  END as availability
FROM cart_items ci
LEFT JOIN items i ON ci.item_id = i.id
ORDER BY ci.added_at DESC;

-- ============================================
-- ✅ VERIFICATION COMPLETE
-- 
-- After running this:
-- 1. Check the console output for any items that are not FOR_SALE
-- 2. All non-SOLD items should now be FOR_SALE
-- 3. Redeploy the orders API function (see commands below)
-- 4. Clear browser cache (Ctrl+Shift+Delete)
-- 5. Try checkout again
-- ============================================
