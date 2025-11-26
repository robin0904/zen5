# 🚀 Daily 5 (Zen5) - Complete Deployment Guide

This guide will walk you through deploying your Daily 5 application to production using **Vercel** (frontend) and **Supabase** (backend/database).

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ A GitHub account
- ✅ Git installed on your computer
- ✅ Your Daily 5 code ready

## 🗂️ Step 1: Push Code to GitHub

### 1.1 Initialize Git Repository (if not already done)

```bash
cd c:\Users\rohan\Downloads\zen5
git init
git add .
git commit -m "Initial commit - Daily 5 application"
```

### 1.2 Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `daily-5` (or your preferred name)
3. Description: "A habit-forming web app that delivers 5 personalized micro-tasks daily"
4. Keep it **Public** or **Private** (your choice)
5. **Do NOT** initialize with README (we already have one)
6. Click "Create repository"

### 1.3 Push to GitHub

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/daily-5.git
git branch -M main
git push -u origin main
```

## 🗄️ Step 2: Set Up Supabase (Database & Auth)

### 2.1 Create Supabase Project

1. Go to https://supabase.com
2. Click "Start your project" or "New Project"
3. Sign in with GitHub
4. Click "New Project"
5. Fill in:
   - **Name**: `daily-5` or `zen5`
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free
6. Click "Create new project"
7. Wait 2-3 minutes for setup to complete

### 2.2 Run Database Migrations

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click "New query"
3. Copy the contents of `supabase/migrations/20240101000000_initial_schema.sql`
4. Paste into the SQL editor
5. Click "Run" (or press Ctrl+Enter)
6. Repeat for other migration files in order

### 2.3 Seed the Database

1. In SQL Editor, create a new query
2. Copy contents of `supabase/migrations/20240101000002_seed_tasks.sql`
3. Paste and run
4. Verify: Go to **Table Editor** → **tasks** → Should see 200+ tasks

### 2.4 Configure Authentication

1. Go to **Authentication** → **Providers** (left sidebar)
2. **Email** should already be enabled
3. For **Google OAuth** (optional but recommended):
   - Click on "Google"
   - Follow instructions to create Google OAuth credentials
   - Add authorized redirect URI: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - Enable the provider

### 2.5 Get Your Supabase Credentials

1. Go to **Project Settings** (gear icon, bottom left)
2. Click **API** in the left menu
3. Copy these values (you'll need them for Vercel):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGc...` (long string)
   - **service_role**: `eyJhbGc...` (different long string - keep this SECRET!)

## ☁️ Step 3: Deploy to Vercel

### 3.1 Create Vercel Account

1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub

### 3.2 Import Your Project

1. Click "Add New..." → "Project"
2. Find your `daily-5` repository
3. Click "Import"

### 3.3 Configure Project Settings

**Framework Preset**: Next.js (should auto-detect)

**Root Directory**: `./` (leave as is)

**Build Command**: `npm run build` (default)

**Output Directory**: `.next` (default)

### 3.4 Add Environment Variables

Click "Environment Variables" and add these **THREE** variables:

| Name | Value | Where to get it |
|------|-------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase → Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | Supabase → Settings → API → service_role |

**Important**: 
- Make sure to add all three variables
- Copy the FULL key (they're very long)
- The service_role key is SECRET - never commit it to GitHub

### 3.5 Deploy!

1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. You'll see "Congratulations!" when done
4. Click "Visit" to see your live site!

## 🔗 Step 4: Configure Supabase Redirect URLs

After deployment, you need to tell Supabase about your Vercel URL:

1. Copy your Vercel URL (e.g., `https://daily-5-xyz.vercel.app`)
2. Go to Supabase → **Authentication** → **URL Configuration**
3. Add to **Site URL**: `https://daily-5-xyz.vercel.app`
4. Add to **Redirect URLs**:
   - `https://daily-5-xyz.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (for local development)
5. Click "Save"

## ✅ Step 5: Test Your Deployment

### 5.1 Test Landing Page
1. Visit your Vercel URL
2. Verify landing page loads correctly
3. Check all sections display properly

### 5.2 Test Sign Up
1. Click "Get Started" or "Sign Up"
2. Create a new account with email/password
3. Check your email for verification (if enabled)
4. Verify you're redirected to dashboard

### 5.3 Test Core Features
1. **Dashboard**: Should load with stats (all zeros initially)
2. **Daily Tasks**: Should see 5 tasks assigned
3. **Complete a Task**: Click "Complete Task" button
   - Task should be marked as done
   - Coins/XP should increase
4. **Leaderboard**: Click "View Leaderboard"
   - Should see your user listed
5. **Badges**: Check Achievements section
   - Should show badge progress

## 🐛 Troubleshooting

### Build Fails on Vercel

**Error**: "Module not found" or "Cannot find module"
- **Solution**: Run `npm install` locally, commit `package-lock.json`, push to GitHub

**Error**: "Environment variable not found"
- **Solution**: Double-check all 3 environment variables are set in Vercel

### Authentication Not Working

**Error**: "Invalid redirect URL"
- **Solution**: Add your Vercel URL to Supabase redirect URLs (Step 4)

**Error**: "User not found" or "Invalid credentials"
- **Solution**: Check that migrations ran successfully in Supabase

### Tasks Not Loading

**Error**: "Failed to fetch tasks"
- **Solution**: 
  1. Check Supabase credentials in Vercel env vars
  2. Verify tasks were seeded (check Table Editor in Supabase)
  3. Check RLS policies are enabled

### Database Connection Issues

**Error**: "Connection refused" or "Unauthorized"
- **Solution**: 
  1. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
  2. Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the anon key (not service_role)
  3. Check RLS policies in Supabase

## 🔄 Making Updates

After deployment, to update your app:

```bash
# Make your changes locally
git add .
git commit -m "Description of changes"
git push origin main
```

Vercel will automatically detect the push and redeploy! ✨

## 📊 Monitoring

### Vercel Dashboard
- View deployment logs
- Check build status
- Monitor performance
- View analytics

### Supabase Dashboard
- Monitor database usage
- Check auth users
- View API logs
- Monitor storage

## 💰 Cost Breakdown

### Free Tier Limits

**Vercel Free Tier:**
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Custom domains

**Supabase Free Tier:**
- ✅ 500MB database
- ✅ 2GB bandwidth/month
- ✅ 50,000 monthly active users
- ✅ Unlimited API requests

**Total Cost**: $0/month for moderate usage! 🎉

## 🎯 Next Steps

After successful deployment:

1. **Custom Domain** (Optional)
   - Buy a domain (e.g., daily5.app)
   - Add to Vercel: Settings → Domains
   - Update Supabase redirect URLs

2. **Email Configuration** (Optional)
   - Configure custom SMTP in Supabase
   - Customize email templates

3. **Analytics** (Optional)
   - Add Vercel Analytics
   - Add Google Analytics
   - Monitor user behavior

4. **SEO** (Optional)
   - Add meta tags
   - Create sitemap
   - Submit to Google Search Console

## 🎉 Congratulations!

Your Daily 5 application is now LIVE and accessible to the world! 🚀

**Your URLs:**
- **Production**: `https://your-app.vercel.app`
- **Supabase Dashboard**: `https://app.supabase.com/project/your-project-ref`

Share your app and start building habits! 💪
