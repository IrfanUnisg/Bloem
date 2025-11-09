# ⚡ Quick Deployment Checklist

## Pre-Push to GitHub
- [ ] Run `npm run build` - ensure it succeeds
- [ ] Verify `.env` is in `.gitignore`
- [ ] Verify `.env.example` is committed
- [ ] Verify `generated/prisma` is in `.gitignore`
- [ ] Review all changes with `git status`
- [ ] Commit: `git add . && git commit -m "Ready for deployment"`
- [ ] Push: `git push origin main`

## Vercel Deployment
- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Click "New Project"
- [ ] Import GitHub repository
- [ ] Framework: **Vite**
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Install Command: `npm install`

## Environment Variables (Add in Vercel)
Copy these from your `.env` file:

```bash
DATABASE_URL=postgresql://postgres.xxx:xxx@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

## After Deployment
- [ ] Visit your deployed URL
- [ ] Test homepage loads
- [ ] Test Browse → Items display
- [ ] Test Browse Stores → Stores display
- [ ] Test Sign Up (mock)
- [ ] Test Sign In (mock)
- [ ] Test Add to Cart
- [ ] Test navigation (all links)
- [ ] Test 404 page (random URL)
- [ ] Check browser console for errors
- [ ] Test on mobile device
- [ ] Share with 2-3 people for feedback

## If Something Goes Wrong
1. Check Vercel deployment logs
2. Look for error messages
3. Verify environment variables are set
4. Check Supabase is not paused
5. Use Vercel "Rollback" if needed

## Next Steps (After Successful Deployment)
1. Implement Supabase Authentication
2. Replace mock auth in `AuthContext.tsx`
3. Connect real database queries
4. Add Stripe integration
5. Implement image upload
6. Build seller dashboard
7. Create admin panel

---

**Need Help?** See `DEPLOYMENT.md` for detailed guide.
