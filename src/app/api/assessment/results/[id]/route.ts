// GET /api/assessment/results/[id] - Recupera risultati assessment
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getCompletedAssessment,
  loadSavedResults,
} from '@/lib/supabase/assessment';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: assessmentId } = await params;

    // Verifica autenticazione
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    // Verifica che l'assessment esista e sia dell'utente
    const assessment = await getCompletedAssessment(supabase, assessmentId);
    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment non trovato' },
        { status: 404 }
      );
    }

    // Carica risultati
    const results = await loadSavedResults(supabase, assessmentId);
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
    console.error('Errore API results:', error);
    return NextResponse.json(
      { error: 'Errore caricamento risultati' },
      { status: 500 }
    );
  }
}
