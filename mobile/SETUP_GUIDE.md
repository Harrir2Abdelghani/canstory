# Canstory Mobile App - Complete Setup Guide

## 🎯 Overview

This is a comprehensive guide to set up the Canstory mobile application with Supabase backend, authentication, and real-time features.

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase account (https://supabase.com)
- iOS Simulator (Mac) or Android Emulator

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Set Up Supabase Database

#### A. Create Supabase Project
1. Go to https://supabase.com
2. Create a new project
3. Wait for the database to be provisioned

#### B. Run Database Schema
1. Open Supabase Dashboard → SQL Editor
2. Copy the entire content from `../database/schema.sql`
3. Paste and execute the SQL
4. Verify all tables are created successfully

#### C. Enable Realtime (Optional but Recommended)
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
```

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Get your Supabase credentials:
   - Go to Project Settings → API
   - Copy the Project URL
   - Copy the `anon` public key

3. Update `.env`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run the App

```bash
# Start Expo development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## 🏗️ Architecture Overview

### Technology Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **State Management**: React Context API
- **Authentication**: Supabase Auth with JWT
- **Styling**: React Native StyleSheet
- **Language**: TypeScript

### Project Structure

```
mobile/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── AnimatedBackground.tsx
│   │   ├── CanstoryLogo.tsx
│   │   └── MyPressable.tsx
│   ├── contexts/            # React Context providers
│   │   └── AuthContext.tsx  # Authentication state management
│   ├── lib/                 # External library configurations
│   │   └── supabase.ts      # Supabase client setup
│   ├── navigation/          # Navigation configuration
│   │   └── BottomTabNavigator.tsx
│   ├── screens/             # Screen components
│   │   ├── app/             # Authenticated app screens
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── DirectoryScreen.tsx
│   │   │   ├── CommunityScreen.tsx
│   │   │   ├── NotificationsScreen.tsx
│   │   │   └── ProfileScreen.tsx
│   │   ├── SignInScreen.tsx
│   │   ├── SignUpScreen.tsx
│   │   ├── ForgotPasswordScreen.tsx
│   │   └── ResetPasswordScreen.tsx
│   ├── services/            # API service layer
│   │   └── api.service.ts   # Supabase API calls
│   └── types/               # TypeScript type definitions
│       ├── database.types.ts
│       └── index.ts
├── App.tsx                  # Root component
└── package.json
```

## 🔐 Authentication Flow

### Sign Up Process

1. User fills registration form with:
   - Full name
   - Email
   - Password
   - Role (patient, doctor, pharmacy, association, cancer_center, laboratory)
   - Wilaya (province)
   - Commune (city)

2. System creates:
   - Supabase Auth user
   - User record in `users` table
   - User profile in `user_profiles` table
   - Notification settings in `notification_settings` table

3. User receives confirmation and can sign in

### Sign In Process

1. User enters email and password
2. Supabase validates credentials
3. JWT token stored in AsyncStorage
4. User data fetched from database
5. Navigate to main app with bottom navigation

### Auto-Login

- JWT token persists in AsyncStorage
- On app launch, checks for valid session
- Auto-navigates to main app if authenticated

## 📱 Main App Features

### Home Screen
- Personalized greeting
- Quick action cards (Articles, Nutrition, Centers, Accommodation)
- Recent articles feed
- Useful resources

### Directory Screen
- Search healthcare professionals
- Filter by role (doctors, pharmacies, associations, centers, laboratories)
- View profiles by wilaya
- Contact information

### Community Screen
- User-generated posts
- Anonymous posting option
- Like and comment functionality
- Cancer type filtering

### Notifications Screen
- Real-time notifications
- Categorized by type (article, appointment, message, system, community)
- Mark as read functionality
- Real-time updates via Supabase subscriptions

### Profile Screen
- View user information
- Edit profile details
- Notification settings
- Language preferences
- Sign out / Delete account

## 🎨 Design System

### Color Palette

- **Primary**: `#7b1fa2` (Purple)
- **Primary Dark**: `#6a1b9a`
- **Background**: `#f3e5f5` (Light Purple)
- **Text Primary**: `#333`
- **Text Secondary**: `#888`
- **Border**: `#f3e5f5`

### Typography

- **Title**: 28-32px, weight 800
- **Subtitle**: 16-18px, weight 500-700
- **Body**: 14-16px, weight 400-500
- **Caption**: 12-13px, weight 500

### Components

- **Cards**: Rounded corners (16px), subtle shadows
- **Buttons**: Rounded (12px), with ripple effect
- **Inputs**: Bordered (2px), animated focus states
- **Icons**: Emoji-based for visual appeal

## 🔄 Real-Time Features

### Notifications
```typescript
const subscription = ApiService.subscribeToNotifications(userId, (notification) => {
  // Handle new notification
  console.log('New notification:', notification);
});
```

### Messages
```typescript
const subscription = ApiService.subscribeToMessages(conversationId, (message) => {
  // Handle new message
  console.log('New message:', message);
});
```

## 🛠️ Development Tips

### TypeScript Errors

The TypeScript errors you see are expected until you:
1. Run the database schema in Supabase
2. Generate types from your Supabase schema
3. Update `src/types/database.types.ts` with generated types

To generate types:
```bash
npx supabase gen types typescript --project-id your-project-id > src/types/database.types.ts
```

### Testing Authentication

1. Create a test user via Sign Up screen
2. Check Supabase Dashboard → Authentication → Users
3. Verify user record in `users` table
4. Test sign in with created credentials

### Debugging

- Use React Native Debugger
- Check Expo logs: `npx expo start`
- Supabase logs: Dashboard → Logs
- Network requests: Enable network inspector in Expo

## 📊 Database Schema

### Core Tables

- **users**: Main user information
- **user_profiles**: Extended profile data
- **doctors, pharmacies, associations, cancer_centers, laboratories**: Role-specific data
- **articles**: Medical content
- **community_posts**: User discussions
- **notifications**: User notifications
- **messages**: Direct messaging

### Security

- Row Level Security (RLS) enabled on all tables
- Users can only modify their own data
- Public read access for published content
- JWT-based authentication

## 🚢 Deployment

### Build for Production

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

### Environment Variables

Ensure production environment variables are set:
- Production Supabase URL
- Production Supabase Anon Key

## 🐛 Troubleshooting

### Common Issues

**Issue**: "Supabase URL or Anon Key is missing"
- **Solution**: Check `.env` file exists and contains correct values

**Issue**: Authentication errors
- **Solution**: Verify Supabase project is active and RLS policies are correct

**Issue**: Real-time not working
- **Solution**: Enable realtime on required tables in Supabase

**Issue**: TypeScript errors
- **Solution**: Generate types from Supabase schema

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Native](https://reactnative.dev/)

## 🤝 Support

For issues or questions:
1. Check this documentation
2. Review database schema in `../database/README.md`
3. Check Supabase logs
4. Review React Native logs

## 📝 Next Steps

1. ✅ Database schema created
2. ✅ Authentication system implemented
3. ✅ Main app screens created
4. ✅ Bottom navigation configured
5. ⏳ Add more features (messaging, appointments, etc.)
6. ⏳ Implement offline support
7. ⏳ Add push notifications
8. ⏳ Implement analytics

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Maintainer**: Canstory Team
