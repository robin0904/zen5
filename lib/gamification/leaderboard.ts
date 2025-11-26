
import { createClient } from '@/lib/supabase/server';

export interface LeaderboardEntry {
    rank: number;
    id: string;
    name: string;
    coins: number;
    streak: number;
    level: number;
    avatar_url?: string;
}

/**
 * Get the global leaderboard sorted by coins
 */
export async function getGlobalLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('users')
        .select('id, name, coins, streak, level, avatar_url')
        .order('coins', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }

    // Add rank to each entry
    return data.map((user, index) => ({
        rank: index + 1,
        id: user.id,
        name: user.name,
        coins: user.coins,
        streak: user.streak,
        level: user.level,
        avatar_url: user.avatar_url,
    }));
}

/**
 * Get a specific user's rank
 * Note: This can be expensive on large datasets without a dedicated rank column or materialized view.
 * For now, we'll fetch the count of users with more coins.
 */
export async function getUserRank(userId: string): Promise<number | null> {
    const supabase = createClient();

    // Get user's coins
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('coins')
        .eq('id', userId)
        .single();

    if (userError || !user) {
        return null;
    }

    // Count users with more coins
    const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gt('coins', user.coins);

    if (countError) {
        console.error('Error fetching user rank:', countError);
        return null;
    }

    // Rank is count + 1
    return (count || 0) + 1;
}
