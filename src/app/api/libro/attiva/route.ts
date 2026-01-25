/**
 * API Route: Attivazione Codice Libro
 * POST /api/libro/attiva
 *
 * Permette ai lettori di attivare l'accesso all'assessment
 * usando il codice stampato nel libro.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { grantAssessmentAccess, AssessmentType, LIBRO_TO_ASSESSMENT } from '@/lib/assessment-access';

export async function POST(request: NextRequest) {
  try {
    const { code, email } = await request.json();

    // Validazione input
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Codice richiesto' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email richiesta' },
        { status: 400 }
      );
    }

    // Normalizza il codice (uppercase, trim)
    const normalizedCode = code.trim().toUpperCase();

    const supabase = await createClient();

    // 1. Verifica se l'utente è autenticato
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Cerca il codice nel database
    const { data: bookCode, error: codeError } = await supabase
      .from('book_codes')
      .select('*')
      .eq('code', normalizedCode)
      .eq('is_active', true)
      .single();

    if (codeError || !bookCode) {
      return NextResponse.json(
        { error: 'Codice non valido o scaduto' },
        { status: 400 }
      );
    }

    // 3. Verifica validità temporale
    const now = new Date();
    if (bookCode.valid_from && new Date(bookCode.valid_from) > now) {
      return NextResponse.json(
        { error: 'Codice non ancora attivo' },
        { status: 400 }
      );
    }
    if (bookCode.valid_until && new Date(bookCode.valid_until) < now) {
      return NextResponse.json(
        { error: 'Codice scaduto' },
        { status: 400 }
      );
    }

    // 4. Verifica limite utilizzi
    if (bookCode.max_uses !== null && bookCode.current_uses >= bookCode.max_uses) {
      return NextResponse.json(
        { error: 'Codice esaurito' },
        { status: 400 }
      );
    }

    // 5. Determina l'assessment da sbloccare
    const assessmentType = LIBRO_TO_ASSESSMENT[bookCode.book_slug] as AssessmentType;
    if (!assessmentType) {
      return NextResponse.json(
        { error: 'Configurazione codice non valida' },
        { status: 500 }
      );
    }

    // 6. Se utente non autenticato, verifica se esiste con questa email
    let userId = user?.id;
    let needsRegistration = false;

    if (!userId) {
      // Cerca utente per email
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (existingProfile) {
        userId = existingProfile.id;
      } else {
        // Utente non esiste - dovrà registrarsi
        needsRegistration = true;
      }
    }

    // 7. Se utente esiste, verifica se ha già usato questo codice
    if (userId) {
      const { data: existingActivation } = await supabase
        .from('book_code_activations')
        .select('id')
        .eq('code_id', bookCode.id)
        .eq('user_id', userId)
        .single();

      if (existingActivation) {
        return NextResponse.json(
          { error: 'Hai già attivato questo codice' },
          { status: 400 }
        );
      }

      // 8. Concedi accesso all'assessment
      const accessId = await grantAssessmentAccess(
        supabase,
        userId,
        assessmentType,
        'book_purchase',
        `book_code:${normalizedCode}`
      );

      if (!accessId) {
        return NextResponse.json(
          { error: 'Errore durante l\'attivazione. Riprova.' },
          { status: 500 }
        );
      }

      // 9. Registra l'attivazione
      const ip = request.headers.get('x-forwarded-for') ||
                 request.headers.get('x-real-ip') ||
                 'unknown';

      await supabase.from('book_code_activations').insert({
        code_id: bookCode.id,
        user_id: userId,
        email: email.toLowerCase().trim(),
        ip_address: ip.split(',')[0].trim(),
      });

      // 10. Incrementa contatore utilizzi
      await supabase
        .from('book_codes')
        .update({ current_uses: bookCode.current_uses + 1 })
        .eq('id', bookCode.id);

      return NextResponse.json({
        success: true,
        message: 'Accesso attivato con successo!',
        assessmentType,
        redirectUrl: `/assessment/${assessmentType}`,
      });
    }

    // Utente non registrato - salva il codice in sessione e rimanda a registrazione
    if (needsRegistration) {
      return NextResponse.json({
        success: true,
        needsRegistration: true,
        message: 'Codice valido! Registrati per attivare l\'accesso.',
        code: normalizedCode,
        assessmentType,
        redirectUrl: `/auth/signup?book_code=${normalizedCode}&email=${encodeURIComponent(email)}`,
      });
    }

  } catch {
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// GET per verificare un codice senza attivarlo
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json(
      { error: 'Codice richiesto' },
      { status: 400 }
    );
  }

  const normalizedCode = code.trim().toUpperCase();
  const supabase = await createClient();

  const { data: bookCode, error } = await supabase
    .from('book_codes')
    .select('book_slug, description')
    .eq('code', normalizedCode)
    .eq('is_active', true)
    .single();

  if (error || !bookCode) {
    return NextResponse.json(
      { valid: false, error: 'Codice non valido' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    valid: true,
    bookSlug: bookCode.book_slug,
    description: bookCode.description,
  });
}
