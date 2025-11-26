/**
 * Dashboard Page
 * Main user dashboard (protected route)
 * Requirement: 1.1, 1.3
 */

import { requireAuth } from '@/components/auth';
import { getUserProfile } from '@/lib/supabase/auth-helpers';

export default async function DashboardPage() {
  const user = await requireAuth();
  const profile = await getUserProfile();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.name || user.email}!
          </h1>
          <p className="text-gray-600">
            Your Daily 5 dashboard
          </p>
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

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Level</div>
            <div className="text-3xl font-bold text-success-600">
              {profile?.level || 1}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Your Daily Tasks</h2>
          <p className="text-gray-600">
            Task selection and completion features coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
