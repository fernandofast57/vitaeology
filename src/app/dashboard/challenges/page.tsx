'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getUserChallenges, getUserChallengesByEmail, linkUserChallenges, type UserChallenge, CHALLENGE_TO_PATHWAY } from '@/lib/challenges';
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { Crown, Target, Heart, CheckCircle, Clock, ArrowRight, Play, Sparkles } from 'lucide-react';

// Icone per challenge
const CHALLENGE_ICONS: Record<string, any> = {
  'leadership-autentica': Crown,
  'oltre-ostacoli': Target,
  'microfelicita': Heart,
};

export default function ChallengesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState<UserChallenge[]>([]);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.replace('/login');
          return;
        }

        setUserEmail(user.email || '');
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');

        // Collega eventuali challenge non ancora collegate
        if (user.email) {
          await linkUserChallenges(supabase, user.id, user.email);
        }

        // Prova prima per user_id
        let userChallenges = await getUserChallenges(supabase, user.id);

        // Se vuoto, prova per email (fallback)
        if (userChallenges.length === 0 && user.email) {
          userChallenges = await getUserChallengesByEmail(supabase, user.email);
        }

        setChallenges(userChallenges);
      } catch (error) {
        console.error('Error fetching challenges:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, supabase]);

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const completedChallenges = challenges.filter(c => c.status === 'completed');

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-petrol-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Caricamento challenge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userEmail={userEmail}
        userName={userName}
      />
      <div className="lg:pl-64">
        <DashboardHeader
          userName={userName}
          userEmail={userEmail}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Le Tue Challenge
            </h1>
            <p className="text-gray-600">
              Percorsi gratuiti di 7 giorni per iniziare la tua trasformazione
            </p>
          </div>

          {/* Nessuna Challenge */}
          {challenges.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="w-16 h-16 bg-petrol-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-petrol-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Nessuna Challenge Attiva
              </h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Inizia una delle nostre challenge gratuite di 7 giorni per scoprire il tuo potenziale di leadership.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  href="/challenge/leadership"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  <Crown className="w-4 h-4" />
                  Leadership
                </Link>
                <Link
                  href="/challenge/ostacoli"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  <Target className="w-4 h-4" />
                  Ostacoli
                </Link>
                <Link
                  href="/challenge/microfelicita"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  Microfelicita
                </Link>
              </div>
            </div>
          )}

          {/* Challenge Attive */}
          {activeChallenges.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                In Corso ({activeChallenges.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeChallenges.map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} isActive />
                ))}
              </div>
            </section>
          )}

          {/* Challenge Completate */}
          {completedChallenges.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Completate ({completedChallenges.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedChallenges.map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} isActive={false} />
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

// ============================================================
// COMPONENTE CARD CHALLENGE
// ============================================================

interface ChallengeCardProps {
  challenge: UserChallenge;
  isActive: boolean;
}

function ChallengeCard({ challenge, isActive }: ChallengeCardProps) {
  const Icon = CHALLENGE_ICONS[challenge.challenge] || Sparkles;
  const pathwaySlug = CHALLENGE_TO_PATHWAY[challenge.challenge];

  // URL per continuare/vedere la challenge
  const challengeUrl = isActive
    ? `/challenge/${pathwaySlug}/day/${challenge.current_day + 1}`
    : `/challenge/${pathwaySlug}/complete`;

  // URL per assessment (se completata)
  const assessmentUrl = pathwaySlug === 'leadership'
    ? '/assessment/leadership'
    : `/assessment/${pathwaySlug}`;

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
      style={{ borderTopColor: challenge.challenge_color, borderTopWidth: '3px' }}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${challenge.challenge_color}20` }}
            >
              <Icon className="w-5 h-5" style={{ color: challenge.challenge_color }} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{challenge.challenge_name}</h3>
              <p className="text-sm text-gray-500">Challenge 7 giorni</p>
            </div>
          </div>
          {challenge.status === 'completed' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              <CheckCircle className="w-3 h-3" />
              Completata
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">
              {isActive ? `Giorno ${challenge.current_day}/7` : 'Completata'}
            </span>
            <span className="font-medium" style={{ color: challenge.challenge_color }}>
              {challenge.progress_percentage}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${challenge.progress_percentage}%`,
                backgroundColor: challenge.challenge_color,
              }}
            />
          </div>
        </div>

        {/* Info */}
        <div className="text-sm text-gray-500 mb-4">
          {isActive ? (
            <p>
              {challenge.days_remaining === 1
                ? 'Ultimo giorno!'
                : `${challenge.days_remaining} giorni rimanenti`}
            </p>
          ) : (
            <p>
              Completata il {new Date(challenge.completed_at!).toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isActive ? (
            <Link
              href={challengeUrl}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-colors"
              style={{ backgroundColor: challenge.challenge_color }}
            >
              <Play className="w-4 h-4" />
              Continua
            </Link>
          ) : (
            <>
              {!challenge.converted_to_assessment && (
                <Link
                  href={assessmentUrl}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-colors"
                  style={{ backgroundColor: challenge.challenge_color }}
                >
                  Fai Assessment
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              {challenge.converted_to_assessment && (
                <span className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Assessment Fatto
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
