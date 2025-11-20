# 🔍 Items Not Showing in Browse - Troubleshooting Guide

## The Issue
You uploaded an item, the store accepted it, but it's not showing up when browsing as a buyer.

## Most Likely Causes (in order)

### 1. ✅ Item Status is Still PENDING_DROPOFF
**Problem:** Store hasn't accepted the item yet
**Solution:** Store owner needs to go to `/store/dropoffs` and click "Accept & List for Sale"

**How to Check:**
```sql
SELECT id, title, status FROM items WHERE id = 'your-item-id';
```
- If status = `PENDING_DROPOFF` → Store needs to accept
- If status = `FOR_SALE` → Item should be visible (check other causes)

---

### 2. ✅ Store is Not Verified/Active
**Problem:** Admin hasn't approved the store yet
**Solution:** Admin needs to go to `/admin/stores` and approve the store

**How to Check:**
```sql
SELECT s.id, s.name, s.verified, s.active, i.title
FROM stores s
JOIN items i ON i.store_id = s.id
WHERE i.id = 'your-item-id';
```
- If `verified = false` OR `active = false` → Admin needs to approve store
- Both should be `true` for items to be visible

---

### 3. 🔄 Cache/Browser Issue
**Problem:** Old data cached in browser
**Solution:** Hard refresh the browse page

**Steps:**
1. Go to `/browse`
2. Press `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
3. Or close and reopen the browser tab

---

### 4. 🔒 RLS (Row Level Security) Policy Issue
**Problem:** Database security policies preventing access
**Solution:** Check RLS policies

**How to Check:**
```sql
-- Check if RLS is enabled
SELECT relname, relrowsecurity, relforcerowsecurity
FROM pg_class
WHERE relname = 'items';

-- Check policies
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'items';
```

**Expected:** Browse should work with anonymous/authenticated users. If not, there may be overly restrictive RLS policies.

---

### 5. 🚫 Viewing Own Items
**Problem:** Browse page filters out your own items by design
**Solution:** This is intentional. Use a different user account to test

**Code Location:** `src/pages/Browse.tsx`
```typescript
// Filter out user's own items
if (user) {
  filtered = filtered.filter(item => (item as any).seller_id !== user.id);
}
```

**Workaround for Testing:**
- Log in as a different user (buyer account)
- Or check the item in `/dashboard` (seller view)

---

## Step-by-Step Diagnosis

### Step 1: Check Item Status
Run this query:
```sql
SELECT 
  i.id,
  i.title,
  i.status,
  i.listed_at,
  s.name as store_name,
  s.verified as store_verified,
  s.active as store_active,
  u.name as seller_name
FROM items i
JOIN stores s ON i.store_id = s.id
JOIN users u ON i.seller_id = u.id
ORDER BY i.created_at DESC
LIMIT 10;
```

**Expected Result:**
```
status = 'FOR_SALE'
listed_at = (recent timestamp)
store_verified = true
store_active = true
```

### Step 2: Verify Store is Approved
```sql
SELECT id, name, verified, active 
FROM stores 
WHERE id = (SELECT store_id FROM items WHERE id = 'your-item-id');
```

**Expected Result:**
```
verified = true
active = true
```

### Step 3: Check Browse Page Query
The browse page uses this service call:
```typescript
// src/pages/Browse.tsx
const fetchedItems = await itemService.browseItems({
  status: 'FOR_SALE',
  limit: 50,
  offset: 0
});
```

Which calls this edge function:
```typescript
// supabase/functions/items/index.ts
.from('items')
.select(`
  *,
  seller:users!items_seller_id_fkey(id, name, avatar),
  store:stores!items_store_id_fkey(id, name, city, address)
`)
.eq('status', 'FOR_SALE')
```

### Step 4: Test Direct API Call
Open browser console on `/browse` and run:
```javascript
const response = await fetch('your-supabase-url/functions/v1/items?status=FOR_SALE', {
  headers: {
    'Authorization': 'Bearer your-token',
    'apikey': 'your-anon-key'
  }
});
const data = await response.json();
console.log(data);
```

---

## Quick Fix Commands

### Emergency Fix: Manually Set Item to FOR_SALE
⚠️ **Use only if you understand the implications**
```sql
UPDATE items 
SET 
  status = 'FOR_SALE', 
  listed_at = NOW() 
