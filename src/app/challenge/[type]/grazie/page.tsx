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

// Storage key per persistere il timer
const OTO_STORAGE_KEY = 'vitae_oto_start_';

function GrazieContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const challengeType = params.type as string;

  const [timeLeft, setTimeLeft] = useState<number | null>(null); // null = loading
  const [otoDismissed, setOtoDismissed] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const colors = getChallengeColors(challengeType);
  const grazie = GRAZIE_DATA[challengeType] || GRAZIE_DATA.leadership;
  const libroSlug = getChallengeLibroSlug(challengeType);

  // OTO attivo solo se timer > 0 E non dismissed E non in transizione
  const isOtoActive = (timeLeft !== null && timeLeft > 0) && !otoDismissed && !isTransitioning;
  // Mostra Thank You se dismissed O timer scaduto (dopo transizione)
  const showThankYou = otoDismissed || (timeLeft !== null && timeLeft <= 0);
  const currentPrice = isOtoActive ? OTO_PRICE : FULL_PRICE;

  // UTM passthrough
  const utmSource = searchParams.get('utm_source') || '';
  const utmMedium = searchParams.get('utm_medium') || '';
  const utmCampaign = searchParams.get('utm_campaign') || '';
  const utmContent = searchParams.get('utm_content') || '';

  // Inizializza timer da localStorage (persistenza tra refresh)
  // Se fresh=true (nuova iscrizione), resetta sempre a 900 secondi
  useEffect(() => {
    const storageKey = OTO_STORAGE_KEY + challengeType;
    const isFreshSignup = searchParams.get('fresh') === 'true';

    try {
      // Fresh signup: cancella vecchio timer e riparti da 900
      if (isFreshSignup) {
        localStorage.removeItem(storageKey);
        localStorage.setItem(storageKey, Date.now().toString());
        setTimeLeft(OTO_TIMER_SECONDS);
        return;
      }

      const stored = localStorage.getItem(storageKey);

      if (stored) {
        const startTime = parseInt(stored, 10);
        // Validazione NaN: se corrotto, resetta
        if (isNaN(startTime)) {
          localStorage.removeItem(storageKey);
          localStorage.setItem(storageKey, Date.now().toString());
          setTimeLeft(OTO_TIMER_SECONDS);
          return;
        }
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.max(0, OTO_TIMER_SECONDS - elapsed);
        setTimeLeft(remaining);
      } else {
        // Prima visita: salva timestamp e inizia timer
        localStorage.setItem(storageKey, Date.now().toString());
        setTimeLeft(OTO_TIMER_SECONDS);
      }
    } catch {
      // localStorage non disponibile (private browsing, quota exceeded, etc.)
      // Fallback: timer in-memory senza persistenza
      setTimeLeft(OTO_TIMER_SECONDS);
    }
  }, [challengeType, searchParams]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || otoDismissed) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          // Timer scaduto: avvia transizione
          setIsTransitioning(true);
          setTimeout(() => {
            setIsTransitioning(false);
          }, 300); // durata fade-out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, otoDismissed]);

  // Gestisce il dismiss manuale con transizione
  const handleDismiss = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setOtoDismissed(true);
      setIsTransitioning(false);
    }, 300);
  };

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

      {/* Loading state: mostra spinner mentre timeLeft è null */}
      {timeLeft === null && (
        <section className="py-8 px-4">
          <div className="max-w-lg mx-auto flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/50"></div>
          </div>
        </section>
      )}

      {/* OTO: Offerta libro (solo se timer > 0 e non dismissed, con fade-out durante transizione) */}
      {timeLeft !== null && !otoDismissed && (timeLeft > 0 || isTransitioning) && (
        <section
          className={`py-8 px-4 transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
        >
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
                <button
                  onClick={handleDismiss}
                  disabled={isTransitioning}
                  className="w-full mt-4 text-gray-500 hover:text-gray-700 text-sm font-medium py-3 min-h-[44px] transition flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  No grazie, procedo con la Challenge
                  <span aria-hidden="true">&rarr;</span>
                </button>

                {/* Garanzia */}
                <p className="text-gray-400 text-xs text-center mt-4">
                  Garanzia soddisfatti o rimborsati 30 giorni
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Post-dismiss / Timer scaduto: Thank You completo */}
      {showThankYou && (
        <section className="py-12 px-4 animate-fadeIn">
          <div className="max-w-lg mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              {/* Icona successo */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              {/* Titolo */}
              <h2 className="text-2xl font-bold text-white text-center mb-4">
                Perfetto, sei dentro!
              </h2>

              {/* Messaggio */}
              <p className="text-slate-300 text-center mb-8">
                La tua Challenge inizia domani mattina. Riceverai un&apos;email con il primo esercizio direttamente nella tua casella di posta.
              </p>

              {/* 3 Step */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                    1
                  </div>
                  <div>
                    <p className="text-white font-medium">Controlla la tua email</p>
                    <p className="text-slate-400 text-sm">Ti abbiamo inviato una conferma (guarda anche nello spam)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                    2
                  </div>
                  <div>
                    <p className="text-white font-medium">Domani mattina riceverai il Day 1</p>
                    <p className="text-slate-400 text-sm">La Challenge arriva ogni giorno alle 8:00</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                    3
                  </div>
                  <div>
                    <p className="text-white font-medium">Nel frattempo, esplora la Dashboard</p>
                    <p className="text-slate-400 text-sm">La tua area personale ti aspetta</p>
                  </div>
                </div>
              </div>

              {/* CTA Primario */}
              <Link
                href="/dashboard"
                className="block w-full text-center font-bold py-4 px-8 rounded-lg transition hover:opacity-90"
                style={{ backgroundColor: colors.accentColor, color: 'white' }}
              >
                Vai alla Dashboard
              </Link>
            </div>
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
