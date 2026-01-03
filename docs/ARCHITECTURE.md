# LeSociety v2 - Architecture

## System Overview

LeSociety v2 is a **modern, production-ready dating platform** built as a monorepo using **Next.js 15** and **Supabase**. It replaces a legacy stack (Next.js 11 + MongoDB + Express + Socket.IO + AWS) with a clean, serverless architecture.

---

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (Pages Router)
- **React**: 18.2.0
- **State Management**: Redux 5 + Redux Saga
- **Styling**: SCSS + Bootstrap 5
- **Forms**: Formik, React Hook Form, Redux Form
- **UI Libraries**: React Modal, React Slick, React Tabs, Ant Design

### Backend
- **Framework**: Next.js API Routes / Server Actions
- **Auth**: Supabase Auth (email/password)
- **Database**: Supabase Postgres (with RLS)
- **Storage**: Supabase Storage (private buckets)
- **Realtime**: Supabase Realtime (Postgres changes)

### Infrastructure
- **Hosting**: Vercel (frontend + API)
- **Database**: Supabase (managed Postgres)
- **CDN**: Vercel Edge Network
- **Monitoring**: Vercel Analytics + Supabase Logs

### Development
- **Monorepo**: pnpm workspaces + Turborepo
- **Language**: TypeScript + JavaScript (mixed)
- **Package Manager**: pnpm 10+
- **Node**: 20+

---

## Monorepo Structure

```
lesociety-v2/
├── apps/
│   ├── web/                 # User-facing app (Next.js 15, Pages Router)
│   │   ├── components/      # Shared UI components
│   │   ├── core/            # Core layout components (header, sidebar, etc)
│   │   ├── modules/         # Feature modules (auth, date, event, etc)
│   │   ├── pages/           # Next.js pages (routing)
│   │   ├── public/          # Static assets
│   │   ├── styles/          # Global SCSS
│   │   ├── utils/           # Utility functions
│   │   ├── engine.js        # Redux store configuration
│   │   ├── next.config.js   # Next.js config
│   │   └── package.json
│   │
│   └── admin/               # Admin app (moderation, user management)
│       └── (to be built in Phase 5)
│
├── packages/
│   ├── config/              # Shared ESLint + TypeScript configs
│   │   ├── eslint.config.js
│   │   ├── tsconfig.base.json
│   │   └── tsconfig.nextjs.json
│   │
│   ├── supabase/            # Shared Supabase clients + helpers
│   │   ├── src/
│   │   │   ├── client.ts    # Supabase client factory (browser, server, service)
│   │   │   ├── storage.ts   # Storage helpers (upload, signed URLs)
│   │   │   └── index.ts     # Exports
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── types/               # Shared TypeScript types
│       └── (to be created in Phase 3)
│
├── scripts/
│   └── seed/                # Database seed script
│       ├── index.ts         # Creates test users, dates, chatrooms
│       └── package.json
│
├── supabase/
│   └── migrations/          # SQL migrations
│       ├── 20260103000001_initial_schema.sql
│       ├── 20260103000002_rls_policies.sql
│       └── 20260103000003_storage_setup.sql
│
├── docs/
│   ├── ARCHITECTURE.md      # This file
│   ├── DATABASE.md          # Schema + RLS reference
│   ├── DEPLOYMENT.md        # Deployment guide
│   └── PHASE_REPORTS.md     # Progress reports
│
├── .env.example             # Environment variable template
├── pnpm-workspace.yaml      # pnpm workspace config
├── turbo.json               # Turborepo config
├── package.json             # Root package
└── README.md                # Project overview
```

---

## Data Flow

### Authentication Flow

1. **Signup**:
   - User submits email/password
   - Frontend calls Supabase Auth `signUp()`
   - Supabase creates user in `auth.users`
   - Trigger/Server Action creates profile in `public.profiles`
   - User redirected to onboarding

2. **Login**:
   - User submits credentials
   - Frontend calls Supabase Auth `signInWithPassword()`
   - Supabase returns JWT + refresh token
   - JWT stored in httpOnly cookie (handled by Supabase client)
   - Subsequent requests include JWT in Authorization header

3. **Session Management**:
   - JWT auto-refreshed by Supabase client
   - Middleware verifies JWT on protected routes
   - User context available via `auth.uid()` in RLS policies

### Data Fetching

