/**
 * Template Email per Beta Tester Vitaeology
 *
 * Gestisce le email relative al programma beta:
 * - Benvenuto (approvazione automatica)
 * - Waitlist (se posti esauriti)
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================================
// TIPI
// ============================================================

export interface BetaWelcomeEmailParams {
  email: string;
  fullName: string;
  cohort?: string;
}

export interface BetaWaitlistEmailParams {
  email: string;
  fullName: string;
  position: number;
}

interface EmailResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

// ============================================================
// CONFIGURAZIONE
// ============================================================

const FROM_EMAIL = 'Fernando <fernando@vitaeology.com>';
const REPLY_TO = 'fernando@vitaeology.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.vitaeology.com';

// ============================================================
// EMAIL: BENVENUTO BETA TESTER
// ============================================================

export async function sendBetaWelcomeEmail(params: BetaWelcomeEmailParams): Promise<EmailResult> {
  const { email, fullName } = params;
  const firstName = fullName.split(' ')[0];

  const subject = `Benvenuto tra i Founding Tester di Vitaeology!`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0A2540 0%, #1a3a5c 100%); padding: 40px 40px 30px; text-align: center;">
              <img src="${APP_URL}/logo-white.svg" alt="Vitaeology" width="180" style="margin-bottom: 20px;">
              <h1 style="color: #F4B942; font-size: 28px; margin: 0; font-weight: 700;">
                Sei dentro!
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="font-size: 18px; color: #1a1a1a; margin: 0 0 20px;">
                Ciao <strong>${firstName}</strong>,
              </p>

              <p style="font-size: 16px; color: #4a4a4a; line-height: 1.6; margin: 0 0 20px;">
                Congratulazioni! Sei stato selezionato come <strong style="color: #D4AF37;">Founding Tester</strong> di Vitaeology.
              </p>

              <p style="font-size: 16px; color: #4a4a4a; line-height: 1.6; margin: 0 0 25px;">
                Come Founding Tester, avrai:
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 25px;">
                <tr>
                  <td style="padding: 12px 15px; background-color: #f8f9fa; border-radius: 8px; margin-bottom: 8px;">
                    <span style="color: #D4AF37; font-size: 18px; margin-right: 10px;">&#10003;</span>
                    <span style="color: #1a1a1a; font-size: 15px;"><strong>6-12 mesi di accesso gratuito</strong> a tutte le funzionalit&agrave;</span>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                  <td style="padding: 12px 15px; background-color: #f8f9fa; border-radius: 8px;">
                    <span style="color: #D4AF37; font-size: 18px; margin-right: 10px;">&#10003;</span>
                    <span style="color: #1a1a1a; font-size: 15px;"><strong>Badge Founding Tester</strong> permanente sul tuo profilo</span>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                  <td style="padding: 12px 15px; background-color: #f8f9fa; border-radius: 8px;">
                    <span style="color: #D4AF37; font-size: 18px; margin-right: 10px;">&#10003;</span>
                    <span style="color: #1a1a1a; font-size: 15px;"><strong>Sconto esclusivo</strong> al lancio ufficiale</span>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                  <td style="padding: 12px 15px; background-color: #f8f9fa; border-radius: 8px;">
                    <span style="color: #D4AF37; font-size: 18px; margin-right: 10px;">&#10003;</span>
                    <span style="color: #1a1a1a; font-size: 15px;"><strong>Accesso diretto</strong> al team per feedback e suggerimenti</span>
                  </td>
                </tr>
              </table>

              <p style="font-size: 16px; color: #4a4a4a; line-height: 1.6; margin: 0 0 30px;">
                Il prossimo passo &egrave; semplice: <strong>crea il tuo account</strong> usando questa email (${email}) e inizia subito il tuo percorso di leadership.
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${APP_URL}/auth/signup?email=${encodeURIComponent(email)}&beta=true"
                       style="display: inline-block; background-color: #F4B942; color: #0A2540; font-size: 16px; font-weight: 700; text-decoration: none; padding: 16px 40px; border-radius: 8px;">
                      Crea il Tuo Account
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 14px; color: #888; text-align: center; margin: 25px 0 0;">
                Usa l'email <strong>${email}</strong> per registrarti
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 25px 40px; border-top: 1px solid #eee;">
              <p style="font-size: 14px; color: #666; margin: 0 0 10px; text-align: center;">
                Hai domande? Rispondi direttamente a questa email.
              </p>
              <p style="font-size: 13px; color: #999; margin: 0; text-align: center;">
                &copy; 2026 Vitaeology. Tutti i diritti riservati.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      replyTo: REPLY_TO,
      subject,
      html,
    });

    if (error) {
      console.error('[Beta Email] Errore invio welcome:', error);
      return { success: false, error: error.message };
    }

    console.log('[Beta Email] Welcome inviata a:', email);
    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error('[Beta Email] Errore critico:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Errore sconosciuto' };
  }
}

// ============================================================
// EMAIL: WAITLIST (posti esauriti)
// ============================================================

export async function sendBetaWaitlistEmail(params: BetaWaitlistEmailParams): Promise<EmailResult> {
  const { email, fullName, position } = params;
  const firstName = fullName.split(' ')[0];

  const subject = `Sei in lista d'attesa per Vitaeology`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0A2540 0%, #1a3a5c 100%); padding: 40px 40px 30px; text-align: center;">
              <img src="${APP_URL}/logo-white.svg" alt="Vitaeology" width="180" style="margin-bottom: 20px;">
              <h1 style="color: #ffffff; font-size: 24px; margin: 0; font-weight: 700;">
                Candidatura Ricevuta
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="font-size: 18px; color: #1a1a1a; margin: 0 0 20px;">
                Ciao <strong>${firstName}</strong>,
              </p>

              <p style="font-size: 16px; color: #4a4a4a; line-height: 1.6; margin: 0 0 20px;">
                Grazie per il tuo interesse nel programma Founding Tester di Vitaeology!
              </p>

              <p style="font-size: 16px; color: #4a4a4a; line-height: 1.6; margin: 0 0 20px;">
                Al momento tutti i posti disponibili sono stati assegnati, ma ti abbiamo inserito nella <strong>lista d'attesa</strong>.
              </p>

              <div style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; text-align: center; margin: 25px 0;">
                <p style="font-size: 14px; color: #666; margin: 0 0 5px;">La tua posizione:</p>
                <p style="font-size: 36px; color: #0A2540; font-weight: 700; margin: 0;">#${position}</p>
              </div>

              <p style="font-size: 16px; color: #4a4a4a; line-height: 1.6; margin: 0 0 20px;">
                Ti contatteremo non appena si libera un posto. Nel frattempo, puoi seguirci sui social per rimanere aggiornato.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 25px 40px; border-top: 1px solid #eee;">
              <p style="font-size: 14px; color: #666; margin: 0 0 10px; text-align: center;">
                Hai domande? Rispondi direttamente a questa email.
              </p>
              <p style="font-size: 13px; color: #999; margin: 0; text-align: center;">
                &copy; 2026 Vitaeology. Tutti i diritti riservati.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      replyTo: REPLY_TO,
      subject,
      html,
    });

    if (error) {
      console.error('[Beta Email] Errore invio waitlist:', error);
      return { success: false, error: error.message };
    }

    console.log('[Beta Email] Waitlist inviata a:', email);
    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error('[Beta Email] Errore critico:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Errore sconosciuto' };
  }
}
