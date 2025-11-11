-- Fix item status to allow checkout
-- This updates all items to FOR_SALE status so they can be purchased

-- First, let's see what statuses we have
SELECT status, COUNT(*) as count
FROM items
GROUP BY status;

-- Update all PENDING_DROPOFF items to FOR_SALE
-- (You can modify this to only update specific items if needed)
UPDATE items
SET 
  status = 'FOR_SALE',
  updated_at = NOW()
WHERE status = 'PENDING_DROPOFF';

-- Verify the update
SELECT status, COUNT(*) as count
FROM items
GROUP BY status;

-- Optional: Update specific items by ID (uncomment and replace with actual IDs)
-- UPDATE items
-- SET status = 'FOR_SALE', updated_at = NOW()
-- WHERE id IN ('item-id-1', 'item-id-2', 'item-id-3');
