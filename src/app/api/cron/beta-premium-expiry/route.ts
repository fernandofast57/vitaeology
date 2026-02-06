// ============================================================================
// CRON: /api/cron/beta-premium-expiry
// Schedule: Ogni giorno alle 1:00 UTC
// Descrizione: Verifica beta tester con premium scaduto e li riporta a explorer
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  // Verifica autorizzazione cron
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date().toISOString();

    // Trova utenti con beta_premium_until scaduto e ancora tier leader
    const { data: expiredUsers, error: fetchError } = await supabase
      .from('profiles')
      .select('id, email, subscription_tier, beta_premium_until')
      .lt('beta_premium_until', now)
      .eq('subscription_tier', 'leader')
      .is('stripe_subscription_id', null); // Solo chi non ha subscription Stripe attiva

    if (fetchError) {
      console.error('[Beta Premium Expiry] Errore fetch:', fetchError);
      return NextResponse.json({
        success: false,
        error: fetchError.message,
      }, { status: 500 });
    }

    const results = {
      found: expiredUsers?.length || 0,
      downgraded: 0,
      errors: 0,
    };

    if (!expiredUsers || expiredUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nessun premium beta scaduto',
        results,
        duration_ms: Date.now() - startTime,
      });
    }

    // Downgrade ogni utente a explorer
    for (const user of expiredUsers) {
      try {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            subscription_tier: 'explorer',
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (updateError) {
          console.error(`[Beta Premium Expiry] Errore downgrade utente:`, updateError);
          results.errors++;
          continue;
        }

        results.downgraded++;
      } catch (err) {
        console.error('[Beta Premium Expiry] Errore processing utente:', err);
        results.errors++;
      }
    }

    return NextResponse.json({
      success: true,
      results,
      duration_ms: Date.now() - startTime,
    });

  } catch (error) {
    console.error('[Beta Premium Expiry] Errore critico:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
    }, { status: 500 });
  }
}
