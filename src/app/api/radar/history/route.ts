/**
 * API Radar History - Storico snapshot radar
 *
 * GET: Recupera tutti gli snapshot radar di un utente
 * Query params: type (leadership|ostacoli|microfelicita), limit (default 10)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

type AssessmentType = 'leadership' | 'ostacoli' | 'microfelicita';

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
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    // Valida type se fornito
    const validTypes: AssessmentType[] = ['leadership', 'ostacoli', 'microfelicita'];
    if (type && !validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Tipo assessment non valido. Usa: leadership, ostacoli, microfelicita' },
        { status: 400 }
      );
    }

    // Valida limit
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Limite non valido. Deve essere tra 1 e 100' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    // Query per recuperare snapshot
    let query = supabase
      .from('user_radar_snapshots')
      .select('*')
      .eq('user_id', userId)
      .order('snapshot_date', { ascending: false })
      .limit(limit);

    // Filtra per type se specificato
    if (type) {
      query = query.eq('assessment_type', type);
    }

    const { data: snapshots, error } = await query;

    if (error) {
      console.error('Errore query snapshot:', error);
      return NextResponse.json(
        { error: 'Errore nel recupero degli snapshot' },
        { status: 500 }
      );
    }

    // Parsa scores_json per ogni snapshot
    const parsedSnapshots = (snapshots || []).map(snapshot => ({
      id: snapshot.id,
      snapshot_date: snapshot.snapshot_date,
      assessment_type: snapshot.assessment_type,
      scores: typeof snapshot.scores_json === 'string'
        ? JSON.parse(snapshot.scores_json)
        : snapshot.scores_json,
      triggered_by: snapshot.triggered_by,
      created_at: snapshot.created_at,
    }));

    return NextResponse.json({
      success: true,
      count: parsedSnapshots.length,
      snapshots: parsedSnapshots,
    });

  } catch (error) {
    console.error('Errore API radar/history:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
