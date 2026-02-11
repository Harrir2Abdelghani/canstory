# CANSTORY DEPLOYMENT - QUICK START (Copy & Paste Commands)

## PHASE 1: PUSH TO GITHUB (Run these commands in PowerShell)

```powershell
cd d:\canstory
git add .
git commit -m "Prepare for Render deployment: update CORS, vite config, and environment variables"
git remote add origin https://github.com/YOUR_USERNAME/canstory.git
git branch -M main
git push -u origin main
```

**Before running above:**
1. Create repo at https://github.com/new (name: `canstory`)
2. Replace `YOUR_USERNAME` with your GitHub username

---

## PHASE 2: DEPLOY BACKEND (Follow these steps in Render Dashboard)

### Go to: https://dashboard.render.com

1. Click **New +** → **Web Service**
2. Select your `canstory` repository
3. Fill in:
   - Name: `canstory-backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `node web/server.js`
   - Plan: Free
4. Click **Create Web Service**
5. Wait 5-10 minutes for deployment
6. Go to **Environment** tab and add these variables:

```
VITE_SUPABASE_URL=https://mezoaqtjljcmbuanzzkj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lem9hcXRqbGpjbWJ1YW56emtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDY2NjUsImV4cCI6MjA4NTAyMjY2NX0.huABGlQnNynr5ZrksSLBcRHUv8TEVGsxECz22L6_R2M
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lem9hcXRqbGpjbWJ1YW56emtqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTQ0NjY2NSwiZXhwIjoyMDg1MDIyNjY1fQ.QxVtvMjn-x-bbGGATURYttmLi8fPDccLqCAEBpEiUfs
API_PORT=3001
NODE_ENV=production
FRONTEND_URL=https://canstory-frontend.onrender.com
```

7. **COPY** your backend URL (e.g., `https://canstory-backend-xxxx.onrender.com`)

---

## PHASE 3: DEPLOY FRONTEND (Follow these steps in Render Dashboard)

1. Click **New +** → **Static Site**
2. Select your `canstory` repository
3. Fill in:
   - Name: `canstory-frontend`
   - Build Command: `cd web && npm install && npm run build`
   - Publish Directory: `web/dist`
4. Click **Create Static Site**
5. Wait 3-5 minutes for deployment
6. Go to **Environment** tab and add:

```
VITE_API_BASE_URL=https://canstory-backend-xxxx.onrender.com
```

Replace `canstory-backend-xxxx.onrender.com` with your actual backend URL from Phase 2

7. **COPY** your frontend URL (e.g., `https://canstory-frontend-xxxx.onrender.com`)

---

## PHASE 4: TEST

1. **Backend**: Visit `https://canstory-backend-xxxx.onrender.com/api/admin/debug`
   - Should see JSON response
2. **Frontend**: Visit `https://canstory-frontend-xxxx.onrender.com`
   - Should see landing page
   - Try to sign in

---

## YOUR DEPLOYMENT URLS (After completion)

- **Frontend**: `https://canstory-frontend-xxxx.onrender.com`
- **Backend**: `https://canstory-backend-xxxx.onrender.com`
- **GitHub**: `https://github.com/YOUR_USERNAME/canstory`

---

## TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| Backend not responding | Check environment variables in Render |
| Sign-in fails | Verify `VITE_API_BASE_URL` in frontend environment |
| CORS errors | Backend CORS already updated in `server.js` |
| Database errors | Verify Supabase credentials are correct |
| Build fails | Check Render logs tab for errors |

