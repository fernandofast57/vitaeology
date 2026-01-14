'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useBehavioralTracking } from '@/hooks/useBehavioralTracking';
import {
  ExitIntentPopup,
  EngagementBadge,
  ReturnVisitorBanner,
} from '@/components/behavioral';
import { VideoPlaceholder } from '@/components/challenge/VideoPlaceholder';
import { CHALLENGE_VIDEOS } from '@/config/videos';

// Varianti per A/B Testing - Aggiornate da LANDING_CHALLENGE_3_MICROFELICITA.md
const VARIANTS = {
  A: {
    headline: "Oggi Ti Sono Successe 50 Cose Piacevoli. Ne Hai Notate 3.",
    subheadline: "In 7 giorni impari a vedere quello che già c'è — con il metodo R.A.D.A.R.",
    cta: "Inizia la Challenge Gratuita",
    hook: "Gratis. 7 email in 7 giorni. Nessun impegno."
  },
  B: {
    headline: "Smetti di Cercare. Inizia a Notare.",
    subheadline: "La felicità non si costruisce. Si riconosce. Una microfelicità alla volta.",
    cta: "Inizia Ora",
    hook: "5-7 minuti al giorno. Nessuna filosofia astratta — solo pratica."
  },
  C: {
    headline: "50 Momenti Positivi al Giorno. Quanti ne Noti?",
    subheadline: "Non è che non succede niente di buono. È che non lo noti. Questa sfida cambia questo.",
    cta: "Voglio Iniziare",
    hook: "Il metodo R.A.D.A.R. in 5 passi per intercettare il benessere"
  }
};

type VariantKey = 'A' | 'B' | 'C';

