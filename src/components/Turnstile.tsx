'use client';

/**
 * Cloudflare Turnstile Component
 * Captcha invisibile per proteggere form da bot
 *
 * Uso:
 *   <Turnstile onVerify={(token) => setToken(token)} />
 */

import { useEffect, useRef, useCallback } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'compact' | 'invisible';
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface TurnstileProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact' | 'invisible';
  className?: string;
}

export default function Turnstile({
  onVerify,
  onError,
  onExpire,
  theme = 'auto',
  size = 'normal',
  className = '',
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const handleVerify = useCallback(
    (token: string) => {
      onVerify(token);
    },
    [onVerify]
  );

  const handleError = useCallback(() => {
    onError?.();
  }, [onError]);

  const handleExpire = useCallback(() => {
    onExpire?.();
  }, [onExpire]);

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    if (!siteKey) {
      console.warn('Turnstile: NEXT_PUBLIC_TURNSTILE_SITE_KEY non configurato');
      // In development senza chiave, passa un token fittizio
      if (process.env.NODE_ENV === 'development') {
        onVerify('dev-bypass-token');
      }
      return;
    }

    // Carica script Turnstile se non già presente
    const loadScript = () => {
      return new Promise<void>((resolve) => {
        if (window.turnstile) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
        script.async = true;
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    };

    const initWidget = async () => {
      await loadScript();

      if (!containerRef.current || !window.turnstile) return;

      // Rimuovi widget esistente se presente
      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Ignora errori di rimozione
        }
      }

      // Render nuovo widget
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: handleVerify,
        'error-callback': handleError,
        'expired-callback': handleExpire,
        theme,
        size,
      });
    };

    initWidget();

    // Cleanup
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Ignora errori di cleanup
        }
      }
    };
  }, [handleVerify, handleError, handleExpire, theme, size, onVerify]);

  return <div ref={containerRef} className={className} />;
}

/**
 * Hook per gestire lo stato Turnstile in un form
 */
export function useTurnstile() {
  const tokenRef = useRef<string | null>(null);

  const setToken = useCallback((token: string) => {
    tokenRef.current = token;
  }, []);

  const getToken = useCallback(() => {
    return tokenRef.current;
  }, []);

  const clearToken = useCallback(() => {
    tokenRef.current = null;
  }, []);

  return { setToken, getToken, clearToken };
}
