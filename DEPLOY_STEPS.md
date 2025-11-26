# 🚀 Quick Deployment Steps - What You Need to Do

## ✅ DONE - Code is on GitHub!
Your code is now at: https://github.com/robin0904/zen5

---

## 📝 Step 1: Set Up Supabase (5 minutes)

### 1.1 Create Supabase Account
1. Go to: https://supabase.com
2. Click "Start your project"
3. Sign in with GitHub (use your robin0904 account)

### 1.2 Create New Project
1. Click "New Project"
2. Fill in:
   - **Name**: `zen5` or `daily-5`
   - **Database Password**: Create a strong password
     - **IMPORTANT**: Save this password somewhere safe!
   - **Region**: Choose closest to you (e.g., Southeast Asia)
3. Click "Create new project"
4. Wait 2-3 minutes

### 1.3 Run Database Setup
1. Once project is ready, click **SQL Editor** (left sidebar)
2. Click "New query"
3. Open this file on your computer: `c:\Users\rohan\Downloads\zen5\supabase\migrations\20240101000000_initial_schema.sql`
4. Copy ALL the content
5. Paste into Supabase SQL Editor
6. Click "Run" (or press Ctrl+Enter)
7. Should see "Success" message

### 1.4 Seed the Tasks
1. In SQL Editor, click "New query" again
2. Open: `c:\Users\rohan\Downloads\zen5\supabase\migrations\20240101000002_seed_tasks.sql`
3. Copy and paste
4. Click "Run"
5. Verify: Go to **Table Editor** → **tasks** → Should see 200+ tasks

### 1.5 Get Your Credentials
1. Click **Project Settings** (gear icon, bottom left)
2. Click **API** in the settings menu
3. **COPY THESE THREE VALUES** (you'll need them for Vercel):

```
Project URL: https://xxxxx.supabase.co
anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkc3d4c2tnamtpYmJ0Y3p2ZGxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNTYxNDMsImV4cCI6MjA3OTczMjE0M30.FfS05ePo8LwGOVgzcA9RFv_EVYOiFViCEwBSDeC1gbo (very long string)
service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkc3d4c2tnamtpYmJ0Y3p2ZGxqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDE1NjE0MywiZXhwIjoyMDc5NzMyMTQzfQ.JPshtGFf7dU2VK7RF6d0sr6aatdHRDlx01XSOFILnSE (different very long string)
```

**Save these in a text file!**

---

## ☁️ Step 2: Deploy to Vercel (3 minutes)

### 2.1 Create Vercel Account
1. Go to: https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Use your robin0904 GitHub account

### 2.2 Import Project
1. Click "Add New..." → "Project"
2. Find `robin0904/zen5` in the list
3. Click "Import"

### 2.3 Add Environment Variables
**CRITICAL STEP**: Before deploying, add these 3 environment variables:

Click "Environment Variables" and add:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Paste the Project URL from Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Paste the anon public key from Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Paste the service_role key from Supabase |

### 2.4 Deploy
1. Click "Deploy"
2. Wait 2-3 minutes
3. You'll see "Congratulations!" 🎉
4. Click "Visit" to see your live site!

---

## 🔗 Step 3: Connect Supabase to Vercel (1 minute)

After Vercel deployment:

1. Copy your Vercel URL (e.g., `https://zen5-xyz.vercel.app`)
2. Go back to Supabase
3. Go to **Authentication** → **URL Configuration**
4. In **Site URL**, paste your Vercel URL
5. In **Redirect URLs**, add:
   - `https://zen5-xyz.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback`
6. Click "Save"

---

## ✅ Step 4: Test Your App!

1. Visit your Vercel URL
2. Click "Get Started"
3. Sign up with an email
4. You should see your dashboard with 5 tasks!

---

## 🆘 If You Get Stuck

**Common Issues:**

1. **"Module not found" error in Vercel**
   - I can help fix this - just let me know!

2. **"Invalid redirect URL" when logging in**
   - Make sure you completed Step 3 (adding Vercel URL to Supabase)

3. **Tasks not loading**
   - Double-check the 3 environment variables in Vercel
   - Make sure you ran both SQL migrations in Supabase

4. **Build fails**
   - Share the error message with me and I'll help!

---

## 📞 Need Help?

Just tell me:
- Which step you're on
- What error you're seeing (if any)
- Screenshot if helpful

I'll help you troubleshoot! 🚀
