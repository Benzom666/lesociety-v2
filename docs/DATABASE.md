# LeSociety v2 - Database Schema

## Overview

LeSociety v2 uses **Supabase Postgres** as the primary database with **Row Level Security (RLS)** enabled on all tables.

## Authentication

- Identity management: **Supabase Auth** (`auth.users`)
- All user data stored in `public.profiles` table
- Profile `id` references `auth.users(id)` via foreign key

---

## Schema Tables

### 1. `profiles`

User profiles linked to Supabase Auth.

**Key Fields**:
- `id` (UUID, PK, FK to `auth.users`)
- `email` (TEXT, unique)
- `username` (TEXT, unique)
- `role` (`'user'` | `'admin'`)
- `status` (`'pending'` | `'verified'` | `'blocked'` | `'deleted'`)
- `gender` (`'male'` | `'female'`)
- `step_completed` (INT) - onboarding progress
- Profile details: `age`, `tagline`, `description`
- Location: `country`, `province`, `city`, `latitude`, `longitude`
- Preferences: `looking_for`, `relationship_status`, `height`, etc.

**RLS**:
- Users can view/update their own profile
- Admins can view/update all profiles
- Public can view verified profiles (excluding blocked users)

---

### 2. `profile_photos`

User profile images.

**Key Fields**:
- `id` (UUID, PK)
- `user_id` (UUID, FK to `profiles`)
- `storage_path` (TEXT) - path in Supabase Storage
- `is_primary` (BOOLEAN)
- `is_verified` (BOOLEAN)
- `sort_order` (INT)

**RLS**:
- Users can manage their own photos
- Public can view photos of verified profiles

---

### 3. `verification_documents`

User identity verification (selfie + government ID).

**Key Fields**:
- `id` (UUID, PK)
- `user_id` (UUID, unique FK to `profiles`)
- `selfie_path` (TEXT)
- `document_path` (TEXT)
- `documents_verified` (BOOLEAN)
- `verified_by` (UUID, FK to `profiles`) - admin who verified
- `rejection_reason` (TEXT)

**RLS**:
- Users can view/upload their own documents
- Admins can view/update all verification documents

---

### 4. `date_posts`

Date offerings created by female users.

**Key Fields**:
- `id` (UUID, PK)
- `creator_id` (UUID, FK to `profiles`)
- `tier` (`'standard'` | `'middle'` | `'executive'`)
- `category` (TEXT) - e.g., "Dinner", "Event"
- `aspiration` (TEXT) - e.g., "Fine Dining"
- `details` (TEXT)
- `price` (NUMERIC)
- Location: `country`, `province`, `city`, `location_name`
- Date/time: `date_day`, `date_time`
- `is_published` (BOOLEAN)
- `status` (`'pending'` | `'verified'` | `'blocked'` | etc.)

**RLS**:
- Creators can manage their own date posts
- Public can view published & verified posts (excluding blocked creators)
- Admins can view/update all posts

---

### 5. `chatrooms`

Chat conversations between two users, initiated via date requests.

**Key Fields**:
- `id` (UUID, PK)
- `date_post_id` (UUID, FK to `date_posts`)
- `requester_id` (UUID, FK to `profiles`) - male user
- `receiver_id` (UUID, FK to `profiles`) - female user
- `status` (`'pending'` | `'accepted'` | `'blocked'`)
- `blocked_by` (UUID, FK to `profiles`)
- `is_super_interested` (BOOLEAN)

**Constraints**:
- `UNIQUE(date_post_id, requester_id, receiver_id)` - prevent duplicates

**RLS**:
- Participants can view/update their chatrooms
- Receiver can accept pending requests
- Access denied if either user blocked the other

---

### 6. `messages`

Chat messages within chatrooms.

**Key Fields**:
- `id` (UUID, PK)
- `chatroom_id` (UUID, FK to `chatrooms`)
- `sender_id` (UUID, FK to `profiles`)
- `content` (TEXT)
- `read_at` (TIMESTAMPTZ, nullable)
- `deleted_at` (TIMESTAMPTZ, nullable) - soft delete
- `created_at` (TIMESTAMPTZ)

