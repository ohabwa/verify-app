# Verify API - Deployment Guide

This guide walks you through deploying the Verify API to Railway (backend) and Vercel (frontend).

## Prerequisites

- GitHub account with the verify-app repository
- Railway account (https://railway.app)
- Vercel account (https://vercel.com)
- Supabase account for PostgreSQL (https://supabase.com) or Railway PostgreSQL

---

## Step 1: Create External Services

### 1.1 PostgreSQL Database (Supabase)

1. Go to https://supabase.com and create a new project
2. Note your connection string from Settings → Database:
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
   ```
3. Run the `init.sql` schema in the Supabase SQL editor

### 1.2 Redis (Redis Cloud)

1. Go to https://redis.com and create a free account
2. Create a subscription with Redis Stack (free tier)
3. Note your connection string:
   ```
   redis://default:[PASSWORD]@[HOST]:6379/0
   ```

---

## Step 2: Deploy Backend to Railway

### 2.1 Connect GitHub Repository

1. Go to https://railway.app and sign in
2. Click **Add New** → **Project from GitHub**
3. Select your `verify-app` repository
4. Railway will detect the Dockerfile in `/backend`

### 2.2 Configure Root Directory

1. In Railway project settings, set **Root Directory** to `backend`

### 2.3 Add Environment Variables

In Railway project variables, add:

| Variable | Value | Note |
|----------|-------|------|
| `DATABASE_URL` | `postgresql://...` | From Supabase |
| `REDIS_URL` | `redis://...` | From Redis Cloud |
| `SECRET_KEY` | `your-32-char-minimum-secret` | Generate randomly |
| `CORS_ORIGINS` | `https://verify-app.vercel.app` | Your Vercel URL |
| `APP_NAME` | `Verify API` | Optional |
| `APP_VERSION` | `0.1.0` | Optional |

### 2.4 Deploy

1. Click **Deploy** and wait for the build to complete
2. Note your backend URL (e.g., `https://verify-api.up.railway.app`)

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Connect GitHub Repository

1. Go to https://vercel.com and sign in
2. Click **Add New** → **Project**
3. Import your `verify-app` repository
4. Set **Root Directory** to `frontend`

### 3.2 Configure Environment Variables

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | Your Railway backend URL (e.g., `https://verify-api.up.railway.app`) |

### 3.3 Deploy

1. Click **Deploy** and wait for the build to complete
2. Note your frontend URL (e.g., `https://verify-app.vercel.app`)

---

## Step 4: Update Railway CORS

After deploying frontend, update Railway CORS_ORIGINS:
```
CORS_ORIGINS=https://verify-app.vercel.app,https://verify-app.vercel.app
```

---

## Step 5: Set Up GitHub Actions Secrets

For CI/CD automation:

1. Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:

### Railway Deployment
- `RAILWAY_TOKEN` - Get from https://railway.app/account

### Vercel Deployment  
- `VERCEL_TOKEN` - Get from https://vercel.com/account/tokens
- `VERCEL_ORG_ID` - Found in Vercel team settings
- `VERCEL_PROJECT_ID` - Found in Vercel project settings

---

## Step 6: Verify Deployment

### Test Backend API

```bash
curl https://your-railway-url.up.railway.app/v1/health
```

### Test Text Verification

```bash
curl -X POST https://your-railway-url.up.railway.app/v1/verify/text \
  -H "X-API-Key: verify_your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"text": "Your test text here"}'
```

---

## Environment Variables Reference

### Backend (.env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `REDIS_URL` | Yes | - | Redis connection string |
| `SECRET_KEY` | Yes | - | JWT signing key (min 32 chars) |
| `API_KEY_HEADER` | No | `X-API-Key` | API key header name |
| `APP_NAME` | No | `Verify API` | Application name |
| `APP_VERSION` | No | `0.1.0` | Version string |
| `CORS_ORIGINS` | No | `*` | Comma-separated allowed origins |
| `RATE_LIMIT_STARTER` | No | `100` | Starter tier requests/minute |
| `RATE_LIMIT_PRO` | No | `1000` | Pro tier requests/minute |

### Frontend (.env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | - | Backend API URL |
| `API_URL` | No | `http://localhost:8000` | Backend URL for server |

---

## Troubleshooting

### Backend Issues

**Health check failing:**
- Check logs in Railway dashboard
- Verify DATABASE_URL and REDIS_URL are correct
- Ensure database migrations ran (init.sql)

**CORS errors:**
- Update CORS_ORIGINS with your frontend URL
- Format: `https://your-frontend.vercel.app`

**Rate limit not working:**
- Verify REDIS_URL is correct
- Check Redis Cloud connection is active

### Frontend Issues

**API calls failing:**
- Verify NEXT_PUBLIC_API_URL points to Railway backend
- Check browser console for CORS errors
- Ensure backend is running

**Build failing:**
- Check Vercel build logs
- Verify NODE_VERSION is 18+ in package.json

### GitHub Actions Issues

**Workflow not running:**
- Check Actions tab for errors
- Verify secrets are configured
- Check branch names match workflow triggers

---

## Production Checklist

- [ ] PostgreSQL database with init.sql schema applied
- [ ] Redis Cloud connection active
- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] CORS_ORIGINS updated with frontend URL
- [ ] GitHub Actions secrets configured
- [ ] API key generated and tested
- [ ] Health check endpoint responding
- [ ] Text verification working end-to-end

---

## Infrastructure Costs

| Service | Tier | Cost |
|---------|------|------|
| Supabase PostgreSQL | Free | $0 |
| Redis Cloud | Free | $0 |
| Railway (2 services) | Starter | ~$5/mo |
| Vercel | Hobby | $0 |

Total: ~$5/month for staging