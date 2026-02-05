/**
 * AI Coach Learning System - Weekly Report
 * Ciclo Lento: Genera report settimanale per Fernando
 */

import { getSupabaseClient } from '@/lib/supabase/service';
import {
  AICoachWeeklyReport,
  WeeklyReportContent,
  TopIssue,
  PromptSuggestion,
  RAGAdditionSuggestion,
  WeekComparison,
  AICoachMetricsDaily,
} from '@/types/ai-coach-learning';
import { getMetricsRange } from './daily-metrics';

/**
 * Calcola date inizio/fine settimana
 */
function getWeekBounds(date: Date = new Date()): { start: string; end: string } {
  const d = new Date(date);
  // Vai al lunedi precedente
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) - 7; // Settimana precedente
  d.setDate(diff);
  const start = d.toISOString().split('T')[0];

  d.setDate(d.getDate() + 6);
  const end = d.toISOString().split('T')[0];

  return { start, end };
}

/**
 * Recupera top issues dalla settimana
 */
async function getTopIssues(
  weekStart: string,
  weekEnd: string
): Promise<TopIssue[]> {
  const supabase = getSupabaseClient();

  // Recupera pattern con piu occorrenze
  const { data: patterns } = await supabase
    .from('ai_coach_patterns')
    .select('*')
    .gte('created_at', weekStart)
    .lte('created_at', weekEnd + 'T23:59:59')
    .in('status', ['identified', 'pending_review', 'auto_corrected'])
    .order('occurrence_count', { ascending: false })
    .limit(5);

  if (!patterns) return [];

  return patterns.map(p => ({
    description: p.pattern_description,
    count: p.occurrence_count,
    impact: p.pattern_type === 'negative_feedback_cluster' ? 'Alto' :
            p.pattern_type === 'abandonment_trigger' ? 'Medio-Alto' : 'Medio',
    suggested_fix: p.suggested_action,
    pattern_id: p.id,
  }));
}

/**
 * Genera suggerimenti per modifiche prompt
 */
async function getPromptSuggestions(
  weekStart: string,
  weekEnd: string
): Promise<PromptSuggestion[]> {
  const supabase = getSupabaseClient();

  // Recupera pattern di tipo che richiedono modifiche prompt
  const { data: patterns } = await supabase
    .from('ai_coach_patterns')
    .select('*')
    .gte('created_at', weekStart)
    .lte('created_at', weekEnd + 'T23:59:59')
    .in('pattern_type', ['negative_feedback_cluster', 'reformulation_trigger'])
    .gte('occurrence_count', 3)
    .order('occurrence_count', { ascending: false })
    .limit(3);

  if (!patterns) return [];

  return patterns.map(p => ({
    change: `Migliorare risposta per: "${p.pattern_keywords?.join(', ') || 'vari argomenti'}"`,
    reason: `${p.occurrence_count} occorrenze questa settimana`,
    expected_impact: 'Riduzione feedback negativi del 20-30%',
    confidence: Math.min(0.9, 0.5 + (p.occurrence_count * 0.1)),
    pattern_id: p.id,
  }));
}

/**
 * Genera suggerimenti per aggiunte RAG
 */
async function getRAGSuggestions(
  weekStart: string,
  weekEnd: string
): Promise<RAGAdditionSuggestion[]> {
  const supabase = getSupabaseClient();

  // Recupera pattern di tipo "unanswered_question"
  const { data: patterns } = await supabase
    .from('ai_coach_patterns')
    .select('*')
    .gte('created_at', weekStart)
    .lte('created_at', weekEnd + 'T23:59:59')
    .eq('pattern_type', 'unanswered_question')
    .gte('occurrence_count', 2)
    .order('occurrence_count', { ascending: false })
    .limit(3);

  if (!patterns) return [];

  return patterns.map(p => ({
    content: `Aggiungere contenuto su: ${p.pattern_description.substring(0, 100)}`,
    keywords: p.pattern_keywords || [],
    reason: `${p.occurrence_count} domande simili senza risposta adeguata`,
  }));
}

/**
 * Calcola confronto con settimana precedente
 */
async function getWeekComparison(
  currentMetrics: AICoachMetricsDaily[],
  weekStart: string
): Promise<WeekComparison> {
  // Calcola date settimana precedente
  const prevStart = new Date(weekStart);
  prevStart.setDate(prevStart.getDate() - 7);
  const prevEnd = new Date(weekStart);
  prevEnd.setDate(prevEnd.getDate() - 1);

  const prevMetrics = await getMetricsRange(
    prevStart.toISOString().split('T')[0],
    prevEnd.toISOString().split('T')[0]
  );

  // Calcola medie
  const avgCurrent = {
    rating: calcAvg(currentMetrics, 'p2_quality_avg_rating'),
    conversations: calcSum(currentMetrics, 'p2_quantity_conversations'),
    helpful: calcAvg(currentMetrics, 'p2_quality_helpful_ratio'),
  };

  const avgPrev = {
    rating: calcAvg(prevMetrics, 'p2_quality_avg_rating'),
    conversations: calcSum(prevMetrics, 'p2_quantity_conversations'),
    helpful: calcAvg(prevMetrics, 'p2_quality_helpful_ratio'),
  };

  return {
    rating_trend: formatTrend(avgCurrent.rating, avgPrev.rating),
    conversations_trend: formatTrend(avgCurrent.conversations, avgPrev.conversations, true),
    helpful_ratio_trend: formatTrend(avgCurrent.helpful, avgPrev.helpful, false, true),
  };
}

