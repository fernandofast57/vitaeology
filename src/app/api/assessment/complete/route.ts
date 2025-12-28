// POST /api/assessment/complete - Completa l'assessment
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getInProgressAssessment,
  completeAssessment,
} from '@/lib/supabase/assessment';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const supabase = await createClient();

    // Verifica autenticazione
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    // Recupera sessione in corso
    const session = await getInProgressAssessment(supabase, user.id);
    if (!session) {
      return NextResponse.json(
        { error: 'Nessuna sessione in corso' },
        { status: 400 }
      );
    }

    // Completa e calcola risultati
    const results = await completeAssessment(supabase, session.id);

    return NextResponse.json({
      success: true,
      assessmentId: session.id,
      results,
    });
  } catch (error) {
    console.error('Errore API complete:', error);
    return NextResponse.json(
      { error: 'Errore completamento assessment' },
      { status: 500 }
    );
  }
}
