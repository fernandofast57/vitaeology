/**
 * API Recommendations - Raccomandazioni esercizi personalizzate
 *
 * GET: Ottiene raccomandazioni per l'utente autenticato
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { createExerciseRecommendationService } from '@/lib/services/exercise-recommendation';

export const dynamic = 'force-dynamic';

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Verifica autenticazione server-side (C9 fix: rimosso fallback insicuro a query params)
async function getUserFromRequest(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user.id;
}

// ============================================================
// GET: Ottieni raccomandazioni personalizzate
// ============================================================
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getUserFromRequest();

    if (!userId) {
      return NextResponse.json(
        { error: 'Autenticazione richiesta' },
        { status: 401 }
      );
    }

    const supabase = getServiceClient();
    const recommendationService = createExerciseRecommendationService(supabase);

    const recommendations = await recommendationService.generateRecommendations(userId);

    return NextResponse.json(recommendations);

  } catch (error) {
    console.error('Errore API recommendations:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// ============================================================
// POST: Refresh raccomandazioni (invalida cache)
// ============================================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getUserFromRequest();

    if (!userId) {
      return NextResponse.json(
        { error: 'Autenticazione richiesta' },
        { status: 401 }
      );
    }

    const supabase = getServiceClient();
    const recommendationService = createExerciseRecommendationService(supabase);

    // Invalida cache e rigenera
    recommendationService.invalidateCache(userId);
    const recommendations = await recommendationService.generateRecommendations(userId);

    return NextResponse.json({
      success: true,
      recommendations
    });

  } catch (error) {
    console.error('Errore API recommendations POST:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
