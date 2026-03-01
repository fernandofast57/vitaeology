/**
 * Notion Event Dispatcher
 *
 * Punto d'ingresso centralizzato per tutti gli eventi piattaforma
 * destinati al workspace Notion. Fire-and-forget: non blocca MAI
 * le operazioni utente.
 *
 * SICUREZZA: Ogni payload viene validato e sanitizzato PRIMA
 * dell'inserimento in coda. Nessun dato utente arriva a Notion
 * senza passare dal sanitizer.
 *
 * Pattern: Validate → Sanitize → Enqueue → Return immediately
 */

import { enqueueNotionEvent } from './queue';
import { NotionEventPayload, NotionEventType } from './types';
import { sanitizeEventPayload } from './sanitizer';
import { logSystem } from '@/lib/system-logger';

/**
 * Dispatcha un evento verso Notion (fire-and-forget).
 *
 * 1. Valida e sanitizza il payload (blocca dati malformati/pericolosi)
 * 2. Accoda in Supabase il payload pulito
 * 3. Ritorna immediatamente
 *
 * Sicuro da chiamare ovunque: mai blocca, mai lancia eccezioni.
 */
export async function dispatchNotionEvent(payload: NotionEventPayload): Promise<void> {
  try {
    // GATE DI SICUREZZA: valida e sanitizza prima di accodare
    const result = sanitizeEventPayload(payload);

    if (!result.valid || !result.payload) {
      // Payload rifiutato — log e scarta silenziosamente
      console.warn(`[NotionDispatcher] Payload rifiutato: ${result.error}`);

      logSystem({
        service: 'notion',
        action: `dispatch:rejected:${payload.eventType}`,
        status: 'error',
        message: `Payload rifiutato: ${result.error}`,
        metadata: { eventType: payload.eventType },
      }).catch(() => {});

      return;
    }

    // Accoda SOLO il payload sanitizzato
    await enqueueNotionEvent(result.payload);

    logSystem({
      service: 'notion',
      action: `dispatch:${result.payload.eventType}`,
      status: 'success',
      message: `Evento ${result.payload.eventType} accodato (sanitizzato)`,
      metadata: { eventId: result.payload.eventId },
    }).catch(() => {});

  } catch (error) {
    // MAI bloccare l'operazione utente per un fallimento Notion
    console.error('[NotionDispatcher] Errore enqueue:', error);

    logSystem({
      service: 'notion',
      action: `dispatch:${payload.eventType}`,
      status: 'error',
      message: `Errore enqueue ${payload.eventType}`,
      errorMessage: error instanceof Error ? error.message : 'Unknown',
      metadata: { eventId: payload.eventId },
    }).catch(() => {});
  }
}

/**
 * Helper per creare e dispatchare un evento con meno boilerplate.
 * Il payload viene validato e sanitizzato internamente da dispatchNotionEvent.
 */
export function createAndDispatch(
  eventType: NotionEventType,
  data: Record<string, unknown>
): void {
  dispatchNotionEvent({
    eventType,
    eventId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    data,
  }).catch(() => {});
}
