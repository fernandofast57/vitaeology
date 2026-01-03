'use client';

/**
 * ExitIntentPopup - Popup per catturare utenti in uscita
 *
 * Mostra un overlay con form email quando l'utente sta per lasciare la pagina.
 * Copy dinamico basato su engagement score e tipo challenge.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export type ChallengeType = 'leadership' | 'ostacoli' | 'microfelicita';

export interface ExitIntentPopupProps {
  isVisible: boolean;
  onDismiss: () => void;
  onSubmit: (email: string) => Promise<void>;
  challengeType: ChallengeType;
  engagementScore: number;
  scrollDepth: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CHALLENGE_COLORS = {
  leadership: {
    border: 'border-t-amber-500',
    bg: 'bg-amber-500',
    bgHover: 'hover:bg-amber-600',
    focus: 'focus:border-amber-500 focus:ring-amber-500',
    text: 'text-amber-600',
  },
  ostacoli: {
    border: 'border-t-emerald-500',
    bg: 'bg-emerald-500',
    bgHover: 'hover:bg-emerald-600',
    focus: 'focus:border-emerald-500 focus:ring-emerald-500',
    text: 'text-emerald-600',
  },
  microfelicita: {
    border: 'border-t-violet-500',
    bg: 'bg-violet-500',
    bgHover: 'hover:bg-violet-600',
    focus: 'focus:border-violet-500 focus:ring-violet-500',
    text: 'text-violet-600',
  },
};

const CHALLENGE_COPY = {
  leadership: 'Scopri il leader che è in te',
  ostacoli: 'Impara a superare ogni blocco',
  microfelicita: 'Trova la gioia nei piccoli momenti',
};

const AUTO_CLOSE_DELAY_MS = 3000;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getEngagementCopy(score: number): string {
  if (score > 70) {
    return 'Hai letto quasi tutto! Non fermarti proprio ora...';
  } else if (score >= 40) {
    return 'Interessante vero? Lascia la tua email per iniziare';
  } else {
    return "Dai un'occhiata alla sfida gratuita di 7 giorni";
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ExitIntentPopup({
  isVisible,
  onDismiss,
  onSubmit,
  challengeType,
  engagementScore,
}: ExitIntentPopupProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const colors = CHALLENGE_COLORS[challengeType];
  const challengeCopy = CHALLENGE_COPY[challengeType];
  const engagementCopy = getEngagementCopy(engagementScore);

  // Focus trap e ESC handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDismiss();
      }

      // Focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    [onDismiss]
  );

  // Auto-focus input on mount
  useEffect(() => {
    if (isVisible && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isVisible]);

  // ESC key listener
  useEffect(() => {
    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [isVisible, handleKeyDown]);

  // Auto-close after success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        onDismiss();
      }, AUTO_CLOSE_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [success, onDismiss]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSubmit(email);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onDismiss();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-intent-title"
    >
      <div
        ref={modalRef}
        className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 border-t-4 ${colors.border} animate-scale-in`}
      >
        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Chiudi popup"
        >
          <svg
            className="w-6 h-6"
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

        <div className="p-6 md:p-8">
          {success ? (
            // Success state
            <div className="text-center py-4">
              <div className={`w-16 h-16 ${colors.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Perfetto!
              </h3>
              <p className="text-gray-600">
                Controlla la tua email per iniziare la sfida.
              </p>
            </div>
          ) : (
            // Form state
            <>
              <h2
                id="exit-intent-title"
                className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 pr-8"
              >
                Aspetta!
              </h2>

              <p className="text-gray-600 mb-2">{engagementCopy}</p>

              <p className={`${colors.text} font-medium mb-6`}>
                {challengeCopy}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    ref={inputRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="La tua email"
                    required
                    className={`w-full px-4 py-3 md:py-4 text-base md:text-lg border-2 border-gray-200 rounded-lg ${colors.focus} focus:outline-none focus:ring-2 transition-colors`}
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full ${colors.bg} ${colors.bgHover} text-white font-bold py-3 md:py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base md:text-lg`}
                >
                  {loading ? 'Iscrizione...' : 'Inizia la Sfida Gratuita'}
                </button>
              </form>

              <p className="text-center text-gray-400 text-sm mt-4">
                Zero spam. Cancellazione con un click.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default ExitIntentPopup;
