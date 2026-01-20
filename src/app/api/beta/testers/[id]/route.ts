// PATCH /api/beta/testers/[id] - Update tester (admin only)

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const body = await request.json();
    const { status, cohort, notes } = body;

    // Validazione status
    const validStatuses = ['pending', 'approved', 'rejected', 'active', 'completed'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Status non valido' }, { status: 400 });
    }

    // Validazione cohort
    const validCohorts = ['A', 'B', 'C', 'open', null];
    if (cohort !== undefined && !validCohorts.includes(cohort)) {
      return NextResponse.json({ error: 'Cohort non valida' }, { status: 400 });
    }

    // Costruisci oggetto update
    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (cohort !== undefined) updateData.cohort = cohort;
    if (notes !== undefined) updateData.notes = notes;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Nessun dato da aggiornare' }, { status: 400 });
    }

    // Update
    const { data, error } = await supabase
      .from('beta_testers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Errore update beta tester:', error);
      return NextResponse.json({ error: 'Errore database' }, { status: 500 });
    }

    return NextResponse.json({ success: true, tester: data });
  } catch (error) {
    console.error('Errore API beta/testers/[id]:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const { data, error } = await supabase
      .from('beta_testers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Tester non trovato' }, { status: 404 });
    }

    return NextResponse.json({ tester: data });
  } catch (error) {
    console.error('Errore API beta/testers/[id] GET:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
