# EMAIL TEMPLATES FOR SUPABASE AUTH

## 📋 SETUP INSTRUCTIONS

### Step 1: Access Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your Le Society project
3. Navigate to **Authentication** → **Email Templates**

### Step 2: Configure Site URL
1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL:**
   - Production: `https://lesociety.vercel.app`
   - Development: `http://localhost:3000`
3. Add **Redirect URLs:**
   - `https://lesociety.vercel.app/**`
   - `http://localhost:3000/**`

### Step 3: Paste Email Templates

#### Confirm Signup Template
1. Click **"Confirm signup"** in Email Templates
2. Copy contents of `confirm-signup.html`
3. Paste into Supabase template editor
4. Click **Save**

#### Reset Password Template
1. Click **"Reset password"** in Email Templates
2. Copy contents of `reset-password.html`
3. Paste into Supabase template editor
4. Click **Save**

### Step 4: Email Confirmation Settings

**For Development (Recommended):**
1. Go to **Authentication** → **Settings**
2. Toggle OFF **"Enable email confirmations"**
3. Users can login immediately after signup (no email verification required)

**For Production:**
1. Toggle ON **"Enable email confirmations"**
2. Users must click email link before logging in

### Step 5: SMTP Configuration (Optional - For Custom Domain)

**Using SendGrid SMTP:**
1. Go to **Project Settings** → **Auth** → **SMTP Settings**
2. Configure:
   ```
   Host: smtp.sendgrid.net
   Port: 587
   User: apikey
   Password: <YOUR_SENDGRID_API_KEY>
   Sender email: noreply@yourdomain.com
   Sender name: Le Society
   ```

**Get SendGrid API Key:**
1. Visit https://app.sendgrid.com/settings/api_keys
2. Click "Create API Key"
3. Select "Full Access"
4. Copy key and paste in Supabase SMTP settings

**Without SMTP:**
- Supabase uses default sender: `noreply@mail.app.supabase.io`
- Works fine for testing and small scale

## 🧪 TESTING

### Test Signup Email
```bash
# 1. Start app
cd apps/web && pnpm dev

# 2. Go to http://localhost:3000/auth/registration
# 3. Sign up with a real email address
# 4. Check inbox for verification email
# 5. Click link to verify
```

### Test Reset Password Email
```bash
# 1. Go to http://localhost:3000/auth/forgot-password
# 2. Enter email address
# 3. Check inbox
# 4. Click link
# 5. Should redirect to reset password page
```

## 📌 SUPABASE TEMPLATE VARIABLES

These variables are automatically replaced by Supabase:

| Variable | Description |
|----------|-------------|
| `{{ .ConfirmationURL }}` | Full confirmation/reset link |
| `{{ .Token }}` | Verification token |
| `{{ .TokenHash }}` | Hashed token |
| `{{ .SiteURL }}` | Your configured site URL |
| `{{ .Email }}` | User's email address |

## ✅ CHECKLIST

- [ ] Site URL configured in Supabase
- [ ] Redirect URLs added
- [ ] Confirm signup template pasted and saved
- [ ] Reset password template pasted and saved
- [ ] Email confirmation setting configured (ON for prod, OFF for dev)
- [ ] (Optional) SMTP configured for custom domain
- [ ] Tested signup email flow
- [ ] Tested reset password email flow

## 🚫 NO CODE CHANGES REQUIRED

All email sending is handled automatically by Supabase Auth SDK.
No SendGrid API or SMTP libraries needed in code.

## 📚 RESOURCES

- [Supabase Auth Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [SendGrid SMTP Integration](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api)

---

**Last Updated:** January 5, 2026  
**Maintenance:** Update templates as needed in Supabase Dashboard

