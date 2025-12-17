import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getRecentMetrics } from '@/lib/ai-coach/daily-metrics';
import { getLatestReport } from '@/lib/ai-coach/weekly-report';
import { verifyAdminFromRequest } from '@/lib/admin/verify-admin';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  // Verifica che l'utente sia admin
  const adminCheck = await verifyAdminFromRequest();
  if (!adminCheck.isAdmin) {
    return adminCheck.response;
  }

  // Parametro days opzionale (default 7, max 30)
  const searchParams = request.nextUrl.searchParams;
  const daysParam = searchParams.get('days');
  const days = Math.min(Math.max(parseInt(daysParam || '7', 10) || 7, 1), 30);

  try {
    const supabase = getSupabaseClient();

    // Recupera metriche per il periodo richiesto
    const recentMetrics = await getRecentMetrics(days);

    // Calcola sommario
    const totalConversations = recentMetrics.reduce(
      (sum, m) => sum + (m.p2_quantity_conversations || 0),
      0
    );
    const ratingsWithValue = recentMetrics.filter(m => m.p2_quality_avg_rating != null);
    const avgRating = ratingsWithValue.length > 0
      ? ratingsWithValue.reduce((sum, m) => sum + (m.p2_quality_avg_rating || 0), 0) / ratingsWithValue.length
      : 0;
    const helpfulWithValue = recentMetrics.filter(m => m.p2_quality_helpful_ratio != null);
    const helpfulRatio = helpfulWithValue.length > 0
      ? helpfulWithValue.reduce((sum, m) => sum + (m.p2_quality_helpful_ratio || 0), 0) / helpfulWithValue.length
      : 0;
    const patternsCorrected = recentMetrics.reduce(
      (sum, m) => sum + (m.p4_quantity_patterns_corrected || 0),
      0
    );

    // Recupera pattern in attesa di revisione
    const { data: patterns } = await supabase
      .from('ai_coach_patterns')
      .select('*')
      .in('status', ['pending_review', 'identified'])
      .order('occurrence_count', { ascending: false })
      .limit(20);

    // Recupera ultimo report settimanale
    const latestReport = await getLatestReport();

    // Calcola costo totale API
    const totalApiCost = recentMetrics.reduce(
      (sum, m) => sum + (m.p1_viability_api_cost || 0),
      0
    );

    // Calcola tempo risposta medio
    const responseTimes = recentMetrics.filter(m => m.p1_viability_avg_response_time != null);
    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, m) => sum + (m.p1_viability_avg_response_time || 0), 0) / responseTimes.length
      : 0;

    // Formatta dati giornalieri per grafici
    const dailyMetrics = recentMetrics.map(m => ({
      date: m.date,
      conversations: m.p2_quantity_conversations || 0,
      messages: m.p2_quantity_messages || 0,
      rating: m.p2_quality_avg_rating || 0,
      helpfulRatio: m.p2_quality_helpful_ratio || 0,
      apiCost: m.p1_viability_api_cost || 0,
      responseTime: m.p1_viability_avg_response_time || 0,
      patternsCorrected: m.p4_quantity_patterns_corrected || 0,
    }));

    return NextResponse.json({
      metrics: {
        totalConversations,
        avgRating,
        helpfulRatio,
        patternsCorrected,
        totalApiCost,
        avgResponseTime,
      },
      dailyMetrics,
      patterns: patterns || [],
      latestReport,
      period: { days },
    });

  } catch (error) {
    console.error('Errore dashboard API:', error);
    return NextResponse.json(
      { error: 'Errore caricamento dati' },
      { status: 500 }
    );
  }
}
