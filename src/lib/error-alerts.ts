/**
 * Error Alerts System
 *
 * Invia email automatiche quando si verificano errori critici in produzione.
 * Aiuta a identificare problemi prima che gli utenti li segnalino.
 */

import { Resend } from 'resend';

// Lazy init per evitare crash durante build (env vars non disponibili)
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error('RESEND_API_KEY non configurata');
    _resend = new Resend(apiKey);
  }
  return _resend;
}

// Email destinatario per gli alert (configura in .env)
const ALERT_EMAIL = process.env.ERROR_ALERT_EMAIL || 'fernando@vitaeology.com';
const FROM_EMAIL = 'alerts@vitaeology.com';

// Rate limiting: non inviare più di 10 email per tipo di errore all'ora
const errorCounts: Map<string, { count: number; resetAt: number }> = new Map();
const MAX_ALERTS_PER_HOUR = 10;

type ErrorSeverity = 'critical' | 'high' | 'medium' | 'low';

interface ErrorContext {
  userId?: string;
  userEmail?: string;
  endpoint?: string;
  requestBody?: unknown;
  headers?: Record<string, string>;
  stack?: string;
  // Monitoring context
  metric?: string;
  value?: number | null;
  threshold?: number;
}

interface ErrorAlert {
  type: string;
  message: string;
  severity: ErrorSeverity;
  context?: ErrorContext;
}

/**
 * Controlla se possiamo inviare un alert (rate limiting)
 */
function canSendAlert(errorType: string): boolean {
  const now = Date.now();
  const record = errorCounts.get(errorType);

  if (!record || now > record.resetAt) {
    errorCounts.set(errorType, { count: 1, resetAt: now + 3600000 }); // 1 ora
    return true;
  }

  if (record.count >= MAX_ALERTS_PER_HOUR) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Formatta il contesto dell'errore per l'email
 */
function formatContext(context?: ErrorContext): string {
  if (!context) return '';

  const parts: string[] = [];

  if (context.userId) {
    parts.push(`<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>User ID</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${context.userId}</td></tr>`);
  }

  if (context.userEmail) {
    parts.push(`<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${context.userEmail}</td></tr>`);
  }

  if (context.endpoint) {
    parts.push(`<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Endpoint</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${context.endpoint}</td></tr>`);
  }

  if (context.requestBody) {
    // Sanitizza campi sensibili prima di includere nel log
    const SENSITIVE_KEYS = ['password', 'token', 'api_key', 'apiKey', 'secret', 'authorization', 'credit_card', 'card_number', 'cvv', 'ssn'];
    const sanitize = (obj: unknown): unknown => {
      if (typeof obj === 'string') return obj;
      if (typeof obj !== 'object' || obj === null) return obj;
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        if (SENSITIVE_KEYS.some(sk => key.toLowerCase().includes(sk))) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    };
    const sanitizedBody = sanitize(context.requestBody);
    const bodyStr = typeof sanitizedBody === 'string'
      ? sanitizedBody
      : JSON.stringify(sanitizedBody, null, 2);
    parts.push(`<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Request Body</strong></td><td style="padding: 8px; border: 1px solid #ddd;"><pre style="margin: 0; white-space: pre-wrap;">${bodyStr.slice(0, 500)}</pre></td></tr>`);
  }

  if (context.stack) {
    parts.push(`<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Stack Trace</strong></td><td style="padding: 8px; border: 1px solid #ddd;"><pre style="margin: 0; font-size: 11px; white-space: pre-wrap;">${context.stack.slice(0, 1000)}</pre></td></tr>`);
  }

  if (parts.length === 0) return '';

  return `
    <h3 style="color: #333; margin-top: 20px;">Contesto</h3>
    <table style="border-collapse: collapse; width: 100%;">
      ${parts.join('')}
    </table>
  `;
}

/**
 * Ottiene il colore per la severity
 */
function getSeverityColor(severity: ErrorSeverity): string {
  switch (severity) {
    case 'critical': return '#DC2626'; // Rosso
    case 'high': return '#EA580C'; // Arancione
    case 'medium': return '#CA8A04'; // Giallo
    case 'low': return '#2563EB'; // Blu
  }
}

/**
 * Invia un alert email per un errore
 */
export async function sendErrorAlert(alert: ErrorAlert): Promise<boolean> {
  // Skip in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[ErrorAlert] Skipped in development:', alert.type);
    return false;
  }

  // Rate limiting
  if (!canSendAlert(alert.type)) {
    console.log(`[ErrorAlert] Rate limited: ${alert.type}`);
    return false;
  }

  const severityColor = getSeverityColor(alert.severity);
  const timestamp = new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; background: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

        <!-- Header -->
        <div style="background: ${severityColor}; color: white; padding: 20px;">
          <h1 style="margin: 0; font-size: 20px;">
            🚨 ${alert.severity.toUpperCase()}: ${alert.type}
          </h1>
        </div>

        <!-- Content -->
        <div style="padding: 20px;">
          <p style="color: #666; margin: 0 0 10px 0;">
            <strong>Timestamp:</strong> ${timestamp}
          </p>

          <div style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 4px; padding: 15px; margin: 15px 0;">
            <p style="margin: 0; color: #991B1B;">
              ${alert.message}
            </p>
          </div>

          ${formatContext(alert.context)}

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

          <p style="color: #666; font-size: 12px; margin: 0;">
            <a href="https://www.vitaeology.com/admin/health" style="color: #2563EB;">
              Vai al Health Dashboard →
            </a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: ALERT_EMAIL,
      subject: `[${alert.severity.toUpperCase()}] Vitaeology: ${alert.type}`,
      html
    });

    console.log(`[ErrorAlert] Sent: ${alert.type}`);
    return true;
  } catch (err) {
    console.error('[ErrorAlert] Failed to send:', err);
    return false;
  }
}

