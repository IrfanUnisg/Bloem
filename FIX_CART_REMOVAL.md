# 🐛 Fix: Cannot Remove Items from Cart

## Problem Found
The `cart` edge function had a typo in the DELETE query:
- **Wrong**: `.eq('userId', userId)` ❌
- **Correct**: `.eq('user_id', userId)` ✅

The database column is `user_id` (snake_case), not `userId` (camelCase).

---

## ✅ Fixed!

I've already fixed the code in:
- `supabase/functions/cart/index.ts`

**The updated code is already in your clipboard!**

---

## 🚀 Redeploy the Cart Function

### Step 1: Go to Supabase Dashboard
1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Edge Functions**

### Step 2: Update the Cart Function
1. Find the `cart` function in the list
2. Click on it to open
3. Click **"Edit function"** or delete and recreate
4. **Paste the fixed code** (Ctrl+V - it's already in clipboard!)
5. Click **"Deploy"** or **"Save"**

---

## 🧪 Test the Fix

After redeploying:

1. **Refresh your browser** (Ctrl+F5)
2. **Go to your cart**
3. **Click the trash icon** on any item
4. **Item should be removed!** ✅

---

## What Was Changed

### Before (Lines 131 & 144):
```typescript
// Remove specific item
.eq('userId', userId)  // ❌ Wrong column name

// Clear cart
.eq('userId', userId)  // ❌ Wrong column name
```

### After (Lines 131 & 144):
```typescript
// Remove specific item
.eq('user_id', userId)  // ✅ Correct column name

// Clear cart
.eq('user_id', userId)  // ✅ Correct column name
```

---

## Why This Happened

The database uses **snake_case** naming:
- `user_id`
- `item_id`
- `cart_items`

But JavaScript typically uses **camelCase**:
- `userId`
- `itemId`
- `cartItems`

The edge function was mixing these conventions, causing the query to fail silently.

---

## Alternative: Deploy via CLI

If you have Supabase CLI installed:

```powershell
# Deploy the fixed cart function
supabase functions deploy cart
```

---

## ✅ Next Steps

After fixing the cart removal:

1. ✅ Redeploy cart function (with fix above)
2. ✅ Fix item status (run QUICK_FIX.sql if not done yet)
3. ✅ Deploy stripe-checkout function
4. ✅ Deploy confirm-payment function
5. ✅ Set STRIPE_SECRET_KEY secret
6. ✅ Test complete checkout flow

See `STRIPE_DEPLOYMENT_CHECKLIST.md` for the remaining deployment steps.

---

**The fixed code is in your clipboard - just paste it into Supabase Dashboard!** 🎉
