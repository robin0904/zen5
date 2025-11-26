# Database Schema Quick Reference

## Tables Overview

### users
User profiles with gamification statistics.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | User identifier |
| email | TEXT | UNIQUE, NOT NULL | User email address |
| name | TEXT | NOT NULL | Display name |
| avatar_url | TEXT | | Profile picture URL |
| streak | INTEGER | DEFAULT 0, >= 0 | Consecutive days completed |
| coins | INTEGER | DEFAULT 0, >= 0 | Total coins earned |
| xp | INTEGER | DEFAULT 0, >= 0 | Experience points |
| level | INTEGER | GENERATED | FLOOR(xp / 100) + 1 |
| last_completion_date | DATE | | Last time all 5 tasks completed |
| interests | TEXT[] | DEFAULT '{}' | User interest tags |
| is_admin | BOOLEAN | DEFAULT FALSE | Admin flag |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Account creation time |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_users_email` on email
- `idx_users_is_admin` on is_admin (WHERE is_admin = TRUE)
- `idx_users_coins` on coins DESC
- `idx_users_streak` on streak DESC

---

### tasks
Available micro-tasks for daily selection.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Task identifier |
| title | TEXT | NOT NULL | Task title |
| description | TEXT | NOT NULL, <= 120 chars | Task description |
| category | TEXT | NOT NULL, ENUM | learn, move, reflect, fun, skill, challenge |
| duration_seconds | INTEGER | NOT NULL, 30-120 | Estimated duration |
| tags | TEXT[] | DEFAULT '{}' | Tags for matching |
| difficulty | INTEGER | NOT NULL, 1-5 | Difficulty level |
| type | TEXT | NOT NULL, ENUM | Same as category |
| completion_count | INTEGER | DEFAULT 0, >= 0 | Times completed |
| affiliate_link | TEXT | | Optional affiliate URL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |

**Indexes:**
- `idx_tasks_type` on type
- `idx_tasks_category` on category
- `idx_tasks_completion_count` on completion_count DESC
- `idx_tasks_tags` on tags (GIN index)

---

### daily_user_tasks
Daily task assignments for users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Assignment identifier |
| user_id | UUID | NOT NULL, FK → users | User reference |
| task_id | UUID | NOT NULL, FK → tasks | Task reference |
| assigned_date | DATE | NOT NULL | Date assigned |
| completed | BOOLEAN | DEFAULT FALSE | Completion status |
| completed_at | TIMESTAMPTZ | | Completion timestamp |
| coins_earned | INTEGER | DEFAULT 0, >= 0 | Coins from completion |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Assignment time |

**Constraints:**
- UNIQUE(user_id, task_id, assigned_date)

**Indexes:**
- `idx_daily_user_tasks_user_date` on (user_id, assigned_date)
- `idx_daily_user_tasks_completed` on (user_id, completed)

---

### completions
Historical record of all task completions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Completion identifier |
| user_id | UUID | NOT NULL, FK → users | User reference |
| task_id | UUID | NOT NULL, FK → tasks | Task reference |
| completed_at | TIMESTAMPTZ | DEFAULT NOW() | Completion time |
| coins_earned | INTEGER | NOT NULL, >= 0 | Coins awarded |
| streak_at_completion | INTEGER | NOT NULL, >= 0 | User's streak at time |

**Indexes:**
- `idx_completions_user_id` on (user_id, completed_at DESC)
- `idx_completions_task_id` on (task_id, completed_at DESC)
- `idx_completions_recent` on completed_at DESC (WHERE completed_at > NOW() - INTERVAL '7 days')

---

### badges
User achievement badges.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Badge identifier |
| user_id | UUID | NOT NULL, FK → users | User reference |
| badge_name | TEXT | NOT NULL | Badge name |
| badge_description | TEXT | NOT NULL | Badge description |
| earned_at | TIMESTAMPTZ | DEFAULT NOW() | Time earned |

**Constraints:**
- UNIQUE(user_id, badge_name)

**Indexes:**
- `idx_badges_user_id` on (user_id, earned_at DESC)

**Badge Types:**
- "3-Day Warrior" - 3-day streak
- "Week Champion" - 7-day streak
- "Task Master" - 30 completions
- "Coin Collector" - 100 coins

---

### leaderboard_snapshots
Historical leaderboard data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Snapshot identifier |
| user_id | UUID | NOT NULL, FK → users | User reference |
| rank | INTEGER | NOT NULL, > 0 | User's rank |
| coins | INTEGER | NOT NULL, >= 0 | Coins at snapshot |
| streak | INTEGER | NOT NULL, >= 0 | Streak at snapshot |
| period_type | TEXT | NOT NULL, ENUM | weekly, monthly |
| period_end_date | DATE | NOT NULL | Period end date |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Snapshot time |

**Indexes:**
- `idx_leaderboard_snapshots_period` on (period_type, period_end_date, rank)
- `idx_leaderboard_snapshots_user` on (user_id, period_end_date DESC)

---

### referrals
User referral relationships.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Referral identifier |
| referrer_id | UUID | NOT NULL, FK → users | Referrer user |
| referred_id | UUID | NOT NULL, FK → users | Referred user |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Referral time |

**Constraints:**
- UNIQUE(referred_id)
- CHECK(referrer_id != referred_id)

**Indexes:**
- `idx_referrals_referrer_id` on referrer_id

---

### revenue_tracking
Revenue transactions for community goals.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Transaction identifier |
| amount | DECIMAL(10,2) | NOT NULL, > 0 | Transaction amount |
| source | TEXT | NOT NULL, ENUM | stripe, affiliate, adsense |
| transaction_id | TEXT | | External transaction ID |
| user_id | UUID | FK → users | User reference (nullable) |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Transaction time |

**Indexes:**
- `idx_revenue_tracking_created_at` on created_at DESC
- `idx_revenue_tracking_source` on source

---

## Relationships

```
users (1) ──→ (many) daily_user_tasks
users (1) ──→ (many) completions
users (1) ──→ (many) badges
users (1) ──→ (many) leaderboard_snapshots
users (1) ──→ (many) referrals (as referrer)
users (1) ──→ (1) referrals (as referred)
users (1) ──→ (many) revenue_tracking

