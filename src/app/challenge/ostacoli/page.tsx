'use client';

import { useState, Suspense } from 'react';
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

// Nuova versione: Epiphany Bridge con Storia Fernando (TheFork 1993)
// Conformità: MEGA_PROMPT v4.3, CONTROL_TOWER v1.2, COPY_REALIGNMENT_ANALYSIS
// Entry point emotivo: -7 (Rovina) → Iscrizione Challenge

function OstacoliLandingContent() {
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Behavioral tracking
  const [behavior, behaviorActions] = useBehavioralTracking('ostacoli', 'epiphany');
  const [exitPopupDismissed, setExitPopupDismissed] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Legge UTM dai parametri URL
  const utmSource = searchParams.get('utm_source') || '';
  const utmMedium = searchParams.get('utm_medium') || '';
  const utmCampaign = searchParams.get('utm_campaign') || '';

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
          challenge: 'oltre-ostacoli',
          variant: 'epiphany',
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
            challenge: 'oltre-ostacoli',
            variant: 'epiphany'
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
        challenge: 'oltre-ostacoli',
        variant: 'epiphany',
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
        challenge: 'oltre-ostacoli',
        variant: 'epiphany',
        source: 'exit_intent'
      });
    }
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
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
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
        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
      />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-8 rounded-lg transition disabled:opacity-50"
      >
        {loading ? 'Iscrizione in corso...' : 'Inizia la Challenge Gratuita'}
      </button>
      {behavior.engagementScore > 60 && !success && (
        <div className="flex justify-center">
          <EngagementBadge
            isVisible={true}
            score={behavior.engagementScore}
            challengeType="ostacoli"
          />
        </div>
      )}
    </form>
  );

  // FAQ Data
  const faqItems = [
    {
      q: "Quanto costa?",
      a: "Niente. La Challenge è completamente gratuita."
    },
    {
      q: "Quanto tempo richiede ogni giorno?",
      a: "5-7 minuti per leggere l'email + 5 minuti per l'esercizio. Totale: circa 10-12 minuti al giorno."
    },
    {
      q: "Devo comprare il libro?",
      a: "No. La Challenge è completa in sé. Il libro \"Oltre gli Ostacoli\" è un approfondimento opzionale."
    },
    {
      q: "Funziona anche per problemi personali, non solo di lavoro?",
      a: "Sì. I 3 Filtri funzionano su qualsiasi tipo di problema — professionale, familiare, personale."
    },
    {
      q: "E se non ho problemi urgenti in questo momento?",
      a: "Meglio. Impari gli strumenti quando non sei sotto pressione, così sono pronti quando servono."
    },
    {
      q: "E dopo i 7 giorni?",
      a: "Avrai strumenti che puoi usare per sempre. Se vorrai approfondire, ti mostrerò le opzioni disponibili — senza alcun obbligo."
    }
  ];

  // Success State
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-lg text-center">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Ci siamo.</h2>
          <p className="text-slate-300 mb-6">
            Controlla la tua email. Il Giorno 1 sta arrivando.
          </p>
          <p className="text-emerald-400 text-sm mb-6">
            Ti racconterò della tessera ristoranti del 1993 — e di cosa ho imparato dai miei errori.
          </p>
          <Link
            href="/test"
            className="inline-block mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-lg transition"
          >
            Nel frattempo, scopri il tuo profilo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-900 via-slate-900 to-slate-800">
      {/* Return Visitor Banner */}
      {behavior.isReturnVisitor && !bannerDismissed && !success && (
        <ReturnVisitorBanner
          isVisible={true}
          onDismiss={() => setBannerDismissed(true)}
          challengeType="ostacoli"
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
          <div className="inline-block bg-emerald-500/20 border border-emerald-500/30 rounded-full px-4 py-1 mb-8">
            <span className="text-emerald-400 text-sm font-medium">
              Challenge Gratuita - 7 Giorni
            </span>
          </div>

          {/* Headline - Principio Validante */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
            Sai già risolvere.<br />
            <span className="text-emerald-400">L&apos;hai solo dimenticato.</span>
          </h1>

          {/* Subheadline - Keyword ottimizzata */}
          <div className="max-w-2xl mx-auto mb-8">
            <p className="text-xl md:text-2xl text-slate-300">
              In 7 giorni imparerai a sbloccare le decisioni difficili,<br />
              uscire dalla paralisi e tornare in azione con chiarezza
            </p>
          </div>

          {/* Video Hero (opzionale) */}
          <div className="mb-8">
            <VideoPlaceholder
              challengeType="ostacoli"
              videoUrl={CHALLENGE_VIDEOS.ostacoli.hero}
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
              'Superare il blocco decisionale che ti tiene fermo',
              'Uscire dalla "paralisi da analisi" che consuma energia',
              'Trasformare la paura di sbagliare in chiarezza d\'azione',
              'Riconoscere che hai già superato ostacoli peggiori di questo',
              'Solo 5 minuti al giorno — un problema reale risolto entro il Day 5'
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <span className="text-emerald-400 text-xl flex-shrink-0">✓</span>
                <p className="text-slate-300 text-lg">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SEZIONE 4: I 3 FILTRI (Anteprima) ===== */}
      <section className="py-20 px-4 bg-slate-800/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Gli strumenti che già possiedi
          </h2>
          <p className="text-slate-400 text-center max-w-2xl mx-auto mb-12">
            Nel mio libro &quot;Oltre gli Ostacoli&quot; li chiamo i 3 Filtri.
            Non sono tecniche nuove da imparare.
            Sono lenti che già usi — solo non consapevolmente.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-900/50 border border-emerald-500/20 rounded-xl">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-emerald-400 font-bold text-xl mb-2">PATTERN</h3>
              <p className="text-slate-300 mb-4">Vede schemi che si ripetono</p>
              <p className="text-slate-500 text-sm italic">
                &quot;Questo è già successo? Cosa c&apos;è sotto?&quot;
              </p>
            </div>
            <div className="p-6 bg-slate-900/50 border border-emerald-500/20 rounded-xl">
              <div className="text-4xl mb-4">📡</div>
              <h3 className="text-emerald-400 font-bold text-xl mb-2">SEGNALI</h3>
              <p className="text-slate-300 mb-4">Legge ciò che non viene detto</p>
              <p className="text-slate-500 text-sm italic">
                &quot;Cosa sta comunicando che non dice a parole?&quot;
              </p>
            </div>
            <div className="p-6 bg-slate-900/50 border border-emerald-500/20 rounded-xl">
              <div className="text-4xl mb-4">💎</div>
              <h3 className="text-emerald-400 font-bold text-xl mb-2">RISORSE</h3>
              <p className="text-slate-300 mb-4">Trova quello che hai già</p>
              <p className="text-slate-500 text-sm italic">
                &quot;Cosa ho già che posso usare?&quot;
              </p>
            </div>
          </div>

          <p className="text-slate-400 text-center mt-8">
            Li hai già usati.
            La challenge ti insegna a usarli <strong className="text-white">QUANDO VUOI TU</strong> —
            non solo quando capita.
          </p>
        </div>
      </section>

      {/* ===== SEZIONE 5: I 3 TRADITORI (Anteprima) ===== */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Attenzione a queste 3 credenze
          </h2>
          <p className="text-slate-400 text-center max-w-2xl mx-auto mb-12">
            Ci sono credenze che sembrano prudenza ma sono trappole.
            Le chiamo &quot;Traditori&quot; perché si travestono da alleati.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-red-900/10 border border-red-800/20 rounded-xl">
              <h3 className="text-red-400 font-bold text-lg mb-2">IL PARALIZZANTE</h3>
              <p className="text-slate-300 mb-4 text-sm">
                &quot;Devo avere tutte le informazioni prima di agire&quot;
              </p>
              <p className="text-slate-500 text-xs">
                Si traveste da: <span className="text-slate-400">Prudenza, analisi accurata</span>
              </p>
            </div>
            <div className="p-6 bg-red-900/10 border border-red-800/20 rounded-xl">
              <h3 className="text-red-400 font-bold text-lg mb-2">IL TIMOROSO</h3>
              <p className="text-slate-300 mb-4 text-sm">
                &quot;È meglio non agire che agire e sbagliare&quot;
              </p>
              <p className="text-slate-500 text-xs">
                Si traveste da: <span className="text-slate-400">Pensiero strategico</span>
              </p>
            </div>
            <div className="p-6 bg-red-900/10 border border-red-800/20 rounded-xl">
              <h3 className="text-red-400 font-bold text-lg mb-2">IL PROCRASTINATORE</h3>
              <p className="text-slate-300 mb-4 text-sm">
                &quot;Devo aspettare il momento perfetto&quot;
              </p>
              <p className="text-slate-500 text-xs">
                Si traveste da: <span className="text-slate-400">Timing intelligente</span>
              </p>
            </div>
          </div>

          <p className="text-slate-400 text-center mt-8">
            Non sono difetti di carattere.
            Sono trappole cognitive in cui cadono tutti.
            Nella challenge impari a riconoscerle.
          </p>
        </div>
      </section>

      {/* ===== SEZIONE 6: COSA SUCCEDE IN 7 GIORNI ===== */}
      <section className="py-20 px-4 bg-slate-800/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            7 giorni per riattivare<br />
            <span className="text-emerald-400">il risolutore che hai dentro</span>
          </h2>

          <p className="text-slate-400 text-center max-w-2xl mx-auto mb-12">
            Non ti insegnerò &quot;tecniche di problem solving&quot;.
            Non ti darò framework complicati.
            Non ti dirò come dovresti pensare.
            <br /><br />
            Ti mostrerò come già <strong className="text-white">PENSI</strong> —
            quando risolvi problemi sul serio.
            E ti aiuterò a farlo con direzione, invece che reagendo agli eventi.
          </p>

          <div className="space-y-4">
            {[
              { day: '1', title: 'Le prove che sai già', desc: 'Documenti problemi che HAI GIÀ risolto. La prova che la capacità c\'è.' },
              { day: '2', title: 'Il Filtro Pattern', desc: 'Come vedere SCHEMI invece di rincorrere sintomi. Il rubinetto che perde.' },
              { day: '3', title: 'Il Filtro Segnali', desc: 'Come leggere quello che NON viene detto. Toni, tempi, omissioni.' },
              { day: '4', title: 'Il Filtro Risorse', desc: 'Come trovare quello che HAI GIÀ. Il frigo che sembra vuoto ma non lo è.' },
              { day: '5', title: 'Il Metodo 5 Minuti', desc: 'Come usare i 3 Filtri insieme, anche sotto pressione.' },
              { day: '6', title: 'I 3 Traditori', desc: 'Le credenze che ti bloccano — e come smascherarle.' },
              { day: '7', title: 'E adesso?', desc: 'Come continuare — con gli strumenti che hai già.' },
            ].map((item) => (
              <div key={item.day} className="flex gap-6 p-6 bg-slate-900/50 rounded-xl border border-slate-700/50 hover:border-emerald-500/30 transition-colors">
                <div className="flex-shrink-0 w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <span className="text-emerald-400 font-bold text-lg">{item.day}</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">{item.title}</h3>
                  <p className="text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Open Loop */}
          <div className="mt-12 p-8 bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-xl">
            <p className="text-slate-300 text-lg leading-relaxed mb-4">
              <strong className="text-white">Alla fine dei 7 giorni avrai:</strong>
            </p>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-start gap-3">
                <span className="text-emerald-400">✓</span>
                Una lista delle <strong className="text-slate-300">PROVE</strong> che sai già risolvere problemi
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400">✓</span>
                Padronanza dei 3 <strong className="text-slate-300">FILTRI</strong> (Pattern, Segnali, Risorse)
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400">✓</span>
                Il <strong className="text-slate-300">METODO 5 MINUTI</strong> da usare quando sei sotto pressione
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400">✓</span>
                Consapevolezza dei 3 <strong className="text-slate-300">TRADITORI</strong> che ti bloccano
              </li>
            </ul>
            <p className="text-slate-500 mt-6">
              Se vorrai approfondire, ti mostrerò come.
              Ma la Challenge è completa in sé.
            </p>
          </div>
        </div>
      </section>

      {/* ===== SEZIONE 7: PER CHI È ===== */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Questa Challenge è per te se...
          </h2>

          <div className="space-y-4">
            {[
              'Gestisci un\'azienda o un team e affronti problemi ogni giorno',
              'A volte ti blocchi su situazioni che SAI di poter risolvere',
              'Vuoi strumenti pratici, non teorie da manuale',
              'Preferisci migliorare ciò che HAI GIÀ invece di imparare cose nuove',
              'Hai 10 minuti al giorno per te stesso'
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-4">
                <span className="text-emerald-400 text-xl flex-shrink-0">✓</span>
                <p className="text-slate-300 text-lg">{item}</p>
              </div>
            ))}
          </div>

          <p className="text-slate-500 text-center mt-8">
            Non serve essere &quot;bravi&quot; a risolvere problemi.
            Serve solo voler riscoprire una capacità
            che già possiedi.
          </p>
        </div>
      </section>

      {/* ===== SEZIONE 8: CHI SONO ===== */}
      <section className="py-20 px-4 bg-slate-800/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-8">Chi ti guiderà</h2>

          <div className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-4xl font-bold text-white">FM</span>
          </div>

          <h3 className="text-2xl font-bold text-white mb-2">Fernando Marongiu</h3>
          <p className="text-emerald-400 mb-6">Fondatore Vitaeology</p>

          <div className="text-left space-y-4 text-slate-300">
            <p>
              Fernando Marongiu è imprenditore da oltre 50 anni.
            </p>
            <p>
              In questo tempo ha affrontato crisi economiche, fallimenti e ripartenze.
              Ogni ostacolo gli ha insegnato qualcosa.
            </p>
            <p>
              Ma la lezione più importante è stata questa:
              la capacità di risolvere problemi non si impara — si risveglia.
            </p>
            <p className="text-emerald-400 font-medium">
              Ce l&apos;hai già dentro. Questo percorso ti aiuta a ritrovarla.
            </p>
            <p className="text-slate-500">
              Questa Challenge nasce dal mio libro &quot;Oltre gli Ostacoli&quot; —
              ma non devi comprare il libro per partecipare.
              La Challenge è gratuita e completa in sé.
            </p>
          </div>
        </div>
      </section>

      {/* ===== SEZIONE 9: CTA FINALE ===== */}
      <section className="py-20 px-4">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Inizia oggi
          </h2>
          <p className="text-slate-300 mb-8">
            7 giorni. 7 email. 7 strumenti pratici.
          </p>
          <p className="text-slate-400 mb-8">
            Nessun costo. Nessun impegno.<br />
            Solo un modo per riattivare ciò che già sai fare.
          </p>

          <SignupForm showName={true} />

          <p className="text-slate-500 text-sm mt-4">
            Riceverai la prima email entro pochi minuti dall&apos;iscrizione.
          </p>
        </div>
      </section>

      {/* ===== SEZIONE 10: FAQ ===== */}
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
                  <span className="text-emerald-400 text-xl">
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

      {/* ===== SEZIONE 11: FOOTER ===== */}
      <section className="py-16 px-4 border-t border-slate-800">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-slate-400 text-lg mb-8">
            Il risolutore che cerchi<br />
            è già dentro di te.
          </p>
          <p className="text-emerald-400 mb-8">
            Questa settimana impari a riattivarlo.
          </p>

          <button
            onClick={() => document.querySelector('input[type="email"]')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-12 rounded-lg transition"
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
      {behavior.isExitIntent && !exitPopupDismissed && !success && (
        <ExitIntentPopup
          isVisible={true}
          onDismiss={() => {
            setExitPopupDismissed(true);
            behaviorActions.dismissExitIntent();
          }}
          onSubmit={handleExitIntentSubmit}
          challengeType="ostacoli"
          engagementScore={behavior.engagementScore}
          scrollDepth={behavior.maxScrollDepth}
        />
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-900 to-slate-900 flex items-center justify-center">
      <div className="text-white">Caricamento...</div>
    </div>
  );
}

export default function OstacoliLanding() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OstacoliLandingContent />
    </Suspense>
  );
}
