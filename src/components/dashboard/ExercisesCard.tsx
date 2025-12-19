// src/components/dashboard/ExercisesCard.tsx
// Card riepilogo esercizi per dashboard - Conforme MEGA_PROMPT v3.1
'use client';

import Link from 'next/link';

interface ExercisesCardProps {
  stats: {
    total: number;
    completed: number;
    inProgress: number;
    completionRate: number;
  };
  currentWeek?: number;
}

export default function ExercisesCard({ stats, currentWeek = 1 }: ExercisesCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
          📚 I Tuoi Esercizi
        </h3>
        <Link
          href="/exercises"
          className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 whitespace-nowrap flex-shrink-0"
        >
          Vedi tutti →
        </Link>
      </div>

      {/* Statistiche rapide */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4">
        <div className="text-center">
          <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.completed}</p>
          <p className="text-[10px] sm:text-xs text-gray-500">Completati</p>
        </div>
        <div className="text-center">
          <p className="text-lg sm:text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
          <p className="text-[10px] sm:text-xs text-gray-500">In corso</p>
        </div>
        <div className="text-center">
          <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats.completionRate}%</p>
          <p className="text-[10px] sm:text-xs text-gray-500">Progresso</p>
        </div>
      </div>

      {/* Barra progresso */}
      <div className="mb-3 sm:mb-4">
        <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 sm:h-2 rounded-full transition-all"
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
        <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
          {stats.completed} di {stats.total} esercizi completati
        </p>
      </div>

      {/* CTA */}
      <Link
        href="/exercises"
        className="block w-full text-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
      >
        Continua il Percorso
      </Link>
    </div>
  );
}
