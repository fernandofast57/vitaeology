/**
 * Template Email per Subscription Vitaeology
 *
 * Gestisce tutte le email relative agli abbonamenti:
 * - Conferma upgrade (Leader/Mentor)
 * - Reminder rinnovo (7 giorni prima)
 * - Cancellazione subscription
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================================
// TIPI
// ============================================================

export interface UpgradeEmailParams {
  email: string;
  firstName?: string;
  planName: 'leader' | 'mentor';
  planPrice: number;
  renewalDate: string;
  invoiceUrl?: string;
}

export interface RenewalReminderParams {
  email: string;
  firstName?: string;
  planName: 'leader' | 'mentor';
  planPrice: number;
  renewalDate: string;
  daysUntilRenewal: number;
  manageUrl?: string;
}

export interface CancellationEmailParams {
  email: string;
  firstName?: string;
  planName: 'leader' | 'mentor';
  accessEndDate: string;
  reason?: string;
}

interface EmailResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

// ============================================================
// CONFIGURAZIONE PIANI
// ============================================================

const PLAN_CONFIG = {
  leader: {
    displayName: 'Leader',
    color: '#D4AF37',
    features: [
      'Tutti i 52 esercizi settimanali',
      'AI Coach Fernando illimitato',
      'Radar evolutivo con confronto progressi',
      'Storico completo delle tue riflessioni',
    ],
  },
  mentor: {
    displayName: 'Mentor',
    color: '#8B5CF6',
    features: [
      'Tutti i 52 esercizi settimanali',
      'AI Coach Fernando illimitato',
      'Radar evolutivo con confronto progressi',
      'Storico completo delle tue riflessioni',
      '2 sessioni 1:1 con Fernando',
      'Badge "Professionista Vitaeology"',
      'Accesso a tutti e 3 i percorsi',
    ],
  },
};

// ============================================================
// TEMPLATE HTML BASE
// ============================================================

function baseEmailTemplate(
  content: string,
  headerColor: string,
  headerTitle: string,
  headerSubtitle?: string
): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vitaeology.com';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headerTitle}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 100%;">

          <!-- Header -->
          <tr>
            <td style="background-color: ${headerColor}; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px;">
                ${headerTitle}
              </h1>
              ${headerSubtitle ? `
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
                ${headerSubtitle}
              </p>
              ` : ''}
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center;">
              <p style="color: #666; font-size: 13px; margin: 0 0 10px 0;">
                Domande? Rispondi a questa email o contattaci.
              </p>
              <p style="color: #999; font-size: 12px; margin: 0;">
                <a href="${appUrl}/subscription" style="color: #666; text-decoration: underline;">Gestisci abbonamento</a> |
                <a href="${appUrl}/privacy" style="color: #999;">Privacy</a> |
                © ${new Date().getFullYear()} Vitaeology
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function ctaButton(text: string, url: string, color: string, secondary = false): string {
  const bgColor = secondary ? '#f5f5f5' : color;
  const textColor = secondary ? '#333333' : '#ffffff';
  const border = secondary ? `2px solid ${color}` : 'none';

  return `
    <a href="${url}"
       style="display: inline-block; background-color: ${bgColor}; color: ${textColor};
              padding: 14px 28px; text-decoration: none; border-radius: 8px;
              font-weight: bold; font-size: 15px; border: ${border}; margin: 5px;">
      ${text}
    </a>
  `;
}

function featureList(features: string[], color: string): string {
  return features.map(feature => `
    <tr>
      <td style="padding: 8px 0;">
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="width: 24px; vertical-align: top;">
              <span style="color: ${color}; font-size: 16px;">✅</span>
            </td>
            <td style="padding-left: 8px; color: #333; font-size: 15px;">
              ${feature}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');
}

// ============================================================
// 1. UPGRADE CONFIRMATION EMAIL
// ============================================================

export async function sendUpgradeConfirmationEmail(
  params: UpgradeEmailParams
): Promise<EmailResult> {
  const { email, firstName, planName, planPrice, renewalDate, invoiceUrl } = params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vitaeology.com';
  const config = PLAN_CONFIG[planName];
  const greeting = firstName || 'Leader';

  const subject = `🎉 Benvenuto nel piano ${config.displayName}, ${greeting}!`;

  const content = `
    <!-- Saluto -->
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Ciao ${greeting},
    </p>

    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      <strong>Congratulazioni!</strong> Hai sbloccato il piano <strong>${config.displayName}</strong> di Vitaeology.
      Ora hai accesso completo a tutti gli strumenti per sviluppare la tua leadership autentica.
    </p>

    <!-- Riepilogo Acquisto -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 25px 0;">
      <tr>
        <td>
          <h3 style="color: #333; margin: 0 0 15px 0; font-size: 16px;">📋 Riepilogo del tuo abbonamento</h3>
          <table cellpadding="0" cellspacing="0" style="width: 100%;">
            <tr>
              <td style="padding: 8px 0; color: #666; font-size: 14px;">Piano:</td>
              <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: bold; text-align: right;">${config.displayName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-size: 14px;">Prezzo:</td>
              <td style="padding: 8px 0; color: #333; font-size: 14px; font-weight: bold; text-align: right;">€${planPrice}/anno</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-size: 14px;">Prossimo rinnovo:</td>
              <td style="padding: 8px 0; color: #333; font-size: 14px; text-align: right;">${renewalDate}</td>
            </tr>
            ${invoiceUrl ? `
            <tr>
              <td style="padding: 8px 0; color: #666; font-size: 14px;">Fattura:</td>
              <td style="padding: 8px 0; text-align: right;">
                <a href="${invoiceUrl}" style="color: ${config.color}; text-decoration: underline; font-size: 14px;">Scarica PDF</a>
              </td>
            </tr>
            ` : ''}
          </table>
        </td>
      </tr>
    </table>

    <!-- Cosa hai sbloccato -->
    <h3 style="color: #333; margin: 25px 0 15px 0; font-size: 18px;">
      🚀 Cosa hai sbloccato
    </h3>
    <table cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
      ${featureList(config.features, config.color)}
    </table>

    ${planName === 'mentor' ? `
    <!-- Extra Mentor: Sessioni 1:1 -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3e8ff; border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid ${config.color};">
      <tr>
        <td>
          <h4 style="color: ${config.color}; margin: 0 0 10px 0; font-size: 16px;">🎯 Le tue sessioni 1:1 con Fernando</h4>
          <p style="color: #333; font-size: 14px; margin: 0 0 15px 0;">
            Come Mentor, hai diritto a 2 sessioni individuali di coaching.
            Prenota la tua prima sessione quando sei pronto.
          </p>
          <a href="https://calendly.com/vitaeology/mentor-session"
             style="display: inline-block; background-color: ${config.color}; color: #ffffff;
                    padding: 12px 24px; text-decoration: none; border-radius: 8px;
                    font-weight: bold; font-size: 14px;">
            📅 Prenota la tua sessione 1:1
          </a>
        </td>
      </tr>
    </table>
    ` : ''}

    <!-- CTA: Inizia Subito -->
    <h3 style="color: #333; margin: 25px 0 15px 0; font-size: 18px;">
      ⚡ Inizia subito
    </h3>
    <p style="color: #666; font-size: 15px; margin: 0 0 20px 0;">
      Non perdere tempo! Ecco i tuoi prossimi passi:
    </p>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 10px 0;">
          ${ctaButton('🏠 Vai alla Dashboard', `${appUrl}/dashboard`, config.color)}
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 10px 0;">
          ${ctaButton('📚 Esplora gli Esercizi', `${appUrl}/exercises`, config.color, true)}
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 10px 0;">
          ${ctaButton('💬 Parla con Fernando', `${appUrl}/dashboard?openChat=true`, config.color, true)}
        </td>
      </tr>
    </table>

    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

    <!-- Chiusura -->
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">
      Grazie per la fiducia. Sono entusiasta di accompagnarti in questo percorso!
    </p>
    <p style="color: #333; font-size: 16px; margin: 20px 0 0 0;">
      A presto,<br>
      <strong>Fernando</strong>
    </p>
  `;

  const html = baseEmailTemplate(
    content,
    config.color,
    `Benvenuto nel piano ${config.displayName}!`,
    'Il tuo percorso di leadership inizia ora'
  );

  try {
    const { data, error } = await resend.emails.send({
      from: 'Fernando <fernando@vitaeology.com>',
      replyTo: 'fernando@vitaeology.com',
      to: email,
      subject,
      html,
    });

    if (error) {
      console.error('Errore invio email upgrade:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Email upgrade inviata a ${email} (piano: ${planName})`);
    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error('Errore invio email upgrade:', err);
    return { success: false, error: String(err) };
  }
}

// ============================================================
// 2. RENEWAL REMINDER EMAIL (7 giorni prima)
// ============================================================

export async function sendSubscriptionRenewalReminder(
  params: RenewalReminderParams
): Promise<EmailResult> {
  const { email, firstName, planName, planPrice, renewalDate, daysUntilRenewal, manageUrl } = params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vitaeology.com';
  const config = PLAN_CONFIG[planName];
  const greeting = firstName || 'Leader';

  const subject = `⏰ Il tuo abbonamento ${config.displayName} si rinnova tra ${daysUntilRenewal} giorni`;

  const content = `
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Ciao ${greeting},
    </p>

    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Ti scrivo per ricordarti che il tuo abbonamento <strong>${config.displayName}</strong>
      si rinnoverà automaticamente tra <strong>${daysUntilRenewal} giorni</strong>.
    </p>

    <!-- Riepilogo -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff9e6; border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid #F59E0B;">
      <tr>
        <td>
          <h4 style="color: #92400E; margin: 0 0 15px 0; font-size: 16px;">📅 Dettagli rinnovo</h4>
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding: 5px 20px 5px 0; color: #666; font-size: 14px;">Piano:</td>
              <td style="padding: 5px 0; color: #333; font-size: 14px; font-weight: bold;">${config.displayName}</td>
            </tr>
            <tr>
              <td style="padding: 5px 20px 5px 0; color: #666; font-size: 14px;">Importo:</td>
              <td style="padding: 5px 0; color: #333; font-size: 14px; font-weight: bold;">€${planPrice}</td>
            </tr>
            <tr>
              <td style="padding: 5px 20px 5px 0; color: #666; font-size: 14px;">Data rinnovo:</td>
              <td style="padding: 5px 0; color: #333; font-size: 14px;">${renewalDate}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Non devi fare nulla se vuoi continuare con il tuo piano attuale.
      L'addebito avverrà automaticamente sulla carta registrata.
    </p>

    <p style="color: #666; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
      Se invece vuoi modificare o cancellare il tuo abbonamento, puoi farlo
      dalla pagina di gestione:
    </p>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 10px 0;">
          ${ctaButton('⚙️ Gestisci Abbonamento', manageUrl || `${appUrl}/subscription`, '#0A2540')}
        </td>
      </tr>
    </table>

    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

    <p style="color: #333; font-size: 16px; margin: 0;">
      Grazie per essere parte di Vitaeology!<br>
      <strong>Fernando</strong>
    </p>
  `;

  const html = baseEmailTemplate(
    content,
    '#F59E0B',
    'Promemoria Rinnovo',
    `Il tuo piano ${config.displayName} si rinnova presto`
  );

  try {
    const { data, error } = await resend.emails.send({
      from: 'Fernando <fernando@vitaeology.com>',
      replyTo: 'fernando@vitaeology.com',
      to: email,
      subject,
      html,
    });

    if (error) {
      console.error('Errore invio reminder rinnovo:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Reminder rinnovo inviato a ${email}`);
    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error('Errore invio reminder rinnovo:', err);
    return { success: false, error: String(err) };
  }
}

// ============================================================
// 3. SUBSCRIPTION CANCELLED EMAIL
// ============================================================

export async function sendSubscriptionCancelledEmail(
  params: CancellationEmailParams
): Promise<EmailResult> {
  const { email, firstName, planName, accessEndDate, reason } = params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vitaeology.com';
  const config = PLAN_CONFIG[planName];
  const greeting = firstName || 'Leader';

  const subject = `Il tuo abbonamento ${config.displayName} è stato cancellato`;

  const content = `
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Ciao ${greeting},
    </p>

    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Confermiamo che il tuo abbonamento <strong>${config.displayName}</strong> è stato cancellato.
    </p>

    <!-- Info accesso -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid #EF4444;">
      <tr>
        <td>
          <h4 style="color: #991B1B; margin: 0 0 10px 0; font-size: 16px;">📌 Importante</h4>
          <p style="color: #333; font-size: 14px; margin: 0;">
            Potrai continuare ad accedere ai contenuti ${config.displayName} fino al
            <strong>${accessEndDate}</strong>. Dopo questa data, il tuo account
            tornerà al piano Explorer gratuito.
          </p>
        </td>
      </tr>
    </table>

    ${reason ? `
    <p style="color: #666; font-size: 14px; margin: 0 0 20px 0;">
      <em>Motivo cancellazione: ${reason}</em>
    </p>
    ` : ''}

    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Mi dispiace vederti andare. Se c'è qualcosa che possiamo fare per migliorare
      la tua esperienza, rispondi a questa email — leggo personalmente ogni messaggio.
    </p>

    <!-- Cosa mantieni -->
    <h4 style="color: #333; margin: 25px 0 15px 0; font-size: 16px;">
      Cosa mantieni con Explorer (gratuito):
    </h4>
    <table cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
      <tr>
        <td style="padding: 5px 0;">
          <span style="color: #10B981;">✓</span>
          <span style="color: #666; font-size: 14px; margin-left: 8px;">Accesso all'Assessment Leadership</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 5px 0;">
          <span style="color: #10B981;">✓</span>
          <span style="color: #666; font-size: 14px; margin-left: 8px;">10 esercizi base</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 5px 0;">
          <span style="color: #10B981;">✓</span>
          <span style="color: #666; font-size: 14px; margin-left: 8px;">5 messaggi AI al giorno</span>
        </td>
      </tr>
    </table>

    <!-- CTA Riattiva -->
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Puoi riattivare il tuo abbonamento in qualsiasi momento:
    </p>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 10px 0;">
          ${ctaButton('🔄 Riattiva Abbonamento', `${appUrl}/pricing`, config.color)}
        </td>
      </tr>
    </table>

    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

    <p style="color: #333; font-size: 16px; margin: 0;">
      Ti auguro il meglio per il tuo percorso di crescita.<br>
      <strong>Fernando</strong>
    </p>

    <p style="color: #999; font-size: 13px; margin: 20px 0 0 0;">
      P.S. Se hai cancellato per errore o hai cambiato idea, rispondi a questa email
      e troveremo una soluzione insieme.
    </p>
  `;

  const html = baseEmailTemplate(
    content,
    '#6B7280',
    'Abbonamento Cancellato',
    'Grazie per essere stato con noi'
  );

  try {
    const { data, error } = await resend.emails.send({
      from: 'Fernando <fernando@vitaeology.com>',
      replyTo: 'fernando@vitaeology.com',
      to: email,
      subject,
      html,
    });

    if (error) {
      console.error('Errore invio email cancellazione:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Email cancellazione inviata a ${email}`);
    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error('Errore invio email cancellazione:', err);
    return { success: false, error: String(err) };
  }
}
