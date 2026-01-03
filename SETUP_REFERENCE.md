# 🚀 LeSociety v2 - Setup Quick Reference

## ✅ Your Supabase Project

**Project URL**: `https://xzmrbcsjxaawmiewkmhw.supabase.co`  
**Dashboard**: [https://app.supabase.com/project/xzmrbcsjxaawmiewkmhw](https://app.supabase.com/project/xzmrbcsjxaawmiewkmhw)

---

## 📋 Setup Checklist

### 1. ✅ Environment Variables (DONE)
- [x] Created `.env.local` with your Supabase URL and anon key
- [ ] **ACTION NEEDED**: Add service_role key to `.env.local`

**To get service_role key**:
1. Go to [API Settings](https://app.supabase.com/project/xzmrbcsjxaawmiewkmhw/settings/api)
2. Copy `service_role` key
3. Edit `.env.local`, replace `your-service-role-key-here`

---

### 2. ⏳ Database Migrations (TODO)

Run these **4 SQL files** in Supabase SQL Editor **in order**:

#### Migration 1: Initial Schema
**File**: `supabase/migrations/20260103000001_initial_schema.sql`  
**Creates**: 8 tables, indexes, triggers

#### Migration 2: RLS Policies
**File**: `supabase/migrations/20260103000002_rls_policies.sql`  
**Creates**: 40 security policies

#### Migration 3: Storage Setup
**File**: `supabase/migrations/20260103000003_storage_setup.sql`  
**Creates**: 3 storage buckets + policies

#### Migration 4: Auth Triggers
**File**: `supabase/migrations/20260103000004_auth_triggers.sql`  
**Creates**: Auto-create profile on signup

**How to run**:
1. Open [SQL Editor](https://app.supabase.com/project/xzmrbcsjxaawmiewkmhw/sql/new)
2. Click **New Query**
3. Copy/paste each file's contents
4. Click **RUN**
5. Wait for "Success" ✅
6. Repeat for next file

---

### 3. ⏳ Verify Setup (TODO)

After running migrations:

**Check Tables**:
- Go to [Table Editor](https://app.supabase.com/project/xzmrbcsjxaawmiewkmhw/editor)
- Verify 8 tables exist:
  - `profiles`
  - `profile_photos`
  - `verification_documents`
  - `date_posts`
  - `chatrooms`
  - `messages`
  - `blocks`
  - `notifications`

**Check Storage**:
- Go to [Storage](https://app.supabase.com/project/xzmrbcsjxaawmiewkmhw/storage/buckets)
- Verify 3 buckets:
  - `profile-images`
  - `date-images`
  - `verification-docs`

**Check RLS Policies**:
- Go to [SQL Editor](https://app.supabase.com/project/xzmrbcsjxaawmiewkmhw/sql/new)
- Run: `SELECT count(*) FROM pg_policies;`
- Expected: **40+** policies

---

### 4. ⏳ Seed Test Data (Optional)

After service_role key is set:

```bash
cd /run/media/benzom/1A2C58B02C5888A1/PROJECTS/lesociety-v2
pnpm seed
```

**Creates**:
- Admin: `admin@lesociety.com` / `admin123456`
- Male: `john@example.com` / `password123`
- Female: `sarah@example.com` / `password123`
- 1 date post, 1 chatroom, 2 messages

---

### 5. ⏳ Start Dev Server (TODO)

```bash
cd /run/media/benzom/1A2C58B02C5888A1/PROJECTS/lesociety-v2/apps/web
pnpm dev
```

Visit: **http://localhost:3000** 🎉

---

## 🗂️ File Locations

| What | Path |
|------|------|
| Environment config | `.env.local` (root) |
| SQL migrations | `supabase/migrations/*.sql` |
| Seed script | `scripts/seed/index.ts` |
| Supabase client | `packages/supabase/src/` |
| Documentation | `docs/` |

---

## 📚 Documentation

- **[README.md](./README.md)** - Quick start guide
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System design
- **[docs/DATABASE.md](./docs/DATABASE.md)** - Schema reference
- **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Deployment guide
- **[docs/PHASE_REPORTS.md](./docs/PHASE_REPORTS.md)** - Progress tracking
- **[docs/PHASE_2_COMPLETE.md](./docs/PHASE_2_COMPLETE.md)** - Phase 2 summary

---

## 🐛 Troubleshooting

**"Missing environment variables"**
- Check `.env.local` exists in project root
- Verify service_role key is set (not placeholder)

**"Cannot connect to database"**
- Check `DATABASE_URL` in `.env.local`
- Verify Supabase project is active

**Seed fails**
- Ensure migrations ran successfully first
- Check service_role key is correct (not anon key)

**Build fails**
- Run `pnpm install` in root
- Delete `apps/web/.next` and rebuild

---

## 🎯 Current Status

| Phase | Status |
|-------|--------|
| Phase 1: Frontend Upgrade | ✅ Complete |
| Phase 2: Supabase Foundation | ✅ Code complete, needs setup |
| Phase 3: Auth & Data Wiring | ⏸️ Waiting for Phase 2 setup |

---

## 📞 Next Steps

1. **Get service_role key** from Supabase Dashboard
2. **Run 4 SQL migrations** in order
3. **Verify tables/storage** in Dashboard
4. **Run seed script** (optional)
5. **Start dev server** and test

---

**Ready to continue!** Let me know once migrations are complete. 🚀

