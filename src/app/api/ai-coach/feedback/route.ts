import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase/service';
import { CreateFeedbackInput } from '@/types/ai-coach-learning';
import { createPatternDetectionService } from '@/lib/services/pattern-detection';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // === AUTENTICAZIONE SERVER-SIDE (C3 fix) ===
    const authSupabase = await createClient();
    const { data: { user: authUser }, error: authError } = await authSupabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    const authenticatedUserId = authUser.id;

    const body: CreateFeedbackInput = await request.json();
    const { conversation_id, is_helpful, rating, comment, issue_category } = body;

    if (!conversation_id) {
      return NextResponse.json(
        { error: 'conversation_id è richiesto' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Verifica che la conversazione esista e appartenga all'utente autenticato
    const { data: conversation, error: convError } = await supabase
      .from('ai_coach_conversations')
      .select('id, ai_response, user_message')
      .eq('id', conversation_id)
      .eq('user_id', authenticatedUserId)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: 'Conversazione non trovata' },
        { status: 404 }
      );
    }

    // Determina feedback_type
    const feedback_type = is_helpful ? 'thumbs_up' : 'thumbs_down';

    // Aggiorna la conversazione con feedback_type e rating
    const { error: updateError } = await supabase
      .from('ai_coach_conversations')
      .update({
        feedback_type,
        user_rating: rating || null,
        feedback_text: comment || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversation_id);

    if (updateError) {
      console.error('Errore aggiornamento conversazione:', updateError);
    }

    // Inserisci o aggiorna il feedback nella tabella dedicata
    const { data: feedback, error: fbError } = await supabase
      .from('ai_coach_feedback')
      .upsert(
        {
          conversation_id,
          user_id: authenticatedUserId,
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
      // Non fallire, continua con pattern detection
    }

    // Se thumbs_down, esegui pattern detection
    let patternsDetected = 0;
    if (!is_helpful && conversation.ai_response) {
      try {
        const patternService = createPatternDetectionService(supabase);
        const results = await patternService.processThumbsDown(
          conversation_id,
          conversation_id, // message_id = conversation_id per ora
          conversation.ai_response,
          conversation.user_message || '',
          comment
        );
        patternsDetected = results.length;

        if (results.length > 0) {
          console.log(`[Feedback] Pattern rilevati: ${results.map(r => r.pattern_name).join(', ')}`);
        }
      } catch (patternError) {
        console.error('Errore pattern detection:', patternError);
        // Non fallire la request
      }
    }

    console.log('Feedback salvato:', feedback?.id, '| Patterns:', patternsDetected);

    return NextResponse.json({
      success: true,
      feedbackId: feedback?.id,
      patternsDetected,
    });

  } catch (error) {
    console.error('Errore feedback API:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
