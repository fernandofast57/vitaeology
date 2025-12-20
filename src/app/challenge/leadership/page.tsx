'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Varianti per A/B Testing
const VARIANTS = {
  A: {
    headline: "Riconosci il Leader che Sei Già",
    subheadline: "7 giorni per scoprire le caratteristiche di leadership che già operano in te",
    cta: "Inizia la Sfida Gratuita",
    hook: "50 anni di esperienza imprenditoriale condensati in 7 rivelazioni"
  },
  B: {
    headline: "Il Leader che Cerchi Sei Tu",
    subheadline: "La sfida che rivela ciò che già possiedi, senza aggiungere nulla",
    cta: "Scarica la Sfida",
    hook: "24 caratteristiche dei geni. 7 giorni. Una trasformazione silenziosa."
  },
  C: {
    headline: "Smetti di Cercare. Inizia a Riconoscere.",
    subheadline: "7 giorni per vedere il leader autentico che opera già dentro di te",
    cta: "Voglio Iniziare",
    hook: "Dal ciclo ERRORE→COSA→RIPROVA di Fernando Marongiu"
  }
};

type VariantKey = 'A' | 'B' | 'C';

function LeadershipLandingContent() {
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [variant, setVariant] = useState<VariantKey>('A');

  // Legge UTM e variante dai parametri URL
  const utmSource = searchParams.get('utm_source') || '';
  const utmMedium = searchParams.get('utm_medium') || '';
  const utmCampaign = searchParams.get('utm_campaign') || '';

  useEffect(() => {
    // Assegna variante random o da URL
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
          challenge: 'leadership-autentica',
          variant,
          utmSource,
          utmMedium,
          utmCampaign
        })
      });

      if (response.ok) {
        setSuccess(true);
        // Track conversion
        if (typeof window !== 'undefined' && (window as unknown as { gtag?: (cmd: string, event: string, params: object) => void }).gtag) {
          (window as unknown as { gtag: (cmd: string, event: string, params: object) => void }).gtag('event', 'challenge_signup', {
            challenge: 'leadership-autentica',
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
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="max-w-lg text-center">
          <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Benvenuto nella Sfida!</h2>
          <p className="text-slate-300 mb-6">
            Controlla la tua email. Il Giorno 1 sta arrivando.
          </p>
          <p className="text-amber-400 text-sm">
            Mentre aspetti, scopri il tuo profilo leadership:
          </p>
          <Link
            href="/test"
            className="inline-block mt-4 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 px-8 rounded-lg transition"
          >
            Fai il Test Gratuito
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-block bg-amber-500/20 border border-amber-500/30 rounded-full px-4 py-1 mb-8">
            <span className="text-amber-400 text-sm font-medium">
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
          <p className="text-amber-400 font-medium mb-12">
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
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
            <input
              type="email"
              placeholder="La tua email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-4 px-8 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Iscrizione in corso...' : content.cta}
            </button>
          </form>

          <p className="text-slate-500 text-sm mt-4">
            Zero spam. Cancellazione con un click.
          </p>
        </div>
      </section>

      {/* What You'll Discover */}
      <section className="py-16 px-4 bg-slate-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
            In 7 Giorni Riconoscerai:
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { day: '1', title: 'Il Fuoco Interno', desc: 'La differenza tra motivazione reattiva e motivazione autentica' },
              { day: '2', title: 'Il Coraggio che Costruisce', desc: 'Perché resistere ti fa sentire forte, ma costruire ti rende libero' },
              { day: '3', title: 'La Dedizione che Serve', desc: 'Come distinguere ostinazione travestita da servizio autentico' },
              { day: '4', title: 'Principi Stabili', desc: 'Cosa tenere fisso e cosa adattare nelle decisioni' },
              { day: '5', title: 'Dal Controllo alla Delega', desc: 'Come costruire sistemi che funzionano senza di te' },
              { day: '6', title: 'La Comunicazione che Costruisce', desc: 'Comunicare per costruire insieme, non per convincere' },
            ].map((item) => (
              <div key={item.day} className="flex gap-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <div className="flex-shrink-0 w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                  <span className="text-amber-400 font-bold">{item.day}</span>
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
          <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-3xl font-bold text-slate-900">FM</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Fernando Marongiu</h3>
          <p className="text-amber-400 mb-4">Fondatore Vitaeology</p>
          <p className="text-slate-300 max-w-xl mx-auto">
            &quot;Tra quel ragazzo confuso del &apos;73 e il me al telefono del &apos;25 ci sono 24 comprensioni.
            Alcune mi sono costate anni. Questa sfida è la mappa delle prime 6.&quot;
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 bg-gradient-to-t from-amber-500/10 to-transparent">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto a Riconoscerti?
          </h2>
          <p className="text-slate-300 mb-8">
            7 giorni. 5 minuti al giorno. Una rivelazione per sessione.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="La tua email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-4 px-8 rounded-lg transition"
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
