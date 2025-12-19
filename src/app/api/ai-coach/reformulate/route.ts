// API per riformulare una risposta dell'AI Coach
import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface ReformulateRequest {
  conversationId: string;
  originalResponse: string;
}

interface ReformulateResponse {
  success: boolean;
  newResponse?: string;
  reformulationCount?: number;
  error?: string;
}

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

const REFORMULATION_PROMPT = `Riformula la seguente risposta mantenendo:
- Lo stesso significato e contenuto informativo
- Lo stesso tono caldo e validante
- La stessa lunghezza approssimativa

Ma usando:
- Parole diverse
- Struttura delle frasi diversa
- Eventuali esempi o metafore alternative

Risposta originale da riformulare:
`;

export async function POST(request: NextRequest): Promise<NextResponse<ReformulateResponse>> {
  try {
    const body: ReformulateRequest = await request.json();
    const { conversationId, originalResponse } = body;

    if (!conversationId || !originalResponse) {
      return NextResponse.json(
        { success: false, error: 'Parametri mancanti' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    const anthropic = getAnthropicClient();

    // 1. Verifica che la conversazione esista e controlla il conteggio
    const { data: conversation, error: fetchError } = await supabase
      .from('ai_coach_conversations')
      .select('id, ai_response, reformulation_count, original_response')
      .eq('id', conversationId)
      .single();

    if (fetchError || !conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversazione non trovata' },
        { status: 404 }
      );
    }

    const currentCount = conversation.reformulation_count || 0;

    // 2. Verifica limite riformulazioni
    if (currentCount >= 2) {
      return NextResponse.json(
        { success: false, error: 'Limite riformulazioni raggiunto (max 2)' },
        { status: 400 }
      );
    }

    // 3. Chiama Claude per riformulare
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: 'Sei un assistente che riformula testi mantenendo significato e tono. Rispondi SOLO con la nuova versione del testo, senza preamboli.',
      messages: [
        {
          role: 'user',
          content: REFORMULATION_PROMPT + originalResponse,
        },
      ],
    });

    const newResponse = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    if (!newResponse) {
      return NextResponse.json(
        { success: false, error: 'Errore nella generazione della risposta' },
        { status: 500 }
      );
    }

    // 4. Aggiorna il database
    const updateData: Record<string, unknown> = {
      ai_response: newResponse,
      reformulation_count: currentCount + 1,
    };

    // Salva la risposta originale solo alla prima riformulazione
    if (currentCount === 0) {
      updateData.original_response = conversation.original_response || conversation.ai_response;
    }

    const { error: updateError } = await supabase
      .from('ai_coach_conversations')
      .update(updateData)
      .eq('id', conversationId);

    if (updateError) {
      console.error('Errore aggiornamento conversazione:', updateError);
      return NextResponse.json(
        { success: false, error: 'Errore salvataggio riformulazione' },
        { status: 500 }
      );
    }

    // 5. Registra segnale implicito per tracking
    try {
      await supabase
        .from('ai_coach_implicit_signals')
        .insert({
          conversation_id: conversationId,
          user_id: (await supabase.from('ai_coach_conversations').select('user_id').eq('id', conversationId).single()).data?.user_id,
          session_id: (await supabase.from('ai_coach_conversations').select('session_id').eq('id', conversationId).single()).data?.session_id,
          signal_type: 'reformulated_question',
          metadata: {
            reformulation_number: currentCount + 1,
            original_length: originalResponse.length,
            new_length: newResponse.length,
          },
        });
    } catch (signalError) {
      // Non bloccare per errore di segnale
      console.error('Errore registrazione segnale:', signalError);
    }

    return NextResponse.json({
      success: true,
      newResponse,
      reformulationCount: currentCount + 1,
    });

  } catch (error) {
    console.error('Errore riformulazione:', error);

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { success: false, error: `Errore API: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
