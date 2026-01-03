# 🔐 AUTH SETUP GUIDE — SUPABASE AUTHENTICATION

**Last Updated:** January 5, 2026  
**Status:** Production Ready

---

## 🎯 OVERVIEW

LeSociety v2 uses **Supabase Auth** for all authentication flows:
- Email/Password signup and login
- Forgot/Reset password
- Email verification (optional in dev)
- Session management

---

## 🚀 QUICK START (Development)

### Step 1: Disable Email Confirmation (Dev Only)

**In Supabase Dashboard:**
1. Go to **Authentication** → **Settings**
2. Find **"Enable email confirmations"**
3. **Toggle OFF** ⚠️ (development only)
4. Click **Save**

**Why:** Allows signup without email verification for local testing

---

### Step 2: Create Test Users

```bash
cd /run/media/benzom/1A2C58B02C5888A1/PROJECTS/lesociety-v2

# If test users already exist, reset first:
tsx scripts/dev-reset-auth.ts

# Create fresh test users:
tsx scripts/create-test-users.ts
```

**Test Credentials Created:**
```
Admin User:
  Email: admin@lesociety.com
  Password: Admin123!@#
  Role: admin

Male User:
  Email: john@example.com
  Password: John123!@#
  Role: user

Female User:
  Email: jane@example.com
  Password: Jane123!@#
  Role: user
```

---

### Step 3: Test Login

```bash
# Start dev server
cd apps/web
pnpm dev

# Visit http://localhost:3000/auth/login
# Use credentials above
```

---

## 🔧 AUTH FLOW FIXES

### Problem 1: "User already exists" on Signup

**Root Cause:** Test users from seed script remain in auth.users

**Solution:** Run reset script before testing signup

```bash
tsx scripts/dev-reset-auth.ts
```

---

### Problem 2: Login Fails with Valid Credentials

**Possible Causes:**

#### A. Email Not Confirmed
**Check:**
```sql
SELECT email, email_confirmed_at 
FROM auth.users 
WHERE email = 'admin@lesociety.com';
```

**Fix:** Use `create-test-users.ts` which sets `email_confirm: true`

#### B. Wrong Password
**Fix:** Use exact passwords from test users script

#### C. User Exists in Profiles but Not Auth
**Check:**
```sql
-- Check auth.users
SELECT id, email FROM auth.users WHERE email = 'admin@lesociety.com';

-- Check profiles
SELECT id, email FROM profiles WHERE email = 'admin@lesociety.com';
```

**Fix:** Ensure both exist with matching IDs

---

### Problem 3: Session Not Persisting

**Check:** Browser localStorage

```javascript
// In browser console
localStorage.getItem('sb-xzmrbcsjxaawmiewkmhw-auth-token')
```

**Should see:** Supabase auth token

**If missing:**
- Check Supabase client initialization
- Verify `persistSession: true` in config
- Check browser privacy settings (no incognito, cookies enabled)

---

## 📋 AUTH CHECKLIST

### For Login to Work:
- [x] User exists in `auth.users`
- [x] User has `email_confirmed_at` set (or confirmation disabled)
- [x] Password is correct
- [x] User exists in `profiles` table with matching `id`
- [x] Supabase client configured with correct URL + anon key

### For Signup to Work:
- [x] Email confirmation disabled (dev) OR SMTP configured (prod)
- [x] Email not already in `auth.users`
- [x] Profile trigger creates profile row automatically
- [x] RLS policies allow profile creation

---

## 🔐 PRODUCTION SETUP

### Step 1: Enable Email Confirmation

**In Supabase Dashboard:**
1. Go to **Authentication** → **Settings**
2. Find **"Enable email confirmations"**
3. **Toggle ON** ✅
4. Click **Save**

---

### Step 2: Configure SMTP (SendGrid)

**In Supabase Dashboard:**
1. Go to **Project Settings** → **Auth**
2. Scroll to **SMTP Settings**
3. Configure:

```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: <YOUR_SENDGRID_API_KEY>
Sender Email: noreply@yourdomain.com
Sender Name: Le Society
```

