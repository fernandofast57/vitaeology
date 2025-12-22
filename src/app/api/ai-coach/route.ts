import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ChatRequest, ChatResponse, Message } from '@/lib/ai-coach/types';
import { buildSystemPrompt } from '@/lib/ai-coach/system-prompt';
import { getRAGContextWithMetadata, PathType } from '@/lib/rag';
import { getUserMemory, generateMemoryContext, createUserMemory } from '@/lib/ai-coach/user-memory';
import { createCorrectionSuggestionService } from '@/lib/services/correction-suggestion';
import { createExerciseRecommendationService } from '@/lib/services/exercise-recommendation';
import {
  trackImplicitSignal,
  detectReformulation
} from '@/lib/ai-coach/implicit-signals';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

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

    // === TRACKING SEGNALI IMPLICITI ===
    const userMessages = messages.filter((m: Message) => m.role === 'user');

    if (userMessages.length > 1 && userContext?.userId) {
      const previousUserMsg = userMessages[userMessages.length - 2];
      const currentUserMsg = userMessages[userMessages.length - 1];

      // Detecta riformulazione (domanda simile alla precedente)
      if (detectReformulation(currentUserMsg.content, previousUserMsg.content)) {
        // Salva segnale in background (non blocchiamo la risposta)
        trackImplicitSignal({
          conversationId: clientSessionId || sessionId,
          userId: userContext.userId,
          sessionId,
          signalType: 'reformulated_question',
          metadata: {
            previousMessage: previousUserMsg.content.substring(0, 100),
            currentMessage: currentUserMsg.content.substring(0, 100),
          }
        }).catch(err => console.error('[ImplicitSignals] Track error:', err));

        console.log('🔄 Segnale implicito: riformulazione rilevata');
      }

      // Nota: detectImmediateQuestion richiede timestamp che non abbiamo nel Message
      // TODO: aggiungere timestamp ai messaggi client-side per abilitare questo check
    }

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

    // Carica correzioni attive dal sistema di ottimizzazione
    let correctionsContext = '';
    let ragCorrectionsContext = '';
    try {
      const correctionService = createCorrectionSuggestionService(supabase);

      // Carica istruzioni prompt
      correctionsContext = await correctionService.generateCorrectionBlock();

      // Carica chunk RAG correttivi
      const ragChunks = await correctionService.getRAGChunks();
      if (ragChunks.length > 0) {
        ragCorrectionsContext = '\n\n## CONTENUTI CORRETTIVI (applica sempre)\n\n';
        ragChunks.forEach(chunk => {
          ragCorrectionsContext += chunk.content + '\n\n';
        });
        console.log(`🔧 ${ragChunks.length} chunk RAG correttivi caricati`);
      }

      if (correctionsContext) {
        console.log('🔧 Correzioni prompt attive caricate');
      }
    } catch (corrError) {
      console.error('Errore caricamento correzioni:', corrError);
    }

    // Carica raccomandazioni esercizi personalizzate
    let exerciseRecommendationsContext = '';
    if (userContext?.userId) {
      try {
        const recommendationService = createExerciseRecommendationService(supabase);
        exerciseRecommendationsContext = await recommendationService.generateAICoachContext(userContext.userId);
        if (exerciseRecommendationsContext) {
          console.log('📚 Raccomandazioni esercizi caricate');
        }
      } catch (recError) {
        console.error('Errore caricamento raccomandazioni:', recError);
      }
    }

    // Costruisci system prompt con contesto RAG, memoria utente, correzioni, RAG correttivi e raccomandazioni
    const systemPrompt = buildSystemPrompt(userContext) + ragResult.context + memoryContext + correctionsContext + ragCorrectionsContext + exerciseRecommendationsContext;

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

    // Estrai token usage dalla risposta Claude (valori reali)
    const userMessageTokens = response.usage.input_tokens;
    const aiResponseTokens = response.usage.output_tokens;
    const modelUsed = response.model;

    // Calcola costo API (prezzi Claude Sonnet 4)
    // Input: $3 per 1M tokens, Output: $15 per 1M tokens
    const costPerInputToken = 3.00 / 1_000_000;
    const costPerOutputToken = 15.00 / 1_000_000;
    const apiCostUsd = (userMessageTokens * costPerInputToken) + (aiResponseTokens * costPerOutputToken);

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
            model_used: modelUsed,
            api_cost_usd: apiCostUsd,
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
