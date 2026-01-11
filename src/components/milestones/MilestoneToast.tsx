'use client';

import { useEffect, useState } from 'react';
import {
  Trophy,
  Star,
  Target,
  Award,
  Zap,
  X,
  Sparkles,
} from 'lucide-react';

// Configurazione colori per percorso
const PATH_COLORS = {
  leadership: {
    bg: 'bg-gradient-to-r from-amber-500 to-amber-600',
    border: 'border-amber-400',
    text: 'text-white',
    accent: 'text-amber-200',
  },
  ostacoli: {
    bg: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
    border: 'border-emerald-400',
    text: 'text-white',
    accent: 'text-emerald-200',
  },
  microfelicita: {
    bg: 'bg-gradient-to-r from-violet-500 to-violet-600',
    border: 'border-violet-400',
    text: 'text-white',
    accent: 'text-violet-200',
  },
  global: {
    bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
    border: 'border-blue-400',
    text: 'text-white',
    accent: 'text-blue-200',
  },
} as const;

// Mappa icone
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  '🎯': Target,
  '🏆': Trophy,
  '⭐': Star,
  '🏅': Award,
  default: Award,
};

type PathType = keyof typeof PATH_COLORS;

export interface MilestoneToastData {
  id: string;
  type: string;
  pathType: PathType;
  name: string;
  description?: string;
  icon?: string;
  xpReward?: number;
}

interface MilestoneToastProps {
  milestone: MilestoneToastData;
  onClose: () => void;
  duration?: number;
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

export default function MilestoneToast({
  milestone,
  onClose,
  duration = 5000,
  position = 'top-right',
}: MilestoneToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const pathColors = PATH_COLORS[milestone.pathType] || PATH_COLORS.global;
  const IconComponent = ICON_MAP[milestone.icon || 'default'] || ICON_MAP.default;

  useEffect(() => {
    // Trigger animazione di entrata
    const showTimer = setTimeout(() => setIsVisible(true), 50);

    // Auto-close dopo duration
    const closeTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(closeTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 transition-all duration-300 ${
        isVisible && !isLeaving
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 -translate-y-4 scale-95'
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-2xl ${pathColors.bg} ${pathColors.border} border-2 shadow-2xl max-w-sm w-full`}
      >
        {/* Effetto particelle */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Sparkles className="absolute top-2 left-4 w-4 h-4 text-white/30 animate-pulse" />
          <Sparkles className="absolute top-6 right-8 w-3 h-3 text-white/20 animate-pulse delay-100" />
          <Sparkles className="absolute bottom-4 left-8 w-3 h-3 text-white/20 animate-pulse delay-200" />
        </div>

        <div className="relative p-4">
          {/* Header con icona */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <IconComponent className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              {/* Label */}
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-medium ${pathColors.accent} uppercase tracking-wide`}>
                  Milestone Sbloccata!
                </span>
                {milestone.xpReward && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    +{milestone.xpReward} XP
                  </span>
                )}
              </div>

              {/* Nome */}
              <h4 className={`text-lg font-bold ${pathColors.text} leading-tight`}>
                {milestone.name}
              </h4>

              {/* Descrizione */}
              {milestone.description && (
                <p className={`text-sm ${pathColors.accent} mt-1 line-clamp-2`}>
                  {milestone.description}
                </p>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/70 hover:text-white" />
            </button>
          </div>

          {/* Progress bar animata */}
          <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/60 rounded-full transition-all ease-linear"
              style={{
                width: isVisible && !isLeaving ? '0%' : '100%',
                transitionDuration: `${duration}ms`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MILESTONE TOAST CONTAINER
// Gestisce multiple notifiche in coda
// ============================================================

interface MilestoneToastContainerProps {
  milestones: MilestoneToastData[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

export function MilestoneToastContainer({
  milestones,
  onDismiss,
  position = 'top-right',
}: MilestoneToastContainerProps) {
  // Mostra solo la prima milestone (una alla volta)
  const currentMilestone = milestones[0];

  if (!currentMilestone) return null;

  return (
    <MilestoneToast
      key={currentMilestone.id}
      milestone={currentMilestone}
      onClose={() => onDismiss(currentMilestone.id)}
      position={position}
      duration={5000}
    />
  );
}
