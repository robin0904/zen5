# Supabase Database Setup Guide

## ✅ Task 2 Complete: Database Schema and Security

The database schema and Row Level Security (RLS) policies have been created and are ready to deploy to your Supabase project.

## What Was Created

### 📁 Migration Files

1. **`supabase/migrations/20240101000000_initial_schema.sql`**
   - All 8 database tables with proper constraints
   - Indexes for query optimization
   - Generated columns (user level calculation)
   - Triggers for automatic updates
   - Foreign key relationships

2. **`supabase/migrations/20240101000001_rls_policies.sql`**
   - Row Level Security policies for all tables
   - User data isolation (Requirements 11.2, 11.3, 11.4)
   - Task read access for authenticated users (Requirement 11.5)
   - Admin-only operations (Requirement 11.6)
   - Helper functions for authentication

3. **`supabase/README.md`**
   - Comprehensive documentation
   - Setup instructions
   - Troubleshooting guide
   - Useful SQL queries

4. **`supabase/verify_setup.sql`**
   - Verification script to check setup
   - Validates tables, indexes, policies, and constraints

## Database Tables Created

| Table | Columns | Purpose |
|-------|---------|---------|
| **users** | 12 | User profiles with gamification stats (streak, coins, XP, level) |
| **tasks** | 10 | Available micro-tasks with validation constraints |
| **daily_user_tasks** | 7 | Daily task assignments per user |
| **completions** | 6 | Historical record of all task completions |
| **badges** | 5 | User achievement badges |
| **leaderboard_snapshots** | 7 | Historical leaderboard data (weekly/monthly) |
| **referrals** | 4 | User referral relationships |
| **revenue_tracking** | 6 | Revenue transactions for community goals |

## Key Features Implemented

### ✅ Data Validation
- Task descriptions limited to 120 characters
- Task duration between 30-120 seconds
- Task difficulty between 1-5
- Enum validation for categories and types
- Check constraints on all numeric fields

### ✅ Automatic Calculations
- User level auto-calculated: `FLOOR(xp / 100) + 1`
- Task completion count auto-incremented
- Timestamps auto-updated

### ✅ Query Optimization
- 15+ indexes for fast queries
- GIN index for tag-based searches
- Indexes for leaderboard queries
- Indexes for trending tasks (last 7 days)

### ✅ Row Level Security
- Users can only access their own data
- All authenticated users can read tasks
- Admins have full access
- Public leaderboard data accessible
- Service role for webhooks

## Setup Instructions

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **"New Project"**
3. Fill in:
   - **Name**: daily-5-app (or your choice)
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
4. Click **"Create new project"**
5. Wait 2-3 minutes for project to initialize

### Step 2: Run Database Migrations

#### Option A: Using Supabase Dashboard (Easiest)

1. In your Supabase project, go to **SQL Editor** (left sidebar)

2. **Run Initial Schema:**
   - Click **"New Query"**
   - Open `supabase/migrations/20240101000000_initial_schema.sql`
   - Copy all contents
   - Paste into SQL Editor
   - Click **"Run"** (or press Ctrl+Enter)
   - Wait for "Success" message

3. **Run RLS Policies:**
   - Click **"New Query"** again
   - Open `supabase/migrations/20240101000001_rls_policies.sql`
   - Copy all contents
   - Paste into SQL Editor
   - Click **"Run"**
   - Wait for "Success" message

4. **Verify Setup (Optional but Recommended):**
   - Click **"New Query"**
   - Open `supabase/verify_setup.sql`
   - Copy and paste contents
   - Click **"Run"**
   - Check that all checks show "✓ PASS"

#### Option B: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI globally
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project (get project ref from dashboard URL)
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### Step 3: Get Your Credentials

1. In Supabase dashboard, go to **Project Settings** (gear icon)
2. Click **API** in the left menu
3. Copy these values:

   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Long string starting with `eyJ...`
   - **service_role secret**: Long string starting with `eyJ...` (keep this secure!)

### Step 4: Update Environment Variables

1. In your project root, copy the example file:
   ```bash
   copy .env.example .env.local
   ```

2. Edit `.env.local` and add your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. Save the file

### Step 5: Verify Connection

You can verify your setup is working by running the development server:

```bash
npm run dev
```

Visit http://localhost:3000 - the app should load without errors.

## What's Next?

### ✅ Completed Tasks:
- Task 1: Next.js project initialized ✓
- Task 2: Database schema and security ✓

### 🔜 Next Task:
**Task 3: Create seed data with 200+ tasks**
- Generate seed data JSON file
- Create seed data loading script
- Load initial tasks into database

## Verification Checklist

After completing setup, verify:

- [ ] Supabase project created
- [ ] Initial schema migration ran successfully
- [ ] RLS policies migration ran successfully
- [ ] All 8 tables exist in database
- [ ] RLS is enabled on all tables
- [ ] Environment variables added to `.env.local`
- [ ] Development server starts without errors

## Troubleshooting

### "relation already exists"
- You've already run the migration
- Either drop the tables or skip this migration
- Or create a new Supabase project

### "permission denied for schema public"
- Make sure you're using the SQL Editor in Supabase dashboard
- Or use the service_role key if using CLI

### "syntax error at or near"
- Make sure you copied the entire SQL file
- Check for any copy/paste issues
- Try running in smaller chunks

### Can't connect to Supabase
- Check your environment variables are correct
- Make sure `.env.local` file exists
- Restart your development server after adding env vars
- Check Supabase project is not paused (free tier pauses after inactivity)

## Database Schema Diagram

```
users (id, email, name, streak, coins, xp, level*, ...)
  ↓
  ├─→ daily_user_tasks (user_id, task_id, assigned_date, completed)
  │     ↓
  │     └─→ tasks (id, title, description, category, difficulty, ...)
  │
  ├─→ completions (user_id, task_id, completed_at, coins_earned)
  │
  ├─→ badges (user_id, badge_name, earned_at)
  │
  ├─→ leaderboard_snapshots (user_id, rank, coins, period_type)
  │
  ├─→ referrals (referrer_id, referred_id)
  │
  └─→ revenue_tracking (amount, source, user_id)

* level is auto-calculated from xp
```

## Security Notes

⚠️ **Important Security Information:**

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Never expose `service_role` key** - Only use in server-side code
3. **Use `anon` key for client-side** - It's safe to expose
4. **RLS policies protect your data** - Even with anon key, users can only access their own data
5. **Test RLS policies** - Always verify policies work as expected

## Support Resources

- **Supabase Documentation**: https://supabase.com/docs
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security
- **SQL Editor**: https://supabase.com/docs/guides/database/overview

## Summary

✅ **Database schema created** with 8 tables, constraints, and indexes
✅ **Row Level Security implemented** for data isolation and access control
✅ **Verification script provided** to check setup
✅ **Documentation complete** with setup instructions and troubleshooting

Your database is ready for seed data! Proceed to Task 3 when ready.
