# Canstory Complete Deployment Guide

## Project Overview
- **Frontend**: Vite + React (TanStack Router, React Query, Tailwind CSS)
- **Backend**: Express.js server (server.js) with Supabase integration
- **Database**: Supabase PostgreSQL (already configured)
- **Current Status**: Frontend on Netlify, Backend not deployed (causing sign-in failures)

---

## PHASE 1: GITHUB SETUP

### Step 1.1: Create GitHub Repository
1. Go to https://github.com/new
2. Create repository: `canstory`
3. Description: "E-health platform focused on cancer awareness and medical information"
4. Choose **Public** (for easier deployment)
5. Click **Create repository**

### Step 1.2: Push Code to GitHub
Run these commands in PowerShell:

```powershell
cd d:\canstory
git add .
git commit -m "Initial commit: Canstory project with frontend, backend, and mobile"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/canstory.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## PHASE 2: RENDER DEPLOYMENT SETUP

### Step 2.1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (recommended for easier deployment)
3. Authorize Render to access your GitHub account

### Step 2.2: Deploy Backend Service (Express Server)

**Create Backend Service:**
1. Go to https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Select your `canstory` repository
4. Configure:
   - **Name**: `canstory-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node web/server.js`
   - **Plan**: Free (or Starter if you want better uptime)

**Add Environment Variables:**
Click **Environment** and add these variables:

```
VITE_SUPABASE_URL=https://mezoaqtjljcmbuanzzkj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lem9hcXRqbGpjbWJ1YW56emtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDY2NjUsImV4cCI6MjA4NTAyMjY2NX0.huABGlQnNynr5ZrksSLBcRHUv8TEVGsxECz22L6_R2M
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lem9hcXRqbGpjbWJ1YW56emtqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTQ0NjY2NSwiZXhwIjoyMDg1MDIyNjY1fQ.QxVtvMjn-x-bbGGATURYttmLi8fPDccLqCAEBpEiUfs
API_PORT=3001
NODE_ENV=production
```

5. Click **Create Web Service**
6. Wait for deployment (5-10 minutes)
7. Copy the URL from the dashboard (e.g., `https://canstory-backend.onrender.com`)

### Step 2.3: Deploy Frontend Service (Static Site)

**Create Frontend Service:**
1. Click **New +** → **Static Site**
2. Select your `canstory` repository
3. Configure:
   - **Name**: `canstory-frontend`
   - **Build Command**: `cd web && npm install && npm run build`
   - **Publish Directory**: `web/dist`

4. Click **Create Static Site**
5. Wait for deployment (3-5 minutes)
6. Copy the frontend URL (e.g., `https://canstory-frontend.onrender.com`)

---

## PHASE 3: UPDATE FRONTEND CONFIGURATION

### Step 3.1: Update Vite Config
Edit `d:\canstory\web\vite.config.ts`:

```typescript
import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
```

### Step 3.2: Update .env.example
Edit `d:\canstory\web\.env.example`:

```
VITE_SUPABASE_URL=https://mezoaqtjljcmbuanzzkj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lem9hcXRqbGpjbWJ1YW56emtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDY2NjUsImV4cCI6MjA4NTAyMjY2NX0.huABGlQnNynr5ZrksSLBcRHUv8TEVGsxECz22L6_R2M
VITE_API_BASE_URL=https://canstory-backend.onrender.com
API_PORT=3001
```

### Step 3.3: Update Server CORS Configuration
Edit `d:\canstory\web\server.js` (line 16-19):

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://canstory-frontend.onrender.com',
    'https://canstory.netlify.app'
  ],
  credentials: true,
}))
```

---

## PHASE 4: PUSH UPDATES TO GITHUB

```powershell
cd d:\canstory
git add .
git commit -m "Update deployment configuration for Render"
git push origin main
```

Render will automatically redeploy when you push to GitHub.

---

## PHASE 5: VERIFY DEPLOYMENT

### Check Backend
1. Go to `https://canstory-backend.onrender.com/api/admin/debug`
2. You should see a JSON response with database info

### Check Frontend
1. Go to `https://canstory-frontend.onrender.com`
2. Try to sign in
3. Check browser console for any errors

### Troubleshooting
- If sign-in fails, check backend logs in Render dashboard
- If API calls fail, verify CORS configuration in server.js
- If database errors occur, verify Supabase credentials in environment variables

---

## PHASE 6: OPTIONAL - CUSTOM DOMAIN

1. In Render dashboard, go to your service settings
2. Click **Settings** → **Custom Domain**
3. Add your domain (e.g., `canstory.com`)
4. Follow DNS configuration instructions

---

## SUMMARY OF URLS

| Service | URL |
|---------|-----|
| Backend API | https://canstory-backend.onrender.com |
| Frontend | https://canstory-frontend.onrender.com |
| GitHub | https://github.com/YOUR_USERNAME/canstory |

---

## IMPORTANT NOTES

1. **Free Tier Limitations**: Render free tier services spin down after 15 minutes of inactivity. Upgrade to Starter ($7/month) for production use.
2. **Environment Variables**: Never commit `.env` files. Use Render's environment variable management.
3. **Database**: Supabase is already configured and running. No additional setup needed.
4. **Mobile App**: Deploy separately to Expo when ready.

