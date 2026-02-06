// POST /api/auth/forgot-password - Reset password con Turnstile
// Protegge l'endpoint di reset password da bot spam

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateEmail, checkRateLimit, getClientIP, rateLimitExceededResponse } from '@/lib/rate-limiter';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { isIPBlocked, blockedIPResponse } from '@/lib/validation/ip-blocklist';
import { logSignupAttempt } from '@/lib/validation/signup-logger';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    // 4. Invia email di reset tramite Supabase
    // NOTA: Supabase resetPasswordForEmail non fallisce se l'email non esiste
    // (per sicurezza - non rivela se un'email è registrata)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      normalizedEmail,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
      }
    );

    if (resetError) {
      console.error('Errore reset password:', resetError);

      await logSignupAttempt({
        email: normalizedEmail,
        ipAddress: clientIP,
        userAgent,
        turnstilePassed: true,
        emailValid: true,
        nameSuspicionScore: 0,
        blocked: false,
        blockReason: 'supabase_error',
        success: false,
        source: 'forgot_password',
      });

      return NextResponse.json(
        { error: 'Errore durante l\'invio. Riprova.' },
        { status: 500 }
      );
    }

    // 5. Log successo
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

    // Risposta generica (non rivela se email esiste)
    return NextResponse.json({
      success: true,
      message: 'Se l\'email è registrata, riceverai un link per reimpostare la password.',
    });

  } catch (error) {
    console.error('Errore forgot-password:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
