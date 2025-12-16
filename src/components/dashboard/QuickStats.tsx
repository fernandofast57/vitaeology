'use client';

import { ClipboardCheck, Target, BookOpen, Flame } from 'lucide-react';

interface QuickStatsProps {
  assessmentsCompleted: number;
  totalScore: number | null;
  exercisesCompleted: number;
  currentStreak: number;
}

export default function QuickStats({ assessmentsCompleted, totalScore, exercisesCompleted, currentStreak }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <div className="p-2 bg-blue-100 rounded-lg w-fit mb-3">
          <ClipboardCheck className="w-5 h-5 text-blue-600" />
        </div>
        <p className="text-2xl font-bold text-neutral-900">{assessmentsCompleted}</p>
        <p className="text-sm text-neutral-600">Test Completati</p>
      </div>
      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <div className="p-2 bg-emerald-100 rounded-lg w-fit mb-3">
          <Target className="w-5 h-5 text-emerald-600" />
        </div>
        <p className="text-2xl font-bold text-neutral-900">{totalScore !== null ? `${totalScore}%` : '-'}</p>
        <p className="text-sm text-neutral-600">Punteggio</p>
      </div>
      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <div className="p-2 bg-purple-100 rounded-lg w-fit mb-3">
          <BookOpen className="w-5 h-5 text-purple-600" />
        </div>
        <p className="text-2xl font-bold text-neutral-900">{exercisesCompleted}/52</p>
        <p className="text-sm text-neutral-600">Esercizi</p>
      </div>
      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <div className="p-2 bg-orange-100 rounded-lg w-fit mb-3">
          <Flame className="w-5 h-5 text-orange-600" />
        </div>
        <p className="text-2xl font-bold text-neutral-900">{currentStreak > 0 ? currentStreak : '-'}</p>
        <p className="text-sm text-neutral-600">Streak</p>
      </div>
    </div>
  );
}
