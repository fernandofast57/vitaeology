/**
 * API Radar Comparison - Confronto tra snapshot radar
 *
 * GET: Confronta due snapshot
 * Query params: snapshot1_id, snapshot2_id
 * Ritorna entrambi gli snapshot + calcolo delta per ogni asse
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';

interface AxisDelta {
  axis: string;
  before: number;
  after: number;
  change: number;
  improved: boolean;
}

interface SnapshotData {
  id: string;
  snapshot_date: string;
  assessment_type: string;
  scores: Record<string, number> | Array<{ axis: string; score: number }>;
  triggered_by: string;
  created_at: string;
}

async function getUserFromRequest(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('Authorization');

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(token);
    return user?.id || null;
  }

  return null;
}

// Normalizza scores in formato { axis: score }
function normalizeScores(scores: Record<string, number> | Array<{ axis: string; score: number }>): Record<string, number> {
  if (Array.isArray(scores)) {
    const normalized: Record<string, number> = {};
    scores.forEach(item => {
      normalized[item.axis] = item.score;
    });
    return normalized;
  }
  return scores;
}

// Calcola delta tra due set di scores
function calculateDeltas(
  beforeScores: Record<string, number>,
  afterScores: Record<string, number>
): AxisDelta[] {
  const allAxes = new Set([...Object.keys(beforeScores), ...Object.keys(afterScores)]);
  const deltas: AxisDelta[] = [];

  allAxes.forEach(axis => {
    const before = beforeScores[axis] ?? 0;
    const after = afterScores[axis] ?? 0;
    const change = after - before;

    deltas.push({
      axis,
      before,
      after,
      change,
      improved: change > 0,
    });
  });

  // Ordina per variazione assoluta decrescente
  deltas.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

  return deltas;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getUserFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Autenticazione richiesta' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const snapshot1Id = searchParams.get('snapshot1_id');
    const snapshot2Id = searchParams.get('snapshot2_id');

    // Validazioni
    if (!snapshot1Id || !snapshot2Id) {
      return NextResponse.json(
        { error: 'Parametri snapshot1_id e snapshot2_id richiesti' },
        { status: 400 }
      );
    }

    // Valida formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(snapshot1Id) || !uuidRegex.test(snapshot2Id)) {
      return NextResponse.json(
        { error: 'ID snapshot non validi. Devono essere UUID' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    // Recupera entrambi gli snapshot
    const { data: snapshots, error } = await supabase
      .from('user_radar_snapshots')
      .select('*')
      .eq('user_id', userId)
      .in('id', [snapshot1Id, snapshot2Id]);

    if (error) {
      console.error('Errore query snapshot:', error);
      return NextResponse.json(
        { error: 'Errore nel recupero degli snapshot' },
        { status: 500 }
      );
    }

    if (!snapshots || snapshots.length !== 2) {
      return NextResponse.json(
        { error: 'Uno o entrambi gli snapshot non trovati o non appartengono all\'utente' },
        { status: 404 }
      );
    }

    // Identifica before e after basandosi sulla data
    const sorted = [...snapshots].sort(
      (a, b) => new Date(a.snapshot_date).getTime() - new Date(b.snapshot_date).getTime()
    );

    const beforeSnapshot = sorted[0];
    const afterSnapshot = sorted[1];

    // Parsa scores
    const beforeScores = normalizeScores(
      typeof beforeSnapshot.scores_json === 'string'
        ? JSON.parse(beforeSnapshot.scores_json)
        : beforeSnapshot.scores_json
    );

    const afterScores = normalizeScores(
      typeof afterSnapshot.scores_json === 'string'
        ? JSON.parse(afterSnapshot.scores_json)
        : afterSnapshot.scores_json
    );

    // Calcola deltas
    const deltas = calculateDeltas(beforeScores, afterScores);

    // Calcola statistiche aggregate
    const improvements = deltas.filter(d => d.improved).length;
    const declines = deltas.filter(d => d.change < 0).length;
    const unchanged = deltas.filter(d => d.change === 0).length;
    const avgChange = deltas.length > 0
      ? deltas.reduce((sum, d) => sum + d.change, 0) / deltas.length
      : 0;
    const totalChange = deltas.reduce((sum, d) => sum + d.change, 0);

    // Formatta snapshot per response
    const formatSnapshot = (s: typeof beforeSnapshot): SnapshotData => ({
      id: s.id,
      snapshot_date: s.snapshot_date,
      assessment_type: s.assessment_type,
      scores: typeof s.scores_json === 'string' ? JSON.parse(s.scores_json) : s.scores_json,
      triggered_by: s.triggered_by,
      created_at: s.created_at,
    });

    return NextResponse.json({
      success: true,
      comparison: {
        before: formatSnapshot(beforeSnapshot),
        after: formatSnapshot(afterSnapshot),
        time_span: {
          from: beforeSnapshot.snapshot_date,
          to: afterSnapshot.snapshot_date,
          days: Math.round(
            (new Date(afterSnapshot.snapshot_date).getTime() - new Date(beforeSnapshot.snapshot_date).getTime())
            / (1000 * 60 * 60 * 24)
          ),
        },
        deltas,
        summary: {
          total_axes: deltas.length,
          improvements,
          declines,
          unchanged,
          avg_change: Math.round(avgChange * 10) / 10,
          total_change: Math.round(totalChange * 10) / 10,
          overall_trend: totalChange > 0 ? 'positive' : totalChange < 0 ? 'negative' : 'stable',
        },
      },
    });

  } catch (error) {
    console.error('Errore API radar/comparison:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
