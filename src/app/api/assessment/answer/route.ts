// POST /api/assessment/answer - Salva una risposta
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getInProgressAssessment,
  saveAnswer,
  updateCurrentQuestion,
} from '@/lib/supabase/assessment';

export const dynamic = 'force-dynamic';

interface AnswerPayload {
  questionId: number;
  rawScore: number;
  scoringType: 'inverse' | 'direct';
  nextQuestionIndex: number;
}

export async function POST(request: NextRequest) {
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

    // Parse body
    const body: AnswerPayload = await request.json();
    const { questionId, rawScore, scoringType, nextQuestionIndex } = body;

    // Validazione
    if (!questionId || rawScore < 1 || rawScore > 5) {
      return NextResponse.json(
        { error: 'Dati non validi' },
        { status: 400 }
      );
    }

    // Salva risposta
    await saveAnswer(supabase, session.id, questionId, rawScore, scoringType);

    // Aggiorna posizione
    await updateCurrentQuestion(supabase, session.id, nextQuestionIndex);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Errore API answer:', error);
    return NextResponse.json(
      { error: 'Errore salvataggio risposta' },
      { status: 500 }
    );
  }
}
