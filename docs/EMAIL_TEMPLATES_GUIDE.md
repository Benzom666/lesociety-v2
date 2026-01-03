# 📧 EMAIL TEMPLATES FOR SUPABASE

**Last Updated:** January 5, 2026  
**Source:** Extracted from original Le Society templates

---

## 🎯 OVERVIEW

Supabase Auth provides built-in email templates for:
- **Confirm Signup** — Email verification after registration
- **Reset Password** — Password reset link
- **Magic Link** — Passwordless login (optional)
- **Change Email** — Email change confirmation

---

## 📋 SUPABASE VARIABLES

Use these placeholders in your templates:

| Variable | Description |
|----------|-------------|
| `{{ .ConfirmationURL }}` | Full confirmation link |
| `{{ .Token }}` | Verification token |
| `{{ .TokenHash }}` | Hashed token |
| `{{ .SiteURL }}` | Your site URL |
| `{{ .Email }}` | User's email address |

---

## 🎨 TEMPLATES

### 1. CONFIRM SIGNUP (Email Verification)

**Use Case:** Sent after user signs up

**Supabase Dashboard:** Authentication → Email Templates → Confirm signup

**HTML Template:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - Le Society</title>
  <style>
    body { margin: 0; background-color: #fff; font-family: 'Roboto', Arial, sans-serif; }
    .wrapper { width: 100%; background-color: #fff; padding-bottom: 60px; }
    .main { background-color: #000; margin: 0 auto; width: 100%; max-width: 650px; color: #fff; }
    .button { font-size: 14px; font-weight: 700; width: 179px; height: 44px; background: #F24462; color: #fff; border-radius: 15px; border: none; margin: 1rem auto; text-decoration: none; display: inline-block; padding: 15px 30px; }
  </style>
</head>
<body>
  <center class="wrapper">
    <table class="main" width="100%">
      <tr>
        <td style="text-align: center; padding: 2rem 0;">
          <h1 style="font-size: 45px; font-weight: bold; text-align: center; margin: 20px 0;">Verify Your Email</h1>
          <p style="font-size: 14px; font-weight: 400; text-align: center; margin: 0 auto; max-width: 380px;">
            Before we get started, please take a second to make sure we've got your email address right.
          </p>
          <div style="text-align: center; margin-top: 2rem;">
            <a href="{{ .ConfirmationURL }}" class="button">Verify Your Email</a>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding: 7rem 0 1rem 0;">
          <p style="margin: 0 auto; text-align: center; font-size: 11px; font-weight: 400; color: #BABABA;">
            If you didn't create a Le Society account, just delete this email and everything will go back to normal.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding: 50px 10px; text-align: center;">
          <p style="font-size: 11px; color: #FFFFFF;">
            © 2026 Le Society | All Rights Reserved
          </p>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>
```

---

### 2. RESET PASSWORD

**Use Case:** Sent when user requests password reset

**Supabase Dashboard:** Authentication → Email Templates → Reset password

**HTML Template:**
```html
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password - Le Society</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f7f7f7; font-family: 'Roboto', Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 40px; }
    .button { background: #F24462; color: #fff; padding: 15px 40px; text-decoration: none; border-radius: 15px; display: inline-block; font-weight: 700; margin: 20px 0; }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr style="background: #f7f7f7; padding: 30px 0;">
      <td>
        <table class="container" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="text-align: center;">
              <h2 style="font-size: 30px; margin-bottom: 20px; font-weight: 600; color: #333;">Hello!</h2>
            </td>
          </tr>
          <tr>
            <td style="text-align: center;">
              <h3 style="font-size: 18px; margin-bottom: 15px; font-weight: 500; color: #333;">Reset Your Password</h3>
            </td>
          </tr>
          <tr>
            <td style="color: #6c6c6c; font-size: 14px; font-weight: 400; line-height: 22px; text-align: center;">
              <p>We received a request to reset your password for your Le Society account.</p>
              <p>Click the button below to reset your password:</p>
            </td>
          </tr>
          <tr>
            <td style="text-align: center;">
              <a href="{{ .ConfirmationURL }}" class="button">Reset Password</a>
            </td>
          </tr>
          <tr>
            <td style="color: #6c6c6c; font-size: 14px; font-weight: 400; line-height: 22px; text-align: center; padding-top: 20px;">
              <p>If you didn't request this, you can safely ignore this email.</p>
              <p style="font-size: 12px; color: #999;">This link will expire in 24 hours.</p>
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding-top: 40px; font-size: 12px; color: #999;">
              <p>© 2026 Le Society | All Rights Reserved</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## ⚙️ CONFIGURATION STEPS

### Step 1: Supabase Dashboard Setup

1. Go to **Supabase Dashboard** → Your Project
2. Click **Authentication** → **Email Templates**
3. Select template to edit (Confirm signup / Reset password)
4. Copy HTML from above and paste
5. Click **Save**

---

### Step 2: Configure Site URL

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL:**
   ```
   Production: https://lesociety.vercel.app
   Dev: http://localhost:3000
   ```
3. Add **Redirect URLs:**
   ```
   https://lesociety.vercel.app/**
   http://localhost:3000/**
   ```

---

### Step 3: Email Confirmation Settings

**For Development:**
1. Go to **Authentication** → **Settings**
2. Toggle OFF **"Enable email confirmations"**
3. Users can login immediately after signup

**For Production:**
1. Toggle ON **"Enable email confirmations"**
2. Users must click email link before logging in

---

### Step 4: SMTP Configuration (Optional)

**Why:** Use custom domain for sender email

**Steps:**
1. Go to **Project Settings** → **Auth**
2. Scroll to **SMTP Settings**
3. Configure SendGrid:
   ```
   Host: smtp.sendgrid.net
   Port: 587
   User: apikey
   Password: <YOUR_SENDGRID_API_KEY>
   Sender: noreply@yourdomain.com
   ```

**Get SendGrid API Key:**
1. https://app.sendgrid.com/settings/api_keys
2. Create API Key → Full Access
3. Copy and paste in Supabase

**Without SMTP:**
- Supabase uses default sender: `noreply@mail.app.supabase.io`
- Works fine for testing/small scale

---

## 🧪 TESTING

### Test Signup Email

```bash
# 1. Ensure email confirmation is ON in Supabase
# 2. Start app
cd apps/web && pnpm dev

# 3. Go to /auth/registration
# 4. Sign up with real email
# 5. Check inbox for verification email
```

### Test Reset Password Email

```bash
# 1. Go to /auth/forgot-password
# 2. Enter email
# 3. Check inbox
# 4. Click link
# 5. Should redirect to /auth/reset-password
```

---

## 🎨 CUSTOMIZATION

### Add Logo

```html
<!-- Add to template -->
<tr>
  <td style="text-align: center; padding: 20px;">
    <img src="https://yourdomain.com/logo.png" alt="Le Society" width="150" />
  </td>
</tr>
```

### Add Social Links

```html
<tr>
  <td style="text-align: center; padding: 20px;">
    <a href="https://twitter.com/lesociety"><img src="..." alt="Twitter" /></a>
    <a href="https://instagram.com/lesociety"><img src="..." alt="Instagram" /></a>
  </td>
</tr>
```

### Change Colors

```css
/* Primary color (buttons, links) */
background: #F24462; /* Pink/Red */

/* Background */
background-color: #000; /* Black */

/* Text */
color: #fff; /* White */
```

---

## 📚 RESOURCES

- **Supabase Auth Emails:** https://supabase.com/docs/guides/auth/auth-email-templates
- **SendGrid SMTP:** https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api
- **Email Testing:** https://mailtrap.io/ (for dev)

---

## ✅ CHECKLIST

- [ ] Copy templates to Supabase Dashboard
- [ ] Configure Site URL
- [ ] Set email confirmation ON/OFF (based on environment)
- [ ] Test signup email
- [ ] Test reset password email
- [ ] (Optional) Configure SMTP with SendGrid
- [ ] Customize with logo/branding

---

**Status:** ✅ READY TO USE  
**Setup Time:** 10-15 minutes  
**Maintenance:** Update templates as needed

