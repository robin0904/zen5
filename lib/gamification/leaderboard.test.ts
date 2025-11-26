
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getGlobalLeaderboard, getUserRank } from './leaderboard';

// Mock Supabase client
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockGt = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
    createClient: () => ({
        from: mockFrom,
    }),
}));

describe('Leaderboard Logic', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Setup chain mocks
        mockFrom.mockReturnValue({ select: mockSelect });
        mockSelect.mockReturnValue({ order: mockOrder, eq: mockEq, gt: mockGt });
        mockOrder.mockReturnValue({ limit: mockLimit });
        mockEq.mockReturnValue({ single: mockSingle });
    });

    it('should fetch global leaderboard', async () => {
        const mockData = [
            { id: '1', name: 'User 1', coins: 100, streak: 5, level: 2 },
            { id: '2', name: 'User 2', coins: 50, streak: 2, level: 1 },
        ];

        mockLimit.mockResolvedValue({ data: mockData, error: null });

        const result = await getGlobalLeaderboard(10);

        expect(result).toHaveLength(2);
        expect(result[0].rank).toBe(1);
        expect(result[1].rank).toBe(2);
        expect(result[0].name).toBe('User 1');
    });

    it('should calculate user rank', async () => {
        // Mock user data
        mockSingle.mockResolvedValue({ data: { coins: 50 }, error: null });

        // Mock count of users with more coins
        mockGt.mockResolvedValue({ count: 5, error: null });

        const rank = await getUserRank('user-123');

        expect(rank).toBe(6); // 5 users ahead + 1
    });

    it('should return null rank if user not found', async () => {
        mockSingle.mockResolvedValue({ data: null, error: 'User not found' });

        const rank = await getUserRank('user-123');

        expect(rank).toBeNull();
    });
});
