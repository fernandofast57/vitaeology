'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useFullChallengeProgress } from '@/hooks/useDiscoveryProgress';
import type { ChallengeType } from '@/lib/challenge/discovery-data';
import MiniProfileChart from '@/components/challenge/MiniProfileChart';

// Feedback state type
interface FeedbackState {
  nextAction: string;
  missingFeedback: string;
  submitted: boolean;
}

// Mini-profile data type
interface MiniProfileData {
  challengeType: 'leadership' | 'ostacoli' | 'microfelicita';
  totalScore: number;
  maxScore: number;
  percentage: number;
  dimensionScores: Record<string, { score: number; maxScore: number; percentage: number }>;
  completedDays: number;
}

const CHALLENGE_CONFIG = {
  leadership: {
    name: 'Leadership Autentica',
    gradient: 'from-amber-900 to-slate-900',
    accent: 'amber-500',
    accentHover: 'amber-600',
    badge: 'amber-500/20',
    badgeBorder: 'amber-500/30',
    badgeText: 'amber-400',
    completionMessage: 'Hai scoperto il leader che già opera in te.',
    bookTitle: 'Leadership Autentica',
    bookSlug: 'leadership',
    bookPrice: '24,90',
    assessmentPath: '/assessment/leadership',
    primaryCta: {
      icon: '📖',
      title: 'Continua il Percorso con il Libro',
      description: 'Il libro contiene il QR code per sbloccare l\'Assessment completo e accedere a Explorer',
      link: '/libro/leadership',
      cta: 'Acquista €24,90',
      price: '24,90'
    },
    secondaryCta: {
      icon: '📊',
      title: 'Hai già il libro?',
      description: 'Accedi all\'Assessment completo con il QR code',
      link: '/assessment/leadership',
      cta: 'Vai all\'Assessment'
    }
  },
  ostacoli: {
    name: 'Oltre gli Ostacoli',
    gradient: 'from-emerald-900 to-slate-900',
    accent: 'emerald-500',
    accentHover: 'emerald-600',
    badge: 'emerald-500/20',
    badgeBorder: 'emerald-500/30',
    badgeText: 'emerald-400',
    completionMessage: 'Hai risvegliato il risolutore che è in te.',
    bookTitle: 'Oltre gli Ostacoli',
    bookSlug: 'risolutore',
    bookPrice: '24,90',
    assessmentPath: '/assessment/risolutore',
    primaryCta: {
      icon: '📖',
      title: 'Continua il Percorso con il Libro',
      description: 'Il libro contiene il QR code per sbloccare l\'Assessment completo e accedere a Explorer',
      link: '/libro/risolutore',
      cta: 'Acquista €24,90',
      price: '24,90'
    },
    secondaryCta: {
      icon: '📊',
      title: 'Hai già il libro?',
      description: 'Accedi all\'Assessment completo con il QR code',
      link: '/assessment/risolutore',
      cta: 'Vai all\'Assessment'
    }
  },
  microfelicita: {
    name: 'Microfelicità',
    gradient: 'from-violet-900 to-slate-900',
    accent: 'violet-500',
    accentHover: 'violet-600',
    badge: 'violet-500/20',
    badgeBorder: 'violet-500/30',
    badgeText: 'violet-400',
    completionMessage: 'Hai imparato a notare il benessere che già ti attraversa.',
    bookTitle: 'Microfelicità Digitale',
    bookSlug: 'microfelicita',
    bookPrice: '24,90',
    assessmentPath: '/assessment/microfelicita',
    primaryCta: {
      icon: '📖',
      title: 'Continua il Percorso con il Libro',
      description: 'Il libro contiene il QR code per sbloccare l\'Assessment completo e accedere a Explorer',
      link: '/libro/microfelicita',
      cta: 'Acquista €24,90',
      price: '24,90'
    },
    secondaryCta: {
      icon: '📊',
      title: 'Hai già il libro?',
      description: 'Accedi all\'Assessment completo con il QR code',
      link: '/assessment/microfelicita',
      cta: 'Vai all\'Assessment'
    }
  }
};

