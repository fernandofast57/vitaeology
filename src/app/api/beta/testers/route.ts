// GET /api/beta/testers - Lista candidature (admin only)

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Forza rendering dinamico (usa cookies)
export const dynamic = 'force-dynamic';

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

    // Parametri di filtro (I2 fix: whitelist valori validi)
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const cohort = searchParams.get('cohort');

    const validStatuses = ['pending', 'approved', 'rejected', 'active', 'completed'];
    const validCohorts = ['alpha', 'beta_1', 'beta_2', 'beta_3'];

    // Query
    let query = supabase
      .from('beta_testers')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && validStatuses.includes(status)) {
      query = query.eq('status', status);
    }

    if (cohort && validCohorts.includes(cohort)) {
      query = query.eq('cohort', cohort);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Errore fetch beta testers:', error);
      return NextResponse.json({ error: 'Errore database' }, { status: 500 });
    }

    return NextResponse.json({ testers: data });
  } catch (error) {
    console.error('Errore API beta/testers:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
