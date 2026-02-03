'use client';

// ============================================================================
// PAGE: /challenge/[type]/feedback
// Descrizione: Pagina feedback dettagliato per beta tester
// Flow: Post-challenge Day 7 → Form completo → Thank you
// Obiettivo: 30+ feedback, 10+ testimonials
// ============================================================================

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Star, Loader2, ArrowRight, Check, Heart, MessageSquare } from 'lucide-react';

// Challenge config
const CHALLENGE_CONFIG = {
  leadership: {
    name: 'Leadership Autentica',
    gradient: 'from-amber-900 to-slate-900',
    accent: 'amber',
    bgAccent: 'bg-amber-500',
    textAccent: 'text-amber-400',
    borderAccent: 'border-amber-500',
  },
  ostacoli: {
    name: 'Oltre gli Ostacoli',
    gradient: 'from-emerald-900 to-slate-900',
    accent: 'emerald',
    bgAccent: 'bg-emerald-500',
    textAccent: 'text-emerald-400',
    borderAccent: 'border-emerald-500',
  },
  microfelicita: {
    name: 'Microfelicità',
    gradient: 'from-violet-900 to-slate-900',
    accent: 'violet',
    bgAccent: 'bg-violet-500',
    textAccent: 'text-violet-400',
    borderAccent: 'border-violet-500',
  },
};

type ChallengeType = keyof typeof CHALLENGE_CONFIG;

// Star Rating Component
function StarRating({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const [hoverValue, setHoverValue] = useState(0);

  return (
    <div>
      <label className="text-white font-medium block mb-3">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(0)}
            className="p-1 transition-transform hover:scale-110"
            aria-label={`${star} stelle`}
          >
            <Star
              className={`w-10 h-10 transition-colors ${
                (hoverValue || value) >= star
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-slate-500'
              }`}
            />
          </button>
        ))}
      </div>
      <p className="text-slate-400 text-sm mt-2">
        {value === 0 && 'Clicca per valutare'}
        {value === 1 && 'Da migliorare'}
        {value === 2 && 'Sufficiente'}
        {value === 3 && 'Buono'}
        {value === 4 && 'Molto buono'}
        {value === 5 && 'Eccellente!'}
      </p>
    </div>
  );
}

