# 🚀 Railway Deployment Guide

This guide will help you deploy your Market Sizing Prep backend to Railway with a PostgreSQL database.

## Prerequisites

1. **GitHub Account** - Your code needs to be in a GitHub repository
2. **Railway Account** - Sign up at [railway.app](https://railway.app)
3. **Credit Card** - Railway requires payment info (but has generous free tier)

## Step 1: Push Code to GitHub

If you haven't already, push your backend code to GitHub:

```bash
cd backend
git add .
git commit -m "Prepare backend for Railway deployment"
git push origin main
```

## Step 2: Deploy to Railway

### 2.1 Create New Project
1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `market-sizing-prep` repository
5. Select the `backend` folder as the root directory

### 2.2 Add PostgreSQL Database
1. In your Railway project dashboard, click "New Service"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically create a database and provide connection details

### 2.3 Configure Environment Variables
In your Railway project, go to "Variables" and add:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your-super-secure-jwt-secret-here
CORS_ORIGIN=*
```

**Important**: Replace `your-super-secure-jwt-secret-here` with a strong random string.

### 2.4 Deploy
1. Railway will automatically build and deploy your app
2. Wait for deployment to complete (usually 2-3 minutes)
3. You'll get a public URL like `https://your-app-name.railway.app`

## Step 3: Run Database Migrations

After deployment, you need to set up your database schema:

1. In Railway dashboard, go to your backend service
2. Click "Deploy Logs" to see if there are any errors
3. The database should auto-migrate on first deploy

## Step 4: Seed Initial Data

To add your sample questions to the production database:

1. In Railway, go to your backend service settings
2. Under "Environment", add a one-time variable: `SEED_DB=true`
3. Redeploy the service
4. Remove the `SEED_DB` variable after seeding completes

## Step 5: Test Your API

Your API will be available at: `https://your-app-name.railway.app`

Test these endpoints:
- `GET /health` - Should return `{"status": "OK"}`
- `POST /api/auth/register` - Create a test user
- `GET /api/questions/random` - Get a random question

## Step 6: Get Your Production URL

1. In Railway dashboard, copy your app's public URL
2. This is what you'll use in your React Native app
3. Example: `https://market-sizing-prep-production.railway.app`

## 🎯 Next Steps

Once deployed:
1. ✅ Update your React Native app to use the production API URL
2. ✅ Test user registration/login from your mobile app
3. ✅ Verify data persistence across app sessions

## 💰 Costs

Railway pricing:
- **Hobby Plan**: $5/month (includes PostgreSQL + API hosting)
- **Pro Plan**: $20/month (for higher usage)
- Free tier available for testing

## 🔧 Troubleshooting

**Build Fails?**
- Check deploy logs in Railway dashboard
- Ensure all dependencies are in `package.json`

**Database Connection Issues?**
- Verify `DATABASE_URL` is set to `${{Postgres.DATABASE_URL}}`
- Check if migrations ran successfully

**API Not Responding?**
- Check health endpoint: `https://your-url.railway.app/health`
- Review application logs in Railway dashboard

## 📊 Monitoring

Railway provides:
- Real-time logs
- Performance metrics
- Uptime monitoring
- Database connection stats

Access these in your Railway project dashboard.
