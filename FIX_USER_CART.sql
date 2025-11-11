-- ============================================
-- 🎯 DEBUG FOR SPECIFIC USER
-- ============================================

-- Check this user's cart items
SELECT 
  '=== USER CART ITEMS ===' as info,
  ci.id as cart_item_id,
  ci.item_id,
  i.title,
  i.status,
  i.price,
  s.name as store_name,
  s.id as store_id
FROM cart_items ci
LEFT JOIN items i ON ci.item_id = i.id
LEFT JOIN stores s ON i.store_id = s.id
WHERE ci.user_id = 'dfbc475e-129d-4ae9-b593-430530fe98cd'
ORDER BY ci.added_at DESC;

-- Get the exact item IDs
SELECT 
  '=== ITEM IDS IN CART ===' as info,
  ARRAY_AGG(item_id) as item_ids
FROM cart_items
WHERE user_id = 'dfbc475e-129d-4ae9-b593-430530fe98cd';

-- Check if those specific items have FOR_SALE status
SELECT 
  '=== CHECKING FOR_SALE STATUS ===' as info,
  i.id,
  i.title,
  i.status,
  i.status = 'FOR_SALE' as is_for_sale,
  LENGTH(i.status) as status_length,
  ASCII(SUBSTRING(i.status, 1, 1)) as first_char_code,
  ASCII(SUBSTRING(i.status, LENGTH(i.status), 1)) as last_char_code
FROM items i
WHERE i.id IN (
  SELECT item_id 
  FROM cart_items 
  WHERE user_id = 'dfbc475e-129d-4ae9-b593-430530fe98cd'
);

-- Simulate the exact edge function query
SELECT 
  '=== EDGE FUNCTION QUERY SIMULATION ===' as info,
  COUNT(*) as items_found,
  ARRAY_AGG(id) as found_item_ids
FROM items
WHERE id IN (
  SELECT item_id 
  FROM cart_items 
  WHERE user_id = 'dfbc475e-129d-4ae9-b593-430530fe98cd'
)
AND status = 'FOR_SALE';

-- Compare requested vs available
WITH requested AS (
  SELECT item_id 
  FROM cart_items 
  WHERE user_id = 'dfbc475e-129d-4ae9-b593-430530fe98cd'
),
available AS (
  SELECT id
  FROM items
  WHERE id IN (SELECT item_id FROM requested)
  AND status = 'FOR_SALE'
)
SELECT 
  '=== COMPARISON ===' as info,
  (SELECT COUNT(*) FROM requested) as requested_count,
  (SELECT COUNT(*) FROM available) as available_count,
  (SELECT COUNT(*) FROM requested) = (SELECT COUNT(*) FROM available) as match;

-- Find the problematic items
SELECT 
  '=== ITEMS CAUSING THE ERROR ===' as info,
  i.id,
  i.title,
  i.status,
  i.price,
  'Status should be FOR_SALE but is: ' || i.status as problem
FROM items i
WHERE i.id IN (
  SELECT item_id 
  FROM cart_items 
  WHERE user_id = 'dfbc475e-129d-4ae9-b593-430530fe98cd'
)
AND i.status != 'FOR_SALE';

-- FIX THE ITEMS FOR THIS USER
UPDATE items
SET status = 'FOR_SALE', updated_at = NOW()
WHERE id IN (
  SELECT item_id 
  FROM cart_items 
  WHERE user_id = 'dfbc475e-129d-4ae9-b593-430530fe98cd'
)
AND status != 'SOLD';

-- VERIFY THE FIX
SELECT 
  '=== AFTER FIX ===' as info,
  i.id,
  i.title,
  i.status,
  CASE 
    WHEN i.status = 'FOR_SALE' THEN '✅ FIXED'
    ELSE '❌ STILL WRONG'
  END as result
FROM items i
WHERE i.id IN (
  SELECT item_id 
  FROM cart_items 
  WHERE user_id = 'dfbc475e-129d-4ae9-b593-430530fe98cd'
);
