# 🧪 Simple Test: Are Items Showing in Browse?

## Quick Test Steps

### Test 1: Browse as Anonymous (Not Logged In)
1. **Log out completely** from the app
2. Go to `/browse`
3. **Expected:** You should see ALL FOR_SALE items (no seller filter)
4. **Question:** Can you see the North Face jacket?
   - ✅ YES → The item is working, but seller filter is hiding it when logged in
   - ❌ NO → Different issue (store/RLS/query problem)

### Test 2: Check Which Account is the Seller
Run this SQL to find out:
```sql
SELECT 
  i.title,
  i.seller_id,
  u.name as seller_name,
  u.email as seller_email
FROM items i
JOIN users u ON i.seller_id = u.id
WHERE i.title ILIKE '%north face%';
```

### Test 3: Check Which Account You're Using to Browse
When logged into the "third account":
- Open browser console (F12)
- Go to `/browse`
- Type: `localStorage.getItem('supabase.auth.token')`
- Or check the user info in the UI (profile/settings)

### Test 4: Verify They're Different
- Seller account email: ________________
- Browse account email: ________________
- Are they different? If NO → That's your problem!

## Why This Happens

The Browse page intentionally hides your own items with this code:
```typescript
if (user) {
  filtered = filtered.filter(item => 
    (item as any).seller_id !== user.id
  );
}
```

**This is by design** - it prevents sellers from buying their own items.

## Solutions

### Option 1: Browse While Logged Out
- Most reliable test
- Log out and go to `/browse`
- You'll see all items

### Option 2: Create a True "Buyer" Account
- Use a completely different email
- Don't use this account to upload items
- Only use for browsing/buying

### Option 3: Disable the Filter (For Testing Only)
Edit `src/pages/Browse.tsx` and comment out lines 101-103:
```typescript
// Filter out user's own items
// if (user) {
//   filtered = filtered.filter(item => (item as any).seller_id !== user.id);
// }
```

**Don't forget to uncomment this before going to production!**

## Expected Results

| Logged in as... | Can see item in Browse? |
|----------------|------------------------|
| Not logged in (anonymous) | ✅ YES |
| Seller account (uploaded it) | ❌ NO (filtered out) |
| Store owner account | ✅ YES (unless they're also the seller) |
| Buyer account (different user) | ✅ YES |
| Admin account | ✅ YES (unless they're also the seller) |

## Still Not Working?

If you browse as anonymous and STILL don't see the item, then run:
```sql
-- Check everything about the item and store
SELECT 
  i.id,
  i.title,
  i.status,
  i.is_consignment,
  s.name as store_name,
  s.verified,
  s.active
FROM items i
JOIN stores s ON i.store_id = s.id
WHERE i.title ILIKE '%north face%';
```

Expected values:
- `status = 'FOR_SALE'` ✅
- `verified = true` ✅  
- `active = true` ✅

If any are false, that's the issue.
