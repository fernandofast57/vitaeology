// src/components/exercises/ExercisesList.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ExerciseWithProgress } from '@/lib/types/exercises';
import { EXERCISE_TYPE_CONFIG, DIFFICULTY_CONFIG, STATUS_CONFIG } from '@/lib/types/exercises';

interface ExercisesListProps {
  exercises: ExerciseWithProgress[];
}

function groupByMonth(exercises: ExerciseWithProgress[]): Record<string, ExerciseWithProgress[]> {
  return exercises.reduce((acc, exercise) => {
    const month = exercise.month_name;
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(exercise);
    return acc;
  }, {} as Record<string, ExerciseWithProgress[]>);
}

export default function ExercisesList({ exercises }: ExercisesListProps) {
  const [filter, setFilter] = useState<'all' | 'not_started' | 'in_progress' | 'completed'>('all');

  // Calcola conteggi per ogni stato
  const counts = {
    all: exercises.length,
    not_started: exercises.filter(ex => !ex.progress || ex.progress.status === 'not_started').length,
    in_progress: exercises.filter(ex => ex.progress?.status === 'in_progress').length,
    completed: exercises.filter(ex => ex.progress?.status === 'completed').length
  };

  const filteredExercises = exercises.filter(ex => {
    if (filter === 'all') return true;
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
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
        >
          Tutti ({counts.all})
        </button>
        <button
          onClick={() => setFilter('not_started')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'not_started' ? 'bg-gray-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
        >
          Da iniziare ({counts.not_started})
        </button>
        <button
          onClick={() => setFilter('in_progress')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'in_progress' ? 'bg-yellow-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
        >
          In corso ({counts.in_progress})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'completed' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
        >
          Completati ({counts.completed})
        </button>
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
                  <ExerciseCard key={exercise.id} exercise={exercise} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ExerciseCard({ exercise }: { exercise: ExerciseWithProgress }) {
  const status = exercise.progress?.status || 'not_started';
  const statusConfig = STATUS_CONFIG[status];
  const typeConfig = EXERCISE_TYPE_CONFIG[exercise.exercise_type];
  const difficultyConfig = DIFFICULTY_CONFIG[exercise.difficulty_level];

  return (
    <Link href={`/exercises/${exercise.id}`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyConfig.color}`}>
              {difficultyConfig.label}
            </span>
          </div>
          <span className="text-sm text-gray-500 font-medium">Sett. {exercise.week_number}</span>
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