**Option A: Server Actions (Preferred)**
```typescript
// app/actions/profile.ts
'use server'
import { createServerClientWithAuth } from '@lesociety/supabase';

export async function updateProfile(formData: FormData) {
  const supabase = createServerClientWithAuth();
  const { data, error } = await supabase
    .from('profiles')
    .update({ ... })
    .eq('id', auth.uid());
  
  return { data, error };
}
```

**Option B: API Routes (Legacy compatibility)**
```typescript
// pages/api/profile.ts
import { createServerClientWithAuth } from '@lesociety/supabase';

export default async function handler(req, res) {
  const supabase = createServerClientWithAuth(req.cookies.access_token);
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', auth.uid())
    .single();
  
  res.json({ data, error });
}
```

### Realtime Subscriptions

```typescript
// Subscribe to new messages in a chatroom
const supabase = createBrowserClient();

const channel = supabase
  .channel('chatroom:123')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `chatroom_id=eq.123`
  }, (payload) => {
    // Update UI with new message
  })
  .subscribe();
```

---

## Security Architecture

### Row Level Security (RLS)

All database tables enforce **Row Level Security**. Policies use `auth.uid()` to determine user context.

**Example**: Users can only update their own profile
```sql
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
```

**Block Enforcement**:
```sql
-- Helper function checks for blocks
CREATE FUNCTION is_blocked(user_a UUID, user_b UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM blocks
    WHERE (blocker_id = user_a AND blocked_id = user_b)
       OR (blocker_id = user_b AND blocked_id = user_a)
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Used in policies
CREATE POLICY "Users cannot see blocked profiles"
  ON public.profiles FOR SELECT
  USING (NOT is_blocked(auth.uid(), id));
```

### Storage Security

All buckets are **private**. Access via signed URLs only.

**Upload Flow**:
1. User submits file from browser
2. Frontend uploads to API route
3. API route verifies auth + generates storage path
4. API route uploads to Supabase Storage (service role)
5. API route returns signed URL (expires in 1 hour)

**Storage Policies** (example):
```sql
-- Users can upload to their own folder
CREATE POLICY "Users can upload own profile images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

### Admin Access

Admins identified by `profiles.role = 'admin'`.

**Server-Side Check**:
```typescript
async function requireAdmin(userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  
  if (data?.role !== 'admin') {
    throw new Error('Unauthorized');
  }
}
```

**RLS Policies for Admins**:
```sql
-- Admins can view all verification documents
CREATE POLICY "Admins can view all verification docs"
  ON public.verification_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## Key Features

### 1. User Onboarding

**Flow**:
1. Signup (email/password)
2. Multi-step form:
   - Step 1: Basic info (name, age, gender)
   - Step 2: Location
   - Step 3: Preferences
   - Step 4: Photo upload
   - Step 5: Verification (selfie + ID)
3. Admin approval (status: pending → verified)

**State**: Tracked via `profiles.step_completed`

### 2. Date Creation (Female Users)

**Flow**:
1. User creates date post (tier, category, details, price, location, time)
2. Status: `pending`
3. Admin reviews and approves (status: `verified`, `is_published: true`)
4. Date appears in public browse

**RLS**: Only creator and admins can see pending posts.

### 3. Date Browsing (Male Users)

**Flow**:
1. User browses verified, published date posts
2. Filters: location, tier, category, price range
3. Click to view details
4. Send request (creates chatroom)

**Block Enforcement**: Blocked users' dates hidden.

### 4. Chat System

**Request Flow**:
1. Male user requests date → creates `chatrooms` entry (status: `pending`)
2. Female user receives notification
3. Female user accepts → updates chatroom (status: `accepted`)

**Messaging**:
- Real-time via Supabase Realtime
- Postgres changes on `messages` table
- Read receipts: `read_at` timestamp
- Soft delete: `deleted_at` timestamp

**Blocking**:
- Either user can block the other
- Creates entry in `blocks` table
- RLS denies access to chatroom/messages
- Chatroom status updated to `blocked`

### 5. Verification System

**Flow**:
1. User uploads selfie + government ID
2. Stored in `verification-docs` bucket (private)
3. Admin reviews in admin panel
4. Admin approves/rejects
5. If approved: `profiles.is_verified = true`, `status = 'verified'`

**Access**: Only user and admins can view verification docs.

### 6. Admin Moderation

