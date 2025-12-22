/**
 * API Feedback AI Coach
 *
 * POST: Processa feedback utente (thumbs up/down) con pattern detection
 * GET: Lista feedback (solo admin)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
import { createPatternDetectionService, DetectionResult } from '@/lib/services/pattern-detection';
import { verifyAdminFromRequest } from '@/lib/admin/verify-admin';

// Service client per operazioni privilegiate
function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ============================================================
// TYPES
// ============================================================

interface FeedbackRequest {
  conversation_id: string;
  message_id: string;
  ai_response: string;
  user_message?: string;
  feedback_type: 'thumbs_up' | 'thumbs_down';
  feedback_text?: string;
  rating?: number;
}

interface FeedbackResponse {
  success: boolean;
  feedback_id: string;
  patterns_detected: number;
  patterns: Array<{ name: string; confidence: number }>;
}

// ============================================================
// POST: Processa feedback utente
// ============================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Verifica autenticazione
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    // 2. Parse e valida body
    const body: FeedbackRequest = await request.json();

    const {
      conversation_id,
      message_id,
      ai_response,
      user_message,
      feedback_type,
      feedback_text,
      rating,
    } = body;

    // Validazione campi required
    if (!conversation_id) {
      return NextResponse.json(
        { error: 'conversation_id richiesto' },
        { status: 400 }
      );
    }

    if (!message_id) {
      return NextResponse.json(
        { error: 'message_id richiesto' },
        { status: 400 }
      );
    }

    if (!ai_response) {
      return NextResponse.json(
        { error: 'ai_response richiesto' },
        { status: 400 }
      );
    }

    if (!feedback_type || !['thumbs_up', 'thumbs_down'].includes(feedback_type)) {
      return NextResponse.json(
        { error: 'feedback_type deve essere thumbs_up o thumbs_down' },
        { status: 400 }
      );
    }

    // Valida rating se presente
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'rating deve essere tra 1 e 5' },
        { status: 400 }
      );
    }

    // 3. Service client per operazioni
    const serviceClient = getServiceClient();

    // 4. Insert feedback nel database
    const { data: feedbackData, error: insertError } = await serviceClient
      .from('ai_coach_feedback')
      .insert({
        user_id: user.id,
        conversation_id,
        message_id,
        feedback_type,
        feedback_text: feedback_text || null,
        rating: rating || null,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Errore insert feedback:', insertError);

      // Se tabella non esiste, prova ad aggiornare conversazione direttamente
      const { error: updateError } = await serviceClient
        .from('ai_coach_conversations')
        .update({
          feedback_type,
          feedback_text: feedback_text || null,
          user_rating: rating || null,
        })
        .eq('id', conversation_id);

      if (updateError) {
        console.error('Errore update conversazione:', updateError);
        return NextResponse.json(
          { error: 'Errore salvataggio feedback' },
          { status: 500 }
        );
      }
    }

    const feedbackId = feedbackData?.id || conversation_id;
    let patternsDetected = 0;
    let detectedPatterns: Array<{ name: string; confidence: number }> = [];

    // 5. Se thumbs_down, processa con PatternDetectionService
    if (feedback_type === 'thumbs_down') {
      try {
        const patternService = createPatternDetectionService(serviceClient);

        const results: DetectionResult[] = await patternService.processThumbsDown(
          conversation_id,
          message_id,
          ai_response,
          user_message || '',
          feedback_text
        );

        patternsDetected = results.length;
        detectedPatterns = results.map(r => ({
          name: r.pattern_name,
          confidence: r.confidence,
        }));

        // Log per debug
        if (results.length > 0) {
          console.log(`[Feedback] Thumbs down - ${results.length} patterns rilevati:`,
            results.map(r => `${r.pattern_name} (${Math.round(r.confidence * 100)}%)`).join(', ')
          );
        }

        // 6. Se ci sono pattern ad alta confidence, crea notifica admin
        const highConfidencePatterns = results.filter(r => r.confidence >= 0.8);
        if (highConfidencePatterns.length > 0) {
          await createAdminNotification(
            serviceClient,
            conversation_id,
            highConfidencePatterns,
            user.id
          );
        }

      } catch (patternError) {
        // Non fallire la request se pattern detection fallisce
        console.error('Errore pattern detection:', patternError);
      }
    }

    // 7. Se thumbs_up o rating >= 4, incrementa metrica positiva
    if (feedback_type === 'thumbs_up' || (rating && rating >= 4)) {
      try {
        await incrementPositiveMetric(serviceClient, user.id);
      } catch (metricError) {
        console.error('Errore incremento metrica:', metricError);
      }
    }

    // 8. Aggiorna conversazione con feedback
    await serviceClient
      .from('ai_coach_conversations')
      .update({
        feedback_type,
        user_rating: rating || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversation_id);

    // 9. Response
    const response: FeedbackResponse = {
      success: true,
      feedback_id: feedbackId,
      patterns_detected: patternsDetected,
      patterns: detectedPatterns,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Errore API feedback POST:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// ============================================================
// GET: Lista feedback (solo admin)
// ============================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Verifica admin
  const auth = await verifyAdminFromRequest();
  if (!auth.isAdmin) return auth.response;

  const serviceClient = getServiceClient();

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type'); // thumbs_up, thumbs_down
    const days = parseInt(searchParams.get('days') || '7');

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Query feedback
    let query = serviceClient
      .from('ai_coach_conversations')
      .select(`
        id,
        user_id,
        session_id,
        user_message,
        ai_response,
        feedback_type,
        user_rating,
        created_at
      `)
      .not('feedback_type', 'is', null)
      .gte('created_at', startDate)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) {
      query = query.eq('feedback_type', type);
    }

    const { data: feedbacks, error } = await query;

    if (error) {
      console.error('Errore query feedback:', error);
      return NextResponse.json(
        { error: 'Errore caricamento feedback' },
        { status: 500 }
      );
    }

    // Calcola statistiche
    const { count: totalCount } = await serviceClient
      .from('ai_coach_conversations')
      .select('*', { count: 'exact', head: true })
      .not('feedback_type', 'is', null)
      .gte('created_at', startDate);

    const { count: thumbsUpCount } = await serviceClient
      .from('ai_coach_conversations')
      .select('*', { count: 'exact', head: true })
      .eq('feedback_type', 'thumbs_up')
      .gte('created_at', startDate);

    const { count: thumbsDownCount } = await serviceClient
      .from('ai_coach_conversations')
      .select('*', { count: 'exact', head: true })
      .eq('feedback_type', 'thumbs_down')
      .gte('created_at', startDate);

    return NextResponse.json({
      feedbacks: feedbacks || [],
      pagination: {
        offset,
        limit,
        total: totalCount || 0,
      },
      stats: {
        total: totalCount || 0,
        thumbs_up: thumbsUpCount || 0,
        thumbs_down: thumbsDownCount || 0,
        positive_rate: totalCount && totalCount > 0
          ? Math.round(((thumbsUpCount || 0) / totalCount) * 100)
          : 0,
      },
    });

  } catch (error) {
    console.error('Errore API feedback GET:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Crea notifica admin per pattern ad alta confidence
 */
