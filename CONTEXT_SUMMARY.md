# Bloem Project - Context Summary

## Project Overview
React + TypeScript + Vite application for a secondhand clothing marketplace with real-time database integration using Supabase.

**Stack:**
- Frontend: React 18.3.1, TypeScript, Vite 5.4.19, Tailwind CSS, shadcn/ui
- Backend: Supabase (Auth, PostgreSQL, Storage, Edge Functions)
- Database: PostgreSQL with snake_case schema
- Payments: Stripe integration (not yet fully tested)
- Dev Server: Running on `localhost:8081`

---

## Current Status

### ✅ Completed Features
1. **Supabase Edge Functions** - 5 functions deployed manually via dashboard:
   - `items` - Browse/create items with filtering
   - `cart` - Cart CRUD operations
   - `orders` - Order creation from cart
   - `stripe-checkout` - Payment intents
   - `complete-order` - Finalize orders

2. **Database Integration:**
   - All services updated to use Edge Functions
   - Snake_case column naming throughout (store_id, seller_id, is_consignment, hanger_fee, etc.)
   - Foreign key constraints fixed (items_seller_id_fkey, items_store_id_fkey, etc.)

3. **Storage Setup:**
   - Supabase Storage bucket "items" created
   - Public access configured
   - 50MB limit, supports JPEG/PNG/WEBP/GIF
   - RLS policies applied

4. **Pages Implemented:**
   - Browse - Real item listing with filters
   - Upload - Image upload to Supabase Storage + item creation
   - Cart - Database-backed cart with persistence
   - ItemDetail - Real item data with add to cart
   - Dashboard - Real user items, earnings, transactions
   - Profile - **NOT YET IMPLEMENTED**

5. **Database Configuration:**
   - UUID auto-generation for all tables (FIX_UUID_DEFAULTS.sql applied)
   - Timestamp auto-generation (created_at, updated_at)
   - Auto-update triggers for updated_at columns on items, users, stores, payouts

---

## ⚠️ Current Issue - NEEDS FIXING

**Problem:** Item upload fails with foreign key constraint error
```
Error: insert or update on table "items" violates foreign key constraint "items_seller_id_fkey"
```

**Root Cause:** When users sign up via Supabase Auth, they're NOT automatically added to the `public.users` table. The `items` table requires a valid `seller_id` that references `users.id`.

**Solution Ready:** `AUTO_CREATE_USERS.sql` file created but **NOT YET SUCCESSFULLY RUN**

**Last Error:**
```
ERROR: 23502: null value in column "updated_at" of relation "users" violates not-null constraint
```

**Status:** The SQL has been updated to include `updated_at` field. Need to run the corrected version.

---

## Files Ready to Execute

### 1. AUTO_CREATE_USERS.sql (PRIORITY - RUN THIS FIRST)
**Location:** `c:\Users\irfan\Desktop\Bloem\Bloem\AUTO_CREATE_USERS.sql`

**Purpose:** 
- Creates trigger to auto-add users to `public.users` when they sign up
- Backfills existing auth users into `public.users` table

**Action Required:** Run in Supabase Dashboard → SQL Editor

**After running:** Item upload should work (foreign key constraint will be satisfied)

### 2. FIX_UUID_DEFAULTS.sql (ALREADY RUN ✅)
**Status:** Successfully applied
**Result:** UUID and timestamp auto-generation working

### 3. COMPLETE_SETUP.sql (ALREADY RUN ✅)
**Status:** Successfully applied
**Result:** Storage bucket and RLS policies configured

---

## Database Schema Notes

### Critical Naming Conventions
- **Database columns:** snake_case (seller_id, store_id, created_at, is_consignment, hanger_fee, etc.)
- **TypeScript types:** camelCase (sellerId, storeId, createdAt, isConsignment, hangerFee, etc.)
- **Supabase client:** Auto-converts between snake_case and camelCase
- **Edge Functions:** Use snake_case when querying/inserting

### Key Tables
- `users` - User profiles (linked to auth.users)
- `stores` - Store information
- `items` - Product listings
- `orders` - Purchase orders
- `order_items` - Order line items
- `cart_items` - Shopping cart
- `transactions` - Transaction records
- `payouts` - Payout tracking

### Important Foreign Keys
- `items.seller_id` → `users.id`
- `items.store_id` → `stores.id`
- `orders.buyer_id` → `users.id`
- `orders.store_id` → `stores.id`
- `cart_items.user_id` → `users.id`
- `cart_items.item_id` → `items.id`

---

## Edge Functions Deployment

**Method:** Manual deployment via Supabase Dashboard
**Reason:** Supabase CLI installation failed on Windows

