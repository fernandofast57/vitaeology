/**
 * AI Coach Learning System Types
 * Framework: 4 Prodotti / 12 Fattori
 *
 * Prodotto 1: Istituzione (prompt, RAG, configurazione)
 * Prodotto 2: Prodotto Generato (risposte AI)
 * Prodotto 3: Riparazione Istituzione (miglioramenti settimanali)
 * Prodotto 4: Correzione Prodotto (real-time fixes)
 */

// =============================================
// ENUM TYPES
// =============================================

export type PathType = 'leadership' | 'problemi' | 'benessere';

export type SignalType =
  | 'reformulated_question'     // utente ha riformulato la domanda
  | 'abandoned_conversation'    // utente ha abbandonato senza risposta
  | 'long_pause_before_reply'   // >5 minuti prima di rispondere
  | 'immediate_new_question'    // nuova domanda <30 sec
  | 'completed_exercise'        // ha completato esercizio dopo supporto
  | 'skipped_exercise'          // ha saltato esercizio dopo supporto
  | 'returned_to_topic'         // è tornato su stesso argomento
  | 'escalation_requested';     // ha chiesto di parlare con umano

export type PatternType =
  | 'unanswered_question'       // domanda frequente senza buona risposta
  | 'negative_feedback_cluster' // cluster di feedback negativi simili
  | 'reformulation_trigger'     // trigger che causa riformulazione
  | 'abandonment_trigger'       // trigger che causa abbandono
  | 'success_pattern';          // pattern che genera feedback positivo

export type PatternStatus =
  | 'identified'      // identificato, non ancora processato
  | 'auto_corrected'  // corretto automaticamente (soglia superata)
  | 'pending_review'  // in attesa revisione Fernando
  | 'approved'        // approvato e implementato
  | 'rejected'        // rifiutato
  | 'resolved';       // risolto (non più ricorrente)

export type FeedbackCategory =
  | 'non_pertinente'
  | 'troppo_generico'
  | 'troppo_lungo'
  | 'tono_sbagliato'
  | 'non_validante'
  | 'confuso'
  | 'altro';

export type RAGSuggestionStatus = 'pending' | 'approved' | 'implemented' | 'rejected';

export type WeeklyReportStatus = 'pending' | 'reviewed' | 'actioned';

export type CommunicationStyle = 'diretto' | 'elaborato' | 'esempi_pratici';

export type ResponseLength = 'breve' | 'medio' | 'dettagliato';

// =============================================
// DATABASE ENTITY TYPES
// =============================================

/**
 * Conversazione con AI Coach
 * Prodotto 2: Quantità conversazioni
 */
export interface AICoachConversation {
  id: string;
  user_id: string;
  session_id: string;
  current_path: PathType | null;
  exercise_id: number | null;
  user_message: string;
  user_message_tokens: number | null;
  ai_response: string;
  ai_response_tokens: number | null;
  rag_chunks_used: string[] | null;
  rag_similarity_scores: number[] | null;
  response_time_ms: number | null;
  created_at: string;
}

/**
 * Feedback esplicito utente
 * Prodotto 4: Input per correzione
 */
export interface AICoachFeedback {
  id: string;
  conversation_id: string;
  user_id: string;
  rating: number | null;       // 1-5
  is_helpful: boolean | null;  // 👍 true, 👎 false
  comment: string | null;
  issue_category: FeedbackCategory | null;
  created_at: string;
}

/**
 * Segnale implicito comportamento
 * Prodotto 4: Input per correzione
 */
export interface AICoachImplicitSignal {
  id: string;
  conversation_id: string;
  user_id: string;
  session_id: string;
  signal_type: SignalType;
  metadata: Record<string, unknown>;
  created_at: string;
}

/**
 * Pattern identificato
 * Prodotto 4: Correzione automatica
 */
