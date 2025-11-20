#!/bin/bash

# Payment and Cart Fix - Testing Script
# This script helps verify that the payment flow and cart management work correctly

echo "=================================================="
echo "Payment & Cart Fix - Verification Tests"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required tools are installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ psql is not installed. Please install PostgreSQL client.${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Verify Database Migration${NC}"
echo "Checking if updated_at column exists in orders table..."

# You'll need to set your database connection string
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL environment variable is not set${NC}"
    echo "Please set it with: export DATABASE_URL='your-connection-string'"
    exit 1
fi

# Check for updated_at column
COLUMN_CHECK=$(psql "$DATABASE_URL" -t -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'updated_at';" 2>&1)

if [[ $COLUMN_CHECK == *"updated_at"* ]]; then
    echo -e "${GREEN}✅ updated_at column exists in orders table${NC}"
else
    echo -e "${RED}❌ updated_at column NOT found in orders table${NC}"
    echo "Please run the migration: supabase/migrations/20250118_add_updated_at_to_orders.sql"
    exit 1
fi

# Check for trigger
echo ""
echo "Checking if update trigger exists..."
TRIGGER_CHECK=$(psql "$DATABASE_URL" -t -c "SELECT trigger_name FROM information_schema.triggers WHERE trigger_name = 'update_orders_updated_at';" 2>&1)

if [[ $TRIGGER_CHECK == *"update_orders_updated_at"* ]]; then
    echo -e "${GREEN}✅ Automatic update trigger exists${NC}"
else
    echo -e "${YELLOW}⚠️  Update trigger NOT found (non-critical)${NC}"
fi

echo ""
echo -e "${YELLOW}Step 2: Check Prisma Schema${NC}"
if grep -q "updatedAt.*DateTime.*@updatedAt" prisma/schema.prisma; then
    echo -e "${GREEN}✅ updatedAt field exists in Prisma schema${NC}"
else
    echo -e "${RED}❌ updatedAt field NOT found in Prisma schema${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 3: Verify Edge Function Files${NC}"

# Check confirm-payment function
if [ -f "supabase/functions/confirm-payment/index.ts" ]; then
    if grep -q "updated_at: new Date" supabase/functions/confirm-payment/index.ts; then
        echo -e "${GREEN}✅ confirm-payment function uses updated_at${NC}"
    else
        echo -e "${RED}❌ confirm-payment function doesn't use updated_at${NC}"
    fi
else
    echo -e "${RED}❌ confirm-payment function file not found${NC}"
fi

# Check if cart clearing has error handling
if grep -q "cartClearError" supabase/functions/confirm-payment/index.ts; then
    echo -e "${GREEN}✅ Cart clearing has error handling${NC}"
else
    echo -e "${YELLOW}⚠️  Cart clearing may not have proper error handling${NC}"
fi

echo ""
echo -e "${YELLOW}Step 4: Verify Frontend Error Handling${NC}"

# Check OrderConfirmation page
if grep -q "duration: 10000" src/pages/OrderConfirmation.tsx; then
    echo -e "${GREEN}✅ OrderConfirmation has extended error display${NC}"
else
    echo -e "${YELLOW}⚠️  OrderConfirmation may not show errors long enough${NC}"
fi

if grep -q "setTimeout" src/pages/OrderConfirmation.tsx; then
    echo -e "${GREEN}✅ OrderConfirmation has delayed redirect on error${NC}"
else
    echo -e "${YELLOW}⚠️  OrderConfirmation may redirect too quickly${NC}"
fi

echo ""
echo "=================================================="
echo -e "${GREEN}Verification Complete!${NC}"
echo "=================================================="
echo ""
echo "Next Steps:"
echo "1. Deploy edge functions: supabase functions deploy confirm-payment"
echo "2. Regenerate Prisma client: npx prisma generate"
echo "3. Deploy frontend changes"
echo "4. Test the payment flow manually:"
echo "   - Add items to cart"
echo "   - Complete a payment"
echo "   - Verify order confirmation shows without errors"
echo "   - Check cart is empty after successful payment"
echo ""
echo "For detailed testing instructions, see: PAYMENT_CART_FIX_GUIDE.md"
