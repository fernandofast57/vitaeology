import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase/service';
import { CreateSignalInput, SignalType } from '@/types/ai-coach-learning';

export const dynamic = 'force-dynamic';

const VALID_SIGNAL_TYPES: SignalType[] = [
  'reformulated_question',
  'abandoned_conversation',
  'long_pause_before_reply',
  'immediate_new_question',
  'completed_exercise',
  'skipped_exercise',
  'returned_to_topic',
  'escalation_requested',
];

export async function POST(request: NextRequest) {
  try {
    // === AUTENTICAZIONE SERVER-SIDE (C5 fix) ===
    const authSupabase = await createClient();
    const { data: { user: authUser }, error: authError } = await authSupabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    const authenticatedUserId = authUser.id;

    const body: CreateSignalInput = await request.json();
    const { conversation_id, session_id, signal_type, metadata } = body;

    // Validazione
    if (!conversation_id || !session_id || !signal_type) {
      return NextResponse.json(
        { error: 'Campi obbligatori mancanti' },
        { status: 400 }
      );
    }

    if (!VALID_SIGNAL_TYPES.includes(signal_type)) {
      return NextResponse.json(
        { error: 'Tipo di segnale non valido' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Inserisci segnale con user_id autenticato dal server
    const { data, error } = await supabase
      .from('ai_coach_implicit_signals')
      .insert({
        conversation_id,
        user_id: authenticatedUserId,
        session_id,
        signal_type,
        metadata: metadata || {},
      })
      .select('id')
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Errore salvataggio segnale' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      signalId: data?.id,
    });

  } catch {
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
