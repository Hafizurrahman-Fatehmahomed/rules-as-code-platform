# Railway Deployment Guide - Rules-as-Code Platform Backend

## Overview
This guide walks through deploying the FastAPI backend to Railway with proper environment configuration.

## Prerequisites
- Railway account (free tier available at [railway.app](https://railway.app))
- GitHub repository pushed with backend code
- PostgreSQL and Redis services (Railway provides these)

## Step 1: Create Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **New Project**
3. Select **GitHub Repo**
4. Authorize GitHub and select: `Hafizurrahman-Fatehmahomed/rules-as-code-platform`
5. Railway will automatically detect the project structure

## Step 2: Configure Backend Service

1. Railway should detect your backend. Click on the **backend** service
2. Go to the **Settings** tab
3. Set **Root Directory** to: `backend`
4. Go to **Deploy** tab
5. Wait for initial build/deployment (2-3 minutes)

## Step 3: Add Database and Cache Services

### PostgreSQL
1. Click **+ New** to add a service
2. Select **PostgreSQL**
3. Railway will create a database automatically
4. The `DATABASE_URL` will be auto-injected into backend environment

### Redis
1. Click **+ New** to add a service
2. Select **Redis**
3. Railway will create a cache automatically
4. The `REDIS_URL` will be auto-injected into backend environment

## Step 4: Configure Environment Variables

### ✅ Already Auto-Set by Railway:
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection

### ⚠️ You Must Set These:

1. Go to your **backend** service
2. Click the **Variables** tab
3. Add these variables:

| Key | Value | Example |
|-----|-------|---------|
| `CORS_ORIGINS` | Frontend domain(s) | `https://rules-as-code-platform.vercel.app` |
| `ENVIRONMENT` | `production` | `production` |
| `DEBUG` | `false` | `false` |

**For CORS_ORIGINS** - This tells the backend which domains can make API requests:
- **For single domain**: `https://rules-as-code-platform.vercel.app`
- **For multiple domains**: `https://domain1.com,https://domain2.com` (comma-separated, no spaces)
- **Format**: Use HTTPS in production, never use localhost

4. Click **Save** after adding each variable

## Step 5: Redeploy Backend

1. Go to **Deployments** tab on your backend service
2. Click the **Redeploy** button
3. Wait 2-3 minutes for the deployment to complete
4. Check **Logs** tab for any errors

## Step 6: Verify Backend is Running

1. Look for **Public Domain** or **Service URL** in the right sidebar
   - Should look like: `rules-as-code-backend-xxx.up.railway.app`
2. Test the health endpoint in your browser:
   ```
   https://rules-as-code-backend-xxx.up.railway.app/health
   ```
3. Should return JSON response with status "healthy"

## Step 7: Get Backend URL

1. Copy the **Public Domain/Service URL** from Railway
2. You'll need this for the frontend configuration

## Expected Railway Environment

After setup, your backend should have these environment variables:

```
# Auto-set by Railway:
DATABASE_URL=postgresql://user:pass@host/dbname
REDIS_URL=redis://user:pass@host:port

# You configured:
CORS_ORIGINS=https://rules-as-code-platform.vercel.app
ENVIRONMENT=production
DEBUG=false

# From code defaults:
API_PREFIX=/api/v1
```

## Troubleshooting

### Backend won't start (red ✗ status)

1. Check **Logs** tab for error messages
2. Look for `pydantic_settings.SettingsError` errors
3. Verify all required environment variables are set
4. Check that DATABASE_URL and REDIS_URL exist

**If you see Pydantic error about CORS_ORIGINS**:
- The backend code now handles empty values gracefully
- Make sure you've pushed the latest code to GitHub
- Redeploy from Railway dashboard

### 404 on /health endpoint

- Backend service might not be running
- Check **Logs** for startup errors
- Verify Public Domain is shown in Railway UI
- Try accessing the domain in browser

### "Failed to fetch" from frontend

- CORS_ORIGINS not set correctly
- Frontend NEXT_PUBLIC_API_URL not pointing to Railway
- Backend domain is wrong
- See [RAILWAY_BACKEND_URL_FIX.md](../RAILWAY_BACKEND_URL_FIX.md) for full troubleshooting

### Database connection errors

- PostgreSQL service might not exist
- DATABASE_URL might be blank
- Click **+ New** and add **PostgreSQL** service
- Wait for it to initialize, then redeploy backend

### Redis connection errors

- Redis service might not exist
- REDIS_URL might be blank
- Click **+ New** and add **Redis** service
- Wait for it to initialize, then redeploy backend

## Monitoring & Logs

### View Live Logs
1. Go to your backend service
2. Click **Logs** tab
3. Logs update in real-time
4. Look for startup messages and errors

### Check Service Status
1. Click **Metrics** tab to see:
   - CPU usage
   - Memory usage
   - Request latency
   - Error rates

## Production Best Practices

✅ **Do**:
- Use HTTPS only (Railway provides this automatically)
- Set `ENVIRONMENT=production`
- Set `DEBUG=false`
- Use strong, unique `CORS_ORIGINS` values
- Monitor logs for errors
- Set up alerts for deployment failures

❌ **Don't**:
- Commit `.env` files to GitHub
- Use `localhost` in production CORS_ORIGINS
- Set `DEBUG=true` in production
- Expose sensitive credentials in environment variables
- Leave default passwords unchanged

## Testing the Backend

### Using curl (command line)

```bash
# Test health check
curl https://your-backend-domain/health

# Test scenarios list
curl https://your-backend-domain/api/v1/scenarios

# Test rules list
curl https://your-backend-domain/api/v1/rules

# Test calculation
curl -X POST https://your-backend-domain/api/v1/calculations \
  -H "Content-Type: application/json" \
  -d '{"age": 62, "gross_income": 50000, "pension_savings": 100000}'
```

### Using browser

1. Go to: `https://your-backend-domain/health`
2. Should see JSON response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "production",
  "cors_origins": ["https://rules-as-code-platform.vercel.app"]
}
```

## Next Steps

1. ✅ Backend deployed and running
2. ⏭️ Update frontend with backend URL (see [RAILWAY_BACKEND_URL_FIX.md](../RAILWAY_BACKEND_URL_FIX.md))
3. ⏭️ Configure Vercel with backend URL
4. ⏭️ Test end-to-end integration

## Support

- Railway Docs: https://docs.railway.app/
- FastAPI Docs: https://fastapi.tiangolo.com/
- Pydantic Settings: https://docs.pydantic.dev/latest/concepts/settings/
- GitHub Issues: [rules-as-code-platform/issues](https://github.com/Hafizurrahman-Fatehmahomed/rules-as-code-platform/issues)
