# Email OTP Verification & OAuth Setup Guide

## ✅ Features Implemented

1. **Email OTP Verification** - 3-step signup: Email → OTP → Details
2. **Google OAuth Sign-in** 
3. **Microsoft OAuth Sign-in**
4. **Standalone Auth Pages** - No navbar on login/signup pages
5. **Auto-logout on OTP expiry** - 10 minutes
6. **Resend OTP** - 60-second cooldown

---

## 🔧 Setup Instructions

### 1. **Email Configuration (Gmail)**

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled
3. Search for **"App passwords"** and generate a new one
4. Copy the **16-character app password**
5. Update `.env.local`:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

**For testing**: OTP will print in terminal if email not configured

---

### 2. **Google OAuth Setup**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable **Google+ API**
4. Create **OAuth 2.0 Client ID** (Web Application)
5. Add Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `http://localhost:3000/auth/callback/google`
6. Copy Client ID & Client Secret to `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
```

---

### 3. **Microsoft OAuth Setup**

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **App registrations** → **New registration**
3. Name: "Basho"
4. Redirect URI (Web): `http://localhost:3000/api/auth/callback/azure-ad`
5. Under **Certificates & secrets** → Create client secret
6. Copy Application ID & Secret to `.env.local`:

```env
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your_application_id
MICROSOFT_CLIENT_SECRET=your_client_secret
```

---

## 📱 Pages

- **Signup**: `/signup` or `/auth/signup`
- **Login**: `/login` or `/auth/login`
- **OTP Verification**: Automatic after email entry

---

## 🔐 Database Fields Added

```typescript
emailVerified: boolean          // Email verification status
emailVerificationOTP?: string   // 6-digit OTP
otpExpiry?: Date              // OTP expiration (10 minutes)
```

---

## 🌍 Signup Flow

```
1. Enter Email → Send OTP
   ↓
2. Receive OTP in email/terminal → Verify OTP
   ↓
3. Enter Name & Password → Create Account
   ↓
4. Login
```

---

## 🛠 Files Modified/Created

- ✅ `/src/lib/email.ts` - Email service
- ✅ `/src/app/api/auth/send-otp/route.ts` - Send OTP endpoint
- ✅ `/src/app/api/auth/verify-otp/route.ts` - Verify OTP endpoint
- ✅ `/src/app/(auth)/signup/page.tsx` - OTP signup form
- ✅ `/src/app/auth/signup/page.tsx` - Alternative signup
- ✅ `/src/app/login/page.tsx` - Login page
- ✅ `/src/components/OAuthSignin.tsx` - OAuth buttons
- ✅ `/src/models/User.ts` - Updated with OTP fields
- ✅ `/src/components/Navbar.tsx` - Hidden on auth pages

---

## ⚠️ Gmail Error Fix

If you get: **"Username and Password not accepted"**

→ You're using your regular Gmail password instead of App Password
→ Generate App Password from [Google Account Security](https://myaccount.google.com/apppasswords)

---

## 🚀 Next Steps

1. Install packages: `npm install` (if needed)
2. Update `.env.local` with your credentials
3. Run: `npm run dev`
4. Test at `http://localhost:3000/signup`

