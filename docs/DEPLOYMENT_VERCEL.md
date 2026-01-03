# 🚀 PHASE 6 — VERCEL DEPLOYMENT GUIDE

**Date:** January 4, 2026  
**Status:** READY FOR DEPLOYMENT ✅

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### 1. Environment Variables Prepared
- [ ] Supabase project URL
- [ ] Supabase anon key
- [ ] Supabase service role key
- [ ] Admin token generated
- [ ] Mapbox token (optional)

### 2. Builds Pass Locally
```bash
cd /run/media/benzom/1A2C58B02C5888A1/PROJECTS/lesociety-v2

# Test web app
cd apps/web
pnpm build
# Should complete without errors

# Test admin app
cd apps/admin
pnpm build
# Should complete without errors
```

### 3. Git Repository
- [ ] All changes committed
- [ ] No secrets in code or docs
- [ ] Repository pushed to GitHub/GitLab/Bitbucket

---

## 🏗️ DEPLOYMENT ARCHITECTURE

### Two Separate Vercel Projects

#### Project 1: Web App (User-Facing)
- **Domain:** `lesociety.vercel.app` (or custom domain)
- **Source:** `apps/web`
- **Build Command:** `cd ../.. && pnpm install && pnpm --filter @lesociety/web build`
- **Output Directory:** `apps/web/.next`
- **Install Command:** `pnpm install`

#### Project 2: Admin App
- **Domain:** `lesociety-admin.vercel.app` (or custom domain)
- **Source:** `apps/admin`
- **Build Command:** `cd ../.. && pnpm install && pnpm --filter @lesociety/admin build`
- **Output Directory:** `apps/admin/.next`
- **Install Command:** `pnpm install`

---

## 🚀 STEP-BY-STEP DEPLOYMENT

### Step 1: Deploy Web App

1. **Go to Vercel Dashboard:** https://vercel.com/new

2. **Import Repository:**
   - Click "Import Project"
   - Select your Git repository
   - Click "Import"

3. **Configure Project:**
   - **Project Name:** `lesociety` (or your choice)
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/web` ✅ IMPORTANT
   - **Build Command:** Leave default or use:
     ```bash
     cd ../.. && pnpm install && pnpm --filter @lesociety/web build
     ```
   - **Output Directory:** `.next`
   - **Install Command:** `pnpm install`

4. **Add Environment Variables:**
   Click "Environment Variables" and add:
   
   | Key | Value | Environment |
   |-----|-------|-------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://<project>.supabase.co` | Production, Preview, Development |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | Production, Preview, Development |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` | Production, Preview, Development |
   | `NEXT_PUBLIC_SITE_URL` | `https://lesociety.vercel.app` | Production |
   | `NEXT_PUBLIC_SITE_URL` | `https://<preview>.vercel.app` | Preview (optional) |
   | `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Development |
   | `NEXT_PUBLIC_MAPBOX_TOKEN` | `pk.eyJ...` | All (optional) |

5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete (3-5 minutes)
   - Visit your deployed app

6. **Verify Deployment:**
   ```bash
   # Test health endpoint
   curl https://lesociety.vercel.app/api/health
   
   # Expected: {"status":"healthy","checks":{...}}
   ```

---

### Step 2: Deploy Admin App

1. **Create New Project in Vercel:**
   - Go to https://vercel.com/new
   - Select same repository
   - Click "Import"

2. **Configure Project:**
   - **Project Name:** `lesociety-admin`
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/admin` ✅ IMPORTANT
   - **Build Command:**
     ```bash
     cd ../.. && pnpm install && pnpm --filter @lesociety/admin build
     ```
   - **Output Directory:** `.next`
   - **Install Command:** `pnpm install`

3. **Add Environment Variables:**
   
   | Key | Value | Environment |
   |-----|-------|-------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://<project>.supabase.co` | All |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | All |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` ⚠️ **CRITICAL** | All |
   | `ADMIN_TOKEN` | Generate with `openssl rand -hex 32` | All |

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete

5. **Verify Deployment:**
   - Visit https://lesociety-admin.vercel.app
   - Should see admin login page
   - Enter your `ADMIN_TOKEN`
   - Should see dashboard

---

## 🔐 SECURITY BEST PRACTICES

### 1. Protect Admin Domain
**Option A: IP Whitelist (Vercel Pro)**
- Go to Project Settings → Security
- Add allowed IPs (your office/home IP)

**Option B: HTTP Basic Auth (Vercel Pro)**
- Add username/password protection

**Option C: Custom Domain**
- Use non-obvious domain like `admin-internal-xyz.yourdomain.com`

### 2. Rotate Keys Regularly
```bash
# Generate new admin token monthly
openssl rand -hex 32

# Update in Vercel:
# Project Settings → Environment Variables → ADMIN_TOKEN → Edit
```

### 3. Monitor Access Logs
- Vercel Analytics (paid): Track admin access
- Supabase Logs: Monitor service_role key usage

### 4. Separate Service Role Keys (Recommended)
Use different Supabase projects for production vs. staging:
- `lesociety-prod` → Production data
- `lesociety-staging` → Test data

