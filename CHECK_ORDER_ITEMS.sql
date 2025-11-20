-- Check what's in the orders and order_items tables
SELECT 
  o.id as order_id,
  o.order_number,
  o.status,
  o.store_id,
  o.completed_at,
  o.created_at,
  COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.status = 'COMPLETED'
GROUP BY o.id, o.order_number, o.status, o.store_id, o.completed_at, o.created_at
ORDER BY o.created_at DESC;

-- Check order_items directly
SELECT 
  oi.id,
  oi.order_id,
  oi.item_id,
  oi.price_at_purchase,
  oi.seller_payout,
  oi.store_commission,
  oi.platform_fee,
  o.order_number,
  o.status as order_status,
  o.store_id,
  i.title,
  i.is_consignment
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
JOIN items i ON oi.item_id = i.id
WHERE o.status = 'COMPLETED'
ORDER BY oi.created_at DESC;

-- Check if completed_at is NULL
SELECT 
  id,
  order_number,
  status,
  store_id,
  completed_at,
  created_at
FROM orders
WHERE status = 'COMPLETED'
ORDER BY created_at DESC;
