/**
 * AI Coach Learning System - Pattern Recognition
 * Ciclo Veloce: Identifica pattern dopo ogni conversazione
 */

import { getSupabaseClient } from '@/lib/supabase/service';
import { getOpenAIClient } from '@/lib/ai-clients';
import {
  AICoachPattern,
  PatternType,
  PatternStatus,
  ConversationAnalysis,
  PatternIdentificationResult,
  FastCycleResult,
} from '@/types/ai-coach-learning';

// Soglia per auto-correzione pattern
const AUTO_CORRECT_THRESHOLD = 5;

// Soglia similarità per considerare pattern simili
const SIMILARITY_THRESHOLD = 0.85;

/**
 * Genera embedding per testo usando OpenAI
 */
async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const openai = getOpenAIClient();
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.substring(0, 8000), // Limite caratteri
    });
    return response.data?.[0]?.embedding || null;
  } catch (error) {
    console.error('Errore generazione embedding:', error);
    return null;
  }
}

/**
 * Estrai keywords dal messaggio
 */
function extractKeywords(text: string): string[] {
  const stopwords = [
    'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una',
    'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra',
    'che', 'e', 'o', 'ma', 'se', 'come', 'quando', 'dove',
    'chi', 'cosa', 'quale', 'quanto', 'perché', 'non', 'sono',
    'ho', 'hai', 'ha', 'mi', 'ti', 'ci', 'vi', 'si', 'essere',
    'avere', 'fare', 'dire', 'andare', 'venire', 'potere', 'volere',
  ];

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopwords.includes(w))
    .slice(0, 10);
}

/**
 * Determina tipo di pattern basato sull'analisi
 */
function determinePatternType(analysis: ConversationAnalysis): PatternType {
  // Se c'e feedback negativo esplicito
  if (analysis.feedback && !analysis.feedback.isHelpful) {
    return 'negative_feedback_cluster';
  }

  // Se ci sono segnali di riformulazione
  const hasReformulation = analysis.implicitSignals.some(
    s => s.signal_type === 'reformulated_question'
  );
  if (hasReformulation) {
    return 'reformulation_trigger';
  }

  // Se c'e abbandono
  const hasAbandonment = analysis.implicitSignals.some(
    s => s.signal_type === 'abandoned_conversation'
  );
  if (hasAbandonment) {
    return 'abandonment_trigger';
  }

  // Se c'e feedback positivo
  if (analysis.feedback && analysis.feedback.isHelpful) {
    return 'success_pattern';
  }

  // Default: domanda potenzialmente senza risposta adeguata
  return 'unanswered_question';
}

/**
 * Cerca pattern simili esistenti
 */
async function findSimilarPattern(
  embedding: number[],
  patternType: PatternType
): Promise<AICoachPattern | null> {
  const supabase = getSupabaseClient();

  // Cerca pattern simili dello stesso tipo usando funzione RPC
  const { data, error } = await supabase.rpc('match_patterns', {
    query_embedding: embedding,
    match_threshold: SIMILARITY_THRESHOLD,
    match_count: 1,
    filter_type: patternType,
  });

  if (error) {
    // Se la funzione non esiste, fallback a query normale
    console.log('Funzione match_patterns non disponibile, uso fallback');
    const { data: patterns } = await supabase
      .from('ai_coach_patterns')
      .select('*')
      .eq('pattern_type', patternType)
      .in('status', ['identified', 'pending_review'])
      .order('occurrence_count', { ascending: false })
      .limit(5);

    return patterns?.[0] || null;
  }

  return data?.[0] || null;
}

/**
 * Crea nuovo pattern
 */
async function createPattern(
  analysis: ConversationAnalysis,
  patternType: PatternType,
  embedding: number[] | null
): Promise<AICoachPattern | null> {
  const supabase = getSupabaseClient();

  const keywords = extractKeywords(analysis.userMessage);

  const { data, error } = await supabase
    .from('ai_coach_patterns')
    .insert({
      pattern_type: patternType,
      pattern_description: `Conversazione: "${analysis.userMessage.substring(0, 200)}..."`,
      pattern_keywords: keywords,
      pattern_embedding: embedding,
      occurrence_count: 1,
      example_conversation_ids: [analysis.conversationId],
      status: 'identified' as PatternStatus,
      suggested_action: generateSuggestedAction(patternType, analysis),
    })
    .select()
    .single();

  if (error) {
    console.error('Errore creazione pattern:', error);
    return null;
  }

  return data;
}

/**
 * Incrementa contatore pattern esistente
 */
