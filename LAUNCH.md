# Launch Guide - Deploy Verify API in 15 Minutes

This guide helps you deploy the Verify API to the internet. No technical knowledge required - just follow the steps.

## What You Need (Free Accounts)

| Service | Why | Sign Up |
|---------|-----|---------|
| GitHub | Hosts the code | github.com |
| Railway | Runs the backend | railway.app |
| Vercel | Runs the frontend | vercel.com |
| Supabase | PostgreSQL database | supabase.com |
| Redis Cloud | Rate limiting cache | redis.com |

---

## Step 1: Push Code to GitHub

If you haven't already pushed the code to GitHub, do this first:

1. Go to **https://github.com/new**
2. Create a repo named `verify-app` (public)
3. On your computer, run:
   ```bash
   cd /home/team/shared/verify-app
   git remote add origin https://github.com/YOUR_USERNAME/verify-app.git
   git push -u origin master
   ```

---

## Step 2: Create Supabase Database

1. Go to **https://supabase.com** and sign up
2. Click **New Project** → **New database**
3. Wait for it to load, then click **Settings** → **Database**
4. Find your connection string (it looks like):
   ```
   postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
   ```
5. Copy this string - you'll paste it in Step 4

---

## Step 3: Create Redis Cache

1. Go to **https://redis.com** and sign up
2. Click **New Subscription** → **Redis Stack** (free tier)
3. Wait for it to load, then click your database
4. Find your connection string (it looks like):
   ```
   redis://default:[PASSWORD]@[HOST]:6379/0
   ```
5. Copy this string - you'll paste it in Step 4

---

## Step 4: Deploy Backend to Railway

1. Go to **https://railway.app** and sign up
2. Click **Add New** → **Project from GitHub**
3. Select the `verify-app` repository
4. Railway will ask for the root directory - enter `backend`
5. Click **Add Variables** and add these:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Paste your Supabase connection string |
| `REDIS_URL` | Paste your Redis connection string |
| `SECRET_KEY` | `verify-production-secret-key-change-me-32chars` |
| `CORS_ORIGINS` | `*` |

6. Click **Deploy Project**
7. Wait 2-3 minutes for deployment
8. When done, click on the deployment and copy the **URL** (e.g., `https://verify-api.up.railway.app`)

---

## Step 5: Deploy Frontend to Vercel

1. Go to **https://vercel.com** and sign up
2. Click **Add New** → **Project**
3. Import your `verify-app` GitHub repo
4. Set **Root Directory** to `frontend`
5. Add one environment variable:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | Your Railway backend URL (e.g., `https://verify-api.up.railway.app`) |

6. Click **Deploy**
7. Wait 2-3 minutes for deployment
8. When done, you'll see your frontend URL (e.g., `https://verify-app.vercel.app`)

---

## Step 6: Update CORS (Important!)

1. Go back to Railway → your project → **Settings** → **Variables**
2. Edit `CORS_ORIGINS` and replace `*` with your Vercel URL:
   ```
   https://verify-app.vercel.app
   ```
3. Click **Deploy** again to restart with new settings

---

## Step 7: Test Your Deployment

Open your browser and test these URLs (replace with your actual URLs):

### Health Check
```
https://your-railway-url.up.railway.app/v1/health
```
Should return: `{"status": "healthy", ...}`

### API Key Creation
```bash
curl -X POST https://your-railway-url.up.railway.app/v1/keys \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Key", "tier": "starter"}'
```
Should return: `{"id": "...", "key": "verify_...", ...}`

### Text Verification
```bash
curl -X POST https://your-railway-url.up.railway.app/v1/verify/text \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"text": "This is a test message to verify if the API is working properly."}'
```
Should return: `{"ai_probability": 0.XX, "confidence": "high", ...}`

---

## What If Something Went Wrong?

### Railway deployment failed
- Check the logs in Railway dashboard
- Make sure DATABASE_URL and REDIS_URL are correct
- Verify Supabase and Redis are still active

### Frontend shows "Cannot connect to API"
- Make sure CORS_ORIGINS is updated with your Vercel URL
- Make sure NEXT_PUBLIC_API_URL points to Railway (with https://)

### API returns errors
- Health check failing? Check Railway logs
- Key creation failing? Check database connection

---

## Congratulations! 🎉

Your Verify API is now live on the internet!

**Frontend URL:** `https://verify-app.vercel.app` (or your URL)
**Backend URL:** `https://verify-api.up.railway.app` (or your URL)

You can:
- Open the frontend to use the dashboard
- Use the backend API with your API key
- Share your API with others

---

## Clean Up (Optional)

To avoid charges, you can:
- Delete the Railway project
- Delete the Vercel project
- Delete the Supabase project
- Delete the Redis subscription

All are free to create and delete.