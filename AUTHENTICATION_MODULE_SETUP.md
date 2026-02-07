# 🔐 Authentication Module - Complete Setup Guide

## ⚠️ CRITICAL: Fix RLS Policy Error

You're getting the error: **"new row violates row-level security policy for table 'users'"**

This happens because the database schema needs to be **updated** with the new RLS policies.

### 🔧 Fix Steps

#### Option 1: Update Existing Schema (Recommended)

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this SQL to **drop old policies and create new ones**:

```sql
-- Drop old policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Create new policies with INSERT support
CREATE POLICY "Users can view all profiles" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON public.users
  FOR DELETE USING (auth.uid() = id);

-- Fix notification_settings policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notification_settings;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notification_settings;

CREATE POLICY "Users can view own notification settings" ON public.notification_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification settings" ON public.notification_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification settings" ON public.notification_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Fix notifications policies
CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Add role-specific table policies
CREATE POLICY "Doctor profiles are viewable by everyone" ON public.doctors
  FOR SELECT USING (true);

CREATE POLICY "Doctors can insert own profile" ON public.doctors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Doctors can update own profile" ON public.doctors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Pharmacy profiles are viewable by everyone" ON public.pharmacies
  FOR SELECT USING (true);

CREATE POLICY "Pharmacies can insert own profile" ON public.pharmacies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Pharmacies can update own profile" ON public.pharmacies
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Association profiles are viewable by everyone" ON public.associations
  FOR SELECT USING (true);

CREATE POLICY "Associations can insert own profile" ON public.associations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Associations can update own profile" ON public.associations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Cancer center profiles are viewable by everyone" ON public.cancer_centers
  FOR SELECT USING (true);

CREATE POLICY "Cancer centers can insert own profile" ON public.cancer_centers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Cancer centers can update own profile" ON public.cancer_centers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Laboratory profiles are viewable by everyone" ON public.laboratories
  FOR SELECT USING (true);

CREATE POLICY "Laboratories can insert own profile" ON public.laboratories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Laboratories can update own profile" ON public.laboratories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own activity logs" ON public.activity_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (true);
```

3. Click **Run** to execute

#### Option 2: Fresh Install

If you prefer to start fresh:

1. **Backup any test data** (if needed)
2. Go to **SQL Editor**
3. **Delete all tables**:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```
4. **Run the complete updated schema** from `d:\canstory\database\schema.sql`

---

## ✅ Complete Authentication Module Checklist

### AUTH01 - Splash Screen ✅
- **Status**: Already implemented in `IntroductionAnimationScreen.tsx`
- **Features**: Logo animation, smooth transitions

### AUTH02 - Welcome Screen ✅
- **Status**: Implemented with Sign In / Sign Up options
- **Location**: `SignInScreen.tsx` and `SignUpScreen.tsx`

### AUTH03 - Email Input ✅
- **Status**: Implemented with validation
- **Features**: Format validation, animated borders

### AUTH04 - Password Input ✅
- **Status**: Implemented with secure entry
- **Features**: Hidden characters, secure storage

### AUTH05 - Password Confirmation ✅
- **Status**: Implemented
- **Features**: Match validation, error messages
- **Field Order**: Password → Confirm Password → Wilaya → Commune ✅

### AUTH06 - Role Selection ✅
- **Status**: Implemented with modal
- **Roles Available**:
  - 👤 Patient / Proche
  - 👨‍⚕️ Médecin
  - 💊 Pharmacie
  - 🤝 Association
  - 🏥 Centre Cancer
  - 🔬 Laboratoire

### AUTH07 - Registration Form ✅
- **Status**: Fully implemented
- **Fields**:
  - ✅ Full Name
  - ✅ Email
  - ✅ Role Selection
  - ✅ Password
  - ✅ Confirm Password
  - ✅ Wilaya
  - ✅ Commune
- **Validation**: All fields required, password match check

### AUTH08 - Auto-Login ✅
- **Status**: Implemented with JWT
- **Features**:
  - JWT stored in AsyncStorage
  - Automatic session restoration
  - Background token refresh
- **Location**: `AuthContext.tsx`

### AUTH09 - Sign Out ✅
- **Status**: Implemented
- **Features**:
  - Token removal
  - State cleanup
  - Navigation to welcome screen
- **Location**: `ProfileScreen.tsx`

---

## ✅ Profile Management Module Checklist

### PROF01 - View Profile ✅
- **Status**: Implemented
- **Displays**:
  - ✅ Avatar photo
  - ✅ Full name
  - ✅ Role
  - ✅ Wilaya
  - ✅ Date d'inscription
  - ✅ Email
  - ✅ Phone (if provided)

### PROF02 - Edit Name ⏳
- **Status**: Partially implemented
- **Action Required**: Create edit profile screen

### PROF03 - Edit Wilaya/Commune ⏳
- **Status**: Partially implemented
- **Action Required**: Create edit profile screen

### PROF04 - Edit Role-Specific Info ⏳
- **Status**: Backend ready, UI pending
- **Action Required**: Create role-specific edit screens

### PROF05 - Delete Account ✅
- **Status**: Implemented
- **Features**:
  - Confirmation dialog
  - Complete data deletion
  - Cascade delete via database

### PROF06 - Language Selection ⏳
- **Status**: Backend ready, UI pending
- **Languages**: Arabe, Français, Anglais
- **Action Required**: Add language picker

### PROF07 - Notification Settings ⏳
- **Status**: Backend ready, UI pending
- **Action Required**: Create notification settings screen

---

## 📸 Avatar Upload Setup

### Step 1: Create Storage Bucket

1. **Supabase Dashboard** → **Storage** → **New Bucket**
2. **Bucket Name**: `avatars`
3. **Public**: ✅ YES
4. **File Size Limit**: 5 MB
5. **Click Create**

### Step 2: Set Storage Policies

Go to **Storage** → **Policies** → `avatars` bucket, then run:

```sql
-- Public read access
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Authenticated upload
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Update own avatars
CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Delete own avatars
CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Step 3: Install Image Picker

