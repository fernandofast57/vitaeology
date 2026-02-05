'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import DiscoveryConfirmation from '@/components/challenge/DiscoveryConfirmation';
import { getDiscoveryData, type ChallengeType, type DayNumber } from '@/lib/challenge/discovery-data';
import { getDayContent } from '@/lib/challenge/day-content';
import { useDiscoveryProgress } from '@/hooks/useDiscoveryProgress';
import { VideoPlaceholder } from '@/components/challenge/VideoPlaceholder';
import { CHALLENGE_VIDEOS } from '@/config/videos';

// Challenge colors
const CHALLENGE_COLORS = {
  leadership: {
    primary: 'amber',
    hex: '#F4B942',
    gradient: 'from-amber-900 to-slate-900',
    accent: 'amber-500',
    accentHover: 'amber-600',
    badge: 'amber-500/20',
    badgeBorder: 'amber-500/30',
    badgeText: 'amber-400'
  },
  ostacoli: {
    primary: 'emerald',
    hex: '#10B981',
    gradient: 'from-emerald-900 to-slate-900',
    accent: 'emerald-500',
    accentHover: 'emerald-600',
    badge: 'emerald-500/20',
    badgeBorder: 'emerald-500/30',
    badgeText: 'emerald-400'
  },
  microfelicita: {
    primary: 'violet',
    hex: '#8B5CF6',
    gradient: 'from-violet-900 to-slate-900',
    accent: 'violet-500',
    accentHover: 'violet-600',
    badge: 'violet-500/20',
    badgeBorder: 'violet-500/30',
    badgeText: 'violet-400'
  }
};

const CHALLENGE_NAMES = {
  leadership: 'Leadership Autentica',
  ostacoli: 'Oltre gli Ostacoli',
  microfelicita: 'Microfelicità'
};

