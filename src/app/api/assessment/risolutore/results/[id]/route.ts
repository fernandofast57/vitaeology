// GET /api/assessment/risolutore/results/[id] - Recupera risultati
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getCompletedRisolutore,
  loadSavedRisolutoreResults,
} from '@/lib/supabase/risolutore';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params;
    const supabase = await createClient();

    // Verifica autenticazione
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    // Verifica che l'assessment esista e sia completato
    const assessment = await getCompletedRisolutore(supabase, assessmentId);
    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment non trovato o non completato' },
        { status: 404 }
      );
    }

    // Verifica che l'assessment appartenga all'utente
    if (assessment.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 403 }
      );
    }

    // Carica risultati
    const results = await loadSavedRisolutoreResults(supabase, assessmentId);
    if (!results) {
      return NextResponse.json(
        { error: 'Risultati non disponibili' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      assessmentId,
      completedAt: assessment.completed_at,
      results,
    });
  } catch (error) {
    console.error('Errore API results Risolutore:', error);
    return NextResponse.json(
      { error: 'Errore recupero risultati' },
      { status: 500 }
    );
  }
}
