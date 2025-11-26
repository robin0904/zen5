/**
 * Task Completion Logic
 * Handles task completion, rewards, and streak management
 * Requirements: 4.2, 4.3, 4.4, 4.6
 */

import { createClient } from '@/lib/supabase/server';
import type { Task } from '@/lib/types';
import { checkAndAwardAllBadges } from '@/lib/gamification/badges';

// ============================================================================
// TYPES
// ============================================================================

export interface CompletionResult {
  success: boolean;
  coins_earned: number;
  xp_gained: number;
  streak_updated: boolean;
  new_streak: number;
  all_tasks_completed: boolean;
  new_badges?: string[];
  error?: string;
}

export interface UserStats {
  streak: number;
  coins: number;
  xp: number;
  level: number;
  last_completion_date: string | null;
}

// ============================================================================
// COIN CALCULATION
// ============================================================================

/**
 * Calculate coins earned for completing a task
 * Requirement 4.2: Coins = difficulty × 3
 */
export function calculateCoins(difficulty: number): number {
  if (difficulty < 1 || difficulty > 5) {
    throw new Error('Difficulty must be between 1 and 5');
  }
  return difficulty * 3;
}

// ============================================================================
// STREAK LOGIC
// ============================================================================

/**
 * Check if streak should be reset
 * Requirement 4.6: Reset if more than 24 hours since last completion
 */
export function shouldResetStreak(lastCompletionDate: string | null): boolean {
  if (!lastCompletionDate) {
    return false; // No previous completion, don't reset
  }

  const lastCompletion = new Date(lastCompletionDate);
  const now = new Date();
  
  // Calculate hours since last completion
  const hoursSince = (now.getTime() - lastCompletion.getTime()) / (1000 * 60 * 60);
  
  return hoursSince > 24;
}

/**
 * Check if all daily tasks are completed
 */
export async function checkAllTasksCompleted(
  userId: string,
  date: string = new Date().toISOString().split('T')[0]
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('daily_user_tasks')
    .select('completed')
    .eq('user_id', userId)
    .eq('assigned_date', date);

  if (error || !data) {
    console.error('Error checking task completion:', error);
    return false;
  }

  // Check if we have exactly 5 tasks and all are completed
  return data.length === 5 && data.every(task => task.completed);
}

/**
 * Update user streak
 * Requirement 4.4: Increment streak when all 5 tasks completed
 */
export async function updateStreak(userId: string): Promise<number> {
  const supabase = await createClient();

  // Get current user stats
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('streak, last_completion_date')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    console.error('Error getting user for streak update:', userError);
    return 0;
  }

  // Check if streak should be reset
  if (shouldResetStreak(user.last_completion_date)) {
    // Reset to 1 (this completion)
    const { error: updateError } = await supabase
      .from('users')
      .update({
        streak: 1,
        last_completion_date: new Date().toISOString().split('T')[0],
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error resetting streak:', updateError);
      return 0;
    }

    return 1;
  }

  // Check if this is a new day
  const today = new Date().toISOString().split('T')[0];
  const lastDate = user.last_completion_date;

  if (lastDate === today) {
    // Already completed today, don't increment
    return user.streak;
  }

  // Increment streak
  const newStreak = user.streak + 1;

  const { error: updateError } = await supabase
    .from('users')
    .update({
      streak: newStreak,
      last_completion_date: today,
    })
    .eq('id', userId);

  if (updateError) {
    console.error('Error updating streak:', updateError);
    return user.streak;
  }

  return newStreak;
}

// ============================================================================
// XP AND LEVEL LOGIC
// ============================================================================

/**
 * Calculate level from XP
 * Level = FLOOR(XP / 100) + 1
 */
export function calculateLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

/**
 * Update user XP
 * Requirement 4.3: XP increases by coins earned
 */
export async function updateXP(userId: string, coinsEarned: number): Promise<void> {
  const supabase = await createClient();

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('xp')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    console.error('Error getting user for XP update:', userError);
    return;
  }

  const newXP = user.xp + coinsEarned;

  const { error: updateError } = await supabase
    .from('users')
    .update({ xp: newXP })
    .eq('id', userId);

  if (updateError) {
    console.error('Error updating XP:', updateError);
  }
}

/**
 * Update user coins
 */
export async function updateCoins(userId: string, coinsEarned: number): Promise<void> {
  const supabase = await createClient();

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('coins')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    console.error('Error getting user for coins update:', userError);
    return;
  }

  const newCoins = user.coins + coinsEarned;

  const { error: updateError } = await supabase
    .from('users')
    .update({ coins: newCoins })
    .eq('id', userId);

  if (updateError) {
    console.error('Error updating coins:', updateError);
  }
}

