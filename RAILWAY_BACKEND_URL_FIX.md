# Fix: Backend Public URL Not Showing on Railway

## Problem
Backend deployed to Railway but showing `http://localhost:8000` instead of Railway's public domain.

## Root Cause
Railway environment variables for CORS and public URL not configured.

## Solution

### Step 1: Get Your Railway Public URL
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click your **rules-as-code-platform** project
3. Look at your **backend** service/deployment
4. In the right sidebar, find the **"Public Domain"** or **"Service URL"**
   - It should show something like: `rules-as-code-backend-prod.up.railway.app`
   - Full URL: `https://rules-as-code-backend-prod.up.railway.app`
5. **Copy this URL** (we'll use it next)

### Step 2: Set Environment Variables in Railway
1. In Railway Dashboard, go to your backend service
2. Click the **Variables** tab
3. Add these environment variables:

| Key | Value |
|-----|-------|
| `CORS_ORIGINS` | `https://rules-as-code-platform.vercel.app` |
| `ENVIRONMENT` | `production` |
| `DATABASE_URL` | (should already be set) |
| `REDIS_URL` | (should already be set) |

4. **Redeploy** by clicking the **Redeploy** button on the Deployments tab

### Step 3: Update Vercel Environment Variable
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **rules-as-code-platform** project
3. Go to **Settings** → **Environment Variables**
4. Find or create `NEXT_PUBLIC_API_URL`
5. Set value to: `https://YOUR-RAILWAY-DOMAIN` (replace with actual URL from Step 1)
   - Example: `https://rules-as-code-backend-prod.up.railway.app`
6. **Save** changes

### Step 4: Redeploy Frontend on Vercel
1. In Vercel Dashboard, go to **Deployments**
2. Find the latest deployment
3. Click **Redeploy** (or click the deployment and select Redeploy)
4. Wait 2-3 minutes for build to complete

### Step 5: Test
1. Go to [https://rules-as-code-platform.vercel.app](https://rules-as-code-platform.vercel.app)
2. Change a value (age, income, etc.)
3. Should see calculations now instead of "Failed to fetch"

---

## Troubleshooting

**If you still see "Failed to fetch":**

1. **Check CORS_ORIGINS is set correctly**
   - Must match your Vercel frontend domain exactly
   - Should be: `https://rules-as-code-platform.vercel.app`

2. **Verify NEXT_PUBLIC_API_URL in Vercel**
   - Open browser DevTools (F12)
   - Go to Console
   - Type: `console.log(process.env.NEXT_PUBLIC_API_URL)`
   - Should show your Railway backend URL

3. **Test backend directly**
   - In browser, go to: `https://YOUR-RAILWAY-DOMAIN/health`
   - Should return: `{"status":"healthy","version":"1.0.0","environment":"production"}`
   - If 404 or timeout: backend might not be running

4. **Check Railway deployment status**
   - Go to Railway Dashboard → Your backend service
   - Look for green **✓ Running** status
   - If red **✗**: Check logs for errors (click Logs tab)

5. **Clear browser cache**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear cache and cookies for vercel.app

---

## What These Variables Do

- **CORS_ORIGINS**: Tells backend which frontend domain can make API requests
- **ENVIRONMENT**: Used by backend to set logging level and behaviors
- **DATABASE_URL**: PostgreSQL connection string (Railway auto-sets this)
- **REDIS_URL**: Redis cache connection (Railway auto-sets this)
- **NEXT_PUBLIC_API_URL**: Tells Next.js frontend where to send API requests

---

## Manual Testing (Optional)

Test backend is working by making a direct API call:

```bash
# Test health endpoint
curl https://YOUR-RAILWAY-DOMAIN/health

# Test calculations (replace with actual values)
curl -X POST https://YOUR-RAILWAY-DOMAIN/api/v1/calculations \
  -H "Content-Type: application/json" \
  -d '{"age": 62, "gross_income": 50000, "pension_savings": 100000, "lump_sum_percentage": 10}'
```

Replace `YOUR-RAILWAY-DOMAIN` with the actual URL from Step 1.
