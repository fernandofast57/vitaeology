// API per gestire lista conversazioni (sessioni) AI Coach
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface SessionSummary {
  sessionId: string;
  title: string;
  updatedAt: string;
  messagesCount: number;
  matchedContent?: string;
}

interface ConversationsResponse {
  conversations: SessionSummary[];
  hasMore: boolean;
}

export async function GET(request: NextRequest): Promise<NextResponse<ConversationsResponse | { error: string }>> {
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

    // Parametri dalla query string
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (search) {
      // Ricerca full-text nei messaggi
      const { data: searchResults, error: searchError } = await supabase
        .from('ai_coach_conversations')
        .select('id, session_id, user_message, ai_response, created_at')
        .eq('user_id', user.id)
        .or(`user_message.ilike.%${search}%,ai_response.ilike.%${search}%`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (searchError) {
        console.error('Errore ricerca conversazioni:', searchError);
        return NextResponse.json(
          { error: 'Errore nella ricerca' },
          { status: 500 }
        );
      }

      // Raggruppa per sessione, prendi prima occorrenza
      const seenSessions = new Set<string>();
      const conversations: SessionSummary[] = [];

      searchResults?.forEach((row) => {
        const sid = row.session_id || row.id;
        if (seenSessions.has(sid)) return;
        seenSessions.add(sid);

        // Determina quale campo contiene il match
        const userMatch = row.user_message?.toLowerCase().includes(search.toLowerCase());
        const matchedContent = userMatch ? row.user_message : row.ai_response;

        conversations.push({
          sessionId: sid,
          title: row.user_message?.slice(0, 50) || 'Conversazione',
          updatedAt: row.created_at,
          messagesCount: 0, // Non calcoliamo per la ricerca
          matchedContent: matchedContent?.slice(0, 100),
        });
      });

      return NextResponse.json({
        conversations,
        hasMore: false,
      });
    }

    // Query normale: raggruppa per session_id
    // Prima otteniamo tutte le sessioni uniche con l'ultimo messaggio
    const { data: sessionsData, error: queryError } = await supabase
      .from('ai_coach_conversations')
      .select('session_id, user_message, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (queryError) {
      console.error('Errore query conversazioni:', queryError);
      return NextResponse.json(
        { error: 'Errore nel recupero delle conversazioni' },
        { status: 500 }
      );
    }

    // Raggruppa per sessione e calcola statistiche
    const sessionMap = new Map<string, {
      firstMessage: string;
      lastUpdated: string;
      count: number;
    }>();

    sessionsData?.forEach((row) => {
      const sid = row.session_id || row.created_at; // Fallback se session_id null
      const existing = sessionMap.get(sid);

      if (!existing) {
        sessionMap.set(sid, {
          firstMessage: row.user_message || 'Conversazione',
          lastUpdated: row.created_at,
          count: 1,
        });
      } else {
        existing.count++;
        // Aggiorna lastUpdated se più recente (i dati sono ordinati desc, quindi il primo è il più recente)
      }
    });

    // Converti a array e ordina per data più recente
    const allSessions = Array.from(sessionMap.entries())
      .map(([sessionId, data]) => ({
        sessionId,
        title: data.firstMessage.slice(0, 50),
        updatedAt: data.lastUpdated,
        messagesCount: data.count,
      }))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    // Applica paginazione
    const paginatedSessions = allSessions.slice(offset, offset + limit);

    return NextResponse.json({
      conversations: paginatedSessions,
      hasMore: offset + limit < allSessions.length,
    });

  } catch (error) {
    console.error('Errore API conversations:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// DELETE per eliminare una sessione intera
export async function DELETE(request: NextRequest): Promise<NextResponse<{ success: boolean } | { error: string }>> {
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

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId richiesto' },
        { status: 400 }
      );
    }

    // Verifica che la sessione appartenga all'utente
    const { data: sessionCheck, error: checkError } = await supabase
      .from('ai_coach_conversations')
      .select('id')
      .eq('user_id', user.id)
      .eq('session_id', sessionId)
      .limit(1)
      .single();

    if (checkError || !sessionCheck) {
      return NextResponse.json(
        { error: 'Sessione non trovata o non autorizzato' },
        { status: 403 }
      );
    }

    // Elimina tutti i messaggi della sessione
    const { error: deleteError } = await supabase
      .from('ai_coach_conversations')
      .delete()
      .eq('user_id', user.id)
      .eq('session_id', sessionId);

    if (deleteError) {
      console.error('Errore eliminazione sessione:', deleteError);
      return NextResponse.json(
        { error: 'Errore eliminazione conversazione' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Errore API delete conversation:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
