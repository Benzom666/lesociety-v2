# LeSociety v2 - Deployment Guide

## Prerequisites

1. **Supabase Account**: [https://supabase.com](https://supabase.com)
2. **Vercel Account**: [https://vercel.com](https://vercel.com)
3. **pnpm**: Package manager (install via `npm i -g pnpm`)

---

## Step 1: Supabase Project Setup

### 1.1 Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **New Project**
3. Choose organization
4. Set project name: `lesociety-v2`
5. Set database password (save securely)
6. Choose region closest to your users
7. Click **Create Project**

Wait ~2 minutes for provisioning.

### 1.2 Get API Keys

Navigate to **Project Settings → API**:

- `Project URL`: Copy this (e.g., `https://xxxxx.supabase.co`)
- `anon public` key: Copy this
- `service_role` key: Copy this (⚠️ keep secret, server-only)

### 1.3 Run Database Migrations

**Option A: Via Supabase SQL Editor (Recommended)**

1. Open **SQL Editor** in Supabase Dashboard
2. Click **New Query**
3. Copy contents of `/supabase/migrations/20260103000001_initial_schema.sql`
4. Paste and click **RUN**
5. Repeat for:
   - `20260103000002_rls_policies.sql`
   - `20260103000003_storage_setup.sql`

**Option B: Via Supabase CLI**

```bash
# Install Supabase CLI
npm i -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref <your-project-ref>

# Push migrations
supabase db push
```

### 1.4 Verify Storage Buckets

Go to **Storage** in Supabase Dashboard. Verify these buckets exist:
- `profile-images`
- `date-images`
- `verification-docs`

If not, run `20260103000003_storage_setup.sql` again.

### 1.5 Configure Auth

Go to **Authentication → Providers**:

1. **Email Provider**: Ensure enabled
2. **Email Templates**: Customize if desired
3. **URL Configuration**:
   - **Site URL**: `http://localhost:3000` (dev) or `https://yourdomain.com` (prod)
   - **Redirect URLs**: Add your Vercel domain

---

## Step 2: Local Development Setup

### 2.1 Clone Repository

```bash
git clone <your-repo-url>
cd lesociety-v2
```

### 2.2 Install Dependencies

```bash
pnpm install
```

### 2.3 Configure Environment Variables

Create `.env.local` in the root:

```bash
# Copy from .env.example
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database URL (for seed script)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Legacy config (for existing code compatibility)
modules=["auth","event"]
MAPBOX_TOKEN=pk.eyJ1Ijoic2VjcmV0dGltZSIsImEiOiJja3poN3dhY2IwZXk3Mm5vMmlqdnpqMDNxIn0.RELof70VoVmL4Y4-C8HHmw
```

### 2.4 Seed Database (Optional)

```bash
cd scripts/seed
pnpm install
pnpm seed
```

Creates test accounts:
- **Admin**: `admin@lesociety.com / admin123456`
- **Male User**: `john@example.com / password123`
- **Female User**: `sarah@example.com / password123`

### 2.5 Start Development Server

```bash
# From root
cd apps/web
pnpm dev
```

Visit: `http://localhost:3000`

---

## Step 3: Vercel Deployment

### 3.1 Prepare for Production

1. **Update Site URL** in Supabase:
   - Go to **Authentication → URL Configuration**
   - Set **Site URL**: `https://yourdomain.vercel.app`
   - Add **Redirect URL**: `https://yourdomain.vercel.app/**`

2. **Update `.env.local`**:
   ```env
   NEXT_PUBLIC_SITE_URL=https://yourdomain.vercel.app
   ```

### 3.2 Deploy to Vercel

**Option A: Via Vercel Dashboard**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New → Project**
3. Import your Git repository
4. **Framework Preset**: Next.js
5. **Root Directory**: `apps/web`
6. Click **Environment Variables**:

   Add these:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (⚠️ sensitive)
   NEXT_PUBLIC_SITE_URL=https://yourdomain.vercel.app
   modules=["auth","event"]
   MAPBOX_TOKEN=pk.eyJ1Ijoic2VjcmV0dGltZSIsImEiOiJja3poN3dhY2IwZXk3Mm5vMmlqdnpqMDNxIn0.RELof70VoVmL4Y4-C8HHmw
   ```

7. Click **Deploy**

**Option B: Via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd apps/web
vercel --prod
```

Add environment variables via CLI:
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_SITE_URL
```

### 3.3 Verify Deployment

1. Visit your Vercel URL
2. Test signup/login
3. Test profile creation
4. Check Supabase logs for any RLS policy errors

---

## Step 4: Admin App Deployment (Phase 5)

After Phase 5 is complete:

```bash
cd apps/admin
vercel --prod
```

Add same environment variables as `apps/web`.

---

## Environment Variables Reference

| Variable | Scope | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anon/public key (safe for client) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Private** | Supabase service role key (**NEVER expose to client**) |
| `DATABASE_URL` | **Private** | Postgres connection string (for migrations/seed) |
| `NEXT_PUBLIC_SITE_URL` | Public | Your domain URL |
| `modules` | Legacy | Temp config for Phase 1 compatibility |
| `MAPBOX_TOKEN` | Public | Mapbox API key (if needed) |

---

## Security Checklist

- [ ] Service role key is **NEVER** exposed to client-side code
- [ ] RLS policies are enabled on all tables
- [ ] Storage buckets use signed URLs for private files
- [ ] Admin role checks are server-side only
- [ ] HTTPS enabled on production (Vercel default)
- [ ] Auth redirect URLs configured in Supabase
- [ ] `.env.local` added to `.gitignore` (never commit secrets)

---

## Monitoring & Debugging

### Supabase Logs

**Check RLS policy violations**:
- Go to **Logs → Postgres Logs**
- Filter for `permission denied` errors

### Vercel Logs

**Check runtime errors**:
- Go to **Vercel Dashboard → Project → Logs**
- Filter by function or page

### Storage Logs

**Check file upload errors**:
- Go to **Storage → Logs**

---

## Troubleshooting

### Build Fails

**Error: Missing environment variables**
- Verify all required env vars are set in Vercel

**Error: Cannot connect to database**
- Check `DATABASE_URL` is correct
- Verify Supabase project is active

### Auth Not Working

**Users can't sign up/login**
- Check Supabase Auth logs
- Verify `NEXT_PUBLIC_SITE_URL` matches actual domain
- Check redirect URLs in Supabase settings

### RLS Policy Errors

**Users can't access data**
- Check RLS policies in Supabase SQL Editor
- Run `SELECT * FROM pg_policies;` to inspect policies
- Test policies with different user contexts

### Storage Upload Fails

**403 Forbidden**
- Check storage policies
- Verify bucket exists
- Check user has proper auth token

---

## Next Steps

After successful deployment:

1. **Phase 3**: Wire frontend to Supabase (auth, CRUD)
2. **Phase 4**: Implement real-time chat
3. **Phase 5**: Deploy admin app
4. **Phase 6**: Production hardening + monitoring

---

## Support

- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **Vercel Docs**: [https://vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [https://nextjs.org/docs](https://nextjs.org/docs)

