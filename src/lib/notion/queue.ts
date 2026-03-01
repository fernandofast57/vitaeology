/**
 * Notion Event Queue
 *
 * Coda basata su Supabase per garantire resilienza e retry.
 * Pattern: enqueue (fire-and-forget) → process (cron) → complete/retry
 *
 * Tabelle: notion_event_queue, notion_processed_events
 */

import { getSupabaseClient } from '@/lib/supabase/service';
import { NotionEventPayload, QueueEntry } from './types';
import { RETRY_DELAYS_MS, MAX_RETRY_ATTEMPTS, CLEANUP_AFTER_DAYS } from './config';

/**
 * Accoda un evento per il processing asincrono.
 * Idempotente: skip silenzioso se evento gia processato o in coda.
 */
export async function enqueueNotionEvent(payload: NotionEventPayload): Promise<void> {
  const supabase = getSupabaseClient();

  // Idempotenza: check se gia processato
  const { data: processed } = await supabase
    .from('notion_processed_events')
    .select('id')
    .eq('event_id', payload.eventId)
    .maybeSingle();

  if (processed) return;

  // Check se gia in coda
  const { data: queued } = await supabase
    .from('notion_event_queue')
    .select('id')
    .eq('event_id', payload.eventId)
    .maybeSingle();

  if (queued) return;

  await supabase.from('notion_event_queue').insert({
    event_type: payload.eventType,
    event_id: payload.eventId,
    payload: payload,
    status: 'pending',
    next_retry_at: new Date().toISOString(),
  });
}

/**
 * Preleva un batch di eventi pronti per il processing.
 * Marca come 'processing' per evitare doppia esecuzione.
 */
export async function dequeueEvents(batchSize: number): Promise<QueueEntry[]> {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('notion_event_queue')
    .select('*')
    .in('status', ['pending', 'failed'])
    .lte('next_retry_at', now)
    .lt('attempts', MAX_RETRY_ATTEMPTS)
    .order('created_at', { ascending: true })
    .limit(batchSize);

  if (error || !data || data.length === 0) return [];

  // Optimistic lock: marca come processing
  const ids = data.map((d: QueueEntry) => d.id);
  await supabase
    .from('notion_event_queue')
    .update({ status: 'processing' })
    .in('id', ids);

  return data as QueueEntry[];
}

/**
 * Marca evento come completato e registra nella tabella idempotenza.
 */
export async function markCompleted(entryId: string, eventId: string, eventType: string): Promise<void> {
  const supabase = getSupabaseClient();

  await supabase.from('notion_event_queue').update({
    status: 'completed',
    completed_at: new Date().toISOString(),
  }).eq('id', entryId);

  // Registra nella tabella idempotenza
  await supabase.from('notion_processed_events').upsert({
    event_id: eventId,
    event_type: eventType,
    processed_at: new Date().toISOString(),
  }, { onConflict: 'event_id' });
}

/**
 * Marca evento come fallito con retry schedulato (backoff esponenziale).
 * Dopo MAX_RETRY_ATTEMPTS diventa dead_letter.
 */
export async function markFailed(entryId: string, errorMsg: string, currentAttempts: number): Promise<void> {
  const supabase = getSupabaseClient();
  const delayIndex = Math.min(currentAttempts, RETRY_DELAYS_MS.length - 1);
  const retryDelay = RETRY_DELAYS_MS[delayIndex];
  const nextRetry = new Date(Date.now() + retryDelay).toISOString();

  const newStatus = currentAttempts + 1 >= MAX_RETRY_ATTEMPTS ? 'dead_letter' : 'failed';

  await supabase.from('notion_event_queue').update({
    status: newStatus,
    attempts: currentAttempts + 1,
    last_error: errorMsg.substring(0, 500),
    next_retry_at: nextRetry,
  }).eq('id', entryId);
}

/**
 * Pulisce eventi completati piu vecchi di N giorni.
 * Ritorna il numero di record eliminati.
 */
export async function cleanupCompletedEvents(): Promise<number> {
  const supabase = getSupabaseClient();
  const cutoff = new Date(Date.now() - CLEANUP_AFTER_DAYS * 86_400_000).toISOString();

  const { data } = await supabase
    .from('notion_event_queue')
    .delete()
    .eq('status', 'completed')
    .lt('completed_at', cutoff)
    .select('id');

  return data?.length || 0;
}
