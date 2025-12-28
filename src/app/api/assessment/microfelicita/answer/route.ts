// POST /api/assessment/microfelicita/answer
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getInProgressMicrofelicita,
  saveMicrofelicitaAnswer,
  updateMicrofelicitaCurrentQuestion,
} from '@/lib/supabase/microfelicita';

interface AnswerPayload {
  questionId: number;
  rawScore: number;
  scoringType: 'inverse' | 'direct';
  nextQuestionIndex: number;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const session = await getInProgressMicrofelicita(supabase, user.id);
    if (!session) {
      return NextResponse.json({ error: 'Nessuna sessione in corso' }, { status: 400 });
    }

    const body: AnswerPayload = await request.json();
    const { questionId, rawScore, scoringType, nextQuestionIndex } = body;

    if (!questionId || rawScore < 0 || rawScore > 2) {
      return NextResponse.json({ error: 'Dati non validi' }, { status: 400 });
    }

    await saveMicrofelicitaAnswer(supabase, session.id, questionId, rawScore, scoringType);
    await updateMicrofelicitaCurrentQuestion(supabase, session.id, nextQuestionIndex);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Errore API answer Microfelicità:', error);
    return NextResponse.json({ error: 'Errore salvataggio risposta' }, { status: 500 });
  }
}