export interface AICoachPattern {
  id: string;
  pattern_type: PatternType;
  pattern_description: string;
  pattern_keywords: string[] | null;
  pattern_embedding: number[] | null;  // vector(1536)
  occurrence_count: number;
  first_occurrence: string;
  last_occurrence: string;
  example_conversation_ids: string[] | null;
  status: PatternStatus;
  suggested_action: string | null;
  applied_action: string | null;
  auto_correct_threshold: number;
  created_at: string;
  updated_at: string;
}

/**
 * Versione prompt system
 * Prodotto 1/3: Istituzione e riparazioni
 */
export interface AICoachPromptVersion {
  id: string;
  version_number: number;
  version_label: string | null;
  system_prompt: string;
  changes_description: string | null;
  changes_reason: string | null;
  source_pattern_id: string | null;
  is_active: boolean;
  metrics_before: MetricsSnapshot | null;
  metrics_after: MetricsSnapshot | null;
  approved_by: string | null;  // 'auto' o 'fernando'
  approved_at: string | null;
  created_at: string;
}

/**
 * Suggerimento per nuovo chunk RAG
 * Prodotto 3: Riparazione Istituzione
 */
export interface AICoachRAGSuggestion {
  id: string;
  source_pattern_id: string | null;
  source_conversation_ids: string[] | null;
  suggested_content: string;
  suggested_keywords: string[] | null;
  suggested_book: PathType | null;
  status: RAGSuggestionStatus;
  implemented_chunk_id: string | null;
  created_at: string;
  reviewed_at: string | null;
  implemented_at: string | null;
}

/**
 * Metriche giornaliere aggregate
 * 12 Fattori: Quantità/Qualità/Viability
 */
export interface AICoachMetricsDaily {
  id: string;
  date: string;

  // PRODOTTO 1: ISTITUZIONE
  p1_quantity_components: number | null;
  p1_quality_principle_adherence: number | null;  // 0-1
  p1_viability_api_cost: number | null;           // EUR
  p1_viability_avg_response_time: number | null;  // ms

  // PRODOTTO 2: PRODOTTO GENERATO
  p2_quantity_conversations: number | null;
  p2_quantity_messages: number | null;
  p2_quality_avg_rating: number | null;           // 1-5
  p2_quality_helpful_ratio: number | null;        // 0-1
  p2_viability_exercise_completion_rate: number | null;  // 0-1
  p2_viability_user_return_rate: number | null;   // 0-1

  // PRODOTTO 3: RIPARAZIONE
  p3_quantity_improvements: number | null;
  p3_quality_improvement_effectiveness: number | null;  // 0-1
  p3_viability_avg_implementation_time: number | null;  // hours

  // PRODOTTO 4: CORREZIONE
  p4_quantity_patterns_corrected: number | null;
  p4_quality_error_reduction_rate: number | null;  // 0-1
  p4_viability_prevention_rate: number | null;     // 0-1

  created_at: string;
}

/**
 * Report settimanale
 * Prodotto 3: Output per revisione Fernando
 */
export interface AICoachWeeklyReport {
  id: string;
  week_start: string;
  week_end: string;
  report_content: WeeklyReportContent;
  status: WeeklyReportStatus;
  actions_taken: ReportAction[] | null;
  created_at: string;
  reviewed_at: string | null;
}

/**
 * Memoria per-utente
 * Prodotto 2 Viability: Personalizzazione
 */
export interface AICoachUserMemory {
  id: string;
  user_id: string;
  communication_style: CommunicationStyle | null;
  preferred_response_length: ResponseLength | null;
  common_challenges: string[] | null;
  successful_approaches: string[] | null;
  trigger_topics: string[] | null;
  key_context: UserKeyContext;
  coach_notes: string[] | null;
  created_at: string;
  updated_at: string;
}

// =============================================
// HELPER TYPES
// =============================================

/**
 * Snapshot metriche (per confronto pre/post)
 */
export interface MetricsSnapshot {
  avg_rating?: number;
  helpful_ratio?: number;
  conversations_count?: number;
  [key: string]: number | undefined;
}

/**
 * Contenuto report settimanale
 */
