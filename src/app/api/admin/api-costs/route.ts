// API per dashboard costi API
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/service';
import { verifyAdminFromRequest } from '@/lib/admin/verify-admin';

export const dynamic = 'force-dynamic';

// Tasso di cambio USD -> EUR (fisso per semplicità)
const USD_TO_EUR = 0.92;

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

    // Query in parallelo per performance
    const [todayResult, weekResult, monthResult, dailyTrend, conversationCount] = await Promise.all([
      // Oggi
      supabase
        .from('ai_coach_conversations')
        .select('api_cost_usd')
        .gte('created_at', startOfDay.toISOString())
        .not('api_cost_usd', 'is', null),

      // Questa settimana
      supabase
        .from('ai_coach_conversations')
        .select('api_cost_usd')
        .gte('created_at', startOfWeek.toISOString())
        .not('api_cost_usd', 'is', null),

      // Questo mese
      supabase
        .from('ai_coach_conversations')
        .select('api_cost_usd')
        .gte('created_at', startOfMonth.toISOString())
        .not('api_cost_usd', 'is', null),

      // Trend giornaliero ultimi 30 giorni
      supabase
        .from('ai_coach_conversations')
        .select('created_at, api_cost_usd, user_message_tokens, ai_response_tokens, model_used')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .not('api_cost_usd', 'is', null)
        .order('created_at', { ascending: true }),

      // Conteggio conversazioni questo mese
      supabase
        .from('ai_coach_conversations')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString())
    ]);

    // Funzione per sommare costi
    const sumCosts = (data: { api_cost_usd: number | string }[] | null) =>
      data?.reduce((sum, row) => sum + (parseFloat(String(row.api_cost_usd)) || 0), 0) || 0;

    // Calcola totali
    const todayUsd = sumCosts(todayResult.data);
    const weekUsd = sumCosts(weekResult.data);
    const monthUsd = sumCosts(monthResult.data);

    // Proiezione mensile
    const daysElapsed = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const projectedMonthUsd = daysElapsed > 0 ? (monthUsd / daysElapsed) * daysInMonth : 0;

    // Costo medio per conversazione
    const totalConversations = conversationCount.count || 0;
    const avgCostPerConversation = totalConversations > 0 ? monthUsd / totalConversations : 0;

    // Token totali questo mese
    const totalInputTokens = dailyTrend.data?.reduce(
      (sum, row) => sum + (row.user_message_tokens || 0), 0
    ) || 0;
    const totalOutputTokens = dailyTrend.data?.reduce(
      (sum, row) => sum + (row.ai_response_tokens || 0), 0
    ) || 0;

    // Aggrega trend per giorno
    const dailyAggregated: Record<string, { cost: number; conversations: number; inputTokens: number; outputTokens: number }> = {};

    dailyTrend.data?.forEach((row) => {
      const date = row.created_at.split('T')[0];
      if (!dailyAggregated[date]) {
        dailyAggregated[date] = { cost: 0, conversations: 0, inputTokens: 0, outputTokens: 0 };
      }
      dailyAggregated[date].cost += parseFloat(String(row.api_cost_usd)) || 0;
      dailyAggregated[date].conversations += 1;
      dailyAggregated[date].inputTokens += row.user_message_tokens || 0;
      dailyAggregated[date].outputTokens += row.ai_response_tokens || 0;
    });

    const trendData = Object.entries(dailyAggregated).map(([date, data]) => ({
      date,
      cost_usd: data.cost,
      cost_eur: data.cost * USD_TO_EUR,
      conversations: data.conversations,
      input_tokens: data.inputTokens,
      output_tokens: data.outputTokens,
    }));

    // Modelli usati questo mese
    const modelUsage: Record<string, number> = {};
    dailyTrend.data?.forEach((row) => {
      if (row.model_used) {
        modelUsage[row.model_used] = (modelUsage[row.model_used] || 0) + 1;
      }
    });

    // Alert se proiezione > €500
    const projectedEur = projectedMonthUsd * USD_TO_EUR;
    const isAlert = projectedEur > 500;

    return NextResponse.json({
      today: { usd: todayUsd, eur: todayUsd * USD_TO_EUR },
      week: { usd: weekUsd, eur: weekUsd * USD_TO_EUR },
      month: { usd: monthUsd, eur: monthUsd * USD_TO_EUR },
      projection: { usd: projectedMonthUsd, eur: projectedEur },
      avgPerConversation: { usd: avgCostPerConversation, eur: avgCostPerConversation * USD_TO_EUR },
      tokens: {
        input: totalInputTokens,
        output: totalOutputTokens,
        total: totalInputTokens + totalOutputTokens,
      },
      conversations: {
        thisMonth: totalConversations,
        today: todayResult.data?.length || 0,
      },
      modelUsage,
      trend: trendData,
      alert: isAlert,
    });

  } catch (error) {
    console.error('Errore API costs:', error);
    return NextResponse.json(
      { error: 'Errore caricamento dati costi' },
      { status: 500 }
    );
  }
}