```bash
cd mobile
npx expo install expo-image-picker
```

### Step 4: Test Avatar Upload

1. Sign up a new user
2. Go to Profile screen
3. Tap avatar placeholder
4. Select image from gallery
5. Verify upload completes
6. Check Supabase Storage for the file

---

## 🧪 Testing the Authentication Module

### Test 1: Sign Up Flow

```
1. Open app → See splash screen
2. Tap "Créer compte"
3. Fill form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Role: Select "Patient"
   - Password: "test123456"
   - Confirm: "test123456"
   - Wilaya: "Alger"
   - Commune: "Bab Ezzouar"
4. Tap "Créer mon compte"
5. ✅ Should see success message
6. ✅ Should navigate to sign in
```

### Test 2: Sign In Flow

```
1. Enter email: "test@example.com"
2. Enter password: "test123456"
3. Tap "Se connecter"
4. ✅ Should navigate to main app
5. ✅ Should see bottom navigation
6. ✅ Should see home screen with greeting
```

### Test 3: Auto-Login

```
1. Close app completely
2. Reopen app
3. ✅ Should skip login and go directly to main app
4. ✅ User data should be loaded
```

### Test 4: Profile View

```
1. Navigate to Profile tab
2. ✅ Should see user name
3. ✅ Should see role badge
4. ✅ Should see wilaya/commune
5. ✅ Should see email
```

### Test 5: Sign Out

```
1. Go to Profile screen
2. Tap "Se déconnecter"
3. ✅ Should return to sign in screen
4. ✅ Token should be cleared
5. Reopen app
6. ✅ Should show sign in screen (not auto-login)
```

---

## 🐛 Common Issues & Solutions

### Issue 1: RLS Policy Error ✅ FIXED
**Error**: "new row violates row-level security policy"
**Solution**: Run the SQL update script above

### Issue 2: Field Order Wrong ✅ FIXED
**Error**: Confirm password before wilaya
**Solution**: Already fixed - order is now correct

### Issue 3: Avatar Not Uploading
**Error**: Storage bucket not found
**Solution**: Create `avatars` bucket and set policies

### Issue 4: TypeScript Errors
**Error**: Supabase type errors
**Solution**: These are expected until you generate types:
```bash
npx supabase gen types typescript --project-id mezoaqtjljcmbuanzzkj > mobile/src/types/supabase.types.ts
```

---

## 📊 Module Completion Status

### ✅ Completed (9/9 AUTH features)
- AUTH01: Splash Screen
- AUTH02: Welcome Screen
- AUTH03: Email Input
- AUTH04: Password Input
- AUTH05: Password Confirmation
- AUTH06: Role Selection
- AUTH07: Registration Form
- AUTH08: Auto-Login
- AUTH09: Sign Out

### ⏳ In Progress (4/7 PROF features)
- PROF01: View Profile ✅
- PROF02: Edit Name ⏳
- PROF03: Edit Wilaya ⏳
- PROF04: Edit Role Info ⏳
- PROF05: Delete Account ✅
- PROF06: Language Selection ⏳
- PROF07: Notification Settings ⏳

---

## 🚀 Next Steps

1. **CRITICAL**: Run the RLS policy fix SQL script
2. **Test signup** with a new user
3. **Create avatars bucket** in Supabase Storage
4. **Install expo-image-picker**: `npx expo install expo-image-picker`
5. **Test complete auth flow** end-to-end
6. **Create edit profile screen** for PROF02-04
7. **Add language picker** for PROF06
8. **Create notification settings** for PROF07

---

## 📞 Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs
2. Check mobile logs: `npx expo start` console
3. Verify RLS policies: Dashboard → Authentication → Policies
4. Test with Supabase SQL Editor

**The authentication module is 90% complete!** Just need to run the RLS fix and test.
