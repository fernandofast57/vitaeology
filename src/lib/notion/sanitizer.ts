/**
 * Sanitizzazione e Validazione Payload Notion
 *
 * Layer di protezione tra la piattaforma e la coda Notion.
 * Valida la struttura, sanitizza i dati utente e blocca
 * payload malformati o potenzialmente pericolosi.
 *
 * Principio: NESSUN dato utente arriva a Notion senza
 * passare da qui. Zero trust sull'input.
 */

import { NotionEventPayload, NotionEventType } from './types';

// ============================================================================
// SANITIZZAZIONE CAMPI
// ============================================================================

/** Regex per email valida (RFC 5322 semplificato) */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

/** Pattern pericolosi da rimuovere (XSS, injection) */
const DANGEROUS_PATTERNS = [
  /<script[\s>]/gi,
  /<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,          // onclick=, onerror=, etc.
  /data:\s*text\/html/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  /<form/gi,
  /&#x?[0-9a-f]+;/gi,    // HTML entities encoded
  /%3C/gi,                // URL-encoded <
  /%3E/gi,                // URL-encoded >
];

/**
 * Sanitizza una stringa: trim, rimuovi HTML/script injection, limita lunghezza.
 */
function sanitizeString(value: unknown, maxLength: number = 500): string {
  if (typeof value !== 'string') return '';
  let clean = value.trim();

  // Rimuovi pattern pericolosi
  for (const pattern of DANGEROUS_PATTERNS) {
    clean = clean.replace(pattern, '');
  }

  // Rimuovi tag HTML residui
  clean = clean.replace(/<[^>]*>/g, '');

  // Limita lunghezza
  return clean.substring(0, maxLength);
}

/**
 * Sanitizza e valida un'email.
 * Ritorna null se l'email non e' valida.
 */
function sanitizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const clean = value.trim().toLowerCase();

  if (clean.length > 254) return null;
  if (!EMAIL_REGEX.test(clean)) return null;

  return clean;
}

/**
 * Sanitizza un numero. Ritorna null se non e' un numero valido.
 */
function sanitizeNumber(value: unknown): number | null {
  if (typeof value === 'number' && isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (isFinite(parsed)) return parsed;
  }
  return null;
}

/**
 * Sanitizza un UUID. Ritorna null se non e' un UUID valido.
 */
function sanitizeUUID(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const clean = value.trim();
  // UUID v4 format
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean)) {
    return clean;
  }
  return null;
}

// ============================================================================
// VALIDAZIONE PER TIPO EVENTO
// ============================================================================

/**
 * Schema di validazione per ogni tipo di evento.
 * Definisce i campi accettati e li sanitizza.
 * Qualsiasi campo non nello schema viene RIMOSSO.
 */
type SanitizedData = Record<string, string | number>;

