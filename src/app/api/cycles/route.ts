/**
 * API Cycles - Sistema START:CHANGE:STOP
 *
 * GET: Recupera ciclo attivo e storico conseguimenti
 * POST: Completa ciclo con conseguimento
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/service';
import {
  getActiveCycle,
  getCompletedCycles,
  getUserAchievements,
  getUncelebratedAchievements,
  completeExerciseWithCycle,
  celebrateAchievement,
  PathType,
} from '@/lib/action-cycles';
import { getNextExercise } from '@/lib/ai-coach/adaptive-path';

export const dynamic = 'force-dynamic';

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

// ============================================================
// GET: Recupera stato cicli e conseguimenti
// ============================================================
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getUserFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Autenticazione richiesta' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const pathType = searchParams.get('path') as PathType | null;

    if (!pathType || !['leadership', 'ostacoli', 'microfelicita'].includes(pathType)) {
      return NextResponse.json(
        { error: 'Parametro path richiesto (leadership, ostacoli, microfelicita)' },
        { status: 400 }
      );
    }

    // Recupera dati in parallelo
    const [activeCycle, completedCycles, achievements, uncelebrated] = await Promise.all([
      getActiveCycle(userId, pathType),
      getCompletedCycles(userId, pathType, 5),
      getUserAchievements(userId, pathType),
      getUncelebratedAchievements(userId),
    ]);

    // Statistiche
    const microCount = achievements.filter(a => a.achievement_type === 'micro').length;
    const macroCount = achievements.filter(a => a.achievement_type === 'macro').length;

    return NextResponse.json({
      success: true,
      data: {
        activeCycle,
        recentCycles: completedCycles,
        achievements: {
          all: achievements,
          uncelebrated: uncelebrated.filter(a => a.path_type === pathType),
          stats: {
            micro: microCount,
            macro: macroCount,
            total: achievements.length,
          },
        },
        currentPhase: activeCycle?.current_phase || null,
      },
    });

  } catch (error) {
    console.error('Errore API cycles GET:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// ============================================================
// POST: Completa ciclo con conseguimento
// ============================================================
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
      exerciseTitle: string;
      pathType: PathType;
      characteristic: string;
      reflection: string;
      radarDelta?: Record<string, number>;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Body JSON non valido' },
        { status: 400 }
      );
    }

    const { exerciseId, exerciseTitle, pathType, characteristic, reflection, radarDelta } = body;

    // Validazioni
    if (!exerciseId || !exerciseTitle || !pathType || !characteristic || !reflection) {
      return NextResponse.json(
        { error: 'Campi richiesti: exerciseId, exerciseTitle, pathType, characteristic, reflection' },
        { status: 400 }
      );
    }

    if (!['leadership', 'ostacoli', 'microfelicita'].includes(pathType)) {
      return NextResponse.json(
        { error: 'pathType non valido' },
        { status: 400 }
      );
    }

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
    const result = await completeExerciseWithCycle(
      userId,
      exerciseId,
      exerciseTitle,
      pathType,
      characteristic,
      reflection,
      radarDelta,
      nextExercise
    );

    return NextResponse.json({
      success: true,
      data: {
        cycle: {
          id: result.cycle.id,
          phase: result.cycle.current_phase,
          achievement: result.cycle.stop_achievement,
          nextProposal: result.cycle.stop_next_proposal,
        },
        achievement: {
          id: result.achievement.id,
          type: result.achievement.achievement_type,
          title: result.achievement.title,
        },
        macroAchievement: result.macroAchievement
          ? {
              id: result.macroAchievement.id,
              title: result.macroAchievement.title,
              microCount: result.macroAchievement.micro_count,
            }
          : null,
        nextStep: {
          proposal: result.nextProposal,
          exercise: nextExercise || null,
        },
      },
    });

  } catch (error) {
    console.error('Errore API cycles POST:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// ============================================================
// PATCH: Celebra conseguimento
// ============================================================
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getUserFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Autenticazione richiesta' },
        { status: 401 }
      );
    }

    let body: { achievementId: string };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Body JSON non valido' },
        { status: 400 }
      );
    }

    if (!body.achievementId) {
      return NextResponse.json(
        { error: 'achievementId richiesto' },
        { status: 400 }
      );
    }

    await celebrateAchievement(body.achievementId);

    return NextResponse.json({
      success: true,
      message: 'Conseguimento celebrato',
    });

  } catch (error) {
    console.error('Errore API cycles PATCH:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
