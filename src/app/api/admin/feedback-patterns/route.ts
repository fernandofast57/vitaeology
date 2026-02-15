/**
 * API Feedback Patterns - Gestione pattern detection automatico
 *
 * GET: Carica patterns, match in attesa, correzioni, stats
 * PATCH: Toggle pattern, review match
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/service';
import { verifyAdminFromRequest } from '@/lib/admin/verify-admin';

export const dynamic = 'force-dynamic';

// ============================================================
// GET: Carica dati dashboard
// ============================================================
export async function GET(): Promise<NextResponse> {
  const auth = await verifyAdminFromRequest();
  if (!auth.isAdmin) return auth.response;

  const supabase = getServiceClient();

  try {
    // 1. Carica patterns (dalla vista v_top_patterns o tabella diretta)
    let patterns: any[] = [];

    // Prova prima la vista
    const { data: viewPatterns, error: viewError } = await supabase
      .from('v_top_patterns')
      .select('*')
      .order('times_detected', { ascending: false });

    if (!viewError && viewPatterns) {
      patterns = viewPatterns;
    } else {
      // Fallback: query diretta sulla tabella
      const { data: tablePatterns, error: tableError } = await supabase
        .from('ai_coach_patterns')
        .select('*')
        .order('times_detected', { ascending: false });

      if (tableError) {
        console.error('Errore caricamento patterns:', tableError);
      } else {
        patterns = tablePatterns || [];
      }
    }

    // Aggiungi weekly_detections (ultimi 7 giorni)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    for (const pattern of patterns) {
      const { count } = await supabase
        .from('ai_coach_pattern_matches')
        .select('*', { count: 'exact', head: true })
        .eq('pattern_id', pattern.id)
        .gte('created_at', sevenDaysAgo);

      pattern.weekly_detections = count || 0;
    }

    // 2. Carica match in attesa di revisione
    const { data: pendingMatches, error: matchesError } = await supabase
      .from('ai_coach_pattern_matches')
      .select(`
        id,
        pattern_id,
        conversation_id,
        confidence,
        matched_text,
        feedback_type,
        reviewed,
        confirmed,
        created_at
      `)
      .eq('reviewed', false)
      .order('created_at', { ascending: false })
      .limit(50);

    // Arricchisci con dati pattern e conversazione
    const enrichedMatches: any[] = [];
    if (!matchesError && pendingMatches) {
      for (const match of pendingMatches) {
        // Trova pattern
        const pattern = patterns.find(p => p.id === match.pattern_id);

        // Carica conversazione
        const { data: conv } = await supabase
          .from('ai_coach_conversations')
          .select('user_message, ai_response')
          .eq('id', match.conversation_id)
          .single();

        enrichedMatches.push({
          ...match,
          pattern_name: pattern?.pattern_name || 'Unknown',
          pattern_type: pattern?.pattern_type || 'unknown',
          user_message: conv?.user_message || '',
          ai_response: conv?.ai_response || '',
        });
      }
    }

    // 3. Carica correzioni automatiche
    let corrections: any[] = [];
    const { data: correctionsData, error: correctionsError } = await supabase
      .from('ai_coach_auto_corrections')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!correctionsError && correctionsData) {
      // Arricchisci con nome pattern
      for (const correction of correctionsData) {
        const pattern = patterns.find(p => p.id === correction.pattern_id);
        corrections.push({
          ...correction,
          pattern_name: pattern?.pattern_name || 'Unknown',
        });
      }
    }

    // 4. Calcola stats
    const activePatterns = patterns.filter(p => p.is_active).length;
    const totalPatterns = patterns.length;
    const pendingReviews = enrichedMatches.length;

    // Correzioni ultima settimana
    const { count: weeklyCorrectionsCount } = await supabase
      .from('ai_coach_auto_corrections')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo);

    // Trend (confronto con settimana precedente)
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const { count: prevWeekCorrections } = await supabase
      .from('ai_coach_auto_corrections')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', twoWeeksAgo)
      .lt('created_at', sevenDaysAgo);

    const weeklyCorrections = weeklyCorrectionsCount || 0;
    const prevWeek = prevWeekCorrections || 0;
    const weeklyTrend = prevWeek > 0
      ? Math.round(((weeklyCorrections - prevWeek) / prevWeek) * 100)
      : weeklyCorrections > 0 ? 100 : 0;

    return NextResponse.json({
      patterns,
      pendingMatches: enrichedMatches,
      corrections,
      stats: {
        total_patterns: totalPatterns,
        active_patterns: activePatterns,
        pending_reviews: pendingReviews,
        weekly_corrections: weeklyCorrections,
        weekly_trend: weeklyTrend,
      },
    });

  } catch (error) {
    console.error('Errore API feedback-patterns GET:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// ============================================================
// PATCH: Toggle pattern o review match
// ============================================================
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const auth = await verifyAdminFromRequest();
  if (!auth.isAdmin) return auth.response;

  const supabase = getServiceClient();

  try {
    const body = await request.json();
    const { action } = body;

    // Toggle pattern active state
    if (action === 'toggle_pattern') {
      const { pattern_id, is_active } = body;

      if (!pattern_id) {
        return NextResponse.json(
          { error: 'pattern_id richiesto' },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .from('ai_coach_patterns')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', pattern_id);

      if (error) {
        console.error('Errore toggle pattern:', error);
        return NextResponse.json(
          { error: 'Errore aggiornamento pattern' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // Review match
    if (action === 'review_match') {
      const { match_id, confirmed } = body;

      if (!match_id || confirmed === undefined) {
        return NextResponse.json(
          { error: 'match_id e confirmed richiesti' },
          { status: 400 }
        );
      }

      // Aggiorna match
      const { data: match, error: updateError } = await supabase
        .from('ai_coach_pattern_matches')
        .update({
          reviewed: true,
          confirmed,
          reviewed_at: new Date().toISOString(),
          reviewed_by: auth.userId,
        })
        .eq('id', match_id)
        .select('pattern_id')
        .single();

      if (updateError) {
        console.error('Errore review match:', updateError);
        return NextResponse.json(
          { error: 'Errore aggiornamento match' },
          { status: 500 }
        );
      }

      // Incrementa contatore pattern
      if (match?.pattern_id) {
        const field = confirmed ? 'times_confirmed' : 'times_rejected';

        // Prova a usare la RPC function
        const { error: rpcError } = await supabase.rpc('increment_pattern_counter', {
          p_pattern_id: match.pattern_id,
          p_field: field,
        });

        if (rpcError) {
          // Fallback: update manuale
          const { data: pattern } = await supabase
            .from('ai_coach_patterns')
            .select('times_detected, times_confirmed, times_rejected')
            .eq('id', match.pattern_id)
            .single();

          if (pattern) {
            const updates: any = { updated_at: new Date().toISOString() };
            if (confirmed) {
              updates.times_confirmed = (pattern.times_confirmed || 0) + 1;
            } else {
              updates.times_rejected = (pattern.times_rejected || 0) + 1;
            }
            // Ricalcola false_positive_rate
            const detected = pattern.times_detected || 0;
            const rejected = (pattern.times_rejected || 0) + (confirmed ? 0 : 1);
            updates.false_positive_rate = detected > 0 ? rejected / detected : 0;

            await supabase
              .from('ai_coach_patterns')
              .update(updates)
              .eq('id', match.pattern_id);
          }
        }
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Azione non valida' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Errore API feedback-patterns PATCH:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
