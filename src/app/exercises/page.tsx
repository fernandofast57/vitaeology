// src/app/exercises/page.tsx
// Pagina lista esercizi - Conforme MEGA_PROMPT v3.1

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ExercisesHeader from '@/components/exercises/ExercisesHeader';
import ExercisesList from '@/components/exercises/ExercisesList';
import type { ExerciseWithProgress } from '@/lib/types/exercises';

export const metadata = {
  title: 'Esercizi | Vitaeology',
  description: 'Scopri e completa i tuoi esercizi settimanali per sviluppare le tue competenze di leadership.'
};

export default async function ExercisesPage() {
  const supabase = await createClient();

  // Verifica autenticazione
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Fetch esercizi con progresso utente (usando server client)
  const { data: exercisesData } = await supabase
    .from('exercises')
    .select('*')
    .eq('is_active', true)
    .order('week_number', { ascending: true });

  const { data: progressData } = await supabase
    .from('user_exercise_progress')
    .select('*')
    .eq('user_id', user.id);

  const progressMap = new Map(
    (progressData || []).map(p => [p.exercise_id, p])
  );

  const exercises: ExerciseWithProgress[] = (exercisesData || []).map(exercise => ({
    ...exercise,
    progress: progressMap.get(exercise.id) || null
  }));

  // Calcola statistiche
  const total = exercises.length;
  const completed = exercises.filter(ex => ex.progress?.status === 'completed').length;
  const inProgress = exercises.filter(ex => ex.progress?.status === 'in_progress').length;
  const notStarted = total - completed - inProgress;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stats = {
    total,
    completed,
    inProgress,
    notStarted,
    completionRate
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ExercisesHeader stats={stats} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ExercisesList exercises={exercises} />
      </main>
    </div>
  );
}