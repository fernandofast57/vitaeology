'use client';

/**
 * Hook per gestione timeout inattività utente.
 * Dopo un periodo di inattività, esegue il logout automatico.
 *
 * Traccia: mousemove, keydown, click, scroll, touchstart
 * Default: 30 minuti di inattività → logout
 */

import { useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

// Configurazione timeout (millisecondi)
const DEFAULT_TIMEOUT_MS = 30 * 60 * 1000; // 30 minuti
const WARNING_BEFORE_MS = 2 * 60 * 1000;   // Avviso 2 minuti prima
const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'] as const;
const THROTTLE_MS = 30_000; // Aggiorna attività max ogni 30 secondi

interface UseIdleTimeoutOptions {
  /** Timeout in millisecondi (default: 30 min) */
  timeoutMs?: number;
  /** Callback quando si avvicina il timeout (per mostrare warning) */
  onWarning?: () => void;
  /** Callback al logout */
  onLogout?: () => void;
  /** Disabilita il timeout (per pagine pubbliche) */
  disabled?: boolean;
}

export function useIdleTimeout(options: UseIdleTimeoutOptions = {}) {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    onWarning,
    onLogout,
    disabled = false,
  } = options;

  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
      warningRef.current = null;
    }
  }, []);

  const handleLogout = useCallback(async () => {
    clearTimers();
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignora errori di logout
    }
    if (onLogout) {
      onLogout();
    } else {
      router.push('/auth/login?reason=idle');
    }
  }, [clearTimers, onLogout, router]);

  const resetTimer = useCallback(() => {
    if (disabled) return;

    // Throttle: aggiorna solo ogni THROTTLE_MS
    const now = Date.now();
    if (now - lastActivityRef.current < THROTTLE_MS) return;
    lastActivityRef.current = now;

    clearTimers();

    // Timer warning (2 min prima del logout)
    if (onWarning && timeoutMs > WARNING_BEFORE_MS) {
      warningRef.current = setTimeout(() => {
        onWarning();
      }, timeoutMs - WARNING_BEFORE_MS);
    }

    // Timer logout
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, timeoutMs);
  }, [disabled, clearTimers, timeoutMs, onWarning, handleLogout]);

  useEffect(() => {
    if (disabled) return;

    // Imposta timer iniziale
    resetTimer();

    // Ascolta attività utente
    const handleActivity = () => resetTimer();

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, handleActivity, { passive: true });
    }

    // Sincronizza tra tab (via localStorage)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'vitae_last_activity') {
        lastActivityRef.current = Number(e.newValue) || Date.now();
        resetTimer();
      }
    };
    window.addEventListener('storage', handleStorage);

    // Aggiorna localStorage per sincronizzazione tra tab
    const syncInterval = setInterval(() => {
      localStorage.setItem('vitae_last_activity', String(Date.now()));
    }, THROTTLE_MS);

    return () => {
      clearTimers();
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, handleActivity);
      }
      window.removeEventListener('storage', handleStorage);
      clearInterval(syncInterval);
    };
  }, [disabled, resetTimer, clearTimers]);

  return {
    /** Resetta manualmente il timer (es. dopo azione utente esplicita) */
    resetTimer,
    /** Esegue logout immediato */
    logout: handleLogout,
  };
}
