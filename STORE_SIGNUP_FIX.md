# Store Signup & Item Upload Fix

## What Was Fixed

### Problem
1. ✅ Users could sign up as stores, but no `stores` table record was created
2. ✅ Upload page only showed 3 hardcoded fake stores
3. ✅ New stores couldn't accept item drop-offs
4. ✅ Stores needed admin approval to appear in the dropdown

### Solution Implemented

#### 1. Auto-Create Stores on Signup ✅
Updated `AUTO_CREATE_USERS.sql` to:
- Create a `users` record when anyone signs up
- **ALSO create a `stores` record if role is "store"**
- New stores start as `verified: false` and `active: false` (need admin approval)

#### 2. Dynamic Store Loading ✅
Created `store.service.ts`:
- Fetches real stores from database
- Only shows verified & active stores
- Provides store management functions

#### 3. Upload Page Updates ✅
Updated `Upload.tsx`:
- Loads real stores from database on mount
- Displays store name, city, and address
- Shows loading state while fetching stores
- Handles "no stores available" gracefully

#### 4. Pass Store Address in Signup ✅
Updated auth flow:
- `SignUp.tsx` → `AuthContext` → `authService` → Supabase
- Store address now included in user metadata
- Trigger uses this to create store record

---

## How It Works Now

### When a Store Signs Up:
1. User fills out store signup form (name, email, address, phone, etc.)
2. `authService.signUp()` creates auth user with metadata:
   ```json
   {
     "name": "Vintage Vibes",
     "phone": "+31 20 123 4567",
     "address": "Spuistraat 45",
     "role": "store"
   }
   ```
3. **Trigger `handle_new_user()` fires:**
   - Creates record in `public.users`
   - Checks if `role === 'store'`
   - **Creates record in `public.stores` with:**
     - `verified: false`
     - `active: false`
     - `owner_id: user.id`
     - All metadata from signup

### When a Seller Uploads an Item:
1. Upload page loads
2. Calls `storeService.getActiveStores()`
3. Query: `SELECT * FROM stores WHERE verified = true AND active = true`
4. Displays stores in dropdown
5. Seller selects a store
6. Item is created with `store_id` pointing to selected store

### When Admin Approves a Store:
1. Admin goes to Admin Dashboard → Stores
2. Sees pending store applications
3. Clicks "Approve"
4. Updates store: `verified: true, active: true`
5. **Store now appears in Upload dropdown!** ✅

---

## Files Changed

### Created:
- ✅ `src/services/store.service.ts` - Store CRUD operations
- ✅ `CREATE_DEMO_STORES.sql` - Create 3 demo stores
- ✅ `STORE_SIGNUP_FIX.md` - This file

### Modified:
- ✅ `AUTO_CREATE_USERS.sql` - Now also creates stores for store users
- ✅ `src/pages/Upload.tsx` - Loads real stores dynamically
- ✅ `src/services/auth.service.ts` - Includes address in metadata
- ✅ `src/contexts/AuthContext.tsx` - Passes address to auth service

---

## Database Schema (Stores Table)

```sql
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  description TEXT,
  logo TEXT,
  hours TEXT,
  verified BOOLEAN DEFAULT false,  -- Admin must approve
  active BOOLEAN DEFAULT false,    -- Admin must activate
  owner_id UUID UNIQUE REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

**Key Constraints:**
- `owner_id` is UNIQUE (one store per user)
- `verified` must be `true` for store to appear in dropdowns
- `active` must be `true` for store to accept items

---

## Setup Steps (Required)

### Step 1: Run Updated AUTO_CREATE_USERS.sql ✅ CRITICAL
1. Open Supabase Dashboard → SQL Editor
2. **Delete the old trigger first:**
   ```sql
   DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
   DROP FUNCTION IF EXISTS public.handle_new_user();
   ```
3. Copy and paste the UPDATED `AUTO_CREATE_USERS.sql`
4. Click **Run**

**This will:**
- Re-create the trigger with store creation logic
- Backfill existing users
- Handle future signups automatically

### Step 2: Create Demo Stores ✅
1. Stay in Supabase Dashboard → SQL Editor
2. Copy and paste `CREATE_DEMO_STORES.sql`
3. Click **Run**

**This creates:**
- 3 store owners
- 3 verified & active stores ready for testing

### Step 3: Test New Store Signup
1. Go to `/sign-up?role=store`
2. Fill out the form:
   - Store Name: "Test Store"
   - Email: "test@store.com"
   - Address: "Test Street 123"
   - Phone: "+31 20 999 9999"
3. Submit

**Verify:**
```sql
-- Check if user was created
SELECT * FROM public.users WHERE email = 'test@store.com';

