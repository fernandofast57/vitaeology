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
import RecommendedExercises from '@/components/dashboard/RecommendedExercises';
import ChatWidget from '@/components/ai-coach/ChatWidget';
import { UserContext } from '@/lib/ai-coach/types';

export default function DashboardPage() {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [assessment, setAssessment] = useState<any>(null);
  const [pillarScores, setPillarScores] = useState<any[]>([]);
  const [characteristicScores, setCharacteristicScores] = useState<any[]>([]);
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
            // Calcola pillar scores da user_answers
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
              // Calcola punteggi per caratteristica
              const scoresByChar: Record<number, { points: number; count: number }> = {};
              answers.forEach((answer: any) => {
                const charId = answer.assessment_questions?.characteristic_id;
                if (charId) {
                  if (!scoresByChar[charId]) scoresByChar[charId] = { points: 0, count: 0 };
                  scoresByChar[charId].points += answer.points_earned;
                  scoresByChar[charId].count += 1;
                }
              });

              // Crea array punteggi caratteristiche (per Fernando AI)
              const charScoresArray = characteristics.map((char: any) => {
                const scores = scoresByChar[char.id] || { points: 0, count: 0 };
                const maxPoints = scores.count * 2;
                return {
                  characteristicSlug: char.name_familiar,
                  pillar: char.pillar,
                  score: maxPoints > 0 ? Math.round((scores.points / maxPoints) * 100) : 0
                };
              }).filter((c: any) => c.score > 0); // Solo caratteristiche con risposte

              setCharacteristicScores(charScoresArray);

              // Aggrega per pilastro
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

              // Converti in array per il componente
              const pillarScoresArray = Object.entries(pillarTotals).map(([pillar, data]) => ({
                pillar,
                score: data.maxPoints > 0 ? Math.round((data.points / data.maxPoints) * 100) : 0
              }));

              setPillarScores(pillarScoresArray);
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="lg:col-span-2">
                <AssessmentCard assessment={assessment} />
              </div>
              <div className="lg:col-span-1 flex flex-col gap-4 md:gap-6">
                <MiniRadarPreview pillarScores={pillarScores} hasResults={assessment?.status === 'completed'} assessmentId={assessment?.id} />
                <ExercisesCard stats={exerciseStats} />
              </div>
            </div>
            {/* Esercizi Raccomandati - mostra solo se c'è un assessment completato */}
            {assessment?.status === 'completed' && userId && (
              <div className="mt-4 md:mt-6">
                <RecommendedExercises userId={userId} maxItems={5} showPriorityAreas={true} />
              </div>
            )}
            <div className="mt-4 md:mt-6">
              <RecentActivity />
            </div>
          </div>
        </main>
      </div>

      {/* Fernando AI Coach */}
      {(userId || process.env.NODE_ENV === 'development') && (
        <ChatWidget
          userContext={{
            userId: userId || 'dev-user',
            userName: userName || undefined,
            assessmentResults: characteristicScores.length > 0 ? characteristicScores : undefined,
            completedExercisesCount: exerciseStats.completed,
            currentWeek: Math.ceil((exerciseStats.completed + 1) / 1),
          }}
        />
      )}
    </div>
  );
}
