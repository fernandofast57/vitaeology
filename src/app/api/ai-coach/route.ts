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
import { isClosingMessage } from '@/lib/ai-coach/exercise-suggestions';
import { checkGraduality } from '@/lib/services/graduality-check';
import { checkParole } from '@/lib/services/parole-check';
import { checkConcretezza } from '@/lib/services/concretezza-check';
import { v4 as uuidv4 } from 'uuid';
import { alertAICoachError } from '@/lib/error-alerts';
import { SUBSCRIPTION_TIERS, SubscriptionTier } from '@/lib/types/roles';
import { getCurrentAwarenessLevel, onAIConversation } from '@/lib/awareness';

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

    // === VERIFICA LIMITI AI COACH PER TIER ===
    let dailyLimit = 5; // Default per explorer o utenti non autenticati
    let userTier: SubscriptionTier = 'explorer';

    if (userContext?.userId) {
      // Recupera profilo utente per tier
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', userContext.userId)
        .single();

      if (profile?.subscription_tier) {
        userTier = profile.subscription_tier as SubscriptionTier;
        const tierConfig = SUBSCRIPTION_TIERS[userTier];
        if (tierConfig) {
          const limit = tierConfig.features.ai_coach_messages_per_day;
          dailyLimit = limit === 'unlimited' ? 999999 : limit;
        }
      }

      // Verifica limite giornaliero (solo per tier non illimitati)
      if (dailyLimit < 999999) {
        const { data: limitCheck, error: limitError } = await supabase
          .rpc('check_ai_coach_limit', {
            p_user_id: userContext.userId,
            p_daily_limit: dailyLimit
          });

        if (limitError) {
          console.error('Errore verifica limite AI Coach:', limitError);
        } else if (limitCheck && limitCheck.length > 0 && !limitCheck[0].can_send) {
          console.log(`⚠️ Limite AI Coach raggiunto: ${limitCheck[0].current_count}/${dailyLimit} (tier: ${userTier})`);
          return NextResponse.json(
            {
              message: `Hai raggiunto il limite giornaliero di ${dailyLimit} messaggi per il tuo piano ${SUBSCRIPTION_TIERS[userTier].display_name}. Passa a un piano superiore per più messaggi.`,
              limitReached: true,
              currentCount: limitCheck[0].current_count,
              dailyLimit: dailyLimit,
              tier: userTier
            },
            { status: 429 }
          );
        }
      }
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
    let awarenessLevel: number | undefined;
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

      // Carica livello awareness per adattamento Fernando
      const awarenessData = await getCurrentAwarenessLevel(userContext.userId);
      if (awarenessData) {
        awarenessLevel = awarenessData.level;
        console.log(`🎯 Awareness Level: ${awarenessLevel}`);
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

    // Rileva se è un messaggio di chiusura (grazie, ciao, ecc.)
    const isClosing = isClosingMessage(lastUserMessage);
    let closingHint = '';
    if (isClosing) {
      console.log('👋 Messaggio di chiusura rilevato - attivando wrap-up');
      closingHint = '\n\n[SISTEMA: L\'utente sta salutando. Applica le istruzioni di WRAP-UP CONVERSAZIONE: riepiloga brevemente il tema discusso, suggerisci un\'azione concreta per le prossime 24-48 ore, e se pertinente menziona un esercizio dalla lista disponibile.]';
    }

    // Costruisci system prompt con contesto RAG, memoria utente, correzioni, RAG correttivi, raccomandazioni e awareness
    const systemPrompt = buildSystemPrompt(userContext, currentPath || 'leadership', awarenessLevel) + ragResult.context + memoryContext + correctionsContext + ragCorrectionsContext + exerciseRecommendationsContext + closingHint;

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

    // === CHECK COMPRENSIONE (3 DIFFICOLTÀ) ===
    // Costruisci contesto dai messaggi precedenti
    const previousContent = messages
      .filter(m => m.role === 'assistant')
      .map(m => m.content)
      .join(' ');

    // 1. PAROLE - Termini tecnici non spiegati
    const paroleResult = checkParole(assistantMessage, previousContent);

    // 2. CONCRETEZZA - Esempi concreti
    const concretezzaResult = checkConcretezza(assistantMessage, previousContent);

    // 3. GRADUALITÀ - Sequenza logica
    const gradualityResult = checkGraduality(assistantMessage, {
      previousMessages: messages,
      topicsIntroduced: [],
    });

    // Log warning per monitoring (solo se score < 70)
    if (paroleResult.score < 70 || concretezzaResult.score < 70 || gradualityResult.score < 70) {
      console.log('\n⚠️ [COMPRENSIONE WARNING] ===========================');

      if (paroleResult.score < 70) {
        console.log('📖 PAROLE Score:', paroleResult.score + '/100');
        console.log('   Issues:', paroleResult.issues.slice(0, 2).map(i => i.term).join(', '));
      }

      if (concretezzaResult.score < 70) {
        console.log('🎯 CONCRETEZZA Score:', concretezzaResult.score + '/100');
        console.log('   Quality:', concretezzaResult.exampleQuality);
      }

      if (gradualityResult.score < 70) {
        console.log('📊 GRADUALITÀ Score:', gradualityResult.score + '/100');
        console.log('   Issues:', gradualityResult.metrics);
      }

      console.log('⚠️ [COMPRENSIONE WARNING] ===========================\n');
    }

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
            parole_score: paroleResult.score,
            concretezza_score: concretezzaResult.score,
            graduality_score: gradualityResult.score,
          })
          .select('id')
          .single();

        if (convError) {
          console.error('Errore salvataggio conversazione:', convError);
        } else {
          conversationId = convData?.id;
          console.log('✅ Conversazione salvata:', conversationId);

          // Aggiorna awareness level in background (prima conversazione o rating)
          const isFirstConversation = messages.filter((m: Message) => m.role === 'assistant').length === 0;
          onAIConversation(userContext.userId, isFirstConversation).catch(err =>
            console.error('[Awareness] Update error:', err)
          );
        }

        // Incrementa contatore utilizzo giornaliero AI Coach
        const { data: newCount, error: incrementError } = await supabase
          .rpc('increment_daily_usage', { p_user_id: userContext.userId });

        if (incrementError) {
          console.error('Errore incremento contatore AI Coach:', incrementError);
        } else {
          console.log(`📊 AI Coach usage: ${newCount}/${dailyLimit} (tier: ${userTier})`);
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

    // Invia alert per errori AI Coach
    await alertAICoachError(
      error instanceof Error ? error : new Error('Unknown AI Coach error'),
      { endpoint: '/api/ai-coach' }
    );

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
