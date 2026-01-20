// src/app/api/exercises/completion-stats/route.ts
// API per ottenere statistiche di completamento e prossimo esercizio consigliato

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Forza rendering dinamico (usa cookies)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verifica autenticazione
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    // Ottieni parametri
    const searchParams = request.nextUrl.searchParams;
    const currentExerciseId = searchParams.get('currentExerciseId');
    const bookSlug = searchParams.get('bookSlug') || 'leadership';

    // Ottieni profilo per current_path
    const { data: profile } = await supabase
      .from('profiles')
      .select('current_path')
      .eq('id', user.id)
      .single();

    const currentPath = profile?.current_path || bookSlug;

    // Conta esercizi totali per il percorso
    const { count: totalExercises } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true })
      .eq('book_slug', currentPath)
      .eq('is_active', true);

    // Conta esercizi completati dall'utente
    const { data: progressData } = await supabase
      .from('user_exercise_progress')
      .select(`
        exercise_id,
        status,
        exercises!inner (
          book_slug
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'completed');

    // Filtra per book_slug
    const completedExercises = (progressData || []).filter(
      (p: any) => p.exercises?.book_slug === currentPath
    );

    const totalCompleted = completedExercises.length;

    // Trova il prossimo esercizio
    let nextExercise = null;

    if (currentExerciseId) {
      // Ottieni l'esercizio corrente per trovare il week_number
      const { data: currentExercise } = await supabase
        .from('exercises')
        .select('week_number, book_slug')
        .eq('id', currentExerciseId)
        .single();

      if (currentExercise) {
        // Trova il prossimo esercizio nella sequenza (stesso book, week successivo)
        const { data: nextInSequence } = await supabase
          .from('exercises')
          .select('id, title, week_number, month_name')
          .eq('book_slug', currentExercise.book_slug)
          .eq('is_active', true)
          .gt('week_number', currentExercise.week_number)
          .order('week_number', { ascending: true })
          .limit(1)
          .single();

        if (nextInSequence) {
          // Verifica che non sia già completato
          const { data: nextProgress } = await supabase
            .from('user_exercise_progress')
            .select('status')
            .eq('user_id', user.id)
            .eq('exercise_id', nextInSequence.id)
            .single();

          if (!nextProgress || nextProgress.status !== 'completed') {
            nextExercise = {
              id: nextInSequence.id,
              title: nextInSequence.title,
              week_number: nextInSequence.week_number,
              month_name: nextInSequence.month_name
            };
          }
        }

        // Se non c'è prossimo in sequenza, trova il primo non completato
        if (!nextExercise) {
          const completedIds = completedExercises.map((p: any) => p.exercise_id);

          const { data: firstNotCompleted } = await supabase
            .from('exercises')
            .select('id, title, week_number, month_name')
            .eq('book_slug', currentPath)
            .eq('is_active', true)
            .not('id', 'in', `(${completedIds.length > 0 ? completedIds.join(',') : 'null'})`)
            .order('week_number', { ascending: true })
            .limit(1)
            .single();

          if (firstNotCompleted) {
            nextExercise = {
              id: firstNotCompleted.id,
              title: firstNotCompleted.title,
              week_number: firstNotCompleted.week_number,
              month_name: firstNotCompleted.month_name
            };
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      totalCompleted,
      totalExercises: totalExercises || 0,
      nextExercise,
      bookSlug: currentPath
    });

  } catch (error) {
    console.error('Errore API completion-stats:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
