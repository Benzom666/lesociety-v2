# 🚀 VERCEL DEPLOYMENT — EXACT SETTINGS

**CRITICAL:** Deploy as **TWO SEPARATE PROJECTS** (not one monorepo project)

---

## PROJECT 1: WEB APP (User-Facing)

### 1. Create New Project in Vercel
- Go to https://vercel.com/new
- Import your Git repository
- Click "Import"

### 2. Configure Project Settings

| Setting | Value |
|---------|-------|
| **Project Name** | `lesociety` (or your choice) |
| **Framework Preset** | Next.js |
| **Root Directory** | `apps/web` ⚠️ **CRITICAL** |
| **Build Command** | *(leave default)* `next build` |
| **Output Directory** | *(leave default)* `.next` |
| **Install Command** | *(leave default)* `pnpm install` |

**Screenshot of Root Directory setting:**
```
┌─────────────────────────────────────────┐
│ Root Directory                          │
│ ┌─────────────────────────────────────┐ │
│ │ apps/web                            │ │ ⬅️ SET THIS!
│ └─────────────────────────────────────┘ │
│ The directory within your project...   │
└─────────────────────────────────────────┘
```

### 3. Environment Variables

Add these in: **Project Settings → Environment Variables**

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xzmrbcsjxaawmiewkmhw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR_ANON_KEY>
SUPABASE_SERVICE_ROLE_KEY=<YOUR_SERVICE_ROLE_KEY>

# Site URL (update after deployment)
NEXT_PUBLIC_SITE_URL=https://lesociety.vercel.app

# Optional
NEXT_PUBLIC_MAPBOX_TOKEN=<YOUR_MAPBOX_TOKEN>
```

**Apply to:** Production, Preview, Development

### 4. Deploy
- Click **"Deploy"**
- Wait 2-3 minutes
- Visit your deployed URL

### 5. Verify Deployment
```bash
# Test homepage
curl https://lesociety.vercel.app/

# Test health endpoint
curl https://lesociety.vercel.app/api/health
# Expected: {"status":"healthy","checks":{...}}
```

---

## PROJECT 2: ADMIN APP

### 1. Create Second Project in Vercel
- Go to https://vercel.com/new
- Select **SAME repository**
- Click "Import"

### 2. Configure Project Settings

| Setting | Value |
|---------|-------|
| **Project Name** | `lesociety-admin` |
| **Framework Preset** | Next.js |
| **Root Directory** | `apps/admin` ⚠️ **CRITICAL** |
| **Build Command** | *(leave default)* `next build` |
| **Output Directory** | *(leave default)* `.next` |
| **Install Command** | *(leave default)* `pnpm install` |

### 3. Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xzmrbcsjxaawmiewkmhw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR_ANON_KEY>
SUPABASE_SERVICE_ROLE_KEY=<YOUR_SERVICE_ROLE_KEY>

# Admin token (generate with: openssl rand -hex 32)
ADMIN_TOKEN=<GENERATE_RANDOM_32_CHAR_HEX>
```

**Apply to:** Production, Preview, Development

### 4. Deploy
- Click **"Deploy"**
- Wait 1-2 minutes
- Visit your admin URL

### 5. Verify Deployment
```bash
# Test admin homepage
curl https://lesociety-admin.vercel.app/

# Test admin API
curl -H "x-admin-token: <YOUR_TOKEN>" \
  https://lesociety-admin.vercel.app/api/admin/users
```

---

## ⚠️ COMMON ISSUES & FIXES

### Issue 1: 404 NOT FOUND
**Cause:** Root Directory not set correctly  
**Fix:** 
1. Go to Project Settings → General
2. Scroll to "Root Directory"
3. Set to `apps/web` or `apps/admin`
4. Click "Save"
5. Redeploy

### Issue 2: Build Fails with "Cannot find module"
**Cause:** Turborepo dependencies not installed  
**Fix:** Already fixed (using `tasks` field in turbo.json)

### Issue 3: Environment Variables Not Working
**Cause:** Not applied to all environments  
**Fix:**
1. Go to Project Settings → Environment Variables
2. For each variable, ensure checked: Production ✓ Preview ✓ Development ✓
3. Redeploy

### Issue 4: "Failed to load next.config.js"
**Cause:** Build running from wrong directory  
**Fix:** Set Root Directory to `apps/web` (see above)

---

## 📋 DEPLOYMENT CHECKLIST

### Web App
- [ ] Created Vercel project
- [ ] Set Root Directory: `apps/web`
- [ ] Added all environment variables
- [ ] Deployed successfully
- [ ] Verified homepage loads
- [ ] Verified `/api/health` returns 200

### Admin App
- [ ] Created separate Vercel project
- [ ] Set Root Directory: `apps/admin`
- [ ] Added all environment variables
- [ ] Generated and set ADMIN_TOKEN
- [ ] Deployed successfully
- [ ] Verified admin dashboard loads

---

## 🔄 REDEPLOYMENT

### After Code Changes
```bash
git add .
git commit -m "your message"
git push origin main
```

Vercel will **automatically redeploy** both projects.

### Manual Redeploy
1. Go to Vercel Dashboard
2. Select project (web or admin)
3. Click "Deployments" tab
4. Click "⋯" menu on latest deployment
5. Click "Redeploy"

---

## 🎯 FINAL URLS

**Web App (User-Facing):**
- Vercel URL: `https://lesociety.vercel.app`
- Custom Domain: `https://yourdomain.com` (optional)

**Admin App:**
- Vercel URL: `https://lesociety-admin.vercel.app`
- Custom Domain: `https://admin.yourdomain.com` (optional)

---

## ✅ SUCCESS CRITERIA

Deployment is successful when:

1. ✅ Web app homepage loads (shows login/homepage)
2. ✅ `/api/health` returns `{"status":"healthy"}`
3. ✅ No 404 errors on main routes
4. ✅ Admin dashboard loads at separate URL
5. ✅ Admin API returns data (with correct token)

---

## 🆘 SUPPORT

If deployment still fails:

1. **Check Vercel Build Logs:**
   - Go to Deployments → Click failed deployment → View Function Logs

2. **Verify Root Directory:**
   - Project Settings → General → Root Directory
   - MUST be `apps/web` or `apps/admin`

3. **Check Build Command:**
   - Should be default (`next build`)
   - Don't use custom turbo commands in Vercel UI

4. **Environment Variables:**
   - All should have checkmarks for: Production, Preview, Development

---

**Last Updated:** January 5, 2026  
**Status:** ✅ TESTED & VERIFIED

