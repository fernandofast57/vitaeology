import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ChatRequest, ChatResponse } from '@/lib/ai-coach/types';
import { buildSystemPrompt } from '@/lib/ai-coach/system-prompt';
import { getRAGContextWithMetadata, PathType } from '@/lib/rag';
import { getUserMemory, generateMemoryContext, createUserMemory } from '@/lib/ai-coach/user-memory';
import { v4 as uuidv4 } from 'uuid';

// Lazy initialization per evitare errori durante il build
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getAnthropicClient() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

export async function POST(request: NextRequest): Promise<NextResponse<ChatResponse>> {
  const startTime = Date.now();

  try {
    const body: ChatRequest = await request.json();
    const { messages, userContext, sessionId: clientSessionId, currentPath: requestPath } = body;

    const supabase = getSupabaseClient();
    const anthropic = getAnthropicClient();

    // Genera o usa sessionId fornito
    const sessionId = clientSessionId || uuidv4();

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { message: 'Nessun messaggio fornito' },
        { status: 400 }
      );
    }

    // Recupera current_path dell'utente dal profilo o usa quello dalla request
    let currentPath: PathType | null = requestPath || null;
    if (!currentPath && userContext?.userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_path')
        .eq('id', userContext.userId)
        .single();

      currentPath = (profile?.current_path as PathType) || 'leadership';
    }

    // Prendi l'ultimo messaggio utente per il RAG
    const lastUserMessage = messages
      .filter(m => m.role === 'user')
      .pop()?.content || '';

    // DEBUG RAG - Log messaggio utente
    console.log('\n🔍 [RAG DEBUG] ===================================');
    console.log('📝 Messaggio utente:', lastUserMessage);
    console.log('📂 Percorso corrente:', currentPath || 'nessuno');

    // Cerca contesto rilevante dai libri (filtrato per percorso) con metadati
    const ragResult = await getRAGContextWithMetadata(lastUserMessage, currentPath);

    // DEBUG RAG - Log contesto trovato
    if (ragResult.context && ragResult.context.trim().length > 0) {
      console.log('✅ Contesto RAG trovato:', ragResult.context.substring(0, 500) + '...');
      console.log('📊 Chunk IDs:', ragResult.chunkIds);
      console.log('📈 Similarity scores:', ragResult.similarityScores);
    } else {
      console.log('⚠️ Nessun contesto RAG trovato');
    }
    console.log('🔍 [RAG DEBUG] ===================================\n');

    // Carica memoria utente per personalizzazione
    let memoryContext = '';
    if (userContext?.userId) {
      let userMemory = await getUserMemory(userContext.userId);
      if (!userMemory) {
        // Crea memoria utente se non esiste
        userMemory = await createUserMemory(userContext.userId);
      }
      memoryContext = generateMemoryContext(userMemory);
      if (memoryContext) {
        console.log('🧠 Memoria utente caricata');
      }
    }

    // Costruisci system prompt con contesto RAG e memoria utente
    const systemPrompt = buildSystemPrompt(userContext) + ragResult.context + memoryContext;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    const assistantMessage = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    // Calcola tempo di risposta
    const responseTimeMs = Date.now() - startTime;

    // Rileva se e un alert di sicurezza
    const safetyKeywords = [
      'Telefono Amico',
      'Emergenze: 112',
      'non sono un terapeuta',
    ];
    const isSafetyAlert = safetyKeywords.some(keyword =>
      assistantMessage.includes(keyword)
    );

    // Conta token (approssimativo: ~4 caratteri per token)
    const userMessageTokens = Math.ceil(lastUserMessage.length / 4);
    const aiResponseTokens = Math.ceil(assistantMessage.length / 4);

    // Salva conversazione nel database per il Learning System
    let conversationId: string | undefined;
    if (userContext?.userId) {
      try {
        const { data: convData, error: convError } = await supabase
          .from('ai_coach_conversations')
          .insert({
            user_id: userContext.userId,
            session_id: sessionId,
            current_path: currentPath,
            exercise_id: userContext.currentExercise?.id || null,
            user_message: lastUserMessage,
            user_message_tokens: userMessageTokens,
            ai_response: assistantMessage,
            ai_response_tokens: aiResponseTokens,
            rag_chunks_used: ragResult.chunkIds.length > 0 ? ragResult.chunkIds : null,
            rag_similarity_scores: ragResult.similarityScores.length > 0 ? ragResult.similarityScores : null,
            response_time_ms: responseTimeMs,
          })
          .select('id')
          .single();

        if (convError) {
          console.error('Errore salvataggio conversazione:', convError);
        } else {
          conversationId = convData?.id;
          console.log('✅ Conversazione salvata:', conversationId);
        }
      } catch (dbError) {
        console.error('Errore DB conversazione:', dbError);
      }
    }

    return NextResponse.json({
      message: assistantMessage,
      isSafetyAlert,
      conversationId,
      sessionId,
    });

  } catch (error) {
    console.error('Errore AI Coach:', error);

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { message: `Errore API Anthropic: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { message: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
