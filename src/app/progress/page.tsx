'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { TrendingUp, Target, CheckCircle, Clock, Award } from 'lucide-react';

interface ExerciseProgress {
  id: string;
  exercise_id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  exercises: {
    title: string;
    characteristic_slug: string;
  } | null;
}

export default function ProgressPage() {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<ExerciseProgress[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    completionRate: 0
  });

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setUserEmail(user.email || '');
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');

        // Fetch exercise progress
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
              characteristic_slug
            )
          `)
          .eq('user_id', user.id)
          .order('started_at', { ascending: false });

        setProgress((progressData as ExerciseProgress[]) || []);

        // Calculate stats
        const { count: totalExercises } = await supabase
          .from('exercises')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        const completed = (progressData || []).filter(p => p.status === 'completed').length;
        const inProgress = (progressData || []).filter(p => p.status === 'in_progress').length;
        const total = totalExercises || 0;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        setStats({ total, completed, inProgress, completionRate });
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [supabase]);

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
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">I tuoi Progressi</h1>
              <p className="text-neutral-600 mt-1">Monitora il tuo percorso di crescita nella leadership</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 border border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-petrol-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-petrol-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
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
                    <p className="text-2xl font-bold text-neutral-900">{stats.completed}</p>
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
                    <p className="text-2xl font-bold text-neutral-900">{stats.inProgress}</p>
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
                    <p className="text-2xl font-bold text-neutral-900">{stats.completionRate}%</p>
                    <p className="text-xs text-neutral-500">Completamento</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-xl p-6 border border-neutral-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-neutral-900">Avanzamento complessivo</h3>
                <span className="text-sm text-neutral-500">{stats.completed} di {stats.total}</span>
              </div>
              <div className="h-4 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-petrol-500 to-gold-500 rounded-full transition-all duration-500"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
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
                {progress.length === 0 ? (
                  <div className="p-8 text-center text-neutral-500">
                    <p>Non hai ancora iniziato nessun esercizio.</p>
                    <p className="text-sm mt-1">Vai agli Esercizi per iniziare il tuo percorso!</p>
                  </div>
                ) : (
                  progress.slice(0, 10).map((item) => (
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
                          <p className="font-medium text-neutral-900">{item.exercises?.title || 'Esercizio'}</p>
                          <p className="text-xs text-neutral-500">{item.exercises?.characteristic_slug || ''}</p>
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
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