export default function ChallengeCompletePage() {
  const params = useParams();
  const router = useRouter();
  const challengeType = params.type as ChallengeType;

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>({
    nextAction: '',
    missingFeedback: '',
    submitted: false
  });
  const [miniProfile, setMiniProfile] = useState<MiniProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);
  const supabase = createClient();

  const { isComplete, completionPercentage, isLoading } = useFullChallengeProgress(challengeType);

  // Handle feedback submission
  const handleFeedback = async () => {
    try {
      const response = await fetch('/api/challenge/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge_type: challengeType,
          next_action: feedback.nextAction,
          missing_feedback: feedback.missingFeedback || null
        })
      });

      if (response.ok) {
        setFeedback(prev => ({ ...prev, submitted: true }));
      }
    } catch (error) {
      console.error('Errore invio feedback:', error);
      // Continua comunque per UX
      setFeedback(prev => ({ ...prev, submitted: true }));
    }
  };

  const isValidChallenge = ['leadership', 'ostacoli', 'microfelicita'].includes(challengeType);
  const config = CHALLENGE_CONFIG[challengeType] || CHALLENGE_CONFIG.leadership;

  // Check authentication
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);

      if (!user) {
        router.push(`/auth/login?redirect=/challenge/${challengeType}/complete`);
      }
    }
    checkAuth();
  }, [supabase, router, challengeType]);

  // Fetch mini-profile
  useEffect(() => {
    async function fetchMiniProfile() {
      try {
        const res = await fetch(`/api/challenge/mini-profile?type=${challengeType}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.profile) {
            setMiniProfile(data.profile);
          }
        }
      } catch (error) {
        console.error('Errore caricamento mini-profilo:', error);
        setProfileError(true);
      } finally {
        setProfileLoading(false);
      }
    }

    if (challengeType && isAuthenticated) {
      fetchMiniProfile();
    }
  }, [challengeType, isAuthenticated]);

  // Loading state
  if (isAuthenticated === null || isLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-b ${config.gradient} flex items-center justify-center`}>
        <div className="text-white text-xl">Caricamento...</div>
      </div>
    );
  }

  // Invalid challenge
  if (!isValidChallenge) {
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

  // Not complete
  if (!isComplete) {
    return (
      <div className={`min-h-screen bg-gradient-to-b ${config.gradient} flex items-center justify-center p-4`}>
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Sfida Non Completata</h2>
          <p className="text-slate-300 mb-4">
            Hai completato il {completionPercentage}% della sfida.
          </p>
          <p className="text-slate-400 mb-6">
            Completa tutti i 7 giorni per sbloccare questa pagina.
          </p>
          <Link
            href={`/challenge/${challengeType}/day/1`}
            className={`inline-block bg-${config.accent} hover:bg-${config.accentHover} text-white font-bold py-3 px-8 rounded-lg transition`}
          >
            Continua la Sfida
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b ${config.gradient}`}>
      {/* Hero */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Celebration Animation */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className={`absolute inset-0 bg-${config.accent} rounded-full animate-ping opacity-25`} />
            <div className={`relative w-32 h-32 bg-${config.accent} rounded-full flex items-center justify-center`}>
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Badge */}
          <div className={`inline-block bg-${config.badge} border border-${config.badgeBorder} rounded-full px-6 py-2 mb-6`}>
            <span className={`text-${config.badgeText} font-semibold`}>
              🎉 Sfida Completata!
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Congratulazioni!
          </h1>

          <p className="text-xl text-slate-300 mb-4">
            Hai completato la sfida <span className="text-white font-semibold">{config.name}</span>
          </p>

          <p className={`text-${config.badgeText} text-lg`}>
            {config.completionMessage}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-6 text-center border border-slate-700/50">
              <div className={`text-3xl font-bold text-${config.badgeText} mb-2`}>7</div>
              <div className="text-slate-400 text-sm">Giorni Completati</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-6 text-center border border-slate-700/50">
              <div className={`text-3xl font-bold text-${config.badgeText} mb-2`}>21</div>
              <div className="text-slate-400 text-sm">Riflessioni</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-6 text-center border border-slate-700/50">
              <div className={`text-3xl font-bold text-${config.badgeText} mb-2`}>100%</div>
              <div className="text-slate-400 text-sm">Completamento</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mini-Profilo */}
      <section className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {profileLoading ? (
            <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : profileError ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
              <p className="text-yellow-800">
                Non siamo riusciti a caricare il tuo profilo. Continua pure con i prossimi passi.
              </p>
            </div>
          ) : miniProfile ? (
            <MiniProfileChart profile={miniProfile} />
          ) : null}
        </div>
      </section>

      {/* Feedback Section */}
      <section className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {!feedback.submitted ? (
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-xl font-bold text-white mb-2">Prima di continuare...</h3>
              <p className="text-slate-400 mb-6">Una domanda veloce per personalizzare il tuo percorso</p>

              <div className="space-y-6">
                <div>
                  <label className="text-white font-medium block mb-3">Cosa vorresti fare adesso?</label>
                  <div className="space-y-3">
                    {[
                      { value: 'book', label: 'Continua con il libro (Consigliato)', icon: '📖', recommended: true },
                      { value: 'assessment', label: 'Ho già il libro, voglio fare l\'Assessment', icon: '📊', recommended: false },
                      { value: 'time', label: 'Ho bisogno di tempo per elaborare', icon: '⏳', recommended: false }
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                          feedback.nextAction === option.value
                            ? `bg-${config.badge} border-${config.accent}`
                            : 'bg-slate-700/50 hover:bg-slate-700'
                        } border border-slate-600`}
                      >
                        <input
                          type="radio"
                          name="nextAction"
                          value={option.value}
                          checked={feedback.nextAction === option.value}
                          onChange={(e) => setFeedback(prev => ({ ...prev, nextAction: e.target.value }))}
                          className="sr-only"
                        />
                        <span className="text-xl">{option.icon}</span>
                        <span className="text-white">{option.label}</span>
                        {feedback.nextAction === option.value && (
                          <svg className={`w-5 h-5 ml-auto text-${config.badgeText}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-white font-medium block mb-2">
                    C&apos;è qualcosa che ti è mancato? <span className="text-slate-400 font-normal">(opzionale)</span>
                  </label>
                  <textarea
                    placeholder="Aiutaci a migliorare..."
                    value={feedback.missingFeedback}
                    onChange={(e) => setFeedback(prev => ({ ...prev, missingFeedback: e.target.value }))}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 min-h-[80px]"
                  />
                </div>

                <button
                  onClick={handleFeedback}
                  disabled={!feedback.nextAction}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition ${
                    feedback.nextAction
                      ? `bg-${config.accent} hover:bg-${config.accentHover} text-white`
                      : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Continua →
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 text-center">
              <div className={`text-${config.badgeText} text-4xl mb-4`}>✓</div>
              <p className="text-white font-medium mb-6">Grazie per il feedback!</p>

              {feedback.nextAction === 'book' && (
                <div className="space-y-4">
                  <p className="text-slate-300 mb-2">
                    Il libro &quot;{config.bookTitle}&quot; contiene il QR code per sbloccare l&apos;Assessment completo e accedere a Explorer.
                  </p>
                  <Link
                    href={`/libro/${config.bookSlug}`}
                    className={`inline-block bg-${config.accent} hover:bg-${config.accentHover} text-white font-bold py-4 px-10 rounded-lg transition text-lg`}
                  >
                    Acquista il Libro €{config.bookPrice} →
                  </Link>
                </div>
              )}
              {feedback.nextAction === 'assessment' && (
                <div className="space-y-4">
                  <p className="text-slate-300 mb-2">
                    Inserisci il codice QR trovato nel libro per sbloccare l&apos;Assessment completo.
                  </p>
                  <Link
                    href={config.assessmentPath}
                    className={`inline-block bg-${config.accent} hover:bg-${config.accentHover} text-white font-bold py-3 px-8 rounded-lg transition`}
                  >
                    Vai all&apos;Assessment →
                  </Link>
                </div>
              )}
              {feedback.nextAction === 'time' && (
                <div>
                  <p className="text-slate-400 mb-4">
                    Prenditi il tempo che ti serve. Quando sei pronto, troverai tutto nella dashboard.
                  </p>
                  <Link
                    href="/dashboard"
                    className="inline-block bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-8 rounded-lg transition"
                  >
                    Vai alla Dashboard
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Next Steps - LIBRO come CTA primaria */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Continua il Tuo Percorso
          </h2>

          <div className="space-y-4">
            {/* CTA PRIMARIA: LIBRO */}
            <Link
              href={config.primaryCta.link}
              className={`block bg-${config.badge} rounded-xl p-6 border-2 border-${config.accent} hover:bg-${config.accent}/30 transition group`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 bg-${config.accent} rounded-xl flex items-center justify-center text-2xl`}>
                  {config.primaryCta.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg group-hover:text-white transition">
                    {config.primaryCta.title}
                  </h3>
                  <p className="text-slate-300 text-sm">{config.primaryCta.description}</p>
                </div>
                <div className="text-center">
                  <div className={`text-${config.badgeText} font-bold text-xl`}>
                    €{config.primaryCta.price}
                  </div>
                  <div className={`bg-${config.accent} text-white font-semibold py-2 px-4 rounded-lg mt-2 group-hover:scale-105 transition`}>
                    {config.primaryCta.cta.replace(`€${config.primaryCta.price}`, '').trim() || 'Acquista Ora'}
                  </div>
                </div>
              </div>
            </Link>

            {/* CTA SECONDARIA: Assessment (per chi ha già il libro) */}
            <Link
              href={config.secondaryCta.link}
              className="block bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600 transition group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center text-xl`}>
                  {config.secondaryCta.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-slate-300 font-medium group-hover:text-white transition">
                    {config.secondaryCta.title}
                  </h3>
                  <p className="text-slate-500 text-sm">{config.secondaryCta.description}</p>
                </div>
                <div className={`text-slate-400 font-medium flex items-center gap-2 group-hover:text-${config.badgeText}`}>
                  {config.secondaryCta.cta}
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Share */}
      <section className="py-12 px-4">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-slate-400 mb-4">Condividi il tuo risultato</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                const text = `Ho completato la sfida "${config.name}" di Vitaeology! 🎉`;
                if (navigator.share) {
                  navigator.share({ text, url: window.location.href });
                }
              }}
              className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Condividi
            </button>
          </div>
        </div>
      </section>

      {/* Other Challenges */}
      <section className="py-12 px-4 border-t border-slate-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-semibold text-white mb-6">
            Esplora le Altre Sfide
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {challengeType !== 'leadership' && (
              <Link
                href="/challenge/leadership"
                className="bg-amber-500/20 border border-amber-500/30 text-amber-400 px-6 py-3 rounded-lg hover:bg-amber-500/30 transition"
              >
                Leadership Autentica
              </Link>
            )}
            {challengeType !== 'ostacoli' && (
              <Link
                href="/challenge/ostacoli"
                className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-6 py-3 rounded-lg hover:bg-emerald-500/30 transition"
              >
                Oltre gli Ostacoli
              </Link>
            )}
            {challengeType !== 'microfelicita' && (
              <Link
                href="/challenge/microfelicita"
                className="bg-violet-500/20 border border-violet-500/30 text-violet-400 px-6 py-3 rounded-lg hover:bg-violet-500/30 transition"
              >
                Microfelicità
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center text-slate-500 text-sm">
          <p>© 2026 Vitaeology</p>
        </div>
      </footer>
    </div>
  );
}