function MicrofelicitaLandingContent() {
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [variant, setVariant] = useState<VariantKey>('A');

  // Behavioral tracking (passa variante per analytics)
  const [behavior, behaviorActions] = useBehavioralTracking('microfelicita', variant);
  const [exitPopupDismissed, setExitPopupDismissed] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const utmSource = searchParams.get('utm_source') || '';
  const utmMedium = searchParams.get('utm_medium') || '';
  const utmCampaign = searchParams.get('utm_campaign') || '';

  useEffect(() => {
    const urlVariant = searchParams.get('v') as VariantKey | null;
    if (urlVariant && ['A', 'B', 'C'].includes(urlVariant)) {
      setVariant(urlVariant);
    } else {
      const randomVariant = ['A', 'B', 'C'][Math.floor(Math.random() * 3)] as VariantKey;
      setVariant(randomVariant);
    }
  }, [searchParams]);

  const content = VARIANTS[variant];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/challenge/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          nome,
          challenge: 'microfelicita',
          variant,
          utmSource,
          utmMedium,
          utmCampaign
        })
      });

      if (response.ok) {
        setSuccess(true);
        behaviorActions.trackConversion();
        if (typeof window !== 'undefined' && (window as unknown as { gtag?: (cmd: string, event: string, params: object) => void }).gtag) {
          (window as unknown as { gtag: (cmd: string, event: string, params: object) => void }).gtag('event', 'challenge_signup', {
            challenge: 'microfelicita',
            variant
          });
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Si è verificato un errore. Riprova.');
      }
    } catch {
      setError('Errore di connessione. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  // Handler per exit intent popup
  const handleExitIntentSubmit = async (exitEmail: string) => {
    setEmail(exitEmail);
    setNome('Visitatore');

    const response = await fetch('/api/challenge/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: exitEmail,
        nome: 'Visitatore',
        challenge: 'microfelicita',
        variant,
        utmSource,
        utmMedium,
        utmCampaign
      })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Errore iscrizione');
    }

    setSuccess(true);
    behaviorActions.trackExitIntentConverted();

    if (typeof window !== 'undefined' && (window as unknown as { gtag?: (cmd: string, event: string, params: object) => void }).gtag) {
      (window as unknown as { gtag: (cmd: string, event: string, params: object) => void }).gtag('event', 'challenge_signup', {
        challenge: 'microfelicita',
        variant,
        source: 'exit_intent'
      });
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-lg text-center">
          <div className="w-20 h-20 bg-violet-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Benvenuto/a!</h2>
          <p className="text-slate-300 mb-6">
            Controlla la tua email. Il Giorno 1 — Il Segnale Debole — sta arrivando.
          </p>
          <p className="text-violet-400 text-sm">
            Nel frattempo, scopri il tuo profilo benessere:
          </p>
          <Link
            href="/test"
            className="inline-block mt-4 bg-violet-500 hover:bg-violet-600 text-white font-bold py-3 px-8 rounded-lg transition"
          >
            Fai il Test Gratuito
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-900 to-slate-900">
      {/* Return Visitor Banner */}
      {behavior.isReturnVisitor && !bannerDismissed && !success && (
        <ReturnVisitorBanner
          isVisible={true}
          onDismiss={() => setBannerDismissed(true)}
          challengeType="microfelicita"
          visitCount={behavior.visitCount}
          onCtaClick={() => {
            document.querySelector('input[type="email"]')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      )}

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-block bg-violet-500/20 border border-violet-500/30 rounded-full px-4 py-1 mb-8">
            <span className="text-violet-400 text-sm font-medium">
              Sfida Gratuita - 7 Giorni
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {content.headline}
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto">
            {content.subheadline}
          </p>

          {/* Video Hero */}
          <VideoPlaceholder
            challengeType="microfelicita"
            videoUrl={CHALLENGE_VIDEOS.microfelicita.hero}
          />

          {/* Hook */}
          <p className="text-violet-400 font-medium mb-12">
            {content.hook}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
            <input
              type="text"
              placeholder="Il tuo nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              onFocus={() => behaviorActions.trackFormFocus()}
              onBlur={() => behaviorActions.trackFormBlur()}
              required
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-violet-500"
            />
            <input
              type="email"
              placeholder="La tua email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => behaviorActions.trackFormFocus()}
              onBlur={() => behaviorActions.trackFormBlur()}
              required
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-violet-500"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-500 hover:bg-violet-600 text-white font-bold py-4 px-8 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Iscrizione in corso...' : content.cta}
            </button>
            {/* Engagement Badge */}
            {behavior.engagementScore > 60 && !success && (
              <div className="flex justify-center">
                <EngagementBadge
                  isVisible={true}
                  score={behavior.engagementScore}
                  challengeType="microfelicita"
                />
              </div>
            )}
          </form>

          <p className="text-slate-500 text-sm mt-4">
            7 email. Una al giorno. Zero rumore.
          </p>
        </div>
      </section>

      {/* The Science */}
      <section className="py-16 px-4 bg-slate-800/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-6">
            Perché Perdi il 90% del Benessere Quotidiano?
          </h2>
          <p className="text-slate-300 mb-8">
            Daniel Kahneman ha scoperto che il cervello è come il <strong className="text-white">velcro per le esperienze negative</strong>
            e come il <strong className="text-white">teflon per quelle positive</strong>.
          </p>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <div className="text-3xl mb-2">🧠</div>
              <h3 className="text-white font-semibold mb-2">Il Cervello Filtra</h3>
              <p className="text-slate-400 text-sm">
                I segnali positivi non attivano allarmi, quindi vengono ignorati
              </p>
            </div>
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="text-white font-semibold mb-2">1 Secondo vs 20</h3>
              <p className="text-slate-400 text-sm">
                Dedichiamo meno di 1 secondo ai momenti positivi. Servono 12-20 per creare memoria
              </p>
            </div>
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <div className="text-3xl mb-2">🔄</div>
              <h3 className="text-white font-semibold mb-2">Si Può Invertire</h3>
              <p className="text-slate-400 text-sm">
                Con 7 secondi di attenzione intenzionale, cambi il pattern
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Discover */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
            Cosa Scoprirai in 7 Giorni
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { day: '1', title: 'Il Primo Inventario', desc: 'Quello che ti perdi ogni giorno senza accorgertene' },
              { day: '2', title: 'La Matematica', desc: 'Perché 50 momenti piccoli battono 4 momenti grandi' },
              { day: '3', title: 'R.A.D.A.R.', desc: 'I 5 passi per notare in tempo reale: Rileva-Accogli-Distingui-Amplifica-Resta' },
              { day: '4', title: 'Gli Errori da Evitare', desc: 'I 4 modi in cui R.A.D.A.R. fallisce — e come correggerli' },
              { day: '5', title: 'Quando È Dura', desc: 'R.A.D.A.R. non nega il negativo — lo bilancia' },
              { day: '6', title: 'Farlo Automatico', desc: 'Come collegarlo a qualcosa che già fai ogni giorno' },
              { day: '7', title: 'Da Qui in Avanti', desc: '21 giorni per consolidare l\'abitudine' },
            ].map((item) => (
              <div key={item.day} className="flex gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="flex-shrink-0 w-12 h-12 bg-violet-500/20 rounded-full flex items-center justify-center">
                  <span className="text-violet-400 font-bold">{item.day}</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 Channels Visual */}
      <section className="py-16 px-4 bg-slate-800/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-8">
            La Microfelicità Arriva da 5 Canali
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { icon: '👁️', label: 'Visivo', example: 'Una luce, un colore' },
              { icon: '👂', label: 'Uditivo', example: 'Un suono, un silenzio' },
              { icon: '🤲', label: 'Corporeo', example: 'Una sensazione fisica' },
              { icon: '👃', label: 'Olfattivo', example: 'Un profumo, un sapore' },
              { icon: '💭', label: 'Cognitivo', example: 'Un pensiero piacevole' },
            ].map((channel) => (
              <div key={channel.label} className="w-36 p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                <div className="text-3xl mb-2">{channel.icon}</div>
                <div className="text-white font-semibold">{channel.label}</div>
                <div className="text-slate-400 text-xs mt-1">{channel.example}</div>
              </div>
            ))}
          </div>
          <p className="text-slate-400 mt-8 text-sm">
            Se cerchi la microfelicità solo nelle emozioni, perdi l&apos;80% delle opportunità.
          </p>
        </div>
      </section>

      {/* Author Section */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-violet-400 to-violet-600 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">FM</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Fernando Marongiu</h3>
          <p className="text-violet-400 mb-4">Fondatore Vitaeology</p>
          <p className="text-slate-300 max-w-xl mx-auto">
            &quot;Per decenni ho cercato la felicità nei risultati grandi. Ho capito che la qualità della vita quotidiana non dipende dai momenti straordinari — dipende da quanti momenti ordinari noti.&quot;
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 bg-gradient-to-t from-violet-500/10 to-transparent">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto/a a Notare?
          </h2>
          <p className="text-slate-300 mb-8">
            7 giorni. 5 minuti al giorno. Una pratica per sessione.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="La tua email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => behaviorActions.trackFormFocus()}
              onBlur={() => behaviorActions.trackFormBlur()}
              required
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-violet-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-500 hover:bg-violet-600 text-white font-bold py-4 px-8 rounded-lg transition"
            >
              {content.cta}
            </button>
            {/* Engagement Badge */}
            {behavior.engagementScore > 60 && !success && (
              <div className="flex justify-center">
                <EngagementBadge
                  isVisible={true}
                  score={behavior.engagementScore}
                  challengeType="microfelicita"
                />
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center text-slate-500 text-sm">
          <p>&copy; 2025 Vitaeology - <Link href="/privacy" className="hover:text-slate-300">Privacy</Link></p>
        </div>
      </footer>

      {/* Exit Intent Popup */}
      {behavior.isExitIntent && !exitPopupDismissed && !success && (
        <ExitIntentPopup
          isVisible={true}
          onDismiss={() => {
            setExitPopupDismissed(true);
            behaviorActions.dismissExitIntent();
          }}
          onSubmit={handleExitIntentSubmit}
          challengeType="microfelicita"
          engagementScore={behavior.engagementScore}
          scrollDepth={behavior.maxScrollDepth}
        />
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-900 to-slate-900 flex items-center justify-center">
      <div className="text-white">Caricamento...</div>
    </div>
  );
}

export default function MicrofelicitaLanding() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MicrofelicitaLandingContent />
    </Suspense>
  );
}
