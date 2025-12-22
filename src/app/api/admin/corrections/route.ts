/**
 * API Corrections - Gestione correzioni automatiche AI Coach
 *
 * GET: Carica suggerimenti + correzioni esistenti + stats
 * POST: Applica suggerimento / crea nuova correzione
 * PATCH: Approva/rifiuta correzione, aggiorna status
 * DELETE: Rimuovi correzione
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminFromRequest } from '@/lib/admin/verify-admin';
import {
  createCorrectionSuggestionService,
  CorrectionSuggestion,
} from '@/lib/services/correction-suggestion';

export const dynamic = 'force-dynamic';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ============================================================
// GET: Carica suggerimenti e correzioni
// ============================================================
export async function GET(): Promise<NextResponse> {
  const auth = await verifyAdminFromRequest();
  if (!auth.isAdmin) return auth.response;

  const supabase = getServiceClient();
  const correctionService = createCorrectionSuggestionService(supabase);

  try {
    // 1. Genera suggerimenti basati su pattern
    const suggestions = await correctionService.generateSuggestions();

    // 2. Carica correzioni esistenti con info pattern
    const { data: corrections, error: corrError } = await supabase
      .from('ai_coach_auto_corrections')
      .select(`
        id,
        pattern_id,
        correction_type,
        description,
        content,
        effectiveness_score,
        effectiveness_trend,
        status,
        applied_count,
        approved_by,
        approved_at,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (corrError) {
      console.error('Errore caricamento correzioni:', corrError);
    }

    // Arricchisci correzioni con nome pattern
    const enrichedCorrections = [];
    for (const correction of corrections || []) {
      let patternName = null;
      let patternType = null;

      if (correction.pattern_id) {
        const { data: pattern } = await supabase
          .from('ai_coach_patterns')
          .select('pattern_name, pattern_type')
          .eq('id', correction.pattern_id)
          .single();

        if (pattern) {
          patternName = pattern.pattern_name;
          patternType = pattern.pattern_type;
        }
      }

      enrichedCorrections.push({
        ...correction,
        pattern_name: patternName,
        pattern_type: patternType,
      });
    }

    // 3. Calcola stats
    const activeCount = enrichedCorrections.filter(
      c => c.status === 'approved' || c.status === 'auto_applied'
    ).length;

    const pendingCount = enrichedCorrections.filter(
      c => c.status === 'pending'
    ).length;

    const avgEffectiveness = enrichedCorrections
      .filter(c => c.effectiveness_score !== null)
      .reduce((acc, c, _, arr) => acc + (c.effectiveness_score || 0) / arr.length, 0);

    // 4. Carica pattern per reference
    const { data: patterns } = await supabase
      .from('ai_coach_patterns')
      .select('id, pattern_name, pattern_type, severity, times_detected')
      .eq('is_active', true)
      .order('times_detected', { ascending: false });

    return NextResponse.json({
      suggestions,
      corrections: enrichedCorrections,
      patterns: patterns || [],
      stats: {
        active_corrections: activeCount,
        pending_corrections: pendingCount,
        total_suggestions: suggestions.length,
        avg_effectiveness: Math.round(avgEffectiveness * 100),
      },
    });

  } catch (error) {
    console.error('Errore API corrections GET:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// ============================================================
// POST: Applica suggerimento o crea correzione
// ============================================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await verifyAdminFromRequest();
  if (!auth.isAdmin) return auth.response;

  const supabase = getServiceClient();

  try {
    const body = await request.json();
    const { action } = body;

    // Applica suggerimento esistente
    if (action === 'apply_suggestion') {
      const { suggestion, auto_apply } = body as {
        suggestion: CorrectionSuggestion;
        auto_apply?: boolean;
      };

      if (!suggestion) {
        return NextResponse.json(
          { error: 'Suggerimento richiesto' },
          { status: 400 }
        );
      }

      const correctionService = createCorrectionSuggestionService(supabase);
      const result = await correctionService.applySuggestion(suggestion, auto_apply || false);

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        correction_id: result.correction_id,
      });
    }

    // Crea nuova correzione manuale
    if (action === 'create_correction') {
      const {
        pattern_id,
        correction_type,
        description,
        content,
        auto_approve,
      } = body;

      if (!correction_type || !description || !content) {
        return NextResponse.json(
          { error: 'correction_type, description e content sono richiesti' },
          { status: 400 }
        );
      }

      const { data: correction, error } = await supabase
        .from('ai_coach_auto_corrections')
        .insert({
          pattern_id: pattern_id || null,
          correction_type,
          description,
          content,
          status: auto_approve ? 'approved' : 'pending',
          approved_by: auto_approve ? auth.userId : null,
          approved_at: auto_approve ? new Date().toISOString() : null,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Errore creazione correzione' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        correction,
      });
    }

    // Applica tutti i suggerimenti ad alta priorità
    if (action === 'apply_all_high_priority') {
      const correctionService = createCorrectionSuggestionService(supabase);
      const suggestions = await correctionService.generateSuggestions();

      const highPriority = suggestions.filter(
        s => s.priority === 'critical' || s.priority === 'high'
      );

      const results = [];
      for (const suggestion of highPriority) {
        const result = await correctionService.applySuggestion(suggestion, false);
        results.push({
          pattern_name: suggestion.pattern_name,
          success: result.success,
          correction_id: result.correction_id,
        });
      }

      return NextResponse.json({
        success: true,
        applied: results.length,
        results,
      });
    }

    return NextResponse.json(
      { error: 'Azione non valida' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Errore API corrections POST:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// ============================================================
// PATCH: Aggiorna status correzione
// ============================================================
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const auth = await verifyAdminFromRequest();
  if (!auth.isAdmin) return auth.response;

  const supabase = getServiceClient();

  try {
    const body = await request.json();
    const { action, correction_id } = body;

    if (!correction_id) {
      return NextResponse.json(
        { error: 'correction_id richiesto' },
        { status: 400 }
      );
    }

    // Approva correzione
    if (action === 'approve') {
      const { error } = await supabase
        .from('ai_coach_auto_corrections')
        .update({
          status: 'approved',
          approved_by: auth.userId,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', correction_id);

      if (error) {
        return NextResponse.json(
          { error: 'Errore approvazione' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // Rifiuta correzione
    if (action === 'reject') {
      const { error } = await supabase
        .from('ai_coach_auto_corrections')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', correction_id);

      if (error) {
        return NextResponse.json(
          { error: 'Errore rifiuto' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // Aggiorna contenuto
    if (action === 'update_content') {
      const { content, description } = body;

      const updates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (content) updates.content = content;
      if (description) updates.description = description;

      const { error } = await supabase
        .from('ai_coach_auto_corrections')
        .update(updates)
        .eq('id', correction_id);

      if (error) {
        return NextResponse.json(
          { error: 'Errore aggiornamento' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // Aggiorna efficacia
    if (action === 'update_effectiveness') {
      const { was_effective } = body;

      const correctionService = createCorrectionSuggestionService(supabase);
      await correctionService.updateEffectiveness(correction_id, was_effective);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Azione non valida' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Errore API corrections PATCH:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE: Rimuovi correzione
// ============================================================
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const auth = await verifyAdminFromRequest();
  if (!auth.isAdmin) return auth.response;

  const supabase = getServiceClient();

  try {
    const { searchParams } = new URL(request.url);
    const correctionId = searchParams.get('id');

    if (!correctionId) {
      return NextResponse.json(
        { error: 'id richiesto come query parameter' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('ai_coach_auto_corrections')
      .delete()
      .eq('id', correctionId);

    if (error) {
      return NextResponse.json(
        { error: 'Errore eliminazione' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Errore API corrections DELETE:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
