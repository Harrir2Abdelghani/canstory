# CANSTORY RENDER DEPLOYMENT - COMPLETE STEP-BY-STEP GUIDE

## ⚠️ IMPORTANT: Read This First

Your Canstory project has:
- **Frontend**: Vite + React (currently on Netlify)
- **Backend**: Express.js server (NOT deployed - this is why sign-in fails)
- **Database**: Supabase (already working)

**The Problem**: Frontend can't reach backend because backend only runs locally on `http://localhost:3001`

**The Solution**: Deploy BOTH frontend and backend to Render in the same project

---

## STEP 1: PUSH TO GITHUB (5 minutes)

### 1.1 Open PowerShell and navigate to project:
```powershell
cd d:\canstory
```

### 1.2 Check git status:
```powershell
git status
```

### 1.3 Add all changes:
```powershell
git add .
```

### 1.4 Commit:
```powershell
git commit -m "Prepare for Render deployment: update CORS, vite config, and environment variables"
```

### 1.5 Create GitHub repository:
1. Go to https://github.com/new
2. Create repo named: `canstory`
3. Choose **Public**
4. Click **Create repository**

### 1.6 Add remote and push:
```powershell
git remote add origin https://github.com/YOUR_USERNAME/canstory.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## STEP 2: DEPLOY BACKEND TO RENDER (10 minutes)

### 2.1 Go to Render Dashboard:
1. Visit https://render.com
2. Sign up with GitHub (click "Sign up with GitHub")
3. Authorize Render to access your repositories
4. Go to https://dashboard.render.com

### 2.2 Create Backend Web Service:
1. Click **New +** button (top right)
2. Select **Web Service**
3. Select your `canstory` repository
4. Fill in these details:

| Field | Value |
|-------|-------|
| Name | `canstory-backend` |
| Environment | `Node` |
| Build Command | `npm install` |
| Start Command | `node web/server.js` |
| Plan | Free (or Starter $7/month for production) |

5. Click **Create Web Service**
6. **WAIT** for deployment to complete (5-10 minutes)

### 2.3 Add Environment Variables to Backend:
1. In Render dashboard, go to your `canstory-backend` service
2. Click **Environment** (left sidebar)
3. Click **Add Environment Variable** and add these:

```
VITE_SUPABASE_URL = https://mezoaqtjljcmbuanzzkj.supabase.co

VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lem9hcXRqbGpjbWJ1YW56emtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDY2NjUsImV4cCI6MjA4NTAyMjY2NX0.huABGlQnNynr5ZrksSLBcRHUv8TEVGsxECz22L6_R2M

SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lem9hcXRqbGpjbWJ1YW56emtqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTQ0NjY2NSwiZXhwIjoyMDg1MDIyNjY1fQ.QxVtvMjn-x-bbGGATURYttmLi8fPDccLqCAEBpEiUfs

API_PORT = 3001

NODE_ENV = production

FRONTEND_URL = https://canstory-frontend.onrender.com
```

4. Click **Save** after adding each variable
5. Service will auto-redeploy

### 2.4 Get Backend URL:
1. In Render dashboard, look at the top of your `canstory-backend` service page
2. You'll see a URL like: `https://canstory-backend-xxxx.onrender.com`
3. **COPY THIS URL** - you'll need it for the frontend

---

## STEP 3: DEPLOY FRONTEND TO RENDER (10 minutes)

### 3.1 Create Frontend Static Site:
1. In Render dashboard, click **New +**
2. Select **Static Site**
3. Select your `canstory` repository
4. Fill in:

| Field | Value |
|-------|-------|
| Name | `canstory-frontend` |
| Build Command | `cd web && npm install && npm run build` |
| Publish Directory | `web/dist` |

5. Click **Create Static Site**
6. **WAIT** for deployment (3-5 minutes)

### 3.2 Add Environment Variables to Frontend:
1. Go to your `canstory-frontend` service
2. Click **Environment**
3. Add this variable:

```
VITE_API_BASE_URL = https://canstory-backend-xxxx.onrender.com
```

Replace `canstory-backend-xxxx.onrender.com` with your actual backend URL from Step 2.4

4. Click **Save**
5. Service will auto-redeploy

### 3.3 Get Frontend URL:
1. Look at the top of your `canstory-frontend` service page
2. You'll see a URL like: `https://canstory-frontend-xxxx.onrender.com`
3. **COPY THIS URL** - this is your live application

---

## STEP 4: VERIFY EVERYTHING WORKS

### 4.1 Test Backend:
1. Go to: `https://canstory-backend-xxxx.onrender.com/api/admin/debug`
2. You should see JSON with database information
3. If you see an error, check the **Logs** tab in Render dashboard

### 4.2 Test Frontend:
1. Go to: `https://canstory-frontend-xxxx.onrender.com`
2. You should see the Canstory landing page
3. Try to sign in
4. If sign-in fails, check browser console (F12) for errors

### 4.3 Troubleshooting:
- **Backend not responding**: Check environment variables in Render
- **Sign-in fails**: Check that `VITE_API_BASE_URL` is set correctly in frontend
- **CORS errors**: Check that frontend URL is in backend's CORS list in `server.js`
- **Database errors**: Verify Supabase credentials in environment variables

---

## STEP 5: UPDATE YOUR LOCAL .env (Optional)

If you want to test locally with the deployed backend:

Edit `d:\canstory\web\.env`:
```
VITE_SUPABASE_URL=https://mezoaqtjljcmbuanzzkj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lem9hcXRqbGpjbWJ1YW56emtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDY2NjUsImV4cCI6MjA4NTAyMjY2NX0.huABGlQnNynr5ZrksSLBcRHUv8TEVGsxECz22L6_R2M
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lem9hcXRqbGpjbWJ1YW56emtqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTQ0NjY2NSwiZXhwIjoyMDg1MDIyNjY1fQ.QxVtvMjn-x-bbGGATURYttmLi8fPDccLqCAEBpEiUfs
API_PORT=3001
VITE_API_BASE_URL=https://canstory-backend-xxxx.onrender.com
```

---

## FINAL SUMMARY

| Component | URL | Status |
|-----------|-----|--------|
| Backend API | `https://canstory-backend-xxxx.onrender.com` | ✅ Deployed |
| Frontend | `https://canstory-frontend-xxxx.onrender.com` | ✅ Deployed |
| GitHub | `https://github.com/YOUR_USERNAME/canstory` | ✅ Pushed |
| Database | Supabase (mezoaqtjljcmbuanzzkj) | ✅ Already working |

---

## IMPORTANT NOTES

1. **Free Tier**: Services sleep after 15 minutes of inactivity. Upgrade to Starter ($7/month) for production.
2. **Custom Domain**: You can add a custom domain in Render settings (e.g., canstory.com)
3. **Auto-Deploy**: Every time you push to GitHub, Render automatically redeploys
4. **Logs**: Check Render dashboard logs if something breaks
5. **Mobile App**: Deploy separately to Expo when ready

---

## NEXT STEPS

1. ✅ Push to GitHub (Step 1)
2. ✅ Deploy backend (Step 2)
3. ✅ Deploy frontend (Step 3)
4. ✅ Verify everything (Step 4)
5. Update your DNS records if using a custom domain
6. Test all features (sign-in, admin dashboard, etc.)
7. Deploy mobile app to Expo

