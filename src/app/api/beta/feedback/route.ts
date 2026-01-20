// POST /api/beta/feedback - Submit feedback (utenti loggati)
// GET /api/beta/feedback - Lista feedback (admin only)

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verifica autenticazione
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Devi essere loggato per inviare feedback' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, description, page_url, severity } = body;

    // Validazione
    if (!type || !description) {
      return NextResponse.json(
        { error: 'Tipo e descrizione sono obbligatori' },
        { status: 400 }
      );
    }

    const validTypes = ['bug', 'suggestion', 'question', 'praise'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Tipo feedback non valido' },
        { status: 400 }
      );
    }

    // Trova eventuale tester_id
    const { data: tester } = await supabase
      .from('beta_testers')
      .select('id')
      .eq('email', user.email)
      .single();

    // Inserisci feedback
    const { data, error } = await supabase
      .from('beta_feedback')
      .insert({
        user_id: user.id,
        tester_id: tester?.id || null,
        type,
        description,
        page_url: page_url || null,
        severity: type === 'bug' ? (severity || 'medium') : null,
        status: 'new',
      })
      .select()
      .single();

    if (error) {
      console.error('Errore inserimento feedback:', error);
      return NextResponse.json(
        { error: 'Errore durante l\'invio. Riprova.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Grazie per il feedback!',
      id: data.id,
    });
  } catch (error) {
    console.error('Errore API beta/feedback POST:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Verifica autenticazione
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    // Verifica admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 });
    }

    // Parametri di filtro
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');

    // Query con join per info utente
    let query = supabase
      .from('beta_feedback')
      .select(`
        *,
        beta_testers (
          email,
          full_name
        )
      `)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (severity) {
      query = query.eq('severity', severity);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Errore fetch feedback:', error);
      return NextResponse.json({ error: 'Errore database' }, { status: 500 });
    }

    return NextResponse.json({ feedback: data });
  } catch (error) {
    console.error('Errore API beta/feedback GET:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
