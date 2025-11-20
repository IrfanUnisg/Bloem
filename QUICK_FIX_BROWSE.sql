-- ============================================
-- ⚡ ONE-STEP FIX: Make items visible in Browse
-- ============================================
-- Just run this one command!

-- Update the store to be verified and active
UPDATE stores
SET 
  verified = true,
  active = true,
  updated_at = NOW()
WHERE name ILIKE '%vintage%'  -- Matches "vintage sg" from your screenshot
RETURNING id, name, verified, active;

-- That's it! Now refresh the Browse page and your items should appear.
-- ============================================

-- To verify it worked, run this:
-- SELECT i.title, i.status, s.name, s.active, s.verified
-- FROM items i JOIN stores s ON i.store_id = s.id
-- WHERE i.status = 'FOR_SALE';
