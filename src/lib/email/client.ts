/**
 * Resend Email Client - Factory Centralizzata
 *
 * Singleton per evitare creazione multipla di istanze Resend.
 * Da usare SOLO server-side (API routes, cron jobs, lib/).
 *
 * ⚠️ NON importare client-side - RESEND_API_KEY è server-only.
 */

import { Resend } from 'resend';

let _resend: Resend | null = null;

/**
 * Ottiene il client Resend (singleton)
 * Lazy initialization per evitare errori se RESEND_API_KEY non è configurata
 */
export function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}
