-- ============================================================
-- FIX RESERVED ITEMS - IMMEDIATE ACTION
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. First, check which orders these items belong to
SELECT 
    i.id,
    i.qr_code,
    i.title,
    i.status as item_status,
    o.id as order_id,
    o.order_number,
    o.status as order_status,
    o.created_at as order_date
FROM items i
JOIN order_items oi ON i.id = oi.item_id
JOIN orders o ON oi.order_id = o.id
WHERE i.status = 'RESERVED'
ORDER BY o.created_at DESC;

-- 2. Update items to SOLD for completed orders
UPDATE items
SET 
    status = 'SOLD',
    sold_at = NOW()
WHERE id IN (
    SELECT i.id
    FROM items i
    JOIN order_items oi ON i.id = oi.item_id
    JOIN orders o ON oi.order_id = o.id
    WHERE i.status = 'RESERVED' 
    AND o.status = 'COMPLETED'
);

-- 3. Verify the fix worked
SELECT 
    i.id,
    i.qr_code,
    i.title,
    i.status,
    i.sold_at,
    o.order_number,
    o.status as order_status
FROM items i
JOIN order_items oi ON i.id = oi.item_id
JOIN orders o ON oi.order_id = o.id
WHERE i.qr_code IN (
    'BLM-MT53QTNG-JS1X',
    'BLM-MT54PEEG-ON4A',
    'BLM-MT54I1KL-WBFW',
    'BLM-MT54S2UL-6TJO',
    'BLM-MT55DBEF-TXE8',
    'BLM-MT546F94-NKKH',
    'BLM-MT54P1V1-18XJ',
    'BLM-MT556VRE-1FDA',
    'BLM-MT5OX47Q-JVS1'
);
