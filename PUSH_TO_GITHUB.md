# Verify App - GitHub Setup Guide

## Current Status

The Verify app code has been committed to a local Git repository and is ready to push to GitHub. The GitHub CLI in this environment has authentication issues, so you'll need to complete the repository creation manually.

## Step-by-Step Instructions

### Step 1: Create GitHub Repository

1. Open your browser and go to: **https://github.com/new**
2. Fill in the details:
   - **Repository name**: `verify-app`
   - **Description**: `B2B AI Content Verification API - Detect AI-generated text with high accuracy and low false positives`
   - **Visibility**: Public
   - **DO NOT** check "Add a README file" (our repo already has one)
3. Click **Create repository**

### Step 2: Push Code to GitHub

After creating the repository, open a terminal on your local machine and run:

```bash
# Navigate to the verify-app directory
cd /home/team/shared/verify-app

# Add the remote (replace YOUR_USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/verify-app.git

# Push the code to GitHub
git push -u origin master
```

### Step 3: Configure GitHub Actions Secrets

For CI/CD to work, add secrets in your GitHub repository:

1. Go to your repository: **https://github.com/YOUR_USERNAME/verify-app**
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add:

#### For Railway Backend Deployment:
- **Name**: `RAILWAY_TOKEN`
- **Value**: Get from https://railway.app/account

#### For Vercel Frontend Deployment:
- **Name**: `VERCEL_TOKEN`  
- **Value**: Get from https://vercel.com/account/tokens

### Step 4: Connect to Vercel (Frontend)

1. Go to **https://vercel.com** and sign in
2. Click **Add New** → **Project**
3. Select your GitHub repository `verify-app`
4. Set the **Root Directory** to `frontend`
5. Add environment variable:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-backend-url.railway.app` (or your deployed backend URL)
6. Click **Deploy**

### Step 5: Connect to Railway (Backend)

1. Go to **https://railway.app** and sign in
2. Click **Add New** → **Project from GitHub**
3. Select the `verify-app` repository
4. Set the **Root Directory** to `backend`
5. Add environment variables:
   - `DATABASE_URL`: `postgresql://user:pass@host:5432/verify`
   - `REDIS_URL`: `redis://host:6379/0`
   - `SECRET_KEY`: `your-secure-secret-key`
6. Click **Deploy**

## What Gets Deployed Automatically

Once you've set up the secrets and connected the repos:

| Trigger | Action |
|---------|--------|
| Push to `master` in `backend/` | Deploys backend to Railway/Render |
| Push to `master` in `frontend/` | Deploys frontend to Vercel |

## Repository Structure

After pushing, your repo will have:
```
verify-app/
├── .github/workflows/
│   ├── backend.yml    # Backend CI/CD
│   └── frontend.yml   # Frontend CI/CD
├── backend/           # FastAPI backend
├── frontend/          # Next.js frontend
├── docker-compose.yml
├── init.sql
└── README.md
```

## Verify Deployment

1. Check the **Actions** tab in your GitHub repository to see CI/CD runs
2. Railway deploys provide a URL like `https://verify-backend.up.railway.app`
3. Vercel deploys provide a URL like `https://verify-app.vercel.app`

## Need Help?

If you encounter issues:
- Railway docs: https://docs.railway.app
- Vercel docs: https://vercel.com/docs
- GitHub Actions: https://docs.github.com/en/actions