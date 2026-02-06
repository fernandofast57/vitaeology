'use client';

/**
 * Provider per auto-logout dopo inattività.
 * Wrappa le pagine protette per abilitare il timeout.
 *
 * Mostra un avviso 2 minuti prima del logout automatico.
 */

import { useState, useCallback } from 'react';
import { useIdleTimeout } from '@/hooks/useIdleTimeout';

export default function IdleTimeoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showWarning, setShowWarning] = useState(false);

  const handleWarning = useCallback(() => {
    setShowWarning(true);
  }, []);

  const { resetTimer } = useIdleTimeout({
    onWarning: handleWarning,
  });

  const handleDismissWarning = useCallback(() => {
    setShowWarning(false);
    resetTimer();
  }, [resetTimer]);

  return (
    <>
      {children}
      {showWarning && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
          role="alertdialog"
          aria-modal="true"
          aria-label="Avviso inattività"
        >
          <div className="mx-4 max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Sessione in scadenza
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              Per la tua sicurezza, la sessione si chiuderà tra 2 minuti
              per inattività. Vuoi continuare?
            </p>
            <button
              onClick={handleDismissWarning}
              className="w-full rounded-lg bg-[#0A2540] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0A2540]/90"
            >
              Continua la sessione
            </button>
          </div>
        </div>
      )}
    </>
  );
}
