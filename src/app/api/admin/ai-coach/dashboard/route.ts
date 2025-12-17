import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getRecentMetrics } from '@/lib/ai-coach/daily-metrics';
import { getLatestReport } from '@/lib/ai-coach/weekly-report';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    // Recupera metriche ultimi 7 giorni
    const recentMetrics = await getRecentMetrics(7);

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

    return NextResponse.json({
      metrics: {
        totalConversations,
        avgRating,
        helpfulRatio,
        patternsCorrected,
      },
      patterns: patterns || [],
      latestReport,
    });

  } catch (error) {
    console.error('Errore dashboard API:', error);
    return NextResponse.json(
      { error: 'Errore caricamento dati' },
      { status: 500 }
    );
  }
}
