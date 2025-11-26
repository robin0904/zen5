/**
 * Data Model Interfaces
 * TypeScript interfaces for all application data models
 * Requirement: 2.1
 */

// ============================================================================
// USER MODEL
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  streak: number;
  coins: number;
  xp: number;
  level: number; // Generated: FLOOR(xp / 100) + 1
  last_completion_date: string | null; // ISO date string
  interests: string[];
  is_admin: boolean;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

export interface UserProfile extends User {
  // Extended user profile with computed fields
  total_completions?: number;
  badges_count?: number;
  rank?: number;
}

// ============================================================================
// TASK MODEL
// ============================================================================

export type TaskCategory = 'learn' | 'move' | 'reflect' | 'fun' | 'skill' | 'challenge';
export type TaskType = TaskCategory; // Same as category
export type TaskDifficulty = 1 | 2 | 3 | 4 | 5;

export interface Task {
  id: string;
  title: string;
  description: string; // Max 120 characters
  category: TaskCategory;
  duration_seconds: number; // 30-120 seconds
  tags: string[];
  difficulty: TaskDifficulty; // 1-5
  type: TaskType;
  completion_count: number;
  affiliate_link: string | null;
  created_at: string; // ISO datetime string
}

export interface TaskWithCompletion extends Task {
  // Task with user's completion status
  completed?: boolean;
  completed_at?: string | null;
  coins_earned?: number;
}

// ============================================================================
// DAILY USER TASK MODEL
// ============================================================================

export interface DailyUserTask {
  id: string;
  user_id: string;
  task_id: string;
  assigned_date: string; // ISO date string (YYYY-MM-DD)
  completed: boolean;
  completed_at: string | null; // ISO datetime string
  coins_earned: number;
  created_at: string; // ISO datetime string
}

export interface DailyUserTaskWithTask extends DailyUserTask {
  // Daily task with full task details
  task: Task;
}

// ============================================================================
// COMPLETION MODEL
// ============================================================================

export interface Completion {
  id: string;
  user_id: string;
  task_id: string;
  completed_at: string; // ISO datetime string
  coins_earned: number;
  streak_at_completion: number;
}

export interface CompletionWithTask extends Completion {
  // Completion with task details
  task: Task;
}

// ============================================================================
// BADGE MODEL
// ============================================================================

export type BadgeName = 
  | '3-Day Warrior'
  | 'Week Champion'
  | 'Task Master'
  | 'Coin Collector';

export interface Badge {
  id: string;
  user_id: string;
  badge_name: BadgeName | string;
  badge_description: string;
  earned_at: string; // ISO datetime string
}

// ============================================================================
// LEADERBOARD MODEL
// ============================================================================

export type LeaderboardPeriod = 'weekly' | 'monthly' | 'all-time';

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  name: string;
  avatar_url: string | null;
  coins: number;
  streak: number;
  level: number;
  is_current_user?: boolean;
}

export interface LeaderboardSnapshot {
  id: string;
  user_id: string;
  rank: number;
  coins: number;
  streak: number;
  period_type: 'weekly' | 'monthly';
  period_end_date: string; // ISO date string
  created_at: string; // ISO datetime string
}

// ============================================================================
// REFERRAL MODEL
// ============================================================================

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  created_at: string; // ISO datetime string
}

export interface ReferralWithUsers extends Referral {
  referrer: Pick<User, 'id' | 'name' | 'email'>;
  referred: Pick<User, 'id' | 'name' | 'email'>;
}

// ============================================================================
// REVENUE TRACKING MODEL
// ============================================================================

export type RevenueSource = 'stripe' | 'affiliate' | 'adsense';

export interface RevenueTracking {
  id: string;
  amount: number; // Decimal(10,2)
  source: RevenueSource;
  transaction_id: string | null;
  user_id: string | null;
  created_at: string; // ISO datetime string
}

// ============================================================================
// SHARE CARD MODEL
// ============================================================================

export interface ShareCard {
  username: string;
  streak: number;
  completions_today: number;
  top_badge: string | null;
  qr_code_url: string;
}

// ============================================================================
// ANALYTICS MODELS
// ============================================================================

export interface DailyStats {
  date: string; // ISO date string
  active_users: number;
  total_completions: number;
  total_coins_earned: number;
}

export interface TaskPopularity {
  task_id: string;
  task_title: string;
  completion_count: number;
  category: TaskCategory;
}

export interface UserActivity {
  user_id: string;
  name: string;
  email: string;
  streak: number;
  coins: number;
  last_active: string | null;
  total_completions: number;
}

// ============================================================================
// API RESPONSE MODELS
// ============================================================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ============================================================================
// FORM MODELS
// ============================================================================

export interface TaskFormData {
  title: string;
  description: string;
  category: TaskCategory;
  duration_seconds: number;
  tags: string[];
  difficulty: TaskDifficulty;
  type: TaskType;
  affiliate_link?: string;
}

export interface UserProfileFormData {
  name: string;
  interests: string[];
  avatar_url?: string;
}

// ============================================================================
// VALIDATION MODELS
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
