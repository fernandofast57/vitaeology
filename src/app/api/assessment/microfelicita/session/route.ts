// POST /api/assessment/microfelicita/session
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getInProgressMicrofelicita,
  createMicrofelicitaSession,
  loadMicrofelicitaAnswers,
} from '@/lib/supabase/microfelicita';
import { checkAssessmentAccess } from '@/lib/assessment-access';

export async function POST() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    // Verifica accesso all'assessment
    const hasAccess = await checkAssessmentAccess(supabase, user.id, 'microfelicita');
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Accesso non autorizzato. Acquista il libro o completa la challenge per sbloccare questo assessment.' },
        { status: 403 }
      );
    }

    let session = await getInProgressMicrofelicita(supabase, user.id);
    let answers: Record<number, number> = {};

    if (session) {
      const answersMap = await loadMicrofelicitaAnswers(supabase, session.id);
      answersMap.forEach((answer, questionId) => {
        answers[questionId] = answer.rawScore;
      });
    } else {
      const sessionId = await createMicrofelicitaSession(supabase, user.id);
      session = {
        id: sessionId,
        user_id: user.id,
        assessment_type: 'microfelicita',
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
    console.error('Errore API session Microfelicità:', error);
    return NextResponse.json({ error: 'Errore gestione sessione' }, { status: 500 });
  }
}
