/**
 * Notion Sync Cron Job
 *
 * Processa la coda eventi Notion ogni 5 minuti.
 * Gestisce retry con backoff esponenziale e cleanup eventi completati.
 *
 * GET /api/cron/notion-sync — Vercel Cron automatico
 */

import { NextRequest, NextResponse } from 'next/server';
import { dequeueEvents, markCompleted, markFailed, cleanupCompletedEvents } from '@/lib/notion/queue';
import { processNotionEvent } from '@/lib/notion/processor';
import { QUEUE_BATCH_SIZE, NOTION_API_DELAY_MS, MAX_RETRY_ATTEMPTS } from '@/lib/notion/config';
import { logCronExecution, createTimer } from '@/lib/system-logger';
import { sendErrorAlert } from '@/lib/error-alerts';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  // Autenticazione CRON_SECRET
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  const timer = createTimer();

  try {
    // 1. Processa coda eventi
    const events = await dequeueEvents(QUEUE_BATCH_SIZE);
    let processed = 0;
    let errors = 0;

    for (const event of events) {
      try {
        await processNotionEvent(event.payload);
        await markCompleted(event.id, event.event_id, event.event_type);
        processed++;
      } catch (err) {
        errors++;
        const errorMsg = err instanceof Error ? err.message : 'Errore sconosciuto';
        await markFailed(event.id, errorMsg, event.attempts);

        // Alert per dead letters (ultimo tentativo fallito)
        if (event.attempts + 1 >= MAX_RETRY_ATTEMPTS) {
          sendErrorAlert({
            type: 'Notion Sync Dead Letter',
            message: `Evento ${event.event_type} (${event.event_id}) fallito dopo ${MAX_RETRY_ATTEMPTS} tentativi: ${errorMsg}`,
            severity: 'high',
            context: { endpoint: '/api/cron/notion-sync' },
          }).catch(() => {});
        }
      }

      // Rate limiting Notion API (max 3 req/s)
      await new Promise(resolve => setTimeout(resolve, NOTION_API_DELAY_MS));
    }

    // 2. Cleanup eventi completati (>7 giorni)
    const cleaned = await cleanupCompletedEvents();

    // 3. Log esecuzione
    const duration = timer();
    await logCronExecution('notion-sync', errors > 0 ? 'warning' : 'success', {
      message: `Processati ${processed}/${events.length}, errori: ${errors}, cleanup: ${cleaned}`,
      metadata: { processed, errors, total: events.length, cleaned },
      durationMs: duration,
    });

    return NextResponse.json({
      success: true,
      processed,
      errors,
      total: events.length,
      cleaned,
      durationMs: duration,
    });
  } catch (error) {
    const duration = timer();
    await logCronExecution('notion-sync', 'error', {
      error: error instanceof Error ? error : new Error('Errore sconosciuto'),
      durationMs: duration,
    });

    return NextResponse.json(
      { error: 'Errore interno', durationMs: duration },
      { status: 500 }
    );
  }
}