const EVENT_VALIDATORS: Record<NotionEventType, (data: Record<string, unknown>) => SanitizedData | null> = {

  challenge_subscribed: (data) => {
    const email = sanitizeEmail(data.email);
    if (!email) return null;
    return {
      email,
      nome: sanitizeString(data.nome, 100) || 'Lead',
      challengeType: sanitizeString(data.challengeType, 50),
    };
  },

  challenge_day_completed: (data) => {
    const email = sanitizeEmail(data.email);
    const dayNumber = sanitizeNumber(data.dayNumber);
    if (!email || dayNumber === null || dayNumber < 1 || dayNumber > 7) return null;
    return {
      email,
      challengeType: sanitizeString(data.challengeType, 50),
      dayNumber,
    };
  },

  challenge_completed: (data) => {
    const email = sanitizeEmail(data.email);
    if (!email) return null;
    return {
      email,
      challengeType: sanitizeString(data.challengeType, 50),
    };
  },

  user_registered: (data) => {
    const email = sanitizeEmail(data.email);
    if (!email) return null;
    return {
      email,
      userId: sanitizeUUID(data.userId) || sanitizeString(data.userId, 36),
    };
  },

  assessment_completed: (data) => {
    const email = sanitizeEmail(data.email);
    if (!email) return null;
    const assessmentType = sanitizeString(data.assessmentType, 50);
    if (!assessmentType) return null;
    return { email, assessmentType };
  },

  exercise_completed: (data) => {
    return {
      userId: sanitizeUUID(data.userId) || sanitizeString(data.userId, 36),
    };
  },

  book_purchased: (data) => {
    const email = sanitizeEmail(data.email);
    if (!email) return null;
    return {
      email,
      bookSlug: sanitizeString(data.bookSlug, 50),
    };
  },

  trilogy_purchased: (data) => {
    const email = sanitizeEmail(data.email);
    if (!email) return null;
    return { email };
  },

  subscription_started: (data) => {
    const email = sanitizeEmail(data.email);
    if (!email) return null;
    return {
      email,
      tier: sanitizeString(data.tier, 50),
    };
  },

  subscription_upgraded: (data) => {
    const email = sanitizeEmail(data.email);
    if (!email) return null;
    return {
      email,
      tier: sanitizeString(data.tier, 50),
    };
  },

  subscription_cancelled: (data) => {
    const email = sanitizeEmail(data.email);
    if (!email) return null;
    return {
      email,
      tier: sanitizeString(data.tier, 50),
    };
  },

  payment_failed: (data) => {
    const email = sanitizeEmail(data.email);
    if (!email) return null;
    return { email };
  },

  beta_applied: (data) => {
    const email = sanitizeEmail(data.email);
    if (!email) return null;
    return {
      email,
      fullName: sanitizeString(data.fullName, 100),
      motivation: sanitizeString(data.motivation, 500),
    };
  },

  ai_coach_daily_summary: (data) => {
    const totalSessions = sanitizeNumber(data.totalSessions);
    if (totalSessions === null || totalSessions < 0) return null;
    return { totalSessions };
  },

  user_inactive: (data) => {
    const email = sanitizeEmail(data.email);
    if (!email) return null;
    return { email };
  },
};

// ============================================================================
// ENTRY POINT
// ============================================================================

export interface SanitizeResult {
  valid: boolean;
  payload?: NotionEventPayload;
  error?: string;
}

/**
 * Valida e sanitizza un payload evento Notion.
 *
 * - Verifica che il tipo evento sia riconosciuto
 * - Applica lo schema di validazione specifico per quel tipo
 * - Sanitizza ogni campo (email, stringhe, numeri)
 * - RIMUOVE qualsiasi campo non previsto dallo schema
 * - Blocca payload con campi obbligatori mancanti o malformati
 */
export function sanitizeEventPayload(payload: NotionEventPayload): SanitizeResult {
  // 1. Verifica tipo evento
  const validator = EVENT_VALIDATORS[payload.eventType];
  if (!validator) {
    return { valid: false, error: `Tipo evento sconosciuto: ${payload.eventType}` };
  }

  // 2. Verifica eventId (deve essere UUID-like o stringa sicura)
  const eventId = sanitizeString(payload.eventId, 36);
  if (!eventId) {
    return { valid: false, error: 'eventId mancante o non valido' };
  }

  // 3. Verifica timestamp
  const timestamp = sanitizeString(payload.timestamp, 30);
  if (!timestamp || isNaN(Date.parse(timestamp))) {
    return { valid: false, error: 'timestamp mancante o non valido' };
  }

  // 4. Valida e sanitizza i dati specifici per tipo evento
  const sanitizedData = validator(payload.data);
  if (!sanitizedData) {
    return { valid: false, error: `Dati non validi per evento ${payload.eventType}` };
  }

  // 5. Ritorna payload pulito con SOLO i campi previsti
  return {
    valid: true,
    payload: {
      eventType: payload.eventType,
      eventId,
      timestamp,
      data: sanitizedData,
    },
  };
}
