/**
 * Daily Tasks API Route
 * GET: Retrieve or generate user's daily tasks
 * Requirements: 3.6
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/auth-helpers';
import {
  selectDailyTasks,
  hasTasksForToday,
  getDailyTasks
} from '@/lib/tasks/task-selection';

export const dynamic = 'force-dynamic';

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

    // Get date from query params or use today
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // Check if tasks already assigned for this date
    const hasExisting = await hasTasksForToday(user.id, date);

    if (hasExisting) {
      // Return existing tasks
      const tasks = await getDailyTasks(user.id, date);

      return NextResponse.json({
        tasks,
        date,
        generated: false,
      });
    }

    // Generate new tasks
    const result = await selectDailyTasks(user.id, date);

    // Store assignments in daily_user_tasks table (Requirement 3.6)
    const supabase = await createClient();

    const assignments = result.tasks.map(task => ({
      user_id: user.id,
      task_id: task.id,
      assigned_date: date,
      completed: false,
      coins_earned: 0,
    }));

    const { error: insertError } = await supabase
      .from('daily_user_tasks')
      .insert(assignments);

    if (insertError) {
      console.error('Error storing task assignments:', insertError);
      return NextResponse.json(
        { error: 'Failed to store task assignments' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      tasks: result.tasks,
      date,
      generated: true,
      breakdown: result.breakdown,
    });

  } catch (error) {
    console.error('Error in daily tasks route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
