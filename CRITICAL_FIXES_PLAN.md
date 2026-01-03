# 🚨 CRITICAL PRODUCTION FIXES — IMPLEMENTATION PLAN

**Status:** In Progress  
**Priority:** P0 (Blocking Production)

---

## 🎯 PROBLEMS IDENTIFIED

| Issue | Impact | Status |
|-------|--------|--------|
| 1. Test login fails | ❌ CRITICAL | Auth users exist but may need email_confirmed |
| 2. Signup says "already exists" | ❌ CRITICAL | Duplicate auth users from seed script |
| 3. Admin app empty | ❌ CRITICAL | Need to restore original CRA admin |
| 4. No test data | ⚠️ HIGH | Need to restore BSON/JSON dumps |
| 5. Email flows unclear | ⚠️ MEDIUM | SendGrid → Supabase migration needed |

---

## 📋 IMPLEMENTATION PLAN

### A. AUTH FIX (2-3 hours)

#### A1. Create Dev Reset Script
**File:** `scripts/dev-reset-auth.ts`

**Purpose:** Delete test users from auth.users + profiles for clean testing

```typescript
// Delete users: admin@lesociety.com, john@example.com, jane@example.com
// Idempotent, safe to re-run
```

#### A2. Create Deterministic Test Users Script
**File:** `scripts/create-test-users.ts`

**Purpose:** Create test users with email_confirmed=true and known passwords

```typescript
// Create users via supabase.auth.admin.createUser()
// Set email_confirmed: true
// Create matching profiles
```

#### A3. Fix Signup Flow
**Files:**
- `apps/web/services/supabase-api.js::signup()`

**Changes:**
- Handle "User already exists" error gracefully
- Check if user exists in auth.users before signUp
- Option: Use signInWithPassword if already exists

#### A4. Fix Login Flow
**Files:**
- `apps/web/services/supabase-api.js::login()`

**Changes:**
- Ensure signInWithPassword returns session
- Fetch profile and hydrate Redux correctly

---

### B. ADMIN APP RESTORE (3-4 hours)

#### B1. Copy Original Admin to apps/admin-cra/
**Source:** `LS9/latest/latest/var/www/html/s_admin/`  
**Dest:** `lesociety-v2/apps/admin-cra/`

**Steps:**
1. Copy entire `src/`, `public/`, `package.json`
2. Update package.json name to `@lesociety/admin-cra`
3. Add to pnpm workspaces

#### B2. Update API Endpoints
**Files:**
- `apps/admin-cra/src/utility/endPoints.js`
- `apps/admin-cra/src/utility/api.js`

**Changes:**
- Replace hardcoded API URLs with environment variables
- Point to new Supabase-backed API routes
- Use admin token authentication

#### B3. Vercel Configuration for CRA
**File:** `apps/admin-cra/vercel.json` (if needed)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "framework": null
}
```

#### B4. Wire Supabase Storage for Images
**Files:**
- Admin image viewer components

**Changes:**
- Generate signed URLs for verification docs
- Use Supabase Storage instead of AWS S3

---

### C. DATA RESTORE (4-5 hours)

#### C1. Inspect Dumps
**Location:** `lesociety/` folder

**Files to check:**
- `users.bson` / `users.json`
- `profiles.bson` / `profiles.json`  
- `dates.bson` / `dates.json`
- `chatrooms.bson` / `chatrooms.json`
- `messages.bson` / `messages.json`

#### C2. Create Restore Script
**File:** `scripts/mongo-to-supabase/restore.ts`

**Features:**
- Read BSON/JSON files
- Map MongoDB ObjectId → UUID (deterministic)
- Insert into Supabase tables in order:
  1. profiles (skip auth.users, or create with random passwords)
  2. date_posts
  3. chatrooms
  4. messages
- Handle duplicates (upsert where possible)
- Log progress and errors

#### C3. ID Mapping Strategy
**File:** `scripts/mongo-to-supabase/id-mapping.json`

```json
{
  "users": {
    "507f1f77bcf86cd799439011": "uuid-here"
  },
  "dates": {
    "mongo_id": "uuid"
  }
}
```

---

### D. EMAIL/SENDGRID DOCS (1 hour)

#### D1. Document SMTP Configuration
**File:** `docs/DEPLOYMENT_VERCEL.md` (update)

**Sections:**
- SendGrid SMTP setup for Supabase
- Supabase Auth → SMTP settings
- Email templates configuration

#### D2. Dev Email Bypass
**File:** `docs/DEV_SETUP.md`

**Sections:**
- Disable email confirmation in Supabase (dev only)
- Use admin.createUser for test users
- Local testing without SMTP

---

## 🔧 IMPLEMENTATION ORDER

### Phase 1: Auth (ASAP)
1. ✅ Create `scripts/dev-reset-auth.ts`
2. ✅ Create `scripts/create-test-users.ts`
3. ✅ Fix signup flow (handle existing users)
4. ✅ Fix login flow (ensure session works)
5. ✅ Test locally: signup → login → profile fetch

### Phase 2: Admin (After Auth)
1. ✅ Copy original admin CRA to `apps/admin-cra/`
2. ✅ Update API endpoints to Supabase
3. ✅ Configure Vercel for CRA build
4. ✅ Deploy and test admin panel
5. ✅ Wire Supabase Storage for images

### Phase 3: Data Restore (Parallel)
1. ✅ Inspect BSON/JSON dumps
2. ✅ Create restore script
3. ✅ Test restore on local Supabase
4. ✅ Document what was restored
5. ✅ Run on production (if safe)

### Phase 4: Email Docs (Final)
1. ✅ Document SMTP setup
2. ✅ Document dev bypass methods
3. ✅ Test forgot/reset flows

---

## 📊 DELIVERABLES

### Scripts
- [x] `scripts/dev-reset-auth.ts` — Delete test users
- [ ] `scripts/create-test-users.ts` — Create test users with email_confirmed
- [ ] `scripts/mongo-to-supabase/restore.ts` — Restore dumps

### Admin App
- [ ] `apps/admin-cra/` — Original admin restored
- [ ] Vercel deployment working
- [ ] Images loading from Supabase Storage

### Documentation
- [ ] `docs/AUTH_SETUP.md` — Auth configuration guide
- [ ] `docs/DEV_SETUP.md` — Local dev with test users
- [ ] `docs/DATA_RESTORE_REPORT.md` — What was restored, mapping notes
- [ ] `docs/DEPLOYMENT_VERCEL.md` (updated) — SMTP/SendGrid setup

### Testing
- [ ] Login works with test credentials
- [ ] Signup works (or gracefully handles existing)
- [ ] Admin panel shows users/dates
- [ ] Profile data visible in admin
- [ ] Images display correctly

---

## ⚠️ CONSTRAINTS

- ✅ NO UI changes to web app (design locked)
- ✅ NO secrets in repo
- ✅ Service role key server-only
- ✅ Keep deployments working
- ✅ Document everything

---

## 🚀 READY TO START

**Next Step:** Implement Phase 1 (Auth Fix)

**Estimated Total Time:** 10-13 hours  
**Critical Path:** Auth → Admin → Data  
**Can Parallelize:** Email docs while waiting for tests


