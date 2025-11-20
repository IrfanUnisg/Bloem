# Bloem - The Online Thrift Shop

A modern, production-ready e-commerce platform for buying and selling thrifted items. Built with React 18, TypeScript, Vite, Supabase, Stripe, and Tailwind CSS.

**Author:** @IrfanUnisg  
**Repository:** [github.com/IrfanUnisg/Bloem](https://github.com/IrfanUnisg/Bloem)  
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
- **React 18** - Modern UI framework with hooks
- **TypeScript** - Type-safe development with strict checking
- **Vite** - Next-generation build tool with lightning-fast dev server
- **Tailwind CSS** - Utility-first CSS framework for styling
- **shadcn/ui** - High-quality, accessible UI components built on Radix UI
- **React Router v6** - Client-side routing and navigation
- **React Hook Form** - Efficient form state management with validation (Zod)
- **Recharts** - Data visualization for seller analytics
- **Lucide React** - Beautiful, consistent icon set
- **Embla Carousel** - Image gallery and carousel component
- **Sonner** - Toast notifications and alerts

### Backend & Infrastructure
- **Supabase** - PostgreSQL database, authentication (Supabase Auth), real-time APIs, and file storage
- **Prisma** - Type-safe ORM for database queries
- **Stripe** - Payment processing, webhooks, and subscription management
- **Vercel** - Hosting, edge functions, and serverless deployment
- **Radix UI** - Headless component library for accessible UI

### Development Tools
- **ESLint** - Code quality and consistency checking
- **TypeScript** - Static type checking and compile-time error detection
- **Vite** - Build optimization with automatic code splitting and hot module replacement
- **PostCSS** - CSS processing pipeline
- **Autoprefixer** - Automatic CSS vendor prefixing
- **Tailwind CSS Typography** - Prose class support for rich text

---

## Features

### Core Marketplace Features
- ✅ **Browse Items** - Filter by category, size, condition, price, and search
- ✅ **Item Detail Pages** - Image galleries, QR codes, seller information, reviews
- ✅ **Shopping Cart** - Real-time cart sync across devices
- ✅ **Secure Checkout** - Stripe payment processing with multiple payment methods
- ✅ **Order Confirmation** - Automatic confirmations and tracking emails
- ✅ **Order History** - Full purchase history with status tracking

### Seller/Inventory Management
- ✅ **Item Upload** - List items with photos, descriptions, pricing, and inventory status
- ✅ **Inventory Tracking** - Real-time status: FOR_SALE, RESERVED, SOLD, REMOVED
- ✅ **Sales Dashboard** - View sales, earnings, and inventory at a glance
- ✅ **Order Fulfillment** - Manage buyer orders and shipping
- ✅ **Sales Analytics** - Revenue tracking and performance metrics (charts powered by Recharts)
- ✅ **Store Profile** - Customizable seller profile and settings

### Store Management (Multi-Store Support)
- ✅ **Store Creation** - Business users can create and manage thrift stores
- ✅ **Store Approval Workflow** - Admin approval system for store applications
- ✅ **Store Browsing** - Directory of all active stores
- ✅ **Store Profile Pages** - Public store information and inventory
- ✅ **Store Analytics** - Monthly sales statistics and performance tracking
- ✅ **Store Settings** - Dropoff point management and configuration

### User Features
- ✅ **Authentication** - Secure Supabase Auth with email/password and OAuth options
- ✅ **User Profiles** - Profile customization with avatar uploads
- ✅ **Wishlist** - Save favorite items for later
- ✅ **Order History** - Track all past purchases
- ✅ **Contact Form** - Customer inquiries and feedback
- ✅ **Responsive Design** - Mobile-optimized experience

### Admin Features
- ✅ **Store Application Management** - Approve or reject store applications
- ✅ **Platform Analytics** - System-wide statistics and monitoring
- ✅ **User Management** - View and manage platform users
- ✅ **Store Management** - Manage all active stores
- ✅ **Admin Dashboard** - Centralized admin control panel

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
│   ├── components/          # Reusable React components
│   │   ├── cards/          # Card-based UI components
│   │   ├── layout/         # Layout components (navbar, sidebar, footer)
│   │   ├── ui/             # shadcn/ui components
│   │   ├── placeholders/   # Empty states and placeholder components
│   │   ├── MobileFilterDrawer.tsx
│   │   └── ResponsiveImage.tsx
│   ├── pages/              # Page components (routed)
│   │   ├── About.tsx
│   │   ├── Browse.tsx          # Item browsing and filtering
│   │   ├── BrowseStores.tsx    # Store directory
│   │   ├── Cart.tsx
│   │   ├── Checkout.tsx
│   │   ├── Contact.tsx
│   │   ├── Dashboard.tsx       # Buyer/Seller dashboard
│   │   ├── FAQ.tsx
│   │   ├── ItemDetail.tsx
│   │   ├── OrderConfirmation.tsx
│   │   ├── Orders.tsx
│   │   ├── Profile.tsx
│   │   ├── SignIn.tsx
│   │   ├── SignUp.tsx
│   │   ├── StoreProfile.tsx
│   │   ├── Terms.tsx
│   │   ├── Upload.tsx          # Item listing form
│   │   ├── Wishlist.tsx
│   │   ├── admin/          # Admin pages
│   │   └── store/          # Store management pages
│   ├── contexts/           # React Context providers (Auth, Cart, etc.)
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API service layers and data fetching
│   │   ├── admin.service.ts
│   │   ├── auth.service.ts
│   │   ├── cart.service.ts
│   │   ├── contact.service.ts
│   │   ├── item.service.ts
│   │   ├── order.service.ts
│   │   ├── store.service.ts
│   │   ├── user.service.ts
│   │   ├── user-profile.service.ts
│   │   └── wishlist.service.ts
│   ├── lib/                # Utility functions and helpers
│   ├── types/              # TypeScript type definitions
│   ├── assets/             # Images and static assets
│   ├── App.tsx             # Root component
│   ├── App.css
│   ├── index.css
│   ├── main.tsx            # Entry point
│   └── vite-env.d.ts       # Vite environment types
├── prisma/
│   ├── schema.prisma       # Prisma ORM database schema
│   └── init.sql            # Database initialization
├── supabase/               # Supabase configuration
│   ├── functions/          # Edge functions
│   └── migrations/         # Database migrations
├── scripts/                # Development and deployment scripts
├── public/                 # Static files (robots.txt, favicons, etc.)
├── components.json         # shadcn/ui configuration
├── vite.config.ts          # Vite build configuration
├── tsconfig.json           # TypeScript configuration
├── tsconfig.app.json       # TypeScript app configuration
├── tsconfig.node.json      # TypeScript Node configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
├── eslint.config.js        # ESLint configuration
├── package.json            # Project dependencies and scripts
├── vercel.json             # Vercel deployment configuration
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
npm run dev              # Start Vite dev server with hot reload (port 5173)
npm run build            # Production build (optimized and minified)
npm run build:dev        # Development build (unminified for debugging)
npm run preview          # Preview production build locally (port 4173)

# Code Quality
npm run lint             # Run ESLint to check code quality

# Database (Prisma)
npm run prisma:generate  # Generate Prisma client from schema
npm run prisma:migrate   # Create and run database migrations
npm run prisma:studio    # Open Prisma Studio for visual database management
npm run prisma:reset     # Reset database (development only - DESTRUCTIVE)

# Post-install
postinstall hook automatically runs `prisma generate`
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

**Last Updated:** November 20, 2025  
**Production Ready:** Yes  
**Build Status:** ✅ All systems operational