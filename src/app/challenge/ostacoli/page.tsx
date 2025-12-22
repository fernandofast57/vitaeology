'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Varianti per A/B Testing - Aggiornate da LANDING_CHALLENGE_2_OSTACOLI.md
const VARIANTS = {
  A: {
    headline: "Sai Già Risolvere Problemi. L'Hai Dimenticato.",
    subheadline: "In 7 giorni riattivi la capacità di risolvere situazioni difficili — quella che hai già usato decine di volte senza farci caso.",
    cta: "Inizia la Challenge Gratuita",
    hook: "Gratis. 7 email in 7 giorni. Nessun impegno."
  },
  B: {
    headline: "Non Impari a Risolvere. Ricordi Come Si Fa.",
    subheadline: "7 giorni per riattivare il risolutore che opera già in te — con strumenti che hai già usato.",
    cta: "Inizia Ora",
    hook: "5-7 minuti al giorno. Strumenti immediati, non teoria."
  },
  C: {
    headline: "Risveglia il Risolutore che Hai Dentro",
    subheadline: "Non è qualcosa che devi imparare da zero. È qualcosa che il tuo cervello già fa — in certi momenti.",
    cta: "Voglio Iniziare",
    hook: "I 3 Filtri + Il Metodo 5 Minuti + I 3 Traditori Silenziosi"
  }
};

type VariantKey = 'A' | 'B' | 'C';

function OstacoliLandingContent() {
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [variant, setVariant] = useState<VariantKey>('A');

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
          challenge: 'oltre-ostacoli',
          variant,
          utmSource,
          utmMedium,
          utmCampaign
        })
      });

      if (response.ok) {
        setSuccess(true);
        if (typeof window !== 'undefined' && (window as unknown as { gtag?: (cmd: string, event: string, params: object) => void }).gtag) {
          (window as unknown as { gtag: (cmd: string, event: string, params: object) => void }).gtag('event', 'challenge_signup', {
            challenge: 'oltre-ostacoli',
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

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-lg text-center">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Sei Dentro!</h2>
          <p className="text-slate-300 mb-6">
            Controlla la tua email. Il Giorno 1 — Il Filtro dei Pattern — sta arrivando.
          </p>
          <p className="text-emerald-400 text-sm">
            Nel frattempo, scopri il tuo stile di problem-solving:
          </p>
          <Link
            href="/test"
            className="inline-block mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-lg transition"
          >
            Scopri il Tuo Profilo Risolutore
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-900 to-slate-900">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-block bg-emerald-500/20 border border-emerald-500/30 rounded-full px-4 py-1 mb-8">
            <span className="text-emerald-400 text-sm font-medium">
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

          {/* Hook */}
          <p className="text-emerald-400 font-medium mb-12">
            {content.hook}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
            <input
              type="text"
              placeholder="Il tuo nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
            <input
              type="email"
              placeholder="La tua email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-8 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Iscrizione in corso...' : content.cta}
            </button>
          </form>

          <p className="text-slate-500 text-sm mt-4">
            Niente spam. Solo 7 email. Una al giorno.
          </p>
        </div>
      </section>

      {/* Problem/Solution */}
      <section className="py-16 px-4 bg-slate-800/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Before */}
            <div className="p-6 bg-red-900/20 border border-red-800/30 rounded-xl">
              <h3 className="text-red-400 font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">Prima della Sfida</span>
              </h3>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-400">✗</span>
                  Ogni problema sembra unico e impossibile
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">✗</span>
                  Vedi solo criticità, mai opportunità
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">✗</span>
                  Pensi troppo, agisci poco
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">✗</span>
                  Aspetti conferme esterne per decidere
                </li>
              </ul>
            </div>

            {/* After */}
            <div className="p-6 bg-emerald-900/20 border border-emerald-800/30 rounded-xl">
              <h3 className="text-emerald-400 font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">Dopo la Sfida</span>
              </h3>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  Riconosci pattern che si ripetono
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  Decodifichi ciò che non viene detto
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  Trasformi idee in risultati concreti
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  Decidi in autonomia con fiducia
                </li>
              </ul>
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
              { day: '1', title: 'Le Prove che Hai', desc: 'Le situazioni difficili che hai già risolto' },
              { day: '2', title: 'Vedere gli Schemi', desc: 'Come trovare la causa invece di rincorrere i sintomi' },
              { day: '3', title: 'Leggere Tra le Righe', desc: 'Quello che non ti dicono ma puoi capire' },
              { day: '4', title: 'Risorse Nascoste', desc: 'Hai più carte in mano di quelle che vedi' },
              { day: '5', title: 'Il Metodo 5 Minuti', desc: 'Schema → Segnali → Risorse → Azione, anche sotto pressione' },
              { day: '6', title: 'I 3 Traditori Silenziosi', desc: 'Le credenze che ti bloccano travestite da prudenza' },
              { day: '7', title: 'Da Qui in Avanti', desc: 'Come continuare da solo dopo questa settimana' },
            ].map((item) => (
              <div key={item.day} className="flex gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="flex-shrink-0 w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <span className="text-emerald-400 font-bold">{item.day}</span>
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

      {/* Author Section */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">FM</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Fernando Marongiu</h3>
          <p className="text-emerald-400 mb-4">Fondatore Vitaeology</p>
          <p className="text-slate-300 max-w-xl mx-auto">
            &quot;In mezzo secolo di lavoro ho affrontato crisi finanziarie, conflitti con soci, clienti che sparivano. Ho imparato che la capacità di risolvere problemi non si compra a un corso — si risveglia.&quot;
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 bg-gradient-to-t from-emerald-500/10 to-transparent">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto a Vedere i Pattern?
          </h2>
          <p className="text-slate-300 mb-8">
            7 giorni. 5 minuti al giorno. Un nuovo filtro per sessione.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="La tua email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-8 rounded-lg transition"
            >
              {content.cta}
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center text-slate-500 text-sm">
          <p>&copy; 2025 Vitaeology - <Link href="/privacy" className="hover:text-slate-300">Privacy</Link></p>
        </div>
      </footer>
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
