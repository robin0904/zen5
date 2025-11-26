/**
 * Badge Award System
 * Handles badge checking and awarding
 * Requirements: 5.2, 5.3, 5.4, 5.5, 5.6
 */

import { createClient } from '@/lib/supabase/server';

// ============================================================================
// BADGE DEFINITIONS
// ============================================================================

export interface BadgeDefinition {
  name: string;
  description: string;
  icon: string;
  requirement: string;
  checkFunction: (userId: string) => Promise<boolean>;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    name: '3-Day Warrior',
    description: 'Completed all tasks for 3 days in a row',
    icon: '🔥',
    requirement: '3-day streak',
    checkFunction: async (userId: string) => {
      const supabase = createClient();
      const { data } = await supabase
        .from('users')
        .select('streak')
        .eq('id', userId)
        .single();
      return (data?.streak || 0) >= 3;
    },
  },
  {
    name: 'Week Champion',
    description: 'Completed all tasks for 7 days in a row',
    icon: '👑',
    requirement: '7-day streak',
    checkFunction: async (userId: string) => {
      const supabase = createClient();
      const { data } = await supabase
        .from('users')
        .select('streak')
        .eq('id', userId)
        .single();
      return (data?.streak || 0) >= 7;
    },
  },
  {
    name: 'Task Master',
    description: 'Completed 30 tasks in total',
    icon: '⭐',
    requirement: '30 completions',
    checkFunction: async (userId: string) => {
      const supabase = createClient();
      const { data, count } = await supabase
        .from('completions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      return (count || 0) >= 30;
    },
  },
  {
    name: 'Coin Collector',
    description: 'Earned 100 coins in total',
    icon: '💰',
    requirement: '100 coins',
    checkFunction: async (userId: string) => {
      const supabase = createClient();
      const { data } = await supabase
        .from('users')
        .select('coins')
        .eq('id', userId)
        .single();
      return (data?.coins || 0) >= 100;
    },
  },
];

// ============================================================================
// BADGE CHECKING
// ============================================================================

/**
 * Check if user has earned a specific badge
 * Requirement 5.2-5.5: Check streak and completion milestones
 */
export async function checkBadgeEarned(
  userId: string,
  badgeName: string
): Promise<boolean> {
  const badge = BADGE_DEFINITIONS.find(b => b.name === badgeName);
  
  if (!badge) {
    return false;
  }

  return await badge.checkFunction(userId);
}

/**
 * Check if user already has a badge
 */
export async function hasBadge(userId: string, badgeName: string): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('badges')
    .select('id')
    .eq('user_id', userId)
    .eq('badge_name', badgeName)
    .single();

  if (error || !data) {
    return false;
  }

  return true;
}

/**
 * Award a badge to a user
 * Requirement 5.6: Add badge to badges table
 */
export async function awardBadge(
  userId: string,
  badgeName: string
): Promise<boolean> {
  // Check if badge exists
  const badge = BADGE_DEFINITIONS.find(b => b.name === badgeName);
  
  if (!badge) {
    console.error(`Badge not found: ${badgeName}`);
    return false;
  }

  // Check if user already has this badge
  const alreadyHas = await hasBadge(userId, badgeName);
  
  if (alreadyHas) {
    return false; // Already has badge
  }

  // Check if user has earned the badge
  const earned = await checkBadgeEarned(userId, badgeName);
  
  if (!earned) {
    return false; // Hasn't earned it yet
  }

  // Award the badge
  const supabase = createClient();

  const { error } = await supabase
    .from('badges')
    .insert({
      user_id: userId,
      badge_name: badgeName,
      badge_description: badge.description,
    });

  if (error) {
    console.error('Error awarding badge:', error);
    return false;
  }

  return true;
}

/**
 * Check and award all eligible badges for a user
 */
export async function checkAndAwardAllBadges(userId: string): Promise<string[]> {
  const newBadges: string[] = [];

  for (const badge of BADGE_DEFINITIONS) {
    const awarded = await awardBadge(userId, badge.name);
    if (awarded) {
      newBadges.push(badge.name);
    }
  }

  return newBadges;
}

/**
 * Get all badges for a user
 */
export async function getUserBadges(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (error) {
    console.error('Error getting user badges:', error);
    return [];
  }

  return data || [];
}

/**
 * Get badge progress for a user
 */
export interface BadgeProgress {
  badge: BadgeDefinition;
  earned: boolean;
  earned_at?: string;
  progress?: number;
  progress_text?: string;
}

export async function getBadgeProgress(userId: string): Promise<BadgeProgress[]> {
  const supabase = createClient();

  // Get user stats
  const { data: user } = await supabase
    .from('users')
    .select('streak, coins')
    .eq('id', userId)
    .single();

  // Get completion count
  const { count: completionCount } = await supabase
    .from('completions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // Get earned badges
  const earnedBadges = await getUserBadges(userId);
  const earnedBadgeNames = new Set(earnedBadges.map(b => b.badge_name));

  const progress: BadgeProgress[] = [];

  for (const badge of BADGE_DEFINITIONS) {
    const earned = earnedBadgeNames.has(badge.name);
    const earnedBadge = earnedBadges.find(b => b.badge_name === badge.name);

    let progressValue = 0;
    let progressText = '';

    // Calculate progress based on badge type
    if (badge.name === '3-Day Warrior') {
      const streak = user?.streak || 0;
      progressValue = Math.min((streak / 3) * 100, 100);
      progressText = `${streak}/3 days`;
    } else if (badge.name === 'Week Champion') {
      const streak = user?.streak || 0;
      progressValue = Math.min((streak / 7) * 100, 100);
      progressText = `${streak}/7 days`;
    } else if (badge.name === 'Task Master') {
      const count = completionCount || 0;
      progressValue = Math.min((count / 30) * 100, 100);
      progressText = `${count}/30 tasks`;
    } else if (badge.name === 'Coin Collector') {
      const coins = user?.coins || 0;
      progressValue = Math.min((coins / 100) * 100, 100);
      progressText = `${coins}/100 coins`;
    }

    progress.push({
      badge,
      earned,
      earned_at: earnedBadge?.earned_at,
      progress: earned ? 100 : progressValue,
      progress_text: progressText,
    });
  }

  return progress;
}

/**
 * Get badge definition by name
 */
export function getBadgeDefinition(badgeName: string): BadgeDefinition | undefined {
  return BADGE_DEFINITIONS.find(b => b.name === badgeName);
}

/**
 * Get all badge definitions
 */
export function getAllBadgeDefinitions(): BadgeDefinition[] {
  return BADGE_DEFINITIONS;
}
