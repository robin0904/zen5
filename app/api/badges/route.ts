/**
 * Badges API Route
 * GET: Retrieve user's earned badges and progress
 * Requirement: 5.6
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/auth-helpers';
import { getUserBadges, getBadgeProgress } from '@/lib/gamification/badges';

export async function GET(request: Request) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const includeProgress = searchParams.get('progress') === 'true';

    if (includeProgress) {
      // Return badges with progress
      const progress = await getBadgeProgress(user.id);
      
      return NextResponse.json({
        badges: progress,
      });
    } else {
      // Return only earned badges
      const badges = await getUserBadges(user.id);
      
      return NextResponse.json({
        badges,
      });
    }

  } catch (error) {
    console.error('Error in badges route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
