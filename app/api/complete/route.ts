/**
 * Task Completion API Route
 * POST: Complete a task and award rewards
 * Requirements: 4.1, 4.5
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/auth-helpers';
import { completeTask } from '@/lib/tasks/completion-logic';

export async function POST(request: Request) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { task_id, date } = body;

    if (!task_id) {
      return NextResponse.json(
        { error: 'task_id is required' },
        { status: 400 }
      );
    }

    // Complete the task
    const result = await completeTask(
      user.id,
      task_id,
      date || new Date().toISOString().split('T')[0]
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to complete task' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      coins_earned: result.coins_earned,
      xp_gained: result.xp_gained,
      streak_updated: result.streak_updated,
      new_streak: result.new_streak,
      all_tasks_completed: result.all_tasks_completed,
      message: result.all_tasks_completed
        ? '🎉 All tasks completed! Streak updated!'
        : '✅ Task completed!',
    });

  } catch (error) {
    console.error('Error in completion route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
