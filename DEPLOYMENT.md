# Bloem Platform - Deployment Guide

## Prerequisites

Before deploying to Vercel, ensure you have:

1. ✅ Supabase project created
2. ✅ Database schema deployed (`init.sql` executed)
3. ✅ Environment variables ready
4. ✅ GitHub repository created

## Environment Variables for Vercel

Add these environment variables in your Vercel project settings:

### Required Variables

```bash
# Database (Critical - uses connection pooler)
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase Frontend Access
VITE_SUPABASE_URL="https://[PROJECT_REF].supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"

# Supabase Backend Access (Service Role - keep secret!)
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### Optional Variables (for future features)

```bash
# Stripe (when payment is implemented)
# VITE_STRIPE_PUBLISHABLE_KEY="pk_live_..."
# STRIPE_SECRET_KEY="sk_live_..."

# Application URL
# VITE_APP_URL="https://bloem.vercel.app"
```

## Deployment Steps

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

### 2. Deploy to Vercel

#### Option A: Via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Add environment variables (see above)
6. Click "Deploy"

#### Option B: Via Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

### 3. Post-Deployment Verification

After deployment, verify:

- [ ] Home page loads
- [ ] Browse page displays items
- [ ] Navigation works
- [ ] No console errors
- [ ] Mock authentication works
- [ ] Cart functionality works

### 4. Monitor Build Output

Watch for:
- Prisma Client generation (should run via `postinstall`)
- TypeScript compilation
- Build size warnings
- Any missing dependencies

## Build Configuration

The project uses these key settings:

### package.json
```json
{
  "scripts": {
    "postinstall": "prisma generate",  // Auto-generates Prisma Client
    "build": "vite build"
  }
}
```

### vite.config.ts
- Builds to `dist/` directory
- Uses `@/` path alias for imports
- SWC for fast React compilation

### vercel.json
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
This handles client-side routing (React Router).

## Common Issues & Solutions

### Issue: Prisma Client Not Generated
**Solution:** Vercel should automatically run `postinstall` script. If not:
- Check build logs
- Ensure `prisma` is in `dependencies`, not `devDependencies`
- Manually run `prisma generate` in build command

### Issue: Environment Variables Not Working
**Solution:**
- Ensure all `VITE_` prefixed vars are added
- Redeploy after adding new env vars
- Check Vercel project settings

### Issue: 404 on Page Refresh
**Solution:** 
- Verify `vercel.json` exists with rewrites configuration
- This is already configured in the project

### Issue: Database Connection Fails
**Solution:**
- Verify `DATABASE_URL` uses port `6543` (connection pooler)
- Check `?pgbouncer=true` parameter is present
- Ensure Supabase project is not paused

## Database Status

✅ **Schema Deployed:** All 12 tables created in Supabase
- users, stores, admins, store_staff
- items, orders, order_items, transactions
- payouts, cart_items, analytics, dropoff_slots

⏳ **Data:** Currently using mock data in frontend
- Real database queries will be implemented after auth

## Performance Optimization

Current build optimizations:
- Tree-shaking enabled
- Code splitting via Vite
- Image optimization via Vite plugins
- Lazy loading for routes (can be added)

## Security Checklist

- [x] No hardcoded secrets in code
- [x] `.env` in `.gitignore`
- [x] Service role key only in backend (not exposed to frontend)
- [x] Anon key safe for frontend use
- [ ] Row Level Security (RLS) in Supabase (implement with auth)

## Monitoring

After deployment, monitor:
1. **Vercel Analytics** - Page views, performance
2. **Supabase Dashboard** - Database queries, connections
3. **Browser Console** - Client-side errors
4. **Vercel Logs** - Build and function errors

## Rollback Procedure

If deployment fails:
1. Check Vercel deployment logs
2. Fix issues locally
3. Test with `npm run build` && `npm run preview`
4. Push fix to GitHub
5. Vercel auto-deploys from main branch

## Next Steps After Deployment

1. **Implement Authentication**
   - Enable Supabase Auth
   - Replace mock auth in `AuthContext`
   - Add protected routes

2. **Connect Real Data**
   - Replace mock data with Prisma queries
   - Implement all service methods
   - Add error boundaries

3. **Add Stripe Integration**
   - Set up Stripe account
   - Implement checkout flow
   - Add webhooks

4. **Enable Analytics**
   - Set up tracking
   - Implement store analytics
   - Add admin dashboards

## Support

For deployment issues:
- Check [Vercel Documentation](https://vercel.com/docs)
- Check [Prisma Documentation](https://www.prisma.io/docs)
- Check [Supabase Documentation](https://supabase.com/docs)

---

**Last Updated:** November 9, 2025
**Version:** 1.0.0 (Initial Deployment)
