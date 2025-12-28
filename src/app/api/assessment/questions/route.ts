// GET /api/assessment/questions - Carica le domande LITE
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { loadLiteQuestions } from '@/lib/supabase/assessment';
import { sortQuestionsByPillar } from '@/lib/assessment-scoring';

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

    // Carica e ordina le domande
    const questions = await loadLiteQuestions(supabase);
    const sortedQuestions = sortQuestionsByPillar(questions);

    return NextResponse.json({ questions: sortedQuestions });
  } catch (error) {
    console.error('Errore API questions:', error);
    return NextResponse.json(
      { error: 'Errore caricamento domande' },
      { status: 500 }
    );
  }
}
