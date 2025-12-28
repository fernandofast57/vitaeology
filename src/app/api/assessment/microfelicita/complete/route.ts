// POST /api/assessment/microfelicita/complete
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getInProgressMicrofelicita,
  completeMicrofelicitaAssessment,
} from '@/lib/supabase/microfelicita';

export const dynamic = 'force-dynamic';

export async function POST() {
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

    const results = await completeMicrofelicitaAssessment(supabase, session.id);

    return NextResponse.json({
      success: true,
      assessmentId: session.id,
      results,
    });
  } catch (error) {
    console.error('Errore API complete Microfelicità:', error);
    return NextResponse.json({ error: 'Errore completamento assessment' }, { status: 500 });
  }
}
