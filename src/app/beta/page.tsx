'use client';

// ============================================================================
// PAGE: /beta
// Descrizione: Landing page semplificata per beta tester
// Flow: Video → Scegli Challenge → Form (email+nome) → Redirect Day 1
// ============================================================================

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Loader2, ArrowRight, X } from 'lucide-react';
import Turnstile from '@/components/Turnstile';
import { LANDING_VIDEOS } from '@/config/videos';
import { createClient } from '@/lib/supabase/client';

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

  // UTM tracking
  const utmSource = searchParams.get('utm_source');
  const utmMedium = searchParams.get('utm_medium');
  const utmCampaign = searchParams.get('utm_campaign');
  const utmContent = searchParams.get('utm_content');

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
          // UTM tracking
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
          utm_content: utmContent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante l\'iscrizione');
      }

      // Redirect alla challenge Day 1
      router.push(`/challenge/${selectedChallenge}/day/1`);
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
        <div className="text-center mb-8">
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
        <div className="text-center text-white/50 text-sm">
          <p>7 giorni • 10 minuti al giorno • Completamente gratuito</p>
        </div>
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
