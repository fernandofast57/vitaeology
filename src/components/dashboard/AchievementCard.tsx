'use client';

import { useState } from 'react';
import { Trophy, Star, Sparkles, CheckCircle, ChevronRight, Award } from 'lucide-react';

// Configurazione colori per percorso
const PATH_COLORS = {
  leadership: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    icon: 'text-amber-500',
    badge: 'bg-amber-100 text-amber-800',
  },
  ostacoli: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    icon: 'text-emerald-500',
    badge: 'bg-emerald-100 text-emerald-800',
  },
  microfelicita: {
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    text: 'text-violet-700',
    icon: 'text-violet-500',
    badge: 'bg-violet-100 text-violet-800',
  },
} as const;

// Configurazione per tipo achievement
const TYPE_CONFIG = {
  micro: {
    icon: CheckCircle,
    label: 'Micro',
    description: 'Passo completato',
  },
  macro: {
    icon: Trophy,
    label: 'Macro',
    description: 'Traguardo raggiunto',
  },
  milestone: {
    icon: Award,
    label: 'Milestone',
    description: 'Obiettivo speciale',
  },
} as const;

type PathType = keyof typeof PATH_COLORS;
type AchievementType = keyof typeof TYPE_CONFIG;

export interface Achievement {
  id: string;
  title: string;
  description?: string | null;
  achievement_type: AchievementType;
  path_type: PathType;
  characteristic?: string | null;
  celebrated: boolean;
  created_at: string;
  micro_count?: number;
}

interface AchievementCardProps {
  achievement: Achievement;
  onCelebrate?: (id: string) => void;
  compact?: boolean;
}

