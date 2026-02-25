// POST /api/auth/verify-reset-otp - Verifica OTP e aggiorna password
// Step 2 del flusso reset password: dopo che l'utente ha inserito il codice OTP

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { checkRateLimit, getClientIP, rateLimitExceededResponse } from '@/lib/rate-limiter';

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
  identifier: 'verify-reset-otp',
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
    const { email, code, newPassword } = body;

    // 1. Validazione
    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: 'Email, codice e nuova password sono obbligatori' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'La password deve essere di almeno 6 caratteri' },
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
      .eq('type', 'reset_password')
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
    const maxAttempts = verification.max_attempts || 5;
    if (verification.attempts >= maxAttempts) {
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

      const remainingAttempts = maxAttempts - verification.attempts - 1;

      return NextResponse.json(
        {
          error: `Codice errato. ${remainingAttempts} tentativi rimasti.`,
          remainingAttempts
        },
        { status: 400 }
      );
    }

    // 6. Codice corretto! Trova l'utente
    const { data: existingUsers } = await getSupabase().auth.admin.listUsers();
    const user = existingUsers?.users?.find(
      u => u.email?.toLowerCase() === normalizedEmail
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Utente non trovato.' },
        { status: 404 }
      );
    }

    // 7. Aggiorna password
    const { error: updateError } = await getSupabase().auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Errore aggiornamento password:', updateError);
      return NextResponse.json(
        { error: 'Errore durante l\'aggiornamento della password. Riprova.' },
        { status: 500 }
      );
    }

    // 8. Marca codice come verificato
    await getSupabase()
      .from('auth_verification_codes')
      .update({ verified_at: new Date().toISOString() })
      .eq('id', verification.id);

    // 9. Successo!
    return NextResponse.json({
      success: true,
      message: 'Password aggiornata con successo!',
    });

  } catch (error) {
    console.error('Errore verify-reset-otp:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
