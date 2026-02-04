'use client';

import { useEffect } from 'react';

interface ConversionTrackerProps {
  event: 'Purchase' | 'Lead' | 'CompleteRegistration' | 'Subscribe';
  data?: Record<string, unknown>;
}

/**
 * Componente client per tracciare conversioni Meta Pixel + GA4.
 * Da inserire nelle pagine di ringraziamento/completamento.
 */
export default function ConversionTracker({ event, data }: ConversionTrackerProps) {
  useEffect(() => {
    // Meta Pixel
    const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
    if (fbq) {
      fbq('track', event, data || {});
    }

    // Google Analytics
    const gtag = (window as unknown as { gtag?: (cmd: string, event: string, params: object) => void }).gtag;
    if (gtag) {
      const gaEventMap: Record<string, string> = {
        Purchase: 'purchase',
        Lead: 'generate_lead',
        CompleteRegistration: 'sign_up',
        Subscribe: 'subscribe',
      };
      const gaEvent = gaEventMap[event] || event;

      gtag('event', gaEvent, data || {});
    }
  }, [event, data]);

  return null;
}