**Functions Deployed:**
1. `items` - GET (browse/filter), POST (create)
2. `cart` - GET (fetch), POST (add), DELETE (remove)
3. `orders` - POST (create from cart)
4. `stripe-checkout` - POST (create payment intent)
5. `complete-order` - POST (finalize order after payment)

**All functions updated with snake_case column names**

---

## Known Issues & Workarounds

### 1. Column Naming Mismatches (FIXED ✅)
- **Issue:** Prisma schema uses camelCase, PostgreSQL uses snake_case
- **Fix:** All Edge Functions and services updated to use snake_case
- **Files Updated:** All 5 Edge Functions, item.service.ts, order.service.ts, cart.service.ts

### 2. Foreign Key Naming (FIXED ✅)
- **Issue:** Wrong foreign key constraint names (items_sellerId_fkey vs items_seller_id_fkey)
- **Fix:** Updated all queries to use snake_case constraint names

### 3. UUID Generation (FIXED ✅)
- **Issue:** Database wasn't auto-generating UUIDs for id columns
- **Fix:** FIX_UUID_DEFAULTS.sql applied successfully

### 4. User Auto-Creation (IN PROGRESS ⚠️)
- **Issue:** Auth users not synced to public.users table
- **Fix:** AUTO_CREATE_USERS.sql created, needs to be run
- **Current Status:** SQL updated to include updated_at field, ready to execute

---

## Next Steps

### Immediate (High Priority)
1. **Run AUTO_CREATE_USERS.sql** - Fix foreign key constraint error
2. **Test item upload** - Verify end-to-end flow works
3. **Test Browse page** - Check if uploaded items appear
4. **Test Dashboard** - Verify user's items show up

### Short Term
1. **Implement Profile page** - Load/save user data from database
2. **Test cart flow** - Add to cart, view cart, update quantities
3. **Test order creation** - Create order from cart (without payment)

### Medium Term (Payment Integration)
1. Configure Stripe keys
2. Test checkout flow
3. Test payment completion
4. Test order finalization

### Not Started
- Store inventory management
- Store checkout with QR scanning
- Analytics/reporting
- Payout processing

---

## Environment Setup

### Supabase Configuration
- **Project:** Created and configured
- **Auth:** Email/password enabled
- **Storage:** Bucket "items" created with RLS policies
- **Database:** PostgreSQL with schema applied
- **Edge Functions:** Manually deployed via dashboard

### Local Development
- **Dev Server:** `npm run dev` - runs on localhost:8081
- **Build Tool:** Vite
- **Package Manager:** npm (bun.lockb exists but using npm)

### Required Environment Variables
```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
VITE_STRIPE_PUBLIC_KEY=<your-stripe-public-key>
```

---

## Important Code Locations

### Services (Frontend → Edge Functions)
- `src/services/item.service.ts` - Item operations + image upload
- `src/services/cart.service.ts` - Cart operations
- `src/services/order.service.ts` - Order operations
- `src/services/auth.service.ts` - Authentication

### Edge Functions (Backend)
- `supabase/functions/items/index.ts` - Item CRUD
- `supabase/functions/cart/index.ts` - Cart CRUD
- `supabase/functions/orders/index.ts` - Order creation
- `supabase/functions/stripe-checkout/index.ts` - Payment intents
- `supabase/functions/complete-order/index.ts` - Order completion

### Pages
- `src/pages/Browse.tsx` - Item browsing with filters
- `src/pages/Upload.tsx` - Item upload with images
- `src/pages/Cart.tsx` - Shopping cart
- `src/pages/ItemDetail.tsx` - Item details
- `src/pages/Dashboard.tsx` - User dashboard
- `src/pages/Profile.tsx` - **NOT IMPLEMENTED**

### Database Schema
- `prisma/schema.prisma` - Prisma schema (reference only)
- Database uses snake_case, NOT Prisma client

---

## Testing Credentials
- User signed up: `sometestperson@gmail.com`
- User exists in `auth.users` but NOT in `public.users` (needs AUTO_CREATE_USERS.sql)

---

## Common Commands

```powershell
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Key Learnings

1. **Supabase uses snake_case** - All database columns, foreign keys use snake_case
2. **Foreign key naming pattern** - `{table}_{column}_fkey` (e.g., items_seller_id_fkey)
3. **Auth vs Public users** - auth.users is separate from public.users, need sync trigger
4. **Edge Functions deployment** - Manual via dashboard when CLI fails
5. **RLS is strict** - Need explicit policies for storage and tables
6. **UUID defaults required** - Must set DEFAULT gen_random_uuid() on id columns
7. **Timestamp defaults required** - Must set DEFAULT now() on timestamp columns

---

## Additional Notes

- Payment integration explicitly excluded from initial testing per user request
- Supabase CLI installation failed, using manual Edge Function deployment
- All schema fixes applied directly via Supabase SQL Editor
- TypeScript types use camelCase but all database operations use snake_case
