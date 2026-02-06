// API per modificare un messaggio utente e rigenerare risposta AI
import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase/service';
import { getAnthropicClient } from '@/lib/ai-clients';
import { buildSystemPrompt } from '@/lib/ai-coach/system-prompt';
import { getRAGContextWithMetadata, PathType } from '@/lib/rag';
import { getUserMemory, generateMemoryContext } from '@/lib/ai-coach/user-memory';
import { UserContext } from '@/lib/ai-coach/types';

export const dynamic = 'force-dynamic';

interface EditRequest {
  conversationId: string;
  newContent: string;
  userContext: UserContext;
  previousMessages?: { role: 'user' | 'assistant'; content: string }[];
}

interface EditResponse {
  success: boolean;
  newAiResponse?: string;
  error?: string;
}

// Limite tempo per modifica: 5 minuti
const EDIT_TIME_LIMIT_MS = 5 * 60 * 1000;

export async function POST(request: NextRequest): Promise<NextResponse<EditResponse>> {
  const startTime = Date.now();

  try {
    // === AUTENTICAZIONE SERVER-SIDE (C2 fix) ===
    const authSupabase = await createClient();
    const { data: { user: authUser }, error: authError } = await authSupabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { success: false, error: 'Non autenticato' },
        { status: 401 }
      );
    }

    const authenticatedUserId = authUser.id;

    const body: EditRequest = await request.json();
    const { conversationId, newContent, userContext, previousMessages } = body;

    // Sovrascrivi userId dal client con quello autenticato
    if (userContext) {
      userContext.userId = authenticatedUserId;
    }

    if (!conversationId || !newContent?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Parametri mancanti' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    const anthropic = getAnthropicClient();

    // 1. Recupera la conversazione originale
    const { data: conversation, error: fetchError } = await supabase
      .from('ai_coach_conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (fetchError || !conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversazione non trovata' },
        { status: 404 }
      );
    }

    // 2. Verifica che non sia già stata modificata
    if (conversation.is_edited) {
      return NextResponse.json(
        { success: false, error: 'Messaggio già modificato (max 1 modifica)' },
        { status: 400 }
      );
    }

    // 3. Verifica limite di tempo (5 minuti)
    const messageTime = new Date(conversation.created_at).getTime();
    const timeSinceCreation = Date.now() - messageTime;
    if (timeSinceCreation > EDIT_TIME_LIMIT_MS) {
      return NextResponse.json(
        { success: false, error: 'Tempo scaduto per la modifica (max 5 minuti)' },
        { status: 400 }
      );
    }

    // 4. Verifica che l'utente sia il proprietario (usa ID autenticato, non client)
    if (conversation.user_id !== authenticatedUserId) {
      return NextResponse.json(
        { success: false, error: 'Non autorizzato' },
        { status: 403 }
      );
    }

    // 5. Recupera contesto RAG per il nuovo messaggio
    const currentPath = (conversation.current_path as PathType) || 'leadership';
    const ragResult = await getRAGContextWithMetadata(newContent, currentPath);

    // 6. Carica memoria utente
    let memoryContext = '';
    const userMemory = await getUserMemory(userContext.userId);
    if (userMemory) {
      memoryContext = generateMemoryContext(userMemory);
    }

    // 7. Costruisci messaggi per Claude (usa messaggi precedenti + nuovo messaggio modificato)
    const messagesForClaude = previousMessages
      ? [...previousMessages, { role: 'user' as const, content: newContent }]
      : [{ role: 'user' as const, content: newContent }];

    // 8. Genera nuova risposta AI
    const systemPrompt = buildSystemPrompt(userContext) + ragResult.context + memoryContext;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messagesForClaude,
    });

    const newAiResponse = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    if (!newAiResponse) {
      return NextResponse.json(
        { success: false, error: 'Errore generazione risposta' },
        { status: 500 }
      );
    }

    // 9. Calcola metriche (token reali da Claude)
    const responseTimeMs = Date.now() - startTime;
    const userMessageTokens = response.usage.input_tokens;
    const aiResponseTokens = response.usage.output_tokens;
    const modelUsed = response.model;

    // Calcola costo API
    const costPerInputToken = 3.00 / 1_000_000;
    const costPerOutputToken = 15.00 / 1_000_000;
    const apiCostUsd = (userMessageTokens * costPerInputToken) + (aiResponseTokens * costPerOutputToken);

    // 10. Aggiorna database con nuovo messaggio e risposta
    const { error: updateError } = await supabase
      .from('ai_coach_conversations')
      .update({
        user_message: newContent,
        user_message_tokens: userMessageTokens,
        ai_response: newAiResponse,
        ai_response_tokens: aiResponseTokens,
        original_content: conversation.user_message, // Salva messaggio originale
        is_edited: true,
        edited_at: new Date().toISOString(),
        rag_chunks_used: ragResult.chunkIds.length > 0 ? ragResult.chunkIds : null,
        rag_similarity_scores: ragResult.similarityScores.length > 0 ? ragResult.similarityScores : null,
        response_time_ms: responseTimeMs,
        model_used: modelUsed,
        api_cost_usd: apiCostUsd,
      })
      .eq('id', conversationId);

    if (updateError) {
      console.error('Errore aggiornamento conversazione:', updateError);
      return NextResponse.json(
        { success: false, error: 'Errore salvataggio modifica' },
        { status: 500 }
      );
    }

    // 11. Registra segnale implicito
    try {
      await supabase
        .from('ai_coach_implicit_signals')
        .insert({
          conversation_id: conversationId,
          user_id: userContext.userId,
          session_id: conversation.session_id,
          signal_type: 'edited_message',
          metadata: {
            original_length: conversation.user_message.length,
            new_length: newContent.length,
            time_since_creation_ms: timeSinceCreation,
          },
        });
    } catch (signalError) {
      console.error('Errore registrazione segnale:', signalError);
    }

    return NextResponse.json({
      success: true,
      newAiResponse,
    });

  } catch (error) {
    console.error('Errore modifica messaggio:', error);

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { success: false, error: 'Servizio temporaneamente non disponibile' },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
