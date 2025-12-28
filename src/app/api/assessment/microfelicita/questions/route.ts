// GET /api/assessment/microfelicita/questions
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { loadMicrofelicitaQuestions } from '@/lib/supabase/microfelicita';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const questions = await loadMicrofelicitaQuestions(supabase, true);
    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Errore API questions Microfelicità:', error);
    return NextResponse.json({ error: 'Errore caricamento domande' }, { status: 500 });
  }
}