function calcAvg(metrics: AICoachMetricsDaily[], field: keyof AICoachMetricsDaily): number {
  const values = metrics.map(m => m[field] as number | null).filter(v => v != null) as number[];
  return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

function calcSum(metrics: AICoachMetricsDaily[], field: keyof AICoachMetricsDaily): number {
  return metrics.reduce((sum, m) => sum + ((m[field] as number) || 0), 0);
}

function formatTrend(current: number, prev: number, isCount = false, isPercentage = false): string {
  if (prev === 0) return current > 0 ? '+100%' : '0%';
  const diff = current - prev;
  const pctChange = ((diff / prev) * 100).toFixed(1);
  const sign = diff >= 0 ? '+' : '';

  if (isCount) {
    return `${sign}${Math.round(diff)} (${sign}${pctChange}%)`;
  }
  if (isPercentage) {
    return `${sign}${(diff * 100).toFixed(1)}pp`;
  }
  return `${sign}${diff.toFixed(2)}`;
}

/**
 * Genera report settimanale completo
 */
export async function generateWeeklyReport(
  date?: Date
): Promise<AICoachWeeklyReport | null> {
  const supabase = getSupabaseClient();
  const { start: weekStart, end: weekEnd } = getWeekBounds(date);

  try {
    // Recupera metriche della settimana
    const metrics = await getMetricsRange(weekStart, weekEnd);

    // Calcola totali
    const totalConversations = calcSum(metrics, 'p2_quantity_conversations');
    const avgRating = calcAvg(metrics, 'p2_quality_avg_rating');

    // Recupera dati per il report
    const topIssues = await getTopIssues(weekStart, weekEnd);
    const promptSuggestions = await getPromptSuggestions(weekStart, weekEnd);
    const ragSuggestions = await getRAGSuggestions(weekStart, weekEnd);
    const comparison = await getWeekComparison(metrics, weekStart);

    // Determina trend
    const trend = comparison.rating_trend.startsWith('+') ? 'in miglioramento' :
                  comparison.rating_trend.startsWith('-') ? 'in calo' : 'stabile';

    // Genera highlight
    let highlight: string | undefined;
    if (topIssues.length > 0) {
      highlight = `Top issue: ${topIssues[0].description.substring(0, 50)}... (${topIssues[0].count} occorrenze)`;
    } else if (avgRating >= 4.5) {
      highlight = 'Eccellente settimana! Rating medio sopra 4.5';
    }

    const reportContent: WeeklyReportContent = {
      summary: {
        total_conversations: totalConversations,
        avg_rating: avgRating,
        trend_vs_last_week: trend,
        highlight,
      },
      top_issues: topIssues,
      suggested_prompt_changes: promptSuggestions,
      suggested_rag_additions: ragSuggestions,
      metrics_12_factors: {
        p2_quantity_conversations: totalConversations,
        p2_quality_avg_rating: avgRating,
        p2_quality_helpful_ratio: calcAvg(metrics, 'p2_quality_helpful_ratio'),
        p4_quantity_patterns_corrected: calcSum(metrics, 'p4_quantity_patterns_corrected'),
      },
      comparison_last_week: comparison,
    };

    // Salva report nel database
    const { data: report, error } = await supabase
      .from('ai_coach_weekly_reports')
      .insert({
        week_start: weekStart,
        week_end: weekEnd,
        report_content: reportContent,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Errore salvataggio report:', error);
      return null;
    }

    return report;

  } catch (error) {
    console.error('Errore generazione report settimanale:', error);
    return null;
  }
}

/**
 * Recupera ultimo report settimanale
 */
export async function getLatestReport(): Promise<AICoachWeeklyReport | null> {
  const supabase = getSupabaseClient();

  const { data } = await supabase
    .from('ai_coach_weekly_reports')
    .select('*')
    .order('week_start', { ascending: false })
    .limit(1)
    .single();

  return data;
}

/**
 * Segna report come revisionato
 */
export async function markReportReviewed(
  reportId: string,
  actions?: { action_type: string; target_id: string; notes?: string }[]
): Promise<boolean> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('ai_coach_weekly_reports')
    .update({
      status: actions && actions.length > 0 ? 'actioned' : 'reviewed',
      actions_taken: actions || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', reportId);

  return !error;
}
