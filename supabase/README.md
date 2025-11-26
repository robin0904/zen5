# Supabase Database Setup

This directory contains database migrations for the Daily 5 (Zen5) application.

## Migrations

### 20240101000000_initial_schema.sql
Creates all database tables with:
- Users table with gamification stats
- Tasks table with validation constraints
- Daily user tasks assignments
- Completions history
- Badges system
- Leaderboard snapshots
- Referrals tracking
- Revenue tracking

**Features:**
- UUID primary keys
- Check constraints for data validation
- Indexes for query optimization
- Generated columns (user level)
- Triggers for automatic updates
- Foreign key relationships with CASCADE

### 20240101000001_rls_policies.sql
Implements Row Level Security (RLS) policies:
- User data isolation (Requirement 11.2, 11.3, 11.4)
- Task read access for all authenticated users (Requirement 11.5)
- Admin-only operations (Requirement 11.6)
- Helper functions for authentication checks

## Setup Instructions

### Option 1: Using Supabase Dashboard (Recommended for beginners)

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Fill in project details
   - Wait for project to be ready

2. **Run Migrations**
   - Go to SQL Editor in your Supabase dashboard
   - Copy contents of `20240101000000_initial_schema.sql`
   - Paste and run
   - Copy contents of `20240101000001_rls_policies.sql`
   - Paste and run

3. **Get Your Credentials**
   - Go to Project Settings > API
   - Copy:
     - Project URL
     - `anon` public key
     - `service_role` secret key (keep this secure!)

4. **Update Your .env.local**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

### Option 2: Using Supabase CLI (Advanced)

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **Link to Your Project**
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. **Push Migrations**
   ```bash
   supabase db push
   ```

## Database Schema Overview

### Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `users` | User profiles and stats | Generated level column, gamification fields |
| `tasks` | Available micro-tasks | Validation constraints, tag arrays |
| `daily_user_tasks` | Daily assignments | Unique constraint per user/task/date |
| `completions` | Historical records | Indexed for analytics |
| `badges` | User achievements | Unique per user/badge |
| `leaderboard_snapshots` | Historical rankings | Weekly/monthly periods |
| `referrals` | User referrals | Unique referred users |
| `revenue_tracking` | Revenue transactions | For community goals |

### Key Constraints

- **Task description**: Max 120 characters
- **Task duration**: 30-120 seconds
- **Task difficulty**: 1-5
- **Task type/category**: Enum values (learn, move, reflect, fun, skill, challenge)
- **User level**: Auto-calculated as `FLOOR(xp / 100) + 1`

### Indexes

Optimized for:
- User lookups by email
- Leaderboard queries (coins, streak)
- Task selection (type, category, tags)
- Completion history
- Trending tasks (last 7 days)

## Row Level Security (RLS)

### User Data Isolation
- Users can only read/write their own data
- Admins can access all data

### Task Access
- All authenticated users can read tasks
- Only admins can create/update/delete tasks

### Public Data
- Leaderboard data is readable by all authenticated users
- User badges are readable for public profiles

## Testing RLS Policies

After running migrations, you can test RLS policies:

```sql
-- Test as regular user
SET request.jwt.claims = '{"sub": "user-uuid-here"}';

-- Should return only user's own data
SELECT * FROM users WHERE id = 'user-uuid-here';

-- Should return all tasks
SELECT * FROM tasks;

-- Should return only user's daily tasks
SELECT * FROM daily_user_tasks;
```

## Troubleshooting

### "relation does not exist"
- Make sure you ran the initial schema migration first
- Check that you're connected to the correct database

### "permission denied"
- RLS policies are active
- Make sure you're authenticated
- Check that your user ID matches the data you're trying to access

### "violates check constraint"
- Data doesn't meet validation rules
- Check constraint definitions in schema file

## Next Steps

After setting up the database:
1. Load seed data (Task 3)
2. Set up Supabase client utilities (Task 4)
3. Build authentication system (Task 5)

## Useful SQL Queries

### Check table sizes
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### View all RLS policies
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

### Count records in all tables
```sql
SELECT 
  'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'daily_user_tasks', COUNT(*) FROM daily_user_tasks
UNION ALL
SELECT 'completions', COUNT(*) FROM completions
UNION ALL
SELECT 'badges', COUNT(*) FROM badges;
```

## Security Notes

⚠️ **Important:**
- Never commit your `service_role` key to version control
- Use `anon` key for client-side operations
- Use `service_role` key only in server-side code
- RLS policies are your primary security layer
- Always test RLS policies before deploying

## Support

For issues with:
- **Supabase**: Check [Supabase Docs](https://supabase.com/docs)
- **PostgreSQL**: Check [PostgreSQL Docs](https://www.postgresql.org/docs/)
- **RLS**: Check [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
