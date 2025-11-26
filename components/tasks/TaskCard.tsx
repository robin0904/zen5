'use client';

import { useState } from 'react';

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

interface TaskCardProps {
    task: Task;
    onComplete: (taskId: string) => Promise<void>;
    disabled?: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
    learn: '📚',
    move: '🏃',
    reflect: '🧘',
    fun: '🎉',
    skill: '🎯',
    challenge: '⚡',
};

const CATEGORY_COLORS: Record<string, string> = {
    learn: 'bg-blue-100 text-blue-700',
    move: 'bg-green-100 text-green-700',
    reflect: 'bg-purple-100 text-purple-700',
    fun: 'bg-yellow-100 text-yellow-700',
    skill: 'bg-orange-100 text-orange-700',
    challenge: 'bg-red-100 text-red-700',
};

export function TaskCard({ task, onComplete, disabled }: TaskCardProps) {
    const [isCompleting, setIsCompleting] = useState(false);

    const handleComplete = async () => {
        if (task.completed || isCompleting || disabled) return;

        setIsCompleting(true);
        try {
            await onComplete(task.id);
        } catch (error) {
            console.error('Failed to complete task:', error);
        } finally {
            setIsCompleting(false);
        }
    };

    const difficultyStars = '⭐'.repeat(task.difficulty);
    const durationMinutes = Math.ceil(task.duration_seconds / 60);

    return (
        <div
            className={`
        relative p-5 rounded-lg border-2 transition-all duration-300
        ${task.completed
                    ? 'bg-gray-50 border-gray-200 opacity-75'
                    : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-md'
                }
      `}
        >
            {/* Completed Overlay */}
            {task.completed && (
                <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <span>✓</span>
                    <span>Done</span>
                </div>
            )}

            {/* Category Badge */}
            <div className="flex items-start justify-between mb-3">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[task.category] || 'bg-gray-100 text-gray-700'}`}>
                    <span>{CATEGORY_ICONS[task.category] || '📌'}</span>
                    <span className="capitalize">{task.category}</span>
                </span>
            </div>

            {/* Task Content */}
            <h3 className={`text-lg font-semibold mb-2 ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                {task.title}
            </h3>
            <p className={`text-sm mb-4 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                {task.description}
            </p>

            {/* Task Metadata */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span title="Difficulty">{difficultyStars}</span>
                    <span title="Duration">⏱️ {durationMinutes} min</span>
                </div>
                {task.completed && task.coins_earned && (
                    <span className="text-xs font-medium text-green-600">
                        +{task.coins_earned} coins
                    </span>
                )}
            </div>

            {/* Complete Button */}
            {!task.completed && (
                <button
                    onClick={handleComplete}
                    disabled={isCompleting || disabled}
                    className={`
            w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all
            ${isCompleting || disabled
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                        }
          `}
                >
                    {isCompleting ? 'Completing...' : 'Complete Task'}
                </button>
            )}
        </div>
    );
}
