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
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
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

// Supabase service client (per operazioni che richiedono accesso completo)
function getSupabase() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// =====================================================
// GET - Ottieni livello attuale (C8 fix: richiede autenticazione)
// =====================================================

export async function GET(request: NextRequest) {
  try {
    // === AUTENTICAZIONE SERVER-SIDE ===
    const authSupabase = await createClient();
    const { data: { user: authUser }, error: authError } = await authSupabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    // L'utente puo solo consultare il PROPRIO livello awareness
    const targetUserId = authUser.id;

    const { searchParams } = new URL(request.url);
    const recalculate = searchParams.get('recalculate') === 'true';

    // Se richiesto ricalcolo
    if (recalculate) {
      const indicators = await collectIndicators(targetUserId);
      const result = calculateAwarenessLevel(indicators);

      return NextResponse.json({
        ...result,
        isRegistered: true,
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
  } catch {
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
    // === AUTENTICAZIONE SERVER-SIDE (C8 fix) ===
    const authSupabase = await createClient();
    const { data: { user: authUser }, error: authError } = await authSupabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    const body: PostBody = await request.json();
    const { triggerEvent = 'manual_recalculate' } = body;

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

    // Usa sempre l'userId autenticato dal server
    const result = await updateUserAwarenessLevel(authUser.id, triggerEvent);

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
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