-- Check if store was created (will be unverified)
SELECT * FROM public.stores WHERE email = 'test@store.com';
```

You should see:
- User record exists ✅
- Store record exists with `verified: false, active: false` ✅

### Step 4: Test Upload Page
1. Sign in as a seller
2. Go to `/upload`
3. You should see the 3 demo stores in the dropdown ✅
4. "Test Store" won't appear yet (not verified)

---

## Admin Approval Flow (Not Yet Implemented)

The `AdminStores.tsx` page has UI for this, but it's using mock data. To make it functional:

### TODO: Connect Admin Store Approval
1. Update `AdminStores.tsx` to fetch real pending stores
2. Implement approve/reject functions that update `verified` and `active`
3. Add email notifications when store is approved

**Current workaround:**
Manually approve stores via SQL:
```sql
UPDATE public.stores 
SET verified = true, active = true, updated_at = now()
WHERE email = 'test@store.com';
```

---

## Testing Checklist

### ✅ Store Signup Flow
- [ ] New store can sign up
- [ ] User record created in `public.users`
- [ ] Store record created in `public.stores`
- [ ] Store has `verified: false` initially

### ✅ Item Upload Flow
- [ ] Upload page loads stores from database
- [ ] Only verified & active stores appear
- [ ] Can select a store and upload item
- [ ] Item has correct `store_id`

### ✅ Admin Approval (Manual Test)
- [ ] Can manually approve store via SQL
- [ ] Approved store appears in upload dropdown
- [ ] Can upload items to newly approved store

---

## Next Steps (Future Improvements)

### Short Term
1. **Implement Admin Approval UI** - Make the AdminStores page functional
2. **Store Profile Page** - Let stores edit their info
3. **Email Notifications** - Notify stores when approved

### Medium Term
1. **Location-Based Sorting** - Show nearest stores first
2. **Store Hours Validation** - Parse and validate business hours
3. **Store Inventory Dashboard** - Show items at each store

### Long Term
1. **Multi-Store Management** - Allow chains to manage multiple locations
2. **Store Analytics** - Track performance per store
3. **Store Reviews** - Let sellers rate stores

---

## Important Notes

### Store Ownership
- One user can only own ONE store (due to `owner_id UNIQUE` constraint)
- If you need multi-store support, we'll need to add a `store_staff` table

### Approval Required
- New stores don't appear in dropdowns until admin approves
- This prevents spam and ensures quality control
- Default stores (store1, store2, store3) are pre-approved

### City Default
- New stores default to "Amsterdam" city
- Stores can update this in their profile (when implemented)

---

## Common Issues & Solutions

### Issue: Store doesn't appear in dropdown
**Check:**
```sql
SELECT id, name, verified, active FROM stores WHERE email = 'your@email.com';
```
**Solution:** Both `verified` and `active` must be `true`

### Issue: "duplicate key value violates unique constraint stores_owner_id_key"
**Cause:** User already has a store
**Solution:** One user = one store. Create new user or delete old store.

### Issue: Upload shows "No stores available"
**Check:**
```sql
SELECT COUNT(*) FROM stores WHERE verified = true AND active = true;
```
**Solution:** Run `CREATE_DEMO_STORES.sql` to create test stores

---

## Summary

✅ **What Works Now:**
- Store signup creates both user and store records
- Upload page loads real stores from database
- Only verified & active stores appear in dropdown
- 3 demo stores ready for testing

⚠️ **What Needs Manual Action:**
- Admin must approve new stores (currently via SQL)
- Admin approval UI exists but not connected to backend

🔮 **Future Enhancements:**
- Automated admin dashboard
- Email notifications
- Store profile editing
- Location-based sorting