---

## 🧪 POST-DEPLOYMENT TESTING

### Web App Tests

#### Test 1: Health Check
```bash
curl https://lesociety.vercel.app/api/health
# Expect: {"status":"healthy"}
```

#### Test 2: Signup Flow
1. Visit https://lesociety.vercel.app/auth/registration
2. Create test account
3. Check Supabase → auth.users and profiles tables
4. Verify user created

#### Test 3: Login & Session
1. Login with test account
2. Refresh page → should stay logged in
3. Check browser localStorage for Supabase session

#### Test 4: Create Date Post
1. Complete profile onboarding (steps 1-4)
2. Create a date post
3. Check Supabase → date_posts table

#### Test 5: Upload Image
1. Upload profile photo
2. Check Supabase Storage → profile-images bucket
3. Verify image appears on profile

---

### Admin App Tests

#### Test 1: Admin Login
```bash
# Your admin token
ADMIN_TOKEN="<your-token>"

curl -H "x-admin-token: $ADMIN_TOKEN" \
  https://lesociety-admin.vercel.app/api/admin/users

# Expect: JSON with users list
```

#### Test 2: Verify User
1. Login to admin dashboard
2. Go to Users tab
3. Find pending user
4. Click "Verify"
5. Check DB: user status should be 'verified'

#### Test 3: Approve Date Post
1. Go to Date Posts tab
2. Click "Pending"
3. Click "Approve" on a date
4. Check DB: status='verified', is_published=true

---

## 🔧 TROUBLESHOOTING

### Build Fails

**Error:** `Cannot find module '@lesociety/supabase'`

**Fix:**
```bash
# In vercel.json or project settings, ensure build command includes:
cd ../.. && pnpm install
```

**Error:** `Missing environment variables`

**Fix:**
- Go to Project Settings → Environment Variables
- Add all required vars for "Production" environment
- Redeploy

---

### Runtime Errors

**Error:** `Failed to fetch` on API calls

**Fix:**
1. Check browser console for CORS errors
2. Verify `NEXT_PUBLIC_SITE_URL` matches actual domain
3. Check Supabase Auth → URL Configuration → Site URL

**Error:** `Unauthorized` on admin API

**Fix:**
1. Verify `ADMIN_TOKEN` in Vercel matches token used in browser
2. Check browser localStorage for correct token
3. Clear localStorage and re-login

---

### Supabase Connection Issues

**Error:** `Health check failed` or `Database connection error`

**Fix:**
1. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
3. Check Supabase project is not paused (free tier auto-pauses after inactivity)
4. Check Supabase → Project Settings → API → Confirm keys match

---

## 📊 ENVIRONMENT VARIABLES SUMMARY

### Web App (apps/web)
```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
NEXT_PUBLIC_SITE_URL=https://lesociety.vercel.app

# Optional
NEXT_PUBLIC_MAPBOX_TOKEN=<mapbox-token>
```

### Admin App (apps/admin)
```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
ADMIN_TOKEN=<generate-random-32-char-hex>
```

---

## 🔄 CI/CD PIPELINE

Vercel automatically deploys on Git push:

1. **Production:** Push to `main` branch
2. **Preview:** Push to any branch or open PR
3. **Build:** Vercel runs build command
4. **Deploy:** If build succeeds, deploy to unique URL

### Custom Domains

**Web App:**
1. Go to Project Settings → Domains
2. Add `lesociety.com` (or your domain)
3. Add DNS records as instructed by Vercel
4. Update `NEXT_PUBLIC_SITE_URL` to production domain

**Admin App:**
1. Add `admin.lesociety.com` or separate domain
2. Update Vercel DNS

---

## ✅ DEPLOYMENT CHECKLIST

| Task | Status | Notes |
|------|--------|-------|
| Web app deployed | ⏳ | Pending user action |
| Admin app deployed | ⏳ | Pending user action |
| Environment variables set | ⏳ | Must add manually |
| Health check passes | ⏳ | Test after deploy |
| Signup works | ⏳ | Test after deploy |
| Admin login works | ⏳ | Test after deploy |
| Custom domains configured | ⏳ | Optional |
| SSL certificates active | ✅ | Vercel auto-provisions |
| No secrets in repo | ✅ | Verified |

---

## 📚 ADDITIONAL RESOURCES

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment

---

## 🎉 SUCCESS CRITERIA

Deployment is successful when:

1. ✅ Web app loads at `https://lesociety.vercel.app`
2. ✅ Health check returns `{"status":"healthy"}`
3. ✅ Users can signup, login, create dates
4. ✅ Admin app loads at `https://lesociety-admin.vercel.app`
5. ✅ Admin can login and manage users/dates
6. ✅ All environment variables are server-side (no secrets leaked)
7. ✅ Build completes in < 5 minutes
8. ✅ No console errors in production

---

**Status:** ✅ READY FOR DEPLOYMENT  
**Estimated Time:** 30-45 minutes for both apps  
**Cost:** Free (Vercel Hobby tier sufficient for MVP)


