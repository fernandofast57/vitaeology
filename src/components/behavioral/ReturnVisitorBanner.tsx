'use client';

/**
 * ReturnVisitorBanner - Banner per visitatori di ritorno
 *
 * Mostra un messaggio personalizzato per chi torna sulla pagina.
 * Copy dinamico basato sul numero di visite.
 */

import { useEffect, useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export type ChallengeType = 'leadership' | 'ostacoli' | 'microfelicita';

export interface ReturnVisitorBannerProps {
  isVisible: boolean;
  onDismiss: () => void;
  challengeType: ChallengeType;
  visitCount: number;
  onCtaClick: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CHALLENGE_STYLES = {
  leadership: {
    gradient: 'from-amber-500/10 via-amber-400/5 to-transparent',
    border: 'border-amber-500/20',
    button: 'bg-amber-500 hover:bg-amber-600',
    accent: 'text-amber-600',
  },
  ostacoli: {
    gradient: 'from-emerald-500/10 via-emerald-400/5 to-transparent',
    border: 'border-emerald-500/20',
    button: 'bg-emerald-500 hover:bg-emerald-600',
    accent: 'text-emerald-600',
  },
  microfelicita: {
    gradient: 'from-violet-500/10 via-violet-400/5 to-transparent',
    border: 'border-violet-500/20',
    button: 'bg-violet-500 hover:bg-violet-600',
    accent: 'text-violet-600',
  },
};

const SESSION_STORAGE_KEY = 'vt_banner_dismissed_';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getVisitCopy(visitCount: number): string {
  if (visitCount >= 5) {
    return 'Questa è la volta buona? La sfida ti aspetta 💪';
  } else if (visitCount >= 3) {
    return 'Ci stai pensando... è il momento giusto!';
  } else {
    return 'Bentornato! Pronto a iniziare?';
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ReturnVisitorBanner({
  isVisible,
  onDismiss,
  challengeType,
  visitCount,
  onCtaClick,
}: ReturnVisitorBannerProps) {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const styles = CHALLENGE_STYLES[challengeType];
  const copy = getVisitCopy(visitCount);

  // Check sessionStorage per non mostrare se già dismissato in questa sessione
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const key = `${SESSION_STORAGE_KEY}${challengeType}`;
    const wasDismissed = sessionStorage.getItem(key) === 'true';

    if (wasDismissed) {
      setDismissed(true);
    } else if (isVisible) {
      // Delay per animazione slide-down
      const timer = setTimeout(() => setMounted(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isVisible, challengeType]);

  const handleDismiss = () => {
    setMounted(false);

    // Salva in sessionStorage
    if (typeof window !== 'undefined') {
      const key = `${SESSION_STORAGE_KEY}${challengeType}`;
      sessionStorage.setItem(key, 'true');
    }

    // Delay per completare animazione
    setTimeout(() => {
      setDismissed(true);
      onDismiss();
    }, 300);
  };

  const handleCtaClick = () => {
    handleDismiss();
    onCtaClick();
  };

  if (!isVisible || dismissed) {
    return null;
  }

  return (
    <div
      className={`
        w-full bg-gradient-to-r ${styles.gradient}
        border-b ${styles.border}
        transition-all duration-300 ease-out
        ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}
      `}
      role="banner"
      aria-label="Messaggio di bentornato"
    >
      <div className="max-w-4xl mx-auto px-4 py-3">
        {/* Mobile: Stack verticale */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Testo */}
          <p className="text-white font-medium text-center sm:text-left">
            <span>👋</span> {copy}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleCtaClick}
              className={`
                ${styles.button} text-white
                px-4 py-2 rounded-lg font-medium text-sm
                transition-colors whitespace-nowrap
              `}
            >
              Inizia Ora
            </button>

            <button
              onClick={handleDismiss}
              className="text-white/60 hover:text-white transition-colors p-1"
              aria-label="Chiudi banner"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReturnVisitorBanner;
