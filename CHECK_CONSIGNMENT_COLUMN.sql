-- Check the actual column name in the items table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'items' 
AND column_name LIKE '%consign%';

-- Check sample data to see the actual values
SELECT id, title, is_consignment, hanger_fee, seller_id, store_id
FROM items
LIMIT 5;
