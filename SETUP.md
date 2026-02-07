# Canstory Setup Guide

This guide provides step-by-step instructions for setting up and running both the web application and mobile app components of the Canstory project.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Web Application Setup](#web-application-setup)
- [Mobile Application Setup](#mobile-application-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Applications](#running-the-applications)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting, ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v16 or later)
- [npm](https://www.npmjs.com/) (v8 or later)
- [Git](https://git-scm.com/)
- [Expo CLI](https://docs.expo.dev/workflow/expo-cli/) (for mobile development)
- A code editor (VSCode recommended)
- A Supabase account (for backend services)

## Web Application Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd canstory
```

### 2. Install Web Dependencies

```bash
cd web
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file and update it with your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Edit the `.env.local` file and update the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_AUTH_REDIRECT=http://localhost:3000/auth/callback
```

### 4. Run the Web Application

```bash
npm run dev
```

The web application should now be running at [http://localhost:3000](http://localhost:3000).

## Mobile Application Setup

### 1. Install Mobile Dependencies

```bash
cd mobile
npm install
```

### 2. Set Up Environment Configuration

Create a `.env` file in the `mobile` directory:

```bash
touch .env
```

Add your Supabase configuration:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Start the Expo Development Server

```bash
npx expo start
```

### 4. Run on a Device or Simulator

- For iOS: Press `i` in the terminal or scan the QR code with your iPhone camera
- For Android: Press `a` in the terminal or scan the QR code with the Expo Go app

## Environment Configuration

### Supabase Setup

1. Create a new project on [Supabase](https://supabase.com/)
2. Get your project URL and anon key from the API settings
3. Configure authentication providers as needed
4. Update your environment variables with the Supabase credentials

## Running the Applications

### Web Application

The web application consists of:

1. **Public Landing Website**: Accessible at the root URL (`http://localhost:3000/`)
   - Provides information about cancer awareness and resources
   - Contains educational content and resources

2. **Admin Dashboard**: Accessible at `/admin/auth/login`
   - Credentials:
     - Email: `admin@canstory.com`
     - Password: `canstory2026`
   - Allows management of content displayed in the mobile app

### Mobile Application

The Canstory mobile app includes several key modules:

1. **Home**: Main dashboard with featured content
2. **Resources**: Educational resources about cancer
3. **Pharmacies**: Find nearby pharmacies with search and filtering
4. **Clinics**: Find cancer care providers and specialists
5. **Blog**: Articles and informational content
6. **Information**: General cancer information and statistics
7. **Profile**: User profile and preferences

## Troubleshooting

### Web Application Issues

1. **Module not found errors**:
   - Ensure all dependencies are installed: `npm install`
   - Check that import paths are correct and match the project structure

2. **Environment variable issues**:
   - Verify your `.env.local` file exists and contains all required variables
   - Restart the development server after updating environment variables

3. **API connection errors**:
   - Check that your Supabase URL and anon key are correct
   - Ensure your Supabase project is active and accessible

### Mobile Application Issues

1. **Expo build errors**:
   - Run `npx expo doctor` to diagnose and fix common issues
   - Delete the `node_modules` folder and run `npm install` again

2. **Device connection issues**:
   - Ensure your mobile device is on the same network as your development machine
   - Try using a tunnel connection: `npx expo start --tunnel`

3. **Module resolution errors**:
   - Check that all required packages are listed in `package.json`
   - Run `npm install` to ensure all dependencies are properly installed

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Expo Documentation](https://docs.expo.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [React Navigation Documentation](https://reactnavigation.org/docs/getting-started)
