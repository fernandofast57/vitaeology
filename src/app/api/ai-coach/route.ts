import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase/service';
import { checkRateLimit, getClientIP, rateLimitExceededResponse } from '@/lib/rate-limiter';
import { getAnthropicClient } from '@/lib/ai-clients';
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
import { calculateDiscoveryProfile } from '@/lib/challenge/discovery-data';
import { getChallengeDiscoveryType, getChallengeDisplayName } from '@/lib/challenge/config';
import type { ChallengeContext, MiniProfileContext } from '@/lib/ai-coach/types';

export const dynamic = 'force-dynamic';

// === HELPER: Fetch challenge context e mini-profilo per AI Coach ===

interface ChallengeAndMiniProfile {
  challengeContext?: ChallengeContext;
  miniProfileContext?: MiniProfileContext;
}

async function fetchChallengeContext(
  supabase: ReturnType<typeof getSupabaseClient>,
  userId: string,
  email: string,
  userTier: SubscriptionTier,
): Promise<ChallengeAndMiniProfile> {
  try {
    const { data: subscriber } = await supabase
      .from('challenge_subscribers')
      .select('challenge, current_day, status')
      .eq('email', email)
      .order('subscribed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!subscriber) return {};

    const discoveryType = getChallengeDiscoveryType(subscriber.challenge) || 'leadership';

    const challengeContext: ChallengeContext = {
      challengeType: subscriber.challenge,
      challengeName: getChallengeDisplayName(subscriber.challenge),
      currentDay: subscriber.current_day || 0,
      status: subscriber.status,
      hasAssessment: false,
      hasSubscription: userTier === 'leader' || userTier === 'mentor',
    };

    // Check assessment
    const { data: assessment } = await supabase
      .from('user_assessments_v2')
      .select('id')
      .eq('user_id', userId)
      .eq('assessment_type', discoveryType)
      .eq('is_completed', true)
      .limit(1)
      .maybeSingle();

    challengeContext.hasAssessment = !!assessment;

    // Mini-Profilo from discovery responses
    const { data: discoveryResponses } = await supabase
      .from('challenge_discovery_responses')
      .select('day_number, question_number, response')
      .eq('user_id', userId)
      .eq('challenge_type', discoveryType)
      .order('day_number')
      .order('question_number');

    let miniProfileContext: MiniProfileContext | undefined;

    if (discoveryResponses && discoveryResponses.length > 0) {
      const formatted: Record<number, Record<number, 'A' | 'B' | 'C'>> = {};
      for (const r of discoveryResponses) {
        if (!formatted[r.day_number]) formatted[r.day_number] = {};
        formatted[r.day_number][r.question_number - 1] = r.response as 'A' | 'B' | 'C';
      }

      const profile = calculateDiscoveryProfile(
        discoveryType as 'leadership' | 'ostacoli' | 'microfelicita',
        formatted
      );

      let strongest = { key: '', pct: 0 };
      for (const [dim, data] of Object.entries(profile.dimensionScores)) {
        if (data.percentage > strongest.pct) {
          strongest = { key: dim, pct: data.percentage };
        }
      }

      if (strongest.key) {
        miniProfileContext = {
          dimensionScores: Object.fromEntries(
            Object.entries(profile.dimensionScores).map(([k, v]) => [k, { percentage: v.percentage }])
          ),
          strongestDimension: strongest.key,
          strongestPercentage: strongest.pct,
        };
      }
    }

    return { challengeContext, miniProfileContext };
  } catch {
    return {};
  }
}

// Rate limit AI Coach: 20 richieste per minuto (protegge costi Anthropic)
const AI_COACH_RATE_LIMIT = {
  maxRequests: 20,
  windowSeconds: 60,
  identifier: 'ai-coach',
};

export async function POST(request: NextRequest): Promise<NextResponse<ChatResponse>> {
  const startTime = Date.now();

  // Rate limiting
  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(clientIP, AI_COACH_RATE_LIMIT);
  if (!rateLimit.success) {
    return rateLimitExceededResponse(rateLimit.resetIn) as NextResponse<ChatResponse>;
  }

  try {
    // === AUTENTICAZIONE SERVER-SIDE (C1 fix) ===
    const authSupabase = await createClient();
    const { data: { user: authUser }, error: authError } = await authSupabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { message: 'Non autenticato' },
        { status: 401 }
      );
    }

    const authenticatedUserId = authUser.id;

    const body: ChatRequest = await request.json();
    const { messages, userContext, sessionId: clientSessionId, currentPath: requestPath } = body;

    // Sovrascrivi userId dal client con quello autenticato dal server
    if (userContext) {
      userContext.userId = authenticatedUserId;
    }

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

    // === SINGLE PROFILES QUERY (tier + path + email) ===
    let dailyLimit = 5;
    let userTier: SubscriptionTier = 'explorer';
    let userEmail: string | null = null;
    let profileCurrentPath: PathType | null = null;

    if (authenticatedUserId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier, current_path, email')
        .eq('id', authenticatedUserId)
        .single();

      if (profile) {
        userEmail = profile.email || null;
        profileCurrentPath = (profile.current_path as PathType) || null;

        if (profile.subscription_tier) {
          userTier = profile.subscription_tier as SubscriptionTier;
          const tierConfig = SUBSCRIPTION_TIERS[userTier];
          if (tierConfig) {
            const limit = tierConfig.features.ai_coach_messages_per_day;
            dailyLimit = limit === 'unlimited' ? 999999 : limit;
          }
        }
      }

      // Verifica limite giornaliero (solo per tier non illimitati)
      if (dailyLimit < 999999) {
        const { data: limitCheck, error: limitError } = await supabase
          .rpc('check_ai_coach_limit', {
            p_user_id: authenticatedUserId,
            p_daily_limit: dailyLimit
          });

        if (limitError) {
          // Errore silenzioso - non blocca l'esecuzione
        } else if (limitCheck && limitCheck.length > 0 && !limitCheck[0].can_send) {
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

    // currentPath: usa request, fallback profilo, fallback default
    const currentPath: PathType = (requestPath as PathType) || profileCurrentPath || 'leadership';

    // Prendi l'ultimo messaggio utente per il RAG
    const lastUserMessage = messages
      .filter(m => m.role === 'user')
      .pop()?.content || '';

    // Cerca contesto rilevante dai libri (filtrato per percorso) con metadati
    const ragResult = await getRAGContextWithMetadata(lastUserMessage, currentPath);

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
        }).catch(() => {}); // Fire and forget
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

      // Carica livello awareness per adattamento Fernando
      const awarenessData = await getCurrentAwarenessLevel(userContext.userId);
      if (awarenessData) {
        awarenessLevel = awarenessData.level;
      }
    }

    // === P4.1-P4.3: FETCH CHALLENGE CONTEXT E MINI-PROFILO ===
    if (userContext?.userId && userEmail) {
      const ctx = await fetchChallengeContext(supabase, userContext.userId, userEmail, userTier);
      if (ctx.challengeContext) userContext.challengeContext = ctx.challengeContext;
      if (ctx.miniProfileContext) userContext.miniProfileContext = ctx.miniProfileContext;
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
      }
    } catch {
      // Errore silenzioso - correzioni sono opzionali
    }

    // Carica raccomandazioni esercizi personalizzate
    let exerciseRecommendationsContext = '';
    if (userContext?.userId) {
      try {
        const recommendationService = createExerciseRecommendationService(supabase);
        exerciseRecommendationsContext = await recommendationService.generateAICoachContext(userContext.userId);
      } catch {
        // Errore silenzioso - raccomandazioni sono opzionali
      }
    }

    // Rileva se è un messaggio di chiusura (grazie, ciao, ecc.)
    const isClosing = isClosingMessage(lastUserMessage);
    const closingHint = isClosing
      ? '\n\n[SISTEMA: L\'utente sta salutando. Applica le istruzioni di WRAP-UP CONVERSAZIONE: riepiloga brevemente il tema discusso, suggerisci un\'azione concreta per le prossime 24-48 ore, e se pertinente menziona un esercizio dalla lista disponibile.]'
      : '';

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

    // Scores salvati nel DB per monitoring (nessun log in production)

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

        if (!convError && convData) {
          conversationId = convData.id;

          // Aggiorna awareness level in background (prima conversazione o rating)
          const isFirstConversation = messages.filter((m: Message) => m.role === 'assistant').length === 0;
          onAIConversation(userContext.userId, isFirstConversation).catch(() => {});
        }

        // Incrementa contatore utilizzo giornaliero AI Coach (fire and forget)
        await supabase.rpc('increment_daily_usage', { p_user_id: userContext.userId });
      } catch {
        // Errore DB silenzioso - non blocca la risposta
      }
    }

    return NextResponse.json({
      message: assistantMessage,
      isSafetyAlert,
      conversationId,
      sessionId,
    });

  } catch (error) {
    // Invia alert per errori AI Coach (sostituisce console.error)
    await alertAICoachError(
      error instanceof Error ? error : new Error('Unknown AI Coach error'),
      { endpoint: '/api/ai-coach' }
    );

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { message: 'Servizio temporaneamente non disponibile. Riprova tra qualche istante.' },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { message: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
