/**
 * Update Awareness Level
 *
 * Gestisce l'aggiornamento del livello di consapevolezza
 * e il salvataggio dello storico per analytics
 */

import { createClient } from '@supabase/supabase-js';
import { AwarenessIndicators, AwarenessResult, AwarenessHistoryEntry } from './types';
import { calculateAwarenessLevel } from './calculate-level';
import { collectIndicators, collectIndicatorsByEmail } from './indicators';

// =====================================================
// SUPABASE CLIENT
// =====================================================

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// =====================================================
// TRIGGER EVENTS (per tracking)
// =====================================================

export type TriggerEvent =
  | 'challenge_day_completed'
  | 'challenge_completed'
  | 'assessment_completed'
  | 'first_ai_conversation'
  | 'ai_conversation_rated'
  | 'exercise_started'
  | 'exercise_completed'
  | 'subscription_changed'
  | 'manual_recalculate'
  | 'scheduled_update';

// =====================================================
// UPDATE AWARENESS LEVEL
// =====================================================

export interface UpdateResult {
  success: boolean;
  previousLevel: number;
  newLevel: number;
  levelChanged: boolean;
  result: AwarenessResult;
  historyId?: string;
  error?: string;
}

/**
 * Aggiorna il livello di consapevolezza di un utente
 * Chiamato dopo eventi significativi (challenge, assessment, etc.)
 */
