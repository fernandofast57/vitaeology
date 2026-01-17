// src/app/exercises/page.tsx
// Pagina lista esercizi - Multi-pathway support

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ExercisesHeader from '@/components/exercises/ExercisesHeader';
import ExercisesList from '@/components/exercises/ExercisesList';
import Breadcrumb from '@/components/ui/Breadcrumb';
import type { ExerciseWithAccess, ExercisesAccessLevel } from '@/lib/types/exercises';
import { canAccessExercise, getRequiredTierForExercise } from '@/lib/types/exercises';
import { SUBSCRIPTION_TIERS, SubscriptionTier } from '@/lib/types/roles';
import { getUserPathways, PATHWAY_NAMES, type PathwaySlug } from '@/lib/pathways';

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

  // Fetch profilo utente per tier subscription
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, is_admin, role_id, current_path')
    .eq('id', user.id)
    .single();

  // Determina livello accesso utente
  const userTier = (profile?.subscription_tier || 'explorer') as SubscriptionTier;
  const isStaffOrAdmin = profile?.is_admin || profile?.role_id;
  const userAccessLevel: ExercisesAccessLevel = isStaffOrAdmin
    ? 'all'
    : (SUBSCRIPTION_TIERS[userTier]?.features?.exercises_access || 'basic') as ExercisesAccessLevel;

  // Ottieni percorsi attivi dell'utente da user_pathways
  const userPathways = await getUserPathways(supabase, user.id);

  // Se ha percorsi in user_pathways, usa quelli; altrimenti fallback a current_path
  let activePathSlugs: PathwaySlug[] = [];
  if (userPathways.length > 0) {
    activePathSlugs = userPathways.map(up => up.pathway.slug as PathwaySlug);
  } else if (profile?.current_path) {
    // Fallback per backward compatibility
    activePathSlugs = [profile.current_path as PathwaySlug];
  } else {
    // Default a leadership se nessun percorso
    activePathSlugs = ['leadership'];
  }

  // Il primo percorso attivo è quello "corrente" (per UI)
  const currentPath = activePathSlugs[0] || 'leadership';
  const hasMultiplePaths = activePathSlugs.length > 1;

  // Fetch esercizi per TUTTI i percorsi attivi dell'utente
  const { data: exercisesData } = await supabase
    .from('exercises')
    .select('*')
    .eq('is_active', true)
    .in('book_slug', activePathSlugs)
    .order('book_slug', { ascending: true })
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

  // Statistiche per percorso
  const statsByPath: Record<string, typeof stats> = {};
  activePathSlugs.forEach(slug => {
    const pathExercises = exercises.filter(ex => ex.book_slug === slug);
    const pathAccessible = pathExercises.filter(ex => !ex.isLocked);
    const pathCompleted = pathAccessible.filter(ex => ex.progress?.status === 'completed').length;
    const pathInProgress = pathAccessible.filter(ex => ex.progress?.status === 'in_progress').length;
    statsByPath[slug] = {
      total: pathExercises.length,
      accessible: pathAccessible.length,
      completed: pathCompleted,
      inProgress: pathInProgress,
      notStarted: pathAccessible.length - pathCompleted - pathInProgress,
      lockedCount: pathExercises.filter(ex => ex.isLocked).length,
      completionRate: pathAccessible.length > 0
        ? Math.round((pathCompleted / pathAccessible.length) * 100)
        : 0
    };
  });

  const stats = {
    total: exercises.length,
    accessible: total,
    completed,
    inProgress,
    notStarted,
    lockedCount,
    completionRate
  };

  // Dati percorsi per UI (tabs/filtri)
  const pathwayInfo = activePathSlugs.map(slug => ({
    slug,
    name: PATHWAY_NAMES[slug] || slug,
    stats: statsByPath[slug] || stats
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumb items={[{ label: 'Esercizi' }]} />
      </div>
      <ExercisesHeader
        stats={stats}
        userTier={userTier}
        currentPath={currentPath}
        pathways={pathwayInfo}
        hasMultiplePaths={hasMultiplePaths}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ExercisesList
          exercises={exercises}
          userTier={userTier}
          pathways={pathwayInfo}
          hasMultiplePaths={hasMultiplePaths}
        />
      </main>
    </div>
  );
}