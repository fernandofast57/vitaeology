// GET /api/assessment/risolutore/questions - Carica domande Risolutore
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { loadRisolutoreQuestions } from '@/lib/supabase/risolutore';

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

    // Carica domande (mescolate per ordine casuale)
    const questions = await loadRisolutoreQuestions(supabase, true);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Errore API questions Risolutore:', error);
    return NextResponse.json(
      { error: 'Errore caricamento domande' },
      { status: 500 }
    );
  }
}
