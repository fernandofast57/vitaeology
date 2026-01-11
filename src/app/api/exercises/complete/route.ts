/**
 * API Exercises Complete - Integrazione cicli START:CHANGE:STOP
 *
 * POST: Completa esercizio con conseguimento
 * Include logica per determinare quando suggerire aggiornamento radar
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { completeExerciseWithCycle } from '@/lib/action-cycles';
import { getNextExercise } from '@/lib/ai-coach/adaptive-path';
import { checkAndAwardMilestones, MilestoneAwardResult } from '@/lib/milestones';

export const dynamic = 'force-dynamic';

// Configurazione soglie per radar update
const RADAR_UPDATE_CONFIG = {
  minDaysSinceLastSnapshot: 7,  // Almeno 1 settimana
  minExercisesSinceSnapshot: 3, // Almeno 3 esercizi completati
};

interface RadarUpdateEligibility {
  eligible: boolean;
  reason: string;
  daysSinceLastSnapshot: number | null;
  exercisesSinceSnapshot: number;
  lastSnapshotDate: string | null;
}

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Verifica se l'utente è eleggibile per un aggiornamento radar
 */
async function checkRadarUpdateEligibility(
  supabase: SupabaseClient,
  userId: string,
  pathType: 'leadership' | 'ostacoli' | 'microfelicita',
  bookSlug: string
): Promise<RadarUpdateEligibility> {
  // 1. Recupera ultimo snapshot radar per questo pathType
  const { data: lastSnapshot } = await supabase
    .from('user_radar_snapshots')
    .select('id, snapshot_date, created_at')
    .eq('user_id', userId)
    .eq('assessment_type', pathType)
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single();

  // Se non c'è snapshot precedente, l'utente deve prima fare l'assessment
  if (!lastSnapshot) {
    return {
      eligible: false,
      reason: 'no_previous_snapshot',
      daysSinceLastSnapshot: null,
      exercisesSinceSnapshot: 0,
      lastSnapshotDate: null,
    };
  }

  const lastSnapshotDate = new Date(lastSnapshot.snapshot_date);
  const now = new Date();
  const daysSinceLastSnapshot = Math.floor(
    (now.getTime() - lastSnapshotDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // 2. Conta esercizi completati dopo l'ultimo snapshot
  // Usa join con tabella exercises per filtrare per book_slug
  const { data: completedExercises } = await supabase
    .from('user_exercise_progress')
    .select('exercise_id, completed_at, exercises!inner(book_slug)')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .eq('exercises.book_slug', bookSlug)
    .gt('completed_at', lastSnapshot.snapshot_date);

  const actualExerciseCount = completedExercises?.length || 0;

  // 3. Verifica condizioni
  const meetsTimeCondition = daysSinceLastSnapshot >= RADAR_UPDATE_CONFIG.minDaysSinceLastSnapshot;
  const meetsExerciseCondition = actualExerciseCount >= RADAR_UPDATE_CONFIG.minExercisesSinceSnapshot;

  if (!meetsTimeCondition) {
    return {
      eligible: false,
      reason: 'too_soon',
      daysSinceLastSnapshot,
      exercisesSinceSnapshot: actualExerciseCount,
      lastSnapshotDate: lastSnapshot.snapshot_date,
    };
  }

  if (!meetsExerciseCondition) {
    return {
      eligible: false,
      reason: 'not_enough_exercises',
      daysSinceLastSnapshot,
      exercisesSinceSnapshot: actualExerciseCount,
      lastSnapshotDate: lastSnapshot.snapshot_date,
    };
  }

  // Tutte le condizioni soddisfatte
  return {
    eligible: true,
    reason: 'eligible_for_update',
    daysSinceLastSnapshot,
    exercisesSinceSnapshot: actualExerciseCount,
    lastSnapshotDate: lastSnapshot.snapshot_date,
  };
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
      .select('id, title, book_slug, characteristic_slug, pillar_primary')
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
      const characteristic = exercise.characteristic_slug || exercise.pillar_primary || 'generale';
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

    // 3. Verifica eleggibilità per aggiornamento radar
    let radarUpdateEligibility: RadarUpdateEligibility | null = null;
    try {
      radarUpdateEligibility = await checkRadarUpdateEligibility(
        supabase,
        userId,
        pathType,
        exercise.book_slug
      );

      // Log per tracking (utile per analytics future)
      if (radarUpdateEligibility.eligible) {
        console.log(`[Radar Update] Utente ${userId} eleggibile per aggiornamento ${pathType}:`, {
          daysSinceLastSnapshot: radarUpdateEligibility.daysSinceLastSnapshot,
          exercisesSinceSnapshot: radarUpdateEligibility.exercisesSinceSnapshot,
        });
      }
    } catch (radarError) {
      // Errore non blocca il completamento
      console.warn('Errore verifica radar eligibility:', radarError);
    }

    // 4. Verifica e assegna milestone
    let earnedMilestones: MilestoneAwardResult[] = [];
    try {
      earnedMilestones = await checkAndAwardMilestones(userId, {
        action: 'exercise_complete',
        pathType,
        bookSlug: exercise.book_slug,
      });

      // Log milestone guadagnate
      const newMilestones = earnedMilestones.filter(m => m.success && !m.alreadyExists);
      if (newMilestones.length > 0) {
        console.log(`[Milestone] Utente ${userId} ha guadagnato ${newMilestones.length} milestone:`,
          newMilestones.map(m => m.milestone?.milestoneType)
        );
      }
    } catch (milestoneError) {
      // Errore non blocca il completamento
      console.warn('Errore verifica milestone:', milestoneError);
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
        // Informazioni per eventuale prompt radar update
        radarUpdate: radarUpdateEligibility
          ? {
              eligible: radarUpdateEligibility.eligible,
              reason: radarUpdateEligibility.reason,
              daysSinceLastSnapshot: radarUpdateEligibility.daysSinceLastSnapshot,
              exercisesSinceSnapshot: radarUpdateEligibility.exercisesSinceSnapshot,
              // URL per mini-assessment (commentato per ora)
              // miniAssessmentUrl: radarUpdateEligibility.eligible
              //   ? `/assessment/mini?type=${pathType}&questions=10`
              //   : null,
            }
          : null,
        // Milestone guadagnate
        milestones: earnedMilestones
          .filter(m => m.success && !m.alreadyExists && m.milestone)
          .map(m => ({
            id: m.milestoneId,
            type: m.milestone?.milestoneType,
            pathType: m.milestone?.pathType,
            name: m.milestone?.definition?.name,
            description: m.milestone?.definition?.description,
            icon: m.milestone?.definition?.icon,
            xpReward: m.milestone?.definition?.xpReward,
          })),
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
