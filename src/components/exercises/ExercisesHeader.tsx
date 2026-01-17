// src/components/exercises/ExercisesHeader.tsx
'use client';

import { useState } from 'react';
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

interface PathwayInfo {
  slug: string;
  name: string;
  stats: ExerciseStats;
}

interface ExercisesHeaderProps {
  stats: ExerciseStats;
  userTier: SubscriptionTier;
  currentPath: string;
  pathways?: PathwayInfo[];
  hasMultiplePaths?: boolean;
  onPathwayChange?: (slug: string) => void;
}

// Mappa book_slug → nome display
const PATH_DISPLAY_NAMES: Record<string, { name: string; color: string }> = {
  leadership: { name: 'Leadership Autentica', color: 'text-amber-600' },
  risolutore: { name: 'Oltre gli Ostacoli', color: 'text-emerald-600' },
  microfelicita: { name: 'Microfelicità Digitale', color: 'text-violet-600' }
};

const TIER_COLORS: Record<SubscriptionTier, string> = {
  explorer: 'bg-gray-100 text-gray-700 border-gray-300',
  leader: 'bg-blue-100 text-blue-700 border-blue-300',
  mentor: 'bg-amber-100 text-amber-700 border-amber-300',
  mastermind: 'bg-purple-100 text-purple-700 border-purple-300',
  partner_elite: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-400'
};

// Colori per pathway tabs
const PATH_TAB_COLORS: Record<string, { bg: string; border: string; text: string; activeBg: string }> = {
  leadership: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    activeBg: 'bg-amber-100'
  },
  risolutore: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    activeBg: 'bg-emerald-100'
  },
  microfelicita: {
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    text: 'text-violet-700',
    activeBg: 'bg-violet-100'
  }
};

export default function ExercisesHeader({
  stats,
  userTier,
  currentPath,
  pathways = [],
  hasMultiplePaths = false,
  onPathwayChange
}: ExercisesHeaderProps) {
  const [selectedPath, setSelectedPath] = useState(currentPath);

  const tierConfig = SUBSCRIPTION_TIERS[userTier];
  const tierColorClass = TIER_COLORS[userTier];

  // Se multi-path, usa stats del percorso selezionato
  const currentStats = hasMultiplePaths && pathways.length > 0
    ? pathways.find(p => p.slug === selectedPath)?.stats || stats
    : stats;

  const pathInfo = PATH_DISPLAY_NAMES[selectedPath] || { name: 'Percorso', color: 'text-gray-600' };

  const handlePathChange = (slug: string) => {
    setSelectedPath(slug);
    onPathwayChange?.(slug);
    // Dispatch custom event per ExercisesList
    window.dispatchEvent(new CustomEvent('pathwayChange', { detail: { slug } }));
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              {hasMultiplePaths ? (
                <>I tuoi Esercizi</>
              ) : (
                <>Esercizi: <span className={pathInfo.color}>{pathInfo.name}</span></>
              )}
            </h1>
            <p className="text-gray-600">
              {hasMultiplePaths
                ? `${stats.total} esercizi in ${pathways.length} percorsi. ${stats.completed} completati.`
                : `Sviluppa le tue competenze con ${currentStats.total} esercizi pratici.`
              }
            </p>
          </div>
          <div className={`inline-flex items-center px-4 py-2 rounded-full border ${tierColorClass}`}>
            <span className="text-sm font-medium">Piano: {tierConfig.display_name}</span>
          </div>
        </div>

        {/* Tabs percorsi per utenti multi-pathway */}
        {hasMultiplePaths && pathways.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => handlePathChange('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPath === 'all'
                  ? 'bg-petrol-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tutti ({stats.total})
            </button>
            {pathways.map(pathway => {
              const colors = PATH_TAB_COLORS[pathway.slug] || PATH_TAB_COLORS.leadership;
              const isActive = selectedPath === pathway.slug;
              return (
                <button
                  key={pathway.slug}
                  onClick={() => handlePathChange(pathway.slug)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    isActive
                      ? `${colors.activeBg} ${colors.border} ${colors.text}`
                      : `${colors.bg} ${colors.border} ${colors.text} hover:${colors.activeBg}`
                  }`}
                >
                  {pathway.name} ({pathway.stats.completed}/{pathway.stats.total})
                </button>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-500">Accessibili</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{currentStats.accessible}</p>
          </div>
          <div className="bg-green-50 rounded-lg border border-green-200 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-green-600">Completati</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">{currentStats.completed}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-yellow-600">In corso</p>
            <p className="text-xl sm:text-2xl font-bold text-yellow-600">{currentStats.inProgress}</p>
          </div>
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-500">Da iniziare</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-600">{currentStats.notStarted}</p>
          </div>
          {currentStats.lockedCount > 0 && (
            <div className="bg-amber-50 rounded-lg border border-amber-200 p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-amber-600">Premium</p>
              <p className="text-xl sm:text-2xl font-bold text-amber-600">{currentStats.lockedCount}</p>
            </div>
          )}
        </div>

        <div className="mt-4 bg-gray-50 rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progresso</span>
            <span className="text-sm text-gray-500">{currentStats.completed} di {currentStats.accessible}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${currentStats.completionRate}%` }}
            />
          </div>
        </div>

        {currentStats.lockedCount > 0 && (
          <div className="mt-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="font-medium text-amber-800">
                  Sblocca {currentStats.lockedCount} esercizi avanzati
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