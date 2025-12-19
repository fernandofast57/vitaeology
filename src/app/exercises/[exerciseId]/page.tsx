// src/app/exercises/[exerciseId]/page.tsx
// Pagina dettaglio singolo esercizio - Conforme MEGA_PROMPT v3.1

import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getExerciseById, getExerciseProgress } from '@/lib/supabase/exercises';
import ExerciseDetail from '@/components/exercises/ExerciseDetail';
import LockedExerciseView from '@/components/exercises/LockedExerciseView';
import { canAccessExercise, getRequiredTierForExercise, ExercisesAccessLevel, DifficultyLevel } from '@/lib/types/exercises';
import { SUBSCRIPTION_TIERS, SubscriptionTier } from '@/lib/types/roles';

interface PageProps {
  params: Promise<{ exerciseId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { exerciseId } = await params;
  const exercise = await getExerciseById(exerciseId);

  if (!exercise) {
    return { title: 'Esercizio non trovato | Vitaeology' };
  }

  return {
    title: `Settimana ${exercise.week_number}: ${exercise.title} | Vitaeology`,
    description: exercise.description
  };
}

export default async function ExercisePage({ params }: PageProps) {
  const { exerciseId } = await params;
  const supabase = await createClient();

  // Verifica autenticazione
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Fetch esercizio
  const exercise = await getExerciseById(exerciseId);

  if (!exercise) {
    notFound();
  }

  // Fetch profilo utente per tier subscription
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, is_admin, role_id')
    .eq('id', user.id)
    .single();

  // Determina livello accesso utente
  const userTier = (profile?.subscription_tier || 'explorer') as SubscriptionTier;
  const isStaffOrAdmin = profile?.is_admin || profile?.role_id;
  const userAccessLevel: ExercisesAccessLevel = isStaffOrAdmin
    ? 'all'
    : (SUBSCRIPTION_TIERS[userTier]?.features?.exercises_access || 'basic') as ExercisesAccessLevel;

  // Verifica accesso esercizio
  const hasAccess = canAccessExercise(exercise.difficulty_level as DifficultyLevel, userAccessLevel);

  if (!hasAccess) {
    const requiredTierInfo = getRequiredTierForExercise(exercise.difficulty_level as DifficultyLevel);
    return (
      <div className="min-h-screen bg-gray-50">
        <LockedExerciseView
          exercise={exercise}
          requiredTier={requiredTierInfo.minTier}
          requiredTierDisplayName={requiredTierInfo.tierDisplayName}
          userTier={userTier}
        />
      </div>
    );
  }

  // Fetch progresso utente per questo esercizio
  let progress = null;
  try {
    progress = await getExerciseProgress(user.id, exerciseId);
  } catch (error) {
    console.error('Errore fetch progresso:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ExerciseDetail
        exercise={exercise}
        progress={progress}
        userId={user.id}
      />
    </div>
  );
}
