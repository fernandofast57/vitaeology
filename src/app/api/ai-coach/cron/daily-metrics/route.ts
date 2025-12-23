import { NextRequest, NextResponse } from 'next/server';
import { runDailyMetricsJob } from '@/lib/ai-coach/daily-metrics';

export const dynamic = 'force-dynamic';

// Questo endpoint puo essere chiamato da:
// - Vercel Cron Jobs (configurare in vercel.json)
// - Servizio esterno (cron-job.org, etc.)
// - Manualmente per test

export async function GET(request: NextRequest) {
  // Verifica autorizzazione (opzionale ma consigliato)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // Se CRON_SECRET e configurato, verifica
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Non autorizzato' },
      { status: 401 }
    );
  }

  try {
    const result = await runDailyMetricsJob();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Metriche giornaliere calcolate con successo',
        metrics: result.metrics,
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Errore calcolo metriche' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Errore cron daily-metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Errore interno' },
      { status: 500 }
    );
  }
}

// Anche POST per compatibilità con diversi servizi cron
export async function POST(request: NextRequest) {
  return GET(request);
}
