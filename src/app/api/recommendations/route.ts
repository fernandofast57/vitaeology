/**
 * API Recommendations - Raccomandazioni esercizi personalizzate
 *
 * GET: Ottiene raccomandazioni per l'utente autenticato
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createExerciseRecommendationService } from '@/lib/services/exercise-recommendation';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Verifica autenticazione da cookie
async function getUserFromRequest(request: NextRequest): Promise<string | null> {
  // Estrai token da Authorization header o cookie
  const authHeader = request.headers.get('Authorization');

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const supabase = getServiceClient();

    const { data: { user } } = await supabase.auth.getUser(token);
    return user?.id || null;
  }

  // Fallback: cerca user_id nel body o query params
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');

  if (userId) {
    // Verifica che l'utente esista
    const supabase = getServiceClient();
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    return data?.id || null;
  }

  return null;
}

// ============================================================
// GET: Ottieni raccomandazioni personalizzate
// ============================================================
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getUserFromRequest(request);

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
    const userId = await getUserFromRequest(request);

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
