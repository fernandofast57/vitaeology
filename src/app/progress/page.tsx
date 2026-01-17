'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getUserPathways, type UserPathwayWithDetails, PATHWAY_COLORS, PATHWAY_NAMES, type PathwaySlug } from '@/lib/pathways';
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { TrendingUp, Target, CheckCircle, Clock, Award, Compass } from 'lucide-react';
import Breadcrumb from '@/components/ui/Breadcrumb';

interface ExerciseProgress {
  id: string;
  exercise_id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  exercises: {
    title: string;
    characteristic_slug: string;
    book_slug: string;
  }[] | null;
}

interface PathwayStats {
  slug: string;
  name: string;
  color: string;
  total: number;
  completed: number;
  inProgress: number;
  completionRate: number;
}

export default function ProgressPage() {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<ExerciseProgress[]>([]);
  const [userPathways, setUserPathways] = useState<UserPathwayWithDetails[]>([]);
  const [pathwayStats, setPathwayStats] = useState<PathwayStats[]>([]);
  const [selectedPathway, setSelectedPathway] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    completionRate: 0
  });

  const supabase = createClient();
  const hasMultiplePaths = userPathways.length > 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setUserEmail(user.email || '');
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');

        // Fetch user pathways
        const pathways = await getUserPathways(supabase, user.id);
        setUserPathways(pathways);

        // Determina book_slugs attivi
        const activePathSlugs = pathways.length > 0
          ? pathways.map(p => p.pathway.slug)
          : ['leadership']; // Default

        // Fetch exercise progress con book_slug
        const { data: progressData } = await supabase
          .from('user_exercise_progress')
          .select(`
            id,
            exercise_id,
            status,
            started_at,
            completed_at,
            exercises (
              title,
              characteristic_slug,
              book_slug
            )
          `)
          .eq('user_id', user.id)
          .order('started_at', { ascending: false });

        // Filtra solo progressi dei percorsi attivi
        const filteredProgress = (progressData || []).filter(p => {
          const bookSlug = p.exercises?.[0]?.book_slug;
          return bookSlug && activePathSlugs.includes(bookSlug);
        });

        setProgress(filteredProgress as ExerciseProgress[]);

        // Calculate stats per pathway
        const pathwayStatsArray: PathwayStats[] = [];
        let totalAll = 0;
        let completedAll = 0;
        let inProgressAll = 0;

        for (const slug of activePathSlugs) {
          // Total exercises per pathway
          const { count: totalExercises } = await supabase
            .from('exercises')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true)
            .eq('book_slug', slug);

          // Progress per pathway
          const pathwayProgress = filteredProgress.filter(p => p.exercises?.[0]?.book_slug === slug);
          const completed = pathwayProgress.filter(p => p.status === 'completed').length;
          const inProgress = pathwayProgress.filter(p => p.status === 'in_progress').length;
          const total = totalExercises || 0;
          const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

          pathwayStatsArray.push({
            slug,
            name: PATHWAY_NAMES[slug as PathwaySlug] || slug,
            color: PATHWAY_COLORS[slug as PathwaySlug] || '#6B7280',
            total,
            completed,
            inProgress,
            completionRate,
          });

          totalAll += total;
          completedAll += completed;
          inProgressAll += inProgress;
        }

        setPathwayStats(pathwayStatsArray);
        setStats({
          total: totalAll,
          completed: completedAll,
          inProgress: inProgressAll,
          completionRate: totalAll > 0 ? Math.round((completedAll / totalAll) * 100) : 0,
        });
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [supabase]);

  // Filtra progress per percorso selezionato
  const filteredProgress = selectedPathway === 'all'
    ? progress
    : progress.filter(p => p.exercises?.[0]?.book_slug === selectedPathway);

  // Stats correnti basate sul filtro
  const currentStats = selectedPathway === 'all'
    ? stats
    : pathwayStats.find(p => p.slug === selectedPathway) || stats;

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-petrol-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userEmail={userEmail} userName={userName} />
      <div className="lg:pl-64">
        <DashboardHeader userName={userName} userEmail={userEmail} onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 md:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Breadcrumb items={[{ label: 'Progressi' }]} />
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">I tuoi Progressi</h1>
              <p className="text-neutral-600 mt-1">
                {hasMultiplePaths
                  ? 'Monitora il tuo avanzamento su tutti i percorsi attivi'
                  : 'Monitora il tuo percorso di crescita nella leadership'}
              </p>
            </div>

            {/* Pathway Tabs (solo se multi-pathway) */}
            {hasMultiplePaths && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedPathway('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    selectedPathway === 'all'
                      ? 'bg-petrol-600 text-white'
                      : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  Tutti ({stats.completed}/{stats.total})
                </button>
                {pathwayStats.map((pathway) => (
                  <button
                    key={pathway.slug}
                    onClick={() => setSelectedPathway(pathway.slug)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedPathway === pathway.slug
                        ? 'text-white'
                        : 'bg-white border border-neutral-300 hover:bg-neutral-50'
                    }`}
                    style={selectedPathway === pathway.slug ? { backgroundColor: pathway.color } : { color: pathway.color }}
                  >
                    {pathway.name} ({pathway.completed}/{pathway.total})
                  </button>
                ))}
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 border border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-petrol-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-petrol-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-neutral-900">{currentStats.total}</p>
                    <p className="text-xs text-neutral-500">Totale esercizi</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-neutral-900">{currentStats.completed}</p>
                    <p className="text-xs text-neutral-500">Completati</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-neutral-900">{currentStats.inProgress}</p>
                    <p className="text-xs text-neutral-500">In corso</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-gold-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-neutral-900">{currentStats.completionRate}%</p>
                    <p className="text-xs text-neutral-500">Completamento</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-xl p-6 border border-neutral-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-neutral-900">
                  {selectedPathway === 'all' ? 'Avanzamento complessivo' : 'Avanzamento percorso'}
                </h3>
                <span className="text-sm text-neutral-500">{currentStats.completed} di {currentStats.total}</span>
              </div>
              <div className="h-4 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-petrol-500 to-gold-500 rounded-full transition-all duration-500"
                  style={{ width: `${currentStats.completionRate}%` }}
                />
              </div>

              {/* Per-pathway progress (solo se multi-path e "all" selezionato) */}
              {hasMultiplePaths && selectedPathway === 'all' && (
                <div className="mt-6 space-y-4">
                  <h4 className="text-sm font-medium text-neutral-700">Dettaglio per percorso</h4>
                  {pathwayStats.map((pathway) => (
                    <div key={pathway.slug}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium" style={{ color: pathway.color }}>
                          {pathway.name}
                        </span>
                        <span className="text-xs text-neutral-500">{pathway.completed}/{pathway.total}</span>
                      </div>
                      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pathway.completionRate}%`, backgroundColor: pathway.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-neutral-200">
              <div className="p-4 border-b border-neutral-100">
                <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-petrol-600" />
                  Attività recente
                </h3>
              </div>
              <div className="divide-y divide-neutral-100">
                {filteredProgress.length === 0 ? (
                  <div className="p-8 text-center text-neutral-500">
                    <p>Non hai ancora iniziato nessun esercizio.</p>
                    <p className="text-sm mt-1">Vai agli Esercizi per iniziare il tuo percorso!</p>
                  </div>
                ) : (
                  filteredProgress.slice(0, 10).map((item) => {
                    const bookSlug = item.exercises?.[0]?.book_slug;
                    const pathwayColor = bookSlug ? PATHWAY_COLORS[bookSlug as PathwaySlug] : undefined;
                    const pathwayName = bookSlug ? PATHWAY_NAMES[bookSlug as PathwaySlug] : undefined;

                    return (
                      <div key={item.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            item.status === 'completed' ? 'bg-green-100' : 'bg-amber-100'
                          }`}>
                            {item.status === 'completed' ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Clock className="w-4 h-4 text-amber-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900">{item.exercises?.[0]?.title || 'Esercizio'}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs text-neutral-500">{item.exercises?.[0]?.characteristic_slug || ''}</p>
                              {/* Pathway badge (solo se multi-path e "all" selezionato) */}
                              {hasMultiplePaths && selectedPathway === 'all' && pathwayColor && (
                                <span
                                  className="text-xs px-1.5 py-0.5 rounded text-white"
                                  style={{ backgroundColor: pathwayColor }}
                                >
                                  {pathwayName}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {item.status === 'completed' ? 'Completato' : 'In corso'}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
