
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateLevel, xpForLevel, xpForNextLevel, levelProgress } from './levels';
import { checkBadgeEarned, BADGE_DEFINITIONS } from './badges';

// Mock Supabase client
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}));

describe('Gamification Logic', () => {
  describe('Level System', () => {
    it('should calculate level correctly', () => {
      expect(calculateLevel(0)).toBe(1);
      expect(calculateLevel(50)).toBe(1);
      expect(calculateLevel(99)).toBe(1);
      expect(calculateLevel(100)).toBe(2);
      expect(calculateLevel(150)).toBe(2);
      expect(calculateLevel(200)).toBe(3);
    });

    it('should calculate XP for level correctly', () => {
      expect(xpForLevel(1)).toBe(0);
      expect(xpForLevel(2)).toBe(100);
      expect(xpForLevel(3)).toBe(200);
    });

    it('should calculate XP for next level correctly', () => {
      expect(xpForNextLevel(0)).toBe(100);
      expect(xpForNextLevel(50)).toBe(100);
      expect(xpForNextLevel(100)).toBe(200);
    });

    it('should calculate level progress correctly', () => {
      expect(levelProgress(0)).toBe(0);
      expect(levelProgress(50)).toBe(50); // 50/100
      expect(levelProgress(100)).toBe(0); // New level
      expect(levelProgress(150)).toBe(50); // 50/100 into level 2
    });
  });

  describe('Badge System', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      
      // Setup chain mocks
      mockFrom.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ eq: mockEq, single: mockSingle }); // Handle multiple .eq calls
    });

    it('should check 3-Day Warrior badge', async () => {
      const badgeName = '3-Day Warrior';
      
      // Mock user with 3 day streak
      mockSingle.mockResolvedValue({ data: { streak: 3 }, error: null });
      
      const result = await checkBadgeEarned('user-123', badgeName);
      expect(result).toBe(true);
    });

    it('should fail 3-Day Warrior badge if streak < 3', async () => {
      const badgeName = '3-Day Warrior';
      
      // Mock user with 2 day streak
      mockSingle.mockResolvedValue({ data: { streak: 2 }, error: null });
      
      const result = await checkBadgeEarned('user-123', badgeName);
      expect(result).toBe(false);
    });

    it('should check Coin Collector badge', async () => {
      const badgeName = 'Coin Collector';
      
      // Mock user with 100 coins
      mockSingle.mockResolvedValue({ data: { coins: 100 }, error: null });
      
      const result = await checkBadgeEarned('user-123', badgeName);
      expect(result).toBe(true);
    });
  });
});
