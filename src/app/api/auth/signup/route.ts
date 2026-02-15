// POST /api/auth/signup - Registrazione con Turnstile + OTP + Anti-Spam
// Step 1: Valida email/nome, verifica Turnstile, genera OTP, invia email
// Step 2: Utente inserisce OTP → /api/auth/verify-otp crea account

import { NextRequest, NextResponse } from 'next/server';
import { getResend } from '@/lib/email/client';
import { validateEmail } from '@/lib/rate-limiter';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { checkRateLimit, getClientIP, rateLimitExceededResponse } from '@/lib/rate-limiter';
import { validateName, isDefinitelySpam } from '@/lib/validation/name-validator';
import { isIPBlocked, blockIP, blockedIPResponse } from '@/lib/validation/ip-blocklist';
import { logSignupAttempt, shouldAutoBlockIP } from '@/lib/validation/signup-logger';
import { getServiceClient } from '@/lib/supabase/service';
import { generateOTPEmailTemplate } from '@/lib/email/auth-emails';

export const dynamic = 'force-dynamic';

// Genera codice OTP 6 cifre
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Rate limit config per signup
const SIGNUP_RATE_LIMIT = {
  maxRequests: 3,
  windowSeconds: 300, // 3 tentativi ogni 5 minuti
  identifier: 'signup',
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
  const rateLimit = checkRateLimit(clientIP, SIGNUP_RATE_LIMIT);
  if (!rateLimit.success) {
    return rateLimitExceededResponse(rateLimit.resetIn);
  }

  // Variabili per logging
  let turnstilePassed = false;
  let emailValid = true;
  let nameSuspicionScore = 0;

  try {
    const body = await request.json();
    const { email, password, fullName, turnstileToken } = body;

    // 1. Validazione campi obbligatori
    if (!email || !password || !fullName) {
      // Log tentativo fallito
      await logSignupAttempt({
        email: email || 'missing',
        name: fullName,
        ipAddress: clientIP,
        userAgent,
        turnstilePassed: false,
        emailValid: false,
        nameSuspicionScore: 0,
        blocked: true,
        blockReason: 'missing_fields',
        success: false,
        source: 'signup',
      });

      return NextResponse.json(
        { error: 'Email, password e nome sono obbligatori' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La password deve essere di almeno 6 caratteri' },
        { status: 400 }
      );
    }

    // 2. Verifica Turnstile
    if (!turnstileToken) {
      await logSignupAttempt({
        email,
        name: fullName,
        ipAddress: clientIP,
        userAgent,
        turnstilePassed: false,
        emailValid: true,
        nameSuspicionScore: 0,
        blocked: true,
        blockReason: 'missing_turnstile',
        success: false,
        source: 'signup',
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
        name: fullName,
        ipAddress: clientIP,
        userAgent,
        turnstilePassed: false,
        emailValid: true,
        nameSuspicionScore: 0,
        blocked: true,
        blockReason: 'turnstile_failed',
        success: false,
        source: 'signup',
      });

      return NextResponse.json(
        { error: 'Verifica di sicurezza fallita. Riprova.' },
        { status: 400 }
      );
    }
    turnstilePassed = true;

    // 3. Validazione email (formato + spam + disposable)
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      emailValid = false;

      await logSignupAttempt({
        email,
        name: fullName,
        ipAddress: clientIP,
        userAgent,
        turnstilePassed: true,
        emailValid: false,
        nameSuspicionScore: 0,
        blocked: true,
        blockReason: `email_invalid: ${emailValidation.reason}`,
        success: false,
        source: 'signup',
      });

      return NextResponse.json(
        { error: emailValidation.reason || 'Email non valida' },
        { status: 400 }
      );
    }

    // 4. Validazione nome (anti-spam)
    const nameValidation = validateName(fullName);
    nameSuspicionScore = nameValidation.suspicionScore;

    if (isDefinitelySpam(nameValidation)) {
      await logSignupAttempt({
        email,
        name: fullName,
        ipAddress: clientIP,
        userAgent,
        turnstilePassed: true,
        emailValid: true,
        nameSuspicionScore,
        blocked: true,
        blockReason: `spam_name: ${nameValidation.flags.join(', ')}`,
        success: false,
        source: 'signup',
      });

      // Verifica se bloccare IP automaticamente
      const autoBlockCheck = await shouldAutoBlockIP(clientIP);
      if (autoBlockCheck.shouldBlock) {
        await blockIP(clientIP, autoBlockCheck.reason || 'Too many spam attempts', 24);
      }

      return NextResponse.json(
        { error: nameValidation.reason || 'Il nome inserito non è valido' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 4. Verifica se email già registrata in Supabase
    const { data: existingUser } = await getServiceClient().auth.admin.listUsers();
    const userExists = existingUser?.users?.some(
      u => u.email?.toLowerCase() === normalizedEmail
    );

    if (userExists) {
      return NextResponse.json(
        { error: 'Questa email è già registrata. Prova ad accedere.' },
        { status: 409 }
      );
    }

    // 5. Invalida eventuali codici precedenti per questa email
    await getServiceClient()
      .from('auth_verification_codes')
      .delete()
      .eq('email', normalizedEmail);

    // 6. Genera OTP e salva
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minuti

    const { error: insertError } = await getServiceClient()
      .from('auth_verification_codes')
      .insert({
        email: normalizedEmail,
        code: otp,
        expires_at: expiresAt.toISOString(),
        ip_address: clientIP,
        user_agent: request.headers.get('user-agent') || null,
      });

    if (insertError) {
      console.error('Errore salvataggio OTP:', insertError);
      return NextResponse.json(
        { error: 'Errore interno. Riprova.' },
        { status: 500 }
      );
    }

    // 7. Invia email con OTP
    const { error: emailError } = await getResend().emails.send({
      from: 'Vitaeology <noreply@vitaeology.com>',
      to: normalizedEmail,
      subject: `${otp} - Il tuo codice di verifica Vitaeology`,
      html: generateOTPEmailTemplate(otp, 'signup', fullName),
    });

    if (emailError) {
      console.error('Errore invio email OTP:', emailError);
      // Elimina il codice se l'email fallisce
      await getServiceClient()
        .from('auth_verification_codes')
        .delete()
        .eq('email', normalizedEmail);

      return NextResponse.json(
        { error: 'Impossibile inviare email. Verifica l\'indirizzo.' },
        { status: 500 }
      );
    }

    // 8. Log tentativo riuscito
    await logSignupAttempt({
      email: normalizedEmail,
      name: fullName,
      ipAddress: clientIP,
      userAgent,
      turnstilePassed: true,
      emailValid: true,
      nameSuspicionScore,
      blocked: false,
      success: true,
      source: 'signup',
    });

    // 9. Successo - salva temporaneamente i dati per il verify
    // (password e fullName verranno ri-inviati dal client al verify)
    return NextResponse.json({
      success: true,
      message: 'Codice di verifica inviato',
      email: normalizedEmail,
      expiresIn: 15 * 60, // secondi
    });

  } catch (error) {
    console.error('Errore signup:', error);

    // Log errore generico
    try {
      await logSignupAttempt({
        email: 'error',
        ipAddress: clientIP,
        userAgent,
        turnstilePassed,
        emailValid,
        nameSuspicionScore,
        blocked: false,
        blockReason: 'server_error',
        success: false,
        source: 'signup',
      });
    } catch {
      // Ignora errori di logging
    }

    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

