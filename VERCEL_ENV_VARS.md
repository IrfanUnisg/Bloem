# Vercel Environment Variables

Copy and paste these into your Vercel project settings.
Replace the placeholder values with your actual Supabase credentials.

## Required Variables

### Database Connection (Supabase Pooler)
```
DATABASE_URL
```
Value:
```
postgresql://postgres.opzvnmjnxiomuofduxjo:youcantguessme@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Supabase URL (Frontend Access)
```
VITE_SUPABASE_URL
```
Value:
```
https://opzvnmjnxiomuofduxjo.supabase.co
```

### Supabase Anon Key (Frontend Access - Safe to Expose)
```
VITE_SUPABASE_ANON_KEY
```
Value:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wenZubWpueGlvbXVvZmR1eGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MDkxMzMsImV4cCI6MjA3ODI4NTEzM30.Wr1xrTGCm-AHaA0Fa-Zn8918yq1ISoe_EJApxZdt90U
```

### Supabase Service Role Key (Backend Only - KEEP SECRET!)
```
SUPABASE_SERVICE_ROLE_KEY
```
Value:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wenZubWpueGlvbXVvZmR1eGpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjcwOTEzMywiZXhwIjoyMDc4Mjg1MTMzfQ.ngx4EXfEZ3zbFy7cQwzk7nu3FbVbolq1FBHORLor-Hs
```

---

## How to Add in Vercel

1. Go to your project in Vercel
2. Click "Settings"
3. Click "Environment Variables"
4. For each variable above:
   - Enter the variable name (e.g., `DATABASE_URL`)
   - Paste the value
   - Select environments: Production, Preview, Development
   - Click "Add"
5. After adding all variables, redeploy your project

---

## Security Notes

⚠️ **IMPORTANT:**
- The `SUPABASE_SERVICE_ROLE_KEY` has admin access - NEVER expose it to the frontend
- The `VITE_SUPABASE_ANON_KEY` is safe to expose (it's included in your frontend bundle)
- Never commit these values to GitHub
- Use different keys for production vs development if possible

---

## Verifying Variables

After deployment, you can verify variables are loaded by checking:
1. Vercel deployment logs (they'll show environment variable names, not values)
2. Your app's functionality (if Supabase connection works, variables are correct)

If you see errors like "Missing Supabase environment variables", double-check:
- Variable names are spelled exactly as shown above (case-sensitive)
- No extra spaces in variable names or values
- All 4 variables are added
- You've redeployed after adding variables
