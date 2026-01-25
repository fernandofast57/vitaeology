'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Gift, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { Libro } from '@/data/libri';
import { PRICING_TIERS } from '@/config/pricing';

interface BumpOfferModalProps {
  libro: Libro;
  /** Tempo in secondi prima di abilitare l'exit intent (default: 10s) */
  delaySeconds?: number;
  /** Callback quando l'utente accetta il bump */
  onAccept?: () => void;
  /** Callback quando l'utente rifiuta */
  onDecline?: () => void;
}

export default function BumpOfferModal({
  libro,
  delaySeconds = 10,
  onAccept,
  onDecline,
}: BumpOfferModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [loading, setLoading] = useState(false);

  const leaderTier = PRICING_TIERS.leader;
  const risparmio = libro.prezzo; // Il libro diventa gratuito

  // Abilita exit intent dopo il delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsEnabled(true);
    }, delaySeconds * 1000);

    return () => clearTimeout(timer);
  }, [delaySeconds]);

  // Exit intent detection
  const handleMouseLeave = useCallback((e: MouseEvent) => {
    // Solo se il mouse esce dalla parte superiore della pagina
    if (e.clientY <= 0 && isEnabled && !hasShown) {
      setIsVisible(true);
      setHasShown(true);
    }
  }, [isEnabled, hasShown]);

  // Scroll to bottom detection (alternativa per mobile)
  const handleScroll = useCallback(() => {
    if (!isEnabled || hasShown) return;

    const scrollPosition = window.scrollY + window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Se l'utente ha scrollato oltre l'80% della pagina
    if (scrollPosition / documentHeight > 0.85) {
      // Mostra dopo un breve delay solo se non hanno cliccato acquista
      setTimeout(() => {
        if (!hasShown) {
          setIsVisible(true);
          setHasShown(true);
        }
      }, 3000);
    }
  }, [isEnabled, hasShown]);

  useEffect(() => {
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleMouseLeave, handleScroll]);

  // SECURITY: Valida che l'URL sia sicuro (solo Stripe o path relativi)
  const isValidRedirectUrl = (url: string): boolean => {
    if (!url) return false;
    // Accetta path relativi che iniziano con /
    if (url.startsWith('/') && !url.startsWith('//')) return true;
    // Accetta solo URL Stripe
    try {
      const parsed = new URL(url);
      return parsed.hostname.endsWith('stripe.com');
    } catch {
      return false;
    }
  };

  // Gestisci accettazione bump
  const handleAcceptBump = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/libro/bump-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          libroSlug: libro.slug,
        }),
      });

      const data = await response.json();

      // SECURITY: Valida URL prima del redirect
      if (data.url && isValidRedirectUrl(data.url)) {
        onAccept?.();
        window.location.href = data.url;
      } else if (data.url) {
        throw new Error('URL di redirect non valido');
      } else {
        throw new Error(data.error || 'Errore checkout');
      }
    } catch (error) {
      console.error('Errore bump checkout:', error);
      alert('Si è verificato un errore. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  // Gestisci rifiuto
  const handleDecline = useCallback(() => {
    setIsVisible(false);
    onDecline?.();
  }, [onDecline]);

  // Chiudi con ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDecline();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEsc);
      // Blocca scroll body
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isVisible, handleDecline]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleDecline}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header con gradient */}
        <div className="bg-gradient-to-r from-gold-500 to-gold-600 p-6 text-petrol-600">
          <button
            onClick={handleDecline}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 transition-colors"
            aria-label="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <Gift className="w-8 h-8" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              Offerta Speciale
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold">
            Aspetta! Abbiamo qualcosa di meglio per te
          </h2>
        </div>

        {/* Contenuto */}
        <div className="p-6">
          {/* Confronto offerte */}
          <div className="space-y-4 mb-6">
            {/* Offerta standard (barrata) */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg opacity-60">
              <div className="flex-1">
                <p className="font-medium text-gray-600 line-through">
                  Solo libro &quot;{libro.titolo}&quot;
                </p>
                <p className="text-sm text-gray-500">PDF scaricabile</p>
              </div>
              <span className="text-xl font-bold text-gray-400 line-through">
                €{libro.prezzo.toFixed(2)}
              </span>
            </div>

            {/* Offerta bump */}
            <div className="relative flex items-start gap-4 p-4 bg-gradient-to-r from-gold-50 to-amber-50 rounded-lg border-2 border-gold-500">
              <div className="absolute -top-3 left-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gold-500 text-petrol-600 text-xs font-bold rounded-full">
                  <Sparkles className="w-3 h-3" />
                  CONSIGLIATO
                </span>
              </div>

              <div className="flex-1 pt-2">
                <p className="font-bold text-petrol-600 text-lg">
                  Libro GRATIS + Accesso Leader
                </p>
                <ul className="mt-2 space-y-1">
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    Libro &quot;{libro.titolo}&quot; incluso
                  </li>
                  {leaderTier.features.slice(0, 4).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-right pt-2">
                <span className="text-2xl font-bold text-petrol-600">
                  €{leaderTier.price}
                </span>
                <p className="text-xs text-gray-500">{leaderTier.intervalLabel}</p>
              </div>
            </div>
          </div>

          {/* Risparmio */}
          <div className="text-center mb-6">
            <p className="text-green-600 font-medium">
              Risparmi €{risparmio.toFixed(2)} sul libro + ottieni accesso completo alla piattaforma!
            </p>
          </div>

          {/* CTA buttons */}
          <div className="space-y-3">
            <button
              onClick={handleAcceptBump}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gold-500 text-petrol-600 font-bold text-lg rounded-lg hover:bg-gold-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Elaborazione...
                </>
              ) : (
                <>
                  Voglio l&apos;offerta completa
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <button
              onClick={handleDecline}
              className="w-full px-6 py-3 text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              No grazie, preferisco solo il libro a €{libro.prezzo.toFixed(2)}
            </button>
          </div>

          {/* Trust */}
          <p className="mt-4 text-center text-xs text-gray-400">
            Garanzia 30 giorni soddisfatti o rimborsati
          </p>
        </div>
      </div>
    </div>
  );
}
