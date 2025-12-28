// /api/assessment/session - Gestione sessione assessment
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getInProgressAssessment,
  createAssessmentSession,
  loadAnswers,
} from '@/lib/supabase/assessment';
import { checkAssessmentAccess } from '@/lib/assessment-access';

export const dynamic = 'force-dynamic';

// GET - Recupera sessione in corso o crea nuova
export async function GET() {
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

    // Verifica accesso all'assessment LITE
    const hasAccess = await checkAssessmentAccess(supabase, user.id, 'lite');
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Accesso non autorizzato. Acquista il libro Leadership Autentica o completa la challenge per sbloccare questo assessment.' },
        { status: 403 }
      );
    }

    // Cerca sessione in corso
    let session = await getInProgressAssessment(supabase, user.id);
    let answers: Record<number, number> = {};

    if (session) {
      // Carica risposte esistenti
      const answersMap = await loadAnswers(supabase, session.id);
      answersMap.forEach((answer, questionId) => {
        answers[questionId] = answer.rawScore;
      });
    } else {
      // Crea nuova sessione
      const sessionId = await createAssessmentSession(supabase, user.id);
      session = {
        id: sessionId,
        user_id: user.id,
        assessment_type: 'lite',
        status: 'in_progress',
        current_question_index: 0,
        started_at: new Date().toISOString(),
        completed_at: null,
      };
    }

    return NextResponse.json({
      session: {
        id: session.id,
        currentQuestionIndex: session.current_question_index,
        status: session.status,
      },
      answers,
    });
  } catch (error) {
    console.error('Errore API session GET:', error);
    return NextResponse.json(
      { error: 'Errore gestione sessione' },
      { status: 500 }
    );
  }
}

// DELETE - Abbandona sessione corrente (per ricominciare)
export async function DELETE() {
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

    // Trova e abbandona sessione in corso
    const session = await getInProgressAssessment(supabase, user.id);
    if (session) {
      await supabase
        .from('user_assessments_v2')
        .update({ status: 'abandoned' })
        .eq('id', session.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Errore API session DELETE:', error);
    return NextResponse.json(
      { error: 'Errore abbandono sessione' },
      { status: 500 }
    );
  }
}