export interface WeeklyReportContent {
  summary: {
    total_conversations: number;
    avg_rating: number;
    trend_vs_last_week: string;
    highlight?: string;
  };
  top_issues: TopIssue[];
  suggested_prompt_changes: PromptSuggestion[];
  suggested_rag_additions: RAGAdditionSuggestion[];
  metrics_12_factors: Partial<AICoachMetricsDaily>;
  comparison_last_week: WeekComparison;
}

export interface TopIssue {
  description: string;
  count: number;
  impact?: string;
  suggested_fix: string | null;
  pattern_id?: string;
}

export interface PromptSuggestion {
  change: string;
  reason: string;
  expected_impact: string;
  confidence?: number;
  pattern_id?: string;
}

export interface RAGAdditionSuggestion {
  content: string;
  keywords: string[];
  reason: string;
  book?: PathType;
}

export interface WeekComparison {
  rating_trend: string;       // "+0.3" or "-0.1"
  conversations_trend: string;
  helpful_ratio_trend: string;
  [key: string]: string;
}

export interface ReportAction {
  action_type: 'approve_prompt' | 'reject_prompt' | 'approve_rag' | 'reject_rag' | 'manual_fix';
  target_id: string;
  notes?: string;
  actioned_at: string;
}

/**
 * Contesto chiave utente (persistente)
 */
export interface UserKeyContext {
  azienda?: string;
  ruolo?: string;
  team_size?: number;
  sfida_principale?: string;
  punto_forza?: string;
  [key: string]: string | number | undefined;
}

// =============================================
// INPUT TYPES (per API)
// =============================================

/**
 * Input per creare conversazione
 */
export interface CreateConversationInput {
  user_id: string;
  session_id: string;
  current_path?: PathType;
  exercise_id?: number;
  user_message: string;
  ai_response: string;
  user_message_tokens?: number;
  ai_response_tokens?: number;
  rag_chunks_used?: string[];
  rag_similarity_scores?: number[];
  response_time_ms?: number;
}

/**
 * Input per feedback
 */
export interface CreateFeedbackInput {
  conversation_id: string;
  user_id: string;
  is_helpful: boolean;
  rating?: number;
  comment?: string;
  issue_category?: FeedbackCategory;
}

/**
 * Input per segnale implicito
 */
export interface CreateSignalInput {
  conversation_id: string;
  user_id: string;
  session_id: string;
  signal_type: SignalType;
  metadata?: Record<string, unknown>;
}

/**
 * Input per creare pattern
 */
export interface CreatePatternInput {
  pattern_type: PatternType;
  pattern_description: string;
  pattern_keywords?: string[];
  pattern_embedding?: number[];
  example_conversation_ids?: string[];
  suggested_action?: string;
}

/**
 * Analisi conversazione (per ciclo veloce)
 */
export interface ConversationAnalysis {
  conversationId: string;
  userId: string;
  sessionId: string;
  userMessage: string;
  aiResponse: string;
  currentPath?: PathType;
  feedback?: {
    isHelpful: boolean;
    rating?: number;
    comment?: string;
  };
  implicitSignals: AICoachImplicitSignal[];
}

/**
 * Aggiornamento memoria utente
 */
export interface UpdateUserMemoryInput {
  communication_style?: CommunicationStyle;
  preferred_response_length?: ResponseLength;
  common_challenges?: string[];
  successful_approaches?: string[];
  trigger_topics?: string[];
  key_context?: Partial<UserKeyContext>;
  coach_notes?: string[];
}

// =============================================
// RESPONSE TYPES
// =============================================

/**
 * Risultato identificazione pattern
 */
export interface PatternIdentificationResult {
  pattern: AICoachPattern | null;
  isNew: boolean;
  similarity?: number;
}

/**
 * Risultato ciclo veloce
 */
export interface FastCycleResult {
  patternIdentified: boolean;
  autoCorrection: {
    applied: boolean;
    action?: string;
  };
  userMemoryUpdated: boolean;
}

/**
 * Risultato generazione report
 */
export interface WeeklyReportResult {
  report: AICoachWeeklyReport;
  emailSent: boolean;
}
