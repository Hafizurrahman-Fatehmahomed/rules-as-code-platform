# Deploy FastAPI Backend to Railway

## Quick Deploy (Recommended - 5 minutes)

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

### Step 2: Login to Railway
```bash
railway login
```
- Opens browser to login/sign up
- Authorizes CLI access

### Step 3: Deploy Backend
```bash
cd backend
railway up
```
- Railway auto-detects Docker
- Builds and deploys
- Gives you a public URL

### Step 4: Get Backend URL
```bash
railway open
```
- Shows your deployed backend URL
- Example: `https://my-backend-production.up.railway.app`

### Step 5: Connect to Vercel Frontend

1. **In Vercel Dashboard**:
   - Go to your project → Settings → Environment Variables
   - Add new variable:
     - **Name**: `NEXT_PUBLIC_API_URL`
     - **Value**: `https://your-railway-url` (from Step 4)
   - Click Save

2. **Redeploy Frontend**:
   - Go to Deployments → Latest → Click "Redeploy"
   - Wait 2-3 minutes
   - Refresh your site - calculations should work! ✅

---

## Alternative: Google Cloud Run (Free Tier)

If you prefer Google Cloud:

```bash
# Install Google Cloud SDK first

cd backend
gcloud run deploy rules-as-code-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Get URL from output, set in Vercel
```

---

## Environment Variables (Optional)

If your backend needs a database connection string, add to Railway:

1. Railway Dashboard → Your Project → Variables
2. Add variables like `DATABASE_URL`
3. Railway will pass them to your app automatically

---

## Troubleshooting

**Build fails?**
- Check Railway logs: `railway logs`
- Ensure Python 3.11+ available
- Verify `requirements.txt` has all dependencies

**Port not responding?**
- Make sure FastAPI listens on `0.0.0.0:8000`
- Check `main.py` or `app.py`

**CORS errors?**
- Add to FastAPI:
  ```python
  from fastapi.middleware.cors import CORSMiddleware
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["https://rules-as-code-platform.vercel.app"],
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```

---

**You're almost there!** Once backend is live, frontend calculations will work immediately. 🚀
