-- ============================================
-- 🔍 DEEP DATABASE CHECK - Find the Real Problem
-- ============================================

-- 1. Check EXACT status values (including any whitespace or case issues)
SELECT 
  '=== EXACT STATUS VALUES ===' as check_type,
  status,
  LENGTH(status) as status_length,
  COUNT(*) as count,
  ARRAY_AGG(id) as item_ids
FROM items
GROUP BY status
ORDER BY count DESC;

-- 2. Check if status has any weird characters or encoding
SELECT 
  '=== STATUS CHARACTER CHECK ===' as check_type,
  id,
  title,
  status,
  ascii(LEFT(status, 1)) as first_char_ascii,
  ascii(RIGHT(status, 1)) as last_char_ascii,
  LENGTH(status) as length
FROM items
LIMIT 10;

-- 3. Check items in cart specifically
SELECT 
  '=== ITEMS IN CART - DETAILED ===' as check_type,
  ci.id as cart_item_id,
  ci.item_id,
  i.title,
  i.status,
  LENGTH(i.status) as status_length,
  CASE 
    WHEN i.status = 'FOR_SALE' THEN 'EXACT MATCH ✅'
    WHEN UPPER(i.status) = 'FOR_SALE' THEN 'CASE MISMATCH (lowercase?)'
    WHEN TRIM(i.status) = 'FOR_SALE' THEN 'WHITESPACE ISSUE'
    ELSE 'WRONG STATUS: ' || i.status
  END as status_check
FROM cart_items ci
JOIN items i ON ci.item_id = i.id;

-- 4. Check for case sensitivity issues
SELECT 
  '=== CASE SENSITIVITY CHECK ===' as check_type,
  DISTINCT status as actual_status,
  UPPER(status) as uppercase_version,
  LOWER(status) as lowercase_version
FROM items;

-- 5. Show the ACTUAL cart item IDs being sent to checkout
SELECT 
  '=== WHAT CHECKOUT WILL RECEIVE ===' as check_type,
  ci.user_id,
  ci.item_id as item_id_being_sent,
  i.id as actual_item_id,
  i.title,
  i.status,
  i.price,
  CASE 
    WHEN i.status = 'FOR_SALE' THEN '✅ OK'
    ELSE '❌ WILL FAIL: ' || i.status
  END as checkout_result
FROM cart_items ci
LEFT JOIN items i ON ci.item_id = i.id
ORDER BY ci.added_at DESC;

-- 6. Check if there are NULL or missing items
SELECT 
  '=== ORPHANED CART ITEMS ===' as check_type,
  ci.id,
  ci.item_id,
  CASE 
    WHEN i.id IS NULL THEN '❌ ITEM DELETED/MISSING'
    ELSE '✅ Item exists'
  END as item_exists
FROM cart_items ci
LEFT JOIN items i ON ci.item_id = i.id
WHERE i.id IS NULL;

-- 7. Try to find the exact mismatch
SELECT 
  '=== EXACT COMPARISON ===' as check_type,
  id,
  title,
  status,
  status = 'FOR_SALE' as exact_match,
  status::text = 'FOR_SALE'::text as text_match,
  TRIM(status) = 'FOR_SALE' as trimmed_match,
  UPPER(status) = 'FOR_SALE' as upper_match
FROM items
WHERE id IN (SELECT item_id FROM cart_items)
LIMIT 20;
