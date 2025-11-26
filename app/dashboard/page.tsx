/**
 * Dashboard Page
 * Main user dashboard (protected route)
 * Requirement: 1.1, 1.3
 */

import Link from 'next/link';
import { requireAuth } from '@/components/auth';
import { getUserProfile } from '@/lib/supabase/auth-helpers';
import { LevelProgress } from '@/components/gamification/LevelProgress';
import { BadgeList } from '@/components/gamification/BadgeList';
import { DailyTaskList } from '@/components/tasks/DailyTaskList';

export default async function DashboardPage() {
  const user = await requireAuth();
  const profile = await getUserProfile();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {profile?.name || user.email}!
              </h1>
              <p className="text-gray-600">
                Your Daily 5 dashboard
              </p>
            </div>
            <Link
              href="/leaderboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              View Leaderboard
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Streak</div>
            <div className="text-3xl font-bold text-primary-600">
              {profile?.streak || 0} days
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Coins</div>
            <div className="text-3xl font-bold text-warning-600">
              {profile?.coins || 0}
            </div>
          </div>

          {/* Level Progress Component */}
          <LevelProgress xp={profile?.xp || 0} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <DailyTaskList />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Achievements</h2>
              <BadgeList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
