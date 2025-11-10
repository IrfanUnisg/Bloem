# Fix Upload Item Error - Foreign Key Constraint

## Error Details
```
Error creating item: Error: insert or update on table "items" violates foreign key constraint "items_store_id_fkey"
```

## Root Cause
Two issues are causing this error:

### 1. Users Not Auto-Created (Primary Issue)
When users sign up via Supabase Auth, they're added to `auth.users` but NOT to `public.users`. 
The `items` table has a foreign key constraint `items_seller_id_fkey` that requires `seller_id` to exist in `public.users`.

### 2. Invalid Store IDs (Secondary Issue)
The Upload page uses hardcoded fake store IDs (`"store1"`, `"store2"`, `"store3"`) that don't exist as UUIDs in the database.

---

## Solution - Follow These Steps

### Step 1: Run AUTO_CREATE_USERS.sql ✅ (CRITICAL)

1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `AUTO_CREATE_USERS.sql`
3. Click "Run"

**This will:**
- Create a trigger to auto-add users to `public.users` when they sign up
- Backfill existing auth users (including `sometestperson@gmail.com`)

**Verify it worked:**
```sql
-- Check if your user now exists in public.users
SELECT * FROM public.users WHERE email = 'sometestperson@gmail.com';
```

---

### Step 2: Create Demo Stores (Required)

1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `CREATE_DEMO_STORES.sql`
3. Click "Run"

**This will:**
- Create 3 demo stores with the IDs that the Upload page expects: `store1`, `store2`, `store3`
- Create a demo store owner user

**Verify it worked:**
```sql
-- Check if stores were created
SELECT id, name, city FROM public.stores;
```

You should see:
- `store1` - Vintage Vibes - Amsterdam
- `store2` - Retro Revival - Amsterdam
- `store3` - Thrift Haven - Amsterdam

---

### Step 3: Test Item Upload

1. Go to the Upload page in your app
2. Fill in all the fields
3. Select one of the stores from the dropdown
4. Submit the item

**Expected result:** Item should upload successfully without foreign key errors.

**Verify it worked:**
```sql
-- Check if item was created
SELECT id, title, seller_id, store_id, status FROM public.items 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## Alternative Solution - Fetch Real Stores Dynamically

If you want the Upload page to fetch actual stores from the database instead of using hardcoded values, you'll need to:

1. Create a store service to fetch stores
2. Update the Upload page to load stores on mount
3. Display real store data in the dropdown

**Would you like me to implement this?** Let me know if you want the dynamic approach instead of hardcoded stores.

---

## Files Created

1. ✅ `AUTO_CREATE_USERS.sql` - Already exists, needs to be run
2. ✅ `CREATE_DEMO_STORES.sql` - NEW - Creates the 3 stores needed by Upload page
3. ✅ `FIX_UPLOAD_ERROR.md` - This file

---

## Execution Order

```
1. AUTO_CREATE_USERS.sql    (Fixes seller_id foreign key issue)
2. CREATE_DEMO_STORES.sql   (Fixes store_id foreign key issue)
3. Test upload              (Should work now)
```

---

## After Fix - What Should Work

✅ User signup automatically creates entry in `public.users`
✅ Item upload can reference valid `seller_id`
✅ Item upload can reference valid `store_id`
✅ No more foreign key constraint errors
✅ Dashboard shows uploaded items
✅ Browse page shows uploaded items

---

## Note on Store Owner

The `CREATE_DEMO_STORES.sql` creates a demo store owner with ID `demo-store-owner-uuid`. 
This is required because the `stores` table has a foreign key to `users.owner_id`.

In production, you'd want real store owners, but for testing this works fine.
