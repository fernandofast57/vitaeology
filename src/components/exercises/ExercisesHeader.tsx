// src/components/exercises/ExercisesHeader.tsx
'use client';

import Link from 'next/link';
import { SUBSCRIPTION_TIERS, SubscriptionTier } from '@/lib/types/roles';

interface ExerciseStats {
  total: number;
  accessible: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  lockedCount: number;
  completionRate: number;
}

interface ExercisesHeaderProps {
  stats: ExerciseStats;
  userTier: SubscriptionTier;
}

const TIER_COLORS: Record<SubscriptionTier, string> = {
  explorer: 'bg-gray-100 text-gray-700 border-gray-300',
  leader: 'bg-blue-100 text-blue-700 border-blue-300',
  mentor: 'bg-amber-100 text-amber-700 border-amber-300',
  mastermind: 'bg-purple-100 text-purple-700 border-purple-300',
  partner_elite: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-400'
};

export default function ExercisesHeader({ stats, userTier }: ExercisesHeaderProps) {
  const tierConfig = SUBSCRIPTION_TIERS[userTier];
  const tierColorClass = TIER_COLORS[userTier];

  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              I Tuoi 52 Esercizi Settimanali
            </h1>
            <p className="text-gray-600">
              Sviluppa la tua leadership autentica con esercizi pratici.
            </p>
          </div>
          <div className={`inline-flex items-center px-4 py-2 rounded-full border ${tierColorClass}`}>
            <span className="text-sm font-medium">Piano: {tierConfig.display_name}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-500">Accessibili</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.accessible}</p>
          </div>
          <div className="bg-green-50 rounded-lg border border-green-200 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-green-600">Completati</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-yellow-600">In corso</p>
            <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
          </div>
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-500">Da iniziare</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-600">{stats.notStarted}</p>
          </div>
          {stats.lockedCount > 0 && (
            <div className="bg-amber-50 rounded-lg border border-amber-200 p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-amber-600">Premium</p>
              <p className="text-xl sm:text-2xl font-bold text-amber-600">{stats.lockedCount}</p>
            </div>
          )}
        </div>

        <div className="mt-4 bg-gray-50 rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progresso annuale</span>
            <span className="text-sm text-gray-500">{stats.completed} di {stats.accessible}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>

        {stats.lockedCount > 0 && (
          <div className="mt-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="font-medium text-amber-800">
                  Sblocca {stats.lockedCount} esercizi avanzati
                </p>
                <p className="text-sm text-amber-600">
                  Passa a un piano superiore per accedere a esercizi intermedi e avanzati.
                </p>
              </div>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
              >
                Vedi i piani
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}