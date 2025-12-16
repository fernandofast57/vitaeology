// src/app/exercises/[exerciseId]/page.tsx
// Pagina dettaglio singolo esercizio - Conforme MEGA_PROMPT v3.1

import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getExerciseById, getExerciseProgress } from '@/lib/supabase/exercises';
import ExerciseDetail from '@/components/exercises/ExerciseDetail';

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
