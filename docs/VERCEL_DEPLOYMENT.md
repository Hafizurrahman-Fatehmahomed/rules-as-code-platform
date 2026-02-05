# 🚀 Deployment Guide: Vercel

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Create new repository named: `rules-as-code-platform`
3. **Choose "Public"** (required for free tier)
4. **Do NOT initialize with README** (we have one)
5. Click **"Create repository"**

## Step 2: Connect Local Git to GitHub

Copy and run these commands in PowerShell:

```powershell
cd c:\code\rules-as-code-platform

# Add GitHub remote (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/rules-as-code-platform.git

# Rename branch to main
git branch -M main

# Push code to GitHub
git push -u origin main
```

## Step 3: Deploy to Vercel

1. Go to https://vercel.com/dashboard
2. Click **"New Project"**
3. Click **"Import Git Repository"**
4. Select **"rules-as-code-platform"** 
5. Vercel auto-detects Next.js → Click **"Deploy"**
6. Wait 2-3 minutes for deployment ✨

## Step 4: Configure Backend URL

After deployment, you need to update the frontend to call your backend:

1. Your Vercel URL will be: `https://rules-as-code-platform-XXXXX.vercel.app`
2. Go to backend deployment (see Backend Deployment Guide)
3. Update frontend `.env.production` with backend URL

---

## Backend Deployment Options

### Option A: Railway (Recommended - Easy)
- Go to https://railway.app
- Connect GitHub repo
- Deploy `backend/` folder
- Get URL like: `https://backend-production-xxxx.up.railway.app`

### Option B: Google Cloud Run (Free tier available)
- Upload `backend/` as Docker container
- Get public URL

### Option C: Render (Free tier)
- https://render.com
- Connect GitHub
- Deploy Docker container

---

## Update Environment Variables

After getting backend URL, add to Vercel:

1. **Vercel Dashboard** → Settings → Environment Variables
2. Add: `NEXT_PUBLIC_API_URL=https://your-backend-url`
3. Redeploy

---

## Result

✅ Frontend: `https://rules-as-code-platform-XXXXX.vercel.app`
✅ Backend: `https://your-backend.up.railway.app`
✅ Database: PostgreSQL (production database needed)

---

Need help? Let me know!
