'use client';

import { useState } from 'react';
import {
  Trophy,
  ChevronRight,
  Filter,
  Zap,
  Award,
  Target,
  Clock,
  Star,
  Sparkles,
} from 'lucide-react';
import MilestoneCard, { Milestone } from './MilestoneCard';

// Configurazione colori per percorso
const PATH_TABS = [
  { key: 'all', label: 'Tutti', icon: Trophy, color: 'text-neutral-600' },
  { key: 'leadership', label: 'Leadership', icon: Award, color: 'text-amber-600' },
  { key: 'ostacoli', label: 'Ostacoli', icon: Target, color: 'text-emerald-600' },
  { key: 'microfelicita', label: 'Microfelicità', icon: Star, color: 'text-violet-600' },
  { key: 'global', label: 'Globale', icon: Sparkles, color: 'text-blue-600' },
] as const;

const CATEGORY_FILTERS = [
  { key: 'all', label: 'Tutte le categorie' },
  { key: 'assessment', label: 'Assessment' },
  { key: 'exercises', label: 'Esercizi' },
  { key: 'time', label: 'Tempo' },
  { key: 'mastery', label: 'Maestria' },
  { key: 'special', label: 'Speciali' },
] as const;

type PathFilter = typeof PATH_TABS[number]['key'];
type CategoryFilter = typeof CATEGORY_FILTERS[number]['key'];

interface MilestonesListProps {
  milestones: Milestone[];
  totalXP?: number;
  onNotify?: (id: string) => void;
  title?: string;
  showFilters?: boolean;
  showXPTotal?: boolean;
  showEmpty?: boolean;
  maxItems?: number;
  compact?: boolean;
  onViewAll?: () => void;
}

