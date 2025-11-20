# 🚨 SECURITY INCIDENT REPORT

**Date:** November 20, 2025  
**Severity:** 🔴 **CRITICAL**  
**Issue:** Sensitive credentials exposed in git repository

---

## Issue Summary

The `.env` file containing production secrets (database credentials, API keys) was committed to git repository and pushed to GitHub, exposing sensitive credentials publicly.

### Exposed Credentials

The following secrets were exposed in commit history since **November 9, 2025**:

```
DATABASE_URL (PostgreSQL credentials)
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY (CRITICAL - full database access)
VITE_STRIPE_PUBLISHABLE_KEY
```

---

## Immediate Actions Required ⚠️

### 1. Rotate ALL Credentials (URGENT)

#### Supabase Keys
1. Go to: https://supabase.com/dashboard/project/[your-project]/settings/api
2. **Reset Service Role Key** (Critical - has full database access)
3. **Generate new Anon Key** (exposed to public)
4. Update your local `.env` file with new keys
5. Update Vercel/production environment variables

#### Database Password
1. Go to: https://supabase.com/dashboard/project/[your-project]/settings/database
2. **Reset Database Password**
3. Update `DATABASE_URL` in `.env` and production

#### Stripe Keys
1. Go to: https://dashboard.stripe.com/apikeys
2. **Roll/Delete exposed publishable key**
3. **Generate new test/live keys**
4. Update `.env` and production environment

### 2. Verify No Unauthorized Access

#### Supabase Dashboard
1. Check: https://supabase.com/dashboard/project/[your-project]/logs/explorer
2. Look for suspicious queries or API calls
3. Review authentication logs for unknown users

#### Stripe Dashboard
1. Check: https://dashboard.stripe.com/logs
2. Look for unauthorized API calls
3. Review any unexpected transactions

#### Database Audit
```sql
-- Check for unauthorized users
SELECT * FROM auth.users ORDER BY created_at DESC LIMIT 50;

-- Check for suspicious data modifications
SELECT * FROM auth.audit_log_entries 
WHERE created_at >= '2025-11-09' 
ORDER BY created_at DESC 
LIMIT 100;
```

### 3. Git Cleanup (Already Done ✅)

- ✅ Removed `.env` from git tracking: `git rm --cached .env`
- ✅ Added `.env` to `.gitignore`
- ⚠️ **WARNING:** `.env` still exists in git history

---

## Long-term Security Fixes

### Option A: Remove from Git History (Recommended)

**⚠️ WARNING: This rewrites git history. Coordinate with team.**

```bash
# Using BFG Repo-Cleaner (recommended)
# Install: brew install bfg
cd /path/to/Bloem
bfg --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (⚠️ destructive)
git push --force --all
git push --force --tags

# All team members must re-clone:
git clone https://github.com/IrfanUnisg/Bloem.git
```

**OR using git filter-branch:**

```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

git push --force --all
git push --force --tags
```

### Option B: Accept History & Rotate (Current State)

If you choose not to rewrite history:
1. ✅ Rotate ALL credentials (see above)
2. ✅ Monitor for unauthorized access
3. ✅ Document incident in security log
4. ⚠️ Accept that old credentials exist in public git history

---

## Prevention Measures (Implemented ✅)

### Already Done
- ✅ Added `.env` to `.gitignore`
- ✅ Added `.env.local` to `.gitignore`
- ✅ Added `.env.*.local` to `.gitignore`
- ✅ Removed `.env` from tracking: `git rm --cached .env`
- ✅ Created `.env.example` with placeholders

### Additional Recommendations

1. **Pre-commit Hooks**
```bash
# Install git-secrets
brew install git-secrets

# Setup in repo
git secrets --install
git secrets --register-aws
git secrets --add 'supabase.*key'
git secrets --add 'DATABASE_URL'
git secrets --add 'STRIPE.*KEY'
```

2. **GitHub Secret Scanning**
- Enable: Repository Settings → Security → Secret scanning
- Enable: Push protection
- This will block commits with detected secrets

