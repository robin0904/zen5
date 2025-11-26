
import { NextResponse } from 'next/server';
import { getGlobalLeaderboard } from '@/lib/gamification/leaderboard';

export const dynamic = 'force-dynamic'; // Ensure fresh data

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '100');

        const leaderboard = await getGlobalLeaderboard(limit);

        return NextResponse.json({ leaderboard });
    } catch (error) {
        console.error('Error in leaderboard API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
