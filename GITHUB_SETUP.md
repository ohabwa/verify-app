# GitHub Setup Instructions

Since the GitHub CLI cannot create repositories directly in this environment, follow these steps to push the code to GitHub manually:

## Step 1: Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `verify-app`
3. Description: `B2B AI Content Verification API - Detect AI-generated text with high accuracy and low false positives`
4. Select **Public**
5. Do NOT initialize with README (we already have one)
6. Click **Create repository**

## Step 2: Push Code to GitHub

After creating the repository, run these commands in the `/home/team/shared/verify-app` directory:

```bash
cd /home/team/shared/verify-app

# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/verify-app.git

# Push the code
git push -u origin master

# Or if you want to use main branch:
git branch -m master main
git push -u origin main
```

## Step 3: Set Up GitHub Secrets for CI/CD

For automatic deployments, add these secrets in your GitHub repository (Settings → Secrets):

### For Railway Deployment:
- `RAILWAY_TOKEN` - Get from [Railway dashboard](https://railway.app/account)

### For Render Deployment:
- `RENDER_BACKEND_HOOK` - Get from Render dashboard → your service → Deploy Hooks

### For Vercel Frontend Deployment:
- `VERCEL_TOKEN` - Get from [Vercel settings](https://vercel.com/account/tokens)
- `VERCEL_ORG_ID` - Found in your Vercel team settings
- `VERCEL_PROJECT_ID` - Found in your project settings

### For GCP Deployment (optional):
- `GCP_SA_KEY` - Service account JSON key
- `GCP_PROJECT` - GCP project ID
- `GCP_REGION` - e.g., `us-central1`

## Step 4: Connect Repository to Hosting Platforms

### Vercel (Frontend)
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository `verify-app`
3. Set root directory to `frontend`
4. Add environment variable: `NEXT_PUBLIC_API_URL` = your backend URL
5. Deploy

### Railway (Backend)
1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select the `verify-app` repository
4. Set root directory to `backend`
5. Add environment variables from `.env`:
   - `DATABASE_URL`
   - `REDIS_URL`
   - `SECRET_KEY`

### Render (Alternative Backend)
1. Go to [render.com](https://render.com)
2. Connect GitHub repo
3. Create Web Service
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## Alternative: One-Click Deploy Links

Once the repo is on GitHub, you can use these one-click deploy options:

**Railway:**
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new?template=https://github.com/YOUR_USERNAME/verify-app)

**Vercel:**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/verify-app&directory=frontend)

## Verify CI/CD is Working

After pushing to GitHub with the workflows in place:
1. Go to your repository's **Actions** tab
2. You should see the workflows running
3. Backend workflow deploys on changes to `backend/` folder
4. Frontend workflow deploys on changes to `frontend/` folder

## Repository URL

Once you've created the GitHub repo and pushed the code, update the README with your repository URL:

```markdown
[![GitHub Repo](https://img.shields.io/badge/GitHub-verify--app-blue)](https://github.com/YOUR_USERNAME/verify-app)
```