**Features** (Phase 5):
- User management (approve, block, delete)
- Date post moderation (approve, block, reject)
- Verification document review
- Send in-app notifications
- View reports/blocks

**Auth**: Admin role required, enforced via RLS + server-side checks.

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Vercel                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Next.js App (apps/web)                               │  │
│  │  - Static pages (SSG)                                 │  │
│  │  - Server pages (SSR)                                 │  │
│  │  - API routes                                         │  │
│  │  - Server Actions                                     │  │
│  └───────────────────────────────────────────────────────┘  │
│                          ▲                                   │
│                          │ HTTPS                             │
└──────────────────────────┼───────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                       Supabase                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐│
│  │   Auth          │  │   Postgres      │  │  Storage     ││
│  │   (JWT-based)   │  │   (RLS enabled) │  │  (private)   ││
│  └─────────────────┘  └─────────────────┘  └──────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   Realtime (Postgres changes via WebSocket)          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Environment Variables**:
- `NEXT_PUBLIC_SUPABASE_URL` (public)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public, RLS-restricted)
- `SUPABASE_SERVICE_ROLE_KEY` (private, bypasses RLS)
- `NEXT_PUBLIC_SITE_URL` (public)

---

## Migration Strategy

### Phase 1: Frontend Upgrade ✅
- Upgraded Next.js 11 → 15
- Preserved Pages Router + UI/UX
- Fixed build/runtime errors
- **Status**: Complete

### Phase 2: Supabase Foundation ✅
- Created Postgres schema
- Implemented RLS policies
- Set up storage buckets
- **Status**: Complete

### Phase 3: Auth & Data Wiring 🔄
- Replace legacy auth with Supabase
- Wire CRUD operations
- Replace AWS S3 with Supabase Storage
- **Status**: Next

### Phase 4: Chat & Realtime 🔄
- Replace Socket.IO with Supabase Realtime
- Implement real-time messaging
- **Status**: Pending

### Phase 5: Admin App 🔄
- Build admin moderation interface
- **Status**: Pending

### Phase 6: Deployment 🔄
- Production hardening
- Deploy to Vercel + Supabase
- **Status**: Pending

---

## Legacy Stack Elimination

| Component | Legacy | New | Status |
|-----------|--------|-----|--------|
| Frontend | Next.js 11 | Next.js 15 | ✅ Complete |
| State | Redux 4 | Redux 5 | ✅ Complete |
| Auth | Custom/MongoDB | Supabase Auth | 🔄 Phase 3 |
| Database | MongoDB | Supabase Postgres | 🔄 Phase 3 |
| Storage | AWS S3/CloudFront | Supabase Storage | 🔄 Phase 3 |
| Realtime | Socket.IO | Supabase Realtime | 🔄 Phase 4 |
| API | Express.js | Next.js API Routes | 🔄 Phase 3-4 |

---

## Performance Considerations

### Caching Strategy
- Static pages: ISR (Incremental Static Regeneration)
- Dynamic pages: SSR with edge caching
- API routes: Cache-Control headers

### Database Optimization
- Indexes on all foreign keys
- Indexes on frequently queried columns
- Composite indexes for join queries

### Image Optimization
- Next.js Image component (`next/image`)
- Lazy loading
- Responsive images
- Signed URLs with cache headers

### Realtime Optimization
- Subscribe only to active chatrooms
- Unsubscribe when user leaves page
- Batch updates to reduce re-renders

---

## Testing Strategy (Phase 6)

### Unit Tests
- Utility functions
- Helpers
- Business logic

### Integration Tests
- API routes
- Server Actions
- Database queries

### E2E Tests
- Auth flows
- Onboarding
- Date creation/browsing
- Chat functionality

---

## Monitoring & Observability (Phase 6)

- **Frontend**: Vercel Analytics
- **Backend**: Supabase Logs (Postgres, Auth, Storage, Realtime)
- **Errors**: Sentry (to be added)
- **Performance**: Vercel Speed Insights

---

## Future Enhancements

- Payment integration (Stripe)
- Email notifications (Supabase Edge Functions + Resend)
- Push notifications (FCM)
- Advanced search/filtering
- User recommendations (ML-based)
- Video chat (Twilio/Agora)
- Multi-language support (i18n)

---

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [DATABASE.md](./DATABASE.md) - Schema reference
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [PHASE_REPORTS.md](./PHASE_REPORTS.md) - Progress tracking
