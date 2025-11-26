'use client';

import { useEffect, useState } from 'react';
import { TaskCard } from './TaskCard';

interface Task {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: number;
    duration_seconds: number;
    completed?: boolean;
    coins_earned?: number;
}

interface CompletionResult {
    success: boolean;
    coins_earned: number;
    xp_gained: number;
    streak_updated: boolean;
    new_streak: number;
    all_tasks_completed: boolean;
    new_badges?: string[];
    message: string;
}

export function DailyTaskList() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    async function fetchTasks() {
        try {
            const response = await fetch('/api/tasks/daily');
            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }
            const data = await response.json();
            setTasks(data.tasks || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load tasks');
        } finally {
            setLoading(false);
        }
    }

    async function handleComplete(taskId: string) {
        try {
            const response = await fetch('/api/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task_id: taskId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to complete task');
            }

            const result: CompletionResult = await response.json();

            // Update task in local state
            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task.id === taskId
                        ? { ...task, completed: true, coins_earned: result.coins_earned }
                        : task
                )
            );

            // Show celebration if all tasks completed
            if (result.all_tasks_completed) {
                setCelebrationMessage(
                    `🎉 ${result.message} You earned ${result.coins_earned} coins and gained ${result.xp_gained} XP!`
                );
                setTimeout(() => {
                    setCelebrationMessage(null);
                    // Refresh page to update stats
                    window.location.reload();
                }, 3000);
            }

        } catch (err) {
            console.error('Error completing task:', err);
            alert(err instanceof Error ? err.message : 'Failed to complete task');
        }
    }

    const completedCount = tasks.filter(t => t.completed).length;
    const totalCount = tasks.length;

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse"></div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-600 font-medium">⚠️ {error}</p>
                <button
                    onClick={fetchTasks}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (tasks.length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-600 mb-4">No tasks available yet.</p>
                <button
                    onClick={fetchTasks}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    Generate Tasks
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Progress Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Your Daily Tasks</h2>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Progress:</span>
                    <span className="font-bold text-indigo-600">{completedCount}/{totalCount}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${(completedCount / totalCount) * 100}%` }}
                ></div>
            </div>

            {/* Celebration Message */}
            {celebrationMessage && (
                <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center animate-bounce">
                    <p className="text-green-700 font-semibold text-lg">{celebrationMessage}</p>
                </div>
            )}

            {/* Task Cards */}
            <div className="grid grid-cols-1 gap-4">
                {tasks.map(task => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        onComplete={handleComplete}
                    />
                ))}
            </div>

            {/* Completion Summary */}
            {completedCount === totalCount && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6 text-center">
                    <p className="text-2xl mb-2">🎊</p>
                    <p className="text-lg font-semibold text-gray-900 mb-1">
                        All tasks completed!
                    </p>
                    <p className="text-sm text-gray-600">
                        Come back tomorrow for new challenges
                    </p>
                </div>
            )}
        </div>
    );
}
