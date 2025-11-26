/**
 * Task Selection Engine
 * Selects 5 daily tasks per user based on algorithm
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

import { createClient } from '@/lib/supabase/server';
import type { Task } from '@/lib/types';

// ============================================================================
// TYPES
// ============================================================================

export interface TaskSelectionResult {
  tasks: Task[];
  breakdown: {
    interest_based: Task[];
    random: Task[];
    trending: Task[];
    challenge: Task[];
  };
}

// ============================================================================
// MAIN SELECTION FUNCTION
// ============================================================================

/**
 * Select 5 daily tasks for a user
 * Requirement 3.1: Generate exactly 5 tasks
 * Requirements 3.2-3.5: 2 interest-based, 1 random, 1 trending, 1 challenge
 */
export async function selectDailyTasks(
  userId: string,
  date: string = new Date().toISOString().split('T')[0]
): Promise<TaskSelectionResult> {
  const supabase = createClient();
  
  // Get user interests
  const { data: user } = await supabase
    .from('users')
    .select('interests')
    .eq('id', userId)
    .single();

  const interests = user?.interests || [];
  const selectedTaskIds = new Set<string>();
  const breakdown = {
    interest_based: [] as Task[],
    random: [] as Task[],
    trending: [] as Task[],
    challenge: [] as Task[],
  };

  // 1. Select 2 interest-based tasks (Requirement 3.2)
  const interestTasks = await selectInterestBasedTasks(interests, 2, selectedTaskIds);
  breakdown.interest_based = interestTasks;
  interestTasks.forEach(task => selectedTaskIds.add(task.id));

  // 2. Select 1 random task (Requirement 3.3)
  const randomTasks = await selectRandomTasks(1, selectedTaskIds);
  breakdown.random = randomTasks;
  randomTasks.forEach(task => selectedTaskIds.add(task.id));

  // 3. Select 1 trending task (Requirement 3.4)
  const trendingTasks = await selectTrendingTasks(1, selectedTaskIds);
  breakdown.trending = trendingTasks;
  trendingTasks.forEach(task => selectedTaskIds.add(task.id));

  // 4. Select 1 challenge task (Requirement 3.5)
  const challengeTasks = await selectChallengeTasks(1, selectedTaskIds);
  breakdown.challenge = challengeTasks;
  challengeTasks.forEach(task => selectedTaskIds.add(task.id));

  // Combine all tasks
  const allTasks = [
    ...interestTasks,
    ...randomTasks,
    ...trendingTasks,
    ...challengeTasks,
  ];

  // Ensure we have exactly 5 tasks
  // If we're short, fill with random tasks
  if (allTasks.length < 5) {
    const needed = 5 - allTasks.length;
    const fillerTasks = await selectRandomTasks(needed, selectedTaskIds);
    allTasks.push(...fillerTasks);
    breakdown.random.push(...fillerTasks);
  }

  return {
    tasks: allTasks.slice(0, 5), // Ensure exactly 5
    breakdown,
  };
}

// ============================================================================
// SELECTION FUNCTIONS
// ============================================================================

/**
 * Select interest-based tasks
 * Requirement 3.2: Choose tasks matching user interest tags
 */
export async function selectInterestBasedTasks(
  interests: string[],
  count: number,
  excludeIds: Set<string>
): Promise<Task[]> {
  const supabase = createClient();

  // If no interests, return random tasks
  if (interests.length === 0) {
    return selectRandomTasks(count, excludeIds);
  }

  try {
    // Query tasks that have overlapping tags with user interests
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .overlaps('tags', interests)
      .not('id', 'in', `(${Array.from(excludeIds).join(',') || 'null'})`)
      .limit(count * 3); // Get more to randomize from

    if (error) {
      console.error('Error selecting interest-based tasks:', error);
      return selectRandomTasks(count, excludeIds);
    }

    if (!data || data.length === 0) {
      // Fallback to random if no matches
      return selectRandomTasks(count, excludeIds);
    }

    // Shuffle and take requested count
    const shuffled = shuffleArray(data);
    return shuffled.slice(0, count);
  } catch (error) {
    console.error('Error in selectInterestBasedTasks:', error);
    return selectRandomTasks(count, excludeIds);
  }
}

