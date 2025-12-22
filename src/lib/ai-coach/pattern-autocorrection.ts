/**
 * Pattern Auto-Correction Service
 * Gestisce il rilevamento pattern e auto-correzione basata su soglie
 */

import { createClient } from '@/lib/supabase/server';

// Soglia default per auto-correzione
const DEFAULT_THRESHOLD = 5;

interface Pattern {
  id: string;
  pattern_type: string;
  pattern_description: string;
  occurrence_count: number;
  auto_correct_threshold: number;
  status: string;
  suggested_action: string | null;
  example_conversation_ids?: string[];
}

interface AutoCorrectionResult {
  success: boolean;
  action: 'none' | 'flagged' | 'auto_corrected' | 'pending_review';
  message: string;
  patternId?: string;
}

/**
 * Incrementa contatore pattern e verifica se applicare auto-correzione
 */
export async function processPatternOccurrence(
  patternId: string
): Promise<AutoCorrectionResult> {
  const supabase = await createClient();

  // 1. Recupera pattern
  const { data: pattern, error } = await supabase
    .from('ai_coach_patterns')
    .select('*')
    .eq('id', patternId)
    .single();

  if (error || !pattern) {
    return {
      success: false,
      action: 'none',
      message: `Pattern non trovato: ${patternId}`
    };
  }

  // 2. Incrementa contatore
  const newCount = pattern.occurrence_count + 1;

  await supabase
    .from('ai_coach_patterns')
    .update({
      occurrence_count: newCount,
      last_occurrence: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', patternId);

  // 3. Verifica soglia
  const threshold = pattern.auto_correct_threshold || DEFAULT_THRESHOLD;

  if (newCount < threshold) {
    return {
      success: true,
      action: 'none',
      message: `Pattern count: ${newCount}/${threshold}`,
      patternId
    };
  }

  // 4. Soglia superata - applica auto-correzione
  if (pattern.status === 'identified') {
    return await applyAutoCorrection(pattern, supabase);
  }

  return {
    success: true,
    action: 'none',
    message: `Pattern già processato (status: ${pattern.status})`,
    patternId
  };
}

/**
 * Applica auto-correzione basata sul tipo di pattern
 */
async function applyAutoCorrection(
  pattern: Pattern,
  supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never
): Promise<AutoCorrectionResult> {

  let action: 'flagged' | 'auto_corrected' | 'pending_review' = 'pending_review';
  let appliedAction = '';

  switch (pattern.pattern_type) {
    case 'unanswered_question':
      // Flag per aggiunta contenuto RAG
      await supabase.from('ai_coach_pattern_corrections').insert({
        pattern_id: pattern.id,
        correction_type: 'rag_addition',
        suggested_content: `Aggiungere contenuto RAG per: ${pattern.pattern_description}`,
        status: 'pending',
        created_at: new Date().toISOString()
      });
      action = 'flagged';
      appliedAction = 'Flaggato per aggiunta contenuto RAG';
      break;

    case 'negative_feedback_cluster':
      // Suggerisci modifica prompt
      await supabase.from('ai_coach_pattern_corrections').insert({
        pattern_id: pattern.id,
        correction_type: 'prompt_modification',
        suggested_content: pattern.suggested_action || `Rivedere risposta per: ${pattern.pattern_description}`,
        status: 'pending',
        created_at: new Date().toISOString()
      });
      action = 'pending_review';
      appliedAction = 'Creata correzione prompt in attesa di review';
      break;

    case 'reformulation_trigger':
      // Auto-aggiungi esempio di chiarificazione
      await supabase.from('ai_coach_pattern_corrections').insert({
        pattern_id: pattern.id,
        correction_type: 'clarification_example',
        suggested_content: `Aggiungere esempio chiarificazione per: ${pattern.pattern_description}`,
        status: 'auto_approved',
        created_at: new Date().toISOString()
      });
      action = 'auto_corrected';
      appliedAction = 'Aggiunto esempio chiarificazione automaticamente';
      break;

    case 'abandonment_trigger':
      // Alta priorità - richiede review Fernando
      await supabase.from('ai_coach_pattern_corrections').insert({
        pattern_id: pattern.id,
        correction_type: 'critical_review',
        suggested_content: `URGENTE: Pattern abbandono rilevato - ${pattern.pattern_description}`,
        status: 'pending',
        priority: 'high',
        created_at: new Date().toISOString()
      });
      action = 'pending_review';
      appliedAction = 'Segnalato come critico per review immediata';
      break;

    case 'success_pattern':
      // Registra come best practice
      await supabase.from('ai_coach_pattern_corrections').insert({
        pattern_id: pattern.id,
        correction_type: 'best_practice',
        suggested_content: `Best practice identificata: ${pattern.pattern_description}`,
        status: 'auto_approved',
        created_at: new Date().toISOString()
      });
      action = 'auto_corrected';
      appliedAction = 'Registrato come best practice';
      break;

    default:
      action = 'pending_review';
      appliedAction = 'In attesa di review manuale';
  }

  // 5. Aggiorna stato pattern
  await supabase
    .from('ai_coach_patterns')
    .update({
      status: action === 'auto_corrected' ? 'auto_corrected' : 'pending_review',
      applied_action: appliedAction,
      updated_at: new Date().toISOString()
    })
    .eq('id', pattern.id);

  // 6. Log per report settimanale
  console.log(`[AutoCorrection] Pattern ${pattern.id}: ${action} - ${appliedAction}`);

  return {
    success: true,
    action,
    message: appliedAction,
    patternId: pattern.id
  };
}

/**
 * Crea nuovo pattern se non esiste, altrimenti incrementa
 */
export async function findOrCreatePattern(
  patternType: string,
  description: string,
  keywords: string[],
  conversationId?: string
): Promise<string> {
  const supabase = await createClient();

  // Cerca pattern esistente simile
  const { data: existing } = await supabase
    .from('ai_coach_patterns')
    .select('id, occurrence_count, example_conversation_ids')
    .eq('pattern_type', patternType)
    .ilike('pattern_description', `%${keywords[0]}%`)
    .eq('status', 'identified')
    .limit(1)
    .single();

  if (existing) {
    // Aggiorna pattern esistente
    const examples = existing.example_conversation_ids || [];
    if (conversationId && examples.length < 5) {
      examples.push(conversationId);
    }

    await supabase
      .from('ai_coach_patterns')
      .update({
        occurrence_count: existing.occurrence_count + 1,
        last_occurrence: new Date().toISOString(),
        example_conversation_ids: examples,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id);

    return existing.id;
  }

  // Crea nuovo pattern
  const { data: newPattern } = await supabase
    .from('ai_coach_patterns')
    .insert({
      pattern_type: patternType,
      pattern_description: description,
      pattern_keywords: keywords,
      occurrence_count: 1,
      example_conversation_ids: conversationId ? [conversationId] : [],
      status: 'identified',
      auto_correct_threshold: DEFAULT_THRESHOLD,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select('id')
    .single();

  return newPattern?.id || '';
}

/**
 * Recupera patterns che hanno superato la soglia e richiedono azione
 */
export async function getPatternsRequiringAction(): Promise<Pattern[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ai_coach_patterns')
    .select('*')
    .in('status', ['identified', 'pending_review'])
    .gte('occurrence_count', DEFAULT_THRESHOLD)
    .order('occurrence_count', { ascending: false });

  if (error) {
    console.error('[AutoCorrection] Error fetching patterns:', error);
    return [];
  }

  return data || [];
}

/**
 * Recupera statistiche pattern per report
 */
export async function getPatternStats(): Promise<{
  total: number;
  identified: number;
  pendingReview: number;
  autoCorrected: number;
  byType: Record<string, number>;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ai_coach_patterns')
    .select('status, pattern_type');

  if (error || !data) {
    return {
      total: 0,
      identified: 0,
      pendingReview: 0,
      autoCorrected: 0,
      byType: {}
    };
  }

  const byType: Record<string, number> = {};
  let identified = 0;
  let pendingReview = 0;
  let autoCorrected = 0;

  data.forEach(p => {
    // Count by status
    if (p.status === 'identified') identified++;
    else if (p.status === 'pending_review') pendingReview++;
    else if (p.status === 'auto_corrected') autoCorrected++;

    // Count by type
    byType[p.pattern_type] = (byType[p.pattern_type] || 0) + 1;
  });

  return {
    total: data.length,
    identified,
    pendingReview,
    autoCorrected,
    byType
  };
}
