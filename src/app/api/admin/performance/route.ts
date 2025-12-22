// API per metriche performance tempi risposta
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminFromRequest } from '@/lib/admin/verify-admin';

export const dynamic = 'force-dynamic';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  // Verifica che l'utente sia admin
  const adminCheck = await verifyAdminFromRequest();
  if (!adminCheck.isAdmin) {
    return adminCheck.response;
  }

  try {
    const supabase = getSupabaseClient();
    const now = new Date();

    // Calcola date di riferimento
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Query tutti i tempi risposta degli ultimi 30 giorni (ordinati per calcolo percentili)
    const { data: allTimes, error } = await supabase
      .from('ai_coach_conversations')
      .select('response_time_ms, created_at')
      .not('response_time_ms', 'is', null)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('response_time_ms', { ascending: true });

    if (error) {
      console.error('Errore query performance:', error);
      return NextResponse.json(
        { error: 'Errore caricamento dati' },
        { status: 500 }
      );
    }

    // Se non ci sono dati, ritorna valori vuoti
    if (!allTimes || allTimes.length === 0) {
      return NextResponse.json({
        today: { avg: 0, count: 0 },
        week: { avg: 0, count: 0 },
        month: { avg: 0, count: 0 },
        percentiles: { p50: 0, p90: 0, p99: 0 },
        distribution: [
          { label: '0-1s', count: 0, color: 'green' },
          { label: '1-2s', count: 0, color: 'green' },
          { label: '2-3s', count: 0, color: 'green' },
          { label: '3-5s', count: 0, color: 'yellow' },
          { label: '5-10s', count: 0, color: 'red' },
          { label: '>10s', count: 0, color: 'red' },
        ],
        dailyTrend: [],
        alert: false,
      });
    }

    // Funzioni helper
    const filterByDate = (data: typeof allTimes, startDate: Date) =>
      data.filter(d => new Date(d.created_at) >= startDate);

    const calcAvg = (data: typeof allTimes) =>
      data.length ? data.reduce((sum, d) => sum + (d.response_time_ms || 0), 0) / data.length : 0;

    const calcPercentile = (sortedData: typeof allTimes, percentile: number) => {
      if (sortedData.length === 0) return 0;
      const index = Math.ceil((percentile / 100) * sortedData.length) - 1;
      return sortedData[Math.max(0, index)]?.response_time_ms || 0;
    };

    // Filtra dati per periodo
    const todayData = filterByDate(allTimes, startOfDay);
    const weekData = filterByDate(allTimes, startOfWeek);
    const monthData = filterByDate(allTimes, startOfMonth);

    // Percentili (su dati mese, già ordinati)
    const p50 = calcPercentile(allTimes, 50);
    const p90 = calcPercentile(allTimes, 90);
    const p99 = calcPercentile(allTimes, 99);

    // Distribuzione per histogram
    const bins = [
      { label: '0-1s', min: 0, max: 1000, count: 0, color: 'green' },
      { label: '1-2s', min: 1000, max: 2000, count: 0, color: 'green' },
      { label: '2-3s', min: 2000, max: 3000, count: 0, color: 'green' },
      { label: '3-5s', min: 3000, max: 5000, count: 0, color: 'yellow' },
      { label: '5-10s', min: 5000, max: 10000, count: 0, color: 'red' },
      { label: '>10s', min: 10000, max: Infinity, count: 0, color: 'red' },
    ];

    monthData.forEach(d => {
      const time = d.response_time_ms || 0;
      const bin = bins.find(b => time >= b.min && time < b.max);
      if (bin) bin.count++;
    });

    // Trend giornaliero
    const dailyAggregated: Record<string, { total: number; count: number }> = {};
    allTimes.forEach(d => {
      const date = d.created_at.split('T')[0];
      if (!dailyAggregated[date]) {
        dailyAggregated[date] = { total: 0, count: 0 };
      }
      dailyAggregated[date].total += d.response_time_ms || 0;
      dailyAggregated[date].count += 1;
    });

    const dailyTrend = Object.entries(dailyAggregated)
      .map(([date, data]) => ({
        date,
        avg: Math.round(data.total / data.count),
        count: data.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      today: { avg: Math.round(calcAvg(todayData)), count: todayData.length },
      week: { avg: Math.round(calcAvg(weekData)), count: weekData.length },
      month: { avg: Math.round(calcAvg(monthData)), count: monthData.length },
      percentiles: {
        p50: Math.round(p50),
        p90: Math.round(p90),
        p99: Math.round(p99),
      },
      distribution: bins.map(b => ({
        label: b.label,
        count: b.count,
        color: b.color,
      })),
      dailyTrend,
      alert: p90 > 5000, // Alert se P90 > 5 secondi
    });

  } catch (error) {
    console.error('Errore API performance:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
