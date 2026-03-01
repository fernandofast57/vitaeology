/**
 * Operazioni KPI Dashboard — Database Notion
 *
 * Gestisce metriche giornaliere aggregate.
 * Agente: DIANA (Business Intelligence)
 *
 * Pattern: upsert giornaliero — cerca il record del giorno,
 * se esiste incrementa, se no lo crea.
 */

import { getNotionClient } from '../client';
import { NOTION_DATABASES } from '../config';
import { KPITrend } from '../types';

/**
 * Cerca il record KPI per una metrica e periodo specifici.
 */
async function findKPIRecord(metrica: string, periodo: string): Promise<string | null> {
  const notion = getNotionClient();

  const response = await notion.dataSources.query({
    data_source_id: NOTION_DATABASES.kpi,
    filter: {
      and: [
        { property: 'Metrica', title: { equals: metrica } },
        { property: 'Periodo', rich_text: { equals: periodo } },
      ],
    },
    page_size: 1,
  });

  return response.results.length > 0 ? response.results[0].id : null;
}

/**
 * Crea o aggiorna un record KPI.
 * Se il record per metrica+periodo esiste, aggiorna il valore.
 * Se non esiste, lo crea.
 */
export async function upsertKPI(data: {
  metrica: string;
  valoreAttuale: number;
  target?: number;
  trend?: KPITrend;
  periodo: string;
  brand?: string;
}): Promise<void> {
  const notion = getNotionClient();
  const existingId = await findKPIRecord(data.metrica, data.periodo);

  // eslint-disable-next-line
  const properties: Record<string, any> = {
    'Metrica': {
      title: [{ text: { content: data.metrica } }],
    },
    'Valore Attuale': {
      number: data.valoreAttuale,
    },
    'Periodo': {
      rich_text: [{ text: { content: data.periodo } }],
    },
    'Brand': {
      select: { name: data.brand || 'Vitaeology' },
    },
  };

  if (data.target !== undefined) {
    properties['Target'] = { number: data.target };
  }

  if (data.trend) {
    properties['Trend'] = {
      select: { name: data.trend },
    };
  }

  if (existingId) {
    await notion.pages.update({
      page_id: existingId,
      properties,
    });
  } else {
    await notion.pages.create({
      parent: { database_id: NOTION_DATABASES.kpi },
      properties,
    });
  }
}

/**
 * Incrementa un contatore KPI giornaliero.
 * Se il record non esiste, lo crea con valore 1.
 * Se esiste, incrementa il valore attuale di `amount`.
 */
export async function incrementDailyKPI(
  metrica: string,
  amount: number = 1
): Promise<void> {
  const notion = getNotionClient();
  const oggi = new Date().toISOString().split('T')[0];
  const existingId = await findKPIRecord(metrica, oggi);

  if (existingId) {
    // Leggi valore attuale e incrementa
    const page = await notion.pages.retrieve({ page_id: existingId });
    const currentValue = extractNumber(page, 'Valore Attuale') || 0;

    await notion.pages.update({
      page_id: existingId,
      properties: {
        'Valore Attuale': { number: currentValue + amount },
      },
    });
  } else {
    await upsertKPI({
      metrica,
      valoreAttuale: amount,
      periodo: oggi,
    });
  }
}

/**
 * Estrae un numero da una proprieta Notion.
 */
function extractNumber(page: unknown, property: string): number | null {
  try {
    const p = page as Record<string, unknown>;
    const props = p.properties as Record<string, unknown>;
    const field = props[property] as Record<string, unknown>;
    return (field.number as number) ?? null;
  } catch {
    return null;
  }
}
