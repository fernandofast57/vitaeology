/**
 * API Quality Audit - Dashboard valutazione qualità risposte AI Coach
 *
 * GET: Carica conversazioni da valutare + audit recenti + summary settimanale
 * POST: Salva una valutazione audit
 *
 * Include analisi automatica di gradualità basata sulle 3 difficoltà:
 * 1. PAROLE - Termini tecnici non spiegati
 * 2. CONCRETEZZA - Mancanza di esempi
 * 3. GRADUALITÀ - Sequenza logica
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/service';
import { verifyAdminFromRequest } from '@/lib/admin/verify-admin';
import { checkGraduality, GradualityCheckResult } from '@/lib/services/graduality-check';
import { checkParole, ParoleCheckResult } from '@/lib/services/parole-check';
import { checkConcretezza, ConcretezzaCheckResult } from '@/lib/services/concretezza-check';

export const dynamic = 'force-dynamic';

// Interfacce
interface ConversationSample {
  id: string;
  session_id: string;
  user_id: string;
  user_message: string;
  ai_response: string;
  created_at: string;
  tokens_used: number | null;
  parole_analysis?: ParoleCheckResult;
  concretezza_analysis?: ConcretezzaCheckResult;
  graduality_analysis?: GradualityCheckResult;
}

interface RecentAudit {
  id: string;
  conversation_id: string;
  score_validante?: number;
  score_user_agency?: number;
  score_comprensione?: number;
  score_conoscenza_operativa?: number;
  // 3 score Comprensione dettagliati
  score_parole?: number;
  score_concretezza?: number;
  score_gradualita?: number;
  score_medio: number;
  issues: string[];
  created_at: string;
  user_message_preview: string;
}

interface WeeklySummary {
  total_audits: number;
  avg_score: number | null;
  excellent_count: number;
  needs_improvement_count: number;
}

// ============================================================
// GET: Carica dati dashboard
// ============================================================
export async function GET(): Promise<NextResponse> {
  const auth = await verifyAdminFromRequest();
  if (!auth.isAdmin) return auth.response;

  const supabase = getServiceClient();

  try {
    // 1. Campiona conversazioni da valutare (non ancora auditate)
    // Prima prova RPC, poi fallback a query diretta
    let samples: ConversationSample[] = [];

    const { data: rpcSamples, error: rpcError } = await supabase.rpc(
      'sample_conversations_for_audit',
      { sample_size: 10 }
    );

    if (!rpcError && rpcSamples) {
      samples = rpcSamples;
    } else {
      // Fallback: query diretta
      const { data: fallbackSamples } = await supabase
        .from('ai_coach_conversations')
        .select('id, session_id, user_id, user_message, ai_response, created_at, tokens_used')
        .not('ai_response', 'is', null)
        .order('created_at', { ascending: false })
        .limit(20);

      if (fallbackSamples && fallbackSamples.length > 0) {
        // Filtra quelle già auditate
        const conversationIds = fallbackSamples.map(s => s.id);
        const { data: existingAudits } = await supabase
          .from('ai_coach_quality_audits')
          .select('conversation_id')
          .in('conversation_id', conversationIds);

        const auditedIds = new Set(existingAudits?.map(a => a.conversation_id) || []);
        samples = fallbackSamples.filter(s => !auditedIds.has(s.id)).slice(0, 10);
      }
    }

    // Esegui analisi COMPRENSIONE (3 difficoltà) su ogni sample
    for (const sample of samples) {
      if (sample.ai_response) {
        sample.parole_analysis = checkParole(sample.ai_response);
        sample.concretezza_analysis = checkConcretezza(sample.ai_response);
        sample.graduality_analysis = checkGraduality(sample.ai_response);
      }
    }

    // 2. Carica audit recenti (query diretta, RPC non esiste)
    let recentAuditsData: RecentAudit[] = [];

    const { data: fallbackAudits } = await supabase
      .from('ai_coach_quality_audits')
      .select(`
        id,
        conversation_id,
        score_validante,
        score_user_agency,
        score_comprensione,
        score_conoscenza_operativa,
        score_parole,
        score_concretezza,
        score_gradualita,
        score_medio,
        issues,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (fallbackAudits) {
      for (const audit of fallbackAudits) {
        const { data: conv } = await supabase
          .from('ai_coach_conversations')
          .select('user_message')
          .eq('id', audit.conversation_id)
          .single();

        recentAuditsData.push({
          id: audit.id,
          conversation_id: audit.conversation_id,
          score_validante: audit.score_validante ? Number(audit.score_validante) : undefined,
          score_user_agency: audit.score_user_agency ? Number(audit.score_user_agency) : undefined,
          score_comprensione: audit.score_comprensione ? Number(audit.score_comprensione) : undefined,
          score_conoscenza_operativa: audit.score_conoscenza_operativa ? Number(audit.score_conoscenza_operativa) : undefined,
          score_parole: audit.score_parole ? Number(audit.score_parole) : undefined,
          score_concretezza: audit.score_concretezza ? Number(audit.score_concretezza) : undefined,
          score_gradualita: audit.score_gradualita ? Number(audit.score_gradualita) : undefined,
          score_medio: Number(audit.score_medio) || 0,
          issues: audit.issues || [],
          created_at: audit.created_at,
          user_message_preview: conv?.user_message?.slice(0, 60) || '',
        });
      }
    }

    // 3. Calcola summary settimanale (query diretta)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: weekAudits } = await supabase
      .from('ai_coach_quality_audits')
      .select('score_medio')
      .gte('created_at', sevenDaysAgo);

    const scores = weekAudits?.map(a => Number(a.score_medio)).filter(s => !isNaN(s) && s > 0) || [];

    const summary: WeeklySummary = {
      total_audits: weekAudits?.length || 0,
      avg_score: scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100
        : null,
      excellent_count: scores.filter(s => s >= 4.0).length,
      needs_improvement_count: scores.filter(s => s < 3.0).length,
    };

    return NextResponse.json({
      samples,
      recentAudits: recentAuditsData,
      summary,
    });

  } catch (error) {
    console.error('Errore API quality-audit GET:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// ============================================================
// POST: Salva valutazione audit
// ============================================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await verifyAdminFromRequest();
  if (!auth.isAdmin) return auth.response;

  const supabase = getServiceClient();

  try {
    const body = await request.json();

    const {
      conversation_id,
      score_validante,
      score_user_agency,
      score_comprensione,
      score_conoscenza_operativa,
      // 3 score Comprensione dettagliati
      score_parole,
      score_concretezza,
      score_gradualita,
      issues,
      notes,
    } = body;

    // Validazione
    if (!conversation_id) {
      return NextResponse.json(
        { error: 'conversation_id richiesto' },
        { status: 400 }
      );
    }

    // Verifica che i punteggi siano validi (1-5) - ora 7 score
    const scores = [
      score_validante, score_user_agency, score_comprensione, score_conoscenza_operativa,
      score_parole, score_concretezza, score_gradualita
    ];
    for (const score of scores) {
      if (score !== undefined && score !== null) {
        if (typeof score !== 'number' || score < 1 || score > 5) {
          return NextResponse.json(
            { error: 'Punteggi devono essere numeri da 1 a 5' },
            { status: 400 }
          );
        }
      }
    }

    // Verifica che la conversazione esista
    const { data: conv, error: convError } = await supabase
      .from('ai_coach_conversations')
      .select('id')
      .eq('id', conversation_id)
      .single();

    if (convError || !conv) {
      return NextResponse.json(
        { error: 'Conversazione non trovata' },
        { status: 404 }
      );
    }

    // Verifica che non sia già stata valutata
    const { data: existingAudit } = await supabase
      .from('ai_coach_quality_audits')
      .select('id')
      .eq('conversation_id', conversation_id)
      .single();

    if (existingAudit) {
      return NextResponse.json(
        { error: 'Conversazione già valutata' },
        { status: 409 }
      );
    }

    // Inserisci audit (7 score totali)
    const { data: newAudit, error: insertError } = await supabase
      .from('ai_coach_quality_audits')
      .insert({
        conversation_id,
        auditor_id: auth.userId,
        score_validante: score_validante || null,
        score_user_agency: score_user_agency || null,
        score_comprensione: score_comprensione || null,
        score_conoscenza_operativa: score_conoscenza_operativa || null,
        // 3 score Comprensione dettagliati
        score_parole: score_parole || null,
        score_concretezza: score_concretezza || null,
        score_gradualita: score_gradualita || null,
        issues: issues || [],
        notes: notes || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Errore inserimento audit:', insertError);
      return NextResponse.json(
        { error: 'Errore salvataggio valutazione' },
        { status: 500 }
      );
    }

    // Ricalcola summary per risposta
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: weekAudits } = await supabase
      .from('ai_coach_quality_audits')
      .select('score_medio')
      .gte('created_at', sevenDaysAgo);

    const scores2 = weekAudits?.map(a => Number(a.score_medio)).filter(s => !isNaN(s)) || [];
    const updatedSummary: WeeklySummary = {
      total_audits: weekAudits?.length || 0,
      avg_score: scores2.length > 0
        ? Math.round((scores2.reduce((a, b) => a + b, 0) / scores2.length) * 100) / 100
        : null,
      excellent_count: scores2.filter(s => s >= 4.0).length,
      needs_improvement_count: scores2.filter(s => s < 3.0).length,
    };

    return NextResponse.json({
      success: true,
      audit: newAudit,
      updatedSummary,
    });

  } catch (error) {
    console.error('Errore API quality-audit POST:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
