# Bloem - Backend Integration Guide

## 📋 Project Overview

**Bloem** is a second-hand fashion marketplace connecting sellers, buyers, and thrift shops. This guide covers the Supabase + Prisma integration for the production backend.

### Tech Stack
- **Frontend**: React + TypeScript + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Auth**: Supabase Auth
- **Payments**: Stripe (to be integrated)

---

## 🚀 Setup Instructions

### Step 1: Database Schema Review

The Prisma schema (`prisma/schema.prisma`) defines:

**Core Models:**
- ✅ **User** - Unified seller/buyer accounts with size preferences and payment info
- ✅ **Store** - Thrift shop partners with verification and commission rates
- ✅ **Admin** - Platform administrators with role-based access
- ✅ **Item** - Inventory items with QR codes, images, and status tracking
- ✅ **Order** - Purchase orders with pricing breakdown
- ✅ **OrderItem** - Line items with seller/store/platform fee split
- ✅ **Transaction** - Payment records for instant payouts
- ✅ **Payout** - Stripe payout tracking
- ✅ **CartItem** - Shopping cart persistence
- ✅ **Analytics** - Store performance metrics
- ✅ **DropOffSlot** - Consignment drop-off scheduling

### Step 2: Run Database Migration

```powershell
# Generate Prisma Client
npx prisma generate

# Create and apply migration to Supabase
npx prisma migrate dev --name init

# Open Prisma Studio to view data (optional)
npx prisma studio
```

### Step 3: Environment Variables

Your `.env` file is already configured with:
- ✅ `DATABASE_URL` - Supabase connection pooler (for queries)
- ✅ `DIRECT_URL` - Direct connection (for migrations) 
- ✅ `VITE_SUPABASE_URL` - Supabase project URL
- ✅ `VITE_SUPABASE_ANON_KEY` - Public anon key for auth
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Admin key (server-side only)

### Step 4: Supabase Auth Setup

1. Go to your Supabase Dashboard → Authentication
2. Enable Email provider
3. Configure email templates (optional)
4. Set up Row Level Security (RLS) policies

**Important RLS Policies to Add:**

```sql
-- Users can read their own data
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid()::text = id);

-- Users can update their own data
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid()::text = id);

-- Items are publicly readable
CREATE POLICY "Items are viewable by everyone"
ON items FOR SELECT
USING (true);

-- Only sellers can create items
CREATE POLICY "Sellers can create items"
ON items FOR INSERT
WITH CHECK (auth.uid()::text = seller_id);

-- Add similar policies for other tables...
```

### Step 5: Update Mock Data Files

The following files in `src/data/` need to be replaced with Prisma queries:
- ❌ `mockItems.ts` → Use `itemService`
- ❌ `mockStores.ts` → Use Prisma queries
- ❌ `mockUsers.ts` → Use `userService`
- ❌ `mockTransactions.ts` → Use `orderService`
- ❌ `mockAnalytics.ts` → Use analytics queries

---

## 🔧 Service Layer Structure

All business logic is in `src/services/`:

| Service | Purpose | Status |
|---------|---------|--------|
| `auth.service.ts` | ✅ User authentication (Supabase Auth) | Ready |
| `user.service.ts` | ⏳ User profile management | Awaiting Prisma |
| `item.service.ts` | ⏳ Item listing & inventory | Awaiting Prisma |
| `order.service.ts` | ⏳ Order & checkout flow | Awaiting Prisma |
| `cart.service.ts` | ⏳ Shopping cart operations | Awaiting Prisma |

**Next Steps:** After migration, implement the Prisma queries in each service.

---

## 📦 Missing Fields Added

### Items Table
- ✅ `brand` - Item brand/manufacturer
- ✅ `color` - Item color
- ✅ `qrCode` - Unique QR identifier for scanning
- ✅ `images[]` - Multiple image URLs
- ✅ `hangerFee` - Consignment display fee
- ✅ `listedAt` - When item went on sale

