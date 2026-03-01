// POST /api/auth/verify-otp - Verifica OTP e crea account Supabase
// Step 2 del flusso: dopo che l'utente ha inserito il codice OTP

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { checkRateLimit, getClientIP, rateLimitExceededResponse } from '@/lib/rate-limiter';
import { createAndDispatch } from '@/lib/notion/dispatcher';

export const dynamic = 'force-dynamic';

let _supabase: SupabaseClient | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabase;
}

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
    const { data: verification, error: fetchError } = await getSupabase()
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
      await getSupabase()
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
      await getSupabase()
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
      await getSupabase()
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
    const { data: authData, error: authError } = await getSupabase().auth.admin.createUser({
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
    await getSupabase()
      .from('auth_verification_codes')
      .update({ verified_at: new Date().toISOString() })
      .eq('id', verification.id);

    // 8. Crea profilo utente
    if (authData.user) {
      await getSupabase()
        .from('profiles')
        .upsert({
          id: authData.user.id,
          full_name: fullName,
          email: normalizedEmail,
          updated_at: new Date().toISOString(),
        });

      // Hook Notion: registrazione utente (fire-and-forget)
      createAndDispatch('user_registered', {
        email: normalizedEmail,
        userId: authData.user.id,
      });

      // 8b. Collega eventuali challenge_subscribers esistenti con la stessa email
      // Questo permette di collegare le challenge fatte prima della registrazione
      try {
        await getSupabase().rpc('link_user_challenges', {
          p_user_id: authData.user.id,
          p_email: normalizedEmail,
        });
      } catch (linkError) {
        // Non blocchiamo la registrazione se il linking fallisce
        console.warn('Warning: Could not link challenge_subscribers:', linkError);
      }
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
