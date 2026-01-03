'use client';

/**
 * EngagementBadge - Badge incoraggiante basato su engagement score
 *
 * Appare vicino ai CTA quando l'utente mostra alto engagement.
 * Copy dinamico basato sul punteggio.
 */

import { useEffect, useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export type ChallengeType = 'leadership' | 'ostacoli' | 'microfelicita';

export interface EngagementBadgeProps {
  isVisible: boolean;
  score: number;
  challengeType: ChallengeType;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CHALLENGE_COLORS = {
  leadership: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  ostacoli: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  microfelicita: {
    bg: 'bg-violet-100',
    text: 'text-violet-700',
    border: 'border-violet-200',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getScoreCopy(score: number): string {
  if (score > 90) {
    return 'Cosa aspetti? È gratis! 🚀';
  } else if (score >= 75) {
    return 'Sei quasi convinto, vero? 😊';
  } else if (score >= 60) {
    return 'Stai esplorando con attenzione 👀';
  }
  return '';
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EngagementBadge({
  isVisible,
  score,
  challengeType,
}: EngagementBadgeProps) {
  const [mounted, setMounted] = useState(false);

  const colors = CHALLENGE_COLORS[challengeType];
  const copy = getScoreCopy(score);

  // Animazione mount
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setMounted(true), 50);
      return () => clearTimeout(timer);
    } else {
      setMounted(false);
    }
  }, [isVisible]);

  // Non mostrare se score troppo basso o nessun copy
  if (!isVisible || score < 60 || !copy) {
    return null;
  }

  return (
    <div
      className={`
        inline-flex items-center justify-center
        ${colors.bg} ${colors.text} ${colors.border}
        border rounded-full px-3 py-1
        text-sm font-medium
        mt-3
        transition-all duration-300 ease-out
        ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
      role="status"
      aria-live="polite"
    >
      {copy}
    </div>
  );
}

export default EngagementBadge;
