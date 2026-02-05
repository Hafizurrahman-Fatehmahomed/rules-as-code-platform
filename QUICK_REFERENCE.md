# Quick Reference: Railway Backend Deployment

## 🔴 Problem
```
pydantic_settings.SettingsError: error parsing value for field "cors_origins"
json.decoder.JSONDecodeError: Expecting value: line 1 column 1 (char 0)
```

## ✅ Solution (3 Steps)

### Step 1: Get Latest Code
```bash
cd c:\code\rules-as-code-platform
git pull origin master
```

### Step 2: Configure Railway
1. Railway Dashboard → Your Project → backend service
2. Click **Variables** tab
3. Add these two variables:
   - `CORS_ORIGINS` = `https://rules-as-code-platform.vercel.app`
   - `ENVIRONMENT` = `production`
4. Click **Redeploy**
5. Wait 2-3 minutes for build

### Step 3: Verify & Update Vercel
1. Test backend health:
   - Open browser: `https://YOUR-RAILWAY-DOMAIN/health`
   - Should return JSON with `"status": "healthy"`

2. Copy your Railway domain from the dashboard

3. Vercel Dashboard → rules-as-code-platform → Settings → Environment Variables
   - Update: `NEXT_PUBLIC_API_URL=https://YOUR-RAILWAY-DOMAIN`
   - Example: `https://rules-as-code-backend-prod.up.railway.app`

4. Click **Redeploy** in Vercel Deployments

## ✓ Test
1. Go to: https://rules-as-code-platform.vercel.app
2. Change age or income
3. Should see calculations (not "Failed to fetch")

---

## 📋 What Was Fixed

| File | Change |
|------|--------|
| `backend/src/config.py` | Added robust CORS parsing with Pydantic validator |
| `backend/src/main.py` | Use settings from config instead of os.getenv() |

## 🐛 What Was Broken

Backend couldn't parse empty `CORS_ORIGINS` environment variable—Pydantic tried to parse as JSON and failed.

## 🎯 Result

Backend now:
- ✅ Starts successfully even with empty env vars
- ✅ Supports comma-separated CORS domains
- ✅ Provides sensible defaults
- ✅ Returns configuration on `/health` endpoint

---

## 📚 Full Docs
- [DEPLOYMENT_FIX_SUMMARY.md](./DEPLOYMENT_FIX_SUMMARY.md) - Technical details
- [RAILWAY_DEPLOYMENT_GUIDE.md](./RAILWAY_DEPLOYMENT_GUIDE.md) - Complete setup guide
- [RAILWAY_BACKEND_URL_FIX.md](./RAILWAY_BACKEND_URL_FIX.md) - Troubleshooting

## 🆘 Troubleshooting

**Backend still showing error after redeploy?**
- Check Railway Logs tab
- Verify DATABASE_URL exists (auto-set by Railway)
- Verify REDIS_URL exists (auto-set by Railway)

**Frontend shows "Failed to fetch"?**
- Check NEXT_PUBLIC_API_URL in Vercel (should be Railway domain)
- Open DevTools F12 → Network tab → check failed requests
- Verify CORS_ORIGINS in Railway includes Vercel domain

**Can't see /health response?**
- Use Railway domain URL (not localhost)
- Verify deployment is not showing red ✗ status
- Check if service is still building (wait 2-3 min)

---

**Latest code is on GitHub master branch. All fixes included.** ✅
