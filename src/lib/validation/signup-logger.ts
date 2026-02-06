/**
 * Signup Attempt Logger
 *
 * Logga TUTTI i tentativi di registrazione per monitoring anti-spam.
 */

import { createClient } from '@supabase/supabase-js';

// Client con service role per bypassing RLS
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export type SignupSource = 'signup' | 'challenge' | 'affiliate' | 'beta' | 'contact' | 'forgot_password';

export interface SignupAttemptData {
  email: string;
  name?: string;
  ipAddress: string;
  userAgent?: string;

  // Risultati validazione
  turnstilePassed: boolean;
  emailValid: boolean;
  nameSuspicionScore: number;

  // Esito
  blocked: boolean;
  blockReason?: string;
  success: boolean;

  // Fonte
  source: SignupSource;

  // Extra metadata (UTM, etc.)
  metadata?: Record<string, unknown>;
}

/**
 * Logga un tentativo di signup
 */
export async function logSignupAttempt(data: SignupAttemptData): Promise<string | null> {
  const supabase = getServiceClient();

  const { data: inserted, error } = await supabase
    .from('signup_attempts')
    .insert({
      email: data.email.toLowerCase().trim(),
      name: data.name || null,
      ip_address: data.ipAddress,
      user_agent: data.userAgent || null,
      turnstile_passed: data.turnstilePassed,
      email_valid: data.emailValid,
      name_suspicion_score: data.nameSuspicionScore,
      blocked: data.blocked,
      block_reason: data.blockReason || null,
      success: data.success,
      source: data.source,
      metadata: data.metadata || {},
    })
    .select('id')
    .single();

  if (error) {
    console.error('Errore logging signup attempt:', error);
    return null;
  }

  return inserted?.id || null;
}

/**
 * Conta tentativi recenti da un IP
 */
export async function countRecentAttempts(
  ipAddress: string,
  minutesAgo: number = 60
): Promise<number> {
  const supabase = getServiceClient();
  const since = new Date(Date.now() - minutesAgo * 60 * 1000);

  const { count, error } = await supabase
    .from('signup_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ipAddress)
    .gte('created_at', since.toISOString());

  if (error) {
    console.error('Errore conteggio tentativi:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Conta tentativi bloccati recenti da un IP
 */
export async function countBlockedAttempts(
  ipAddress: string,
  minutesAgo: number = 60
): Promise<number> {
  const supabase = getServiceClient();
  const since = new Date(Date.now() - minutesAgo * 60 * 1000);

  const { count, error } = await supabase
    .from('signup_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ipAddress)
    .eq('blocked', true)
    .gte('created_at', since.toISOString());

  if (error) {
    return 0;
  }

  return count || 0;
}

/**
 * Verifica se un IP dovrebbe essere auto-bloccato
 * Criteri:
 * - >5 tentativi bloccati in 1 ora
 * - >10 tentativi totali in 1 ora
 */
export async function shouldAutoBlockIP(ipAddress: string): Promise<{ shouldBlock: boolean; reason?: string }> {
  const [blockedCount, totalCount] = await Promise.all([
    countBlockedAttempts(ipAddress, 60),
    countRecentAttempts(ipAddress, 60),
  ]);

  if (blockedCount >= 5) {
    return {
      shouldBlock: true,
      reason: `${blockedCount} tentativi bloccati nell'ultima ora`,
    };
  }

  if (totalCount >= 10) {
    return {
      shouldBlock: true,
      reason: `${totalCount} tentativi totali nell'ultima ora`,
    };
  }

  return { shouldBlock: false };
}