export default function AchievementCard({
  achievement,
  onCelebrate,
  compact = false,
}: AchievementCardProps) {
  const [isAnimating, setIsAnimating] = useState(!achievement.celebrated);
  const [isCelebrated, setIsCelebrated] = useState(achievement.celebrated);

  const pathColors = PATH_COLORS[achievement.path_type] || PATH_COLORS.leadership;
  const typeConfig = TYPE_CONFIG[achievement.achievement_type] || TYPE_CONFIG.micro;
  const IconComponent = typeConfig.icon;

  const handleCelebrate = async () => {
    if (isCelebrated || !onCelebrate) return;

    setIsAnimating(true);

    // Animazione celebrazione
    setTimeout(() => {
      setIsCelebrated(true);
      setIsAnimating(false);
      onCelebrate(achievement.id);
    }, 600);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
    });
  };

  // Versione compatta per lista
  if (compact) {
    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-xl ${pathColors.bg} ${pathColors.border} border transition-all ${
          !isCelebrated ? 'cursor-pointer hover:scale-[1.02]' : ''
        } ${isAnimating && !isCelebrated ? 'animate-pulse' : ''}`}
        onClick={handleCelebrate}
      >
        <div className={`p-2 rounded-lg bg-white ${pathColors.border} border`}>
          <IconComponent className={`w-4 h-4 ${pathColors.icon}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${pathColors.text} truncate`}>
            {achievement.title}
          </p>
          <p className="text-xs text-neutral-500">
            {formatDate(achievement.created_at)}
          </p>
        </div>
        {!isCelebrated && (
          <Sparkles className={`w-4 h-4 ${pathColors.icon} animate-pulse`} />
        )}
        {isCelebrated && (
          <CheckCircle className="w-4 h-4 text-green-500" />
        )}
      </div>
    );
  }

  // Versione completa
  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${pathColors.border} border-2 transition-all duration-300 ${
        !isCelebrated
          ? `${pathColors.bg} cursor-pointer hover:shadow-lg hover:scale-[1.01]`
          : 'bg-white'
      } ${isAnimating && !isCelebrated ? 'animate-bounce' : ''}`}
      onClick={handleCelebrate}
    >
      {/* Effetto shimmer per non celebrati */}
      {!isCelebrated && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
      )}

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className={`p-3 rounded-xl ${pathColors.bg} ${pathColors.border} border`}>
            <IconComponent className={`w-6 h-6 ${pathColors.icon}`} />
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${pathColors.badge}`}>
              {typeConfig.label}
            </span>
            {achievement.achievement_type === 'macro' && achievement.micro_count && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
                {achievement.micro_count} passi
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <h3 className={`text-lg font-bold ${pathColors.text} mb-1`}>
          {achievement.title}
        </h3>

        {achievement.description && (
          <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
            {achievement.description}
          </p>
        )}

        {achievement.characteristic && (
          <div className="flex items-center gap-2 mb-3">
            <Star className={`w-4 h-4 ${pathColors.icon}`} />
            <span className="text-sm text-neutral-600">
              {achievement.characteristic}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
          <span className="text-xs text-neutral-500">
            {formatDate(achievement.created_at)}
          </span>

          {!isCelebrated ? (
            <button
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${pathColors.badge} text-sm font-medium transition-transform hover:scale-105`}
            >
              <Sparkles className="w-4 h-4" />
              Celebra!
            </button>
          ) : (
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              Celebrato
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPONENTE LISTA ACHIEVEMENTS
// ============================================================

interface AchievementsListProps {
  achievements: Achievement[];
  onCelebrate?: (id: string) => void;
  title?: string;
  showEmpty?: boolean;
  maxItems?: number;
  compact?: boolean;
}

export function AchievementsList({
  achievements,
  onCelebrate,
  title = 'I Tuoi Conseguimenti',
  showEmpty = true,
  maxItems,
  compact = false,
}: AchievementsListProps) {
  const displayAchievements = maxItems
    ? achievements.slice(0, maxItems)
    : achievements;

  const uncelebratedCount = achievements.filter(a => !a.celebrated).length;

  if (achievements.length === 0 && !showEmpty) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-bold text-neutral-900">{title}</h3>
        </div>
        {uncelebratedCount > 0 && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 animate-pulse">
            {uncelebratedCount} nuovi!
          </span>
        )}
      </div>

      {/* Lista */}
      {achievements.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-6 h-6 text-neutral-400" />
          </div>
          <p className="text-neutral-600 mb-1">Nessun conseguimento ancora</p>
          <p className="text-sm text-neutral-400">
            Completa esercizi per sbloccare conseguimenti
          </p>
        </div>
      ) : (
        <div className={compact ? 'space-y-2' : 'space-y-4'}>
          {displayAchievements.map(achievement => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              onCelebrate={onCelebrate}
              compact={compact}
            />
          ))}
        </div>
      )}

      {/* Show more */}
      {maxItems && achievements.length > maxItems && (
        <button className="w-full mt-4 py-2 text-sm text-neutral-600 hover:text-neutral-800 flex items-center justify-center gap-1">
          Vedi tutti ({achievements.length})
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ============================================================
// COMPONENTE CELEBRATION MODAL
// ============================================================

interface CelebrationModalProps {
  achievement: Achievement | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CelebrationModal({
  achievement,
  isOpen,
  onClose,
}: CelebrationModalProps) {
  if (!isOpen || !achievement) return null;

  const pathColors = PATH_COLORS[achievement.path_type] || PATH_COLORS.leadership;
  const typeConfig = TYPE_CONFIG[achievement.achievement_type] || TYPE_CONFIG.micro;
  const IconComponent = typeConfig.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full text-center animate-bounce-in">
        {/* Confetti effect placeholder */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className={`w-20 h-20 rounded-full ${pathColors.bg} flex items-center justify-center border-4 border-white shadow-lg`}>
            <IconComponent className={`w-10 h-10 ${pathColors.icon}`} />
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            Congratulazioni!
          </h2>
          <p className={`text-lg font-medium ${pathColors.text} mb-4`}>
            {achievement.title}
          </p>

          {achievement.description && (
            <p className="text-neutral-600 mb-6">
              {achievement.description}
            </p>
          )}

          <button
            onClick={onClose}
            className={`px-6 py-3 rounded-xl font-medium text-white ${
              achievement.path_type === 'leadership'
                ? 'bg-amber-500 hover:bg-amber-600'
                : achievement.path_type === 'ostacoli'
                ? 'bg-emerald-500 hover:bg-emerald-600'
                : 'bg-violet-500 hover:bg-violet-600'
            } transition-colors`}
          >
            Continua il percorso
          </button>
        </div>
      </div>
    </div>
  );
}
