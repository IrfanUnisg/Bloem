# Bloem Database Schema - Quick Reference

## 📋 Complete Table Overview

| Table | Primary Fields | Key Relationships | Purpose |
|-------|---------------|-------------------|---------|
| **users** | id, email, name, phone, avatar, address, sizes, stripe, bank | → items (seller), → orders (buyer), → store (owner) | Unified seller/buyer accounts |
| **stores** | id, name, email, city, logo, verified, tier, commission, stripe | ← user (owner), → items, → orders | Thrift shop partners |
| **admins** | id, userId, role | → user | Platform administrators |
| **store_staff** | id, storeId, name, email, role | → store | Store employees |
| **items** | id, title, description, category, brand, size, color, condition, price, images[], qrCode, status, isConsignment, hangerFee | → seller (user), → store | Inventory items |
| **orders** | id, orderNumber, status, pickupMethod, pricing, payment | → buyer (user), → store, → items | Purchase orders |
| **order_items** | id, orderId, itemId, pricing breakdown | → order, → item | Line items with revenue split |
| **transactions** | id, amount, earnings, commission, fee, status | → order, → item, → seller | Payment records |
| **payouts** | id, amount, status, stripeTransferId | → seller OR → store | Stripe payout tracking |
| **cart_items** | id, userId, itemId, quantity | → user, → item | Shopping cart |
| **analytics** | id, storeId, date, metrics | → store | Store performance data |
| **dropoff_slots** | id, storeId, date, timeSlot, capacity | → store | Consignment scheduling |

---

## 🔑 Key Enums & Constants

### Item Status Flow
```
PENDING_DROPOFF → FOR_SALE → RESERVED → SOLD
                           → REMOVED
```

### Order Status
- `RESERVED` - Items held for buyer
- `COMPLETED` - Purchase finalized
- `CANCELLED` - Order cancelled

### Payout Status  
- `PENDING` - Awaiting processing
- `PROCESSING` - Transfer initiated
- `COMPLETED` - Money sent
- `FAILED` - Transfer error

### User Roles
- **Admin**: `SUPER`, `SUPPORT`, `FINANCE`
- **Store Staff**: `MANAGER`, `STAFF`

### Store Tiers
- `basic` - Standard features
- `premium` - Enhanced analytics
- `enterprise` - Custom solutions

---

## 💰 Revenue Split Formula

When an item sells for **€45**:

```javascript
const itemPrice = 45.00;
const commissionRate = 0.20;  // 20% (configurable per store)
const platformFeeRate = 0.05; // 5% (fixed)

// Calculations
const storeCommission = itemPrice * commissionRate;     // €9.00
const platformFee = itemPrice * platformFeeRate;        // €2.25
const sellerPayout = itemPrice - storeCommission - platformFee; // €33.75

// Store in order_items table
{
  priceAtPurchase: 45.00,
  storeCommission: 9.00,
  platformFee: 2.25,
  sellerPayout: 33.75
}
```

---

## 🔍 Common Query Patterns

### Get User's Active Listings
```typescript
await prisma.item.findMany({
  where: {
    sellerId: userId,
    status: 'FOR_SALE'
  },
  include: { store: true }
});
```

### Browse Items by Store
```typescript
await prisma.item.findMany({
  where: {
    storeId: storeId,
    status: 'FOR_SALE'
  },
  include: {
    seller: { select: { name: true, avatar: true } },
    store: { select: { name: true, city: true } }
  }
});
```

### Get Order with Full Details
```typescript
await prisma.order.findUnique({
  where: { id: orderId },
  include: {
    buyer: true,
    store: true,
    items: {
      include: { item: true }
    }
  }
});
```

### Calculate Seller Earnings
```typescript
const earnings = await prisma.transaction.aggregate({
  where: {
    sellerId: userId,
    status: 'COMPLETED'
  },
  _sum: { sellerEarnings: true },
  _count: true
});
```

### Store Analytics (Today)
```typescript
const today = new Date();
today.setHours(0, 0, 0, 0);

await prisma.analytics.findUnique({
  where: {
    storeId_date: {
      storeId: storeId,
      date: today
    }
  }
});
```

---

## 🏷️ QR Code System

Each item gets a **unique QR code** for scanning:

```typescript
// Generation (example)
const qrCode = `BLOEM-${storeId.slice(0, 4)}-${Date.now()}`;

// Storage
await prisma.item.create({
  data: {
    ...itemData,
    qrCode: qrCode,
  }
});

// Scanning at checkout
const item = await prisma.item.findUnique({
  where: { qrCode: scannedCode },
  include: { seller: true, store: true }
});
```

---

## 🖼️ Image Handling

Items support **multiple images** (stored as array):

```typescript
// Upload flow
const imageUrls = await uploadToSupabaseStorage(files); // ['url1', 'url2', 'url3']

await prisma.item.create({
  data: {
    ...itemData,
    images: imageUrls, // Stored as String[]
  }
});

// Retrieval
const item = await prisma.item.findUnique({ where: { id } });
const firstImage = item.images[0]; // Primary image
```

---

## 📊 Important Indexes

For optimal performance, these indexes are defined:

### User Table
- ✅ `email` (unique, for login)
- ✅ `stripeCustomerId` (unique, for payments)

### Item Table  
- ✅ `status` (for filtering active items)
- ✅ `storeId + status` (composite, for store inventory)
- ✅ `sellerId` (for seller dashboard)
- ✅ `category` (for browse filters)
- ✅ `qrCode` (unique, for POS scanning)

### Order Table
- ✅ `orderNumber` (unique, for lookup)
- ✅ `buyerId` (for user order history)
- ✅ `storeId` (for store orders)
- ✅ `status` (for filtering)

### Transaction Table
- ✅ `sellerId + status` (for payout calculations)
- ✅ `orderId` (for order details)

---

## 🔒 Cascade Delete Behavior

When a **User** is deleted:
- ✅ Their **items** → seller set to NULL (orphaned)
- ✅ Their **orders** → CASCADE deleted
- ✅ Their **cart items** → CASCADE deleted
- ✅ Their **admin profile** → CASCADE deleted
- ✅ Their **owned store** → CASCADE deleted

When a **Store** is deleted:
- ✅ All **inventory items** → CASCADE deleted
- ✅ All **orders** → CASCADE deleted
- ✅ All **analytics** → CASCADE deleted

When an **Item** is deleted:
- ✅ Its **cart items** → CASCADE deleted
- ✅ Its **order item** → CASCADE deleted (prevents delete if sold)

---

## 📱 Mobile App Ready

Schema supports future mobile app development:
- ✅ UUID primary keys (not sequential integers)
- ✅ Timestamps for sync (`createdAt`, `updatedAt`)
- ✅ Offline-first ready (cart, wishlist)
- ✅ API-friendly structure

---

## 🚀 Performance Tips

1. **Always include only needed fields**:
   ```typescript
   // ❌ Bad - fetches everything
   await prisma.user.findMany();
   
   // ✅ Good - selective fields
   await prisma.user.findMany({
     select: { id: true, name: true, email: true }
   });
   ```

2. **Use pagination for large lists**:
   ```typescript
   await prisma.item.findMany({
     take: 20,
     skip: (page - 1) * 20,
   });
   ```

3. **Batch operations when possible**:
   ```typescript
   await prisma.item.updateMany({
     where: { sellerId: userId },
     data: { status: 'REMOVED' }
   });
   ```

---

**Last Updated:** November 9, 2025  
**Schema Version:** 1.0 (Initial)