**Indexes**:
- `(chatroom_id, created_at DESC)` - for message history
- `(chatroom_id, read_at)` WHERE `read_at IS NULL` - for unread messages

**RLS**:
- Participants can view/send messages in accepted chatrooms
- Sender must match `auth.uid()`
- Access denied if chatroom is not accepted or users are blocked

---

### 7. `blocks`

User blocking system (bidirectional).

**Key Fields**:
- `id` (UUID, PK)
- `blocker_id` (UUID, FK to `profiles`)
- `blocked_id` (UUID, FK to `profiles`)
- `reason` (TEXT, optional)
- `created_at` (TIMESTAMPTZ)

**Constraints**:
- `UNIQUE(blocker_id, blocked_id)` - prevent duplicate blocks
- `CHECK(blocker_id != blocked_id)` - prevent self-blocking

**RLS**:
- Users can view/manage their own blocks
- Admins can view all blocks

**Block Enforcement**:
- Enforced via RLS policies on `profiles`, `date_posts`, `chatrooms`, `messages`
- Helper function: `public.is_blocked(user_a UUID, user_b UUID)`

---

### 8. `notifications`

In-app notifications for users.

**Key Fields**:
- `id` (UUID, PK)
- `user_id` (UUID, FK to `profiles`)
- `title` (TEXT)
- `message` (TEXT)
- `type` (`'system'` | `'chat'` | `'date'` | `'verification'` | `'admin'`)
- `status` (`'unread'` | `'read'`)
- `related_id` (UUID, nullable) - reference to related entity
- `created_at` (TIMESTAMPTZ)

**RLS**:
- Users can view/update their own notifications
- Admins can create and view all notifications

---

## Indexes

All tables have appropriate indexes for common queries:
- Foreign key columns
- Status/role columns
- Timestamp columns (for sorting)
- Composite indexes for join queries

---

## Row Level Security (RLS)

**All tables have RLS enabled.**

### Security Principles:
1. **User Isolation**: Users can only access their own data
2. **Role-Based Access**: Admins have read/write access to all tables
3. **Block Enforcement**: Blocked users cannot interact
4. **Public Browsing**: Verified profiles/dates are publicly visible (excluding blocks)
5. **Chat Privacy**: Only participants can access chatroom messages

### Helper Functions:
- `is_blocked(user_a UUID, user_b UUID)`: Returns TRUE if a block exists in either direction

---

## Storage

Supabase Storage buckets (all private):
- `profile-images`: User profile photos
- `date-images`: Date post images
- `verification-docs`: Identity verification documents (selfie + ID)

**Access**:
- Private buckets require signed URLs for access
- RLS policies enforce ownership and admin access

---

## Migrations

Located in `/supabase/migrations/`:
1. `20260103000001_initial_schema.sql` - Tables, indexes, triggers
2. `20260103000002_rls_policies.sql` - RLS policies
3. `20260103000003_storage_setup.sql` - Storage buckets and policies

**Run migrations**:
```bash
# Via Supabase CLI
supabase db push

# Or manually in Supabase Dashboard SQL Editor
# Run each file in order
```

---

## Seed Data

Create test data using the seed script:
```bash
cd scripts/seed
pnpm install
pnpm seed
```

Creates:
- 1 admin: `admin@lesociety.com / admin123456`
- 1 male user: `john@example.com / password123`
- 1 female user: `sarah@example.com / password123`
- 1 date post, 1 chatroom, 2 messages

---

## Type Generation

Generate TypeScript types from the schema:
```bash
npx supabase gen types typescript --local > packages/supabase/src/types.ts
```

---

## Next Steps

- **Phase 3**: Wire frontend to Supabase (auth, profiles, date posts)
- **Phase 4**: Implement real-time chat using Supabase Realtime
- **Phase 5**: Build admin moderation interface
- **Phase 6**: Deploy to Vercel + Supabase production

