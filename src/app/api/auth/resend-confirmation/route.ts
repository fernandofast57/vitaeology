// POST /api/auth/resend-confirmation - Reinvia email di conferma via Resend
// Usato quando un utente tenta il login ma la sua email non è confermata

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { checkRateLimit, getClientIP, rateLimitExceededResponse } from '@/lib/rate-limiter';

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
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
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
    await supabase
      .from('auth_verification_codes')
      .delete()
      .eq('email', normalizedEmail)
      .is('verified_at', null);

    // 5. Genera OTP e salva
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minuti

    const { error: insertError } = await supabase
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
      console.error('Errore salvataggio OTP resend:', insertError);
      return NextResponse.json(
        { error: 'Errore interno. Riprova.' },
        { status: 500 }
      );
    }

    // 6. Invia email con OTP via Resend
    const { error: emailError } = await resend.emails.send({
      from: 'Vitaeology <noreply@vitaeology.com>',
      to: normalizedEmail,
      subject: `${otp} - Il tuo codice di verifica Vitaeology`,
      html: generateConfirmationEmail(fullName, otp),
    });

    if (emailError) {
      console.error('Errore invio email conferma:', emailError);
      // Elimina il codice se l'email fallisce
      await supabase
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
    console.error('Errore resend-confirmation:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// Template email conferma
function generateConfirmationEmail(name: string, otp: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #0A2540; margin-bottom: 5px; font-size: 24px;">Verifica la tua email</h1>
  </div>

  <p>Ciao ${name},</p>

  <p>Ecco il tuo nuovo codice di verifica per completare la registrazione su Vitaeology:</p>

  <div style="background: #f5f5f5; padding: 30px; text-align: center; margin: 30px 0; border-radius: 8px;">
    <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #0A2540; font-family: monospace;">
      ${otp}
    </span>
  </div>

  <p style="color: #666; font-size: 14px;">
    ⏱️ Questo codice scade tra <strong>15 minuti</strong>.
  </p>

  <p style="color: #666; font-size: 14px;">
    Se non hai richiesto questo codice, puoi ignorare questa email.
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
