'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { getChallengeColors, getChallengeLibroSlug } from '@/lib/challenge/config';

// Dati specifici per la pagina grazie (OTO)
const GRAZIE_DATA: Record<string, {
  libroTitolo: string;
  message: string;
}> = {
  leadership: {
    libroTitolo: 'Leadership Autentica',
    message: 'Il primo passo verso la leadership che già possiedi inizia ora.',
  },
  ostacoli: {
    libroTitolo: 'Oltre gli Ostacoli',
    message: 'Ti racconterò della tessera ristoranti del 1993 — e di cosa ho imparato dai miei errori.',
  },
  microfelicita: {
    libroTitolo: 'Microfelicità Digitale',
    message: 'Preparati a scoprire quanto benessere ti attraversa ogni giorno.',
  },
};

// Prezzo OTO e prezzo pieno
const OTO_PRICE = 7.90;
const FULL_PRICE = 9.90;
const OTO_TIMER_SECONDS = 900; // 15 minuti

function GrazieContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const challengeType = params.type as string;

  const [timeLeft, setTimeLeft] = useState(OTO_TIMER_SECONDS);
  const [otoDismissed, setOtoDismissed] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const colors = getChallengeColors(challengeType);
  const grazie = GRAZIE_DATA[challengeType] || GRAZIE_DATA.leadership;
  const libroSlug = getChallengeLibroSlug(challengeType);
  const isOtoActive = timeLeft > 0 && !otoDismissed;
  const currentPrice = isOtoActive ? OTO_PRICE : FULL_PRICE;

  // UTM passthrough
  const utmSource = searchParams.get('utm_source') || '';
  const utmMedium = searchParams.get('utm_medium') || '';
  const utmCampaign = searchParams.get('utm_campaign') || '';
  const utmContent = searchParams.get('utm_content') || '';

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 || otoDismissed) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, otoDismissed]);

  // Formatta minuti:secondi
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Gestisci checkout libro
  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const response = await fetch('/api/libro/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          libroSlug,
          otoDiscount: isOtoActive,
          source: 'challenge_oto',
          utmSource,
          utmMedium,
          utmCampaign,
          utmContent,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // Fallback: redirect alla landing libro
      window.location.href = `/libro/${libroSlug}`;
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Traccia evento Meta Pixel Lead (se disponibile)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Meta Pixel
      const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
      if (fbq) {
        fbq('track', 'Lead', {
          content_name: `challenge_${challengeType}`,
          content_category: 'challenge_signup',
        });
      }
      // Google Analytics
      const gtag = (window as unknown as { gtag?: (cmd: string, event: string, params: object) => void }).gtag;
      if (gtag) {
        gtag('event', 'challenge_signup_confirmed', {
          challenge: challengeType,
        });
      }
    }
  }, [challengeType]);

  return (
    <div
      className="min-h-screen"
      style={{ background: `linear-gradient(to bottom, ${colors.gradientFrom}, ${colors.gradientTo})` }}
    >
      {/* Conferma iscrizione */}
      <section className="pt-20 pb-12 px-4">
        <div className="max-w-lg mx-auto text-center">
          {/* Checkmark */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: colors.accentColor }}
          >
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">
            Iscrizione confermata!
          </h1>

          <p className="text-slate-300 mb-4">
            Il <strong className="text-white">Giorno 1</strong> arriva domani alle 8:00 nella tua casella email.
          </p>

          <p className="text-sm" style={{ color: colors.badgeColor }}>
            {grazie.message}
          </p>
        </div>
      </section>

      {/* OTO: Offerta libro */}
      <section className="py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header OTO */}
            <div className="px-6 py-4 text-center" style={{ backgroundColor: colors.accentColor }}>
              {isOtoActive ? (
                <>
                  <p className="text-white font-bold text-lg">
                    Offerta di benvenuto
                  </p>
                  <p className="text-white/90 text-sm mt-1">
                    Valida per <span className="font-mono font-bold text-lg">{formatTime(timeLeft)}</span>
                  </p>
                </>
              ) : (
                <p className="text-white font-bold text-lg">
                  Approfondisci il percorso
                </p>
              )}
            </div>

            {/* Contenuto OTO */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {grazie.libroTitolo}
              </h3>

              <p className="text-gray-600 text-sm mb-4">
                Il libro completo per approfondire tutto ciò che scoprirai nella Challenge.
                Contiene esercizi avanzati, casi studio e il QR code per l&apos;Assessment completo.
              </p>

              {/* Prezzo */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  €{currentPrice.toFixed(2)}
                </span>
                {isOtoActive && (
                  <span className="text-gray-400 line-through text-lg">
                    €{FULL_PRICE.toFixed(2)}
                  </span>
                )}
                <span className="text-gray-500 text-sm">
                  PDF scaricabile
                </span>
              </div>

              {/* Cosa include */}
              <div className="space-y-2 mb-6">
                {[
                  'Guida completa con esercizi avanzati',
                  'QR code per Assessment Explorer',
                  'Accesso permanente',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 flex-shrink-0" style={{ color: colors.accentColor }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* CTA Acquista */}
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full text-white font-bold py-4 px-8 rounded-lg transition disabled:opacity-50 hover:opacity-90"
                style={{ backgroundColor: colors.accentColor }}
              >
                {checkoutLoading ? 'Reindirizzamento...' : `Aggiungi il libro — €${currentPrice.toFixed(2)}`}
              </button>

              {/* No grazie */}
              {!otoDismissed && (
                <button
                  onClick={() => setOtoDismissed(true)}
                  className="w-full mt-3 text-gray-400 hover:text-gray-600 text-sm py-2 transition"
                >
                  No grazie, procedo senza libro
                </button>
              )}

              {/* Garanzia */}
              <p className="text-gray-400 text-xs text-center mt-4">
                Garanzia soddisfatti o rimborsati 30 giorni
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Post-dismiss: link alla dashboard */}
      {otoDismissed && (
        <section className="py-8 px-4">
          <div className="max-w-lg mx-auto text-center">
            <p className="text-slate-400 text-sm mb-4">
              La tua Challenge inizia domani. Controlla la casella email!
            </p>
            <Link
              href="/dashboard"
              className="text-slate-400 hover:text-white text-sm underline transition"
            >
              Vai alla Dashboard
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-800 mt-auto">
        <div className="max-w-4xl mx-auto text-center text-slate-500 text-sm">
          <p>&copy; 2026 Vitaeology - <Link href="/privacy" className="hover:text-slate-300">Privacy</Link></p>
        </div>
      </footer>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-white">Caricamento...</div>
    </div>
  );
}

export default function GraziePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GrazieContent />
    </Suspense>
  );
}
