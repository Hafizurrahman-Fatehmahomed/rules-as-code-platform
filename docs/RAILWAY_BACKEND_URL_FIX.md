# Fix: Backend Public URL Not Showing on Railway

## Problem
Backend deployed to Railway but failing to start with Pydantic error:
```
pydantic_settings.sources.SettingsError: error parsing value for field "cors_origins"
json.decoder.JSONDecodeError: Expecting value: line 1 column 1 (char 0)
```

This error occurs when environment variables are empty or improperly formatted.

## Root Cause
Railway environment variables weren't properly configured, causing Pydantic to fail parsing the `cors_origins` field.

## Solution

### Step 1: Update Backend Code (Already Done ✅)
The backend code has been updated to handle missing/empty environment variables gracefully:
- **config.py**: Now parses CORS origins from comma-separated strings
- **main.py**: Now uses settings from config instead of os.getenv()
- **Default CORS**: Includes localhost, Vercel, and other common domains

### Step 2: Set Railway Environment Variables
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click your **rules-as-code-platform** project
3. Click the **backend** service
4. Go to the **Variables** tab
5. Set these environment variables:

| Key | Value |
|-----|-------|
| `CORS_ORIGINS` | `https://rules-as-code-platform.vercel.app,https://your-railway-domain` |
| `ENVIRONMENT` | `production` |
| `DATABASE_URL` | (should already be auto-set) |
| `REDIS_URL` | (should already be auto-set) |

**Format for CORS_ORIGINS**:
- Comma-separated values (no spaces around commas): `https://domain1.com,https://domain2.com`
- Or JSON array format: `["https://domain1.com", "https://domain2.com"]`
- DO NOT use `http://localhost:*` for production (you're not running locally on Railway)

6. **Deploy**: Click **Redeploy** to restart the backend with new environment variables

### Step 3: Get Your Railway Public URL
1. In Railway Dashboard, go to your **backend** service
2. Look at the **Deployments** tab
3. Find the **Public Domain** or **Service URL** 
   - It should look like: `rules-as-code-backend-prod.up.railway.app`
   - Full URL: `https://rules-as-code-backend-prod.up.railway.app`
4. **Copy this URL**

### Step 4: Verify Backend is Running
1. Open browser and go to: `https://YOUR-RAILWAY-DOMAIN/health`
   - Replace `YOUR-RAILWAY-DOMAIN` with actual URL from Step 3
   - Example: `https://rules-as-code-backend-prod.up.railway.app/health`
2. Should return:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "production",
  "cors_origins": ["https://rules-as-code-platform.vercel.app", "..."]
}
```

If you get 404 or timeout: go to Railway Dashboard → backend service → **Logs** tab to see error details.

### Step 5: Update Vercel Environment Variable
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **rules-as-code-platform** project
3. Go to **Settings** → **Environment Variables**
4. Find or create `NEXT_PUBLIC_API_URL`
5. Set value to your Railway backend URL from Step 3:
   - Example: `https://rules-as-code-backend-prod.up.railway.app`
6. **Save** changes

### Step 6: Redeploy Frontend on Vercel
1. In Vercel Dashboard, go to **Deployments**
2. Click the latest deployment
3. Click **Redeploy** (top right)
4. Wait 2-3 minutes for build to complete

### Step 7: Test End-to-End
1. Go to [https://rules-as-code-platform.vercel.app](https://rules-as-code-platform.vercel.app)
2. Try changing a value (age, income, etc.)
3. Should see calculations now instead of "Failed to fetch"
4. Open DevTools (F12) → Console to verify API calls are going to Railway domain

---

## What Changed in Backend Code

### config.py
- Added `field_validator` to handle CORS parsing
- Supports comma-separated values: `domain1.com,domain2.com`
- Supports JSON array format: `["domain1.com", "domain2.com"]`
- Graceful defaults if environment variable is empty
- Includes Vercel domain in defaults

### main.py
- Changed from `os.getenv("CORS_ORIGINS", ...)` to `settings.cors_origins`
- Uses BaseSettings from Pydantic for proper environment handling
- Health endpoint now shows configured CORS origins (useful for debugging)

---

## Troubleshooting

**If backend still won't start (exit code 1)**:

1. Check Railway logs:
   - Railway Dashboard → backend service → **Logs** tab
   - Look for error messages
   - Copy the full error and search online

2. Try deploying without custom CORS_ORIGINS:
   - Remove `CORS_ORIGINS` variable from Railway
   - Let backend use defaults
   - Deploy and test

3. Verify DATABASE_URL is set:
   - Should look like: `postgresql://user:password@host/dbname`
   - If missing, add it to Railway variables

**If frontend shows "Failed to fetch"**:

1. Check browser DevTools (F12):
   - Go to **Network** tab
   - Look for failed requests
   - Note the error message

2. Check NEXT_PUBLIC_API_URL:
   - DevTools → Console
   - Type: `console.log(process.env.NEXT_PUBLIC_API_URL)`
   - Should show your Railway URL, not localhost

3. Verify backend URL is accessible:
   - Open new browser tab
   - Go to: `https://YOUR-RAILWAY-DOMAIN/health`
   - Should get JSON response, not 404

4. Check CORS configuration:
   - Backend health endpoint shows what origins are allowed
   - Must include your Vercel domain exactly

**If environment variable syntax is confusing**:

- **Simple version**: `https://rules-as-code-platform.vercel.app,https://your-railway-domain.up.railway.app`
- **JSON version**: `["https://rules-as-code-platform.vercel.app", "https://your-railway-domain.up.railway.app"]`
- Both work the same way

---

## Manual Testing (Optional)

Test backend API directly:

```bash
# Test health endpoint
curl https://your-railway-domain/health

# Test calculations
curl -X POST https://your-railway-domain/api/v1/calculations \
  -H "Content-Type: application/json" \
  -d '{"age": 62, "gross_income": 50000, "pension_savings": 100000, "lump_sum_percentage": 10}'
```

If these work, the backend is fine—just frontend configuration needs fixing.

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| `json.decoder.JSONDecodeError` | Environment variable parsing failed | Backend code now handles this automatically—redeploy |
| 404 on `/health` | Backend not running | Check Railway logs, restart deployment |
| "Failed to fetch" from frontend | API URL wrong or CORS not configured | Update NEXT_PUBLIC_API_URL in Vercel |
| Timeout connecting to backend | Railway domain is wrong | Verify public domain in Railway dashboard |
| Localhost showing in response | Old cached response | Hard refresh browser (Ctrl+Shift+R) |

