'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import WelcomeHero from '@/components/dashboard/WelcomeHero';
import AssessmentCard from '@/components/dashboard/AssessmentCard';
import QuickStats from '@/components/dashboard/QuickStats';
import TrialBanner from '@/components/dashboard/TrialBanner';
import RecentActivity from '@/components/dashboard/RecentActivity';
import MiniRadarPreview from '@/components/dashboard/MiniRadarPreview';
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import ExercisesCard from '@/components/dashboard/ExercisesCard';
import ChatWidget from '@/components/ai-coach/ChatWidget';
import { UserContext } from '@/lib/ai-coach/types';

export default function DashboardPage() {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [assessment, setAssessment] = useState<any>(null);
  const [pillarScores, setPillarScores] = useState<any[]>([]);
  const [exerciseStats, setExerciseStats] = useState({ total: 0, completed: 0, inProgress: 0, completionRate: 0 });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setUserId(user.id);
        setUserEmail(user.email || '');
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');

        const { data: assessmentData } = await supabase
          .from('user_assessments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (assessmentData) {
          setAssessment(assessmentData);
          if (assessmentData.status === 'completed') {
            const { data: resultsData } = await supabase
              .from('assessment_results')
              .select('pillar_scores')
              .eq('assessment_id', assessmentData.id)
              .single();
            if (resultsData?.pillar_scores) {
              setPillarScores(resultsData.pillar_scores);
            }
          }
        }

        // Fetch exercise stats
        const { count: totalExercises } = await supabase
          .from('exercises')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        const { data: progressData } = await supabase
          .from('user_exercise_progress')
          .select('status')
          .eq('user_id', user.id);

        const total = totalExercises || 0;
        const completed = (progressData || []).filter(p => p.status === 'completed').length;
        const inProgress = (progressData || []).filter(p => p.status === 'in_progress').length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        setExerciseStats({ total, completed, inProgress, completionRate });
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
          <div className="space-y-6 max-w-7xl mx-auto">
            <TrialBanner daysRemaining={14} />
            <WelcomeHero userName={userName || 'Leader'} hasCompletedAssessment={assessment?.status === 'completed'} />
            <QuickStats assessmentsCompleted={assessment?.status === 'completed' ? 1 : 0} totalScore={assessment?.total_score || null} exercisesCompleted={exerciseStats.completed} currentStreak={exerciseStats.inProgress} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AssessmentCard assessment={assessment} />
              </div>
              <div className="lg:col-span-1 space-y-6">
                <MiniRadarPreview pillarScores={pillarScores} hasResults={assessment?.status === 'completed'} assessmentId={assessment?.id} />
                <ExercisesCard stats={exerciseStats} />
              </div>
            </div>
            <RecentActivity />
          </div>
        </main>
      </div>

      {/* Fernando AI Coach */}
      {(userId || process.env.NODE_ENV === 'development') && (
        <ChatWidget
          userContext={{
            userId: userId || 'dev-user',
            userName: userName || undefined,
            assessmentResults: pillarScores.length > 0
              ? pillarScores.map((p: any) => ({
                  characteristicSlug: p.pillar,
                  score: p.score,
                  pillar: p.pillar,
                }))
              : undefined,
            completedExercisesCount: exerciseStats.completed,
            currentWeek: Math.ceil((exerciseStats.completed + 1) / 1),
          }}
        />
      )}
    </div>
  );
}
