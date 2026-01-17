'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getUserPathways, type UserPathwayWithDetails, PATHWAY_COLORS, PATHWAY_NAMES } from '@/lib/pathways';
import WelcomeHero from '@/components/dashboard/WelcomeHero';
import AssessmentCard from '@/components/dashboard/AssessmentCard';
import QuickStats from '@/components/dashboard/QuickStats';
import TrialBanner from '@/components/dashboard/TrialBanner';
import RecentActivity from '@/components/dashboard/RecentActivity';
import MiniRadarPreview from '@/components/dashboard/MiniRadarPreview';
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import ExercisesCard from '@/components/dashboard/ExercisesCard';
import RecommendedExercises from '@/components/dashboard/RecommendedExercises';
import ChatWidget from '@/components/ai-coach/ChatWidget';
import { AchievementsList, CelebrationModal, type Achievement } from '@/components/dashboard/AchievementCard';

// Configurazione per ogni percorso
export const PATH_CONFIG = {
  leadership: {
    name: 'Leadership Autentica',
    color: '#D4AF37',
    colorClass: 'amber',
    bgGradient: 'from-amber-50 to-amber-100/50',
    accentBg: 'bg-amber-500',
    accentText: 'text-amber-600',
    accentBorder: 'border-amber-500',
    heroTitle: 'Il tuo percorso di Leadership',
    assessmentType: 'leadership',
    bookSlug: 'leadership',
  },
  ostacoli: {
    name: 'Oltre gli Ostacoli',
    color: '#228B22',
    colorClass: 'emerald',
    bgGradient: 'from-emerald-50 to-emerald-100/50',
    accentBg: 'bg-emerald-500',
    accentText: 'text-emerald-600',
    accentBorder: 'border-emerald-500',
    heroTitle: 'Il tuo percorso Risolutore',
    assessmentType: 'ostacoli',
    bookSlug: 'risolutore',
  },
  microfelicita: {
    name: 'Microfelicita Digitale',
    color: '#8B5CF6',
    colorClass: 'violet',
    bgGradient: 'from-violet-50 to-violet-100/50',
    accentBg: 'bg-violet-500',
    accentText: 'text-violet-600',
    accentBorder: 'border-violet-500',
    heroTitle: 'Il tuo percorso di Benessere',
    assessmentType: 'microfelicita',
    bookSlug: 'microfelicita',
  },
} as const;

export type PathType = keyof typeof PATH_CONFIG;

interface PathDashboardProps {
  pathType: PathType;
  autoOpenChat?: boolean;
}

// Mappa pathway slug → dashboard path
const PATHWAY_TO_DASHBOARD: Record<string, string> = {
  'leadership': 'leadership',
  'risolutore': 'ostacoli',
  'microfelicita': 'microfelicita',
};

// Mappa dashboard path → pathway slug
const DASHBOARD_TO_PATHWAY: Record<string, string> = {
  'leadership': 'leadership',
  'ostacoli': 'risolutore',
  'microfelicita': 'microfelicita',
};

