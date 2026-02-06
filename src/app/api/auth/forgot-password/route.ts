// POST /api/auth/forgot-password - Reset password con OTP via Resend
// Genera OTP 6 cifre e invia via Resend (elimina dipendenza da Supabase SMTP)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { validateEmail, checkRateLimit, getClientIP, rateLimitExceededResponse } from '@/lib/rate-limiter';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { isIPBlocked, blockedIPResponse } from '@/lib/validation/ip-blocklist';
import { logSignupAttempt } from '@/lib/validation/signup-logger';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

// Genera codice OTP 6 cifre
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Rate limit più restrittivo per forgot password
const FORGOT_PASSWORD_RATE_LIMIT = {
  maxRequests: 3,
  windowSeconds: 900, // 3 tentativi ogni 15 minuti
  identifier: 'forgot-password',
};

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || undefined;

  // 0. Verifica IP blocklist
  const ipBlockCheck = await isIPBlocked(clientIP);
  if (ipBlockCheck.isBlocked) {
    return blockedIPResponse();
  }

  // Rate limiting
  const rateLimit = checkRateLimit(clientIP, FORGOT_PASSWORD_RATE_LIMIT);
  if (!rateLimit.success) {
    return rateLimitExceededResponse(rateLimit.resetIn);
  }

  try {
    const body = await request.json();
    const { email, turnstileToken } = body;

    // 1. Validazione email
    if (!email) {
      return NextResponse.json(
        { error: 'Email obbligatoria' },
        { status: 400 }
      );
    }

    // 2. Verifica Turnstile
    if (!turnstileToken) {
      await logSignupAttempt({
        email,
        ipAddress: clientIP,
        userAgent,
        turnstilePassed: false,
        emailValid: true,
        nameSuspicionScore: 0,
        blocked: true,
        blockReason: 'missing_turnstile',
        success: false,
        source: 'forgot_password',
      });

      return NextResponse.json(
        { error: 'Verifica di sicurezza mancante. Ricarica la pagina.' },
        { status: 400 }
      );
    }

    const turnstileResult = await verifyTurnstileToken(turnstileToken, clientIP);
    if (!turnstileResult.success) {
      await logSignupAttempt({
        email,
        ipAddress: clientIP,
        userAgent,
        turnstilePassed: false,
        emailValid: true,
        nameSuspicionScore: 0,
        blocked: true,
        blockReason: 'turnstile_failed',
        success: false,
        source: 'forgot_password',
      });

      return NextResponse.json(
        { error: 'Verifica di sicurezza fallita. Riprova.' },
        { status: 400 }
      );
    }

    // 3. Validazione formato email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      await logSignupAttempt({
        email,
        ipAddress: clientIP,
        userAgent,
        turnstilePassed: true,
        emailValid: false,
        nameSuspicionScore: 0,
        blocked: true,
        blockReason: `email_invalid: ${emailValidation.reason}`,
        success: false,
        source: 'forgot_password',
      });

      return NextResponse.json(
        { error: emailValidation.reason || 'Email non valida' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 4. Verifica se utente esiste in Supabase (per sicurezza, non riveliamo l'esistenza)
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const userExists = existingUsers?.users?.some(
      u => u.email?.toLowerCase() === normalizedEmail
    );

    // Anche se l'utente non esiste, rispondiamo sempre con successo
    // per non rivelare informazioni sulla registrazione
    if (!userExists) {
      // Log ma non inviamo email
      await logSignupAttempt({
        email: normalizedEmail,
        ipAddress: clientIP,
        userAgent,
        turnstilePassed: true,
        emailValid: true,
        nameSuspicionScore: 0,
        blocked: false,
        success: true,
        source: 'forgot_password',
        metadata: { user_exists: false },
      });

      // Risposta identica a quando l'utente esiste
      return NextResponse.json({
        success: true,
        message: 'Se l\'email è registrata, riceverai un codice di verifica.',
        email: normalizedEmail,
      });
    }

    // 5. Invalida eventuali codici precedenti per questa email (tipo reset_password)
    await supabase
      .from('auth_verification_codes')
      .update({ verified_at: new Date().toISOString() })
      .eq('email', normalizedEmail)
      .eq('type', 'reset_password')
      .is('verified_at', null);

    // 6. Genera OTP e salva
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minuti

    const { error: insertError } = await supabase
      .from('auth_verification_codes')
      .insert({
        email: normalizedEmail,
        code: otp,
        type: 'reset_password',
        expires_at: expiresAt.toISOString(),
        ip_address: clientIP,
        user_agent: request.headers.get('user-agent') || null,
      });

    if (insertError) {
      console.error('Errore salvataggio OTP reset:', insertError);
      return NextResponse.json(
        { error: 'Errore interno. Riprova.' },
        { status: 500 }
      );
    }

    // 7. Invia email con OTP via Resend
    const { error: emailError } = await resend.emails.send({
      from: 'Vitaeology <noreply@vitaeology.com>',
      to: normalizedEmail,
      subject: `${otp} - Codice per reimpostare la password`,
      html: generateResetPasswordEmail(otp),
    });

    if (emailError) {
      console.error('Errore invio email reset password:', emailError);
      // Elimina il codice se l'email fallisce
      await supabase
        .from('auth_verification_codes')
        .delete()
        .eq('email', normalizedEmail)
        .eq('type', 'reset_password')
        .is('verified_at', null);

      return NextResponse.json(
        { error: 'Impossibile inviare email. Verifica l\'indirizzo.' },
        { status: 500 }
      );
    }

    // 8. Log successo
    await logSignupAttempt({
      email: normalizedEmail,
      ipAddress: clientIP,
      userAgent,
      turnstilePassed: true,
      emailValid: true,
      nameSuspicionScore: 0,
      blocked: false,
      success: true,
      source: 'forgot_password',
    });

    // Risposta con email per redirect frontend
    return NextResponse.json({
      success: true,
      message: 'Se l\'email è registrata, riceverai un codice di verifica.',
      email: normalizedEmail,
      expiresIn: 15 * 60, // secondi
    });

  } catch (error) {
    console.error('Errore forgot-password:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// Template email reset password OTP
function generateResetPasswordEmail(otp: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #0A2540; margin-bottom: 5px; font-size: 24px;">Reimposta la tua password</h1>
  </div>

  <p>Ciao,</p>

  <p>Hai richiesto di reimpostare la password del tuo account Vitaeology. Usa il codice qui sotto per procedere:</p>

  <div style="background: #f5f5f5; padding: 30px; text-align: center; margin: 30px 0; border-radius: 8px;">
    <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #0A2540; font-family: monospace;">
      ${otp}
    </span>
  </div>

  <p style="color: #666; font-size: 14px;">
    ⏱️ Questo codice scade tra <strong>15 minuti</strong>.
  </p>

  <p style="color: #666; font-size: 14px;">
    Se non hai richiesto il reset della password, puoi ignorare questa email. La tua password resterà invariata.
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
