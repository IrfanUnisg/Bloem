-- Debug Analytics Data Issues
-- Run this in Supabase SQL Editor to check the data

-- 1. Check if there are any completed orders
SELECT 
    o.id,
    o.order_number,
    o.status,
    o.total,
    o.created_at
FROM orders o
ORDER BY o.created_at DESC
LIMIT 10;

-- 2. Check order_items and their payout fields
SELECT 
    oi.id,
    oi.order_id,
    oi.item_id,
    oi.price_at_purchase,
    oi.seller_payout,
    oi.store_commission,
    oi.platform_fee,
    o.status as order_status
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
ORDER BY oi.created_at DESC
LIMIT 10;

-- 3. Check items and their seller_id
SELECT 
    i.id,
    i.title,
    i.seller_id,
    i.status,
    i.price,
    i.sold_at,
    u.name as seller_name
FROM items i
LEFT JOIN users u ON i.seller_id = u.id
WHERE i.status IN ('SOLD', 'RESERVED')
ORDER BY i.created_at DESC
LIMIT 10;

-- 4. Check transactions table
SELECT 
    t.id,
    t.order_id,
    t.seller_id,
    t.amount,
    t.seller_earnings,
    t.store_commission,
    t.platform_fee,
    t.status,
    u.name as seller_name
FROM transactions t
LEFT JOIN users u ON t.seller_id = u.id
ORDER BY t.created_at DESC
LIMIT 10;

-- 5. Check if seller_payout is NULL in order_items
SELECT 
    COUNT(*) as total_order_items,
    COUNT(seller_payout) as items_with_payout,
    SUM(CASE WHEN seller_payout IS NULL THEN 1 ELSE 0 END) as items_without_payout,
    SUM(seller_payout) as total_seller_payouts
FROM order_items;
