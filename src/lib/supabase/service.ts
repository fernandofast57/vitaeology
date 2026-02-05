/**
 * Supabase Service Role Client
 *
 * Client con SERVICE_ROLE_KEY che bypassa RLS.
 * Da usare SOLO in contesti server-side sicuri (API routes, cron jobs).
 *
 * ⚠️ NON usare mai client-side o esporre a utenti non autorizzati.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let serviceClient: SupabaseClient | null = null;

/**
 * Ottiene il client Supabase con service role (bypassa RLS)
 * Singleton per evitare creazione multipla
 */
export function getServiceClient(): SupabaseClient {
  if (!serviceClient) {
    serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return serviceClient;
}

// Alias per compatibilità con codice esistente
export const getSupabaseClient = getServiceClient;
