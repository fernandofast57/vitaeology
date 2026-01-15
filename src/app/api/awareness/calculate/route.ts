/**
 * API: Calculate/Update Awareness Level
 *
 * POST /api/awareness/calculate
 *   - Calcola e aggiorna il livello awareness di un utente
 *   - Richiede userId o email
 *   - Opzionale: triggerEvent per tracking
 *
 * GET /api/awareness/calculate?userId=xxx
 *   - Ottiene il livello attuale senza ricalcolo
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  updateUserAwarenessLevel,
  updateAwarenessByEmail,
  getCurrentAwarenessLevel,
  TriggerEvent,
} from '@/lib/awareness/update-level';
import { collectIndicators } from '@/lib/awareness/indicators';
import { calculateAwarenessLevel } from '@/lib/awareness/calculate-level';
import { getLevelName, getZoneForLevel, getZoneInfo } from '@/lib/awareness/types';

export const dynamic = 'force-dynamic';

// Supabase client
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// =====================================================
// GET - Ottieni livello attuale
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const recalculate = searchParams.get('recalculate') === 'true';

    if (!userId && !email) {
      return NextResponse.json(
        { error: 'userId or email required' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    let targetUserId = userId;

    // Se abbiamo solo email, cerca l'userId
    if (!targetUserId && email) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (profile) {
        targetUserId = profile.id;
      } else {
        // Utente non registrato
        return NextResponse.json({
          level: -5,
          levelName: 'Paura di Peggiorare',
          score: 0,
          zone: 'sotto_necessita',
          zoneName: 'Sotto Necessità',
          isRegistered: false,
        });
      }
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Se richiesto ricalcolo
    if (recalculate) {
      const indicators = await collectIndicators(targetUserId);
      const result = calculateAwarenessLevel(indicators);

      return NextResponse.json({
        ...result,
        isRegistered: true,
        indicators, // Includi per debug
      });
    }

    // Altrimenti ritorna valore cached
    const current = await getCurrentAwarenessLevel(targetUserId);

    if (!current) {
      // Nessun dato, calcola
      const indicators = await collectIndicators(targetUserId);
      const result = calculateAwarenessLevel(indicators);

      return NextResponse.json({
        ...result,
        isRegistered: true,
        isFirstCalculation: true,
      });
    }

    return NextResponse.json({
      level: current.level,
      levelName: getLevelName(current.level),
      score: current.score,
      zone: getZoneForLevel(current.level),
      zoneName: getZoneInfo(getZoneForLevel(current.level)).name,
      calculatedAt: current.calculatedAt,
      isRegistered: true,
    });
  } catch (error) {
    console.error('[Awareness API] GET Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Calcola e aggiorna livello
// =====================================================

interface PostBody {
  userId?: string;
  email?: string;
  triggerEvent?: TriggerEvent;
}

export async function POST(request: NextRequest) {
  try {
    const body: PostBody = await request.json();
    const { userId, email, triggerEvent = 'manual_recalculate' } = body;

    if (!userId && !email) {
      return NextResponse.json(
        { error: 'userId or email required' },
        { status: 400 }
      );
    }

    // Validate trigger event
    const validTriggers: TriggerEvent[] = [
      'challenge_day_completed',
      'challenge_completed',
      'assessment_completed',
      'first_ai_conversation',
      'ai_conversation_rated',
      'exercise_started',
      'exercise_completed',
      'subscription_changed',
      'manual_recalculate',
      'scheduled_update',
    ];

    if (!validTriggers.includes(triggerEvent)) {
      return NextResponse.json(
        { error: `Invalid triggerEvent. Valid values: ${validTriggers.join(', ')}` },
        { status: 400 }
      );
    }

    let result;

    if (userId) {
      result = await updateUserAwarenessLevel(userId, triggerEvent);
    } else if (email) {
      result = await updateAwarenessByEmail(email, triggerEvent);
    }

    if (!result) {
      return NextResponse.json(
        { error: 'Could not update awareness level' },
        { status: 404 }
      );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Update failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      previousLevel: result.previousLevel,
      newLevel: result.newLevel,
      levelChanged: result.levelChanged,
      levelName: result.result.levelName,
      score: result.result.score,
      zone: result.result.zone,
      zoneName: result.result.zoneName,
      reasoning: result.result.reasoning,
      nextLevelHint: result.result.nextLevelHint,
      historyId: result.historyId,
    });
  } catch (error) {
    console.error('[Awareness API] POST Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