// ============================================================================
// MAIN COMPLETION FUNCTION
// ============================================================================

/**
 * Complete a task and award rewards
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */
export async function completeTask(
  userId: string,
  taskId: string,
  date: string = new Date().toISOString().split('T')[0]
): Promise<CompletionResult> {
  const supabase = await createClient();

  try {
    // 1. Get the daily user task
    const { data: dailyTask, error: dailyTaskError } = await supabase
      .from('daily_user_tasks')
      .select('*, tasks(*)')
      .eq('user_id', userId)
      .eq('task_id', taskId)
      .eq('assigned_date', date)
      .single();

    if (dailyTaskError || !dailyTask) {
      return {
        success: false,
        coins_earned: 0,
        xp_gained: 0,
        streak_updated: false,
        new_streak: 0,
        all_tasks_completed: false,
        error: 'Task not found or not assigned to user',
      };
    }

    // Check if already completed
    if (dailyTask.completed) {
      return {
        success: false,
        coins_earned: 0,
        xp_gained: 0,
        streak_updated: false,
        new_streak: 0,
        all_tasks_completed: false,
        error: 'Task already completed',
      };
    }

    // 2. Calculate coins (Requirement 4.2)
    const task = dailyTask.tasks as Task;
    const coinsEarned = calculateCoins(task.difficulty);

    // 3. Mark task as completed in daily_user_tasks
    const { error: updateError } = await supabase
      .from('daily_user_tasks')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
        coins_earned: coinsEarned,
      })
      .eq('id', dailyTask.id);

    if (updateError) {
      console.error('Error updating daily task:', updateError);
      return {
        success: false,
        coins_earned: 0,
        xp_gained: 0,
        streak_updated: false,
        new_streak: 0,
        all_tasks_completed: false,
        error: 'Failed to update task completion',
      };
    }

    // 4. Award coins
    await updateCoins(userId, coinsEarned);

    // 5. Award XP (Requirement 4.3)
    await updateXP(userId, coinsEarned);

    // 6. Check if all tasks completed
    const allCompleted = await checkAllTasksCompleted(userId, date);

    // 7. Update streak if all tasks completed (Requirement 4.4)
    let newStreak = 0;
    let streakUpdated = false;

    if (allCompleted) {
      newStreak = await updateStreak(userId);
      streakUpdated = true;
    }

    // 8. Record completion in completions table (Requirement 4.5)
    const { data: currentUser } = await supabase
      .from('users')
      .select('streak')
      .eq('id', userId)
      .single();

    const { error: completionError } = await supabase
      .from('completions')
      .insert({
        user_id: userId,
        task_id: taskId,
        completed_at: new Date().toISOString(),
        coins_earned: coinsEarned,
        streak_at_completion: currentUser?.streak || 0,
      });

    if (completionError) {
      console.error('Error recording completion:', completionError);
    }

    // 9. Check and award badges
    const newBadges = await checkAndAwardAllBadges(userId);

    return {
      success: true,
      coins_earned: coinsEarned,
      xp_gained: coinsEarned,
      streak_updated: streakUpdated,
      new_streak: newStreak,
      all_tasks_completed: allCompleted,
      new_badges: newBadges.length > 0 ? newBadges : undefined,
    };

  } catch (error) {
    console.error('Error in completeTask:', error);
    return {
      success: false,
      coins_earned: 0,
      xp_gained: 0,
      streak_updated: false,
      new_streak: 0,
      all_tasks_completed: false,
      error: 'An unexpected error occurred',
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get user's current stats
 */
export async function getUserStats(userId: string): Promise<UserStats | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('users')
    .select('streak, coins, xp, level, last_completion_date')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error('Error getting user stats:', error);
    return null;
  }

  return data;
}

/**
 * Get completion count for today
 */
export async function getTodayCompletionCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('daily_user_tasks')
    .select('id')
    .eq('user_id', userId)
    .eq('assigned_date', today)
    .eq('completed', true);

  if (error || !data) {
    console.error('Error getting completion count:', error);
    return 0;
  }

  return data.length;
}

/**
 * Check and reset streak if needed (can be run as a cron job)
 * Requirement 4.6: Reset streak after 24 hours of inactivity
 */
export async function checkAndResetStreaks(): Promise<void> {
  const supabase = await createClient();

  // Get all users with active streaks
  const { data: users, error } = await supabase
    .from('users')
    .select('id, streak, last_completion_date')
    .gt('streak', 0);

  if (error || !users) {
    console.error('Error getting users for streak check:', error);
    return;
  }

  // Check each user
  for (const user of users) {
    if (shouldResetStreak(user.last_completion_date)) {
      await supabase
        .from('users')
        .update({ streak: 0 })
        .eq('id', user.id);
    }
  }
}
