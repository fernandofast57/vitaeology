'use client';

import { useState, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBehavioralTracking } from '@/hooks/useBehavioralTracking';
import {
  ExitIntentPopup,
  EngagementBadge,
  ReturnVisitorBanner,
} from '@/components/behavioral';
import { LandingVideoPlayer } from '@/components/LandingVideoPlayer';
import { LANDING_VIDEOS } from '@/config/videos';
import Turnstile from '@/components/Turnstile';

// Nuova versione: Epiphany Bridge con Storia Fernando
// Conformità: MEGA_PROMPT v4.3, CONTROL_TOWER v1.2, COPY_REALIGNMENT_ANALYSIS
// Entry point emotivo: -7 (Rovina) → Iscrizione Challenge

function LeadershipLandingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileExpired, setTurnstileExpired] = useState(false);
  const [turnstileKey, setTurnstileKey] = useState(0);

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
    setTurnstileExpired(false);
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken(null);
    setTurnstileExpired(true);
    // Auto-refresh widget dopo 1 secondo
    setTimeout(() => {
      setTurnstileKey(prev => prev + 1);
      setTurnstileExpired(false);
    }, 1000);
  }, []);

  // Behavioral tracking
  const [behavior, behaviorActions] = useBehavioralTracking('leadership', 'epiphany');
  const [exitPopupDismissed, setExitPopupDismissed] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Legge UTM dai parametri URL
  const utmSource = searchParams.get('utm_source') || '';
  const utmMedium = searchParams.get('utm_medium') || '';
  const utmCampaign = searchParams.get('utm_campaign') || '';
  const utmContent = searchParams.get('utm_content') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!turnstileToken) {
      setError('Attendi la verifica di sicurezza...');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/challenge/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          nome,
          challenge: 'leadership-autentica',
          variant: 'epiphany',
          utmSource,
          utmMedium,
          utmCampaign,
          utmContent,
          turnstileToken
        })
      });

      if (response.ok) {
        behaviorActions.trackConversion();
        if (typeof window !== 'undefined' && (window as unknown as { gtag?: (cmd: string, event: string, params: object) => void }).gtag) {
          (window as unknown as { gtag: (cmd: string, event: string, params: object) => void }).gtag('event', 'challenge_signup', {
            challenge: 'leadership-autentica',
            variant: 'epiphany'
          });
        }
        // Redirect alla Thank You page con OTO
        const utmParams = new URLSearchParams();
        utmParams.set('fresh', 'true'); // Reset timer OTO per nuova iscrizione
        if (utmSource) utmParams.set('utm_source', utmSource);
        if (utmMedium) utmParams.set('utm_medium', utmMedium);
        if (utmCampaign) utmParams.set('utm_campaign', utmCampaign);
        if (utmContent) utmParams.set('utm_content', utmContent);
        const qs = utmParams.toString();
        router.push(`/challenge/leadership/grazie?${qs}`);
        return;
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
    if (!turnstileToken) {
      throw new Error('Verifica di sicurezza non completata');
    }

    setEmail(exitEmail);
    setNome('Visitatore');

    const response = await fetch('/api/challenge/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: exitEmail,
        nome: 'Visitatore',
        challenge: 'leadership-autentica',
        variant: 'epiphany',
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent,
        turnstileToken
      })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Errore iscrizione');
    }

    behaviorActions.trackExitIntentConverted();

    if (typeof window !== 'undefined' && (window as unknown as { gtag?: (cmd: string, event: string, params: object) => void }).gtag) {
      (window as unknown as { gtag: (cmd: string, event: string, params: object) => void }).gtag('event', 'challenge_signup', {
        challenge: 'leadership-autentica',
        variant: 'epiphany',
        source: 'exit_intent'
      });
    }

    const exitUtmParams = new URLSearchParams();
    exitUtmParams.set('fresh', 'true'); // Reset timer OTO per nuova iscrizione
    if (utmSource) exitUtmParams.set('utm_source', utmSource);
    if (utmMedium) exitUtmParams.set('utm_medium', utmMedium);
    if (utmCampaign) exitUtmParams.set('utm_campaign', utmCampaign);
    if (utmContent) exitUtmParams.set('utm_content', utmContent);
    const exitQs = exitUtmParams.toString();
    router.push(`/challenge/leadership/grazie?${exitQs}`);
  };

  // Form component riutilizzabile
  const SignupForm = ({ showName = true, className = '' }: { showName?: boolean; className?: string }) => (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {showName && (
        <input
          type="text"
          placeholder="Il tuo nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onFocus={() => behaviorActions.trackFormFocus()}
          onBlur={() => behaviorActions.trackFormBlur()}
          required
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
        />
      )}
      <input
        type="email"
        placeholder="La tua email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onFocus={() => behaviorActions.trackFormFocus()}
        onBlur={() => behaviorActions.trackFormBlur()}
        required
        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
      />
      {/* Turnstile - captcha invisibile */}
      <div className="flex flex-col items-center gap-2">
        <Turnstile
          key={turnstileKey}
          onVerify={handleTurnstileVerify}
          onExpire={handleTurnstileExpire}
          theme="dark"
        />
        {turnstileExpired && (
          <p className="text-sm text-amber-400">
            Verifica di sicurezza scaduta. Rinnovo in corso...
          </p>
        )}
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading || !turnstileToken}
        className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-4 px-8 rounded-lg transition disabled:opacity-50"
      >
        {loading ? 'Iscrizione in corso...' : 'Inizia la Challenge Gratuita'}
      </button>
      {behavior.engagementScore > 60 && (
        <div className="flex justify-center">
          <EngagementBadge
            isVisible={true}
            score={behavior.engagementScore}
            challengeType="leadership"
          />
        </div>
      )}
    </form>
  );

  // FAQ Data (da OCEANO_BLU_VITAEOLOGY)
  const faqItems = [
    {
      q: "Quanto tempo richiede ogni giorno?",
      a: "Circa 10 minuti. Ogni esercizio è progettato per essere completato anche in una pausa caffè."
    },
    {
      q: "È davvero gratuito?",
      a: "Sì, la challenge di 7 giorni è completamente gratuita. Nessun pagamento, nessun obbligo."
    },
    {
      q: "Devo avere esperienza di leadership?",
      a: "No. Il percorso è pensato per chi già guida (anche informalmente) e vuole farlo in modo più autentico."
    },
    {
      q: "Cosa succede dopo i 7 giorni?",
      a: "Riceverai informazioni su come continuare il percorso, ma senza alcun obbligo."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      {/* Return Visitor Banner */}
      {behavior.isReturnVisitor && !bannerDismissed && (
        <ReturnVisitorBanner
          isVisible={true}
          onDismiss={() => setBannerDismissed(true)}
          challengeType="leadership"
          visitCount={behavior.visitCount}
          onCtaClick={() => {
            document.querySelector('input[type="email"]')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      )}

      {/* ===== SEZIONE 1: HERO ===== */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-block bg-amber-500/20 border border-amber-500/30 rounded-full px-4 py-1 mb-8">
            <span className="text-amber-400 text-sm font-medium">
              Challenge Gratuita - 7 Giorni
            </span>
          </div>

          {/* Headline - Principio Validante */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
            Il leader che cerchi<br />
            <span className="text-amber-400">è già dentro di te</span>
          </h1>

          {/* Subheadline - Keyword ottimizzata */}
          <div className="max-w-2xl mx-auto mb-8">
            <p className="text-xl md:text-2xl text-slate-300">
              In 7 giorni imparerai a guidare con autorevolezza,<br />
              motivare i collaboratori e delegare senza perdere il controllo
            </p>
          </div>

          {/* Video Hero */}
          <div className="mb-8">
            <LandingVideoPlayer
              videoUrl={LANDING_VIDEOS.leadership.videoUrl}
              thumbnailUrl={LANDING_VIDEOS.leadership.thumbnail}
              title="Challenge Leadership Autentica"
            />
          </div>

          {/* CTA Form */}
          <div className="max-w-md mx-auto">
            <SignupForm />
            <p className="text-slate-500 text-sm mt-4">
              7 giorni. 7 email. Nessun costo.
            </p>
          </div>
        </div>
      </section>

      {/* ===== SEZIONE 2: COSA RICEVI ===== */}
      <section className="py-20 px-4 bg-slate-800/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Cosa imparerai in 7 giorni
          </h2>

          <div className="space-y-4">
            {[
              'Tirare fuori il meglio dai collaboratori senza dover ripetere le cose',
              'Creare spirito di gruppo anche con persone difficili',
              'Gestire i conflitti senza perdere autorevolezza',
              'Far crescere le persone che poi faranno crescere l\'azienda',
              'Solo 10 minuti al giorno — mentre sei in macchina o sotto la doccia'
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <span className="text-amber-400 text-xl flex-shrink-0">✓</span>
                <p className="text-slate-300 text-lg">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SEZIONE 4: COSA SUCCEDE IN 7 GIORNI ===== */}
      <section className="py-20 px-4 bg-slate-800/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            7 giorni per vedere<br />
            <span className="text-amber-400">quello che già sai fare</span>
          </h2>

          <p className="text-slate-400 text-center max-w-2xl mx-auto mb-12">
            Non ti insegnerò &quot;tecniche di leadership&quot;.
            Non ti darò liste di cose da fare.
            Non ti dirò come dovresti essere.
            <br /><br />
            Ti mostrerò come già <strong className="text-white">SEI</strong> —
            quando funzioni al meglio.
            E ti aiuterò a farlo con direzione, invece che reagendo agli eventi.
          </p>

          <div className="space-y-4">
            {[
              { day: '1', title: '"Qualcosa non funziona"', desc: 'Partiamo da quello che senti. E ti mostro che questa sensazione È il primo segno di leadership.' },
              { day: '2', title: 'La voce che sminuisce', desc: 'C\'è qualcosa che sabota i tuoi momenti migliori. Impari a riconoscerlo.' },
              { day: '3', title: 'Vedere le cose come sono', desc: 'Come un parabrezza pulito: la lucidità non è un dono, è una scelta.' },
              { day: '4', title: 'Agire anche con la paura', desc: 'Il coraggio non è assenza di paura. È quello che fai MENTRE hai paura.' },
              { day: '5', title: 'Sapere quando fermarti', desc: 'L\'energia non è infinita. Ma il modo in cui la usi, sì.' },
              { day: '6', title: 'Il TUO modo', desc: 'Non esiste UN modello di leader. Esiste quello che funziona PER TE.' },
              { day: '7', title: 'E adesso?', desc: 'Come continuare — con gli strumenti che hai già.' },
            ].map((item) => (
              <div key={item.day} className="flex gap-6 p-6 bg-slate-900/50 rounded-xl border border-slate-700/50 hover:border-amber-500/30 transition-colors">
                <div className="flex-shrink-0 w-14 h-14 bg-amber-500/20 rounded-full flex items-center justify-center">
                  <span className="text-amber-400 font-bold text-lg">{item.day}</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">{item.title}</h3>
                  <p className="text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Open Loop */}
          <div className="mt-12 p-8 bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 rounded-xl">
            <p className="text-slate-300 text-lg leading-relaxed">
              <strong className="text-white">Alla fine dei 7 giorni avrai una mappa.</strong>
            </p>
            <p className="text-slate-400 mt-4">
              Non una mappa di quello che TI MANCA —
              ma di quello che HAI GIÀ e che puoi usare quando vuoi.
            </p>
            <p className="text-slate-400 mt-4">
              Se vorrai approfondire, ti mostrerò come.
              Ma la Challenge è completa in sé.
            </p>
          </div>
        </div>
      </section>

      {/* ===== SEZIONE 5: PER CHI È ===== */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Questa Challenge è per te se...
          </h2>

          <div className="space-y-4">
            {[
              'Guidi un\'azienda, un team, o anche solo te stesso — e senti che qualcosa potrebbe funzionare meglio',
              'Hai avuto successi ma non hai ancora riconosciuto cosa li ha causati (e come ripeterli)',
              'Ti ritrovi a "fare tutto tu" anche quando vorresti delegare',
              'Senti che le persone ti capiscono ma poi non ti seguono',
              'Preferisci capire PERCHÉ qualcosa funziona invece di copiare formule'
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-4">
                <span className="text-amber-400 text-xl flex-shrink-0">✓</span>
                <p className="text-slate-300 text-lg">{item}</p>
              </div>
            ))}
          </div>

          <p className="text-slate-500 text-center mt-8">
            Non serve avere un&apos;azienda grande.
            Non serve avere esperienza di leadership.
            Serve voler capire qualcosa su di te.
          </p>
        </div>
      </section>

      {/* ===== SEZIONE 6: CHI SONO ===== */}
      <section className="py-20 px-4 bg-slate-800/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-8">Chi ti guiderà</h2>

          <div className="w-32 h-32 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-4xl font-bold text-slate-900">FM</span>
          </div>

          <h3 className="text-2xl font-bold text-white mb-2">Fernando Marongiu</h3>
          <p className="text-amber-400 mb-6">Fondatore Vitaeology</p>

          <div className="text-left space-y-4 text-slate-300">
            <p>
              Fernando Marongiu è imprenditore da oltre 50 anni.
            </p>
            <p>
              Non insegna teoria da manuale, ma condivide ciò che ha scoperto sul campo:
              la leadership autentica non si costruisce imitando altri,
              ma riconoscendo ciò che già si possiede.
            </p>
          </div>
        </div>
      </section>

      {/* ===== SEZIONE 7: CTA FINALE ===== */}
      <section className="py-20 px-4">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Inizia oggi
          </h2>
          <p className="text-slate-300 mb-8">
            7 giorni. 7 email.<br />
            7 modi per vedere quello che già sai fare.
          </p>
          <p className="text-slate-400 mb-8">
            Nessun costo. Nessun impegno.<br />
            Solo una mappa di quello che sei già.
          </p>

          <SignupForm showName={true} />

          <p className="text-slate-500 text-sm mt-4">
            Riceverai la prima email entro pochi minuti dall&apos;iscrizione.
          </p>
        </div>
      </section>

      {/* ===== SEZIONE 8: FAQ ===== */}
      <section className="py-20 px-4 bg-slate-800/30">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-12">
            Domande frequenti
          </h2>

          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <div
                key={i}
                className="border border-slate-700 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-slate-800/50 transition-colors"
                >
                  <span className="text-white font-medium">{item.q}</span>
                  <span className="text-amber-400 text-xl">
                    {openFaq === i ? '−' : '+'}
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-slate-400">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SEZIONE 9: FOOTER ===== */}
      <section className="py-16 px-4 border-t border-slate-800">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-slate-400 text-lg mb-8">
            La leadership che cerchi<br />
            non è fuori da te.
          </p>
          <p className="text-white text-xl font-medium mb-8">
            È quello che fai già<br />
            quando funzioni al meglio.
          </p>
          <p className="text-amber-400 mb-8">
            Questa settimana impari a vederlo.
          </p>

          <button
            onClick={() => document.querySelector('input[type="email"]')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-4 px-12 rounded-lg transition"
          >
            Inizia Ora
          </button>
        </div>
      </section>

      {/* Footer Legal */}
      <footer className="py-8 px-4 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center text-slate-500 text-sm">
          <p>&copy; 2026 Vitaeology - <Link href="/privacy" className="hover:text-slate-300">Privacy</Link></p>
        </div>
      </footer>

      {/* Exit Intent Popup */}
      {behavior.isExitIntent && !exitPopupDismissed && (
        <ExitIntentPopup
          isVisible={true}
          onDismiss={() => {
            setExitPopupDismissed(true);
            behaviorActions.dismissExitIntent();
          }}
          onSubmit={handleExitIntentSubmit}
          challengeType="leadership"
          engagementScore={behavior.engagementScore}
          scrollDepth={behavior.maxScrollDepth}
        />
      )}
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

export default function LeadershipLanding() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LeadershipLandingContent />
    </Suspense>
  );
}
