-- 🚀 ONE-COMMAND FIX for "Some items are not available" error
-- Copy this entire block and run it in Supabase SQL Editor

-- Step 1: Update all items to FOR_SALE status
UPDATE items
SET status = 'FOR_SALE', updated_at = NOW()
WHERE status IN ('PENDING_DROPOFF', 'RESERVED');

-- Step 2: Clean up stale cart items
DELETE FROM cart_items
WHERE item_id NOT IN (SELECT id FROM items);

-- Step 3: Show results
SELECT 
  'Items updated to FOR_SALE' as action,
  COUNT(*) as count
FROM items
WHERE status = 'FOR_SALE'

UNION ALL

SELECT 
  'Active cart items' as action,
  COUNT(*) as count
FROM cart_items;

-- ✅ After running this:
-- 1. Refresh your browser (Ctrl+F5)
-- 2. Go to Browse page and add items to cart
-- 3. Proceed to checkout
-- 4. It should work now!
