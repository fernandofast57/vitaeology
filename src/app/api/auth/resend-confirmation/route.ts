// POST /api/auth/resend-confirmation - Reinvia email di conferma via Resend
// Usato quando un utente tenta il login ma la sua email non è confermata

import { NextRequest, NextResponse } from 'next/server';
import { getResend } from '@/lib/email/client';
import { checkRateLimit, getClientIP, rateLimitExceededResponse } from '@/lib/rate-limiter';
import { getServiceClient } from '@/lib/supabase/service';
import { generateOTPEmailTemplate } from '@/lib/email/auth-emails';

export const dynamic = 'force-dynamic';

// Genera codice OTP 6 cifre
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Rate limit per resend confirmation (anti-abuse)
const RESEND_RATE_LIMIT = {
  maxRequests: 3,
  windowSeconds: 300, // 3 tentativi ogni 5 minuti
  identifier: 'resend-confirmation',
};

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);

  // Rate limiting
  const rateLimit = checkRateLimit(clientIP, RESEND_RATE_LIMIT);
  if (!rateLimit.success) {
    return rateLimitExceededResponse(rateLimit.resetIn);
  }

  try {
    const body = await request.json();
    const { email } = body;

    // 1. Validazione
    if (!email) {
      return NextResponse.json(
        { error: 'Email obbligatoria' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Verifica se utente esiste ma non è confermato
    const { data: existingUsers } = await getServiceClient().auth.admin.listUsers();
    const user = existingUsers?.users?.find(
      u => u.email?.toLowerCase() === normalizedEmail
    );

    if (!user) {
      // Non rivelare che l'utente non esiste
      return NextResponse.json({
        success: true,
        message: 'Se l\'email è registrata, riceverai un codice di verifica.',
      });
    }

    // Se l'utente è già confermato, non serve reinviare
    if (user.email_confirmed_at) {
      return NextResponse.json({
        success: true,
        message: 'Email già confermata. Puoi accedere normalmente.',
        alreadyConfirmed: true,
      });
    }

    // 3. Ottieni il nome utente dai metadati
    const fullName = user.user_metadata?.full_name || 'Utente';

    // 4. Invalida eventuali codici precedenti per questa email
    await getServiceClient()
      .from('auth_verification_codes')
      .delete()
      .eq('email', normalizedEmail)
      .is('verified_at', null);

    // 5. Genera OTP e salva
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minuti

    const { error: insertError } = await getServiceClient()
      .from('auth_verification_codes')
      .insert({
        email: normalizedEmail,
        code: otp,
        type: 'signup', // Usa lo stesso tipo del signup originale
        expires_at: expiresAt.toISOString(),
        ip_address: clientIP,
        user_agent: request.headers.get('user-agent') || null,
      });

    if (insertError) {
      console.error('Errore salvataggio OTP resend');
      return NextResponse.json(
        { error: 'Errore interno. Riprova.' },
        { status: 500 }
      );
    }

    // 6. Invia email con OTP via Resend
    const { error: emailError } = await getResend().emails.send({
      from: 'Vitaeology <noreply@vitaeology.com>',
      to: normalizedEmail,
      subject: `${otp} - Il tuo codice di verifica Vitaeology`,
      html: generateOTPEmailTemplate(otp, 'confirmation', fullName),
    });

    if (emailError) {
      console.error('Errore invio email conferma');
      // Elimina il codice se l'email fallisce
      await getServiceClient()
        .from('auth_verification_codes')
        .delete()
        .eq('email', normalizedEmail)
        .is('verified_at', null);

      return NextResponse.json(
        { error: 'Impossibile inviare email. Riprova.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Codice di verifica inviato',
      email: normalizedEmail,
      expiresIn: 15 * 60, // secondi
    });

  } catch (error) {
    console.error('Errore resend-confirmation');
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