WHERE id = 'your-item-id'
RETURNING id, title, status, listed_at;
```

### Emergency Fix: Manually Verify Store
⚠️ **Use only if you understand the implications**
```sql
UPDATE stores 
SET 
  verified = true, 
  active = true 
WHERE id = 'your-store-id'
RETURNING id, name, verified, active;
```

---

## Complete Workflow (For Testing)

### As Seller:
1. ✅ Sign up as seller user
2. ✅ Upload item at `/upload`
   - Select a verified/active store
   - Fill in all details
   - Upload images
3. ✅ Item created with `status = PENDING_DROPOFF`

### As Store Owner:
1. ✅ Sign up as store user
2. ✅ Wait for admin approval (or have admin approve)
3. ✅ Go to `/store/dropoffs`
4. ✅ See pending item
5. ✅ Click "Accept & List for Sale"
6. ✅ Item status → `FOR_SALE`, `listed_at` set

### As Admin (if store not verified):
1. ✅ Sign in as admin
2. ✅ Go to `/admin/stores`
3. ✅ See pending store application
4. ✅ Click "Approve"
5. ✅ Store → `verified: true`, `active: true`

### As Buyer:
1. ✅ Sign up as buyer user (different from seller)
2. ✅ Go to `/browse`
3. ✅ See item listed
4. ✅ Can add to cart and purchase

---

## Common Mistakes

### ❌ Using Same User for Seller and Buyer
**Problem:** Browse filters out your own items
**Fix:** Use different accounts

### ❌ Forgetting to Accept Item
**Problem:** Item stays in PENDING_DROPOFF
**Fix:** Store owner must accept at `/store/dropoffs`

### ❌ Store Not Approved
**Problem:** Even if item is FOR_SALE, inactive stores may cause issues
**Fix:** Admin approves store at `/admin/stores`

### ❌ Looking at Dashboard Instead of Browse
**Problem:** Dashboard shows all YOUR items; Browse shows ALL items
**Fix:** Make sure you're on `/browse` not `/dashboard`

### ❌ Not Refreshing After Status Change
**Problem:** UI may not update immediately
**Fix:** Refresh the page or navigate away and back

---

## Debugging Console Logs

Add these to help debug:

**In Browse.tsx:**
```typescript
const fetchItems = async () => {
  console.log('🔍 Fetching items with filters:', filters);
  const fetchedItems = await itemService.browseItems(filters);
  console.log('✅ Received items:', fetchedItems.length);
  console.log('📦 Items data:', fetchedItems);
  setItems(fetchedItems);
};
```

**In itemService.browseItems:**
```typescript
const response = await fetch(`${EDGE_FUNCTIONS.ITEMS}?${params}`, {
  method: 'GET',
  headers,
});
console.log('🌐 API Response:', response.status);
const { items } = await response.json();
console.log('📋 Items from API:', items);
return items;
```

---

## Still Not Working?

If you've checked all the above and items still don't show:

1. **Run the full diagnostic:**
   ```bash
   # Use the DIAGNOSE_ITEMS_ISSUE.sql file
   psql your-database-url < DIAGNOSE_ITEMS_ISSUE.sql
   ```

2. **Check browser console** (F12) for errors

3. **Check network tab** to see if API calls are failing

4. **Verify environment variables:**
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - DATABASE_URL

5. **Check Supabase dashboard:**
   - Table editor → items → Check data
   - Authentication → Check users
   - API → Check if functions are deployed

---

## Success Checklist

Before items show in browse, verify:

- ✅ Item exists in database
- ✅ Item status = `FOR_SALE`
- ✅ Item has `listed_at` timestamp
- ✅ Store exists and is linked to item
- ✅ Store `verified = true`
- ✅ Store `active = true`
- ✅ Viewing as different user (not seller)
- ✅ Browse page loaded/refreshed
- ✅ No console errors
- ✅ API call returns items
