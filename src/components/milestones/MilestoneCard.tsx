'use client';

import { useState } from 'react';
import {
  Trophy,
  Star,
  Sparkles,
  CheckCircle,
  Target,
  Clock,
  Award,
  Zap,
  TrendingUp,
  Heart,
  Brain,
  Compass,
  Shield,
  Lightbulb,
  Users,
} from 'lucide-react';

// Configurazione colori per percorso
const PATH_COLORS = {
  leadership: {
    bg: 'bg-amber-50',
    bgDark: 'bg-amber-500',
    border: 'border-amber-200',
    text: 'text-amber-700',
    textDark: 'text-amber-900',
    icon: 'text-amber-500',
    badge: 'bg-amber-100 text-amber-800',
    glow: 'shadow-amber-200',
  },
  ostacoli: {
    bg: 'bg-emerald-50',
    bgDark: 'bg-emerald-500',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    textDark: 'text-emerald-900',
    icon: 'text-emerald-500',
    badge: 'bg-emerald-100 text-emerald-800',
    glow: 'shadow-emerald-200',
  },
  microfelicita: {
    bg: 'bg-violet-50',
    bgDark: 'bg-violet-500',
    border: 'border-violet-200',
    text: 'text-violet-700',
    textDark: 'text-violet-900',
    icon: 'text-violet-500',
    badge: 'bg-violet-100 text-violet-800',
    glow: 'shadow-violet-200',
  },
  global: {
    bg: 'bg-blue-50',
    bgDark: 'bg-blue-500',
    border: 'border-blue-200',
    text: 'text-blue-700',
    textDark: 'text-blue-900',
    icon: 'text-blue-500',
    badge: 'bg-blue-100 text-blue-800',
    glow: 'shadow-blue-200',
  },
} as const;

// Mappa icone per milestone
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  '🎯': Target,
  '🏆': Trophy,
  '⭐': Star,
  '🌟': Sparkles,
  '✅': CheckCircle,
  '⏰': Clock,
  '🏅': Award,
  '⚡': Zap,
  '📈': TrendingUp,
  '❤️': Heart,
  '🧠': Brain,
  '🧭': Compass,
  '🛡️': Shield,
  '💡': Lightbulb,
  '👥': Users,
  // Default fallback
  default: Award,
};

// Configurazione categorie
const CATEGORY_CONFIG = {
  assessment: {
    label: 'Assessment',
    color: 'bg-blue-100 text-blue-800',
  },
  exercises: {
    label: 'Esercizi',
    color: 'bg-green-100 text-green-800',
  },
  time: {
    label: 'Tempo',
    color: 'bg-orange-100 text-orange-800',
  },
  mastery: {
    label: 'Maestria',
    color: 'bg-purple-100 text-purple-800',
  },
  special: {
    label: 'Speciale',
    color: 'bg-pink-100 text-pink-800',
  },
} as const;

type PathType = keyof typeof PATH_COLORS;
type CategoryType = keyof typeof CATEGORY_CONFIG;

export interface Milestone {
  id: string;
  milestoneType: string;
  pathType: PathType;
  achievedAt: string;
  notified: boolean;
  definition?: {
    code: string;
    pathType: PathType;
    category: CategoryType;
    name: string;
    description: string;
    icon: string;
    xpReward: number;
    displayOrder: number;
  };
}

interface MilestoneCardProps {
  milestone: Milestone;
  onNotify?: (id: string) => void;
  compact?: boolean;
  showXP?: boolean;
}

export default function MilestoneCard({
  milestone,
  onNotify,
  compact = false,
  showXP = true,
}: MilestoneCardProps) {
  const [isAnimating, setIsAnimating] = useState(!milestone.notified);
  const [isNotified, setIsNotified] = useState(milestone.notified);

  const pathColors = PATH_COLORS[milestone.pathType] || PATH_COLORS.global;
  const category = milestone.definition?.category || 'special';
  const categoryConfig = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.special;

  // Determina icona
  const iconKey = milestone.definition?.icon || 'default';
  const IconComponent = ICON_MAP[iconKey] || ICON_MAP.default;

  const handleNotify = async () => {
    if (isNotified || !onNotify) return;

    setIsAnimating(true);
    setTimeout(() => {
      setIsNotified(true);
      setIsAnimating(false);
      onNotify(milestone.id);
    }, 500);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Versione compatta per liste
  if (compact) {
    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-xl ${pathColors.bg} ${pathColors.border} border transition-all ${
          !isNotified ? 'cursor-pointer hover:scale-[1.02]' : ''
        } ${isAnimating && !isNotified ? 'animate-pulse' : ''}`}
        onClick={handleNotify}
      >
        <div className={`p-2 rounded-lg bg-white ${pathColors.border} border`}>
          <IconComponent className={`w-4 h-4 ${pathColors.icon}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${pathColors.text} truncate`}>
            {milestone.definition?.name || milestone.milestoneType}
          </p>
          <p className="text-xs text-neutral-500">
            {formatDate(milestone.achievedAt)}
          </p>
        </div>
        {showXP && milestone.definition?.xpReward && (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
            +{milestone.definition.xpReward} XP
          </span>
        )}
        {!isNotified && (
          <Sparkles className={`w-4 h-4 ${pathColors.icon} animate-pulse`} />
        )}
      </div>
    );
  }

  // Versione completa
  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${pathColors.border} border-2 transition-all duration-300 ${
        !isNotified
          ? `${pathColors.bg} cursor-pointer hover:shadow-lg hover:scale-[1.01] ${pathColors.glow} shadow-lg`
          : 'bg-white'
      } ${isAnimating && !isNotified ? 'animate-bounce' : ''}`}
      onClick={handleNotify}
    >
      {/* Effetto shimmer per non notificati */}
      {!isNotified && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
      )}

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className={`p-3 rounded-xl ${pathColors.bg} ${pathColors.border} border`}>
            <IconComponent className={`w-6 h-6 ${pathColors.icon}`} />
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryConfig.color}`}>
              {categoryConfig.label}
            </span>
            {showXP && milestone.definition?.xpReward && (
              <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {milestone.definition.xpReward} XP
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <h3 className={`text-lg font-bold ${pathColors.textDark} mb-1`}>
          {milestone.definition?.name || milestone.milestoneType}
        </h3>

        {milestone.definition?.description && (
          <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
            {milestone.definition.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
          <span className="text-xs text-neutral-500">
            {formatDate(milestone.achievedAt)}
          </span>

          {!isNotified ? (
            <button className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${pathColors.badge} text-sm font-medium transition-transform hover:scale-105`}>
              <Sparkles className="w-4 h-4" />
              Nuovo!
            </button>
          ) : (
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              Sbloccato
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
