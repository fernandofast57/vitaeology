/**
 * Operazioni Task Operativi — Database Notion
 *
 * Creazione automatica di task per gli agenti del Team Agentico.
 * Agenti: ALEX (follow-up), VITO (re-engagement), OPS (revisioni)
 */

import { getNotionClient } from '../client';
import { NOTION_DATABASES } from '../config';
import { TaskData, TaskPriorita } from '../types';

/** Mappa priorita → emoji Notion */
const PRIORITY_EMOJI: Record<TaskPriorita, string> = {
  'Urgente': '🔴',
  'Alta': '🟠',
  'Media': '🟡',
  'Bassa': '⚪',
};

/**
 * Crea un nuovo Task Operativo nel database Notion.
 */
export async function createTask(data: TaskData): Promise<string> {
  const notion = getNotionClient();

  const priorityLabel = `${PRIORITY_EMOJI[data.priority]} ${data.priority}`;

  // eslint-disable-next-line
  const properties: Record<string, any> = {
    'Task': {
      title: [{ text: { content: data.title } }],
    },
    'Agente': {
      select: { name: data.assignedAgent },
    },
    'Priorità': {
      select: { name: priorityLabel },
    },
    'Stato': {
      select: { name: data.stato || 'Da fare' },
    },
    'Brand': {
      select: { name: data.brand || 'Vitaeology' },
    },
  };

  if (data.scadenza) {
    properties['Scadenza'] = {
      date: { start: data.scadenza.toISOString().split('T')[0] },
    };
  }

  if (data.descrizione) {
    properties['Descrizione'] = {
      rich_text: [{ text: { content: data.descrizione.substring(0, 2000) } }],
    };
  }

  const response = await notion.pages.create({
    parent: { database_id: NOTION_DATABASES.tasks },
    properties,
  });

  return response.id;
}

/**
 * Helper: calcola data scadenza (oggi + N giorni)
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