export default function ChallengeDayPage() {
  const router = useRouter();
  const params = useParams();

  const challengeType = params.type as ChallengeType;
  const dayNumber = parseInt(params.day as string) as DayNumber;

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Stato completamento giorno
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const supabase = createClient();
  const { isUnlocked, isCompleted, isLoading } = useDiscoveryProgress(challengeType, dayNumber);

  // Validate params
  const isValidChallenge = ['leadership', 'ostacoli', 'microfelicita'].includes(challengeType);
  const isValidDay = dayNumber >= 1 && dayNumber <= 7;

  const colors = CHALLENGE_COLORS[challengeType] || CHALLENGE_COLORS.leadership;
  const challengeName = CHALLENGE_NAMES[challengeType] || 'Challenge';

  // Get content
  const dayContent = isValidChallenge && isValidDay ? getDayContent(challengeType, dayNumber) : null;
  const discoveryData = isValidChallenge && isValidDay ? getDiscoveryData(challengeType, dayNumber) : null;

  // Check authentication
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);

      if (!user) {
        router.push(`/auth/login?redirect=/challenge/${challengeType}/day/${dayNumber}`);
      }
    }
    checkAuth();
  }, [supabase, router, challengeType, dayNumber]);

  // Gestione completamento: discovery risposte salvate dal componente, poi chiama complete-day API
  const handleDiscoveryComplete = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const email = user?.email || localStorage.getItem('challenge_email') || '';

      const response = await fetch('/api/challenge/complete-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, challengeType, dayNumber })
      });

      if (!response.ok && response.status !== 409) {
        console.error('Error completing day:', await response.text());
      }

      setSubmitSuccess(true);
    } catch (error) {
      console.error('Error completing day:', error);
      // Le risposte discovery sono già salvate dal componente, segniamo comunque come successo
      setSubmitSuccess(true);
    }
  };

  // Loading state
  if (isAuthenticated === null || isLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-b ${colors.gradient} flex items-center justify-center`}>
        <div className="text-white text-xl">Caricamento...</div>
      </div>
    );
  }

  // Invalid params
  if (!isValidChallenge || !isValidDay) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Pagina non trovata</h1>
          <Link href="/dashboard" className="text-amber-400 hover:underline">
            Torna alla Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Locked state
  if (!isUnlocked) {
    return (
      <div className={`min-h-screen bg-gradient-to-b ${colors.gradient} flex items-center justify-center p-4`}>
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Giorno {dayNumber} Bloccato</h2>
          <p className="text-slate-300 mb-6">
            Completa prima il Giorno {dayNumber - 1} per sbloccare questo contenuto.
          </p>
          <Link
            href={`/challenge/${challengeType}/day/${dayNumber - 1}`}
            className={`inline-block bg-${colors.accent} hover:bg-${colors.accentHover} text-white font-bold py-3 px-8 rounded-lg transition`}
          >
            Vai al Giorno {dayNumber - 1}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b ${colors.gradient}`}>
      {/* Header */}
      <header className="pt-6 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href={`/challenge/${challengeType}`}
            className="text-slate-400 hover:text-white flex items-center gap-2 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {challengeName}
          </Link>

          {/* Progress dots */}
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <div
                key={d}
                className={`w-2 h-2 rounded-full transition-all ${
                  d < dayNumber
                    ? `bg-${colors.accent}`
                    : d === dayNumber
                    ? `bg-${colors.accent} ring-2 ring-${colors.accent}/50`
                    : 'bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Day Badge */}
      <div className="pt-12 pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`inline-block bg-${colors.badge} border border-${colors.badgeBorder} rounded-full px-4 py-1 mb-6`}>
            <span className={`text-${colors.badgeText} text-sm font-medium`}>
              Giorno {dayNumber} di 7
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            {dayContent?.title || `Giorno ${dayNumber}`}
          </h1>

          {dayContent?.subtitle && (
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              {dayContent.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Video del Giorno */}
      <div className="px-4 pb-8">
        <VideoPlaceholder
          challengeType={challengeType as 'leadership' | 'ostacoli' | 'microfelicita'}
          videoUrl={CHALLENGE_VIDEOS[challengeType as keyof typeof CHALLENGE_VIDEOS]?.days[dayNumber - 1]}
          dayNumber={dayNumber}
        />
      </div>

      {/* Main Content */}
      <main className="px-4 pb-16">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* Principle Section */}
          {dayContent?.principle && (
            <section className={`bg-${colors.badge} border border-${colors.badgeBorder} rounded-2xl p-6 md:p-8`}>
              <h2 className={`text-sm font-semibold text-${colors.badgeText} uppercase tracking-wide mb-3`}>
                Il Principio di Oggi
              </h2>
              <p className="text-lg md:text-xl text-white leading-relaxed">
                {dayContent.principle}
              </p>
            </section>
          )}

          {/* Video Section (if available) */}
          {dayContent?.videoUrl && (
            <section className="bg-slate-800/50 rounded-2xl overflow-hidden">
              <div className="aspect-video bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-slate-500">Video in arrivo</p>
                </div>
              </div>
            </section>
          )}

          {/* Content Sections */}
          {dayContent?.sections?.map((section, index) => (
            <section key={index} className="bg-slate-800/30 rounded-2xl p-6 md:p-8 border border-slate-700/50">
              {section.icon && (
                <div className="text-3xl mb-4">{section.icon}</div>
              )}
              <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">
                {section.title}
              </h2>
              <div className="text-slate-300 space-y-4">
                {section.content.split('\n\n').map((paragraph, pIndex) => (
                  <p key={pIndex}>{paragraph}</p>
                ))}
              </div>

              {section.highlights && (
                <ul className="mt-6 space-y-3">
                  {section.highlights.map((highlight, hIndex) => (
                    <li key={hIndex} className="flex items-start gap-3">
                      <span className={`text-${colors.badgeText}`}>✓</span>
                      <span className="text-slate-300">{highlight}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {/* Exercise Section */}
          {dayContent?.exercise && (
            <section className={`bg-${colors.badge} border border-${colors.badgeBorder} rounded-2xl p-6 md:p-8`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-semibold text-${colors.badgeText} flex items-center gap-2`}>
                  <span>📝</span> Esercizio del Giorno
                </h2>
                {dayContent.exercise.duration && (
                  <span className="text-slate-400 text-sm bg-slate-800/50 px-3 py-1 rounded-full">
                    ⏱️ {dayContent.exercise.duration}
                  </span>
                )}
              </div>
              <p className="text-slate-200 mb-4">{dayContent.exercise.instruction}</p>
              {dayContent.exercise.steps && (
                <ol className="space-y-2 text-slate-300">
                  {dayContent.exercise.steps.map((step, sIndex) => (
                    <li key={sIndex} className="flex gap-3">
                      <span className={`text-${colors.badgeText} font-bold`}>{sIndex + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          )}

          {/* Key Takeaway */}
          {dayContent?.keyTakeaway && (
            <div className="text-center py-8">
              <blockquote className="text-xl md:text-2xl text-white italic max-w-2xl mx-auto">
                &ldquo;{dayContent.keyTakeaway}&rdquo;
              </blockquote>
            </div>
          )}

          {/* Discovery Questions A/B/C */}
          {!isCompleted && !submitSuccess && discoveryData && (
            <DiscoveryConfirmation
              challengeType={challengeType}
              dayNumber={dayNumber}
              title={discoveryData.title}
              intro={discoveryData.intro}
              questions={discoveryData.questions}
              ctaText={discoveryData.ctaText}
              accentColor={colors.hex}
              onComplete={handleDiscoveryComplete}
            />
          )}

          {/* Success Message */}
          {submitSuccess && (
            <div className="bg-slate-800/50 rounded-2xl p-6 md:p-8 text-center border border-slate-700/50">
              <div className={`w-16 h-16 bg-${colors.accent} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Giorno {dayNumber} Completato!
              </h3>
              <p className="text-slate-300 mb-6">
                {dayNumber < 7
                  ? `Domani riceverai il Giorno ${dayNumber + 1} nella tua email.`
                  : 'Hai completato la Sfida dei 7 Giorni. Controlla la tua email per scoprire il prossimo passo.'}
              </p>
              {dayNumber < 7 ? (
                <Link
                  href={`/challenge/${challengeType}/day/${dayNumber + 1}`}
                  className={`inline-block bg-${colors.accent} hover:bg-${colors.accentHover} text-white font-bold py-3 px-8 rounded-lg transition`}
                >
                  Vai al Giorno {dayNumber + 1} →
                </Link>
              ) : (
                <Link
                  href={`/challenge/${challengeType}/complete`}
                  className={`inline-block bg-${colors.accent} hover:bg-${colors.accentHover} text-white font-bold py-3 px-8 rounded-lg transition`}
                >
                  Scopri il tuo Profilo →
                </Link>
              )}
            </div>
          )}

          {/* Discovery Confirmation - solo se non completato via form */}
          {!submitSuccess && isCompleted && (
            <div className="bg-slate-800/50 rounded-2xl p-6 text-center border border-slate-700/50">
              <div className={`w-16 h-16 bg-${colors.accent} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Giorno {dayNumber} Completato!</h3>
              <p className="text-slate-400 mb-6">Hai già completato le riflessioni di questo giorno.</p>
              {dayNumber < 7 ? (
                <Link
                  href={`/challenge/${challengeType}/day/${dayNumber + 1}`}
                  className={`inline-block bg-${colors.accent} hover:bg-${colors.accentHover} text-white font-bold py-3 px-8 rounded-lg transition`}
                >
                  Vai al Giorno {dayNumber + 1} →
                </Link>
              ) : (
                <Link
                  href={`/challenge/${challengeType}/complete`}
                  className={`inline-block bg-${colors.accent} hover:bg-${colors.accentHover} text-white font-bold py-3 px-8 rounded-lg transition`}
                >
                  Completa la Sfida →
                </Link>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center text-slate-500 text-sm">
          <p>© 2026 Vitaeology - {challengeName}</p>
        </div>
      </footer>
    </div>
  );
}
