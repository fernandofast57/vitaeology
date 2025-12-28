// GET /api/assessment/microfelicita/results/[id]
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getCompletedMicrofelicita,
  loadSavedMicrofelicitaResults,
} from '@/lib/supabase/microfelicita';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params;
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const assessment = await getCompletedMicrofelicita(supabase, assessmentId);
    if (!assessment) {
      return NextResponse.json({ error: 'Assessment non trovato' }, { status: 404 });
    }

    if (assessment.user_id !== user.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    const results = await loadSavedMicrofelicitaResults(supabase, assessmentId);
    if (!results) {
      return NextResponse.json({ error: 'Risultati non disponibili' }, { status: 404 });
    }

    return NextResponse.json({
      assessmentId,
      completedAt: assessment.completed_at,
      results,
    });
  } catch (error) {
    console.error('Errore API results Microfelicità:', error);
    return NextResponse.json({ error: 'Errore recupero risultati' }, { status: 500 });
  }
}
