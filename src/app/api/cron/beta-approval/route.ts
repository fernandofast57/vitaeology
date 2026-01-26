// ============================================================================
// CRON: /api/cron/beta-approval
// Schedule: Ogni giorno alle 9:00 UTC (10:00 ora italiana)
// Descrizione: Approva beta tester che hanno fatto richiesta il giorno prima
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendBetaWelcomeEmail } from '@/lib/email/beta-tester-emails';

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
    // Trova beta tester con status 'pending_approval' creati più di 12 ore fa
    // (per assicurarsi che siano del giorno prima)
    const twelveHoursAgo = new Date();
    twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

    const { data: pendingTesters, error: fetchError } = await supabase
      .from('beta_testers')
      .select('*')
      .eq('status', 'pending_approval')
      .lt('created_at', twelveHoursAgo.toISOString())
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('[Beta Approval Cron] Errore fetch:', fetchError);
      return NextResponse.json({
        success: false,
        error: fetchError.message,
      }, { status: 500 });
    }

    const results = {
      found: pendingTesters?.length || 0,
      approved: 0,
      emailsSent: 0,
      errors: 0,
    };

    if (!pendingTesters || pendingTesters.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nessun beta tester da approvare',
        results,
        duration_ms: Date.now() - startTime,
      });
    }

    // Processa ogni tester
    for (const tester of pendingTesters) {
      try {
        // Aggiorna status a 'approved'
        const { error: updateError } = await supabase
          .from('beta_testers')
          .update({
            status: 'approved',
            cohort: 'A',
            approved_at: new Date().toISOString(),
          })
          .eq('id', tester.id);

        if (updateError) {
          console.error(`[Beta Approval] Errore update ${tester.email}:`, updateError);
          results.errors++;
          continue;
        }

        results.approved++;

        // Imposta badge Founding Tester sul profilo (se esiste)
        await supabase
          .from('profiles')
          .update({ is_founding_tester: true })
          .eq('email', tester.email.toLowerCase());

        // Invia email di benvenuto
        const emailResult = await sendBetaWelcomeEmail({
          email: tester.email,
          fullName: tester.full_name,
          cohort: 'A',
        });

        if (emailResult.success) {
          results.emailsSent++;
          console.log(`[Beta Approval] Approvato e email inviata: ${tester.email}`);
        } else {
          console.error(`[Beta Approval] Errore email ${tester.email}:`, emailResult.error);
          results.errors++;
        }

      } catch (err) {
        console.error(`[Beta Approval] Errore processing ${tester.email}:`, err);
        results.errors++;
      }
    }

    return NextResponse.json({
      success: true,
      results,
      duration_ms: Date.now() - startTime,
    });

  } catch (error) {
    console.error('[Beta Approval Cron] Errore critico:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
    }, { status: 500 });
  }
}
