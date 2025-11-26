
import { LeaderboardEntry } from '@/lib/gamification/leaderboard';

interface LeaderboardRowProps {
    entry: LeaderboardEntry;
    isCurrentUser: boolean;
}

export function LeaderboardRow({ entry, isCurrentUser }: LeaderboardRowProps) {
    return (
        <div
            className={`
        flex items-center p-4 border-b last:border-b-0 transition-colors
        ${isCurrentUser ? 'bg-indigo-50' : 'hover:bg-gray-50'}
      `}
        >
            <div className="w-12 flex-shrink-0 text-center font-bold text-gray-500">
                #{entry.rank}
            </div>

            <div className="flex items-center flex-grow">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-4 overflow-hidden">
                    {entry.avatar_url ? (
                        <img src={entry.avatar_url} alt={entry.name} className="h-full w-full object-cover" />
                    ) : (
                        <span className="text-lg font-semibold">{entry.name.charAt(0).toUpperCase()}</span>
                    )}
                </div>

                <div>
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                        {entry.name}
                        {isCurrentUser && (
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                                You
                            </span>
                        )}
                    </div>
                    <div className="text-xs text-gray-500">
                        Level {entry.level} • {entry.streak} day streak
                    </div>
                </div>
            </div>

            <div className="text-right font-bold text-gray-900">
                {entry.coins.toLocaleString()} <span className="text-xs font-normal text-gray-500">coins</span>
            </div>
        </div>
    );
}
