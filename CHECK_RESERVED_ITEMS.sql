-- ========================================
-- CHECK FOR ITEMS STUCK IN RESERVED STATUS
-- Run this in Supabase SQL Editor
-- ========================================

-- 1. Check all items with RESERVED status
SELECT 
  i.id,
  i.title,
  i.status,
  i.price,
  i.created_at,
  i.updated_at,
  s.name as store_name,
  u.name as seller_name
FROM items i
LEFT JOIN stores s ON i.store_id = s.id
LEFT JOIN users u ON i.seller_id = u.id
WHERE i.status = 'RESERVED'
ORDER BY i.updated_at DESC;

-- 2. Check orders with RESERVED items (should be COMPLETED or CANCELLED)
SELECT 
  o.id as order_id,
  o.order_number,
  o.status as order_status,
  o.created_at as order_created,
  o.completed_at,
  i.id as item_id,
  i.title as item_title,
  i.status as item_status,
  u.email as buyer_email
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN items i ON oi.item_id = i.id
JOIN users u ON o.buyer_id = u.id
WHERE i.status = 'RESERVED'
ORDER BY o.created_at DESC;

-- 3. Check for orphaned RESERVED items (no associated order)
SELECT 
  i.id,
  i.title,
  i.status,
  i.updated_at,
  'No order found' as issue
FROM items i
WHERE i.status = 'RESERVED'
  AND NOT EXISTS (
    SELECT 1 FROM order_items oi WHERE oi.item_id = i.id
  );

-- 4. Status distribution (overview)
SELECT 
  status,
  COUNT(*) as count
FROM items
GROUP BY status
ORDER BY count DESC;

-- ========================================
-- FIX STUCK RESERVED ITEMS
-- ========================================

-- Option A: Return RESERVED items to FOR_SALE if order is CANCELLED
UPDATE items
SET 
  status = 'FOR_SALE',
  updated_at = NOW()
WHERE id IN (
  SELECT i.id
  FROM items i
  JOIN order_items oi ON i.item_id = oi.id
  JOIN orders o ON oi.order_id = o.id
  WHERE i.status = 'RESERVED'
    AND o.status = 'CANCELLED'
);

-- Option B: Mark items as SOLD if order is COMPLETED
UPDATE items
SET 
  status = 'SOLD',
  sold_at = NOW(),
  updated_at = NOW()
WHERE id IN (
  SELECT i.id
  FROM items i
  JOIN order_items oi ON i.item_id = oi.id
  JOIN orders o ON oi.order_id = o.id
  WHERE i.status = 'RESERVED'
    AND o.status = 'COMPLETED'
);

-- Option C: Return orphaned RESERVED items to FOR_SALE (no order)
UPDATE items
SET 
  status = 'FOR_SALE',
  updated_at = NOW()
WHERE status = 'RESERVED'
  AND NOT EXISTS (
    SELECT 1 FROM order_items oi WHERE oi.item_id = id
  );

-- ========================================
-- VERIFY THE FIX
-- ========================================

-- Check if any RESERVED items remain
SELECT 
  COUNT(*) as reserved_items_remaining
FROM items
WHERE status = 'RESERVED';

-- Should return 0 if all fixed