**Get SendGrid API Key:**
1. Go to https://app.sendgrid.com/settings/api_keys
2. Click **"Create API Key"**
3. Select **"Full Access"** (or **"Mail Send"** minimum)
4. Copy key and paste in Supabase

---

### Step 3: Configure Email Templates

**In Supabase Dashboard:**
1. Go to **Authentication** → **Email Templates**
2. Customize templates:
   - **Confirm Signup** — Welcome email with confirmation link
   - **Magic Link** — Passwordless login (if using)
   - **Reset Password** — Password reset link
   - **Change Email** — Email change confirmation

**Variables Available:**
- `{{ .ConfirmationURL }}` — Confirmation link
- `{{ .Token }}` — Verification token
- `{{ .SiteURL }}` — Your site URL

**Example Confirm Signup Template:**
```html
<h2>Welcome to Le Society!</h2>
<p>Click below to confirm your email:</p>
<a href="{{ .ConfirmationURL }}">Confirm Email</a>
```

---

### Step 4: Set Site URL

**In Supabase Dashboard:**
1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your production domain:
   ```
   https://lesociety.vercel.app
   ```
3. Add **Redirect URLs** (if needed):
   ```
   https://lesociety.vercel.app/**
   ```

---

## 🧪 TESTING AUTH FLOWS

### Test Signup
```bash
# 1. Start app
pnpm dev

# 2. Go to /auth/registration
# 3. Fill form with NEW email
# 4. Submit

# Expected (dev with confirmation disabled):
#   - Redirect to step 2 immediately
#   - User in auth.users
#   - Profile created

# Expected (prod with confirmation enabled):
#   - "Check your email" message
#   - User in auth.users with email_confirmed_at = NULL
#   - After clicking email link: email_confirmed_at set
```

### Test Login
```bash
# 1. Go to /auth/login
# 2. Enter email: admin@lesociety.com
# 3. Enter password: Admin123!@#
# 4. Submit

# Expected:
#   - Redirect to dashboard/profile
#   - localStorage has auth token
#   - Redux state has user data
#   - API calls include Authorization header
```

### Test Forgot Password
```bash
# 1. Go to /auth/forgot-password
# 2. Enter email
# 3. Submit

# Expected (dev):
#   - "Check your email" message
#   - Check Supabase logs for email (if SMTP configured)

# Expected (prod):
#   - Email sent to user
#   - Click link → /auth/reset-password?token=...
#   - Enter new password
#   - Redirect to login
```

---

## 🐛 DEBUGGING

### Enable Supabase Auth Logs

```javascript
// In apps/web/services/supabase-client-singleton.js
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    debug: true,  // Add this
    persistSession: true,
    autoRefreshToken: true
  }
});
```

### Check Auth State

```javascript
// In browser console
const { data, error } = await supabase.auth.getSession();
console.log('Session:', data.session);
console.log('User:', data.session?.user);
```

### Check Profile Sync

```sql
-- In Supabase SQL Editor
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.username,
  p.status,
  p.step_completed
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'admin@lesociety.com';
```

---

## 🔒 SECURITY NOTES

### Service Role Key
- ✅ Use ONLY in server-side API routes (`pages/api/**`)
- ✅ Use in scripts (dev-reset-auth.ts, create-test-users.ts)
- ❌ NEVER use in client-side code
- ❌ NEVER commit to git

### Anon Key
- ✅ Use in client-side Supabase client
- ✅ Safe to expose (RLS protects data)
- ✅ Can be in `NEXT_PUBLIC_*` env vars

### Password Requirements
- Minimum 6 characters (Supabase default)
- Recommend: 8+ characters, mix of upper/lower/numbers/symbols
- Update in Supabase: **Authentication** → **Policies**

---

## 📚 ADDITIONAL RESOURCES

- **Supabase Auth Docs:** https://supabase.com/docs/guides/auth
- **SendGrid SMTP:** https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api
- **Email Templates:** https://supabase.com/docs/guides/auth/auth-email-templates

---

**Status:** ✅ COMPLETE  
**Dev Setup:** < 5 minutes  
**Prod Setup:** < 15 minutes

