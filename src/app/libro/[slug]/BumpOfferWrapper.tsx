'use client';

import dynamic from 'next/dynamic';
import { Libro } from '@/data/libri';

// Caricamento dinamico per evitare problemi SSR con event listeners
const BumpOfferModal = dynamic(
  () => import('@/components/libro/BumpOfferModal'),
  { ssr: false }
);

interface BumpOfferWrapperProps {
  libro: Libro;
}

export default function BumpOfferWrapper({ libro }: BumpOfferWrapperProps) {
  return (
    <BumpOfferModal
      libro={libro}
      delaySeconds={15} // Mostra dopo 15 secondi sulla pagina
      onAccept={() => {
        // Analytics: traccia accettazione
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'bump_offer_accepted', {
            libro_slug: libro.slug,
            tier: 'leader',
          });
        }
      }}
      onDecline={() => {
        // Analytics: traccia rifiuto
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'bump_offer_declined', {
            libro_slug: libro.slug,
          });
        }
      }}
    />
  );
}

// Type declaration per window.gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      action: string,
      params?: Record<string, unknown>
    ) => void;
  }
}