3. **Environment Variable Management**
- ✅ Use Vercel environment variables for production
- Never commit `.env` files
- Use `.env.example` as template only
- Add secrets via CI/CD platform (Vercel, GitHub Secrets)

4. **Code Review Checklist**
- Always review diffs before pushing
- Check for hardcoded credentials
- Verify `.env` not in staging area: `git status`

---

## Timeline

| Date | Event |
|------|-------|
| Nov 9, 2025 | `.env` first committed with credentials |
| Nov 11, 2025 | `.env` updated in commit 80273bc |
| Nov 20, 2025 | **Security issue discovered** |
| Nov 20, 2025 | `.env` removed from tracking |
| Nov 20, 2025 | Security incident report created |
| **PENDING** | Credential rotation |
| **PENDING** | Git history cleanup (optional) |

---

## Checklist

### Immediate (Next 1 Hour)
- [ ] Rotate Supabase Service Role Key
- [ ] Rotate Supabase Anon Key
- [ ] Reset Database Password
- [ ] Rotate Stripe Keys
- [ ] Update local `.env` with new credentials
- [ ] Update Vercel environment variables
- [ ] Test application with new credentials

### Short-term (Next 24 Hours)
- [ ] Audit Supabase logs for unauthorized access
- [ ] Audit Stripe logs for suspicious activity
- [ ] Review database for unauthorized changes
- [ ] Verify no unauthorized user accounts created
- [ ] Document incident in security log

### Long-term (Next Week)
- [ ] Decide on git history cleanup strategy
- [ ] Install git-secrets pre-commit hooks
- [ ] Enable GitHub secret scanning
- [ ] Set up security monitoring/alerts
- [ ] Team training on credential management
- [ ] Review and update security policies

---

## Impact Assessment

### Current Risk Level: 🔴 HIGH

**Exposed:**
- Full database access (SERVICE_ROLE_KEY)
- Database connection string with password
- Stripe payment API access
- Supabase project access

**Potential Impact:**
- Unauthorized database access/modification
- Data breach
- Unauthorized Stripe charges
- Service disruption
- Reputational damage

### After Credential Rotation: 🟡 MEDIUM

- Old credentials in git history (inactive)
- Need to monitor for historical access
- Risk mitigated by new credentials

### After Git History Cleanup: 🟢 LOW

- No active credentials exposed
- Clean git history
- Standard security posture restored

---

## Lessons Learned

1. ✅ Never commit `.env` files
2. ✅ Always check `.gitignore` before first commit
3. ✅ Use `.env.example` with placeholders only
4. ✅ Review `git status` before committing
5. ✅ Enable GitHub secret scanning
6. ✅ Use pre-commit hooks to prevent accidents
7. ✅ Regular security audits of repository

---

## Contact & Resources

### Credential Reset Links
- **Supabase:** https://supabase.com/dashboard
- **Stripe:** https://dashboard.stripe.com/apikeys
- **Vercel:** https://vercel.com/[team]/[project]/settings/environment-variables

### Security Resources
- GitHub Secret Scanning: https://docs.github.com/en/code-security/secret-scanning
- Git Secrets Tool: https://github.com/awslabs/git-secrets
- BFG Repo-Cleaner: https://rtyley.github.io/bfg-repo-cleaner/

---

**Report Status:** 🔴 Active Incident  
**Next Review:** After credential rotation  
**Responsible:** Project Owner/DevOps Team

---

## Appendix: Exposed Credentials Details

**File:** `.env`  
**First Exposure:** November 9, 2025 (commit f4b2902)  
**Last Update:** November 11, 2025 (commit 80273bc)  
**Current Status:** Removed from tracking (Nov 20, 2025)  
**Git History:** Still contains old credentials ⚠️

**Commits Containing .env:**
- f4b29021259b8af436649778672fa3b39fe79508
- 80273bc4860d2e481481094a3f80b24999f4f8b2

---

**END OF REPORT**
