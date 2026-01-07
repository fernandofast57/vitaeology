// src/components/exercises/ExercisesList.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ExerciseWithAccess } from '@/lib/types/exercises';
import { EXERCISE_TYPE_CONFIG, DIFFICULTY_CONFIG, STATUS_CONFIG } from '@/lib/types/exercises';
import { SubscriptionTier } from '@/lib/types/roles';

interface ExercisesListProps {
  exercises: ExerciseWithAccess[];
  userTier: SubscriptionTier;
}

function groupByMonth(exercises: ExerciseWithAccess[]): Record<string, ExerciseWithAccess[]> {
  return exercises.reduce((acc, exercise) => {
    // Fallback: se month_name vuoto, usa "Altri Esercizi"
    const month = exercise.month_name?.trim() || 'Altri Esercizi';
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(exercise);
    return acc;
  }, {} as Record<string, ExerciseWithAccess[]>);
}

type FilterType = 'all' | 'not_started' | 'in_progress' | 'completed' | 'locked';

export default function ExercisesList({ exercises, userTier }: ExercisesListProps) {
  const [filter, setFilter] = useState<FilterType>('all');

  // Calcola conteggi per ogni stato
  const accessibleExercises = exercises.filter(ex => !ex.isLocked);
  const lockedExercises = exercises.filter(ex => ex.isLocked);

  const counts = {
    all: exercises.length,
    not_started: accessibleExercises.filter(ex => !ex.progress || ex.progress.status === 'not_started').length,
    in_progress: accessibleExercises.filter(ex => ex.progress?.status === 'in_progress').length,
    completed: accessibleExercises.filter(ex => ex.progress?.status === 'completed').length,
    locked: lockedExercises.length
  };

  const filteredExercises = exercises.filter(ex => {
    if (filter === 'all') return true;
    if (filter === 'locked') return ex.isLocked;
    if (ex.isLocked) return false;
    const status = ex.progress?.status || 'not_started';
    return status === filter;
  });

  const groupedExercises = groupByMonth(filteredExercises);
  const months = Object.keys(groupedExercises);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
        >
          Tutti ({counts.all})
        </button>
        <button
          onClick={() => setFilter('not_started')}
          className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'not_started' ? 'bg-gray-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
        >
          Da iniziare ({counts.not_started})
        </button>
        <button
          onClick={() => setFilter('in_progress')}
          className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'in_progress' ? 'bg-yellow-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
        >
          In corso ({counts.in_progress})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'completed' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
        >
          Completati ({counts.completed})
        </button>
        {counts.locked > 0 && (
          <button
            onClick={() => setFilter('locked')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'locked' ? 'bg-amber-600 text-white' : 'bg-white text-amber-600 border border-amber-300 hover:bg-amber-50'}`}
          >
            Premium ({counts.locked})
          </button>
        )}
      </div>

      {months.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">Nessun esercizio trovato con questo filtro.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {months.map(month => (
            <div key={month}>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">{month}</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {groupedExercises[month].map(exercise => (
                  exercise.isLocked
                    ? <LockedExerciseCard key={exercise.id} exercise={exercise} />
                    : <ExerciseCard key={exercise.id} exercise={exercise} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ExerciseCard({ exercise }: { exercise: ExerciseWithAccess }) {
  const status = exercise.progress?.status || 'not_started';
  const statusConfig = STATUS_CONFIG[status];
  const typeConfig = EXERCISE_TYPE_CONFIG[exercise.exercise_type];
  const difficultyConfig = DIFFICULTY_CONFIG[exercise.difficulty_level];

  return (
    <Link href={`/exercises/${exercise.id}`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyConfig.color}`}>
              {difficultyConfig.label}
            </span>
          </div>
          <span className="text-sm text-gray-500 font-medium whitespace-nowrap ml-2">Sett. {exercise.week_number}</span>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-1">{exercise.title}</h3>
        {exercise.subtitle && (
          <p className="text-sm text-blue-600 font-medium mb-2">{exercise.subtitle}</p>
        )}

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{exercise.description}</p>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className={`px-2 py-1 rounded text-xs ${typeConfig.color}`}>
            {typeConfig.label}
          </span>
          <span className="text-xs text-gray-500">{exercise.estimated_time_minutes} min</span>
        </div>
      </div>
    </Link>
  );
}

function LockedExerciseCard({ exercise }: { exercise: ExerciseWithAccess }) {
  const typeConfig = EXERCISE_TYPE_CONFIG[exercise.exercise_type];
  const difficultyConfig = DIFFICULTY_CONFIG[exercise.difficulty_level];

  return (
    <div className="relative bg-gradient-to-br from-gray-50 to-amber-50/30 rounded-lg shadow-sm border border-amber-200 p-5 h-full">
      {/* Lock overlay */}
      <div className="absolute top-3 right-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 border border-amber-300 rounded-full">
          <svg className="w-3.5 h-3.5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-medium text-amber-700">{exercise.requiredTierDisplayName}</span>
        </div>
      </div>

      <div className="flex items-start justify-between mb-3 pr-24">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyConfig.color}`}>
            {difficultyConfig.label}
          </span>
        </div>
        <span className="text-sm text-gray-400 font-medium whitespace-nowrap ml-2">Sett. {exercise.week_number}</span>
      </div>

      <h3 className="text-lg font-semibold text-gray-700 mb-1">{exercise.title}</h3>
      {exercise.subtitle && (
        <p className="text-sm text-gray-500 font-medium mb-2">{exercise.subtitle}</p>
      )}

      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{exercise.description}</p>

      <div className="flex items-center justify-between pt-3 border-t border-gray-200/50">
        <span className={`px-2 py-1 rounded text-xs opacity-60 ${typeConfig.color}`}>
          {typeConfig.label}
        </span>
        <span className="text-xs text-gray-400">{exercise.estimated_time_minutes} min</span>
      </div>

      {/* CTA overlay */}
      <div className="mt-4 pt-3 border-t border-amber-200">
        <Link
          href="/pricing"
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm font-medium rounded-lg transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
          Sblocca con {exercise.requiredTierDisplayName}
        </Link>
      </div>
    </div>
  );
}