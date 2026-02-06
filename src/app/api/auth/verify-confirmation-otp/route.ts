// POST /api/auth/verify-confirmation-otp - Verifica OTP e conferma email utente esistente
// Per utenti che si sono registrati ma non hanno confermato l'email

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, getClientIP, rateLimitExceededResponse } from '@/lib/rate-limiter';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Rate limit per verifica OTP (anti brute-force)
const VERIFY_RATE_LIMIT = {
  maxRequests: 10,
  windowSeconds: 300, // 10 tentativi ogni 5 minuti
  identifier: 'verify-confirmation-otp',
};

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);

  // Rate limiting
  const rateLimit = checkRateLimit(clientIP, VERIFY_RATE_LIMIT);
  if (!rateLimit.success) {
    return rateLimitExceededResponse(rateLimit.resetIn);
  }

  try {
    const body = await request.json();
    const { email, code } = body;

    // 1. Validazione
    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email e codice sono obbligatori' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedCode = code.trim();

    // 2. Trova il codice di verifica
    const { data: verification, error: fetchError } = await supabase
      .from('auth_verification_codes')
      .select('*')
      .eq('email', normalizedEmail)
      .eq('type', 'signup')
      .is('verified_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !verification) {
      return NextResponse.json(
        { error: 'Codice non trovato. Richiedi un nuovo codice.' },
        { status: 400 }
      );
    }

    // 3. Verifica scadenza
    if (new Date(verification.expires_at) < new Date()) {
      await supabase
        .from('auth_verification_codes')
        .delete()
        .eq('id', verification.id);

      return NextResponse.json(
        { error: 'Codice scaduto. Richiedi un nuovo codice.' },
        { status: 400 }
      );
    }

    // 4. Verifica tentativi
    const maxAttempts = verification.max_attempts || 5;
    if (verification.attempts >= maxAttempts) {
      await supabase
        .from('auth_verification_codes')
        .delete()
        .eq('id', verification.id);

      return NextResponse.json(
        { error: 'Troppi tentativi falliti. Richiedi un nuovo codice.' },
        { status: 400 }
      );
    }

    // 5. Verifica codice
    if (verification.code !== normalizedCode) {
      await supabase
        .from('auth_verification_codes')
        .update({ attempts: verification.attempts + 1 })
        .eq('id', verification.id);

      const remainingAttempts = maxAttempts - verification.attempts - 1;

      return NextResponse.json(
        {
          error: `Codice errato. ${remainingAttempts} tentativi rimasti.`,
          remainingAttempts
        },
        { status: 400 }
      );
    }

    // 6. Trova l'utente
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const user = existingUsers?.users?.find(
      u => u.email?.toLowerCase() === normalizedEmail
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Utente non trovato.' },
        { status: 404 }
      );
    }

    // 7. Conferma l'email dell'utente
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
    );

    if (updateError) {
      console.error('Errore conferma email:', updateError);
      return NextResponse.json(
        { error: 'Errore durante la conferma. Riprova.' },
        { status: 500 }
      );
    }

    // 8. Marca codice come verificato
    await supabase
      .from('auth_verification_codes')
      .update({ verified_at: new Date().toISOString() })
      .eq('id', verification.id);

    // 9. Successo!
    return NextResponse.json({
      success: true,
      message: 'Email confermata con successo!',
    });

  } catch (error) {
    console.error('Errore verify-confirmation-otp:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
