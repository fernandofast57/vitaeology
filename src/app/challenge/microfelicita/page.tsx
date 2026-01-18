'use client';

/**
 * Landing Page: Challenge Microfelicità (7 giorni)
 *
 * Nuova versione: Epiphany Bridge con Storia Fernando
 * Conformità: MEGA_PROMPT v4.3, CONTROL_TOWER v1.2, COPY_REALIGNMENT_ANALYSIS
 *
 * Entry point emotivo: -7 (Rovina) → Iscrizione Challenge
 * Storia: Fernando 1973-1982 "gli anni perduti" (16-25 anni) - cerca piacere nei posti sbagliati
 */

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

// ============================================================================
// SIGNUP FORM COMPONENT
// ============================================================================

interface SignupFormProps {
  onSubmit: (e: React.FormEvent) => Promise<void>;
  email: string;
  setEmail: (email: string) => void;
  nome: string;
  setNome: (nome: string) => void;
  loading: boolean;
  error: string;
  showNome?: boolean;
  behaviorActions: {
    trackFormFocus: () => void;
    trackFormBlur: () => void;
  };
  engagementScore?: number;
  showEngagementBadge?: boolean;
}

function SignupForm({
  onSubmit,
  email,
  setEmail,
  nome,
  setNome,
  loading,
  error,
  showNome = true,
  behaviorActions,
  engagementScore = 0,
  showEngagementBadge = false,
}: SignupFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {showNome && (
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
      )}
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
        className="w-full bg-violet-500 hover:bg-violet-600 text-white font-bold py-4 px-8 rounded-lg transition disabled:opacity-50 text-lg"
      >
        {loading ? 'Iscrizione in corso...' : 'INIZIA LA CHALLENGE GRATUITA'}
      </button>
      {showEngagementBadge && engagementScore > 60 && (
        <div className="flex justify-center">
          <EngagementBadge
            isVisible={true}
            score={engagementScore}
            challengeType="microfelicita"
          />
        </div>
      )}
    </form>
  );
}

// ============================================================================
// MAIN LANDING CONTENT
// ============================================================================

