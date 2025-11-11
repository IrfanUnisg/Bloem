# Fix Checkout "Items Not Available" Error

## Problem
Getting error: `Error creating order: Error: Some items are not available` even after updating items to FOR_SALE status.

## Root Cause
1. Items in database may not have proper `FOR_SALE` status
2. API function needs better error handling and debugging
3. May need to redeploy the API function

## Solution Steps

### Step 1: Update Database
Run the comprehensive SQL fix:

```sql
-- Copy and paste FIX_FOR_SALE_STATUS.sql into Supabase SQL Editor
```

This will:
- Show current status distribution
- Update all non-SOLD items to FOR_SALE
- Clean up orphaned cart items
- Verify the changes

### Step 2: Redeploy Orders API
The orders API has been updated with better error handling. Redeploy it:

```powershell
# Deploy the updated orders API function
vercel --prod
```

Or deploy just the orders API:
```powershell
vercel deploy --prod
```

### Step 3: Verify in Browser Console
After deployment, when you try to checkout, check the browser console. You should now see detailed logs like:
```
All items found: 2
Item statuses: [{id: '...', status: 'FOR_SALE'}, ...]
FOR_SALE items: 2
```

If you see items with wrong status:
```
Unavailable items: [{id: '...', status: 'PENDING_DROPOFF', title: '...'}]
```

### Step 4: Debug Item Status
If items still have wrong status, run this in Supabase SQL Editor:

```sql
-- Check specific items in cart
SELECT 
  ci.id as cart_item_id,
  i.id as item_id,
  i.title,
  i.status,
  i.price
FROM cart_items ci
JOIN items i ON ci.item_id = i.id
WHERE ci.user_id = 'YOUR_USER_ID'; -- Replace with your user ID
```

### Step 5: Manual Fix (if needed)
If specific items have wrong status, fix them manually:

```sql
-- Update specific items by ID
UPDATE items
SET status = 'FOR_SALE', updated_at = NOW()
WHERE id IN (
  'item-id-1',
  'item-id-2'
  -- Add more item IDs as needed
);
```

## Alternative: Create New Test Items
If issues persist, create fresh test items with FOR_SALE status:

```sql
-- Create test item with FOR_SALE status
INSERT INTO items (
  title,
  description,
  category,
  size,
  condition,
  price,
  status,
  qr_code,
  store_id,
  seller_id,
  is_consignment
) VALUES (
  'Test Item - Blue Jeans',
  'Test item for checkout',
  'Bottoms',
  'M',
  'Excellent',
  29.99,
  'FOR_SALE', -- ✅ Set status to FOR_SALE
  'TEST-QR-' || gen_random_uuid(),
  (SELECT id FROM stores LIMIT 1), -- Uses first store
  (SELECT id FROM users WHERE email = 'seller@example.com'), -- Replace with real seller
  true
);
```

## Quick Test Checklist

- [ ] Run `FIX_FOR_SALE_STATUS.sql` in Supabase
- [ ] Verify all items show `status = 'FOR_SALE'`
- [ ] Redeploy Vercel functions: `vercel --prod`
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Go to Browse page and add items to cart
- [ ] Check browser console for detailed error logs
- [ ] Try checkout
- [ ] If error persists, check browser console for item status details

## Expected Result
✅ Checkout should work
✅ Items should be reserved
✅ Payment flow should initialize

## If Still Not Working
Check the detailed error response in browser console Network tab:
1. Open DevTools (F12)
2. Go to Network tab
3. Try checkout
4. Find the POST request to `/api/orders`
5. Check the Response tab for detailed error with item IDs and statuses
6. Use those IDs to manually fix items in database
