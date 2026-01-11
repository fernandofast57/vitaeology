/**
 * API Radar Snapshot - Salvataggio snapshot radar
 *
 * POST: Salva un nuovo snapshot radar
 * Body: { assessment_type, scores_json, triggered_by }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

type AssessmentType = 'leadership' | 'ostacoli' | 'microfelicita';
type TriggeredBy = 'assessment_complete' | 'exercise_complete' | 'manual' | 'periodic';

interface SnapshotRequestBody {
  assessment_type: AssessmentType;
  scores_json: Record<string, number> | Array<{ axis: string; score: number }>;
  triggered_by: TriggeredBy;
}

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
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

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getUserFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Autenticazione richiesta' },
        { status: 401 }
      );
    }

    // Parse body
    let body: SnapshotRequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Body JSON non valido' },
        { status: 400 }
      );
    }

    const { assessment_type, scores_json, triggered_by } = body;

    // Validazioni
    const validTypes: AssessmentType[] = ['leadership', 'ostacoli', 'microfelicita'];
    if (!assessment_type || !validTypes.includes(assessment_type)) {
      return NextResponse.json(
        { error: 'assessment_type non valido. Usa: leadership, ostacoli, microfelicita' },
        { status: 400 }
      );
    }

    const validTriggers: TriggeredBy[] = ['assessment_complete', 'exercise_complete', 'manual', 'periodic'];
    if (!triggered_by || !validTriggers.includes(triggered_by)) {
      return NextResponse.json(
        { error: 'triggered_by non valido. Usa: assessment_complete, exercise_complete, manual, periodic' },
        { status: 400 }
      );
    }

    if (!scores_json || (typeof scores_json !== 'object')) {
      return NextResponse.json(
        { error: 'scores_json deve essere un oggetto o array valido' },
        { status: 400 }
      );
    }

    // Valida che scores_json contenga dati
    const scoresArray = Array.isArray(scores_json) ? scores_json : Object.entries(scores_json);
    if (scoresArray.length === 0) {
      return NextResponse.json(
        { error: 'scores_json non puo essere vuoto' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    // Inserisci snapshot
    const { data: snapshot, error } = await supabase
      .from('user_radar_snapshots')
      .insert({
        user_id: userId,
        assessment_type,
        scores_json,
        triggered_by,
        snapshot_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Errore inserimento snapshot:', error);
      return NextResponse.json(
        { error: 'Errore nel salvataggio dello snapshot' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      snapshot: {
        id: snapshot.id,
        snapshot_date: snapshot.snapshot_date,
        assessment_type: snapshot.assessment_type,
        scores: typeof snapshot.scores_json === 'string'
          ? JSON.parse(snapshot.scores_json)
          : snapshot.scores_json,
        triggered_by: snapshot.triggered_by,
        created_at: snapshot.created_at,
      },
    });

  } catch (error) {
    console.error('Errore API radar/snapshot:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// GET: Recupera l'ultimo snapshot per tipo
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
    const type = searchParams.get('type') as AssessmentType | null;

    const validTypes: AssessmentType[] = ['leadership', 'ostacoli', 'microfelicita'];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Parametro type richiesto. Usa: leadership, ostacoli, microfelicita' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    const { data: snapshot, error } = await supabase
      .from('user_radar_snapshots')
      .select('*')
      .eq('user_id', userId)
      .eq('assessment_type', type)
      .order('snapshot_date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Errore query snapshot:', error);
      return NextResponse.json(
        { error: 'Errore nel recupero dello snapshot' },
        { status: 500 }
      );
    }

    if (!snapshot) {
      return NextResponse.json({
        success: true,
        snapshot: null,
        message: 'Nessuno snapshot trovato per questo tipo',
      });
    }

    return NextResponse.json({
      success: true,
      snapshot: {
        id: snapshot.id,
        snapshot_date: snapshot.snapshot_date,
        assessment_type: snapshot.assessment_type,
        scores: typeof snapshot.scores_json === 'string'
          ? JSON.parse(snapshot.scores_json)
          : snapshot.scores_json,
        triggered_by: snapshot.triggered_by,
        created_at: snapshot.created_at,
      },
    });

  } catch (error) {
    console.error('Errore API radar/snapshot GET:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
