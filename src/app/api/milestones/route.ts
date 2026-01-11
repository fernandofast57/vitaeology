/**
 * API Milestones - Gestione milestone utente
 *
 * GET: Recupera milestone utente con filtri opzionali
 * PATCH: Marca milestone come notificate
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserMilestones, getUserTotalXP, markMilestoneNotified } from '@/lib/milestones';

export const dynamic = 'force-dynamic';

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

/**
 * GET /api/milestones
 *
 * Query params:
 * - pathType: 'leadership' | 'ostacoli' | 'microfelicita' | 'global' (opzionale)
 * - unnotifiedOnly: 'true' per solo milestone non notificate
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getUserFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Autenticazione richiesta' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const pathType = searchParams.get('pathType') as 'leadership' | 'ostacoli' | 'microfelicita' | 'global' | null;
    const unnotifiedOnly = searchParams.get('unnotifiedOnly') === 'true';

    // Recupera milestone
    const milestones = await getUserMilestones(
      userId,
      pathType || undefined
    );

    // Filtra se richiesto solo non notificate
    const filteredMilestones = unnotifiedOnly
      ? milestones.filter(m => !m.notified)
      : milestones;

    // Calcola XP totale
    const totalXP = await getUserTotalXP(userId);

    // Statistiche per path
    const statsByPath = milestones.reduce((acc, m) => {
      const path = m.pathType;
      if (!acc[path]) {
        acc[path] = { count: 0, xp: 0 };
      }
      acc[path].count += 1;
      acc[path].xp += m.definition?.xpReward || 0;
      return acc;
    }, {} as Record<string, { count: number; xp: number }>);

    return NextResponse.json({
      success: true,
      data: {
        milestones: filteredMilestones.map(m => ({
          id: m.id,
          milestoneType: m.milestoneType,
          pathType: m.pathType,
          achievedAt: m.achievedAt,
          notified: m.notified,
          milestoneData: m.milestoneData,
          definition: m.definition ? {
            code: m.definition.code,
            pathType: m.definition.pathType,
            category: m.definition.category,
            name: m.definition.name,
            description: m.definition.description,
            icon: m.definition.icon,
            xpReward: m.definition.xpReward,
            displayOrder: m.definition.displayOrder,
          } : null,
        })),
        totalXP,
        totalCount: milestones.length,
        unnotifiedCount: milestones.filter(m => !m.notified).length,
        statsByPath,
      },
    });

  } catch (error) {
    console.error('Errore API milestones GET:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/milestones
 *
 * Body:
 * - milestoneIds: string[] - ID delle milestone da marcare come notificate
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getUserFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Autenticazione richiesta' },
        { status: 401 }
      );
    }

    let body: { milestoneIds: string[] };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Body JSON non valido' },
        { status: 400 }
      );
    }

    const { milestoneIds } = body;

    if (!milestoneIds || !Array.isArray(milestoneIds) || milestoneIds.length === 0) {
      return NextResponse.json(
        { error: 'milestoneIds richiesto come array non vuoto' },
        { status: 400 }
      );
    }

    // Verifica che le milestone appartengano all'utente
    const supabase = getServiceClient();
    const { data: userMilestones } = await supabase
      .from('user_milestones')
      .select('id')
      .eq('user_id', userId)
      .in('id', milestoneIds);

    const validIds = (userMilestones || []).map(m => m.id);

    // Marca come notificate
    const results = await Promise.all(
      validIds.map(id => markMilestoneNotified(id))
    );

    return NextResponse.json({
      success: true,
      data: {
        markedCount: validIds.length,
        requestedCount: milestoneIds.length,
      },
    });

  } catch (error) {
    console.error('Errore API milestones PATCH:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
