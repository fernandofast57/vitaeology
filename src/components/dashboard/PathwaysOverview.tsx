// src/components/dashboard/PathwaysOverview.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { type UserPathwayWithDetails, PATHWAY_COLORS, PATHWAY_NAMES } from '@/lib/pathways';

interface PathwaysOverviewProps {
  pathways: UserPathwayWithDetails[];
  userName: string;
}

// Mappa pathway slug → dashboard path
const PATHWAY_TO_DASHBOARD: Record<string, string> = {
  'leadership': 'leadership',
  'risolutore': 'ostacoli',
  'microfelicita': 'microfelicita',
};

// Configurazione icone per percorso
const PATHWAY_ICONS: Record<string, JSX.Element> = {
  leadership: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  risolutore: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  microfelicita: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
};

interface PathwayStats {
  totalExercises: number;
  completedExercises: number;
  hasAssessment: boolean;
  assessmentScore: number | null;
}

export default function PathwaysOverview({ pathways, userName }: PathwaysOverviewProps) {
  const [pathwayStats, setPathwayStats] = useState<Record<string, PathwayStats>>({});
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const stats: Record<string, PathwayStats> = {};

        for (const pathway of pathways) {
          const slug = pathway.pathway.slug;

          // Conta esercizi
          const { count: totalExercises } = await supabase
            .from('exercises')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true)
            .eq('book_slug', slug);

          const { data: progressData } = await supabase
            .from('user_exercise_progress')
            .select('status, exercises!inner(book_slug)')
            .eq('user_id', user.id)
            .eq('exercises.book_slug', slug);

          const completedExercises = (progressData || []).filter(
            (p: any) => p.status === 'completed'
          ).length;

          // Controlla assessment
          let hasAssessment = false;
          let assessmentScore: number | null = null;

          if (slug === 'leadership') {
            const { data: assessment } = await supabase
              .from('user_assessments')
              .select('status, total_score')
              .eq('user_id', user.id)
              .eq('status', 'completed')
              .order('completed_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            hasAssessment = !!assessment;
            assessmentScore = assessment?.total_score || null;
          } else if (slug === 'risolutore') {
            const { data: assessment } = await supabase
              .from('risolutore_results')
              .select('scala_risolutore')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            hasAssessment = !!assessment;
            assessmentScore = assessment?.scala_risolutore || null;
          } else if (slug === 'microfelicita') {
            const { data: assessment } = await supabase
              .from('microfelicita_results')
              .select('livello_microfelicita')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            hasAssessment = !!assessment;
            assessmentScore = assessment?.livello_microfelicita || null;
          }

          stats[slug] = {
            totalExercises: totalExercises || 0,
            completedExercises,
            hasAssessment,
            assessmentScore,
          };
        }

        setPathwayStats(stats);
      } catch (error) {
        console.error('Error fetching pathway stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [supabase, pathways]);

  // Calcola statistiche totali
  const totalStats = Object.values(pathwayStats).reduce(
    (acc, stats) => ({
      totalExercises: acc.totalExercises + stats.totalExercises,
      completedExercises: acc.completedExercises + stats.completedExercises,
      assessmentsCompleted: acc.assessmentsCompleted + (stats.hasAssessment ? 1 : 0),
    }),
    { totalExercises: 0, completedExercises: 0, assessmentsCompleted: 0 }
  );

  const overallProgress = totalStats.totalExercises > 0
    ? Math.round((totalStats.completedExercises / totalStats.totalExercises) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Bentornato, {userName}!
        </h1>
        <p className="text-gray-600">
          Hai accesso a {pathways.length} percorsi formativi. Continua il tuo viaggio di crescita.
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Percorsi</p>
          <p className="text-2xl font-bold text-petrol-600">{pathways.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Assessment</p>
          <p className="text-2xl font-bold text-petrol-600">
            {totalStats.assessmentsCompleted}/{pathways.length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Esercizi</p>
          <p className="text-2xl font-bold text-petrol-600">
            {totalStats.completedExercises}/{totalStats.totalExercises}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Progresso</p>
          <p className="text-2xl font-bold text-petrol-600">{overallProgress}%</p>
        </div>
      </div>

      {/* Pathway Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pathways.map((pathway) => {
          const slug = pathway.pathway.slug;
          const stats = pathwayStats[slug];
          const color = PATHWAY_COLORS[slug as keyof typeof PATHWAY_COLORS] || '#0A2540';
          const dashboardPath = PATHWAY_TO_DASHBOARD[slug] || 'leadership';
          const icon = PATHWAY_ICONS[slug];

          const exerciseProgress = stats?.totalExercises
            ? Math.round((stats.completedExercises / stats.totalExercises) * 100)
            : 0;

          return (
            <Link
              key={pathway.id}
              href={`/dashboard/${dashboardPath}`}
              className="group block"
            >
              <div
                className="bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
                style={{ borderColor: color }}
              >
                {/* Header con colore */}
                <div
                  className="p-4 text-white"
                  style={{ backgroundColor: color }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {icon}
                      <div>
                        <h3 className="font-bold text-lg">
                          {PATHWAY_NAMES[slug as keyof typeof PATHWAY_NAMES] || pathway.pathway.name}
                        </h3>
                        <p className="text-sm opacity-80">
                          {pathway.access_type === 'subscription' ? 'Incluso nel piano' : 'Acquistato'}
                        </p>
                      </div>
                    </div>
                    <svg
                      className="w-6 h-6 transform group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 space-y-4">
                  {loading ? (
                    <div className="h-20 flex items-center justify-center">
                      <div
                        className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                        style={{ borderColor: color }}
                      />
                    </div>
                  ) : (
                    <>
                      {/* Assessment Status */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Assessment</span>
                        {stats?.hasAssessment ? (
                          <span
                            className="text-sm font-medium px-2 py-1 rounded-full"
                            style={{ backgroundColor: `${color}20`, color }}
                          >
                            Completato
                            {stats.assessmentScore && ` - ${stats.assessmentScore}%`}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Da completare</span>
                        )}
                      </div>

                      {/* Exercise Progress */}
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">Esercizi</span>
                          <span className="font-medium" style={{ color }}>
                            {stats?.completedExercises || 0}/{stats?.totalExercises || 0}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${exerciseProgress}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>

                      {/* Started date */}
                      {pathway.started_at && (
                        <p className="text-xs text-gray-400">
                          Iniziato il {new Date(pathway.started_at).toLocaleDateString('it-IT')}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* CTA */}
                <div
                  className="px-4 py-3 bg-gray-50 border-t border-gray-100 group-hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm font-medium" style={{ color }}>
                    Vai alla dashboard →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Azioni rapide</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/exercises"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-petrol-500 hover:bg-petrol-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Tutti gli esercizi</p>
              <p className="text-xs text-gray-500">{totalStats.totalExercises} disponibili</p>
            </div>
          </Link>

          <Link
            href="/progress"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-petrol-500 hover:bg-petrol-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Il tuo progresso</p>
              <p className="text-xs text-gray-500">Statistiche dettagliate</p>
            </div>
          </Link>

          <Link
            href="/results"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-petrol-500 hover:bg-petrol-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Risultati</p>
              <p className="text-xs text-gray-500">Assessment completati</p>
            </div>
          </Link>

          <Link
            href="/profile"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-petrol-500 hover:bg-petrol-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Profilo</p>
              <p className="text-xs text-gray-500">Impostazioni account</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
