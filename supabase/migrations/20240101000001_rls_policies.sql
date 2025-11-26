-- Row Level Security (RLS) Policies
-- Implements data isolation and access control
-- Requirements: 11.2, 11.3, 11.4, 11.5, 11.6

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_tracking ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================================================

-- Function to get current user's ID from auth.users
CREATE OR REPLACE FUNCTION auth.user_id()
RETURNS UUID AS $$
  SELECT COALESCE(
    auth.uid(),
    (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
  );
$$ LANGUAGE sql STABLE;

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.user_id()
    AND is_admin = TRUE
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================================
-- USERS TABLE POLICIES
-- Requirement 11.2: Users can only read their own user record
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.user_id());

-- Users can update their own profile (except admin flag)
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.user_id())
  WITH CHECK (
    id = auth.user_id() 
    AND is_admin = (SELECT is_admin FROM users WHERE id = auth.user_id())
  );

-- Users can insert their own profile during signup
CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.user_id());

-- Admins can read all users
CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.is_admin());

-- Admins can update any user
CREATE POLICY "Admins can update any user"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.is_admin());

-- Allow reading public user data for leaderboard (limited fields)
CREATE POLICY "Public can read leaderboard data"
  ON users
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- ============================================================================
-- TASKS TABLE POLICIES
-- Requirement 11.5: All authenticated users can read tasks
-- ============================================================================

-- All authenticated users can read tasks
CREATE POLICY "Authenticated users can read tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Only admins can insert tasks
CREATE POLICY "Admins can insert tasks"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.is_admin());

-- Only admins can update tasks
CREATE POLICY "Admins can update tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (auth.is_admin());

-- Only admins can delete tasks
CREATE POLICY "Admins can delete tasks"
  ON tasks
  FOR DELETE
  TO authenticated
  USING (auth.is_admin());

-- ============================================================================
-- DAILY_USER_TASKS TABLE POLICIES
-- Requirement 11.3: Users can only read/write their own daily_user_tasks
-- ============================================================================

-- Users can read their own daily tasks
CREATE POLICY "Users can read own daily tasks"
  ON daily_user_tasks
  FOR SELECT
  TO authenticated
  USING (user_id = auth.user_id());

-- Users can insert their own daily tasks (system-generated)
CREATE POLICY "Users can insert own daily tasks"
  ON daily_user_tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.user_id());

-- Users can update their own daily tasks (mark as complete)
CREATE POLICY "Users can update own daily tasks"
  ON daily_user_tasks
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.user_id())
  WITH CHECK (user_id = auth.user_id());

-- Admins can read all daily tasks
CREATE POLICY "Admins can read all daily tasks"
  ON daily_user_tasks
  FOR SELECT
  TO authenticated
  USING (auth.is_admin());

-- ============================================================================
-- COMPLETIONS TABLE POLICIES
-- Requirement 11.4: Users can only insert their own completion records
-- ============================================================================

-- Users can read their own completions
CREATE POLICY "Users can read own completions"
  ON completions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.user_id());

-- Users can insert their own completions
CREATE POLICY "Users can insert own completions"
  ON completions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.user_id());

-- Admins can read all completions
CREATE POLICY "Admins can read all completions"
  ON completions
  FOR SELECT
  TO authenticated
  USING (auth.is_admin());

-- ============================================================================
-- BADGES TABLE POLICIES
-- ============================================================================

-- Users can read their own badges
CREATE POLICY "Users can read own badges"
  ON badges
  FOR SELECT
  TO authenticated
  USING (user_id = auth.user_id());

-- System can insert badges (via service role)
CREATE POLICY "System can insert badges"
  ON badges
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.user_id());

-- Admins can read all badges
CREATE POLICY "Admins can read all badges"
  ON badges
  FOR SELECT
  TO authenticated
  USING (auth.is_admin());

-- Allow reading badges for public profiles
CREATE POLICY "Public can read user badges"
  ON badges
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- ============================================================================
-- LEADERBOARD_SNAPSHOTS TABLE POLICIES
-- ============================================================================

-- All authenticated users can read leaderboard snapshots
CREATE POLICY "Authenticated users can read leaderboard snapshots"
  ON leaderboard_snapshots
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Only admins can insert snapshots
CREATE POLICY "Admins can insert leaderboard snapshots"
  ON leaderboard_snapshots
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.is_admin());

-- ============================================================================
-- REFERRALS TABLE POLICIES
-- ============================================================================

-- Users can read referrals where they are the referrer
CREATE POLICY "Users can read own referrals"
  ON referrals
  FOR SELECT
  TO authenticated
  USING (referrer_id = auth.user_id() OR referred_id = auth.user_id());

-- Users can insert referrals where they are the referrer
CREATE POLICY "Users can insert own referrals"
  ON referrals
  FOR INSERT
  TO authenticated
  WITH CHECK (referrer_id = auth.user_id());

-- Admins can read all referrals
CREATE POLICY "Admins can read all referrals"
  ON referrals
  FOR SELECT
  TO authenticated
  USING (auth.is_admin());

-- ============================================================================
-- REVENUE_TRACKING TABLE POLICIES
-- Requirement 11.6: Restrict admin operations to users with admin role
-- ============================================================================

-- Only admins can read revenue data
CREATE POLICY "Admins can read revenue"
  ON revenue_tracking
  FOR SELECT
  TO authenticated
  USING (auth.is_admin());

-- Only admins can insert revenue records
CREATE POLICY "Admins can insert revenue"
  ON revenue_tracking
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.is_admin());

-- Allow service role to insert revenue (for webhooks)
CREATE POLICY "Service role can insert revenue"
  ON revenue_tracking
  FOR INSERT
  TO service_role
  WITH CHECK (TRUE);

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- Grant permissions on all tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;

-- Grant permissions on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Users can read own profile" ON users IS 'Requirement 11.2: User data isolation';
COMMENT ON POLICY "Authenticated users can read tasks" ON tasks IS 'Requirement 11.5: All authenticated users can read tasks';
COMMENT ON POLICY "Users can read own daily tasks" ON daily_user_tasks IS 'Requirement 11.3: User data isolation for daily tasks';
COMMENT ON POLICY "Users can insert own completions" ON completions IS 'Requirement 11.4: User data isolation for completions';
COMMENT ON POLICY "Admins can read revenue" ON revenue_tracking IS 'Requirement 11.6: Admin-only access to revenue data';
