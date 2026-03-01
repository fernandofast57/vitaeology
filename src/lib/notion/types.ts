/**
 * Tipi TypeScript per l'integrazione Notion
 *
 * Interfacce per eventi, operazioni e struttura dati
 * dei 4 database Notion del Team Agentico.
 */

// ============================================================================
// EVENTI
// ============================================================================

export type NotionEventType =
  | 'challenge_subscribed'
  | 'challenge_day_completed'
  | 'challenge_completed'
  | 'user_registered'
  | 'assessment_completed'
  | 'exercise_completed'
  | 'book_purchased'
  | 'trilogy_purchased'
  | 'subscription_started'
  | 'subscription_upgraded'
  | 'subscription_cancelled'
  | 'payment_failed'
  | 'beta_applied'
  | 'ai_coach_daily_summary'
  | 'user_inactive';

export interface NotionEventPayload {
  eventType: NotionEventType;
  eventId: string;
  timestamp: string;
  data: Record<string, unknown>;
}

// ============================================================================
// CODA
// ============================================================================

export type QueueStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'dead_letter';

export interface QueueEntry {
  id: string;
  event_type: string;
  event_id: string;
  payload: NotionEventPayload;
  status: QueueStatus;
  attempts: number;
  next_retry_at: string;
  last_error: string | null;
  created_at: string;
  completed_at: string | null;
}

// ============================================================================
// PIPELINE CONTATTI (CRM)
// ============================================================================

export type PipelineStato = 'Freddo' | 'Tiepido' | 'Caldo' | 'Convertito' | 'Perso';

export type PipelineCanale = 'LinkedIn' | 'WhatsApp' | 'Sito Web' | 'Referral' | 'Evento';

export interface PipelineContactData {
  nome: string;
  email: string;
  telefono?: string;
  stato: PipelineStato;
  canale: PipelineCanale;
  agente: NotionAgent;
  valoreStimato?: number;
  fonte?: string;
  note?: string;
}

// ============================================================================
// TASK OPERATIVI
// ============================================================================

export type TaskPriorita = 'Urgente' | 'Alta' | 'Media' | 'Bassa';
export type TaskStato = 'Da fare' | 'In corso' | 'Completato' | 'Bloccato';

export interface TaskData {
  title: string;
  assignedAgent: NotionAgent;
  priority: TaskPriorita;
  stato?: TaskStato;
  scadenza?: Date;
  brand?: string;
  descrizione?: string;
  contattoEmail?: string;
}

// ============================================================================
// KPI DASHBOARD
// ============================================================================

export type KPITrend = '↑' | '→' | '↓';

export interface KPIMetricData {
  metrica: string;
  valoreAttuale: number;
  target?: number;
  trend?: KPITrend;
  periodo: string;
  brand?: string;
}

// ============================================================================
// AGENTI
// ============================================================================

export type NotionAgent = 'ALEX' | 'VITO' | 'LUCA' | 'DIANA' | 'OPS' | 'MARCO';
