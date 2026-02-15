/**
 * Sistema di Logging Centralizzato per Vitaeology
 *
 * Registra eventi di sistema nella tabella system_logs per:
 * - Esecuzioni cron
 * - Invio email
 * - Chiamate API
 * - Errori autenticazione
 * - Interazioni AI Coach
 */

import { getServiceClient } from '@/lib/supabase/service';

// Tipi supportati
type ServiceType = 'cron' | 'email' | 'api' | 'auth' | 'coach';
type StatusType = 'success' | 'error' | 'warning';

interface LogEntry {
  service: ServiceType;
  action: string;
  status: StatusType;
  statusCode?: number;
  message: string;
  metadata?: Record<string, unknown>;
  errorMessage?: string;
  errorStack?: string;
  durationMs?: number;
}

/**
 * Registra un evento nel sistema di logging
 */
export async function logSystem(entry: LogEntry): Promise<void> {
  try {
    const supabase = getServiceClient();

    const { error } = await supabase
      .from('system_logs')
      .insert({
        service: entry.service,
        action: entry.action,
        status: entry.status,
        status_code: entry.statusCode,
        message: entry.message,
        metadata: entry.metadata,
        error_message: entry.errorMessage,
        error_stack: entry.errorStack,
        duration_ms: entry.durationMs
      });

    if (error) {
      // Non bloccare l'esecuzione se il logging fallisce
      console.error('[SystemLogger] Failed to log:', error.message);
    }
  } catch (err) {
    // Fallback silenzioso - il logging non deve mai bloccare l'applicazione
    console.error('[SystemLogger] Error:', err instanceof Error ? err.message : 'Unknown error');
  }
}

/**
 * Wrapper per logging esecuzioni cron
 */
export async function logCronExecution(
  action: string,
  status: StatusType,
  details: {
    message?: string;
    metadata?: Record<string, unknown>;
    error?: Error;
    durationMs?: number;
  }
): Promise<void> {
  await logSystem({
    service: 'cron',
    action,
    status,
    message: details.message || `Cron ${action} ${status}`,
    metadata: details.metadata,
    errorMessage: details.error?.message,
    errorStack: details.error?.stack,
    durationMs: details.durationMs
  });
}

/**
 * Wrapper per logging invio email
 */
export async function logEmailSent(
  recipient: string,
  template: string,
  success: boolean,
  error?: Error
): Promise<void> {
  await logSystem({
    service: 'email',
    action: template,
    status: success ? 'success' : 'error',
    message: success
      ? `Email ${template} inviata a ${recipient}`
      : `Fallimento invio ${template} a ${recipient}`,
    metadata: { recipient, template },
    errorMessage: error?.message,
    errorStack: error?.stack
  });
}

/**
 * Wrapper per logging chiamate API
 */
export async function logApiCall(
  endpoint: string,
  status: StatusType,
  details: {
    statusCode?: number;
    message?: string;
    metadata?: Record<string, unknown>;
    error?: Error;
    durationMs?: number;
  }
): Promise<void> {
  await logSystem({
    service: 'api',
    action: endpoint,
    status,
    statusCode: details.statusCode,
    message: details.message || `API ${endpoint} ${status}`,
    metadata: details.metadata,
    errorMessage: details.error?.message,
    errorStack: details.error?.stack,
    durationMs: details.durationMs
  });
}

/**
 * Wrapper per logging AI Coach
 */
export async function logCoachInteraction(
  action: string,
  status: StatusType,
  details: {
    userId?: string;
    sessionId?: string;
    message?: string;
    metadata?: Record<string, unknown>;
    error?: Error;
    durationMs?: number;
  }
): Promise<void> {
  await logSystem({
    service: 'coach',
    action,
    status,
    message: details.message || `AI Coach ${action}`,
    metadata: {
      ...details.metadata,
      userId: details.userId,
      sessionId: details.sessionId
    },
    errorMessage: details.error?.message,
    errorStack: details.error?.stack,
    durationMs: details.durationMs
  });
}

/**
 * Wrapper per logging errori autenticazione
 */
export async function logAuthEvent(
  action: string,
  status: StatusType,
  details: {
    userId?: string;
    email?: string;
    message?: string;
    metadata?: Record<string, unknown>;
    error?: Error;
  }
): Promise<void> {
  await logSystem({
    service: 'auth',
    action,
    status,
    message: details.message || `Auth ${action} ${status}`,
    metadata: {
      ...details.metadata,
      userId: details.userId,
      email: details.email ? `${details.email.substring(0, 3)}***` : undefined // Obfuscate email
    },
    errorMessage: details.error?.message,
    errorStack: details.error?.stack
  });
}

/**
 * Helper per misurare durata esecuzione
 */
export function createTimer(): () => number {
  const start = Date.now();
  return () => Date.now() - start;
}
