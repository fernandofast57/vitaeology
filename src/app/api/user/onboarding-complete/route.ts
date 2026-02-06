/**
 * API: /api/user/onboarding-complete
 * Marca l'onboarding del Founding Tester come completato
 *
 * Metodo: POST
 * Auth: Richiesta (solo utenti autenticati)
 * Rate limit: 5/min (chiamata una tantum)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, getClientIP, rateLimitExceededResponse } from '@/lib/rate-limiter';

export const dynamic = 'force-dynamic';

// Rate limit conservativo: 5 richieste per minuto
const RATE_LIMIT = {
  maxRequests: 5,
  windowSeconds: 60,
  identifier: 'onboarding-complete',
};

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);

  // Rate limiting
  const rateLimit = checkRateLimit(clientIP, RATE_LIMIT);
  if (!rateLimit.success) {
    return rateLimitExceededResponse(rateLimit.resetIn);
  }

  try {
    const supabase = await createClient();

    // Verifica autenticazione
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      );
    }

    // Aggiorna il profilo per marcare l'onboarding come completato
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        founding_tester_onboarding_shown: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('[Onboarding Complete] Errore update:', updateError);
      return NextResponse.json(
        { error: 'Errore nel salvataggio' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding completato',
    });

  } catch (error) {
    console.error('[Onboarding Complete] Errore:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