function MicrofelicitaLandingContent() {
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Behavioral tracking con variante "epiphany"
  const [behavior, behaviorActions] = useBehavioralTracking('microfelicita', 'epiphany');
  const [exitPopupDismissed, setExitPopupDismissed] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

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
          nome: nome || 'Visitatore',
          challenge: 'microfelicita',
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
            challenge: 'microfelicita',
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
        challenge: 'microfelicita',
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
        challenge: 'microfelicita',
        variant: 'epiphany',
        source: 'exit_intent'
      });
    }
  };

  // FAQ data
  const faqs = [
    {
      q: 'Devo credere nel "pensiero positivo"?',
      a: 'No. Questo non è pensiero positivo. Non ti chiedo di immaginare cose belle o di forzare la gratitudine. Ti chiedo di notare cose che succedono davvero — e che il tuo cervello ignora.'
    },
    {
      q: 'Quanto tempo serve al giorno?',
      a: '5-7 minuti per leggere l\'email, 3-5 minuti per l\'esercizio. Totale: massimo 15 minuti al giorno.'
    },
    {
      q: 'Funziona se sono scettico?',
      a: 'Sì. In effetti, gli scettici spesso ottengono i risultati migliori perché seguono le istruzioni invece di aggiungere interpretazioni.'
    },
    {
      q: 'È diverso dalla mindfulness?',
      a: 'Sì. La mindfulness ti chiede di svuotare la mente. R.A.D.A.R. ti chiede di riempirla — con attenzione selettiva ai segnali positivi.'
    },
    {
      q: 'Cosa succede dopo i 7 giorni?',
      a: 'Avrai gli strumenti per continuare in autonomia. Molti partecipanti scoprono poi il percorso completo di Vitaeology per approfondire.'
    }
  ];

  // Success state
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
            Controlla la tua email. Il <strong className="text-violet-400">Giorno 1 — Il Primo Inventario</strong> sta arrivando.
          </p>
          <p className="text-violet-400 text-sm mb-6">
            Preparati a scoprire quanto benessere ti attraversa ogni giorno.
          </p>
          <Link
            href="/assessment/microfelicita"
            className="inline-block bg-violet-500 hover:bg-violet-600 text-white font-bold py-3 px-8 rounded-lg transition"
          >
            Scopri il Tuo Profilo Benessere
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

      {/* ================================================================== */}
      {/* SEZIONE 1: HERO */}
      {/* ================================================================== */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Pre-headline */}
          <div className="inline-block bg-violet-500/20 border border-violet-500/30 rounded-full px-4 py-1 mb-8">
            <span className="text-violet-400 text-sm font-medium">
              Una challenge gratuita di 7 giorni
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            A Fine Giornata Pensi<br />
            <span className="text-violet-400">&quot;Non È Successo Niente di Buono&quot;</span>?
          </h1>

          {/* Sottotitolo */}
          <p className="text-xl md:text-2xl text-slate-300 mb-4 max-w-2xl mx-auto">
            Non è vero. È successo. Solo che non l&apos;hai notato.
          </p>
          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
            In 7 giorni impari a intercettare i momenti positivi che già ti attraversano —
            e che il tuo cervello ignora.
          </p>

          {/* Video Hero */}
          <div className="mb-8">
            <VideoPlaceholder
              challengeType="microfelicita"
              videoUrl={CHALLENGE_VIDEOS.microfelicita.hero}
            />
          </div>

          {/* Form */}
          <div className="max-w-md mx-auto mb-6">
            <SignupForm
              onSubmit={handleSubmit}
              email={email}
              setEmail={setEmail}
              nome={nome}
              setNome={setNome}
              loading={loading}
              error={error}
              behaviorActions={behaviorActions}
              engagementScore={behavior.engagementScore}
              showEngagementBadge={true}
            />
          </div>

          {/* Micro-copy */}
          <p className="text-slate-500 text-sm">
            Gratis. 7 email in 7 giorni. 5 minuti al giorno.
          </p>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SEZIONE 2: LA MIA STORIA (Epiphany Bridge) */}
      {/* ================================================================== */}
      <section className="py-16 px-4 bg-slate-800/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
            Lascia Che Ti Racconti di Quando Cercavo il Benessere nei Posti Sbagliati
          </h2>

          <div className="prose prose-lg prose-invert mx-auto">
            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              Era il <strong className="text-white">1973</strong>. Avevo sedici anni.
            </p>

            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              Per i successivi nove anni — dal &apos;73 all&apos;82 — ho vissuto quello che chiamo
              <em className="text-violet-400"> &quot;gli anni perduti&quot;</em>.
            </p>

            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              Saltavo da una relazione all&apos;altra, da un&apos;amicizia all&apos;altra. Sempre alla ricerca
              di qualcosa che mi facesse sentire vivo. Tanti gruppi di persone diverse che avevano
              poco in comune se non il desiderio di perdersi.
            </p>

            <p className="text-slate-300 text-lg leading-relaxed mb-6 border-l-4 border-violet-500 pl-4 bg-violet-500/10 py-4">
              <strong className="text-white">Cercavo il piacere. In continuazione.</strong>
            </p>

            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              Una sera, su una collinetta di Torino, incontrai i figli della società bene.
              I privilegiati. Quelli con i soldi veri.
            </p>

            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              Pensai: <em>&quot;Adesso posso imparare qualcosa. Questi hanno tutto.
              Sapranno come si fa.&quot;</em>
            </p>

            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              La delusione fu incontrare un <strong className="text-white">degrado spirituale
              ancora maggiore del mio</strong>.
            </p>

            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              Atteggiamenti infimi, depravazioni, bullismo — ma con i soldi. Quel gruppo
              si rivelò ancora peggiore degli altri.
            </p>

            <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-6 my-8">
              <p className="text-white text-xl font-semibold mb-4">
                Fu lì che capii qualcosa di fondamentale:
              </p>
              <p className="text-violet-300 text-lg mb-4">
                Il benessere non si trova cercando momenti grandi, intensi, speciali.
              </p>
              <p className="text-violet-300 text-lg mb-4">
                Non si trova nelle persone giuste, nei posti giusti, nelle esperienze straordinarie.
              </p>
              <p className="text-white text-xl font-bold">
                Il benessere ti attraversa ogni giorno, in migliaia di piccoli momenti.
              </p>
              <p className="text-violet-400 text-lg mt-4">
                Solo che nessuno ti ha insegnato a notarli.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SEZIONE 3: IL PROBLEMA REALE */}
      {/* ================================================================== */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
            Il Cervello È Programmato Per Vedere i Problemi
          </h2>

          <p className="text-slate-300 text-lg leading-relaxed mb-6 text-center">
            Ogni giorno ti succedono decine di piccole cose piacevoli:
          </p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { icon: '☕', text: 'Il primo caffè della mattina' },
              { icon: '🤫', text: 'Un momento di silenzio' },
              { icon: '💬', text: 'Un messaggio affettuoso' },
              { icon: '☀️', text: 'Il sole dalla finestra' },
              { icon: '✅', text: 'Un compito completato' },
            ].map((item, i) => (
              <div key={i} className="text-center p-4 bg-slate-800/50 rounded-lg">
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="text-slate-400 text-sm">{item.text}</p>
              </div>
            ))}
          </div>

          <p className="text-slate-300 text-lg leading-relaxed mb-4 text-center">
            Ma a fine giornata, se qualcuno ti chiede <em>&quot;Com&apos;è andata?&quot;</em>, rispondi:
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-6 py-3">
              <p className="text-slate-400 italic">&quot;Boh, normale.&quot;</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-6 py-3">
              <p className="text-slate-400 italic">&quot;Niente di che.&quot;</p>
            </div>
          </div>

          <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-6 text-center">
            <p className="text-white text-xl font-semibold mb-4">
              Non è che non succede niente di buono. È che non lo noti.
            </p>
            <p className="text-slate-300 mb-4">
              Il cervello umano è programmato per vedere i problemi — è una questione di sopravvivenza.
              I nostri antenati che notavano i pericoli vivevano più a lungo.
              Quelli distratti venivano mangiati.
            </p>
            <p className="text-violet-400 font-semibold">
              Il risultato oggi? Noti tutte le 10 cose negative della giornata.
              Ma solo 2-3 delle 50 cose positive.
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SEZIONE 4: LA MATEMATICA CHE CAMBIA TUTTO */}
      {/* ================================================================== */}
      <section className="py-16 px-4 bg-slate-800/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
            50 Momenti Piccoli Battono 4 Momenti Grandi
          </h2>

          <p className="text-slate-300 text-lg mb-8 text-center">
            Ecco i numeri:
          </p>

          <div className="overflow-x-auto mb-8">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="py-3 px-4 text-violet-400 font-semibold">Tipo di momento</th>
                  <th className="py-3 px-4 text-violet-400 font-semibold">Frequenza</th>
                  <th className="py-3 px-4 text-violet-400 font-semibold">Totale in un anno</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-700/50">
                  <td className="py-3 px-4 text-slate-300">
                    <strong className="text-white">Grandi</strong> (vacanze, promozioni, eventi)
                  </td>
                  <td className="py-3 px-4 text-slate-400">3-4 all&apos;anno</td>
                  <td className="py-3 px-4 text-slate-400">~4</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-300">
                    <strong className="text-white">Piccoli</strong> (se li noti)
                  </td>
                  <td className="py-3 px-4 text-slate-400">50+ al giorno</td>
                  <td className="py-3 px-4 text-violet-400 font-bold">~18.000</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-6">
              <p className="text-red-400 font-semibold mb-2">Se dipendi solo dai momenti grandi:</p>
              <p className="text-white text-2xl font-bold">4 occasioni all&apos;anno</p>
            </div>
            <div className="bg-violet-500/20 border border-violet-500/30 rounded-xl p-6">
              <p className="text-violet-400 font-semibold mb-2">Se impari a notare i piccoli:</p>
              <p className="text-white text-2xl font-bold">Migliaia di occasioni</p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-slate-900/50 rounded-xl">
            <p className="text-white font-semibold mb-3">C&apos;è di più:</p>
            <p className="text-slate-300 mb-4">
              I momenti grandi perdono effetto nel tempo — il cervello si abitua.
              Una promozione ti rende felice per qualche settimana, poi torni allo stato normale.
            </p>
            <p className="text-violet-400">
              I momenti piccoli funzionano ogni volta, <strong className="text-white">se li noti consapevolmente</strong>.
              Non c&apos;è adattamento perché ogni momento è nuovo.
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SEZIONE 5: IL METODO R.A.D.A.R. */}
      {/* ================================================================== */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 text-center">
            Lo Strumento che Userai
          </h2>
          <p className="text-slate-400 text-center mb-8">
            R.A.D.A.R. è un metodo in 5 passi per intercettare e amplificare i momenti positivi.
            Lo imparerai al Giorno 4.
          </p>

          <div className="space-y-4">
            {[
              { letter: 'R', name: 'Rileva', desc: 'Noti che sta succedendo qualcosa di piacevole' },
              { letter: 'A', name: 'Accogli', desc: 'Ti fermi mentalmente, non lasci passare' },
              { letter: 'D', name: 'Distingui', desc: 'Identifichi che tipo di momento è' },
              { letter: 'A', name: 'Amplifica', desc: 'Lo vivi consapevolmente per qualche secondo' },
              { letter: 'R', name: 'Resta', desc: 'Lasci che l\'effetto duri un po\' di più' },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                <div className="flex-shrink-0 w-14 h-14 bg-violet-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">{step.letter}</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">{step.name}</h3>
                  <p className="text-slate-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-slate-400 text-center mt-8">
            Sembra semplice — e lo è. Ma la semplicità è il punto:
            <strong className="text-white"> deve essere così facile che lo fai davvero</strong>.
          </p>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SEZIONE 6: LE 3 FORME */}
      {/* ================================================================== */}
      <section className="py-16 px-4 bg-slate-800/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 text-center">
            Non Tutte le Microfelicità Sono Uguali
          </h2>
          <p className="text-slate-400 text-center mb-8">
            Esistono 3 forme diverse. Ognuno ha il suo &quot;mix&quot; preferito.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-900/50 border border-violet-500/20 rounded-xl">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-violet-400 font-bold text-xl mb-2">SENSORIALE</h3>
              <p className="text-slate-300 mb-4">Piaceri dei sensi</p>
              <p className="text-slate-500 text-sm italic">
                Un caffè buono, una luce bella, un suono piacevole
              </p>
            </div>

            <div className="p-6 bg-slate-900/50 border border-violet-500/20 rounded-xl">
              <div className="text-4xl mb-4">💜</div>
              <h3 className="text-violet-400 font-bold text-xl mb-2">RELAZIONALE</h3>
              <p className="text-slate-300 mb-4">Connessione con altri</p>
              <p className="text-slate-500 text-sm italic">
                Un messaggio affettuoso, una risata condivisa
              </p>
            </div>

            <div className="p-6 bg-slate-900/50 border border-violet-500/20 rounded-xl">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-violet-400 font-bold text-xl mb-2">METACOGNITIVA</h3>
              <p className="text-slate-300 mb-4">Soddisfazione mentale</p>
              <p className="text-slate-500 text-sm italic">
                Finire un compito, capire qualcosa di nuovo
              </p>
            </div>
          </div>

          <p className="text-slate-400 text-center mt-8">
            Nella challenge scopri qual è il tuo mix preferito.
          </p>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SEZIONE 7: I 7 GIORNI */}
      {/* ================================================================== */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
            Cosa Succede in 7 Giorni
          </h2>

          <div className="space-y-4">
            {[
              { day: '1', title: 'Il Primo Inventario', desc: 'Trovi 3 momenti positivi nella TUA giornata' },
              { day: '2', title: 'La Matematica', desc: 'Perché 50 piccoli battono 4 grandi' },
              { day: '3', title: 'Intercettare Live', desc: 'Noti mentre succede, non dopo' },
              { day: '4', title: 'Il Metodo R.A.D.A.R.', desc: 'I 5 passi per catturare ogni momento' },
              { day: '5', title: 'Le 3 Forme', desc: 'Scopri il tuo mix preferito' },
              { day: '6', title: 'I Segnali Deboli', desc: 'Le cose più piccole sono spesso le più importanti' },
              { day: '7', title: 'Come Continuare', desc: 'Il tuo piano autonomo' },
            ].map((item) => (
              <div key={item.day} className="flex gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="flex-shrink-0 w-12 h-12 bg-violet-500/20 rounded-full flex items-center justify-center">
                  <span className="text-violet-400 font-bold text-lg">{item.day}</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">{item.title}</h3>
                  <p className="text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-violet-500/10 border border-violet-500/30 rounded-xl">
            <h4 className="text-white font-semibold mb-3">Formato:</h4>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-center gap-2">
                <span className="text-violet-400">•</span>
                1 email al giorno
              </li>
              <li className="flex items-center gap-2">
                <span className="text-violet-400">•</span>
                5-7 minuti di lettura
              </li>
              <li className="flex items-center gap-2">
                <span className="text-violet-400">•</span>
                1 esercizio pratico (3-5 minuti)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-violet-400">•</span>
                Nessuna filosofia astratta — solo pratica
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SEZIONE 8: PER CHI È */}
      {/* ================================================================== */}
      <section className="py-16 px-4 bg-slate-800/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
            Questa Challenge È Per Te Se...
          </h2>

          <div className="space-y-4 mb-8">
            {[
              'A fine giornata senti che "non è successo niente"',
              'Vuoi stare meglio senza stravolgere la tua vita',
              'Sei scettico verso la "positività forzata" e il pensiero magico',
              'Preferisci metodi pratici basati su come funziona il cervello',
              'Hai 5 minuti al giorno per un esercizio semplice',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-slate-900/50 rounded-lg">
                <span className="text-violet-500 text-xl">✓</span>
                <p className="text-slate-300">{item}</p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
            <p className="text-slate-400 text-sm">
              <strong className="text-slate-300">Nota:</strong> Non è una challenge per chi sta male
              e ha bisogno di aiuto professionale. È per chi sta &quot;normale&quot; e vuole stare meglio
              notando ciò che già c&apos;è.
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SEZIONE 9: CHI SONO */}
      {/* ================================================================== */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
            Chi Ti Guiderà
          </h2>

          <div className="w-24 h-24 bg-gradient-to-br from-violet-400 to-violet-600 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">FM</span>
          </div>

          <h3 className="text-2xl font-bold text-white mb-2">Fernando Marongiu</h3>
          <p className="text-violet-400 mb-6">Fondatore Vitaeology</p>

          <div className="text-left max-w-2xl mx-auto space-y-4 text-slate-300">
            <p>
              Mi chiamo Fernando Marongiu. Ho 50 anni di esperienza come imprenditore.
            </p>
            <p>
              Per decenni ho cercato la felicità nei risultati grandi: aziende da fondare,
              obiettivi da raggiungere, traguardi da superare. Ho ottenuto molto.
            </p>
            <p>
              Ma per 9 anni — dal 1973 al 1982 — ho cercato nei posti sbagliati.
              Ho cercato il piacere intenso, le esperienze straordinarie, le persone &quot;giuste&quot;.
            </p>
            <p className="text-white font-semibold">
              Ho imparato sulla mia pelle che non funziona così.
            </p>
            <p>
              Il benessere che cercavo mi attraversava ogni giorno. Non lo vedevo perché
              nessuno mi aveva insegnato a notarlo.
            </p>
            <p className="text-violet-400">
              Oggi, a 70 anni, ho capito che i momenti più preziosi sono quelli piccoli —
              se sai riconoscerli.
            </p>
            <p className="text-white font-semibold">
              E questo è esattamente quello che ti insegno in 7 giorni.
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SEZIONE 10: CTA FINALE */}
      {/* ================================================================== */}
      <section className="py-16 px-4 bg-gradient-to-t from-violet-500/10 to-transparent">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Inizia Oggi
          </h2>
          <p className="text-slate-300 mb-8">
            7 giorni. 5 minuti al giorno. Gratis.
          </p>
          <p className="text-violet-400 mb-8">
            Alla fine avrai un &quot;radar&quot; calibrato per notare ciò che già c&apos;è.
          </p>

          <SignupForm
            onSubmit={handleSubmit}
            email={email}
            setEmail={setEmail}
            nome={nome}
            setNome={setNome}
            loading={loading}
            error={error}
            showNome={false}
            behaviorActions={behaviorActions}
            engagementScore={behavior.engagementScore}
            showEngagementBadge={true}
          />

          <p className="text-slate-500 text-sm mt-4">
            Inserisci la tua email. Ricevi il Giorno 1 immediatamente.
          </p>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SEZIONE 11: FAQ */}
      {/* ================================================================== */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            Domande Frequenti
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-slate-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex justify-between items-center p-4 text-left bg-slate-800/50 hover:bg-slate-800 transition"
                >
                  <span className="text-white font-medium">{faq.q}</span>
                  <span className="text-violet-400 text-xl">
                    {openFaq === i ? '−' : '+'}
                  </span>
                </button>
                {openFaq === i && (
                  <div className="p-4 bg-slate-900/50 border-t border-slate-700">
                    <p className="text-slate-300">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
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

// ============================================================================
// LOADING FALLBACK
// ============================================================================

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-900 to-slate-900 flex items-center justify-center">
      <div className="text-white">Caricamento...</div>
    </div>
  );
}

// ============================================================================
// EXPORT
// ============================================================================

export default function MicrofelicitaLanding() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MicrofelicitaLandingContent />
    </Suspense>
  );
}
