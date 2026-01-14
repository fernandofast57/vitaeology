/**
 * Scheduler Adattivo per Monitoraggio 4P×3F
 *
 * Implementa teoria delle code con:
 * - Frequenza dinamica basata su anomalie
 * - Backoff esponenziale per periodi stabili
 * - Stato persistente nel database
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { SCHEDULE_INTERVALS } from './thresholds';

export type CheckType = 'health' | 'p2' | 'p4' | 'report';

export interface ScheduleState {
  check_type: CheckType;
  last_check_at: string | null;
  next_check_at: string | null;
  consecutive_anomalies: number;
  consecutive_normal: number;
  is_anomaly_mode: boolean;
  base_interval_ms: number;
  anomaly_interval_ms: number;
  current_interval_ms: number;
  backoff_multiplier: number;
  last_status: 'ok' | 'warning' | 'critical' | 'error' | null;
  last_error: string | null;
}

export interface CheckDecision {
  checkType: CheckType;
  shouldRun: boolean;
  reason: string;
  msSinceLastCheck: number;
  currentInterval: number;
  isAnomalyMode: boolean;
}

// =====================================================
// RECUPERA STATO SCHEDULER DAL DATABASE
// =====================================================

export async function getScheduleStates(
  supabase: SupabaseClient
): Promise<ScheduleState[]> {
  const { data, error } = await supabase
    .from('monitoring_schedule_state')
    .select('*');

  if (error) {
    console.error('[Scheduler] Errore lettura stato:', error);
    return [];
  }

  return data || [];
}

// =====================================================
// DETERMINA QUALI CHECK ESEGUIRE
// =====================================================

export async function determineChecksToRun(
  supabase: SupabaseClient
): Promise<CheckDecision[]> {
  const states = await getScheduleStates(supabase);
  const decisions: CheckDecision[] = [];
  const now = Date.now();

  for (const state of states) {
    const lastCheckTime = state.last_check_at
      ? new Date(state.last_check_at).getTime()
      : 0;
    const msSinceLastCheck = now - lastCheckTime;

    const shouldRun = msSinceLastCheck >= state.current_interval_ms;

    let reason = '';
    if (shouldRun) {
      reason = state.is_anomaly_mode
        ? `Anomaly mode: check ogni ${Math.round(state.current_interval_ms / 60000)}min`
        : `Normal mode: ${Math.round(msSinceLastCheck / 60000)}min trascorsi`;
    } else {
      const remainingMs = state.current_interval_ms - msSinceLastCheck;
      reason = `Prossimo check tra ${Math.round(remainingMs / 60000)}min`;
    }

    decisions.push({
      checkType: state.check_type as CheckType,
      shouldRun,
      reason,
      msSinceLastCheck,
      currentInterval: state.current_interval_ms,
      isAnomalyMode: state.is_anomaly_mode
    });
  }

  return decisions;
}

// =====================================================
// AGGIORNA STATO DOPO CHECK
// =====================================================

export async function updateScheduleState(
  supabase: SupabaseClient,
  checkType: CheckType,
  status: 'ok' | 'warning' | 'critical' | 'error',
  isAnomaly: boolean,
  errorMessage?: string
): Promise<void> {
  // Usa la funzione SQL per aggiornamento atomico
  const { error } = await supabase.rpc('fn_update_check_state', {
    p_check_type: checkType,
    p_status: status,
    p_is_anomaly: isAnomaly,
    p_error: errorMessage || null
  });

  if (error) {
    console.error('[Scheduler] Errore aggiornamento stato:', error);

    // Fallback: aggiornamento diretto
    await updateScheduleStateDirect(supabase, checkType, status, isAnomaly, errorMessage);
  }
}

// Fallback se la funzione SQL non esiste
async function updateScheduleStateDirect(
  supabase: SupabaseClient,
  checkType: CheckType,
  status: 'ok' | 'warning' | 'critical' | 'error',
  isAnomaly: boolean,
  errorMessage?: string
): Promise<void> {
  const { data: currentState } = await supabase
    .from('monitoring_schedule_state')
    .select('*')
    .eq('check_type', checkType)
    .single();

  if (!currentState) return;

  const intervals = SCHEDULE_INTERVALS[checkType];
  let newIntervalMs: number;
  let newBackoff: number;

  if (isAnomaly) {
    // Anomalia: riduci intervallo
    newIntervalMs = intervals.anomaly;
    newBackoff = 1.0;
  } else {
    // Normale: aumenta backoff gradualmente (max 2x)
    newBackoff = Math.min(currentState.backoff_multiplier * 1.1, 2.0);
    newIntervalMs = Math.min(
      Math.round(intervals.base * newBackoff),
      intervals.base * 2
    );
  }

  const now = new Date();
  const nextCheck = new Date(now.getTime() + newIntervalMs);

  await supabase
    .from('monitoring_schedule_state')
    .update({
      last_check_at: now.toISOString(),
      next_check_at: nextCheck.toISOString(),
      consecutive_anomalies: isAnomaly ? currentState.consecutive_anomalies + 1 : 0,
      consecutive_normal: isAnomaly ? 0 : currentState.consecutive_normal + 1,
      is_anomaly_mode: isAnomaly || (currentState.consecutive_normal < 3 && currentState.is_anomaly_mode),
      current_interval_ms: newIntervalMs,
      backoff_multiplier: newBackoff,
      last_status: status,
      last_error: errorMessage || null,
      updated_at: now.toISOString()
    })
    .eq('check_type', checkType);
}

// =====================================================
// INIZIALIZZA SCHEDULER (prima esecuzione)
// =====================================================

export async function initializeScheduler(
  supabase: SupabaseClient
): Promise<void> {
  const checkTypes: CheckType[] = ['health', 'p2', 'p4', 'report'];

  for (const checkType of checkTypes) {
    const intervals = SCHEDULE_INTERVALS[checkType];

    const { error } = await supabase
      .from('monitoring_schedule_state')
      .upsert({
        check_type: checkType,
        base_interval_ms: intervals.base,
        anomaly_interval_ms: intervals.anomaly,
        current_interval_ms: intervals.base,
        backoff_multiplier: 1.0,
        consecutive_anomalies: 0,
        consecutive_normal: 0,
        is_anomaly_mode: false,
        last_check_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'check_type'
      });

    if (error) {
      console.error(`[Scheduler] Errore init ${checkType}:`, error);
    }
  }

  console.log('[Scheduler] Inizializzazione completata');
}

// =====================================================
// CALCOLA STATISTICHE SCHEDULER
// =====================================================

export interface SchedulerStats {
  totalChecksToday: number;
  anomalyModeActive: boolean;
  avgCheckInterval: number;
  nextScheduledChecks: Array<{
    type: CheckType;
    scheduledAt: string;
    isAnomaly: boolean;
  }>;
}

export async function getSchedulerStats(
  supabase: SupabaseClient
): Promise<SchedulerStats> {
  const states = await getScheduleStates(supabase);

  // Conta check nelle ultime 24h
  const { count: checksToday } = await supabase
    .from('system_metrics_12f')
    .select('*', { count: 'exact', head: true })
    .gte('measured_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  // Verifica se qualche check è in anomaly mode
  const anomalyModeActive = states.some(s => s.is_anomaly_mode);

  // Calcola intervallo medio corrente
  const avgInterval = states.length > 0
    ? states.reduce((sum, s) => sum + s.current_interval_ms, 0) / states.length
    : 0;

  // Prossimi check schedulati
  const nextChecks = states
    .filter(s => s.next_check_at)
    .map(s => ({
      type: s.check_type as CheckType,
      scheduledAt: s.next_check_at!,
      isAnomaly: s.is_anomaly_mode
    }))
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  return {
    totalChecksToday: checksToday || 0,
    anomalyModeActive,
    avgCheckInterval: avgInterval,
    nextScheduledChecks: nextChecks
  };
}

// =====================================================
// FORCE CHECK (bypass scheduler)
// =====================================================

export async function forceCheck(
  supabase: SupabaseClient,
  checkType: CheckType
): Promise<void> {
  await supabase
    .from('monitoring_schedule_state')
    .update({
      last_check_at: new Date(0).toISOString(), // Reset a epoch
      updated_at: new Date().toISOString()
    })
    .eq('check_type', checkType);

  console.log(`[Scheduler] Force check: ${checkType}`);
}

// =====================================================
// RESET ANOMALY MODE
// =====================================================

export async function resetAnomalyMode(
  supabase: SupabaseClient,
  checkType?: CheckType
): Promise<void> {
  const query = supabase
    .from('monitoring_schedule_state')
    .update({
      is_anomaly_mode: false,
      consecutive_anomalies: 0,
      backoff_multiplier: 1.0,
      updated_at: new Date().toISOString()
    });

  if (checkType) {
    await query.eq('check_type', checkType);
  } else {
    await query; // Reset tutti
  }

  console.log(`[Scheduler] Reset anomaly mode: ${checkType || 'all'}`);
}
