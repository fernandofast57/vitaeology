// POST /api/assessment/risolutore/answer - Salva una risposta
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getInProgressRisolutore,
  saveRisolutoreAnswer,
  updateRisolutoreCurrentQuestion,
} from '@/lib/supabase/risolutore';

export const dynamic = 'force-dynamic';

interface AnswerPayload {
  questionId: number;
  rawScore: number; // 0=FALSO, 1=INCERTO, 2=VERO
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
    const session = await getInProgressRisolutore(supabase, user.id);
    if (!session) {
      return NextResponse.json(
        { error: 'Nessuna sessione in corso' },
        { status: 400 }
      );
    }

    // Parse body
    const body: AnswerPayload = await request.json();
    const { questionId, rawScore, scoringType, nextQuestionIndex } = body;

    // Validazione scala 0-2
    if (!questionId || rawScore < 0 || rawScore > 2) {
      return NextResponse.json(
        { error: 'Dati non validi. Punteggio deve essere 0, 1 o 2' },
        { status: 400 }
      );
    }

    // Salva risposta
    await saveRisolutoreAnswer(supabase, session.id, questionId, rawScore, scoringType);

    // Aggiorna posizione
    await updateRisolutoreCurrentQuestion(supabase, session.id, nextQuestionIndex);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Errore API answer Risolutore:', error);
    return NextResponse.json(
      { error: 'Errore salvataggio risposta' },
      { status: 500 }
    );
  }
}