export default function MilestonesList({
  milestones,
  totalXP = 0,
  onNotify,
  title = 'Le Tue Milestone',
  showFilters = true,
  showXPTotal = true,
  showEmpty = true,
  maxItems,
  compact = false,
  onViewAll,
}: MilestonesListProps) {
  const [pathFilter, setPathFilter] = useState<PathFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  // Filtra milestone
  const filteredMilestones = milestones.filter(m => {
    if (pathFilter !== 'all' && m.pathType !== pathFilter) return false;
    if (categoryFilter !== 'all' && m.definition?.category !== categoryFilter) return false;
    return true;
  });

  // Applica limite se specificato
  const displayMilestones = maxItems
    ? filteredMilestones.slice(0, maxItems)
    : filteredMilestones;

  // Conteggi
  const unnotifiedCount = milestones.filter(m => !m.notified).length;
  const totalMilestones = milestones.length;

  // Calcola XP per path
  const xpByPath = milestones.reduce((acc, m) => {
    const path = m.pathType;
    const xp = m.definition?.xpReward || 0;
    acc[path] = (acc[path] || 0) + xp;
    return acc;
  }, {} as Record<string, number>);

  if (milestones.length === 0 && !showEmpty) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-neutral-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl">
              <Trophy className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">{title}</h3>
              <p className="text-sm text-neutral-500">
                {totalMilestones} milestone sbloccate
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {unnotifiedCount > 0 && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700 animate-pulse flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                {unnotifiedCount} nuove!
              </span>
            )}
            {showXPTotal && (
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-yellow-100 text-yellow-800 font-bold">
                <Zap className="w-4 h-4" />
                {totalXP} XP
              </div>
            )}
          </div>
        </div>

        {/* Path tabs */}
        {showFilters && (
          <div className="flex flex-wrap gap-2">
            {PATH_TABS.map(tab => {
              const TabIcon = tab.icon;
              const isActive = pathFilter === tab.key;
              const count = tab.key === 'all'
                ? milestones.length
                : milestones.filter(m => m.pathType === tab.key).length;

              return (
                <button
                  key={tab.key}
                  onClick={() => setPathFilter(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <TabIcon className={`w-4 h-4 ${isActive ? 'text-white' : tab.color}`} />
                  {tab.label}
                  <span className={`px-1.5 py-0.5 rounded text-xs ${
                    isActive ? 'bg-white/20' : 'bg-neutral-200'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* XP breakdown per path (se filtrato su "all") */}
      {showXPTotal && pathFilter === 'all' && Object.keys(xpByPath).length > 0 && (
        <div className="px-5 py-3 bg-neutral-50 border-b border-neutral-100">
          <div className="flex items-center gap-4 overflow-x-auto">
            <span className="text-xs text-neutral-500 whitespace-nowrap">XP per percorso:</span>
            {Object.entries(xpByPath).map(([path, xp]) => (
              <div
                key={path}
                className={`flex items-center gap-1 text-xs font-medium whitespace-nowrap ${
                  path === 'leadership' ? 'text-amber-700' :
                  path === 'ostacoli' ? 'text-emerald-700' :
                  path === 'microfelicita' ? 'text-violet-700' :
                  'text-blue-700'
                }`}
              >
                <span className="capitalize">{path}:</span>
                <span className="font-bold">{xp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category filter dropdown */}
      {showFilters && (
        <div className="px-5 py-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
              className="text-sm text-neutral-600 bg-transparent border-none focus:ring-0 cursor-pointer"
            >
              {CATEGORY_FILTERS.map(cat => (
                <option key={cat.key} value={cat.key}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Lista milestone */}
      <div className="p-5">
        {filteredMilestones.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-neutral-300" />
            </div>
            <p className="text-neutral-600 font-medium mb-1">
              {milestones.length === 0
                ? 'Nessuna milestone ancora'
                : 'Nessuna milestone in questa categoria'}
            </p>
            <p className="text-sm text-neutral-400">
              {milestones.length === 0
                ? 'Completa esercizi e assessment per sbloccare milestone'
                : 'Prova a cambiare i filtri'}
            </p>
          </div>
        ) : (
          <div className={compact ? 'space-y-2' : 'grid gap-4 md:grid-cols-2'}>
            {displayMilestones.map(milestone => (
              <MilestoneCard
                key={milestone.id}
                milestone={milestone}
                onNotify={onNotify}
                compact={compact}
                showXP={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* View all button */}
      {maxItems && filteredMilestones.length > maxItems && (
        <div className="px-5 pb-5">
          <button
            onClick={onViewAll}
            className="w-full py-3 text-sm font-medium text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50 rounded-xl flex items-center justify-center gap-1 transition-colors"
          >
            Vedi tutte ({filteredMilestones.length})
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MINI MILESTONE PREVIEW
// Versione compatta per dashboard
// ============================================================

interface MiniMilestonePreviewProps {
  milestones: Milestone[];
  totalXP: number;
  onViewAll?: () => void;
}

export function MiniMilestonePreview({
  milestones,
  totalXP,
  onViewAll,
}: MiniMilestonePreviewProps) {
  const recentMilestones = milestones.slice(0, 3);
  const unnotifiedCount = milestones.filter(m => !m.notified).length;

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-neutral-900">Milestone</h3>
          {unnotifiedCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
              {unnotifiedCount} nuove
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-sm font-bold text-yellow-700">
          <Zap className="w-4 h-4" />
          {totalXP} XP
        </div>
      </div>

      {/* Recent milestones */}
      {recentMilestones.length === 0 ? (
        <p className="text-sm text-neutral-500 text-center py-4">
          Nessuna milestone ancora
        </p>
      ) : (
        <div className="space-y-2">
          {recentMilestones.map(m => (
            <div
              key={m.id}
              className={`flex items-center gap-3 p-2 rounded-lg ${
                !m.notified ? 'bg-amber-50' : 'bg-neutral-50'
              }`}
            >
              <Award className={`w-4 h-4 ${
                m.pathType === 'leadership' ? 'text-amber-500' :
                m.pathType === 'ostacoli' ? 'text-emerald-500' :
                m.pathType === 'microfelicita' ? 'text-violet-500' :
                'text-blue-500'
              }`} />
              <span className="text-sm text-neutral-700 flex-1 truncate">
                {m.definition?.name || m.milestoneType}
              </span>
              {m.definition?.xpReward && (
                <span className="text-xs font-medium text-yellow-700">
                  +{m.definition.xpReward}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* View all */}
      {onViewAll && milestones.length > 0 && (
        <button
          onClick={onViewAll}
          className="w-full mt-4 py-2 text-sm text-neutral-600 hover:text-neutral-800 flex items-center justify-center gap-1"
        >
          Vedi tutte ({milestones.length})
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
