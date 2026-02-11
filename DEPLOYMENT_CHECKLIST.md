# CANSTORY DEPLOYMENT CHECKLIST

## Pre-Deployment (Local)
- [x] Code analyzed and understood
- [x] Vite config updated for dynamic API URL
- [x] Server.js CORS updated for Render domains
- [x] .env.example updated with Supabase credentials
- [ ] All changes committed to Git
- [ ] GitHub repository created

## GitHub Setup
- [ ] Create GitHub account (if needed)
- [ ] Create new repository named `canstory`
- [ ] Push code to GitHub using commands in QUICK_START_DEPLOYMENT.md

## Render Backend Deployment
- [ ] Create Render account (sign up with GitHub)
- [ ] Create Web Service for backend
- [ ] Configure build/start commands
- [ ] Add all environment variables
- [ ] Wait for deployment to complete
- [ ] Copy backend URL
- [ ] Test backend at `/api/admin/debug` endpoint

## Render Frontend Deployment
- [ ] Create Static Site for frontend
- [ ] Configure build command and publish directory
- [ ] Add VITE_API_BASE_URL environment variable
- [ ] Wait for deployment to complete
- [ ] Copy frontend URL

## Post-Deployment Testing
- [ ] Visit frontend URL in browser
- [ ] Check landing page loads
- [ ] Try to sign in
- [ ] Check browser console for errors
- [ ] Test admin dashboard
- [ ] Verify API calls reach backend

## Optional Enhancements
- [ ] Add custom domain
- [ ] Upgrade to Starter plan ($7/month) for production
- [ ] Set up monitoring/alerts
- [ ] Configure auto-deploy on GitHub push

## Environment Variables Reference

### Backend (Render)
```
VITE_SUPABASE_URL=https://mezoaqtjljcmbuanzzkj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lem9hcXRqbGpjbWJ1YW56emtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDY2NjUsImV4cCI6MjA4NTAyMjY2NX0.huABGlQnNynr5ZrksSLBcRHUv8TEVGsxECz22L6_R2M
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lem9hcXRqbGpjbWJ1YW56emtqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTQ0NjY2NSwiZXhwIjoyMDg1MDIyNjY1fQ.QxVtvMjn-x-bbGGATURYttmLi8fPDccLqCAEBpEiUfs
API_PORT=3001
NODE_ENV=production
FRONTEND_URL=https://canstory-frontend.onrender.com
```

### Frontend (Render)
```
VITE_API_BASE_URL=https://canstory-backend-xxxx.onrender.com
```

## Important Notes
1. Free tier services sleep after 15 minutes of inactivity
2. Upgrade to Starter ($7/month) for production use
3. Every GitHub push triggers automatic redeploy
4. Check Render logs if deployment fails
5. Supabase database is already configured and working
6. Mobile app deployment is separate (Expo)