// NPS Score Component
function NPSScore({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="text-white font-medium block mb-3">
        Quanto consiglieresti questa sfida a un amico?
      </label>
      <div className="flex flex-wrap gap-2">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            className={`w-10 h-10 rounded-lg font-semibold transition-all ${
              value === score
                ? score >= 9
                  ? 'bg-green-500 text-white'
                  : score >= 7
                  ? 'bg-yellow-500 text-white'
                  : 'bg-red-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {score}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-sm text-slate-500 mt-2">
        <span>Per niente</span>
        <span>Assolutamente sì</span>
      </div>
    </div>
  );
}

export default function ChallengeFeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const challengeType = params.type as ChallengeType;

  // UTM tracking
  const utmSource = searchParams.get('utm_source');
  const utmMedium = searchParams.get('utm_medium');
  const utmCampaign = searchParams.get('utm_campaign');
  const utmContent = searchParams.get('utm_content');

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [overallRating, setOverallRating] = useState(0);
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [whatWorked, setWhatWorked] = useState('');
  const [whatCouldImprove, setWhatCouldImprove] = useState('');
  const [testimonial, setTestimonial] = useState('');
  const [testimonialConsent, setTestimonialConsent] = useState(false);
  const [displayName, setDisplayName] = useState('');

  const supabase = createClient();
  const config = CHALLENGE_CONFIG[challengeType] || CHALLENGE_CONFIG.leadership;

  // Check authentication
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);

      if (!user) {
        router.push(`/auth/login?redirect=/challenge/${challengeType}/feedback`);
      }
    }
    checkAuth();
  }, [supabase, router, challengeType]);

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (overallRating === 0) {
      setError('Per favore, indica la tua valutazione generale');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/challenge/beta-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge_type: challengeType,
          overall_rating: overallRating,
          nps_score: npsScore,
          what_worked: whatWorked,
          what_could_improve: whatCouldImprove,
          testimonial,
          testimonial_consent: testimonialConsent,
          display_name: displayName,
          would_recommend: npsScore !== null ? npsScore >= 7 : null,
          completed_days: 7,
          // UTM tracking
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
          utm_content: utmContent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante l\'invio');
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante l\'invio');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading
  if (isAuthenticated === null) {
    return (
      <div className={`min-h-screen bg-gradient-to-b ${config.gradient} flex items-center justify-center`}>
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  // Invalid challenge
  if (!CHALLENGE_CONFIG[challengeType]) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Challenge non trovata</h1>
          <Link href="/dashboard" className="text-amber-400 hover:underline">
            Torna alla Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  if (isSubmitted) {
    return (
      <div className={`min-h-screen bg-gradient-to-b ${config.gradient} flex items-center justify-center p-4`}>
        <div className="max-w-md w-full text-center">
          <div className={`w-20 h-20 ${config.bgAccent} rounded-full flex items-center justify-center mx-auto mb-6`}>
            <Check className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">
            Grazie mille!
          </h1>

          <p className="text-slate-300 mb-6">
            Il tuo feedback è prezioso per migliorare Vitaeology.
            {testimonialConsent && ' Se hai lasciato un testimonial, potremmo usarlo per ispirare altri.'}
          </p>

          <div className="space-y-4">
            <Link
              href="/dashboard"
              className={`block w-full py-3 ${config.bgAccent} hover:opacity-90 text-white font-bold rounded-lg transition`}
            >
              Vai alla Dashboard
            </Link>

            <Link
              href={`/challenge/${challengeType}/complete`}
              className="block w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition"
            >
              Torna al Completamento
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b ${config.gradient}`}>
      {/* Header */}
      <header className="py-6 px-4 border-b border-white/10">
        <div className="max-w-2xl mx-auto">
          <Link href={`/challenge/${challengeType}/complete`} className="text-white/60 hover:text-white text-sm">
            ← Torna al completamento
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className={`inline-flex items-center gap-2 px-4 py-2 bg-${config.accent}-500/20 border border-${config.accent}-500/30 ${config.textAccent} rounded-full text-sm font-medium mb-6`}>
            <Heart className="w-4 h-4" />
            Il tuo feedback conta
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Come è andata la sfida?
          </h1>

          <p className="text-slate-300">
            Aiutaci a capire cosa ha funzionato e cosa possiamo migliorare.
            <br />
            <span className="text-slate-400 text-sm">Ci vorranno solo 2 minuti.</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Rating Section */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <StarRating
              value={overallRating}
              onChange={setOverallRating}
              label="Come valuteresti la sfida nel complesso?"
            />
          </div>

          {/* NPS Section */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <NPSScore value={npsScore} onChange={setNpsScore} />
          </div>

          {/* Feedback Text */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 space-y-6">
            <div>
              <label className="text-white font-medium block mb-2">
                Cosa ha funzionato meglio?
              </label>
              <textarea
                value={whatWorked}
                onChange={(e) => setWhatWorked(e.target.value)}
                placeholder="Es: I video erano chiari, le riflessioni mi hanno fatto pensare..."
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 min-h-[100px]"
              />
            </div>

            <div>
              <label className="text-white font-medium block mb-2">
                Cosa miglioreresti?
              </label>
              <textarea
                value={whatCouldImprove}
                onChange={(e) => setWhatCouldImprove(e.target.value)}
                placeholder="Es: Avrei voluto più esempi pratici, la durata dei video..."
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 min-h-[100px]"
              />
            </div>
          </div>

          {/* Testimonial Section */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className={`w-5 h-5 ${config.textAccent}`} />
              <h3 className="text-white font-semibold">Vuoi condividere la tua esperienza?</h3>
            </div>

            <p className="text-slate-400 text-sm mb-4">
              Se hai trovato valore nella sfida, un breve testimonial può ispirare altri.
              Sarà usato solo con il tuo consenso.
            </p>

            <textarea
              value={testimonial}
              onChange={(e) => setTestimonial(e.target.value)}
              placeholder="Es: Questa sfida mi ha fatto capire che..."
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 min-h-[100px] mb-4"
            />

            {testimonial.length > 20 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div>
                  <label className="text-white text-sm block mb-2">
                    Come vuoi essere identificato?
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Es: Marco, Imprenditore"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 focus:outline-none focus:border-slate-500"
                  />
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={testimonialConsent}
                    onChange={(e) => setTestimonialConsent(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-500 bg-slate-700 text-amber-500 focus:ring-0 focus:ring-offset-0 mt-0.5"
                  />
                  <span className="text-slate-300 text-sm">
                    Acconsento all&apos;utilizzo di questo testimonial sul sito e nei materiali promozionali di Vitaeology
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || overallRating === 0}
            className={`w-full py-4 ${config.bgAccent} hover:opacity-90 text-white font-bold rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Invio in corso...
              </>
            ) : (
              <>
                Invia Feedback
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Skip */}
          <p className="text-center">
            <Link
              href="/dashboard"
              className="text-slate-400 hover:text-white text-sm"
            >
              Preferisco saltare
            </Link>
          </p>
        </form>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-2xl mx-auto text-center text-slate-500 text-sm">
          <p>Il tuo feedback è anonimo e viene usato solo per migliorare il servizio.</p>
        </div>
      </footer>
    </div>
  );
}
