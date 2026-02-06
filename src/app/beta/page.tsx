'use client';

// ============================================================================
// PAGE: /beta
// Descrizione: Landing page per beta tester con social proof e FAQ
// Flow: Video → Scegli Challenge → Form (email+nome) → Redirect Day 1
// ============================================================================

import { useState, useCallback, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Loader2, ArrowRight, X, Check, ChevronDown, Target, MessageSquare, User } from 'lucide-react';
import Turnstile from '@/components/Turnstile';
import { LANDING_VIDEOS } from '@/config/videos';
import { createClient } from '@/lib/supabase/client';

// FAQ Data
const FAQ_ITEMS = [
  {
    question: 'Quanto tempo richiede?',
    answer: '10 minuti al giorno per 7 giorni. Puoi farlo quando vuoi tu, al ritmo che preferisci.',
  },
  {
    question: 'Devo pagare qualcosa?',
    answer: 'La challenge di 7 giorni è gratuita. I beta tester ricevono anche 6 mesi di accesso premium in regalo (valore €149). Dopo, decidi tu se continuare.',
  },
  {
    question: 'Posso scegliere quale percorso?',
    answer: 'Sì. Puoi scegliere tra Leadership Autentica, Oltre gli Ostacoli o Microfelicità. Scegli quello che senti più vicino.',
  },
  {
    question: 'Cosa succede dopo i 7 giorni?',
    answer: 'Ti chiederò un feedback di 5 minuti per aiutarmi a migliorare. Come beta tester ricevi 6 mesi di premium gratis. Dopo potrai decidere se continuare.',
  },
];

// Perché Beta Tester cards
const WHY_BETA_CARDS = [
  {
    icon: Target,
    title: 'ESCLUSIVO',
    description: 'Solo 100 imprenditori selezionati prima del lancio ufficiale',
  },
  {
    icon: MessageSquare,
    title: 'INFLUENZA',
    description: 'Il tuo feedback migliorerà il percorso per tutti quelli che verranno dopo',
  },
  {
    icon: User,
    title: 'CREATO DA FERNANDO',
    description: 'Percorso basato su 50 anni di esperienza imprenditoriale reale',
  },
];

// Cosa Ricevi list
const BENEFITS_LIST = [
  '1 esercizio pratico al giorno (10 minuti)',
  'Framework testato in 50 anni di imprenditoria',
  'Email giornaliera con video-guida',
  'Nessuna teoria — solo pratica applicabile subito',
  '6 mesi di accesso premium in regalo',
];

// Cosa Ti Chiedo list
const REQUIREMENTS_LIST = [
  '10 minuti al giorno per 7 giorni',
  'Un feedback onesto alla fine (5 minuti)',
  "Nient'altro. Nessun pagamento. Mai.",
];

// Configurazione challenge
const CHALLENGES = [
  {
    id: 'leadership',
    name: 'Leadership Autentica',
    emoji: '👑',
    color: 'amber',
    bgColor: 'bg-amber-500',
    hoverBg: 'hover:bg-amber-600',
    lightBg: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    description: 'Se vuoi guidare a modo tuo',
    dbValue: 'leadership-autentica',
  },
  {
    id: 'ostacoli',
    name: 'Oltre gli Ostacoli',
    emoji: '⛰️',
    color: 'emerald',
    bgColor: 'bg-emerald-500',
    hoverBg: 'hover:bg-emerald-600',
    lightBg: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    description: 'Se c\'è qualcosa che ti blocca',
    dbValue: 'oltre-ostacoli',
  },
  {
    id: 'microfelicita',
    name: 'Microfelicità',
    emoji: '✨',
    color: 'violet',
    bgColor: 'bg-violet-500',
    hoverBg: 'hover:bg-violet-600',
    lightBg: 'bg-violet-50',
    borderColor: 'border-violet-200',
    textColor: 'text-violet-700',
    description: 'Se corri senza goderti nulla',
    dbValue: 'microfelicita',
  },
];

function BetaPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const challengeSectionRef = useRef<HTMLDivElement>(null);

  // UTM tracking
  const utmSource = searchParams.get('utm_source');
  const utmMedium = searchParams.get('utm_medium');
  const utmCampaign = searchParams.get('utm_campaign');
  const utmContent = searchParams.get('utm_content');

  // ?challenge= param dagli ads (auto-seleziona challenge)
  const challengeParam = searchParams.get('challenge');

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Scroll to challenge section
  const scrollToChallenge = () => {
    challengeSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Check auth status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkAuth();
  }, [supabase]);

  // State
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Auto-seleziona challenge da ?challenge= param (dagli ads)
  useEffect(() => {
    if (challengeParam && CHALLENGES.some(c => c.id === challengeParam)) {
      setSelectedChallenge(challengeParam);
      setShowForm(true);
    }
  }, [challengeParam]);
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  // Seleziona challenge e mostra form
  const handleSelectChallenge = (challengeId: string) => {
    setSelectedChallenge(challengeId);
    setShowForm(true);
    setError('');
  };

  // Chiudi form
  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedChallenge(null);
    setError('');
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!turnstileToken) {
      setError('Attendi la verifica di sicurezza...');
      return;
    }

    if (!selectedChallenge) {
      setError('Seleziona una challenge');
      return;
    }

    const challenge = CHALLENGES.find(c => c.id === selectedChallenge);
    if (!challenge) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Usa la stessa API di subscribe delle challenge
      const response = await fetch('/api/challenge/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          nome: nome.trim(),
          challenge: challenge.dbValue,
          variant: 'beta', // Identifica come beta tester
          turnstileToken,
          // UTM tracking (camelCase per match con API subscribe)
          utmSource,
          utmMedium,
          utmCampaign,
          utmContent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante l\'iscrizione');
      }

      // Redirect alla Thank You page con OTO (fresh=true resetta il timer)
      router.push(`/challenge/${selectedChallenge}/grazie?fresh=true`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante l\'iscrizione');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedChallengeData = CHALLENGES.find(c => c.id === selectedChallenge);

  return (
    <div className="min-h-screen bg-gradient-to-b from-petrol-800 via-petrol-900 to-slate-900">
      {/* Header */}
      <header className="bg-petrol-900/50 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10">
        <nav className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo-horizontal-white.svg"
                alt="Vitaeology"
                width={150}
                height={22}
                className="h-6 w-auto"
              />
            </Link>
            <Link
              href={isLoggedIn ? '/dashboard' : '/auth/login'}
              className="text-white/70 hover:text-white font-medium text-sm"
            >
              {isLoggedIn ? 'Dashboard' : 'Accedi'}
            </Link>
          </div>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Badge Beta */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/20 border border-gold-500/30 text-gold-400 rounded-full text-sm font-medium">
            🚀 Programma Beta Tester
          </span>
        </div>

        {/* Titolo */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white text-center mb-4">
          Cerco 100 Compagni di Viaggio
        </h1>
        <p className="text-lg text-white/70 text-center max-w-2xl mx-auto mb-10">
          Prova gratis uno dei tre percorsi e aiutami a costruire il futuro di Vitaeology.
        </p>

        {/* Video Player */}
        <div className="mb-12">
          <div className="relative max-w-2xl mx-auto rounded-xl overflow-hidden shadow-2xl bg-black">
            <div className="relative aspect-video">
              {!isVideoPlaying ? (
                <button
                  onClick={() => setIsVideoPlaying(true)}
                  className="relative w-full h-full group cursor-pointer"
                  aria-label="Riproduci video"
                >
                  {/* Thumbnail - usa homepage thumbnail come placeholder */}
                  <Image
                    src={LANDING_VIDEOS.beta.thumbnail}
                    alt="Video Beta Tester"
                    fill
                    className="object-cover"
                    priority
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300" />
                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg">
                      <Play className="w-8 h-8 text-petrol-600 ml-1" fill="currentColor" />
                    </div>
                  </div>
                </button>
              ) : (
                <video
                  className="absolute inset-0 w-full h-full object-contain"
                  controls
                  autoPlay
                  playsInline
                >
                  {/* TODO: Aggiornare con URL video beta quando pronto */}
                  <source src={LANDING_VIDEOS.beta.videoUrl} type="video/mp4" />
                </video>
              )}
            </div>
          </div>
          {/* Badge Fernando */}
          <div className="flex justify-center mt-4">
            <span className="bg-petrol-800 text-gold-400 text-xs font-medium px-4 py-1.5 rounded-full border border-gold-500/30">
              Fernando Marongiu
            </span>
          </div>
        </div>

        {/* Sezione Challenge */}
        <div ref={challengeSectionRef} className="text-center mb-8 scroll-mt-24">
          <h2 className="text-2xl font-bold text-white mb-2">
            Quale sfida ti chiama?
          </h2>
          <p className="text-white/60">
            Scegli il percorso che senti più vicino. Non quello che &quot;dovresti&quot; fare.
          </p>
        </div>

        {/* 3 Challenge Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {CHALLENGES.map((challenge) => (
            <button
              key={challenge.id}
              onClick={() => handleSelectChallenge(challenge.id)}
              className={`relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left group`}
            >
              {/* Color bar top */}
              <div className={`h-2 ${challenge.bgColor}`} />

              <div className="p-6">
                <div className="text-4xl mb-4">{challenge.emoji}</div>
                <h3 className="text-xl font-bold text-petrol-600 mb-2">
                  {challenge.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {challenge.description}
                </p>
                <div className={`inline-flex items-center gap-2 ${challenge.bgColor} ${challenge.hoverBg} text-white font-bold py-2.5 px-5 rounded-lg transition group-hover:gap-3`}>
                  Scegli
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Info aggiuntive */}
        <div className="text-center text-white/50 text-sm mb-20">
          <p>7 giorni • 10 minuti al giorno • Completamente gratuito</p>
        </div>

        {/* ============================================================ */}
        {/* SEZIONE: Perché Beta Tester */}
        {/* ============================================================ */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-white text-center mb-10">
            Perché diventare Beta Tester?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {WHY_BETA_CARDS.map((card, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors"
              >
                <div className="w-14 h-14 bg-gold-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <card.icon className="w-7 h-7 text-gold-400" />
                </div>
                <h3 className="text-lg font-bold text-gold-400 mb-2">{card.title}</h3>
                <p className="text-white/70 text-sm">{card.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* SEZIONE: Cosa Ricevi */}
        {/* ============================================================ */}
        <section className="mb-20">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              Cosa ricevi
            </h2>
            <ul className="space-y-4">
              {BENEFITS_LIST.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-white/90">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SEZIONE: Chi è Fernando */}
        {/* ============================================================ */}
        <section className="mb-20">
          <div className="bg-gradient-to-r from-petrol-700/50 to-petrol-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Photo */}
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden flex-shrink-0 shadow-lg ring-4 ring-gold-500/30">
                <Image
                  src="/images/fernando.png"
                  alt="Fernando Marongiu"
                  width={160}
                  height={160}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Bio text */}
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold text-white mb-1">Fernando Marongiu</h3>
                <p className="text-gold-400 text-sm mb-4">Imprenditore da oltre 50 anni • Fondatore HZ Holding</p>
                <blockquote className="text-white/80 italic">
                  &ldquo;Ho creato Vitaeology perché credo che le capacità che cerchiamo fuori le abbiamo già dentro.
                  Cerco 100 persone che vogliano testarlo con me prima del lancio.&rdquo;
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SEZIONE: Cosa Ti Chiedo */}
        {/* ============================================================ */}
        <section className="mb-12">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              Cosa ti chiedo
            </h2>
            <ul className="space-y-4">
              {REQUIREMENTS_LIST.map((req, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-white/90">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ============================================================ */}
        {/* CTA SECONDARIA */}
        {/* ============================================================ */}
        <section className="mb-20 text-center">
          <button
            onClick={scrollToChallenge}
            className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-petrol-900 font-bold py-4 px-8 rounded-lg transition-all hover:gap-3 shadow-lg hover:shadow-xl"
          >
            Scegli la Tua Sfida
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-white/50 text-sm mt-3">Solo 100 posti disponibili</p>
        </section>

        {/* ============================================================ */}
        {/* FAQ ACCORDION */}
        {/* ============================================================ */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Domande frequenti
          </h2>
          <div className="max-w-2xl mx-auto space-y-3">
            {FAQ_ITEMS.map((faq, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-medium text-white">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-white/60 transition-transform ${
                      openFaqIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaqIndex === index && (
                  <div className="px-6 pb-4">
                    <p className="text-white/70">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Modal Form */}
      {showForm && selectedChallengeData && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className={`${selectedChallengeData.bgColor} p-6 text-white relative`}>
              <button
                onClick={handleCloseForm}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition"
                aria-label="Chiudi"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="text-3xl mb-2">{selectedChallengeData.emoji}</div>
              <h3 className="text-xl font-bold">{selectedChallengeData.name}</h3>
              <p className="text-white/80 text-sm mt-1">Challenge di 7 giorni</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                  Il tuo nome
                </label>
                <input
                  type="text"
                  id="nome"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrol-500 focus:border-transparent"
                  placeholder="Come ti chiami?"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  La tua email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrol-500 focus:border-transparent"
                  placeholder="tu@email.com"
                />
              </div>

              {/* Turnstile */}
              <div className="flex justify-center">
                <Turnstile onVerify={handleTurnstileVerify} theme="light" />
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || !turnstileToken}
                className={`w-full py-3.5 ${selectedChallengeData.bgColor} ${selectedChallengeData.hoverBg} text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Iscrizione in corso...
                  </>
                ) : (
                  <>
                    Inizia i 7 Giorni
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Nessuna carta richiesta. Riceverai i contenuti via email.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-5xl mx-auto text-center text-white/40 text-sm">
          <p>© 2026 Vitaeology - Fernando Marongiu</p>
          <div className="mt-2 space-x-4">
            <Link href="/privacy" className="hover:text-white/70">Privacy</Link>
            <Link href="/terms" className="hover:text-white/70">Termini</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Loading fallback
function BetaPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-petrol-800 via-petrol-900 to-slate-900 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
    </div>
  );
}

// Export con Suspense wrapper
export default function BetaPage() {
  return (
    <Suspense fallback={<BetaPageLoading />}>
      <BetaPageContent />
    </Suspense>
  );
}
