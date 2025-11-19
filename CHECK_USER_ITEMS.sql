-- Check which items belong to the current user
-- Replace USER_ID with: 4370423f-e749-429d-ad90-ff090e534da9

SELECT 
  i.id,
  i.title,
  i.seller_id,
  i.status,
  i.price,
  i.is_consignment,
  u.name as seller_name,
  u.email as seller_email
FROM items i
LEFT JOIN users u ON i.seller_id::text = u.id::text
WHERE i.seller_id::text = '4370423f-e749-429d-ad90-ff090e534da9'
ORDER BY i.created_at DESC;

-- Check all users to see who's who
SELECT 
  id,
  name,
  email
FROM users
ORDER BY created_at DESC;

-- Check the sold items in order_items
SELECT 
  oi.id,
  oi.order_id,
  oi.seller_payout,
  oi.store_commission,
  i.title,
  i.seller_id,
  i.is_consignment,
  o.order_number,
  o.status
FROM order_items oi
JOIN items i ON oi.item_id::text = i.id::text
JOIN orders o ON oi.order_id::text = o.id::text
WHERE i.seller_id::text = '4370423f-e749-429d-ad90-ff090e534da9';
