/**
 * Operazioni Pipeline Contatti (CRM) — Database Notion
 *
 * Gestisce creazione e aggiornamento contatti nel CRM Notion.
 * Agenti coinvolti: LUCA (onboarding), ALEX (conversioni), VITO (re-engagement)
 */

import { getNotionClient } from '../client';
import { NOTION_DATABASES } from '../config';
import { PipelineStato, PipelineCanale, NotionAgent } from '../types';

/**
 * Cerca un contatto esistente per email nella Pipeline.
 * Ritorna il page_id se trovato, null altrimenti.
 */
async function findContactByEmail(email: string): Promise<string | null> {
  const notion = getNotionClient();

  const response = await notion.dataSources.query({
    data_source_id: NOTION_DATABASES.pipeline,
    filter: {
      property: 'Email',
      email: { equals: email },
    },
    page_size: 1,
  });

  return response.results.length > 0 ? response.results[0].id : null;
}

/**
 * Crea un nuovo contatto nella Pipeline Contatti.
 * Idempotente: se il contatto esiste gia, aggiorna invece di creare.
 */
export async function createContact(data: {
  nome: string;
  email: string;
  stato?: PipelineStato;
  canale?: PipelineCanale;
  agente?: NotionAgent;
  fonte?: string;
  note?: string;
}): Promise<string> {
  const existingId = await findContactByEmail(data.email);

  if (existingId) {
    // Contatto esiste gia: aggiorna nota
    if (data.note) {
      await addContactNote(data.email, data.note);
    }
    return existingId;
  }

  const notion = getNotionClient();

  const response = await notion.pages.create({
    parent: { database_id: NOTION_DATABASES.pipeline },
    properties: {
      'Nome': {
        title: [{ text: { content: data.nome } }],
      },
      'Email': {
        email: data.email,
      },
      'Stato': {
        select: { name: data.stato || 'Freddo' },
      },
      'Canale': {
        select: { name: data.canale || 'Sito Web' },
      },
      'Agente': {
        select: { name: data.agente || 'LUCA' },
      },
      'Ultimo Contatto': {
        date: { start: new Date().toISOString().split('T')[0] },
      },
      ...(data.fonte ? {
        'Fonte/Riferimento': {
          rich_text: [{ text: { content: data.fonte } }],
        },
      } : {}),
      ...(data.note ? {
        'Note': {
          rich_text: [{ text: { content: data.note } }],
        },
      } : {}),
    },
  });

  return response.id;
}

/**
 * Aggiorna lo stato di un contatto nella Pipeline.
 * Aggiorna anche 'Ultimo Contatto' alla data odierna.
 */
export async function updateContactStage(
  email: string,
  stato: PipelineStato,
  agente?: NotionAgent
): Promise<void> {
  const pageId = await findContactByEmail(email);
  if (!pageId) return;

  const notion = getNotionClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const properties: Record<string, any> = {
    'Stato': {
      select: { name: stato },
    },
    'Ultimo Contatto': {
      date: { start: new Date().toISOString().split('T')[0] },
    },
  };

  if (agente) {
    properties['Agente'] = { select: { name: agente } };
  }

  await notion.pages.update({
    page_id: pageId,
    properties,
  });
}

/**
 * Aggiunge una nota al contatto (append al campo Note esistente).
 */
export async function addContactNote(email: string, note: string): Promise<void> {
  const pageId = await findContactByEmail(email);
  if (!pageId) return;

  const notion = getNotionClient();

  // Leggi nota esistente
  const page = await notion.pages.retrieve({ page_id: pageId });
  const existingNote = extractRichText(page, 'Note');
  const timestamp = new Date().toISOString().split('T')[0];
  const newNote = existingNote
    ? `${existingNote}\n[${timestamp}] ${note}`
    : `[${timestamp}] ${note}`;

  await notion.pages.update({
    page_id: pageId,
    properties: {
      'Note': {
        rich_text: [{ text: { content: newNote.substring(0, 2000) } }],
      },
      'Ultimo Contatto': {
        date: { start: timestamp },
      },
    },
  });
}

/**
 * Marca un contatto come inattivo per re-engagement.
 */
export async function flagInactiveContact(email: string): Promise<void> {
  await addContactNote(email, 'Inattivo 30+ giorni — re-engagement necessario');
}

/**
 * Estrae testo da un campo rich_text di una pagina Notion.
 */
function extractRichText(page: unknown, property: string): string {
  try {
    const p = page as Record<string, unknown>;
    const props = p.properties as Record<string, unknown>;
    const field = props[property] as Record<string, unknown>;
    const richText = field.rich_text as Array<{ plain_text: string }>;
    return richText?.map(t => t.plain_text).join('') || '';
  } catch {
    return '';
  }
}
