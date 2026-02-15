// POST /api/assessment/risolutore/session - Crea o recupera sessione
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getInProgressRisolutore,
  createRisolutoreSession,
  loadRisolutoreAnswers,
} from '@/lib/supabase/risolutore';
import { checkAssessmentAccess } from '@/lib/assessment-access';
import { markChallengeConvertedToAssessment } from '@/lib/challenges';

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

    // Verifica accesso all'assessment
    const hasAccess = await checkAssessmentAccess(supabase, user.id, 'risolutore');
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Accesso non autorizzato. Acquista il libro o completa la challenge per sbloccare questo assessment.' },
        { status: 403 }
      );
    }

    // Cerca sessione in corso
    let session = await getInProgressRisolutore(supabase, user.id);
    let answers: Record<number, number> = {};

    if (session) {
      // Recupera risposte esistenti
      const answersMap = await loadRisolutoreAnswers(supabase, session.id);
      answersMap.forEach((answer, questionId) => {
        answers[questionId] = answer.rawScore;
      });
    } else {
      // Crea nuova sessione
      const sessionId = await createRisolutoreSession(supabase, user.id);
      session = {
        id: sessionId,
        user_id: user.id,
        assessment_type: 'risolutore',
        status: 'in_progress',
        current_question_index: 0,
        started_at: new Date().toISOString(),
        completed_at: null,
      };

      // Tracking conversione challenge→assessment (P2 Viability)
      try {
        const { data: completedChallenges } = await supabase
          .from('challenge_subscribers')
          .select('id')
          .or(`user_id.eq.${user.id},email.eq.${user.email}`)
          .eq('status', 'completed')
          .eq('converted_to_assessment', false);

        if (completedChallenges && completedChallenges.length > 0) {
          for (const challenge of completedChallenges) {
            await markChallengeConvertedToAssessment(supabase, challenge.id);
          }
        }
      } catch (convError) {
        console.error('Errore tracking conversione challenge→assessment:', convError);
      }
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
    console.error('Errore API session Risolutore:', error);
    return NextResponse.json(
      { error: 'Errore gestione sessione' },
      { status: 500 }
    );
  }
}
