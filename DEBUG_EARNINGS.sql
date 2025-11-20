-- Check order_items data structure
SELECT 
  oi.id,
  oi.order_id,
  oi.item_id,
  oi.price_at_purchase,
  oi.seller_payout,
  oi.store_commission,
  oi.platform_fee,
  i.title,
  i.seller_id,
  i.store_id,
  i.is_consignment,
  i.status as item_status,
  o.status as order_status,
  o.order_number
FROM order_items oi
JOIN items i ON oi.item_id = i.id
JOIN orders o ON oi.order_id = o.id
ORDER BY oi.created_at DESC
LIMIT 20;

-- Check stores and their items
SELECT 
  s.id as store_id,
  s.name as store_name,
  s.owner_id,
  i.id as item_id,
  i.title,
  i.seller_id,
  i.is_consignment,
  i.status,
  i.price
FROM stores s
LEFT JOIN items i ON i.store_id = s.id
WHERE i.status IN ('SOLD', 'RESERVED')
ORDER BY s.id, i.created_at DESC;

-- Check if seller_payout and store_commission are being calculated
SELECT 
  o.order_number,
  o.status,
  oi.price_at_purchase,
  oi.seller_payout,
  oi.store_commission,
  oi.platform_fee,
  i.is_consignment,
  CASE 
    WHEN i.is_consignment = true THEN 'Consignment - Seller gets payout'
    ELSE 'Store-owned - Store gets full amount'
  END as earnings_type
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN items i ON oi.item_id = i.id
WHERE o.status IN ('COMPLETED', 'RESERVED')
ORDER BY o.created_at DESC;
