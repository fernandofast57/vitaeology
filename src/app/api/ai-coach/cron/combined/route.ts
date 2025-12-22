// Combined AI Coach Cron Job
// Esegue daily-metrics ogni giorno e weekly-report la domenica
// Questo permette di avere un solo cron job invece di due

import { NextRequest, NextResponse } from 'next/server';
import { runDailyMetricsJob } from '@/lib/ai-coach/daily-metrics';
import { generateWeeklyReport } from '@/lib/ai-coach/weekly-report';
import { sendWeeklyReportEmail } from '@/lib/ai-coach/email-report';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Verifica autorizzazione
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: {
    dailyMetrics?: { success: boolean; error?: string };
    weeklyReport?: { success: boolean; error?: string };
  } = {};

  // 1. Esegui sempre daily metrics
  try {
    const metricsResult = await runDailyMetricsJob();
    results.dailyMetrics = {
      success: metricsResult.success
    };
  } catch (error) {
    console.error('Daily metrics error:', error);
    results.dailyMetrics = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }

  // 2. Esegui weekly report solo di domenica (giorno 0)
  const today = new Date();
  const isSunday = today.getUTCDay() === 0;

  if (isSunday) {
    try {
      // Genera report
      const report = await generateWeeklyReport();

      if (report) {
        // Invia email
        const emailResult = await sendWeeklyReportEmail(report);
        results.weeklyReport = {
          success: emailResult.success,
          error: emailResult.error
        };
      } else {
        results.weeklyReport = {
          success: false,
          error: 'Report generation failed'
        };
      }
    } catch (error) {
      console.error('Weekly report error:', error);
      results.weeklyReport = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  console.log('Combined cron results:', results);

  return NextResponse.json({
    success: true,
    isSunday,
    results
  });
}
