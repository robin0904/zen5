
'use client';

import { useEffect, useState } from 'react';
import { LeaderboardEntry } from '@/lib/gamification/leaderboard';
import { LeaderboardRow } from './LeaderboardRow';

interface LeaderboardProps {
    currentUserId?: string;
}

export function Leaderboard({ currentUserId }: LeaderboardProps) {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLeaderboard() {
            try {
                const response = await fetch('/api/leaderboard');
                if (response.ok) {
                    const data = await response.json();
                    setEntries(data.leaderboard);
                }
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchLeaderboard();
    }, []);

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-gray-50 border-b flex justify-between text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="w-12 text-center">Rank</div>
                <div>User</div>
                <div>Score</div>
            </div>
            <div className="divide-y divide-gray-100">
                {entries.map((entry) => (
                    <LeaderboardRow
                        key={entry.id}
                        entry={entry}
                        isCurrentUser={entry.id === currentUserId}
                    />
                ))}

                {entries.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No users found yet. Be the first!
                    </div>
                )}
            </div>
        </div>
    );
}