tasks (1) ──→ (many) daily_user_tasks
tasks (1) ──→ (many) completions
```

## Triggers

### update_users_updated_at
- **Table**: users
- **Event**: BEFORE UPDATE
- **Action**: Sets updated_at to NOW()

### update_task_completion_count
- **Table**: daily_user_tasks
- **Event**: AFTER UPDATE
- **Action**: Increments tasks.completion_count when completed = TRUE

## Functions

### update_updated_at_column()
Updates the updated_at timestamp on row update.

### increment_task_completion_count()
Increments task completion count when a daily task is marked complete.

### auth.user_id()
Returns the current authenticated user's UUID.

### auth.is_admin()
Returns TRUE if current user has is_admin = TRUE.

## RLS Policies Summary

### users
- Users can read/update own profile
- Admins can read/update all users
- Public can read leaderboard data

### tasks
- All authenticated users can read
- Only admins can insert/update/delete

### daily_user_tasks
- Users can read/write own daily tasks
- Admins can read all

### completions
- Users can read/insert own completions
- Admins can read all

### badges
- Users can read own badges
- System can insert badges
- Public can read for profiles

### leaderboard_snapshots
- All authenticated users can read
- Only admins can insert

### referrals
- Users can read own referrals
- Users can insert own referrals
- Admins can read all

### revenue_tracking
- Only admins can read/insert
- Service role can insert (webhooks)

## Common Queries

### Get user with stats
```sql
SELECT id, name, email, streak, coins, xp, level
FROM users
WHERE id = 'user-uuid';
```

### Get user's daily tasks
```sql
SELECT t.*, dut.completed, dut.assigned_date
FROM daily_user_tasks dut
JOIN tasks t ON t.id = dut.task_id
WHERE dut.user_id = 'user-uuid'
  AND dut.assigned_date = CURRENT_DATE;
```

### Get leaderboard (top 100)
```sql
SELECT 
  ROW_NUMBER() OVER (ORDER BY coins DESC) as rank,
  id, name, coins, streak, level
FROM users
ORDER BY coins DESC
LIMIT 100;
```

### Get trending tasks (last 7 days)
```sql
SELECT t.*, COUNT(c.id) as recent_completions
FROM tasks t
LEFT JOIN completions c ON c.task_id = t.id
  AND c.completed_at > NOW() - INTERVAL '7 days'
GROUP BY t.id
ORDER BY recent_completions DESC
LIMIT 10;
```

### Get user badges
```sql
SELECT badge_name, badge_description, earned_at
FROM badges
WHERE user_id = 'user-uuid'
ORDER BY earned_at DESC;
```

### Calculate total revenue
```sql
SELECT SUM(amount) as total_revenue
FROM revenue_tracking;
```

## Data Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| task.description | <= 120 chars | "Description too long" |
| task.duration_seconds | 30-120 | "Duration must be 30-120 seconds" |
| task.difficulty | 1-5 | "Difficulty must be 1-5" |
| task.category | ENUM | "Invalid category" |
| user.streak | >= 0 | "Streak cannot be negative" |
| user.coins | >= 0 | "Coins cannot be negative" |
| user.xp | >= 0 | "XP cannot be negative" |

## Performance Notes

- Use indexes for all foreign key lookups
- GIN index on tasks.tags for fast array searches
- Partial index on completions for recent data
- Generated column for user.level (no computation needed)
- Triggers update denormalized data automatically
