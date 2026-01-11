'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ArrowRight, Sparkles, Target, Clock, BarChart3 } from 'lucide-react';
import LeadershipRadarChart from '@/components/charts/LeadershipRadarChart';
import RecentActivity from '@/components/dashboard/RecentActivity';
import ExercisesCard from '@/components/dashboard/ExercisesCard';

// Configurazione per ogni percorso
const PATH_CONFIG = {
  leadership: {
    title: 'La Tua Leadership Autentica',
    name: 'Leadership Autentica',
    color: '#D4AF37',
    colorClass: 'amber',
    bgGradient: 'from-amber-50 to-amber-100/50',
    accentBg: 'bg-amber-500',
    accentBgLight: 'bg-amber-50',
    accentText: 'text-amber-600',
    accentTextDark: 'text-amber-700',
    accentBorder: 'border-amber-200',
    accentHover: 'hover:bg-amber-600',
    bookSlug: 'leadership',
    assessmentUrl: '/test',
    resultsUrl: '/results',
  },
  ostacoli: {
    title: 'Il Tuo Percorso Risolutore',
    name: 'Oltre gli Ostacoli',
    color: '#228B22',
    colorClass: 'emerald',
    bgGradient: 'from-emerald-50 to-emerald-100/50',
    accentBg: 'bg-emerald-500',
    accentBgLight: 'bg-emerald-50',
    accentText: 'text-emerald-600',
    accentTextDark: 'text-emerald-700',
    accentBorder: 'border-emerald-200',
    accentHover: 'hover:bg-emerald-600',
    bookSlug: 'risolutore',
    assessmentUrl: '/assessment/risolutore',
    resultsUrl: '/assessment/risolutore/results',
  },
  microfelicita: {
    title: 'Le Tue Microfelicità',
    name: 'Microfelicità Digitale',
    color: '#8B5CF6',
    colorClass: 'violet',
    bgGradient: 'from-violet-50 to-violet-100/50',
    accentBg: 'bg-violet-500',
    accentBgLight: 'bg-violet-50',
    accentText: 'text-violet-600',
    accentTextDark: 'text-violet-700',
    accentBorder: 'border-violet-200',
    accentHover: 'hover:bg-violet-600',
    bookSlug: 'microfelicita',
    assessmentUrl: '/assessment/microfelicita',
    resultsUrl: '/assessment/microfelicita/results',
  },
} as const;

export type PathType = keyof typeof PATH_CONFIG;

interface CharacteristicData {
  characteristic: string;
  score: number;
  pillar: 'ESSERE' | 'SENTIRE' | 'PENSARE' | 'AGIRE';
  fullMark: number;
}

interface RecommendedExercise {
  id: string;
  title: string;
  reasoning: string;
  estimated_time_minutes: number;
  difficulty_level: string;
  pillar: string;
}

interface ExerciseStats {
  total: number;
  completed: number;
  inProgress: number;
  completionRate: number;
}

interface DashboardByPathProps {
  pathType: PathType;
}