async function createAdminNotification(
  supabase: any,
  conversationId: string,
  patterns: DetectionResult[],
  userId: string
): Promise<void> {
  try {
    const patternNames = patterns.map(p => p.pattern_name).join(', ');
    const maxConfidence = Math.max(...patterns.map(p => p.confidence));

    // Prova a inserire nella tabella notifiche
    const { error } = await supabase
      .from('ai_coach_notifications')
      .insert({
        type: 'pattern_alert',
        severity: maxConfidence >= 0.9 ? 'high' : 'medium',
        title: `Pattern rilevato: ${patternNames}`,
        message: `Rilevati ${patterns.length} pattern problematici in una risposta AI (confidence max: ${Math.round(maxConfidence * 100)}%)`,
        data: {
          conversation_id: conversationId,
          user_id: userId,
          patterns: patterns.map(p => ({
            id: p.pattern_id,
            name: p.pattern_name,
            confidence: p.confidence,
            triggered_by: p.triggered_by,
          })),
        },
        read: false,
        created_at: new Date().toISOString(),
      });

    if (error) {
      // Se tabella non esiste, log solo
      console.log('[Notification] Tabella ai_coach_notifications non disponibile');
    }
  } catch (err) {
    console.error('Errore creazione notifica:', err);
  }
}

/**
 * Incrementa metrica positiva giornaliera
 */
async function incrementPositiveMetric(
  supabase: any,
  _userId: string
): Promise<void> {
  try {
    // Prova RPC se esiste
    const { error: rpcError } = await supabase.rpc('increment_daily_metric', {
      p_metric_name: 'positive_feedback',
      p_increment: 1,
    });

    if (rpcError) {
      // Fallback: inserisci record metrica
      const today = new Date().toISOString().split('T')[0];

      const { data: existing } = await supabase
        .from('ai_coach_daily_metrics')
        .select('id, value')
        .eq('metric_date', today)
        .eq('metric_name', 'positive_feedback')
        .single();

      if (existing) {
        await supabase
          .from('ai_coach_daily_metrics')
          .update({ value: (existing.value || 0) + 1 })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('ai_coach_daily_metrics')
          .insert({
            metric_date: today,
            metric_name: 'positive_feedback',
            value: 1,
          });
      }
    }
  } catch (err) {
    // Non critico, log solo
    console.log('[Metric] Incremento metrica fallito (non critico)');
  }
}
