# Fix "Some items are not available" Checkout Error

## 🎯 Problem
When clicking "Proceed to Checkout", you get the error:
**"Error: Some items are not available"**

## 🔍 Root Cause
The `orders` edge function checks if items have `status = 'FOR_SALE'`, but:
- Items in your cart might have `status = 'PENDING_DROPOFF'` (the default)
- Items might have been deleted from the database
- Item IDs in cart don't match actual item IDs in database

## ✅ Solutions (Choose One)

### Solution 1: Update All Items to FOR_SALE (Quick Fix)

Run this SQL in **Supabase SQL Editor**:

```sql
-- Update all items to FOR_SALE status
UPDATE items
SET 
  status = 'FOR_SALE',
  updated_at = NOW()
WHERE status = 'PENDING_DROPOFF';

-- Verify the update
SELECT status, COUNT(*) as count
FROM items
GROUP BY status;
```

This will make all pending items available for purchase.

---

### Solution 2: Check What's Actually in Your Database

Run this SQL to see what items exist and their status:

```sql
-- See all items and their status
SELECT 
  id,
  name,
  status,
  price,
  store_id
FROM items
ORDER BY created_at DESC
LIMIT 20;

-- See what's in your cart
SELECT 
  ci.id as cart_item_id,
  ci.item_id,
  ci.user_id,
  i.name as item_name,
  i.status as item_status
FROM cart_items ci
LEFT JOIN items i ON ci.item_id = i.id
ORDER BY ci.added_at DESC;
```

This shows:
1. What items exist in the database
2. What items are in your cart
3. Whether cart items still exist (LEFT JOIN will show NULL if item deleted)

---

### Solution 3: Clear Cart and Add Fresh Items

If items in cart are stale:

```sql
-- Clear your cart (replace with your actual user ID)
DELETE FROM cart_items
WHERE user_id = 'YOUR_USER_ID';
```

Then:
1. Go to Browse page
2. Add items to cart (these will be FOR_SALE items)
3. Try checkout again

---

### Solution 4: Create Test Items with FOR_SALE Status

If you have no items in the database:

```sql
-- First, get a store ID
SELECT id, name FROM stores LIMIT 1;

-- Create test items (replace 'STORE_ID_HERE' with actual store ID)
INSERT INTO items (
  name,
  description,
  price,
  size,
  brand,
  condition,
  status,
  store_id,
  is_consignment,
  created_at,
  updated_at
) VALUES
  ('Vintage Denim Jacket', 'Classic blue denim jacket in excellent condition', 45.00, 'M', 'Levi''s', 'EXCELLENT', 'FOR_SALE', 'STORE_ID_HERE', false, NOW(), NOW()),
  ('Leather Boots', 'Brown leather ankle boots, barely worn', 65.00, '8', 'Dr. Martens', 'LIKE_NEW', 'FOR_SALE', 'STORE_ID_HERE', false, NOW(), NOW()),
  ('Wool Sweater', 'Cozy grey wool sweater', 30.00, 'L', 'H&M', 'GOOD', 'FOR_SALE', 'STORE_ID_HERE', false, NOW(), NOW());

-- Verify items created
SELECT id, name, status, price FROM items WHERE status = 'FOR_SALE';
```

---

## 🔧 Debugging Steps

### Step 1: Check Item Status in Database

1. Go to **Supabase Dashboard** → **Table Editor** → **items**
2. Look at the `status` column
3. Check if items have `FOR_SALE` status

### Step 2: Check Your Cart

1. Go to **Supabase Dashboard** → **Table Editor** → **cart_items**
2. Find your user's cart items
3. Copy the `item_id` values
4. Search for those IDs in the **items** table
5. Verify they exist and have `FOR_SALE` status

### Step 3: Check Browser Console

When you try checkout, open browser console (F12) and look for:
```
Error creating order: Error: Some items are not available
```

The checkout page logs the item IDs it's trying to order. Compare these with database.

---

## 🎯 Recommended Quick Fix

**For testing purposes**, run this in Supabase SQL Editor:

```sql
-- Make all items available for sale
UPDATE items SET status = 'FOR_SALE' WHERE status != 'SOLD';

-- Clear any stale cart items
DELETE FROM cart_items 
WHERE item_id NOT IN (SELECT id FROM items WHERE status = 'FOR_SALE');

-- Verify
SELECT 
  'Items FOR_SALE' as type,
  COUNT(*) as count
FROM items
WHERE status = 'FOR_SALE'

UNION ALL

SELECT 
  'Cart Items' as type,
  COUNT(*) as count
FROM cart_items;
```

This will:
1. ✅ Make all non-sold items available for purchase
2. ✅ Remove cart items for items that aren't FOR_SALE
3. ✅ Show you how many items are ready

---

## 🧪 Test the Fix

After running the SQL fix:

1. **Refresh your browser** (Ctrl+F5)
2. **Clear your cart** (just in case)
3. **Go to Browse page**
4. **Add 1-2 items to cart**
5. **Go to cart**
6. **Click "Proceed to Checkout"**
7. **Should work now!** ✅

---

## 📊 Expected Database States

### Items Table
```
status column values:
- FOR_SALE     ← Items should be in this state to be purchasable
- PENDING_DROPOFF  ← Default when created (not purchasable)
- RESERVED     ← During checkout (not purchasable)
- SOLD         ← After successful purchase (not purchasable)
```

### Item Lifecycle
```
1. Item created      → PENDING_DROPOFF (store drops off item)
2. Store approves    → FOR_SALE (item listed on marketplace)
3. User adds to cart → Still FOR_SALE
4. User checks out   → RESERVED (during payment)
5. Payment succeeds  → SOLD (item sold)
```

---

## 🚨 Why This Happens

The `orders` edge function (line 77) does this:

```typescript
const { data: items, error: itemsError } = await supabaseClient
  .from('items')
  .select('*, store:stores!items_store_id_fkey(*)')
  .in('id', itemIds)
  .eq('status', 'FOR_SALE')  // ← Only gets FOR_SALE items

if (!items || items.length !== itemIds.length) {
  throw new Error('Some items are not available')  // ← This error!
}
```

So if you request 3 items but only 2 have `FOR_SALE` status, it throws this error.

---

## 💡 Prevention

To prevent this in production:

1. **Item approval workflow**: Admin/store approves items before they become FOR_SALE
2. **Cart validation**: Regularly check cart items are still available
3. **UI indicators**: Show when cart items are no longer available
4. **Auto-cleanup**: Remove unavailable items from cart automatically

---

## 🎬 Next Steps After Fix

1. ✅ Run the SQL fix (Solution 1 - Quick Fix)
2. ✅ Refresh browser
3. ✅ Add items to cart
4. ✅ Test checkout
5. ✅ Deploy remaining edge functions (`stripe-checkout`, `confirm-payment`)
6. ✅ Test complete payment flow

---

## 📞 Still Having Issues?

If the error persists, check:
- [ ] Items actually exist in database
- [ ] Items have `status = 'FOR_SALE'`
- [ ] Cart items point to valid item IDs
- [ ] User is authenticated
- [ ] `orders` edge function is deployed
- [ ] Check Supabase function logs for more details
