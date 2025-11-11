# COMPLETE FIX: Checkout "Items Not Available" Error

## Current Situation
You're getting: `Error: Some items are not available` when trying to checkout.

## Root Cause
The Supabase Edge Function checks if items have `status = 'FOR_SALE'`, but your items likely have a different status (like `PENDING_DROPOFF`, `RESERVED`, etc.)

## STEP-BY-STEP FIX

### ✅ Step 1: Debug - Find the Problem
Run this in **Supabase SQL Editor**:

```sql
-- Copy and paste the entire DEBUG_CHECKOUT_ISSUE.sql file
```

This will show you:
- What items exist
- What's in your cart
- What status each item has
- Which items are preventing checkout

### ✅ Step 2: Fix Database - Update Item Status
Run this in **Supabase SQL Editor**:

```sql
-- Update ALL items to FOR_SALE (except already sold items)
UPDATE items
SET 
  status = 'FOR_SALE',
  updated_at = NOW()
WHERE status != 'SOLD';

-- Verify the update
SELECT 
  status,
  COUNT(*) as count
FROM items
GROUP BY status;

-- Check cart items specifically
SELECT 
  ci.item_id,
  i.title,
  i.status,
  CASE 
    WHEN i.status = 'FOR_SALE' THEN '✅ OK'
    ELSE '❌ WRONG STATUS'
  END as check_status
FROM cart_items ci
LEFT JOIN items i ON ci.item_id = i.id;
```

### ✅ Step 3: Redeploy Supabase Edge Function
The orders function has been updated with better error messages. Deploy it:

```powershell
# Navigate to your project directory (you're already there)
# Login to Supabase CLI (if not already)
supabase login

# Link your project (if not already linked)
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the orders function
supabase functions deploy orders
```

### ✅ Step 4: Clear Browser Cache & Test
1. Clear browser cache: **Ctrl+Shift+Delete** (select "Cached images and files")
2. Or do a hard refresh: **Ctrl+F5**
3. Close and reopen browser
4. Go to your app at localhost:8080
5. Try checkout again

### ✅ Step 5: Check Console for Detailed Errors
Now when you try checkout, the error will show **exactly** which items have wrong status:

**Open Browser DevTools (F12)**:
- Console tab will show: `Error: Some items are not available: Blue Jeans (status: PENDING_DROPOFF), Red Dress (status: RESERVED)`
- Network tab → Find POST to `/orders` → Response tab will show the same

### 📋 If Still Not Working

#### Option A: Check Supabase Function Logs
```powershell
# View real-time logs
supabase functions serve orders --env-file ./supabase/.env.local
```

Or check logs in Supabase Dashboard:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Edge Functions → orders → Logs
4. Look for DEBUG messages showing item statuses

#### Option B: Manually Fix Specific Items
If the error shows specific item IDs with wrong status:

```sql
-- Replace these IDs with the actual IDs from the error message
UPDATE items
SET status = 'FOR_SALE', updated_at = NOW()
WHERE id IN (
  'item-id-from-error-1',
  'item-id-from-error-2'
);
```

#### Option C: Create Fresh Test Items
If you want to start fresh:

```sql
-- Create a test item with FOR_SALE status
INSERT INTO items (
  title,
  description,
  category,
  size,
  condition,
  price,
  status,  -- ✅ This is the key!
  qr_code,
  store_id,
  is_consignment,
  images
) VALUES (
  'Test Item - Blue Sweater',
  'Test item for checkout',
  'Tops',
  'M',
  'Excellent',
  25.00,
  'FOR_SALE',  -- ✅ Explicitly set to FOR_SALE
  'TEST-QR-' || gen_random_uuid(),
  (SELECT id FROM stores LIMIT 1),
  true,
  ARRAY[]::text[]
);

-- Get the ID of the item you just created
SELECT id, title, status FROM items ORDER BY created_at DESC LIMIT 1;
```

## Quick Checklist

- [ ] Run DEBUG_CHECKOUT_ISSUE.sql to see item statuses
- [ ] Run UPDATE query to set all items to FOR_SALE
- [ ] Verify items are FOR_SALE in database
- [ ] Deploy Supabase edge function: `supabase functions deploy orders`
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Hard refresh page (Ctrl+F5)
- [ ] Add items to cart
- [ ] Check browser console (F12) for detailed error messages
- [ ] Try checkout

## Expected Result
✅ Error message will now show exactly which items have wrong status
✅ After fixing database, checkout should work
✅ Items will be reserved and payment will initialize

## Getting Help
If still stuck, share the output from:
1. The DEBUG_CHECKOUT_ISSUE.sql query results
2. The browser console error message (it will now show item titles and statuses)
3. Supabase Edge Function logs