export default function DashboardByPath({ pathType }: DashboardByPathProps) {
  const config = PATH_CONFIG[pathType];
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [radarData, setRadarData] = useState<CharacteristicData[]>([]);
  const [hasAssessment, setHasAssessment] = useState(false);
  const [recommendedExercise, setRecommendedExercise] = useState<RecommendedExercise | null>(null);
  const [exerciseStats, setExerciseStats] = useState<ExerciseStats>({
    total: 0,
    completed: 0,
    inProgress: 0,
    completionRate: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setUserId(user.id);

        // Fetch assessment data based on path
        if (pathType === 'leadership') {
          // Leadership: fetch from user_assessments and calculate radar
          const { data: assessment } = await supabase
            .from('user_assessments')
            .select('id, status')
            .eq('user_id', user.id)
            .eq('status', 'completed')
            .order('completed_at', { ascending: false })
            .limit(1)
            .single();

          if (assessment) {
            setHasAssessment(true);

            // Fetch characteristics and answers for radar
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
              .eq('assessment_id', assessment.id);

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

              const pillarMap: Record<string, 'ESSERE' | 'SENTIRE' | 'PENSARE' | 'AGIRE'> = {
                'Essere': 'ESSERE',
                'Sentire': 'SENTIRE',
                'Pensare': 'PENSARE',
                'Agire': 'AGIRE',
              };

              const radarDataArray: CharacteristicData[] = characteristics
                .map((char: any) => {
                  const scores = scoresByChar[char.id] || { points: 0, count: 0 };
                  const maxPoints = scores.count * 2;
                  return {
                    characteristic: char.name_familiar,
                    pillar: pillarMap[char.pillar] || 'ESSERE',
                    score: maxPoints > 0 ? Math.round((scores.points / maxPoints) * 100) : 0,
                    fullMark: 100,
                  };
                })
                .filter((c: CharacteristicData) => c.score > 0);

              setRadarData(radarDataArray);
            }
          }
        } else {
          // Ostacoli / Microfelicita: check if results exist
          const tableName = pathType === 'ostacoli' ? 'risolutore_results' : 'microfelicita_results';
          const { data: results } = await supabase
            .from(tableName)
            .select('id')
            .eq('user_id', user.id)
            .limit(1)
            .single();

          setHasAssessment(!!results);
        }

        // Fetch recommended exercise via API (fallback graceful se tabella non esiste)
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            const response = await fetch(`/api/recommendations?user_id=${user.id}`, {
              headers: { 'Authorization': `Bearer ${session.access_token}` }
            });

            if (response.ok) {
              const result = await response.json();
              // Usa nextRecommended o il primo della lista
              const rec = result.nextRecommended || result.recommendations?.[0];
              if (rec && !rec.isCompleted) {
                setRecommendedExercise({
                  id: rec.id,
                  title: rec.title,
                  reasoning: rec.reason || 'Esercizio consigliato in base al tuo profilo',
                  estimated_time_minutes: rec.estimated_time_minutes || 15,
                  difficulty_level: rec.difficulty_level || 'base',
                  pillar: rec.pillar || 'Essere',
                });
              }
            }
          }
        } catch (recError) {
          // Silently fail - raccomandazioni non critiche
          console.log('Raccomandazioni non disponibili:', recError);
        }

        // Fetch exercise stats for this path
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

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase, pathType, config.bookSlug]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-100 rounded-2xl"></div>
            <div className="h-80 bg-gray-100 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Titolo dinamico */}
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${config.accentBgLight}`}>
          <Sparkles className={`w-6 h-6 ${config.accentText}`} />
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-neutral-900">
          {config.title}
        </h1>
      </div>

      {/* Grid principale */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sezione Radar Chart */}
        <div className={`bg-white rounded-2xl border ${config.accentBorder} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <BarChart3 className={`w-5 h-5 ${config.accentText}`} />
              Il Tuo Profilo
            </h2>
            {hasAssessment && (
              <Link
                href={config.resultsUrl}
                className={`text-sm ${config.accentText} hover:underline`}
              >
                Vedi dettagli →
              </Link>
            )}
          </div>

          {pathType === 'leadership' && hasAssessment && radarData.length > 0 ? (
            <LeadershipRadarChart data={radarData} height={300} showLegend={false} />
          ) : pathType === 'leadership' && !hasAssessment ? (
            <div className="h-64 flex flex-col items-center justify-center text-center">
              <div className={`w-16 h-16 rounded-full ${config.accentBgLight} flex items-center justify-center mb-4`}>
                <Target className={`w-8 h-8 ${config.accentText}`} />
              </div>
              <p className="text-neutral-600 mb-4">
                Completa l&apos;assessment per vedere il tuo radar di leadership
              </p>
              <Link
                href={config.assessmentUrl}
                className={`inline-flex items-center gap-2 ${config.accentBg} ${config.accentHover} text-white px-4 py-2 rounded-xl font-medium transition-colors`}
              >
                Inizia Assessment
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            // Placeholder per Ostacoli e Microfelicita
            <div className="h-64 flex flex-col items-center justify-center text-center">
              <div className={`w-16 h-16 rounded-full ${config.accentBgLight} flex items-center justify-center mb-4`}>
                <BarChart3 className={`w-8 h-8 ${config.accentText}`} />
              </div>
              <p className={`text-lg font-semibold ${config.accentTextDark} mb-2`}>
                Radar {config.name}
              </p>
              <p className="text-neutral-500 text-sm mb-4">
                Coming Soon
              </p>
              {!hasAssessment && (
                <Link
                  href={config.assessmentUrl}
                  className={`inline-flex items-center gap-2 ${config.accentBg} ${config.accentHover} text-white px-4 py-2 rounded-xl font-medium transition-colors`}
                >
                  Inizia Assessment
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Sezione Prossimo Passo Consigliato */}
        <div className={`bg-white rounded-2xl border ${config.accentBorder} p-6`}>
          <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2 mb-4">
            <Target className={`w-5 h-5 ${config.accentText}`} />
            Prossimo Passo Consigliato
          </h2>

          {recommendedExercise ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl ${config.accentBgLight} border ${config.accentBorder}`}>
                <h3 className="font-semibold text-neutral-900 mb-2">
                  {recommendedExercise.title}
                </h3>
                <p className="text-sm text-neutral-600 mb-3">
                  {recommendedExercise.reasoning}
                </p>
                <div className="flex items-center gap-4 text-sm text-neutral-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {recommendedExercise.estimated_time_minutes} min
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.accentBgLight} ${config.accentTextDark}`}>
                    {recommendedExercise.pillar}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
                    {recommendedExercise.difficulty_level}
                  </span>
                </div>
                <Link
                  href={`/exercises/${recommendedExercise.id}`}
                  className={`inline-flex items-center gap-2 ${config.accentBg} ${config.accentHover} text-white px-4 py-2.5 rounded-xl font-medium transition-colors w-full justify-center`}
                >
                  Inizia Esercizio
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-center">
              <div className={`w-12 h-12 rounded-full ${config.accentBgLight} flex items-center justify-center mb-3`}>
                <Sparkles className={`w-6 h-6 ${config.accentText}`} />
              </div>
              <p className="text-neutral-600 mb-2">
                {hasAssessment
                  ? 'Fernando sta preparando il tuo prossimo esercizio personalizzato'
                  : 'Completa l&apos;assessment per ricevere raccomandazioni personalizzate'}
              </p>
              {!hasAssessment && (
                <Link
                  href={config.assessmentUrl}
                  className={`mt-3 text-sm ${config.accentText} hover:underline`}
                >
                  Vai all&apos;assessment →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Grid secondaria */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Esercizi Card */}
        <div className="lg:col-span-1">
          <ExercisesCard stats={exerciseStats} />
        </div>

        {/* Attività Recente */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
