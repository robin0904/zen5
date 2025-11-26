
'use client';

import { useEffect, useState } from 'react';
import { BadgeDefinition } from '@/lib/gamification/badges';

interface BadgeListProps {
    userId: string; // Not strictly needed if we fetch from API which uses auth, but good for flexibility
}

interface BadgeWithProgress {
    badge: BadgeDefinition;
    earned: boolean;
    earned_at?: string;
    progress: number;
    progress_text?: string;
}

export function BadgeList() {
    const [badges, setBadges] = useState<BadgeWithProgress[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBadges() {
            try {
                const response = await fetch('/api/badges?progress=true');
                if (response.ok) {
                    const data = await response.json();
                    setBadges(data.badges);
                }
            } catch (error) {
                console.error('Failed to fetch badges:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchBadges();
    }, []);

    if (loading) {
        return <div className="animate-pulse h-24 bg-gray-100 rounded-lg"></div>;
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map((item) => (
                <div
                    key={item.badge.name}
                    className={`
            relative p-4 rounded-lg border flex flex-col items-center text-center transition-all
            ${item.earned
                            ? 'bg-white border-yellow-200 shadow-sm'
                            : 'bg-gray-50 border-gray-200 opacity-75 grayscale'
                        }
          `}
                >
                    <div className="text-4xl mb-2">{item.badge.icon}</div>
                    <h3 className="font-semibold text-sm mb-1">{item.badge.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{item.badge.description}</p>

                    {item.earned ? (
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            Earned
                        </span>
                    ) : (
                        <div className="w-full mt-auto">
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                                <div
                                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                                    style={{ width: `${item.progress}%` }}
                                ></div>
                            </div>
                            <span className="text-xs text-gray-400">{item.progress_text}</span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
