/**
 * Level Calculation Utilities
 * Handles level progression and XP requirements
 * Requirement: 5.1
 */

// ============================================================================
// LEVEL CALCULATION
// ============================================================================

/**
 * Calculate level from XP
 * Requirement 5.1: Level = FLOOR(XP / 100) + 1
 */
export function calculateLevel(xp: number): number {
  if (xp < 0) {
    return 1;
  }
  return Math.floor(xp / 100) + 1;
}

/**
 * Calculate XP required for a specific level
 */
export function xpForLevel(level: number): number {
  if (level <= 1) {
    return 0;
  }
  return (level - 1) * 100;
}

/**
 * Calculate XP required for next level
 */
export function xpForNextLevel(currentXP: number): number {
  const currentLevel = calculateLevel(currentXP);
  return xpForLevel(currentLevel + 1);
}

/**
 * Calculate XP remaining until next level
 */
export function xpUntilNextLevel(currentXP: number): number {
  const nextLevelXP = xpForNextLevel(currentXP);
  return nextLevelXP - currentXP;
}

/**
 * Calculate progress percentage to next level
 */
export function levelProgress(currentXP: number): number {
  const currentLevel = calculateLevel(currentXP);
  const currentLevelXP = xpForLevel(currentLevel);
  const nextLevelXP = xpForLevel(currentLevel + 1);
  const xpInCurrentLevel = currentXP - currentLevelXP;
  const xpNeededForLevel = nextLevelXP - currentLevelXP;
  
  return Math.round((xpInCurrentLevel / xpNeededForLevel) * 100);
}

/**
 * Get level information for display
 */
export interface LevelInfo {
  current_level: number;
  current_xp: number;
  xp_for_current_level: number;
  xp_for_next_level: number;
  xp_until_next_level: number;
  progress_percentage: number;
}

export function getLevelInfo(xp: number): LevelInfo {
  const currentLevel = calculateLevel(xp);
  
  return {
    current_level: currentLevel,
    current_xp: xp,
    xp_for_current_level: xpForLevel(currentLevel),
    xp_for_next_level: xpForNextLevel(xp),
    xp_until_next_level: xpUntilNextLevel(xp),
    progress_percentage: levelProgress(xp),
  };
}

/**
 * Level milestones and rewards
 */
export const LEVEL_MILESTONES = [
  { level: 5, title: 'Novice', description: 'Completed your first week!' },
  { level: 10, title: 'Apprentice', description: 'Building strong habits!' },
  { level: 15, title: 'Practitioner', description: 'Consistency is key!' },
  { level: 20, title: 'Expert', description: 'You are unstoppable!' },
  { level: 25, title: 'Master', description: 'True dedication!' },
  { level: 30, title: 'Legend', description: 'An inspiration to all!' },
] as const;

/**
 * Get milestone for a level
 */
export function getMilestone(level: number) {
  return LEVEL_MILESTONES.find(m => m.level === level);
}

/**
 * Check if level is a milestone
 */
export function isMilestone(level: number): boolean {
  return LEVEL_MILESTONES.some(m => m.level === level);
}
