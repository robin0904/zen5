
import { requireAuth } from '@/components/auth';
import { Leaderboard } from '@/components/gamification/Leaderboard';
import Link from 'next/link';

export default async function LeaderboardPage() {
    const user = await requireAuth();

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
                        <p className="text-gray-600">See who&apos;s leading the Daily 5 community</p>
                    </div>
                    <Link
                        href="/dashboard"
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>

                <Leaderboard currentUserId={user.id} />
            </div>
        </div>
    );
}
