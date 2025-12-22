/**
 * Implicit Signals Service
 * Traccia segnali impliciti di soddisfazione/insoddisfazione utente
 * Include ciclo veloce per pattern detection automatico
 */

import { createClient } from '@/lib/supabase/server';
import { findOrCreatePattern, processPatternOccurrence } from './pattern-autocorrection';

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

/**
 * Mappa segnali impliciti a tipi di pattern per auto-correzione
 */
function mapSignalToPatternType(signal: SignalType): string {
  const mapping: Record<SignalType, string> = {
    'reformulated_question': 'reformulation_trigger',
    'abandoned_conversation': 'abandonment_trigger',
    'immediate_new_question': 'negative_feedback_cluster',
    'escalation_requested': 'abandonment_trigger',
    'long_pause_before_reply': 'reformulation_trigger',
    'completed_exercise': 'success_pattern',
    'skipped_exercise': 'abandonment_trigger',
    'returned_to_topic': 'success_pattern'
  };
  return mapping[signal] || 'negative_feedback_cluster';
}

/**
 * Estrae keywords significative da un testo (esclude stopwords italiane)
 */
function extractKeywordsFromText(text: string): string[] {
  const stopwords = new Set([
    'il', 'la', 'lo', 'i', 'gli', 'le', 'un', 'uno', 'una',
    'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra',
    'e', 'o', 'ma', 'se', 'che', 'chi', 'cui', 'non', 'più',
    'come', 'dove', 'quando', 'perché', 'cosa', 'quale', 'quali',
    'questo', 'questa', 'questi', 'queste', 'quello', 'quella',
    'sono', 'sei', 'è', 'siamo', 'siete', 'hanno', 'ho', 'hai', 'ha',
    'essere', 'avere', 'fare', 'dire', 'andare', 'venire', 'potere',
    'volere', 'dovere', 'sapere', 'vedere', 'stare', 'dare', 'anche',
    'solo', 'proprio', 'già', 'ancora', 'sempre', 'mai', 'ora', 'poi',
    'prima', 'dopo', 'molto', 'poco', 'tanto', 'tutto', 'ogni', 'altro',
    'stesso', 'nuovo', 'buono', 'grande', 'piccolo', 'bene', 'male'
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\sàèéìòù]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopwords.has(word));

  // Rimuovi duplicati e prendi max 5 keywords
  const uniqueWords = Array.from(new Set(words));
  return uniqueWords.slice(0, 5);
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

  // === CICLO VELOCE: PATTERN DETECTION PER SEGNALI NEGATIVI ===
  const negativeSignals: SignalType[] = [
    'reformulated_question',
    'abandoned_conversation',
    'immediate_new_question',
    'escalation_requested'
  ];

  if (negativeSignals.includes(params.signalType)) {
    try {
      const patternType = mapSignalToPatternType(params.signalType);
      const description = `Segnale implicito: ${params.signalType}`;
      const keywords = params.metadata?.previousMessage
        ? extractKeywordsFromText(params.metadata.previousMessage as string)
        : [params.signalType];

      const patternId = await findOrCreatePattern(
        patternType,
        description,
        keywords,
        params.conversationId
      );

      if (patternId) {
        await processPatternOccurrence(patternId);
      }
    } catch (err) {
      console.error('[ImplicitSignals] Error creating pattern:', err);
    }
  }
  // === FINE CICLO VELOCE ===

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
