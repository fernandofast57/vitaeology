// src/app/exercises/page.tsx
// Pagina lista esercizi - Conforme MEGA_PROMPT v3.1

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ExercisesHeader from '@/components/exercises/ExercisesHeader';
import ExercisesList from '@/components/exercises/ExercisesList';
import Breadcrumb from '@/components/ui/Breadcrumb';
import type { ExerciseWithProgress, ExerciseWithAccess, ExercisesAccessLevel } from '@/lib/types/exercises';
import { canAccessExercise, getRequiredTierForExercise } from '@/lib/types/exercises';
import { SUBSCRIPTION_TIERS, SubscriptionTier } from '@/lib/types/roles';

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

  // Fetch profilo utente per tier subscription e percorso corrente
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, is_admin, role_id, current_path')
    .eq('id', user.id)
    .single();

  // Determina livello accesso utente
  const userTier = (profile?.subscription_tier || 'explorer') as SubscriptionTier;

  // Determina il percorso/libro da mostrare (default: leadership)
  const currentPath = profile?.current_path || 'leadership';
  const isStaffOrAdmin = profile?.is_admin || profile?.role_id;
  const userAccessLevel: ExercisesAccessLevel = isStaffOrAdmin
    ? 'all'
    : (SUBSCRIPTION_TIERS[userTier]?.features?.exercises_access || 'basic') as ExercisesAccessLevel;

  // Fetch esercizi con progresso utente (usando server client)
  // Filtra per il percorso/libro corrente dell'utente
  const { data: exercisesData } = await supabase
    .from('exercises')
    .select('*')
    .eq('is_active', true)
    .eq('book_slug', currentPath)
    .order('week_number', { ascending: true });

  const { data: progressData } = await supabase
    .from('user_exercise_progress')
    .select('*')
    .eq('user_id', user.id);

  const progressMap = new Map(
    (progressData || []).map(p => [p.exercise_id, p])
  );

  // Aggiungi info accesso a ogni esercizio
  const exercises: ExerciseWithAccess[] = (exercisesData || []).map(exercise => {
    const hasAccess = canAccessExercise(exercise.difficulty_level, userAccessLevel);
    const requiredTierInfo = !hasAccess ? getRequiredTierForExercise(exercise.difficulty_level) : null;

    return {
      ...exercise,
      progress: progressMap.get(exercise.id) || null,
      isLocked: !hasAccess,
      requiredTier: requiredTierInfo?.minTier,
      requiredTierDisplayName: requiredTierInfo?.tierDisplayName
    };
  });

  // Calcola statistiche (solo esercizi accessibili)
  const accessibleExercises = exercises.filter(ex => !ex.isLocked);
  const lockedCount = exercises.filter(ex => ex.isLocked).length;
  const total = accessibleExercises.length;
  const completed = accessibleExercises.filter(ex => ex.progress?.status === 'completed').length;
  const inProgress = accessibleExercises.filter(ex => ex.progress?.status === 'in_progress').length;
  const notStarted = total - completed - inProgress;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stats = {
    total: exercises.length,
    accessible: total,
    completed,
    inProgress,
    notStarted,
    lockedCount,
    completionRate
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumb items={[{ label: 'Esercizi' }]} />
      </div>
      <ExercisesHeader stats={stats} userTier={userTier} currentPath={currentPath} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ExercisesList exercises={exercises} userTier={userTier} />
      </main>
    </div>
  );
}