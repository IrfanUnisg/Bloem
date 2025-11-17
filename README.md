# Bloem - The Online Thrift Shop

A modern, production-ready e-commerce platform for buying and selling thrifted items. Built with React, TypeScript, Supabase, Stripe, and Tailwind CSS.

**Author:** @IrfanUnisg  
**Status:** Production-Ready (Cleaned & Verified - November 2025)

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Production Deployment](#production-deployment)
- [Build & Testing](#build--testing)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Project Overview

Bloem is a full-featured online thrift marketplace where users can:
- **Browse** secondhand items by category, size, and condition
- **List items** for sale with photos and QR codes
- **Shop** with secure Stripe payment processing
- **Manage inventory** with real-time status tracking
- **Track orders** with buyer and seller dashboards
- **Manage wishlists** for future purchases

The platform supports two user roles:
- **Buyers/Sellers** - Individual users who can buy and list items
- **Store Owners** - Businesses that operate multi-item stores with approval workflows

---

## Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Accessible UI components
- **React Router** - Client-side routing
- **React Hook Form** - Form state management

### Backend & Infrastructure
- **Supabase** - PostgreSQL database, authentication, and real-time APIs
- **Prisma** - ORM for type-safe database queries
- **Stripe** - Payment processing
- **Vercel** - Hosting and edge functions

### Development Tools
- **ESLint** - Code quality and consistency
- **TypeScript** - Static type checking
- **Vite** - Build optimization with automatic code splitting

---

## Features

### Core Marketplace
- ✅ Browse items by category and filters (size, condition, price)
- ✅ Item detail pages with image galleries and QR codes
- ✅ Shopping cart with real-time sync
- ✅ Secure checkout with Stripe integration
- ✅ Order confirmation and tracking

### Seller Dashboard
- ✅ List new items with photos and descriptions
- ✅ Inventory management with status tracking (FOR_SALE, RESERVED, SOLD, REMOVED)
- ✅ Order management and fulfillment
- ✅ Sales analytics and revenue tracking
- ✅ Store profile and settings

### Store Management
- ✅ Multi-item store ownership
- ✅ Store approval workflow for admins
- ✅ Dropoff point management
- ✅ Store-level inventory and order tracking
- ✅ Monthly sales statistics

### User Features
- ✅ User authentication with Supabase
- ✅ Profile management with avatar uploads
- ✅ Wishlist functionality
- ✅ Order history for buyers and sellers
- ✅ Contact form for inquiries

### Admin Features
- ✅ Store application approval/rejection
- ✅ Platform statistics and monitoring
- ✅ User and store management

---

## Quick Start

### Prerequisites
- **Node.js** 18+ and npm/bun
- **Git**
- Supabase account and project
- Stripe account

### Installation

```bash
# Clone the repository
git clone https://github.com/IrfanUnisg/Bloem.git
cd Bloem

# Install dependencies
npm install
# or
bun install

# Create .env file with credentials (see Environment Variables section)
cp .env.example .env
# Edit .env with your actual values
```

### Local Development

```bash
# Start dev server (port 5173)
npm run dev

# Run type checking
npx tsc --noEmit

# Lint code
npm run lint
```

Visit `http://localhost:5173` in your browser.

### Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations (if needed)
npm run prisma:migrate

# Open Prisma Studio for database inspection
npm run prisma:studio
```

---

## Project Structure

```
Bloem/
├── src/
│   ├── components/          # React components
│   │   ├── cards/          # Card-based UI components
│   │   ├── layout/         # Layout components (navbar, sidebar, etc)
│   │   ├── ui/             # shadcn UI components
│   │   ├── placeholders/   # Empty states and placeholders
│   │   └── MobileFilterDrawer.tsx, ResponsiveImage.tsx
│   ├── pages/              # Page components (routed)
│   ├── contexts/           # React Context providers (Auth, Cart)
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API service layers
│   │   ├── auth.service.ts
│   │   ├── item.service.ts
│   │   ├── order.service.ts
│   │   ├── cart.service.ts
│   │   ├── store.service.ts
│   │   └── ...
│   ├── lib/                # Utilities and helpers
│   ├── types/              # TypeScript type definitions
│   ├── assets/             # Images and static assets
│   ├── App.tsx             # Root component
│   └── main.tsx            # Entry point
├── prisma/                 # Database schema and migrations
│   └── schema.prisma       # Prisma ORM schema
├── supabase/               # Supabase edge functions
│   ├── functions/          # Serverless functions
│   └── migrations/         # Database migrations
├── scripts/                # Development and deployment scripts
│   ├── auto-deploy.ps1     # Automatic Vercel deployment (dev-only)
│   ├── create-admin.ts     # Create admin user (dev-only)
│   └── README.md
├── public/                 # Static files
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── package.json            # Project dependencies
└── README.md               # This file
```

---

## Environment Variables

### Required for Production

```env
# Database (PostgreSQL via Supabase)
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Supabase (Frontend access)
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"

# Supabase (Backend/Edge Functions)
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Stripe (Frontend access)
VITE_STRIPE_PUBLISHABLE_KEY="pk_live_..."
```

### Optional for Development

- Set `NODE_ENV=development` for development builds
- Use `.env.local` for local overrides (never commit this file)

**Security Note:** Never commit `.env` files with real credentials. Use your CI/CD platform's secret management system for production deployments.

---

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload

# Building
npm run build            # Production build
npm run build:dev        # Development build (unminified, for debugging)
npm run preview          # Preview production build locally

# Code Quality
npm run lint             # Run ESLint

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio for DB inspection
npm run prisma:reset     # Reset database (development only)
```

### Code Style

This project uses:
- **ESLint** for code quality (see `eslint.config.js`)
- **Tailwind CSS** for consistent styling
- **TypeScript** for type safety

Run `npm run lint` before committing to catch issues early.

---

## Production Deployment

### Vercel Deployment

1. **Connect Repository**
   ```bash
   vercel link
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add all required `.env` variables from the Environment Variables section above

3. **Deploy**
   ```bash
   vercel --prod
   # or push to main branch for automatic deployment
   ```

4. **Post-Deployment Checks**
   - Verify Supabase connection
   - Test Stripe integration in test mode
   - Confirm authentication flow
   - Test a full checkout cycle

### Database Migrations

```bash
# Run migrations before deployment
npm run prisma:migrate -- --name "your_migration_name"

# Or on Vercel, set post-build script:
# "postbuild": "prisma migrate deploy"
```

### Monitoring

- Check Vercel deployment logs
- Monitor Supabase performance in the dashboard
- Review Stripe payment logs for issues

---

## Build & Testing

### Production Build

```bash
npm run build
```

Output: `dist/` directory with optimized assets
- HTML: 4.37 kB (gzipped: 1.34 kB)
- CSS: 69.06 kB (gzipped: 12.13 kB)  
- JavaScript: 869.32 kB (gzipped: 243.08 kB)
- Build time: ~8 seconds

### Local Preview

```bash
npm run build
npm run preview
```

Serves production build at `http://localhost:4173`

### Code Quality Checks

```bash
npm run lint              # Check for code issues
npx tsc --noEmit         # Type check TypeScript
```

---

## Troubleshooting

### Database Connection Issues

**Problem:** "Cannot connect to PostgreSQL"
- Verify `DATABASE_URL` in `.env`
- Check Supabase IP whitelist in project settings
- Ensure database is running: `npm run prisma:studio`

### Supabase Authentication Fails

**Problem:** "Invalid API key" or "Cannot reach Supabase"
- Verify `VITE_SUPABASE_URL` and keys are correct
- Check that Supabase project is active
- Confirm RLS policies allow your queries

### Stripe Payment Issues

**Problem:** "Stripe initialization failed"
- Verify `VITE_STRIPE_PUBLISHABLE_KEY` is for the correct environment
- In development, use Stripe test keys
- In production, use Stripe live keys
- Check Stripe dashboard for webhook logs

### Build Errors

**Problem:** "Module not found" or "Type errors"
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm run prisma:generate
npm run build
```

**Problem:** Large chunk size warning during build
- This is expected for a full-featured marketplace
- Can be optimized with code splitting if needed
- Does not prevent deployment to Vercel

### Slow Page Load

- Enable Vite dev server caching in `.vite/` directory
- Check network tab in DevTools for slow API calls
- Verify Supabase connection latency
- Consider image optimization for item photos

---

## Project Status (Cleanup Report)

### November 2025 Cleanup
- ✅ Removed all commented-out code and temporary TODOs
- ✅ Verified no debug console statements in services (error logging kept)
- ✅ Excluded generated files from ESLint
- ✅ Confirmed no .env.local or sensitive file backups
- ✅ Production build: **SUCCESSFUL**
- ✅ All core features functional and tested

**Known Limitations:**
- Chunk size warning (not blocking, expected for full marketplace)
- ESLint warnings in auto-generated Prisma types (by design, excluded)

---

## License

This project is proprietary. All rights reserved to @IrfanUnisg.

For inquiries or licensing information, contact the project owner.

---

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review Supabase documentation: https://supabase.com/docs
3. Check Stripe documentation: https://stripe.com/docs
4. Review React documentation: https://react.dev

---

**Last Updated:** November 17, 2025  
**Production Ready:** Yes