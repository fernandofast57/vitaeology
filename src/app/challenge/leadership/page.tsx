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

// Nuova versione: Epiphany Bridge con Storia Fernando
// Conformità: MEGA_PROMPT v4.3, CONTROL_TOWER v1.2, COPY_REALIGNMENT_ANALYSIS
// Entry point emotivo: -7 (Rovina) → Iscrizione Challenge

function LeadershipLandingContent() {
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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
          challenge: 'leadership-autentica',
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
            challenge: 'leadership-autentica',
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
        challenge: 'leadership-autentica',
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
        challenge: 'leadership-autentica',
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
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-4 px-8 rounded-lg transition disabled:opacity-50"
      >
        {loading ? 'Iscrizione in corso...' : 'Inizia la Challenge Gratuita'}
      </button>
      {behavior.engagementScore > 60 && !success && (
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

  // FAQ Data
  const faqItems = [
    {
      q: "Quanto costa?",
      a: "Niente. La Challenge è completamente gratuita."
    },
    {
      q: "Quanto tempo richiede ogni giorno?",
      a: "5-7 minuti per leggere l'email + 3-5 minuti per l'esercizio. Totale: circa 10 minuti al giorno."
    },
    {
      q: "Devo comprare il libro?",
      a: "No. La Challenge è completa in sé. Il libro \"Leadership Autentica\" è un approfondimento opzionale."
    },
    {
      q: "È un corso di \"motivazione\"?",
      a: "No. Non ti dirò di \"credere in te stesso\" o \"pensare positivo\". Ti mostrerò come già funzioni quando sei al tuo meglio — e come farlo di più."
    },
    {
      q: "Funziona anche se sono scettico?",
      a: "Soprattutto se sei scettico. Gli scettici sono quelli che vogliono capire invece di credere. È esattamente l'approccio giusto."
    },
    {
      q: "E dopo i 7 giorni?",
      a: "Avrai strumenti che puoi usare per sempre. Se vorrai approfondire, ti mostrerò le opzioni disponibili — senza alcun obbligo."
    }
  ];

  // Success State
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="max-w-lg text-center">
          <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Ci siamo.</h2>
          <p className="text-slate-300 mb-6">
            Controlla la tua email. Il Giorno 1 sta arrivando.
          </p>
          <p className="text-amber-400 text-sm mb-6">
            Ti racconterò di quella cabina telefonica a Milano — e di cosa ho capito 40 anni dopo.
          </p>
          <Link
            href="/test"
            className="inline-block mt-4 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 px-8 rounded-lg transition"
          >
            Nel frattempo, scopri il tuo profilo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      {/* Return Visitor Banner */}
      {behavior.isReturnVisitor && !bannerDismissed && !success && (
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

          {/* Headline - Risonanza con Rovina (-7) */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
            Senti che qualcosa non funziona<br />
            <span className="text-amber-400">nella tua leadership?</span>
          </h1>

          {/* Sottotitolo - Hook Storia */}
          <div className="max-w-2xl mx-auto mb-8">
            <p className="text-xl md:text-2xl text-slate-300 mb-4">
              Febbraio 1985. Una cabina telefonica a Milano.<br />
              L&apos;ultimo gettone. E la scoperta che ha cambiato tutto.
            </p>
            <p className="text-lg text-slate-400">
              In 7 giorni ti racconto cosa ho capito —<br />
              e perché probabilmente vale anche per te.
            </p>
          </div>

          {/* Video Hero (opzionale) */}
          <div className="mb-8">
            <VideoPlaceholder
              challengeType="leadership"
              videoUrl={CHALLENGE_VIDEOS.leadership.hero}
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

      {/* ===== SEZIONE 2: STORIA FERNANDO (Epiphany Bridge) ===== */}
      <section className="py-20 px-4 bg-slate-800/30">
        <div className="max-w-3xl mx-auto">
          {/* Titolo Sezione */}
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Lascia che ti racconti quando<br />
            <span className="text-amber-400">ho capito di aver sbagliato tutto.</span>
          </h2>

          {/* La Storia */}
          <div className="prose prose-lg prose-invert mx-auto">
            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              Era il febbraio del 1985.
            </p>

            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              Avevo 27 anni e una certezza granitica: la passione bastava.
              Se credevo abbastanza forte in quello che facevo,
              le persone mi avrebbero seguito.
            </p>

            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              Quel giorno ero in una cabina telefonica a Milano,
              con l&apos;ultimo gettone in mano.
            </p>

            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              Dovevo chiamare un cliente importante — uno che poteva
              cambiare le sorti della mia attività.
              Mi ero preparato un discorso appassionato,
              pieno di entusiasmo, di promesse, di visione.
            </p>

            <div className="bg-slate-900/50 border-l-4 border-amber-500 p-6 my-8 rounded-r-lg">
              <p className="text-slate-200 text-lg italic mb-4">
                Inserisco il gettone. Squilla. Risponde.
              </p>
              <p className="text-slate-200 text-lg mb-4">
                Parlo per tre minuti di fila. Gli racconto tutto.
                Il progetto, il potenziale, il futuro che vedo.
              </p>
              <p className="text-slate-200 text-lg mb-4">
                Silenzio.
              </p>
              <p className="text-amber-400 text-lg font-medium">
                Poi: &quot;Senta, mi fa piacere il suo entusiasmo.
                Ma lei cosa sa fare CONCRETAMENTE?&quot;
              </p>
              <p className="text-slate-400 text-lg mt-4">
                Il gettone finisce. La linea cade.
              </p>
            </div>

            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              Resto lì, con la cornetta in mano, a fissare il nulla.
            </p>
          </div>

          {/* La Caduta */}
          <div className="mt-12 p-8 bg-red-900/10 border border-red-800/20 rounded-xl">
            <h3 className="text-xl font-bold text-red-400 mb-4">
              Quella domanda mi ha perseguitato per anni.
            </h3>
            <p className="text-slate-300 text-lg leading-relaxed mb-4">
              Non perché non sapessi rispondere —
              ma perché mi aveva mostrato qualcosa che non volevo vedere:
            </p>
            <ul className="space-y-2 text-slate-300 text-lg">
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">•</span>
                La passione non basta.
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">•</span>
                L&apos;entusiasmo non convince.
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">•</span>
                Credere forte in qualcosa non significa che gli altri ti seguiranno.
              </li>
            </ul>
            <p className="text-slate-400 text-lg mt-4 italic">
              Avevo costruito tutta la mia idea di leadership su una fondamenta sbagliata.
            </p>
          </div>

          {/* L'Epifania */}
          <div className="mt-12 p-8 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <h3 className="text-xl font-bold text-amber-400 mb-4">
              Ho impiegato altri 15 anni per capire cosa mancava.
            </h3>
            <p className="text-slate-300 text-lg leading-relaxed mb-4">
              Non era la passione che non funzionava —
              era che la usavo nel modo sbagliato.
            </p>
            <p className="text-slate-300 text-lg leading-relaxed mb-4">
              La passione funziona <strong className="text-white">DOPO</strong> che hai conquistato credibilità.
              Non prima.
            </p>
            <p className="text-slate-300 text-lg leading-relaxed mb-4">
              E la credibilità non si conquista parlando di sé —
              si conquista mostrando che <strong className="text-white">CAPISCI</strong> l&apos;altra persona.
            </p>

            <div className="bg-slate-900/50 p-6 rounded-lg mt-6">
              <p className="text-amber-400 text-lg font-medium mb-4">
                L&apos;epifania vera arrivò quando capii questo:
              </p>
              <p className="text-white text-xl leading-relaxed">
                Non devi convincere le persone a seguirti.<br />
                Devi incontrarle AL LIVELLO in cui si trovano.<br />
                E da lì, camminare insieme.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SEZIONE 3: IL REFRAMING (Principio Validante) ===== */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            La buona notizia?<br />
            <span className="text-amber-400">Probabilmente lo sai già fare.</span>
          </h2>

          <div className="text-left space-y-6">
            <p className="text-slate-300 text-lg leading-relaxed">
              Se senti che qualcosa non funziona nella tua leadership,
              non significa che ti manca qualcosa.
            </p>
            <p className="text-slate-300 text-lg leading-relaxed">
              Significa che stai già vedendo qualcosa
              che molti preferiscono ignorare.
            </p>
            <p className="text-slate-300 text-lg leading-relaxed">
              Il fatto che tu stia leggendo questa pagina
              mi dice una cosa importante su di te:
            </p>
            <p className="text-white text-xl font-medium text-center py-4">
              Non ti accontenti.
            </p>
            <p className="text-slate-300 text-lg leading-relaxed">
              Non ti basta &quot;andare avanti&quot; —
              vuoi capire <strong className="text-white">COSA</strong> non funziona e <strong className="text-white">PERCHÉ</strong>.
            </p>
            <p className="text-slate-300 text-lg leading-relaxed">
              Questa non è debolezza.
              È la stessa cosa che mi ha portato
              dalla cabina telefonica di Milano
              a fondare aziende per 50 anni.
            </p>
            <p className="text-amber-400 text-xl font-medium text-center py-4">
              La capacità di vedere che qualcosa non va<br />
              È la capacità di leadership.<br />
              Solo che probabilmente non la chiami così.
            </p>
          </div>

          {/* I 3 Pattern */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-white mb-8">
              I 3 Pattern che Riconoscerai
            </h3>
            <p className="text-slate-400 mb-8">
              In 50 anni di imprenditoria ho incontrato
              centinaia di leader che sentivano &quot;qualcosa non funziona&quot;.
              Quasi tutti avevano uno di questi tre pattern:
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl text-left">
                <div className="text-3xl mb-4">1</div>
                <h4 className="text-amber-400 font-bold mb-2">&quot;FUNZIONA MA NON SO PERCHÉ&quot;</h4>
                <p className="text-slate-400 text-sm">
                  Hai avuto successi, ma non riesci a replicarli.
                  Ogni volta sembra dipendere dalla fortuna.
                </p>
              </div>
              <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl text-left">
                <div className="text-3xl mb-4">2</div>
                <h4 className="text-amber-400 font-bold mb-2">&quot;CAPISCONO MA NON SEGUONO&quot;</h4>
                <p className="text-slate-400 text-sm">
                  Le persone annuiscono, dicono sì —
                  poi fanno altro.
                </p>
              </div>
              <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl text-left">
                <div className="text-3xl mb-4">3</div>
                <h4 className="text-amber-400 font-bold mb-2">&quot;DO TUTTO IO&quot;</h4>
                <p className="text-slate-400 text-sm">
                  Sai delegare in teoria.
                  Ma poi ti ritrovi a controllare ogni dettaglio.
                </p>
              </div>
            </div>

            <p className="text-slate-300 text-lg mt-8">
              Ti riconosci in uno di questi?<br />
              <span className="text-amber-400">La Challenge parte proprio da qui.</span>
            </p>
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
            E ti aiuterò a farlo intenzionalmente, invece che per caso.
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
              'Hai avuto successi ma non riesci a capire cosa li ha causati (e come ripeterli)',
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
              Ho 50 anni di esperienza come imprenditore.
            </p>
            <p>
              Ho fondato aziende in settori diversi —
              dalla formazione all&apos;oro, dal web alla ristorazione.
            </p>
            <p>
              Ho fatto errori che mi sono costati anni.
              E ho avuto successi che non capivo.
            </p>
            <p>
              Nel 2007, quasi per scommessa,
              sono entrato nel settore dell&apos;oro e della gioielleria.
              In quel momento ho incontrato il mio punto di svolta —
              e più nulla è mai stato come prima.
            </p>
            <p className="text-amber-400 font-medium">
              Ho capito che la leadership non si impara.
              Si riconosce.
            </p>
            <p className="text-slate-500">
              Questa Challenge nasce dal mio libro &quot;Leadership Autentica&quot; —
              ma non devi comprare il libro per partecipare.
              La Challenge è gratuita e completa in sé.
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
