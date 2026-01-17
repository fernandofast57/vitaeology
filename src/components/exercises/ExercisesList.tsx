// src/components/exercises/ExercisesList.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { ExerciseWithAccess } from '@/lib/types/exercises';
import { EXERCISE_TYPE_CONFIG, DIFFICULTY_CONFIG, STATUS_CONFIG } from '@/lib/types/exercises';
import { SubscriptionTier } from '@/lib/types/roles';
import { PATHWAY_COLORS, PATHWAY_NAMES, type PathwaySlug } from '@/lib/pathways';

interface PathwayInfo {
  slug: string;
  name: string;
  stats: {
    total: number;
    completed: number;
  };
}

interface ExercisesListProps {
  exercises: ExerciseWithAccess[];
  userTier: SubscriptionTier;
  pathways?: PathwayInfo[];
  hasMultiplePaths?: boolean;
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

// Funzione per raggruppare per percorso (per multi-pathway)
function groupByPathway(exercises: ExerciseWithAccess[]): Record<string, ExerciseWithAccess[]> {
  return exercises.reduce((acc, exercise) => {
    const pathway = exercise.book_slug || 'other';
    if (!acc[pathway]) {
      acc[pathway] = [];
    }
    acc[pathway].push(exercise);
    return acc;
  }, {} as Record<string, ExerciseWithAccess[]>);
}

export default function ExercisesList({
  exercises,
  userTier,
  pathways = [],
  hasMultiplePaths = false
}: ExercisesListProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedPathway, setSelectedPathway] = useState<string>('all');

  // Ascolta eventi di cambio percorso dall'header
  useEffect(() => {
    const handlePathwayChange = (e: CustomEvent<{ slug: string }>) => {
      setSelectedPathway(e.detail.slug);
    };

    window.addEventListener('pathwayChange', handlePathwayChange as EventListener);
    return () => {
      window.removeEventListener('pathwayChange', handlePathwayChange as EventListener);
    };
  }, []);

  // Filtra prima per percorso (se multi-pathway e percorso selezionato)
  const pathwayFilteredExercises = hasMultiplePaths && selectedPathway !== 'all'
    ? exercises.filter(ex => ex.book_slug === selectedPathway)
    : exercises;

  // Calcola conteggi per ogni stato
  const accessibleExercises = pathwayFilteredExercises.filter(ex => !ex.isLocked);
  const lockedExercises = pathwayFilteredExercises.filter(ex => ex.isLocked);

  const counts = {
    all: pathwayFilteredExercises.length,
    not_started: accessibleExercises.filter(ex => !ex.progress || ex.progress.status === 'not_started').length,
    in_progress: accessibleExercises.filter(ex => ex.progress?.status === 'in_progress').length,
    completed: accessibleExercises.filter(ex => ex.progress?.status === 'completed').length,
    locked: lockedExercises.length
  };

  const filteredExercises = pathwayFilteredExercises.filter(ex => {
    if (filter === 'all') return true;
    if (filter === 'locked') return ex.isLocked;
    if (ex.isLocked) return false;
    const status = ex.progress?.status || 'not_started';
    return status === filter;
  });

  // Se multi-pathway e "tutti" selezionato, raggruppa per percorso
  const shouldGroupByPathway = hasMultiplePaths && selectedPathway === 'all';

  const groupedExercises = shouldGroupByPathway
    ? groupByPathway(filteredExercises)
    : groupByMonth(filteredExercises);
  const groups = Object.keys(groupedExercises);

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

      {groups.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">Nessun esercizio trovato con questo filtro.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map(group => {
            // Se raggruppiamo per percorso, mostra nome percorso con colore
            const isPathwayGroup = shouldGroupByPathway && ['leadership', 'risolutore', 'microfelicita'].includes(group);
            const pathwayColor = isPathwayGroup ? PATHWAY_COLORS[group as PathwaySlug] : undefined;
            const groupTitle = isPathwayGroup
              ? PATHWAY_NAMES[group as PathwaySlug]
              : group;

            return (
              <div key={group}>
                <h2
                  className="text-xl font-semibold text-gray-800 mb-4"
                  style={pathwayColor ? { color: pathwayColor } : undefined}
                >
                  {groupTitle}
                  {isPathwayGroup && (
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({groupedExercises[group].length} esercizi)
                    </span>
                  )}
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {groupedExercises[group].map(exercise => (
                    exercise.isLocked
                      ? <LockedExerciseCard key={exercise.id} exercise={exercise} showPathway={hasMultiplePaths && !shouldGroupByPathway} />
                      : <ExerciseCard key={exercise.id} exercise={exercise} showPathway={hasMultiplePaths && !shouldGroupByPathway} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ExerciseCard({ exercise, showPathway = false }: { exercise: ExerciseWithAccess; showPathway?: boolean }) {
  const status = exercise.progress?.status || 'not_started';
  const statusConfig = STATUS_CONFIG[status];
  const typeConfig = EXERCISE_TYPE_CONFIG[exercise.exercise_type];
  const difficultyConfig = DIFFICULTY_CONFIG[exercise.difficulty_level];
  const pathwayColor = exercise.book_slug ? PATHWAY_COLORS[exercise.book_slug as PathwaySlug] : undefined;
  const pathwayName = exercise.book_slug ? PATHWAY_NAMES[exercise.book_slug as PathwaySlug] : undefined;

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
            {showPathway && pathwayColor && (
              <span
                className="px-2 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: pathwayColor }}
              >
                {pathwayName}
              </span>
            )}
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

function LockedExerciseCard({ exercise, showPathway = false }: { exercise: ExerciseWithAccess; showPathway?: boolean }) {
  const typeConfig = EXERCISE_TYPE_CONFIG[exercise.exercise_type];
  const difficultyConfig = DIFFICULTY_CONFIG[exercise.difficulty_level];
  const pathwayColor = exercise.book_slug ? PATHWAY_COLORS[exercise.book_slug as PathwaySlug] : undefined;
  const pathwayName = exercise.book_slug ? PATHWAY_NAMES[exercise.book_slug as PathwaySlug] : undefined;

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
          {showPathway && pathwayColor && (
            <span
              className="px-2 py-1 rounded-full text-xs font-medium text-white opacity-70"
              style={{ backgroundColor: pathwayColor }}
            >
              {pathwayName}
            </span>
          )}
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