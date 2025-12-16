import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ChatRequest, ChatResponse } from '@/lib/ai-coach/types';
import { buildSystemPrompt } from '@/lib/ai-coach/system-prompt';
import { getRAGContext, PathType } from '@/lib/rag';

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
  try {
    const body: ChatRequest = await request.json();
    const { messages, userContext } = body;

    const supabase = getSupabaseClient();
    const anthropic = getAnthropicClient();

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { message: 'Nessun messaggio fornito' },
        { status: 400 }
      );
    }

    // Recupera current_path dell'utente dal profilo
    let currentPath: PathType | null = null;
    if (userContext?.userId) {
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

    // Cerca contesto rilevante dai libri (filtrato per percorso)
    const ragContext = await getRAGContext(lastUserMessage, currentPath);

    // DEBUG RAG - Log contesto trovato
    if (ragContext && ragContext.trim().length > 0) {
      console.log('✅ Contesto RAG trovato:', ragContext.substring(0, 500) + '...');
    } else {
      console.log('⚠️ Nessun contesto RAG trovato');
    }
    console.log('🔍 [RAG DEBUG] ===================================\n');

    // Costruisci system prompt con contesto RAG
    const systemPrompt = buildSystemPrompt(userContext) + ragContext;

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

    // Rileva se e un alert di sicurezza
    const safetyKeywords = [
      'Telefono Amico',
      'Emergenze: 112',
      'non sono un terapeuta',
    ];
    const isSafetyAlert = safetyKeywords.some(keyword =>
      assistantMessage.includes(keyword)
    );

    return NextResponse.json({
      message: assistantMessage,
      isSafetyAlert,
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
