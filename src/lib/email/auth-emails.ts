/**
 * Auth Email Templates - OTP e Verifica
 *
 * Template unificato per tutte le email di autenticazione con codice OTP.
 * Sostituisce le 3 funzioni duplicate: generateOTPEmail, generateConfirmationEmail, generateResetPasswordEmail
 */

export type OTPEmailType = 'signup' | 'confirmation' | 'password_reset';

interface OTPEmailConfig {
  title: string;
  greeting: (name?: string) => string;
  bodyText: string;
  footerNote: string;
}

const OTP_EMAIL_CONFIGS: Record<OTPEmailType, OTPEmailConfig> = {
  signup: {
    title: 'Verifica la tua email',
    greeting: (name) => `Ciao ${name || ''},`,
    bodyText: 'Ecco il tuo codice di verifica per completare la registrazione su Vitaeology:',
    footerNote: 'Se non hai richiesto questo codice, puoi ignorare questa email.',
  },
  confirmation: {
    title: 'Verifica la tua email',
    greeting: (name) => `Ciao ${name || ''},`,
    bodyText: 'Ecco il tuo nuovo codice di verifica per completare la registrazione su Vitaeology:',
    footerNote: 'Se non hai richiesto questo codice, puoi ignorare questa email.',
  },
  password_reset: {
    title: 'Reimposta la tua password',
    greeting: () => 'Ciao,',
    bodyText: 'Hai richiesto di reimpostare la password del tuo account Vitaeology. Usa il codice qui sotto per procedere:',
    footerNote: 'Se non hai richiesto il reset della password, puoi ignorare questa email. La tua password resterà invariata.',
  },
};

/**
 * Genera il template HTML per email OTP di autenticazione
 *
 * @param otp - Codice OTP a 6 cifre
 * @param type - Tipo di email: 'signup' | 'confirmation' | 'password_reset'
 * @param name - Nome utente (opzionale, usato per signup e confirmation)
 */
export function generateOTPEmailTemplate(
  otp: string,
  type: OTPEmailType,
  name?: string
): string {
  const config = OTP_EMAIL_CONFIGS[type];

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #0A2540; margin-bottom: 5px; font-size: 24px;">${config.title}</h1>
  </div>

  <p>${config.greeting(name)}</p>

  <p>${config.bodyText}</p>

  <div style="background: #f5f5f5; padding: 30px; text-align: center; margin: 30px 0; border-radius: 8px;">
    <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #0A2540; font-family: monospace;">
      ${otp}
    </span>
  </div>

  <p style="color: #666; font-size: 14px;">
    ⏱️ Questo codice scade tra <strong>15 minuti</strong>.
  </p>

  <p style="color: #666; font-size: 14px;">
    ${config.footerNote}
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="font-size: 12px; color: #999; text-align: center;">
    Vitaeology - Leadership Development Platform<br>
    <a href="https://www.vitaeology.com" style="color: #999;">www.vitaeology.com</a>
  </p>

</body>
</html>
  `;
}
