# Rules-as-Code Platform - Deployment Fix Summary

## Issue Identified ✅
Railway container failed to start with Pydantic settings error:
```
pydantic_settings.sources.SettingsError: error parsing value for field "cors_origins"
json.decoder.JSONDecodeError: Expecting value: line 1 column 1 (char 0)
```

**Root Cause**: Environment variable parsing failure when `CORS_ORIGINS` was empty or improperly formatted.

## Fixes Applied ✅

### 1. Backend Configuration Hardening
**File**: `backend/src/config.py`
- Added Pydantic `field_validator` to gracefully handle CORS parsing
- Supports multiple formats:
  - Comma-separated: `domain1.com,domain2.com`
  - JSON array: `["domain1.com", "domain2.com"]`
- Provides sensible defaults if env var is empty:
  - Development: `localhost:3000`, `localhost:8000`
  - Production: Includes Vercel domain automatically

### 2. FastAPI Application Update
**File**: `backend/src/main.py`
- Changed from `os.getenv()` to `settings.cors_origins` from Pydantic
- Properly imports settings from config module
- Health endpoint now returns configured CORS origins (debugging aid)

### 3. Documentation
- **RAILWAY_DEPLOYMENT_GUIDE.md**: Step-by-step deployment walkthrough
- **RAILWAY_BACKEND_URL_FIX.md**: Troubleshooting and environment configuration
- **backend/.env.example**: Template for backend environment variables

## How to Deploy Now

### Quick Start (3 Steps)

1. **Push Latest Code to GitHub**
   ```bash
   git pull origin master  # Get latest fixes
   git push origin master  # Ensure Railway sees new code
   ```

2. **Redeploy on Railway**
   - Railway Dashboard → backend service → Deployments
   - Click **Redeploy** button
   - Wait 2-3 minutes for build to complete

3. **Set Environment Variables in Railway**
   - backend service → Variables tab
   - Add: `CORS_ORIGINS=https://rules-as-code-platform.vercel.app`
   - Add: `ENVIRONMENT=production`
   - Click **Redeploy** again

4. **Update Vercel**
   - Vercel Dashboard → Settings → Environment Variables
   - Set `NEXT_PUBLIC_API_URL=https://your-railway-domain`
   - Redeploy frontend

## What Changed in the Codebase

### Before (Broken)
```python
# main.py - Brittle string parsing
allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:4000").split(",")

# config.py - No validation
cors_origins: list = ["http://localhost:3000", "http://localhost:8000"]
```

### After (Robust)
```python
# config.py - With validation
@field_validator("cors_origins", mode="before")
@classmethod
def parse_cors_origins(cls, v):
    """Parse CORS origins from environment variable"""
    if v is None or v == "":
        return ["http://localhost:3000", "http://localhost:8000", "https://rules-as-code-platform.vercel.app"]
    
    if isinstance(v, str):
        if v.startswith("["):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return [origin.strip() for origin in v.split(",")]
        else:
            return [origin.strip() for origin in v.split(",")]
    
    return v if isinstance(v, list) else [v]

# main.py - Using settings
allow_origins=settings.cors_origins
```

## Files Changed
1. ✅ `backend/src/config.py` - Added robust CORS parsing
2. ✅ `backend/src/main.py` - Use settings instead of os.getenv
3. ✅ `RAILWAY_DEPLOYMENT_GUIDE.md` - New comprehensive guide
4. ✅ `RAILWAY_BACKEND_URL_FIX.md` - Updated with solutions
5. ✅ `backend/.env.example` - New template

## Testing the Fix

### Local Testing
```bash
cd backend
python -c "from src.config import settings; print(f'✅ Config: {settings.cors_origins}')"
python -c "from src.main import app; print('✅ App loaded')"
```

### Production Testing (Railway)
1. Go to: `https://your-backend-domain/health`
2. Should see:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "production",
  "cors_origins": ["https://rules-as-code-platform.vercel.app"]
}
```

## Deployment Checklist

- [ ] Push latest code to GitHub (`git push origin master`)
- [ ] Railway detects new code and rebuilds
- [ ] Set `CORS_ORIGINS` in Railway Variables
- [ ] Set `ENVIRONMENT=production` in Railway Variables
- [ ] Redeploy backend on Railway
- [ ] Verify `/health` endpoint returns 200 with JSON
- [ ] Update `NEXT_PUBLIC_API_URL` in Vercel with Railway domain
- [ ] Redeploy frontend on Vercel
- [ ] Test calculations on live site
- [ ] Check DevTools Network tab—API calls should go to Railway domain

## Expected Behavior After Fix

✅ **Backend**:
- Container starts successfully (no Pydantic errors)
- Handles empty env vars gracefully
- Supports multiple CORS configuration formats
- Health endpoint returns actual configuration

✅ **Frontend**:
- Connects to Railway backend
- Calculations work without "Failed to fetch" errors
- DevTools shows API requests going to Railway domain

✅ **End-to-End**:
- User changes values on https://rules-as-code-platform.vercel.app
- Frontend sends request to Railway backend
- Backend calculates and returns response
- Frontend displays results

## Documentation Files

All files are in the repository root:

| File | Purpose |
|------|---------|
| [RAILWAY_DEPLOYMENT_GUIDE.md](./RAILWAY_DEPLOYMENT_GUIDE.md) | Complete Railway setup walkthrough |
| [RAILWAY_BACKEND_URL_FIX.md](./RAILWAY_BACKEND_URL_FIX.md) | Troubleshooting & environment config |
| [backend/.env.example](./backend/.env.example) | Backend env var template |

## Next Steps for Deployment

1. **Review the fixes** in `backend/src/config.py` and `backend/src/main.py`
2. **Follow RAILWAY_DEPLOYMENT_GUIDE.md** for step-by-step deployment
3. **Test the backend** at the health endpoint
4. **Configure Vercel** with the Railway backend URL
5. **Test end-to-end** on the live site

## Support

If you encounter issues:

1. **Check Railway Logs**: Dashboard → backend → Logs tab
2. **Verify Environment Variables**: Dashboard → backend → Variables tab
3. **Test Health Endpoint**: `https://domain/health` in browser
4. **Review Troubleshooting**: See [RAILWAY_BACKEND_URL_FIX.md](./RAILWAY_BACKEND_URL_FIX.md)

## Technical Details

### Why This Happened
Pydantic v2 settings parsing requires careful handling of complex types like lists. When the environment variable is missing or empty, Pydantic tries to parse it as JSON, which fails because the string is empty.

### Why This Fix Works
- Validates the field **before** Pydantic tries JSON parsing
- Handles multiple input formats (string, list, JSON)
- Provides sensible defaults for both dev and prod environments
- Allows Railway's auto-set variables to work cleanly

### Future-Proofing
The fix supports:
- Empty/missing environment variables
- Comma-separated strings
- JSON array format
- Python list objects
- Any future format additions

---

**All fixes have been committed and pushed to GitHub.**
Ready to redeploy on Railway! 🚀
