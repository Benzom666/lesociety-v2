# ✅ VERCEL 404 FIX — DEPLOYMENT CONFIGURATION

## 🎯 PROBLEM IDENTIFIED

**Issue:** Vercel shows 404 NOT FOUND after deployment  
**Root Cause:** Incompatible `vercel.json` trying to use deprecated multi-app routing in single project

## 🔧 SOLUTION

**Deploy as TWO SEPARATE VERCEL PROJECTS** with Root Directory settings

---

## 📁 FILES CHANGED

### 1. Removed/Deprecated
- ❌ `vercel.json` → Moved to `vercel.json.deprecated`
  - **Reason:** Incompatible with modern Vercel monorepo deployment
  - **Old approach:** Single project with routes (deprecated)
  - **New approach:** Separate projects with Root Directory

### 2. Added
- ✅ `VERCEL_DEPLOYMENT_GUIDE.md` — Comprehensive deployment instructions

---

## ⚙️ EXACT VERCEL SETTINGS

### PROJECT 1: Web App (apps/web)

| Setting | Value |
|---------|-------|
| Project Name | `lesociety` |
| Framework Preset | Next.js |
| **Root Directory** | **`apps/web`** ⚠️ |
| Build Command | `next build` (default) |
| Output Directory | `.next` (default) |
| Install Command | `pnpm install` (auto-detected) |

**Environment Variables:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xzmrbcsjxaawmiewkmhw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR_KEY>
SUPABASE_SERVICE_ROLE_KEY=<YOUR_KEY>
NEXT_PUBLIC_SITE_URL=https://lesociety.vercel.app
NEXT_PUBLIC_MAPBOX_TOKEN=<YOUR_TOKEN>
```

---

### PROJECT 2: Admin App (apps/admin)

| Setting | Value |
|---------|-------|
| Project Name | `lesociety-admin` |
| Framework Preset | Next.js |
| **Root Directory** | **`apps/admin`** ⚠️ |
| Build Command | `next build` (default) |
| Output Directory | `.next` (default) |
| Install Command | `pnpm install` (auto-detected) |

**Environment Variables:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xzmrbcsjxaawmiewkmhw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR_KEY>
SUPABASE_SERVICE_ROLE_KEY=<YOUR_KEY>
ADMIN_TOKEN=<GENERATE_WITH_openssl_rand_-hex_32>
```

---

## ✅ VERIFICATION

### Structure Confirmed
```bash
✅ apps/web/pages/index.js exists
✅ apps/web/next.config.js exists
✅ apps/web/pages/api/health.js exists
✅ apps/admin/pages/index.js exists
✅ apps/admin/pages/api/admin/users.js exists
```

### After Deployment, Test:

**Web App:**
```bash
# Homepage
curl https://lesociety.vercel.app/
# Should return HTML

# Health check
curl https://lesociety.vercel.app/api/health
# Should return: {"status":"healthy","checks":{...}}
```

**Admin App:**
```bash
# Admin dashboard
curl https://lesociety-admin.vercel.app/
# Should return HTML

# Admin API
curl -H "x-admin-token: <YOUR_TOKEN>" \
  https://lesociety-admin.vercel.app/api/admin/users
# Should return: {"users":[...],"total":...}
```

---

## 🚨 CRITICAL SETTINGS

### MUST SET ROOT DIRECTORY

**In Vercel Project Settings:**
1. Go to **Project Settings** → **General**
2. Scroll to **"Root Directory"**
3. Click **"Edit"**
4. Set to:
   - Web App: `apps/web`
   - Admin App: `apps/admin`
5. Click **"Save"**
6. **Redeploy**

**Without Root Directory:**
- ❌ Vercel builds from repo root
- ❌ Can't find next.config.js
- ❌ 404 on all routes

**With Root Directory:**
- ✅ Vercel builds from correct subdirectory
- ✅ Finds next.config.js
- ✅ All routes work

---

## 📊 DEPLOYMENT STEPS

### Step 1: Delete Old Deployment (if exists)
If you already deployed with wrong settings:
1. Go to Vercel Dashboard
2. Select project
3. Settings → General → Scroll to bottom
4. Click "Delete Project"

### Step 2: Create Web App Project
1. Go to https://vercel.com/new
2. Import repository
3. **Set Root Directory: `apps/web`**
4. Add environment variables
5. Deploy

### Step 3: Create Admin App Project
1. Go to https://vercel.com/new
2. Import **SAME repository**
3. **Set Root Directory: `apps/admin`**
4. Add environment variables
5. Deploy

### Step 4: Verify
```bash
# Web app
curl https://<your-web-url>.vercel.app/api/health

# Admin app
curl https://<your-admin-url>.vercel.app/
```

---

## 🎯 EXPECTED RESULTS

**Before Fix:**
```
❌ 404 NOT FOUND
❌ This page could not be found
```

**After Fix:**
```
✅ Homepage loads (login/homepage UI)
✅ /api/health returns {"status":"healthy"}
✅ All routes work correctly
```

---

## 📝 COMMIT INFO

```
481aa58 fix: remove incompatible vercel.json, add proper deployment guide
```

**Files Changed:**
- `vercel.json` → `vercel.json.deprecated` (moved)
- `VERCEL_DEPLOYMENT_GUIDE.md` (new, 260 lines)

**Pushed to:** `origin/main`

---

## ✅ SUCCESS CHECKLIST

- [x] Removed incompatible vercel.json
- [x] Created deployment guide
- [x] Verified apps/web structure
- [x] Verified apps/admin structure
- [x] Documented exact settings
- [x] Committed and pushed
- [ ] **User action:** Set Root Directory in Vercel
- [ ] **User action:** Add environment variables
- [ ] **User action:** Deploy and test

---

## 🚀 READY FOR DEPLOYMENT

**Status:** ✅ CONFIGURATION COMPLETE  
**Next Steps:** Follow `VERCEL_DEPLOYMENT_GUIDE.md`  
**Estimated Time:** 10-15 minutes per app

**🎉 Vercel 404 should be fixed after setting Root Directory! 🎉**

