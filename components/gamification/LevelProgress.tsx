
'use client';

import { getLevelInfo, LevelInfo } from '@/lib/gamification/levels';

interface LevelProgressProps {
    xp: number;
}

export function LevelProgress({ xp }: LevelProgressProps) {
    const levelInfo = getLevelInfo(xp);

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-end mb-2">
                <div>
                    <div className="text-sm text-gray-600 mb-1">Level</div>
                    <div className="text-3xl font-bold text-indigo-600">
                        {levelInfo.current_level}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">
                        {levelInfo.xp_until_next_level} XP to next level
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                        {levelInfo.current_xp} / {levelInfo.xp_for_next_level} XP
                    </div>
                </div>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${levelInfo.progress_percentage}%` }}
                ></div>
            </div>

            <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>Lvl {levelInfo.current_level}</span>
                <span>Lvl {levelInfo.current_level + 1}</span>
            </div>
        </div>
    );
}
