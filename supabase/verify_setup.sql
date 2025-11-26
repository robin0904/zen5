-- Verification Script for Database Setup
-- Run this after applying migrations to verify everything is set up correctly

-- ============================================================================
-- CHECK TABLES EXIST
-- ============================================================================

SELECT 
  'Tables Check' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 8 THEN '✓ PASS'
    ELSE '✗ FAIL - Expected 8 tables'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name IN (
    'users', 'tasks', 'daily_user_tasks', 'completions',
    'badges', 'leaderboard_snapshots', 'referrals', 'revenue_tracking'
  );

-- ============================================================================
-- CHECK RLS IS ENABLED
-- ============================================================================

SELECT 
  'RLS Check' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 8 THEN '✓ PASS'
    ELSE '✗ FAIL - RLS not enabled on all tables'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true;

-- ============================================================================
-- CHECK INDEXES EXIST
-- ============================================================================

SELECT 
  'Indexes Check' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 15 THEN '✓ PASS'
    ELSE '✗ FAIL - Missing indexes'
  END as status
FROM pg_indexes
WHERE schemaname = 'public';

-- ============================================================================
-- CHECK RLS POLICIES EXIST
-- ============================================================================

SELECT 
  'RLS Policies Check' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 20 THEN '✓ PASS'
    ELSE '✗ FAIL - Missing RLS policies'
  END as status
FROM pg_policies
WHERE schemaname = 'public';

-- ============================================================================
-- CHECK CONSTRAINTS
-- ============================================================================

SELECT 
  'Constraints Check' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 20 THEN '✓ PASS'
    ELSE '✗ FAIL - Missing constraints'
  END as status
FROM information_schema.table_constraints
WHERE table_schema = 'public'
  AND constraint_type IN ('CHECK', 'FOREIGN KEY', 'UNIQUE');

-- ============================================================================
-- CHECK FUNCTIONS
-- ============================================================================

SELECT 
  'Functions Check' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 3 THEN '✓ PASS'
    ELSE '✗ FAIL - Missing functions'
  END as status
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname IN ('update_updated_at_column', 'increment_task_completion_count');

-- ============================================================================
-- CHECK TRIGGERS
-- ============================================================================

SELECT 
  'Triggers Check' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 2 THEN '✓ PASS'
    ELSE '✗ FAIL - Missing triggers'
  END as status
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- ============================================================================
-- DETAILED TABLE INFORMATION
-- ============================================================================

SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count,
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename = t.table_name) as index_count,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.table_name) as policy_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================================================
-- LIST ALL RLS POLICIES
-- ============================================================================

SELECT 
  tablename,
  policyname,
  cmd as operation,
  CASE 
    WHEN roles::text LIKE '%authenticated%' THEN 'authenticated'
    WHEN roles::text LIKE '%service_role%' THEN 'service_role'
    ELSE roles::text
  END as role
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- SUMMARY
-- ============================================================================

SELECT 
  '=== DATABASE SETUP VERIFICATION COMPLETE ===' as summary;

SELECT 
  'If all checks show ✓ PASS, your database is ready!' as next_steps
UNION ALL
SELECT 
  'Next: Load seed data (Task 3)' as next_steps;
