-- ============================================
-- 🚀 ONE-STEP FIX FOR CHECKOUT ERROR
-- ============================================
-- Copy this entire block and paste into Supabase SQL Editor
-- Then click "RUN" once
-- ============================================

-- 1. Show current problem
SELECT '📊 BEFORE FIX - Item Status Distribution' as info;
SELECT 
  status,
  COUNT(*) as count,
  CASE 
    WHEN status = 'FOR_SALE' THEN '✅ Good'
    ELSE '❌ Will cause checkout error'
  END as checkout_ready
FROM items
GROUP BY status
ORDER BY count DESC;

-- 2. Show items in cart and their status
SELECT '🛒 CART ITEMS - Current Status' as info;
SELECT 
  ci.id as cart_item_id,
  i.title,
  i.status as current_status,
  CASE 
    WHEN i.status = 'FOR_SALE' THEN '✅ OK'
    WHEN i.status IS NULL THEN '❌ ITEM DELETED'
    ELSE '❌ NEEDS FIX: ' || i.status
  END as checkout_status
FROM cart_items ci
LEFT JOIN items i ON ci.item_id = i.id;

-- 3. FIX IT! Update all items to FOR_SALE
UPDATE items
SET 
  status = 'FOR_SALE',
  updated_at = NOW()
WHERE status NOT IN ('SOLD');  -- Don't change sold items

-- 4. Verify the fix
SELECT '✅ AFTER FIX - All Items Should Be FOR_SALE Now' as info;
SELECT 
  status,
  COUNT(*) as count
FROM items
GROUP BY status;

-- 5. Verify cart items are now ready
SELECT '✅ CART ITEMS - After Fix' as info;
SELECT 
  ci.id as cart_item_id,
  i.title,
  i.status,
  i.price,
  '✅ READY FOR CHECKOUT' as status_check
FROM cart_items ci
LEFT JOIN items i ON ci.item_id = i.id
WHERE i.status = 'FOR_SALE';

-- 6. Clean up any orphaned cart items
DELETE FROM cart_items
WHERE item_id NOT IN (SELECT id FROM items);

SELECT '✨ FIX COMPLETE!' as info;

-- ============================================
-- ✅ NEXT STEPS:
-- ============================================
-- 1. Deploy the updated Supabase function:
--    supabase functions deploy orders
--
-- 2. Clear browser cache (Ctrl+Shift+Delete)
--
-- 3. Hard refresh (Ctrl+F5)
--
-- 4. Try checkout again
--
-- 5. If still error, check browser console (F12)
--    for detailed error showing which specific
--    items have wrong status
-- ============================================