/**
 * Select random tasks
 * Requirement 3.3: Choose 1 random task from any category
 */
export async function selectRandomTasks(
  count: number,
  excludeIds: Set<string>
): Promise<Task[]> {
  const supabase = createClient();

  try {
    const excludeArray = Array.from(excludeIds);
    let query = supabase
      .from('tasks')
      .select('*')
      .limit(count * 5); // Get more for better randomization

    if (excludeArray.length > 0) {
      query = query.not('id', 'in', `(${excludeArray.join(',')})`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error selecting random tasks:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Shuffle and take requested count
    const shuffled = shuffleArray(data);
    return shuffled.slice(0, count);
  } catch (error) {
    console.error('Error in selectRandomTasks:', error);
    return [];
  }
}

/**
 * Select trending tasks
 * Requirement 3.4: Choose task with most completions in last 7 days
 */
export async function selectTrendingTasks(
  count: number,
  excludeIds: Set<string>
): Promise<Task[]> {
  const supabase = createClient();

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get tasks with completion counts from last 7 days
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        completions!inner(created_at)
      `)
      .gte('completions.created_at', sevenDaysAgo.toISOString())
      .not('id', 'in', `(${Array.from(excludeIds).join(',') || 'null'})`)
      .order('completion_count', { ascending: false })
      .limit(count * 2);

    if (error) {
      console.error('Error selecting trending tasks:', error);
      return selectRandomTasks(count, excludeIds);
    }

    if (!data || data.length === 0) {
      // Fallback to tasks with highest overall completion count
      const { data: fallbackData } = await supabase
        .from('tasks')
        .select('*')
        .not('id', 'in', `(${Array.from(excludeIds).join(',') || 'null'})`)
        .order('completion_count', { ascending: false })
        .limit(count);

      return fallbackData || [];
    }

    // Remove duplicate tasks (due to multiple completions)
    const uniqueTasks = Array.from(
      new Map(data.map(task => [task.id, task])).values()
    );

    return uniqueTasks.slice(0, count);
  } catch (error) {
    console.error('Error in selectTrendingTasks:', error);
    return selectRandomTasks(count, excludeIds);
  }
}

/**
 * Select challenge tasks
 * Requirement 3.5: Choose 1 challenge-type task
 */
export async function selectChallengeTasks(
  count: number,
  excludeIds: Set<string>
): Promise<Task[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('type', 'challenge')
      .not('id', 'in', `(${Array.from(excludeIds).join(',') || 'null'})`)
      .limit(count * 3);

    if (error) {
      console.error('Error selecting challenge tasks:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Shuffle and take requested count
    const shuffled = shuffleArray(data);
    return shuffled.slice(0, count);
  } catch (error) {
    console.error('Error in selectChallengeTasks:', error);
    return [];
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Check if tasks have already been assigned for today
 */
export async function hasTasksForToday(
  userId: string,
  date: string = new Date().toISOString().split('T')[0]
): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('daily_user_tasks')
    .select('id')
    .eq('user_id', userId)
    .eq('assigned_date', date)
    .limit(1);

  if (error) {
    console.error('Error checking existing tasks:', error);
    return false;
  }

  return (data?.length || 0) > 0;
}

/**
 * Get user's daily tasks for a specific date
 */
export async function getDailyTasks(
  userId: string,
  date: string = new Date().toISOString().split('T')[0]
): Promise<Task[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('daily_user_tasks')
    .select(`
      *,
      tasks (*)
    `)
    .eq('user_id', userId)
    .eq('assigned_date', date);

  if (error) {
    console.error('Error getting daily tasks:', error);
    return [];
  }

  return data?.map(dut => dut.tasks).filter(Boolean) || [];
}
