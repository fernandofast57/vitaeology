/**
 * Implicit Signals Service
 * Traccia segnali impliciti di soddisfazione/insoddisfazione utente
 */

import { createClient } from '@/lib/supabase/server';

export type SignalType =
  | 'reformulated_question'
  | 'abandoned_conversation'
  | 'long_pause_before_reply'
  | 'immediate_new_question'
  | 'completed_exercise'
  | 'skipped_exercise'
  | 'returned_to_topic'
  | 'escalation_requested';

interface TrackSignalParams {
  conversationId: string;
  userId: string;
  sessionId?: string;
  signalType: SignalType;
  metadata?: Record<string, unknown>;
}

export async function trackImplicitSignal(params: TrackSignalParams): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('ai_coach_implicit_signals')
    .insert({
      conversation_id: params.conversationId,
      user_id: params.userId,
      session_id: params.sessionId,
      signal_type: params.signalType,
      metadata: params.metadata || {}
    });

  if (error) {
    console.error('[ImplicitSignals] Error tracking:', error);
    return false;
  }

  return true;
}

export function detectReformulation(
  currentMessage: string,
  previousMessage: string,
  threshold: number = 0.6
): boolean {
  if (!previousMessage) return false;

  const words1 = new Set(currentMessage.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  const words2 = new Set(previousMessage.toLowerCase().split(/\s+/).filter(w => w.length > 3));

  if (words1.size === 0 || words2.size === 0) return false;

  const words1Array = Array.from(words1);
  const words2Array = Array.from(words2);
  const intersection = words1Array.filter(x => words2.has(x));
  const union = new Set([...words1Array, ...words2Array]);

  const similarity = intersection.length / union.size;
  return similarity >= threshold;
}

export function detectImmediateQuestion(lastMessageTimestamp: Date): boolean {
  const now = new Date();
  const diffSeconds = (now.getTime() - lastMessageTimestamp.getTime()) / 1000;
  return diffSeconds < 30;
}
