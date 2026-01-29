// POST /api/auth/verify-otp - Verifica OTP e crea account Supabase
// Step 2 del flusso: dopo che l'utente ha inserito il codice OTP

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
  identifier: 'verify-otp',
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
    const { email, code, password, fullName, bookCode } = body;

    // 1. Validazione
    if (!email || !code || !password || !fullName) {
      return NextResponse.json(
        { error: 'Dati mancanti' },
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
      // Elimina codice scaduto
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
    if (verification.attempts >= verification.max_attempts) {
      // Elimina codice dopo troppi tentativi
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
      // Incrementa tentativi
      await supabase
        .from('auth_verification_codes')
        .update({ attempts: verification.attempts + 1 })
        .eq('id', verification.id);

      const remainingAttempts = verification.max_attempts - verification.attempts - 1;

      return NextResponse.json(
        {
          error: `Codice errato. ${remainingAttempts} tentativi rimasti.`,
          remainingAttempts
        },
        { status: 400 }
      );
    }

    // 6. Codice corretto! Crea utente in Supabase
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password: password,
      email_confirm: true, // Già verificato via OTP
      user_metadata: {
        full_name: fullName,
        book_code: bookCode || undefined,
        verified_via: 'otp',
      },
    });

    if (authError) {
      console.error('Errore creazione utente:', authError);

      if (authError.message.includes('already been registered')) {
        return NextResponse.json(
          { error: 'Questa email è già registrata.' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'Errore durante la registrazione. Riprova.' },
        { status: 500 }
      );
    }

    // 7. Marca codice come verificato
    await supabase
      .from('auth_verification_codes')
      .update({ verified_at: new Date().toISOString() })
      .eq('id', verification.id);

    // 8. Crea profilo utente
    if (authData.user) {
      await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          full_name: fullName,
          email: normalizedEmail,
          updated_at: new Date().toISOString(),
        });
    }

    // 9. Successo!
    return NextResponse.json({
      success: true,
      message: 'Account creato con successo!',
      userId: authData.user?.id,
    });

  } catch (error) {
    console.error('Errore verify-otp:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
