/**
 * Notion Event Processor
 *
 * Riceve un evento dalla coda e lo smista alle operazioni
 * corrette sui database Notion (Pipeline, Tasks, KPI).
 */

import { NotionEventPayload } from './types';
import { createContact, updateContactStage, addContactNote, flagInactiveContact } from './operations/pipeline';
import { createTask, addDays } from './operations/tasks';
import { incrementDailyKPI } from './operations/kpi';

export async function processNotionEvent(payload: NotionEventPayload): Promise<void> {
  const { eventType, data } = payload;

  switch (eventType) {
    // ========================================================================
    // CHALLENGE
    // ========================================================================
    case 'challenge_subscribed': {
      await createContact({
        nome: (data.nome as string) || 'Lead',
        email: data.email as string,
        stato: 'Freddo',
        canale: 'Sito Web',
        agente: 'LUCA',
        fonte: `Challenge ${data.challengeType}`,
      });
      await incrementDailyKPI('Nuovi Lead');
      break;
    }

    case 'challenge_day_completed': {
      const dayNumber = data.dayNumber as number;
      if (dayNumber === 1) {
        // Primo giorno completato: lead si scalda
        await updateContactStage(data.email as string, 'Tiepido');
      }
      await addContactNote(
        data.email as string,
        `Challenge ${data.challengeType} — Giorno ${dayNumber} completato`
      );
      await incrementDailyKPI('Utenti Attivi');
      break;
    }

    case 'challenge_completed': {
      await updateContactStage(data.email as string, 'Caldo');
      await addContactNote(
        data.email as string,
        `Challenge ${data.challengeType} completata — pronto per assessment`
      );
      await createTask({
        title: `Onboarding post-challenge: ${data.email}`,
        assignedAgent: 'VITO',
        priority: 'Media',
        scadenza: addDays(new Date(), 2),
        descrizione: `Utente ha completato la challenge ${data.challengeType}. Follow-up per assessment.`,
        contattoEmail: data.email as string,
      });
      await incrementDailyKPI('Challenge Completate');
      break;
    }

    // ========================================================================
    // REGISTRAZIONE
    // ========================================================================
    case 'user_registered': {
      await updateContactStage(data.email as string, 'Tiepido', 'LUCA');
      await addContactNote(
        data.email as string,
        `Account creato (userId: ${(data.userId as string)?.substring(0, 8)}...)`
      );
      break;
    }

    // ========================================================================
    // ASSESSMENT
    // ========================================================================
    case 'assessment_completed': {
      await addContactNote(
        data.email as string,
        `Assessment ${data.assessmentType} completato`
      );
      await incrementDailyKPI('Assessment Completati');
      break;
    }

    // ========================================================================
    // ESERCIZI
    // ========================================================================
    case 'exercise_completed': {
      await incrementDailyKPI('Esercizi Completati');
      break;
    }

    // ========================================================================
    // ACQUISTI / PAGAMENTI
    // ========================================================================
    case 'book_purchased': {
      await updateContactStage(data.email as string, 'Convertito', 'ALEX');
      await addContactNote(
        data.email as string,
        `Libro acquistato: ${data.bookSlug}`
      );
      await incrementDailyKPI('Libri Venduti');
      break;
    }

    case 'trilogy_purchased': {
      await updateContactStage(data.email as string, 'Convertito', 'ALEX');
      await addContactNote(data.email as string, 'Trilogia acquistata');
      await incrementDailyKPI('Libri Venduti', 3);
      break;
    }

    case 'subscription_started': {
      await updateContactStage(data.email as string, 'Convertito', 'ALEX');
      await addContactNote(
        data.email as string,
        `Subscription ${data.tier} attivata`
      );
      await incrementDailyKPI('Nuovi Subscriber');
      break;
    }

    case 'subscription_upgraded': {
      await addContactNote(
        data.email as string,
        `Upgrade a ${data.tier}`
      );
      break;
    }

    case 'subscription_cancelled': {
      await addContactNote(data.email as string, 'Subscription cancellata');
      await createTask({
        title: `Win-back: ${data.email}`,
        assignedAgent: 'VITO',
        priority: 'Alta',
        scadenza: addDays(new Date(), 3),
        descrizione: `Utente ha cancellato subscription ${data.tier || ''}. Verificare motivo e proporre re-engagement.`,
        contattoEmail: data.email as string,
      });
      await incrementDailyKPI('Churn');
      break;
    }

    case 'payment_failed': {
      await addContactNote(data.email as string, 'Pagamento fallito');
      await createTask({
        title: `Follow-up pagamento fallito: ${data.email}`,
        assignedAgent: 'ALEX',
        priority: 'Urgente',
        scadenza: addDays(new Date(), 1),
        descrizione: 'Pagamento non riuscito. Contattare per risolvere.',
        contattoEmail: data.email as string,
      });
      break;
    }

    // ========================================================================
    // BETA
    // ========================================================================
    case 'beta_applied': {
      await createContact({
        nome: (data.fullName as string) || 'Beta Tester',
        email: data.email as string,
        stato: 'Tiepido',
        canale: 'Sito Web',
        agente: 'OPS',
        fonte: 'Beta Application',
        note: `Motivazione: ${(data.motivation as string)?.substring(0, 200) || 'N/A'}`,
      });
      await createTask({
        title: `Revisione beta: ${data.fullName || data.email}`,
        assignedAgent: 'OPS',
        priority: 'Media',
        descrizione: `Nuova candidatura beta tester. Email: ${data.email}`,
      });
      break;
    }

    // ========================================================================
    // AI COACH (aggregazione giornaliera)
    // ========================================================================
    case 'ai_coach_daily_summary': {
      await incrementDailyKPI(
        'Sessioni AI Coach',
        (data.totalSessions as number) || 0
      );
      break;
    }

    // ========================================================================
    // INATTIVITA
    // ========================================================================
    case 'user_inactive': {
      await flagInactiveContact(data.email as string);
      await createTask({
        title: `Re-engagement: ${data.email}`,
        assignedAgent: 'VITO',
        priority: 'Media',
        scadenza: addDays(new Date(), 5),
        descrizione: `Utente inattivo da 30+ giorni. Proporre re-engagement con approccio ARC.`,
        contattoEmail: data.email as string,
      });
      break;
    }

    default:
      console.warn(`[NotionProcessor] Evento non gestito: ${eventType}`);
  }
}
