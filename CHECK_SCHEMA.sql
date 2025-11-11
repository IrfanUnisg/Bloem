-- ============================================
-- 🔬 CHECK DATABASE SCHEMA - Column Names
-- ============================================

-- Check the exact column names in items table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'items'
AND column_name IN ('status', 'id', 'title', 'price', 'store_id')
ORDER BY ordinal_position;

-- Check cart_items table structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'cart_items'
ORDER BY ordinal_position;

-- Check if there are any CHECK constraints on status
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name LIKE '%status%';
