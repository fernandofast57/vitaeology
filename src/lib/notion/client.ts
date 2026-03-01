/**
 * Notion Client Singleton
 *
 * Client @notionhq/client per operazioni sul workspace Notion.
 * Singleton pattern per evitare creazione multipla di client.
 * Da usare SOLO in contesti server-side (API routes, cron jobs).
 */

import { Client } from '@notionhq/client';

let notionClient: Client | null = null;

/**
 * Ottiene il client Notion API (singleton lazy-init)
 */
export function getNotionClient(): Client {
  if (!notionClient) {
    const token = process.env.NOTION_API_TOKEN;
    if (!token) {
      throw new Error('NOTION_API_TOKEN non configurato');
    }
    notionClient = new Client({
      auth: token,
      timeoutMs: 10000,
    });
  }
  return notionClient;
}
