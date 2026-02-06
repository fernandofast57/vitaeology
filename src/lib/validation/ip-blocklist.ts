/**
 * IP Blocklist System
 *
 * Gestisce blocco temporaneo di IP sospetti.
 * - Blocco MASSIMO 24h, poi auto-scade
 * - MAI blocco permanente automatico
 * - Usa Supabase per persistenza
 */

import { createClient } from '@supabase/supabase-js';

// Client con service role per bypassing RLS
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export interface BlockCheckResult {
  isBlocked: boolean;
  blockedUntil?: Date;
  reason?: string;
}

/**
 * Verifica se un IP è attualmente bloccato
 */
export async function isIPBlocked(ip: string): Promise<BlockCheckResult> {
  if (!ip || ip === 'unknown') {
    return { isBlocked: false };
  }

  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from('ip_blocklist')
    .select('blocked_until, reason')
    .eq('ip_address', ip)
    .gt('blocked_until', new Date().toISOString())
    .single();

  if (error || !data) {
    return { isBlocked: false };
  }

  return {
    isBlocked: true,
    blockedUntil: new Date(data.blocked_until),
    reason: data.reason,
  };
}

/**
 * Blocca un IP per N ore (default 24h, max 24h)
 *
 * @param ip IP da bloccare
 * @param reason Motivo del blocco
 * @param hours Durata in ore (max 24)
 * @param blockedBy Chi ha bloccato ('system' o 'admin')
 */
export async function blockIP(
  ip: string,
  reason: string,
  hours: number = 24,
  blockedBy: 'system' | 'admin' = 'system'
): Promise<boolean> {
  if (!ip || ip === 'unknown') {
    return false;
  }

  // Max 24h per blocchi automatici
  const safeHours = Math.min(hours, 24);

  const supabase = getServiceClient();
  const blockedUntil = new Date(Date.now() + safeHours * 60 * 60 * 1000);

  const { error } = await supabase
    .from('ip_blocklist')
    .upsert(
      {
        ip_address: ip,
        blocked_until: blockedUntil.toISOString(),
        reason,
        blocked_by: blockedBy,
        attempt_count: 1,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'ip_address',
        ignoreDuplicates: false,
      }
    );

  if (error) {
    console.error('Errore blocco IP:', error);
    return false;
  }

  return true;
}

/**
 * Sblocca un IP (solo admin)
 */
export async function unblockIP(ip: string): Promise<boolean> {
  const supabase = getServiceClient();

  const { error } = await supabase
    .from('ip_blocklist')
    .delete()
    .eq('ip_address', ip);

  return !error;
}

/**
 * Pulisce blocchi scaduti (chiamare periodicamente nel cron)
 */
export async function cleanupExpiredBlocks(): Promise<number> {
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from('ip_blocklist')
    .delete()
    .lt('blocked_until', new Date().toISOString())
    .select('id');

  if (error) {
    console.error('Errore pulizia IP blocklist:', error);
    return 0;
  }

  return data?.length ?? 0;
}

/**
 * Ritorna risposta HTTP per IP bloccato
 */
export function blockedIPResponse(): Response {
  return new Response(
    JSON.stringify({
      error: 'Troppe richieste. Riprova tra qualche minuto.',
      code: 'IP_BLOCKED',
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': '3600', // 1 ora
      },
    }
  );
}
