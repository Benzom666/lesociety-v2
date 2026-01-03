# LeSociety v2 - Quick Start Guide

## 🚀 Local Development Setup (5 minutes)

### Prerequisites
- **Node.js**: 20+ ([download](https://nodejs.org))
- **pnpm**: `npm i -g pnpm`
- **Supabase Account**: [sign up](https://supabase.com)

---

## Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **New Project**
3. Set project name: `lesociety-v2`
4. Set database password (save it!)
5. Choose region → **Create Project** (wait ~2 min)

---

## Step 2: Run Database Migrations

Open **SQL Editor** in Supabase Dashboard and run these files **in order**:

```sql
-- 1. Initial Schema (tables, indexes, constraints)
-- Copy/paste: supabase/migrations/20260103000001_initial_schema.sql
-- Click RUN

-- 2. RLS Policies (security)
-- Copy/paste: supabase/migrations/20260103000002_rls_policies.sql
-- Click RUN

-- 3. Storage Setup (buckets)
-- Copy/paste: supabase/migrations/20260103000003_storage_setup.sql
-- Click RUN

-- 4. Auth Triggers (auto-create profiles)
-- Copy/paste: supabase/migrations/20260103000004_auth_triggers.sql
-- Click RUN
```

Verify in **Table Editor**: You should see 8 tables.

---

## Step 3: Get API Keys

Go to **Project Settings → API**:

- Copy **Project URL**: `https://xxxxx.supabase.co`
- Copy **anon public** key
- Copy **service_role** key (⚠️ keep secret!)

---

## Step 4: Configure Environment

```bash
# Clone repo (or use existing)
cd lesociety-v2

# Create .env.local
cp .env.example .env.local

# Edit .env.local
nano .env.local
```

Paste your keys:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...  # ⚠️ SECRET
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Step 5: Install Dependencies

```bash
pnpm install
```

---

## Step 6: Seed Test Data (Optional)

```bash
pnpm seed
```

Creates:
- **Admin**: `admin@lesociety.com` / `admin123456`
- **Male**: `john@example.com` / `password123`
- **Female**: `sarah@example.com` / `password123`

---

## Step 7: Start Dev Server

```bash
cd apps/web
pnpm dev
```

Visit: **http://localhost:3000** 🎉

---

## ✅ Verify Setup

1. Open browser: `http://localhost:3000`
2. Try signing up with a new email
3. Check Supabase Dashboard → **Authentication → Users** (should see new user)
4. Check **Table Editor → profiles** (should auto-create profile)

---

## 📁 What's Been Built So Far

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ Complete | Frontend upgraded to Next.js 15 |
| Phase 2 | ✅ Complete | Supabase backend (DB, RLS, Storage) |
| Phase 3 | 🔄 Next | Wire auth & data to Supabase |
| Phase 4 | ⏸️ Pending | Real-time chat (Supabase Realtime) |
| Phase 5 | ⏸️ Pending | Admin app |
| Phase 6 | ⏸️ Pending | Production deployment |

---

## 🎯 Current State

### ✅ Working
- Frontend builds and runs
- Supabase schema deployed
- RLS policies active
- Storage buckets created
- Seed data creates test users

### 🔄 In Progress (Phase 3)
- Auth wiring (signup/login forms)
- Profile CRUD
- Date post creation/browsing
- Photo uploads

### ⏸️ Not Yet Implemented
- Real-time chat (Socket.IO still in code, not functional)
- Admin panel
- Email verification
- Payment integration

---

## 📚 Documentation

- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System design
- **[DATABASE.md](./docs/DATABASE.md)** - Schema + RLS reference
- **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Vercel deployment guide
- **[PHASE_REPORTS.md](./docs/PHASE_REPORTS.md)** - Progress tracking

---

## 🐛 Troubleshooting

**Build fails: "Missing environment variables"**
- Check `.env.local` exists in project root
- Verify all 5 required env vars are set

**"Cannot connect to database"**
- Check `DATABASE_URL` in `.env.local`
- Verify Supabase project is active

**"Permission denied" errors**
- Check RLS policies in Supabase SQL Editor
- Verify user is authenticated (check JWT)

**Seed script fails**
- Check `SUPABASE_SERVICE_ROLE_KEY` is correct
- Verify migrations ran successfully

---

## 🚀 Next Steps

After local setup works:

1. **Test existing UI**: Browse around, check if pages load
2. **Phase 3**: Wire signup/login forms to Supabase Auth
3. **Phase 4**: Implement real-time chat
4. **Deploy**: Vercel + Supabase production

---

## 📞 Support

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)

---

**Ready to build!** 🎉