export async function updateUserAwarenessLevel(
  userId: string,
  triggerEvent: TriggerEvent
): Promise<UpdateResult> {
  const supabase = getSupabase();

  try {
    // 1. Raccogli indicatori attuali
    const indicators = await collectIndicators(userId);

    // 2. Calcola nuovo livello
    const result = calculateAwarenessLevel(indicators);

    // 3. Ottieni livello precedente
    const { data: memory } = await supabase
      .from('ai_coach_user_memory')
      .select('awareness_level, awareness_score, awareness_history')
      .eq('user_id', userId)
      .single();

    const previousLevel = memory?.awareness_level ?? -5;
    const levelChanged = result.level !== previousLevel;

    // 4. Prepara history entry
    const currentHistory = Array.isArray(memory?.awareness_history)
      ? memory.awareness_history
      : [];

    const newHistoryEntry = {
      level: result.level,
      score: result.score,
      from: previousLevel,
      trigger: triggerEvent,
      at: new Date().toISOString(),
    };

    // Limita la history agli ultimi 50 record per evitare bloat
    const updatedHistory = [...currentHistory, newHistoryEntry].slice(-50);

    // 5. Aggiorna ai_coach_user_memory
    await supabase
      .from('ai_coach_user_memory')
      .upsert({
        user_id: userId,
        awareness_level: result.level,
        awareness_score: result.score,
        awareness_calculated_at: new Date().toISOString(),
        awareness_history: updatedHistory,
      }, {
        onConflict: 'user_id',
      });

    // 6. Salva nella history dettagliata (per analytics)
    const { data: historyEntry, error: historyError } = await supabase
      .from('user_awareness_history')
      .insert({
        user_id: userId,
        level: result.level,
        score: result.score,
        indicators: indicators as unknown as Record<string, unknown>,
        trigger_event: triggerEvent,
      })
      .select('id')
      .single();

    if (historyError) {
      console.error('[Awareness] Errore salvataggio history:', historyError);
    }

    // 7. Log se il livello è cambiato
    if (levelChanged) {
      console.log(
        `[Awareness] User ${userId}: ${previousLevel} → ${result.level} (${result.levelName}) via ${triggerEvent}`
      );
    }

    return {
      success: true,
      previousLevel,
      newLevel: result.level,
      levelChanged,
      result,
      historyId: historyEntry?.id,
    };
  } catch (error) {
    console.error('[Awareness] Errore aggiornamento:', error);
    return {
      success: false,
      previousLevel: -5,
      newLevel: -5,
      levelChanged: false,
      result: {
        level: -5,
        levelName: 'Paura di Peggiorare',
        score: 0,
        zone: 'sotto_necessita',
        zoneName: 'Sotto Necessità',
        reasoning: 'Errore nel calcolo',
        calculatedAt: new Date(),
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =====================================================
// UPDATE BY EMAIL (for Challenge users)
// =====================================================

/**
 * Aggiorna awareness per utenti challenge (potrebbero non avere userId)
 */
export async function updateAwarenessByEmail(
  email: string,
  triggerEvent: TriggerEvent
): Promise<UpdateResult | null> {
  const supabase = getSupabase();

  // Cerca se esiste un profilo con questa email
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (profile) {
    // Utente registrato, usa il flusso normale
    return updateUserAwarenessLevel(profile.id, triggerEvent);
  }

  // Utente non registrato (solo challenge)
  // Salva solo nella history per tracking
  const indicators = await collectIndicatorsByEmail(email);
  if (!indicators) {
    return null;
  }

  const result = calculateAwarenessLevel(indicators);

  // Salva solo nella history (senza user_id)
  await supabase.from('user_awareness_history').insert({
    // user_id è null per utenti non registrati
    level: result.level,
    score: result.score,
    indicators: {
      ...indicators,
      email, // Aggiungi email per tracking
    } as unknown as Record<string, unknown>,
    trigger_event: triggerEvent,
  });

  return {
    success: true,
    previousLevel: -5,
    newLevel: result.level,
    levelChanged: true,
    result,
  };
}

// =====================================================
// GET CURRENT LEVEL
// =====================================================

/**
 * Ottiene il livello attuale di un utente (senza ricalcolo)
 */
export async function getCurrentAwarenessLevel(userId: string): Promise<{
  level: number;
  score: number;
  calculatedAt: Date | null;
} | null> {
  const supabase = getSupabase();

  const { data } = await supabase
    .from('ai_coach_user_memory')
    .select('awareness_level, awareness_score, awareness_calculated_at')
    .eq('user_id', userId)
    .single();

  if (!data) {
    return null;
  }

  return {
    level: data.awareness_level ?? -5,
    score: data.awareness_score ?? 0,
    calculatedAt: data.awareness_calculated_at ? new Date(data.awareness_calculated_at) : null,
  };
}

// =====================================================
// GET AWARENESS HISTORY
// =====================================================

/**
 * Ottiene lo storico awareness di un utente
 */
export async function getAwarenessHistory(
  userId: string,
  limit = 50
): Promise<AwarenessHistoryEntry[]> {
  const supabase = getSupabase();

  const { data } = await supabase
    .from('user_awareness_history')
    .select('*')
    .eq('user_id', userId)
    .order('calculated_at', { ascending: false })
    .limit(limit);

  if (!data) {
    return [];
  }

  return data.map((entry) => ({
    id: entry.id,
    userId: entry.user_id,
    level: entry.level,
    score: entry.score,
    indicators: entry.indicators as AwarenessIndicators,
    triggerEvent: entry.trigger_event,
    calculatedAt: new Date(entry.calculated_at),
  }));
}

// =====================================================
// BULK RECALCULATE (for admin/cron)
// =====================================================

/**
 * Ricalcola awareness per tutti gli utenti attivi
 * Da usare in job cron settimanale
 */
export async function bulkRecalculateAwareness(): Promise<{
  processed: number;
  changed: number;
  errors: number;
}> {
  const supabase = getSupabase();

  // Ottieni tutti gli utenti con attività recente
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: activeUsers } = await supabase
    .from('profiles')
    .select('id')
    .gte('updated_at', thirtyDaysAgo.toISOString());

  if (!activeUsers || activeUsers.length === 0) {
    return { processed: 0, changed: 0, errors: 0 };
  }

  let processed = 0;
  let changed = 0;
  let errors = 0;

  for (const user of activeUsers) {
    try {
      const result = await updateUserAwarenessLevel(user.id, 'scheduled_update');
      processed++;
      if (result.levelChanged) {
        changed++;
      }
    } catch {
      errors++;
    }
  }

  console.log(
    `[Awareness] Bulk update: ${processed} processed, ${changed} changed, ${errors} errors`
  );

  return { processed, changed, errors };
}

// =====================================================
// HOOK HELPERS
// =====================================================

/**
 * Hook da chiamare dopo completamento giorno challenge
 */
export async function onChallengeDayCompleted(
  email: string,
  day: number
): Promise<void> {
  console.log(`[Awareness] Challenge day ${day} completed for ${email}`);
  await updateAwarenessByEmail(
    email,
    day === 7 ? 'challenge_completed' : 'challenge_day_completed'
  );
}

/**
 * Hook da chiamare dopo completamento assessment
 */
export async function onAssessmentCompleted(userId: string): Promise<void> {
  console.log(`[Awareness] Assessment completed for user ${userId}`);
  await updateUserAwarenessLevel(userId, 'assessment_completed');
}

/**
 * Hook da chiamare dopo conversazione AI Coach
 */
export async function onAIConversation(
  userId: string,
  isFirst: boolean
): Promise<void> {
  await updateUserAwarenessLevel(
    userId,
    isFirst ? 'first_ai_conversation' : 'ai_conversation_rated'
  );
}

/**
 * Hook da chiamare dopo completamento esercizio
 */
export async function onExerciseCompleted(userId: string): Promise<void> {
  await updateUserAwarenessLevel(userId, 'exercise_completed');
}

/**
 * Hook da chiamare dopo cambio subscription
 */
export async function onSubscriptionChanged(userId: string): Promise<void> {
  await updateUserAwarenessLevel(userId, 'subscription_changed');
}
