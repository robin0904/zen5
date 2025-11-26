-- Daily 5 (Zen5) Database Schema
-- Initial migration: Create all tables with constraints, indexes, and generated columns
-- Requirements: 11.1, 2.1

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
-- Stores user profiles with gamification stats
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  streak INTEGER DEFAULT 0 CHECK (streak >= 0),
  coins INTEGER DEFAULT 0 CHECK (coins >= 0),
  xp INTEGER DEFAULT 0 CHECK (xp >= 0),
  level INTEGER GENERATED ALWAYS AS (FLOOR(xp / 100) + 1) STORED,
  last_completion_date DATE,
  interests TEXT[] DEFAULT '{}',
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX idx_users_email ON users(email);

-- Index for admin queries
CREATE INDEX idx_users_is_admin ON users(is_admin) WHERE is_admin = TRUE;

-- Index for leaderboard queries
CREATE INDEX idx_users_coins ON users(coins DESC);
CREATE INDEX idx_users_streak ON users(streak DESC);

-- ============================================================================
-- TASKS TABLE
-- ============================================================================
-- Stores all available micro-tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL CHECK (LENGTH(description) <= 120),
  category TEXT NOT NULL CHECK (category IN ('learn', 'move', 'reflect', 'fun', 'skill', 'challenge')),
  duration_seconds INTEGER NOT NULL CHECK (duration_seconds BETWEEN 30 AND 120),
  tags TEXT[] DEFAULT '{}',
  difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  type TEXT NOT NULL CHECK (type IN ('learn', 'move', 'reflect', 'fun', 'skill', 'challenge')),
  completion_count INTEGER DEFAULT 0 CHECK (completion_count >= 0),
  affiliate_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for task selection queries
CREATE INDEX idx_tasks_type ON tasks(type);
CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_tasks_completion_count ON tasks(completion_count DESC);

-- Index for tag-based queries (GIN index for array operations)
CREATE INDEX idx_tasks_tags ON tasks USING GIN(tags);

-- ============================================================================
-- DAILY_USER_TASKS TABLE
-- ============================================================================
-- Stores daily task assignments for each user
CREATE TABLE daily_user_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  assigned_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  coins_earned INTEGER DEFAULT 0 CHECK (coins_earned >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, task_id, assigned_date)
);

-- Index for user's daily tasks lookup
CREATE INDEX idx_daily_user_tasks_user_date ON daily_user_tasks(user_id, assigned_date);

-- Index for completion queries
CREATE INDEX idx_daily_user_tasks_completed ON daily_user_tasks(user_id, completed);

-- ============================================================================
-- COMPLETIONS TABLE
-- ============================================================================
-- Stores historical record of all task completions
CREATE TABLE completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  coins_earned INTEGER NOT NULL CHECK (coins_earned >= 0),
  streak_at_completion INTEGER NOT NULL CHECK (streak_at_completion >= 0)
);

-- Index for user completion history
CREATE INDEX idx_completions_user_id ON completions(user_id, completed_at DESC);

-- Index for task popularity queries
CREATE INDEX idx_completions_task_id ON completions(task_id, completed_at DESC);

-- Index for recent completions (removed WHERE clause with NOW() to avoid IMMUTABLE error)
CREATE INDEX idx_completions_recent ON completions(completed_at DESC);

-- ============================================================================
-- BADGES TABLE
-- ============================================================================
-- Stores earned badges for users
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_name TEXT NOT NULL,
  badge_description TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_name)
);

-- Index for user badge queries
CREATE INDEX idx_badges_user_id ON badges(user_id, earned_at DESC);

-- ============================================================================
-- LEADERBOARD_SNAPSHOTS TABLE
-- ============================================================================
-- Stores historical leaderboard snapshots for weekly/monthly periods
CREATE TABLE leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL CHECK (rank > 0),
  coins INTEGER NOT NULL CHECK (coins >= 0),
  streak INTEGER NOT NULL CHECK (streak >= 0),
  period_type TEXT NOT NULL CHECK (period_type IN ('weekly', 'monthly')),
  period_end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for snapshot queries
CREATE INDEX idx_leaderboard_snapshots_period ON leaderboard_snapshots(period_type, period_end_date, rank);

-- Index for user historical rankings
CREATE INDEX idx_leaderboard_snapshots_user ON leaderboard_snapshots(user_id, period_end_date DESC);

-- ============================================================================
-- REFERRALS TABLE
-- ============================================================================
-- Stores user referral relationships
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(referred_id),
  CHECK (referrer_id != referred_id)
);

-- Index for referrer queries
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);

-- ============================================================================
-- REVENUE_TRACKING TABLE
-- ============================================================================
-- Stores all revenue transactions for community goal tracking
CREATE TABLE revenue_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  source TEXT NOT NULL CHECK (source IN ('stripe', 'affiliate', 'adsense')),
  transaction_id TEXT,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for revenue aggregation queries
CREATE INDEX idx_revenue_tracking_created_at ON revenue_tracking(created_at DESC);

-- Index for source-based queries
CREATE INDEX idx_revenue_tracking_source ON revenue_tracking(source);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to increment task completion count
CREATE OR REPLACE FUNCTION increment_task_completion_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed = TRUE AND (OLD.completed IS NULL OR OLD.completed = FALSE) THEN
    UPDATE tasks
    SET completion_count = completion_count + 1
    WHERE id = NEW.task_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update task completion count
CREATE TRIGGER update_task_completion_count
  AFTER UPDATE ON daily_user_tasks
  FOR EACH ROW
  EXECUTE FUNCTION increment_task_completion_count();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE users IS 'User profiles with gamification stats';
COMMENT ON TABLE tasks IS 'Available micro-tasks for daily selection';
COMMENT ON TABLE daily_user_tasks IS 'Daily task assignments for users';
COMMENT ON TABLE completions IS 'Historical record of task completions';
COMMENT ON TABLE badges IS 'User achievement badges';
COMMENT ON TABLE leaderboard_snapshots IS 'Historical leaderboard data';
COMMENT ON TABLE referrals IS 'User referral relationships';
COMMENT ON TABLE revenue_tracking IS 'Revenue transactions for community goals';

COMMENT ON COLUMN users.level IS 'Calculated as FLOOR(xp / 100) + 1';
COMMENT ON COLUMN tasks.description IS 'Max 120 characters';
COMMENT ON COLUMN tasks.duration_seconds IS 'Between 30 and 120 seconds';
COMMENT ON COLUMN tasks.difficulty IS 'Between 1 and 5';
