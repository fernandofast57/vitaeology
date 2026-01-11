/**
 * API Exercises Complete - Integrazione cicli START:CHANGE:STOP
 *
 * POST: Completa esercizio con conseguimento
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { completeExerciseWithCycle } from '@/lib/action-cycles';
import { getNextExercise } from '@/lib/ai-coach/adaptive-path';

export const dynamic = 'force-dynamic';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getUserFromRequest(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('Authorization');

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(token);
    return user?.id || null;
  }

  return null;
}

type PathType = 'leadership' | 'ostacoli' | 'microfelicita';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getUserFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Autenticazione richiesta' },
        { status: 401 }
      );
    }

    // Parse body
    let body: {
      exerciseId: string;
      notes?: string;
      reflectionAnswers?: Record<string, string>;
      ratingDifficulty?: number;
      ratingUsefulness?: number;
      feedback?: string;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Body JSON non valido' },
        { status: 400 }
      );
    }

    const { exerciseId, notes, reflectionAnswers, ratingDifficulty, ratingUsefulness, feedback } = body;

    if (!exerciseId) {
      return NextResponse.json(
        { error: 'exerciseId richiesto' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    // Recupera info esercizio
    const { data: exercise, error: exerciseError } = await supabase
      .from('exercises')
      .select('id, title, book_slug, characteristic_slug, pillar')
      .eq('id', exerciseId)
      .single();

    if (exerciseError || !exercise) {
      return NextResponse.json(
        { error: 'Esercizio non trovato' },
        { status: 404 }
      );
    }

    // Mappa book_slug a pathType
    const pathTypeMap: Record<string, PathType> = {
      'leadership': 'leadership',
      'risolutore': 'ostacoli',
      'microfelicita': 'microfelicita',
    };
    const pathType = pathTypeMap[exercise.book_slug] || 'leadership';

    // 1. Aggiorna progresso esercizio nel sistema esistente
    const { data: existingProgress } = await supabase
      .from('user_exercise_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('exercise_id', exerciseId)
      .single();

    const progressData = {
      status: 'completed',
      completed_at: new Date().toISOString(),
      notes: notes || null,
      reflection_answers: reflectionAnswers || null,
      rating_difficulty: ratingDifficulty || null,
      rating_usefulness: ratingUsefulness || null,
      feedback: feedback || null,
    };

    let progressResult;
    if (existingProgress) {
      const { data, error } = await supabase
        .from('user_exercise_progress')
        .update(progressData)
        .eq('user_id', userId)
        .eq('exercise_id', exerciseId)
        .select()
        .single();

      if (error) throw error;
      progressResult = data;
    } else {
      const { data, error } = await supabase
        .from('user_exercise_progress')
        .insert({
          user_id: userId,
          exercise_id: exerciseId,
          started_at: new Date().toISOString(),
          ...progressData,
        })
        .select()
        .single();

      if (error) throw error;
      progressResult = data;
    }

    // 2. Integra con sistema cicli START:CHANGE:STOP
    let cycleResult = null;
    try {
      // Recupera prossimo esercizio raccomandato
      const nextExerciseRec = await getNextExercise(userId, pathType);
      const nextExercise = nextExerciseRec
        ? {
            id: nextExerciseRec.exerciseId,
            title: nextExerciseRec.exerciseTitle,
            reasoning: nextExerciseRec.reasoning,
          }
        : undefined;

      // Completa ciclo con conseguimento
      const characteristic = exercise.characteristic_slug || exercise.pillar || 'generale';
      const reflection = feedback || notes || 'Esercizio completato con successo';

      cycleResult = await completeExerciseWithCycle(
        userId,
        exerciseId,
        exercise.title,
        pathType,
        characteristic,
        reflection,
        undefined, // radarDelta
        nextExercise
      );
    } catch (cycleError) {
      // Se il sistema cicli fallisce, logga ma non blocca il completamento
      console.warn('Sistema cicli non disponibile:', cycleError);
    }

    return NextResponse.json({
      success: true,
      data: {
        progress: progressResult,
        cycle: cycleResult
          ? {
              achievement: {
                id: cycleResult.achievement.id,
                title: cycleResult.achievement.title,
                type: cycleResult.achievement.achievement_type,
              },
              macroAchievement: cycleResult.macroAchievement
                ? {
                    id: cycleResult.macroAchievement.id,
                    title: cycleResult.macroAchievement.title,
                    microCount: cycleResult.macroAchievement.micro_count,
                  }
                : null,
              nextProposal: cycleResult.nextProposal,
            }
          : null,
      },
    });

  } catch (error) {
    console.error('Errore API exercises complete:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
