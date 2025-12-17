import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CreateFeedbackInput } from '@/types/ai-coach-learning';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateFeedbackInput = await request.json();
    const { conversation_id, user_id, is_helpful, rating, comment, issue_category } = body;

    if (!conversation_id || !user_id) {
      return NextResponse.json(
        { error: 'conversation_id e user_id sono richiesti' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Verifica che la conversazione esista e appartenga all'utente
    const { data: conversation, error: convError } = await supabase
      .from('ai_coach_conversations')
      .select('id')
      .eq('id', conversation_id)
      .eq('user_id', user_id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: 'Conversazione non trovata' },
        { status: 404 }
      );
    }

    // Inserisci o aggiorna il feedback
    const { data: feedback, error: fbError } = await supabase
      .from('ai_coach_feedback')
      .upsert(
        {
          conversation_id,
          user_id,
          is_helpful,
          rating: rating || null,
          comment: comment || null,
          issue_category: issue_category || null,
        },
        {
          onConflict: 'conversation_id,user_id',
        }
      )
      .select()
      .single();

    if (fbError) {
      console.error('Errore salvataggio feedback:', fbError);
      return NextResponse.json(
        { error: 'Errore salvataggio feedback' },
        { status: 500 }
      );
    }

    console.log('Feedback salvato:', feedback?.id);

    return NextResponse.json({
      success: true,
      feedbackId: feedback?.id,
    });

  } catch (error) {
    console.error('Errore feedback API:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
