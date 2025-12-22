import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CreateSignalInput, SignalType } from '@/types/ai-coach-learning';

export const dynamic = 'force-dynamic';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

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
    const body: CreateSignalInput = await request.json();
    const { conversation_id, user_id, session_id, signal_type, metadata } = body;

    // Validazione
    if (!conversation_id || !user_id || !session_id || !signal_type) {
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

    // Inserisci segnale
    const { data, error } = await supabase
      .from('ai_coach_implicit_signals')
      .insert({
        conversation_id,
        user_id,
        session_id,
        signal_type,
        metadata: metadata || {},
      })
      .select('id')
      .single();

    if (error) {
      console.error('Errore inserimento segnale:', error);
      return NextResponse.json(
        { error: 'Errore salvataggio segnale' },
        { status: 500 }
      );
    }

    console.log(`Segnale ${signal_type} registrato:`, data?.id);

    return NextResponse.json({
      success: true,
      signalId: data?.id,
    });

  } catch (error) {
    console.error('Errore signals API:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
