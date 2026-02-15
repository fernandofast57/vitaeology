// POST /api/auth/forgot-password - Reset password con OTP via Resend
// Genera OTP 6 cifre e invia via Resend (elimina dipendenza da Supabase SMTP)

import { NextRequest, NextResponse } from 'next/server';
import { getResend } from '@/lib/email/client';
import { validateEmail, checkRateLimit, getClientIP, rateLimitExceededResponse } from '@/lib/rate-limiter';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { isIPBlocked, blockedIPResponse } from '@/lib/validation/ip-blocklist';
import { logSignupAttempt } from '@/lib/validation/signup-logger';
import { getServiceClient } from '@/lib/supabase/service';
import { generateOTPEmailTemplate } from '@/lib/email/auth-emails';

export const dynamic = 'force-dynamic';

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
    const { data: existingUsers } = await getServiceClient().auth.admin.listUsers();
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
    await getServiceClient()
      .from('auth_verification_codes')
      .update({ verified_at: new Date().toISOString() })
      .eq('email', normalizedEmail)
      .eq('type', 'reset_password')
      .is('verified_at', null);

    // 6. Genera OTP e salva
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minuti

    const { error: insertError } = await getServiceClient()
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
    const { error: emailError } = await getResend().emails.send({
      from: 'Vitaeology <noreply@vitaeology.com>',
      to: normalizedEmail,
      subject: `${otp} - Codice per reimpostare la password`,
      html: generateOTPEmailTemplate(otp, 'password_reset'),
    });

    if (emailError) {
      console.error('Errore invio email reset password:', emailError);
      // Elimina il codice se l'email fallisce
      await getServiceClient()
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

