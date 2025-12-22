'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useFullChallengeProgress } from '@/hooks/useDiscoveryProgress';
import type { ChallengeType } from '@/lib/challenge/discovery-data';

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
    nextSteps: [
      { icon: '📊', title: 'Assessment Completo', description: 'Scopri tutte le 24 caratteristiche di leadership', link: '/test', cta: 'Fai il Test' },
      { icon: '🎯', title: 'Esercizi Pratici', description: 'Continua ad allenare la tua leadership', link: '/exercises', cta: 'Esplora Esercizi' },
      { icon: '🤖', title: 'AI Coach Fernando', description: 'Parla con il tuo coach personale', link: '/dashboard', cta: 'Inizia Chat' }
    ]
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
    nextSteps: [
      { icon: '📊', title: 'Assessment Completo', description: 'Scopri il tuo profilo di problem-solving', link: '/test', cta: 'Fai il Test' },
      { icon: '🛠️', title: 'Strumenti Avanzati', description: 'Approfondisci i sistemi A.Z.I.O.N.E. e C.R.E.S.C.I.T.A.', link: '/exercises', cta: 'Esplora Strumenti' },
      { icon: '🤖', title: 'AI Coach Fernando', description: 'Applica gli strumenti a sfide reali', link: '/dashboard', cta: 'Inizia Chat' }
    ]
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
    nextSteps: [
      { icon: '📊', title: 'Assessment Completo', description: 'Scopri il tuo profilo di benessere', link: '/test', cta: 'Fai il Test' },
      { icon: '🧘', title: 'Pratiche Quotidiane', description: 'Esercizi per consolidare R.A.D.A.R.', link: '/exercises', cta: 'Esplora Pratiche' },
      { icon: '🤖', title: 'AI Coach Fernando', description: 'Continua il percorso di consapevolezza', link: '/dashboard', cta: 'Inizia Chat' }
    ]
  }
};

export default function ChallengeCompletePage() {
  const params = useParams();
  const router = useRouter();
  const challengeType = params.type as ChallengeType;

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const supabase = createClient();

  const { isComplete, completionPercentage, isLoading } = useFullChallengeProgress(challengeType);

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

      {/* Next Steps */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Continua il Tuo Percorso
          </h2>

          <div className="space-y-4">
            {config.nextSteps.map((step, index) => (
              <Link
                key={index}
                href={step.link}
                className="block bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 hover:border-slate-600 transition group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 bg-${config.badge} rounded-xl flex items-center justify-center text-2xl`}>
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold group-hover:text-amber-400 transition">
                      {step.title}
                    </h3>
                    <p className="text-slate-400 text-sm">{step.description}</p>
                  </div>
                  <div className={`text-${config.badgeText} font-medium flex items-center gap-2`}>
                    {step.cta}
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
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
          <p>© 2025 Vitaeology</p>
        </div>
      </footer>
    </div>
  );
}