async function incrementPatternCount(
  patternId: string,
  conversationId: string
): Promise<AICoachPattern | null> {
  const supabase = getSupabaseClient();

  // Prima recupera il pattern per aggiungere la conversazione
  const { data: existing } = await supabase
    .from('ai_coach_patterns')
    .select('example_conversation_ids, occurrence_count, auto_correct_threshold')
    .eq('id', patternId)
    .single();

  const currentIds = existing?.example_conversation_ids || [];
  const newCount = (existing?.occurrence_count || 0) + 1;
  const threshold = existing?.auto_correct_threshold || AUTO_CORRECT_THRESHOLD;

  // Determina nuovo status basato sulla soglia
  let newStatus: PatternStatus = 'identified';
  if (newCount >= threshold) {
    newStatus = 'auto_corrected';
  } else if (newCount >= Math.floor(threshold / 2)) {
    newStatus = 'pending_review';
  }

  const { data, error } = await supabase
    .from('ai_coach_patterns')
    .update({
      occurrence_count: newCount,
      last_occurrence: new Date().toISOString(),
      example_conversation_ids: [...currentIds.slice(-9), conversationId], // Max 10 esempi
      status: newStatus,
    })
    .eq('id', patternId)
    .select()
    .single();

  if (error) {
    console.error('Errore aggiornamento pattern:', error);
    return null;
  }

  return data;
}

/**
 * Genera azione suggerita basata sul tipo di pattern
 */
function generateSuggestedAction(
  patternType: PatternType,
  analysis: ConversationAnalysis
): string {
  const keywords = extractKeywords(analysis.userMessage).join(', ');

  switch (patternType) {
    case 'unanswered_question':
      return `Aggiungere contenuto RAG per argomento: ${keywords}`;

    case 'negative_feedback_cluster':
      return `Rivedere tono/contenuto risposte su: ${keywords}`;

    case 'reformulation_trigger':
      return `Chiarire terminologia o approccio per: ${keywords}`;

    case 'abandonment_trigger':
      return `Migliorare engagement iniziale per: ${keywords}`;

    case 'success_pattern':
      return `Replicare approccio vincente per: ${keywords}`;

    default:
      return 'Analizzare manualmente';
  }
}

/**
 * Identifica pattern da una conversazione
 * Chiamato dopo ogni risposta AI
 */
export async function identifyPattern(
  analysis: ConversationAnalysis
): Promise<PatternIdentificationResult> {
  // Solo per feedback negativi o segnali espliciti
  const shouldAnalyze =
    (analysis.feedback && !analysis.feedback.isHelpful) ||
    analysis.implicitSignals.length > 0 ||
    (analysis.feedback && analysis.feedback.rating && analysis.feedback.rating <= 2);

  if (!shouldAnalyze) {
    return { pattern: null, isNew: false };
  }

  const patternType = determinePatternType(analysis);

  // Genera embedding del messaggio utente
  const embedding = await generateEmbedding(analysis.userMessage);

  // Cerca pattern simili
  let similarPattern: AICoachPattern | null = null;
  if (embedding) {
    similarPattern = await findSimilarPattern(embedding, patternType);
  }

  if (similarPattern) {
    // Pattern esistente: incrementa contatore
    const updated = await incrementPatternCount(
      similarPattern.id,
      analysis.conversationId
    );
    return {
      pattern: updated,
      isNew: false,
      similarity: SIMILARITY_THRESHOLD,
    };
  } else {
    // Nuovo pattern
    const newPattern = await createPattern(analysis, patternType, embedding);
    return {
      pattern: newPattern,
      isNew: true,
    };
  }
}

/**
 * Esegui ciclo veloce completo
 * Chiamato dopo ogni conversazione con feedback/segnali
 */
export async function runFastCycle(
  analysis: ConversationAnalysis
): Promise<FastCycleResult> {
  const result: FastCycleResult = {
    patternIdentified: false,
    autoCorrection: { applied: false },
    userMemoryUpdated: false,
  };

  try {
    // Identifica pattern
    const patternResult = await identifyPattern(analysis);

    if (patternResult.pattern) {
      result.patternIdentified = true;

      // Se pattern ha raggiunto soglia auto-correzione
      if (patternResult.pattern.status === 'auto_corrected') {
        result.autoCorrection = {
          applied: true,
          action: patternResult.pattern.suggested_action || undefined,
        };

        console.log(
          `Auto-correzione applicata per pattern ${patternResult.pattern.id}: ${patternResult.pattern.suggested_action}`
        );
      }
    }

    // TODO: Aggiornare memoria utente (FASE 7)

  } catch (error) {
    console.error('Errore ciclo veloce:', error);
  }

  return result;
}