// ============================================================
// HELPER FUNCTIONS PER ERRORI COMUNI
// ============================================================

/**
 * Alert per errore database
 */
export async function alertDatabaseError(
  operation: string,
  error: Error,
  context?: Partial<ErrorContext>
): Promise<void> {
  await sendErrorAlert({
    type: 'Database Error',
    message: `Errore durante "${operation}": ${error.message}`,
    severity: 'critical',
    context: {
      ...context,
      stack: error.stack
    }
  });
}

/**
 * Alert per errore autenticazione
 */
export async function alertAuthError(
  error: Error,
  context?: Partial<ErrorContext>
): Promise<void> {
  await sendErrorAlert({
    type: 'Authentication Error',
    message: error.message,
    severity: 'high',
    context: {
      ...context,
      stack: error.stack
    }
  });
}

/**
 * Alert per errore pagamento
 */
export async function alertPaymentError(
  error: Error,
  context?: Partial<ErrorContext>
): Promise<void> {
  await sendErrorAlert({
    type: 'Payment Error',
    message: error.message,
    severity: 'critical',
    context: {
      ...context,
      stack: error.stack
    }
  });
}

/**
 * Alert per errore AI Coach
 */
export async function alertAICoachError(
  error: Error,
  context?: Partial<ErrorContext>
): Promise<void> {
  await sendErrorAlert({
    type: 'AI Coach Error',
    message: error.message,
    severity: 'medium',
    context: {
      ...context,
      stack: error.stack
    }
  });
}

/**
 * Alert per errore invio email
 */
export async function alertEmailError(
  error: Error,
  context?: Partial<ErrorContext>
): Promise<void> {
  await sendErrorAlert({
    type: 'Email Delivery Error',
    message: error.message,
    severity: 'high',
    context: {
      ...context,
      stack: error.stack
    }
  });
}

/**
 * Alert per errore generico API
 */
export async function alertAPIError(
  endpoint: string,
  error: Error,
  context?: Partial<ErrorContext>
): Promise<void> {
  await sendErrorAlert({
    type: 'API Error',
    message: `Errore su ${endpoint}: ${error.message}`,
    severity: 'medium',
    context: {
      ...context,
      endpoint,
      stack: error.stack
    }
  });
}

/**
 * Alert per rate limit raggiunto
 */
export async function alertRateLimitExceeded(
  resource: string,
  context?: Partial<ErrorContext>
): Promise<void> {
  await sendErrorAlert({
    type: 'Rate Limit Exceeded',
    message: `Rate limit raggiunto per: ${resource}`,
    severity: 'medium',
    context
  });
}

/**
 * Alert per sicurezza
 */
export async function alertSecurityIssue(
  issue: string,
  context?: Partial<ErrorContext>
): Promise<void> {
  await sendErrorAlert({
    type: 'Security Alert',
    message: issue,
    severity: 'critical',
    context
  });
}
