# Vercel Deployment Fix - Instructions

## ✅ What Was Fixed

1. **API URL Environment Variable** - Frontend now uses `NEXT_PUBLIC_API_URL` instead of hardcoded `localhost:8000`
2. **Build Configuration** - Added `vercel.json` to configure proper build process
3. **All Components Updated** - ScenarioBuilder, ScenarioComparison, and RuleExplainer all use environment variable

## 🚀 Deploy to Vercel

### Step 1: Trigger Redeploy
Go to your Vercel Dashboard:
1. Open https://vercel.com/dashboard
2. Select your project: **rules-as-code-platform**
3. Go to **Deployments** tab
4. Click the latest failed deployment
5. Click **"Redeploy"** button (or wait for automatic rebuild from GitHub push)

### Step 2: Set Environment Variables (Optional - for Backend Connection)
Once the frontend is working, configure the backend API:

1. In Vercel Dashboard, go to **Settings** → **Environment Variables**
2. Add new variable:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://your-backend-api.com` (e.g., Railway, Google Cloud, Heroku)
3. Click **Save**
4. Redeploy the project again

### Step 3: Verify Deployment
- Check that the 404 error is gone
- Page should load with all components visible
- If backend is not configured, calculations will show: "Unable to connect to API"
- This is expected and doesn't break the UI

## 🔧 Troubleshooting

### Still Getting 404?
1. Check Vercel Build Logs:
   - Go to Deployments → Click deployment → Logs
   - Look for build errors
   
2. Clear Cache:
   - Go to Settings → Deployments
   - Click "Clear Cache" 
   - Redeploy

3. Check Configuration:
   - Verify `vercel.json` exists in repo root
   - Verify `frontend/.env.production` exists
   - Both should have been pushed to GitHub

### API Connection Errors?
- Backend is not yet deployed
- Frontend will work without API (components render but calculations unavailable)
- To connect backend:
  1. Deploy FastAPI backend to Railway/Google Cloud/Heroku
  2. Get the backend URL
  3. Set `NEXT_PUBLIC_API_URL` environment variable in Vercel
  4. Redeploy

## 📦 Backend Deployment (Next Steps)

When ready to deploy FastAPI backend:

### Option A: Railway (Recommended - Docker support)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy from backend directory
cd backend
railway up
```

### Option B: Google Cloud Run (Free tier available)
```bash
cd backend
gcloud run deploy rules-as-code-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Option C: Heroku (Requires credit card)
```bash
cd backend
heroku login
heroku create rules-as-code-api
git push heroku main
```

After deployment, update `NEXT_PUBLIC_API_URL` in Vercel and redeploy frontend.

## 📋 Deployment Checklist

- [ ] GitHub push completed (✅ Done - commit 1242ea4)
- [ ] Vercel redeploy triggered
- [ ] Frontend loads without 404 error
- [ ] All components visible (ScenarioBuilder, Comparison, etc.)
- [ ] (Optional) Backend deployed and API URL configured
- [ ] (Optional) Backend API calls working (calculations functioning)

---

**Status**: Frontend ready for deployment ✅  
**Next**: Deploy backend API when needed
