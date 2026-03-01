/**
 * Configurazione Notion Integration
 *
 * Database IDs (da env vars), mappature agenti,
 * e costanti per l'integrazione con il Team Agentico.
 */

import { NotionAgent, NotionEventType } from './types';

// ============================================================================
// DATABASE IDS
// ============================================================================

export const NOTION_DATABASES = {
  pipeline: process.env.NOTION_DB_PIPELINE || '',
  tasks: process.env.NOTION_DB_TASKS || '',
  knowledgeBase: process.env.NOTION_DB_KNOWLEDGE_BASE || '',
  kpi: process.env.NOTION_DB_KPI || '',
} as const;

// ============================================================================
// AGENTI
// ============================================================================

export const NOTION_AGENTS: Record<NotionAgent, { name: string; role: string }> = {
  ALEX: { name: 'ALEX', role: 'Executive Assistant' },
  VITO: { name: 'VITO', role: 'Customer Support' },
  LUCA: { name: 'LUCA', role: 'Sales SDR' },
  DIANA: { name: 'DIANA', role: 'Business Intelligence' },
  OPS: { name: 'OPS', role: 'Orchestrator' },
  MARCO: { name: 'MARCO', role: 'IT/Infrastructure' },
};

// ============================================================================
// MAPPA EVENTO → AGENTE PRIMARIO
// ============================================================================

export const EVENT_AGENT_MAP: Record<NotionEventType, NotionAgent[]> = {
  challenge_subscribed: ['LUCA'],
  challenge_day_completed: ['DIANA'],
  challenge_completed: ['VITO', 'DIANA'],
  user_registered: ['LUCA'],
  assessment_completed: ['DIANA'],
  exercise_completed: ['DIANA'],
  book_purchased: ['ALEX', 'DIANA'],
  trilogy_purchased: ['ALEX', 'DIANA'],
  subscription_started: ['ALEX', 'DIANA'],
  subscription_upgraded: ['ALEX', 'DIANA'],
  subscription_cancelled: ['VITO'],
  payment_failed: ['ALEX'],
  beta_applied: ['OPS'],
  ai_coach_daily_summary: ['MARCO'],
  user_inactive: ['VITO'],
};

// ============================================================================
// RETRY / RATE LIMITING
// ============================================================================

/** Backoff esponenziale: 30s, 2m, 8m, 32m, 2h */
export const RETRY_DELAYS_MS = [30_000, 120_000, 480_000, 1_920_000, 7_200_000];

/** Tentativi massimi prima di dead_letter */
export const MAX_RETRY_ATTEMPTS = 5;

/** Pausa tra chiamate Notion (ms) per rispettare limite 3 req/s */
export const NOTION_API_DELAY_MS = 350;

/** Batch size per il cron processor */
export const QUEUE_BATCH_SIZE = 20;

/** Giorni dopo i quali pulire eventi completati */
export const CLEANUP_AFTER_DAYS = 7;
