'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useFullChallengeProgress } from '@/hooks/useDiscoveryProgress';
import type { ChallengeType } from '@/lib/challenge/discovery-data';
import MiniProfileChart from '@/components/challenge/MiniProfileChart';
import { getChallengeColors, isValidChallengeType, CHALLENGE_TO_ASSESSMENT } from '@/lib/challenge/config';

// Mini-profile data type
interface MiniProfileData {
  challengeType: 'leadership' | 'ostacoli' | 'microfelicita';
  totalScore: number;
  maxScore: number;
  percentage: number;
  dimensionScores: Record<string, { score: number; maxScore: number; percentage: number }>;
  completedDays: number;
}

// Dati specifici per la pagina di completamento (gap creator)
const COMPLETION_DATA: Record<string, {
  completionMessage: string;
  gapExplored: number;
  gapTotal: number;
  gapMessage: string;
  gapCta: string;
}> = {
  leadership: {
    completionMessage: 'Hai scoperto il leader che già opera in te.',
    gapExplored: 4,
    gapTotal: 24,
    gapMessage: 'Le tue risposte hanno esplorato 4 dimensioni della leadership. Ce ne sono 24.',
    gapCta: 'L\'Assessment completo ti mostra tutte le sfumature — anche quelle che hai ma non hai ancora riconosciuto.',
  },
  ostacoli: {
    completionMessage: 'Hai risvegliato il risolutore che è in te.',
    gapExplored: 3,
    gapTotal: 12,
    gapMessage: 'Hai esplorato 3 filtri di problem-solving. L\'Assessment ne rivela le sfumature.',
    gapCta: 'Scopri come usi Pattern, Segnali e Risorse in situazioni diverse — e dove hai margine di crescita.',
  },
  microfelicita: {
    completionMessage: 'Hai imparato a notare il benessere che già ti attraversa.',
    gapExplored: 5,
    gapTotal: 15,
    gapMessage: 'Hai esplorato le 5 fasi R.A.D.A.R. L\'Assessment ti mostra dove sei in ciascuna.',
    gapCta: 'Scopri il tuo profilo di benessere completo — e quali fasi puoi amplificare subito.',
  },
};

export default function ChallengeCompletePage() {
  const params = useParams();
  const router = useRouter();
  const challengeType = params.type as ChallengeType;

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [miniProfile, setMiniProfile] = useState<MiniProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);
  const supabase = createClient();

  const { isComplete, completionPercentage, isLoading } = useFullChallengeProgress(challengeType);

  const isValidChallenge = isValidChallengeType(challengeType);
  const colors = getChallengeColors(challengeType);
  const gap = COMPLETION_DATA[challengeType] || COMPLETION_DATA.leadership;
  const assessmentSlug = CHALLENGE_TO_ASSESSMENT[challengeType] || 'leadership';

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
      } catch {
        setProfileError(true);
      } finally {
        setProfileLoading(false);
      }
    }

    if (challengeType && isAuthenticated) {
      fetchMiniProfile();
    }
  }, [challengeType, isAuthenticated]);

  // Traccia completamento challenge (Meta Pixel + GA)
  useEffect(() => {
    if (isComplete && typeof window !== 'undefined') {
      const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
      if (fbq) {
        fbq('track', 'CompleteRegistration', {
          content_name: `challenge_${challengeType}`,
          content_category: 'challenge_complete',
        });
      }
      const gtag = (window as unknown as { gtag?: (cmd: string, event: string, params: object) => void }).gtag;
      if (gtag) {
        gtag('event', 'challenge_complete', { challenge: challengeType });
      }
    }
  }, [isComplete, challengeType]);

  // Loading state
  if (isAuthenticated === null || isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: `linear-gradient(to bottom, ${colors.gradientFrom}, ${colors.gradientTo})` }}
      >
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
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: `linear-gradient(to bottom, ${colors.gradientFrom}, ${colors.gradientTo})` }}
      >
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
            className="inline-block text-white font-bold py-3 px-8 rounded-lg transition hover:opacity-90"
            style={{ backgroundColor: colors.accentColor }}
          >
            Continua la Sfida
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: `linear-gradient(to bottom, ${colors.gradientFrom}, ${colors.gradientTo})` }}
    >
      {/* Hero: Celebrazione */}
      <section className="pt-20 pb-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Celebration */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div
              className="absolute inset-0 rounded-full animate-ping opacity-25"
              style={{ backgroundColor: colors.accentColor }}
            />
            <div
              className="relative w-24 h-24 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.accentColor }}
            >
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Hai completato la Challenge {colors.name}
          </h1>

          <p className="text-lg" style={{ color: colors.badgeColor }}>
            {gap.completionMessage}
          </p>
        </div>
      </section>

      {/* Mini-Profilo */}
      <section className="py-8 px-4">
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
                Non siamo riusciti a caricare il tuo profilo. Continua pure con il passo successivo.
              </p>
            </div>
          ) : miniProfile ? (
            <MiniProfileChart profile={miniProfile} showGap={true} assessmentDimensions={gap.gapTotal} />
          ) : null}
        </div>
      </section>

      {/* GAP + UNA CTA Assessment */}
      <section className="py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700/50 text-center">
            {/* GAP visuale: barre esplorate vs non esplorate */}
            <div className="mb-6">
              <div className="flex justify-center items-center gap-1.5 mb-4 flex-wrap">
                {/* Barre esplorate (colorate) */}
                {Array.from({ length: gap.gapExplored }).map((_, i) => (
                  <div
                    key={`explored-${i}`}
                    className="w-2.5 h-8 rounded-full"
                    style={{ backgroundColor: colors.accentColor }}
                  />
                ))}
                {/* Barre non esplorate (grigie) */}
                {Array.from({ length: Math.min(gap.gapTotal - gap.gapExplored, 20) }).map((_, i) => (
                  <div
                    key={`unexplored-${i}`}
                    className="w-2.5 h-8 bg-slate-700 rounded-full opacity-40"
                  />
                ))}
              </div>

              <p className="text-slate-300 text-lg mb-2">
                {gap.gapMessage}
              </p>

              <p className="text-slate-400 text-sm">
                {gap.gapCta}
              </p>
            </div>

            {/* Messaggio validante */}
            <p className="text-sm mb-8" style={{ color: colors.badgeColor }}>
              Hai anche capacità che non hai ancora riconosciuto. L&apos;Assessment ti aiuta a vederle.
            </p>

            {/* UNA CTA — STOP→START */}
            <Link
              href={`/assessment/${assessmentSlug}`}
              className="inline-block text-white font-bold py-4 px-12 rounded-lg transition text-lg hover:opacity-90"
              style={{ backgroundColor: colors.accentColor }}
            >
              Scopri il profilo completo
            </Link>
          </div>
        </div>
      </section>

      {/* Link secondario piccolo (non prominente) */}
      <section className="py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Link
            href="/dashboard"
            className="text-slate-500 hover:text-slate-300 text-sm underline transition"
          >
            Torna alla Dashboard
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center text-slate-500 text-sm">
          <p>&copy; 2026 Vitaeology</p>
        </div>
      </footer>
    </div>
  );
}