### Users Table  
- ✅ `phone` - Contact number
- ✅ `address` - Full address
- ✅ `topSize`, `bottomSize`, `shoeSize` - Size preferences
- ✅ `stripeCustomerId` - Stripe customer ID
- ✅ `bankAccount` - IBAN for payouts

### Stores Table
- ✅ `logo` - Store logo URL
- ✅ `verified` - Admin verification status
- ✅ `subscriptionTier` - Pricing plan
- ✅ `commissionRate` - Revenue split percentage
- ✅ `stripeAccountId` - Stripe Connect account

### Orders Table
- ✅ `pickupMethod` - IN_STORE vs RESERVED
- ✅ `serviceFee` - Platform service charge
- ✅ `tax` - VAT/sales tax
- ✅ `paymentMethod` - CASH, CARD, MOBILE

### Transactions Table
- ✅ `sellerEarnings` - Amount paid to seller
- ✅ `storeCommission` - Amount paid to store
- ✅ `platformFee` - Bloem revenue

---

## 🎨 Design System Compliance

All UI components follow the Bloem design system:

**Colors:**
- Background: `#F7F4F2` (warm cream)
- Primary: `#6B22B1` (purple)
- Secondary: `#B79CED` (light purple)
- Accent: `#BED35C` (lime green)
- Text: Dark charcoal

**Typography:** Maintained from Lovable import

---

## 🔐 Authentication Flow

1. User signs up via Supabase Auth
2. Auth trigger creates User record in Prisma
3. User receives email verification
4. User logs in → session stored in localStorage
5. Protected routes check `AuthContext`

---

## 📱 Key Features Implementation Checklist

### Phase 1: Core Authentication ✅
- [x] Supabase Auth setup
- [x] Sign up / Sign in / Sign out
- [x] Session management
- [ ] Email verification flow
- [ ] Password reset

### Phase 2: Database Schema ✅
- [x] Prisma schema defined
- [x] All tables with relationships
- [x] Proper indexes for performance
- [ ] Run migrations
- [ ] Seed initial data

### Phase 3: Item Management ⏳
- [ ] Create item listings
- [ ] Upload images to Supabase Storage
- [ ] Generate QR codes
- [ ] Update item status
- [ ] Browse/filter items

### Phase 4: Order & Checkout ⏳
- [ ] Add to cart
- [ ] Create orders
- [ ] Process in-store checkout
- [ ] QR code scanning
- [ ] Update inventory after sale

### Phase 5: Payments & Payouts ⏳
- [ ] Stripe integration
- [ ] Instant seller payouts
- [ ] Store commission tracking
- [ ] Platform fee collection

### Phase 6: Analytics ⏳
- [ ] Seller dashboard stats
- [ ] Store performance metrics
- [ ] Admin platform analytics

---

## 🧪 Testing Strategy

1. **Unit Tests**: Service layer functions
2. **Integration Tests**: API endpoints
3. **E2E Tests**: Complete user flows
4. **Manual Testing**: UI/UX validation

---

## 📚 Next Steps

1. ✅ **Review this README** - Understand the architecture
2. ⏳ **Run Prisma migration** - `npx prisma migrate dev --name init`
3. ⏳ **Test database connection** - `npx prisma studio`
4. ⏳ **Implement service functions** - Replace TODOs with Prisma queries
5. ⏳ **Update UI components** - Connect to real data
6. ⏳ **Set up Supabase RLS** - Secure your database
7. ⏳ **Test authentication flow** - Sign up/in/out
8. ⏳ **Integrate Stripe** - Payment processing

---

## 🆘 Support

For issues or questions:
- Check Prisma docs: https://www.prisma.io/docs
- Check Supabase docs: https://supabase.com/docs
- Review this integration guide

---

**Status:** ✅ Schema Ready | ⏳ Awaiting Migration