export default function PathDashboard({ pathType, autoOpenChat = false }: PathDashboardProps) {
  const config = PATH_CONFIG[pathType];

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [assessment, setAssessment] = useState<any>(null);
  const [pillarScores, setPillarScores] = useState<any[]>([]);
  const [characteristicScores, setCharacteristicScores] = useState<any[]>([]);
  const [exerciseStats, setExerciseStats] = useState({ total: 0, completed: 0, inProgress: 0, completionRate: 0 });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [celebratingAchievement, setCelebratingAchievement] = useState<Achievement | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userPathways, setUserPathways] = useState<UserPathwayWithDetails[]>([]);

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setUserId(user.id);
        setUserEmail(user.email || '');
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');

        // Ottieni percorsi attivi dell'utente
        const pathways = await getUserPathways(supabase, user.id);
        setUserPathways(pathways);

        // Aggiorna current_path nel profilo
        await supabase
          .from('profiles')
          .update({ current_path: pathType })
          .eq('id', user.id);

        // Fetch assessment per questo percorso
        const assessmentTable = pathType === 'leadership'
          ? 'user_assessments'
          : pathType === 'ostacoli'
          ? 'risolutore_results'
          : 'microfelicita_results';

        const { data: assessmentData } = await supabase
          .from(assessmentTable)
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (assessmentData) {
          setAssessment(assessmentData);

          // Calcola punteggi per leadership
          if (pathType === 'leadership' && assessmentData.status === 'completed') {
            const { data: characteristics } = await supabase
              .from('characteristics')
              .select('id, pillar, name_familiar')
              .eq('is_active', true);

            const { data: answers } = await supabase
              .from('user_answers')
              .select(`
                question_id,
                points_earned,
                assessment_questions (
                  characteristic_id
                )
              `)
              .eq('assessment_id', assessmentData.id);

            if (characteristics && answers && answers.length > 0) {
              const scoresByChar: Record<number, { points: number; count: number }> = {};
              answers.forEach((answer: any) => {
                const charId = answer.assessment_questions?.characteristic_id;
                if (charId) {
                  if (!scoresByChar[charId]) scoresByChar[charId] = { points: 0, count: 0 };
                  scoresByChar[charId].points += answer.points_earned;
                  scoresByChar[charId].count += 1;
                }
              });

              const charScoresArray = characteristics.map((char: any) => {
                const scores = scoresByChar[char.id] || { points: 0, count: 0 };
                const maxPoints = scores.count * 2;
                return {
                  characteristicSlug: char.name_familiar,
                  pillar: char.pillar,
                  score: maxPoints > 0 ? Math.round((scores.points / maxPoints) * 100) : 0
                };
              }).filter((c: any) => c.score > 0);

              setCharacteristicScores(charScoresArray);

              const pillarTotals: Record<string, { points: number; maxPoints: number }> = {};
              characteristics.forEach((char: any) => {
                const scores = scoresByChar[char.id];
                if (scores) {
                  const pillar = char.pillar;
                  if (!pillarTotals[pillar]) pillarTotals[pillar] = { points: 0, maxPoints: 0 };
                  pillarTotals[pillar].points += scores.points;
                  pillarTotals[pillar].maxPoints += scores.count * 2;
                }
              });

              const pillarScoresArray = Object.entries(pillarTotals).map(([pillar, data]) => ({
                pillar,
                score: data.maxPoints > 0 ? Math.round((data.points / data.maxPoints) * 100) : 0
              }));

              setPillarScores(pillarScoresArray);
            }
          }
        }

        // Fetch exercise stats per questo percorso
        const { count: totalExercises } = await supabase
          .from('exercises')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)
          .eq('book_slug', config.bookSlug);

        const { data: progressData } = await supabase
          .from('user_exercise_progress')
          .select('status, exercises!inner(book_slug)')
          .eq('user_id', user.id)
          .eq('exercises.book_slug', config.bookSlug);

        const total = totalExercises || 0;
        const completed = (progressData || []).filter((p: any) => p.status === 'completed').length;
        const inProgress = (progressData || []).filter((p: any) => p.status === 'in_progress').length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        setExerciseStats({ total, completed, inProgress, completionRate });

        // Fetch achievements per questo percorso
        const { data: achievementsData } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', user.id)
          .eq('path_type', pathType)
          .order('created_at', { ascending: false });

        if (achievementsData) {
          setAchievements(achievementsData as Achievement[]);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [supabase, pathType, config.bookSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div
          className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: config.color, borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  const hasCompletedAssessment = assessment?.status === 'completed' || assessment?.completed_at;

  // Gestione celebrazione achievement
  const handleCelebrate = async (achievementId: string) => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement) return;

    // Mostra modal celebrazione
    setCelebratingAchievement(achievement);

    // Aggiorna DB
    await supabase
      .from('user_achievements')
      .update({ celebrated: true, celebrated_at: new Date().toISOString() })
      .eq('id', achievementId);

    // Aggiorna stato locale
    setAchievements(prev =>
      prev.map(a => (a.id === achievementId ? { ...a, celebrated: true } : a))
    );
  };

  const handleCloseCelebration = () => {
    setCelebratingAchievement(null);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.bgGradient}`}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userEmail={userEmail} userName={userName} />
      <div className="lg:pl-64">
        <DashboardHeader userName={userName} userEmail={userEmail} onMenuClick={() => setSidebarOpen(true)} />

        {/* Path indicator / Pathway Switcher */}
        <div className={`${config.accentBg} text-white py-2 px-4`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Percorso attivo:</span>
              <span className="text-sm font-bold">{config.name}</span>
            </div>

            {/* Pathway switcher per utenti multi-path */}
            {userPathways.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs opacity-80 hidden sm:inline">Cambia percorso:</span>
                <div className="flex gap-1">
                  {userPathways.map((pathway) => {
                    const slug = pathway.pathway.slug;
                    const dashboardPath = PATHWAY_TO_DASHBOARD[slug];
                    const isActive = DASHBOARD_TO_PATHWAY[pathType] === slug;
                    const pathwayColor = PATHWAY_COLORS[slug as keyof typeof PATHWAY_COLORS];

                    if (isActive) return null; // Non mostrare il percorso attivo

                    return (
                      <Link
                        key={pathway.id}
                        href={`/dashboard/${dashboardPath}`}
                        className="px-3 py-1 rounded-full text-xs font-medium transition-all hover:scale-105"
                        style={{
                          backgroundColor: pathwayColor,
                          color: 'white',
                        }}
                        title={PATHWAY_NAMES[slug as keyof typeof PATHWAY_NAMES]}
                      >
                        {slug === 'leadership' ? 'Leadership' :
                         slug === 'risolutore' ? 'Ostacoli' : 'Microfelicità'}
                      </Link>
                    );
                  })}
                  {/* Link all'overview */}
                  <Link
                    href="/dashboard"
                    className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 hover:bg-white/30 transition-colors"
                    title="Panoramica tutti i percorsi"
                  >
                    Tutti
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <main className="p-4 md:p-6 lg:p-8">
          <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
            <TrialBanner daysRemaining={14} />
            <WelcomeHero
              userName={userName || 'Leader'}
              hasCompletedAssessment={hasCompletedAssessment}
              customTitle={config.heroTitle}
            />
            <QuickStats
              assessmentsCompleted={hasCompletedAssessment ? 1 : 0}
              totalScore={assessment?.total_score || null}
              exercisesCompleted={exerciseStats.completed}
              currentStreak={exerciseStats.inProgress}
            />

            {hasCompletedAssessment && userId ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="lg:col-span-2">
                  <RecommendedExercises userId={userId} maxItems={5} showPriorityAreas={true} />
                </div>
                <div className="lg:col-span-1 flex flex-col gap-4 md:gap-6">
                  <MiniRadarPreview pillarScores={pillarScores} hasResults={true} assessmentId={assessment?.id} />
                  <ExercisesCard stats={exerciseStats} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="lg:col-span-2">
                  <AssessmentCard assessment={assessment} pathType={pathType} />
                </div>
                <div className="lg:col-span-1 flex flex-col gap-4 md:gap-6">
                  <MiniRadarPreview pillarScores={pillarScores} hasResults={false} assessmentId={assessment?.id} />
                  <ExercisesCard stats={exerciseStats} />
                </div>
              </div>
            )}

            <RecentActivity />

            {/* Achievements Section */}
            {achievements.length > 0 && (
              <AchievementsList
                achievements={achievements}
                onCelebrate={handleCelebrate}
                title="I Tuoi Conseguimenti"
                maxItems={5}
                compact={false}
              />
            )}
          </div>
        </main>
      </div>

      {/* Celebration Modal */}
      <CelebrationModal
        achievement={celebratingAchievement}
        isOpen={!!celebratingAchievement}
        onClose={handleCloseCelebration}
      />

      {(userId || process.env.NODE_ENV === 'development') && (
        <ChatWidget
          userContext={{
            userId: userId || 'dev-user',
            userName: userName || undefined,
            assessmentResults: characteristicScores.length > 0 ? characteristicScores : undefined,
            completedExercisesCount: exerciseStats.completed,
            currentWeek: Math.ceil((exerciseStats.completed + 1) / 1),
            // Multi-pathway context
            activePathways: userPathways.length > 1 ? userPathways.map(p => ({
              slug: p.pathway.slug,
              name: PATHWAY_NAMES[p.pathway.slug as keyof typeof PATHWAY_NAMES] || p.pathway.name,
              progressPercentage: p.progress_percentage || 0,
              hasAssessment: !!p.last_assessment_at,
            })) : undefined,
          }}
          currentPath={pathType}
          autoOpen={autoOpenChat}
        />
      )}
    </div>
  );
}
