/**
 * AI Coach Learning System - Daily Metrics
 * Calcola metriche giornaliere per i 12 Fattori
 */

import { createClient } from '@supabase/supabase-js';
import { AICoachMetricsDaily } from '@/types/ai-coach-learning';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Calcola metriche per una data specifica
 */
export async function calculateDailyMetrics(
  targetDate: Date = new Date()
): Promise<Partial<AICoachMetricsDaily> | null> {
  const supabase = getSupabaseClient();

  // Formatta data per query
  const dateStr = targetDate.toISOString().split('T')[0];
  const startOfDay = `${dateStr}T00:00:00.000Z`;
  const endOfDay = `${dateStr}T23:59:59.999Z`;

  try {
    // PRODOTTO 2: Quantita conversazioni e messaggi
    const { data: convData } = await supabase
      .from('ai_coach_conversations')
      .select('id, session_id, response_time_ms')
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay);

    const conversations = convData || [];
    const uniqueSessions = new Set(conversations.map(c => c.session_id));
    const avgResponseTime = conversations.length > 0
      ? conversations.reduce((sum, c) => sum + (c.response_time_ms || 0), 0) / conversations.length
      : null;

    // PRODOTTO 2: Qualita (rating e helpful ratio)
    const { data: feedbackData } = await supabase
      .from('ai_coach_feedback')
      .select('rating, is_helpful, conversation_id')
      .in('conversation_id', conversations.map(c => c.id));

    const feedback = feedbackData || [];
    const avgRating = feedback.length > 0 && feedback.some(f => f.rating != null)
      ? feedback.filter(f => f.rating != null).reduce((sum, f) => sum + (f.rating || 0), 0) /
        feedback.filter(f => f.rating != null).length
      : null;

    const helpfulFeedback = feedback.filter(f => f.is_helpful != null);
    const helpfulRatio = helpfulFeedback.length > 0
      ? helpfulFeedback.filter(f => f.is_helpful).length / helpfulFeedback.length
      : null;

    // PRODOTTO 4: Pattern corretti
    const { data: patternData } = await supabase
      .from('ai_coach_patterns')
      .select('id')
      .eq('status', 'auto_corrected')
      .gte('updated_at', startOfDay)
      .lte('updated_at', endOfDay);

    const patternsCorrected = patternData?.length || 0;

    // PRODOTTO 1: Costo API (stima basata su token)
    const { data: tokenData } = await supabase
      .from('ai_coach_conversations')
      .select('user_message_tokens, ai_response_tokens')
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay);

    const tokens = tokenData || [];
    const totalInputTokens = tokens.reduce((sum, t) => sum + (t.user_message_tokens || 0), 0);
    const totalOutputTokens = tokens.reduce((sum, t) => sum + (t.ai_response_tokens || 0), 0);
    // Stima costo Claude Sonnet: ~$3/1M input, ~$15/1M output
    const estimatedCost = (totalInputTokens * 0.000003) + (totalOutputTokens * 0.000015);

    // PRODOTTO 2 Viability: Tasso completamento esercizi
    const { data: exerciseConvs } = await supabase
      .from('ai_coach_conversations')
      .select('exercise_id, user_id')
      .not('exercise_id', 'is', null)
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay);

    // PRODOTTO 3: Miglioramenti applicati
    const { data: improvements } = await supabase
      .from('ai_coach_prompt_versions')
      .select('id')
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay);

    const metrics: Partial<AICoachMetricsDaily> = {
      date: dateStr,
      // Prodotto 1
      p1_viability_api_cost: estimatedCost > 0 ? estimatedCost : null,
      p1_viability_avg_response_time: avgResponseTime ? Math.round(avgResponseTime) : null,
      // Prodotto 2
      p2_quantity_conversations: uniqueSessions.size,
      p2_quantity_messages: conversations.length,
      p2_quality_avg_rating: avgRating,
      p2_quality_helpful_ratio: helpfulRatio,
      // Prodotto 3
      p3_quantity_improvements: improvements?.length || 0,
      // Prodotto 4
      p4_quantity_patterns_corrected: patternsCorrected,
    };

    return metrics;

  } catch (error) {
    console.error('Errore calcolo metriche:', error);
    return null;
  }
}

/**
 * Salva metriche giornaliere nel database
 */
export async function saveDailyMetrics(
  metrics: Partial<AICoachMetricsDaily>
): Promise<boolean> {
  if (!metrics.date) return false;

  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('ai_coach_metrics_daily')
    .upsert(metrics, {
      onConflict: 'date',
    });

  if (error) {
    console.error('Errore salvataggio metriche:', error);
    return false;
  }

  console.log(`Metriche salvate per ${metrics.date}`);
  return true;
}

/**
 * Esegui calcolo metriche giornaliere
 * Chiamato da cron job o manualmente
 */
export async function runDailyMetricsJob(
  date?: Date
): Promise<{ success: boolean; metrics?: Partial<AICoachMetricsDaily> }> {
  const targetDate = date || new Date();
  targetDate.setDate(targetDate.getDate() - 1); // Calcola per ieri

  console.log(`Calcolo metriche per: ${targetDate.toISOString().split('T')[0]}`);

  const metrics = await calculateDailyMetrics(targetDate);

  if (!metrics) {
    return { success: false };
  }

  const saved = await saveDailyMetrics(metrics);

  return {
    success: saved,
    metrics,
  };
}

/**
 * Recupera metriche per un range di date
 */
export async function getMetricsRange(
  startDate: string,
  endDate: string
): Promise<AICoachMetricsDaily[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('ai_coach_metrics_daily')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) {
    console.error('Errore recupero metriche:', error);
    return [];
  }

  return data || [];
}

/**
 * Recupera ultime N metriche
 */
export async function getRecentMetrics(
  days: number = 7
): Promise<AICoachMetricsDaily[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('ai_coach_metrics_daily')
    .select('*')
    .order('date', { ascending: false })
    .limit(days);

  if (error) {
    console.error('Errore recupero metriche recenti:', error);
    return [];
  }

  return (data || []).reverse();
}
