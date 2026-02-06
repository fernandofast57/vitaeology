// PATCH /api/beta/feedback/[id] - Update feedback (admin only)

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // I3 fix: Validazione formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'ID non valido' }, { status: 400 });
    }

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
    const { status, severity, resolution_notes } = body;

    // Validazione status
    const validStatuses = ['new', 'in_progress', 'resolved', 'wont_fix'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Status non valido' }, { status: 400 });
    }

    // Validazione severity
    const validSeverities = ['critical', 'high', 'medium', 'low', null];
    if (severity !== undefined && !validSeverities.includes(severity)) {
      return NextResponse.json({ error: 'Severità non valida' }, { status: 400 });
    }

    // Costruisci oggetto update
    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (severity !== undefined) updateData.severity = severity;
    if (resolution_notes !== undefined) updateData.resolution_notes = resolution_notes;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Nessun dato da aggiornare' }, { status: 400 });
    }

    // Update
    const { data, error } = await supabase
      .from('beta_feedback')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Errore update feedback:', error);
      return NextResponse.json({ error: 'Errore database' }, { status: 500 });
    }

    return NextResponse.json({ success: true, feedback: data });
  } catch (error) {
    console.error('Errore API beta/feedback/[id]:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
