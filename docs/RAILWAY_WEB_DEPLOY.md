# Deploy via Railway Web Dashboard (Easiest)

Since CLI auth can be tricky, here's the web dashboard way:

## Step 1: Go to Railway Dashboard
https://railway.app/dashboard

## Step 2: Create New Project
- Click **"+ New Project"**
- Select **"Deploy from GitHub"**

## Step 3: Connect Repository
- Search for: `rules-as-code-platform`
- Click to select it
- Authorize if needed

## Step 4: Configure Build
- Select **`backend`** folder as root
- Click **"Deploy"**

## Step 5: Get URL
- Once deployed, go to **Deployments**
- Click your deployment
- Copy the **Public URL** (something like `https://rules-as-code-api-prod.up.railway.app`)

## Step 6: Connect to Vercel
1. Go to Vercel Dashboard → Your Project → Settings
2. Environment Variables
3. Add:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-railway-url` (from Step 5)
4. Save and **Redeploy**

Done! ✅ Calculations should work now!

---

**If you prefer CLI but hit auth issues:**

```bash
railway link [project-id]  # Get from Railway dashboard URL
cd backend
railway up
```

---

The web dashboard is honestly the most reliable way. Try that! 🚀
