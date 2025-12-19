// API per recuperare la cronologia delle conversazioni AI Coach
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface ConversationHistory {
  id: string;
  session_id: string;
  user_message: string;
  ai_response: string;
  created_at: string;
}

interface HistoryResponse {
  conversations: ConversationHistory[];
  sessionId: string | null;
}

export async function GET(request: NextRequest): Promise<NextResponse<HistoryResponse | { error: string }>> {
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

    // Parametri opzionali dalla query string
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const sessionId = searchParams.get('sessionId');

    // Query per recuperare conversazioni recenti
    let query = supabase
      .from('ai_coach_conversations')
      .select('id, session_id, user_message, ai_response, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    // Se c'è un sessionId specifico, filtra per quello
    // Altrimenti prendi le conversazioni delle ultime 24 ore
    if (sessionId) {
      query = query.eq('session_id', sessionId);
    } else {
      // Prendi le conversazioni delle ultime 24 ore
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('created_at', twentyFourHoursAgo);
    }

    query = query.limit(limit);

    const { data: conversations, error: queryError } = await query;

    if (queryError) {
      console.error('Errore query conversazioni:', queryError);
      return NextResponse.json(
        { error: 'Errore nel recupero delle conversazioni' },
        { status: 500 }
      );
    }

    // Determina l'ultimo sessionId usato
    const lastSessionId = conversations && conversations.length > 0
      ? conversations[conversations.length - 1].session_id
      : null;

    return NextResponse.json({
      conversations: conversations || [],
      sessionId: lastSessionId,
    });

  } catch (error) {
    console.error('Errore API history:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
