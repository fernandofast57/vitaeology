'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface MetricsSummary {
  totalConversations: number;
  avgRating: number;
  helpfulRatio: number;
  patternsCorrected: number;
  totalApiCost: number;
  avgResponseTime: number;
}

interface DailyMetric {
  date: string;
  conversations: number;
  messages: number;
  rating: number;
  helpfulRatio: number;
  apiCost: number;
  responseTime: number;
  patternsCorrected: number;
}

interface Pattern {
  id: string;
  pattern_type: string;
  pattern_description: string;
  occurrence_count: number;
  status: string;
  suggested_action: string;
  created_at: string;
}

interface WeeklyReport {
  id: string;
  week_start: string;
  week_end: string;
  status: string;
  report_content: {
    summary: {
      total_conversations: number;
      avg_rating: number;
      trend_vs_last_week: string;
      highlight?: string;
    };
    top_issues: { description: string; count: number; suggested_fix: string }[];
    suggested_prompt_changes: { change: string; reason: string }[];
    suggested_rag_additions: { content: string; keywords: string[] }[];
  };
}

type TabType = 'overview' | 'patterns' | 'report';
type PeriodType = 7 | 14 | 30;

export default function AICoachAdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetric[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [latestReport, setLatestReport] = useState<WeeklyReport | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [period, setPeriod] = useState<PeriodType>(7);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async (days: number = 7) => {
    try {
      setRefreshing(true);
      const response = await fetch(`/api/admin/ai-coach/dashboard?days=${days}`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics);
        setDailyMetrics(data.dailyMetrics || []);
        setPatterns(data.patterns || []);
        setLatestReport(data.latestReport);
      } else if (response.status === 401 || response.status === 403) {
        router.push('/dashboard?error=unauthorized');
      }
    } catch (error) {
      console.error('Errore caricamento dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDashboardData(period);
  }, [period, fetchDashboardData]);

  async function handlePatternAction(patternId: string, action: 'approve' | 'reject') {
    try {
      const response = await fetch('/api/admin/ai-coach/patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patternId, action }),
      });

      if (response.ok) {
        setPatterns(prev => prev.map(p =>
          p.id === patternId
            ? { ...p, status: action === 'approve' ? 'approved' : 'rejected' }
            : p
        ));
      }
    } catch (error) {
      console.error('Errore azione pattern:', error);
    }
  }

  async function handleReportReview(reportId: string) {
    try {
      const response = await fetch('/api/admin/ai-coach/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, action: 'review' }),
      });

      if (response.ok && latestReport) {
        setLatestReport({ ...latestReport, status: 'reviewed' });
      }
    } catch (error) {
      console.error('Errore review report:', error);
    }
  }

  function exportToCSV() {
    if (dailyMetrics.length === 0) return;

    const headers = ['Data', 'Conversazioni', 'Messaggi', 'Rating', 'Tasso Utilita %', 'Costo API €', 'Tempo Risposta ms', 'Pattern Corretti'];
    const rows = dailyMetrics.map(m => [
      m.date,
      m.conversations,
      m.messages,
      m.rating.toFixed(2),
      (m.helpfulRatio * 100).toFixed(1),
      m.apiCost.toFixed(4),
      m.responseTime,
      m.patternsCorrected,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ai-coach-metrics-${period}days-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function exportToJSON() {
    const exportData = {
      exportDate: new Date().toISOString(),
      period: `${period} giorni`,
      summary: metrics,
      dailyMetrics,
      patterns: patterns.filter(p => p.status === 'pending_review'),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ai-coach-export-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Formatta date per i grafici
  const formattedDailyMetrics = dailyMetrics.map(m => ({
    ...m,
    dateLabel: new Date(m.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }),
    helpfulPercent: Math.round(m.helpfulRatio * 100),
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Caricamento dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                AI Coach Learning System
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Dashboard amministrativa - Metriche e analisi
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchDashboardData(period)}
                disabled={refreshing}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-amber-600 disabled:opacity-50"
                title="Aggiorna dati"
              >
                <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <a
                href="/admin/analytics"
                className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600"
              >
                Analytics
              </a>
              <a
                href="/admin/quality-audit"
                className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600 flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
                Quality Audit
              </a>
              <a
                href="/admin/feedback-patterns"
                className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600 flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                </svg>
                Patterns
              </a>
              <a
                href="/admin/corrections"
                className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
                </svg>
                Ottimizzazione
              </a>
              <a
                href="/admin/performance"
                className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600"
              >
                Performance
              </a>
              <a
                href="/admin/api-costs"
                className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600"
              >
                Costi API
              </a>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-amber-500"
              >
                Torna alla Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs & Period Selector */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
          <nav className="flex space-x-8">
            {(['overview', 'patterns', 'report'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'overview' ? 'Panoramica' :
                 tab === 'patterns' ? 'Pattern Identificati' : 'Report Settimanale'}
              </button>
            ))}
          </nav>

          {activeTab === 'overview' && (
            <div className="flex items-center gap-3">
              {/* Period Selector */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                {([7, 14, 30] as const).map(days => (
                  <button
                    key={days}
                    onClick={() => setPeriod(days)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      period === days
                        ? 'bg-amber-500 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {days}g
                  </button>
                ))}
              </div>

              {/* Export Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={exportToCSV}
                  className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-amber-500"
                >
                  CSV
                </button>
                <button
                  onClick={exportToJSON}
                  className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-amber-500"
                >
                  JSON
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && metrics && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <MetricCard
                title="Conversazioni"
                value={metrics.totalConversations}
                subtitle={`Ultimi ${period} giorni`}
                icon="💬"
              />
              <MetricCard
                title="Rating Medio"
                value={metrics.avgRating.toFixed(2)}
                subtitle="Su 5 stelle"
                highlight={metrics.avgRating >= 4}
                icon="⭐"
              />
              <MetricCard
                title="Tasso Utilita"
                value={`${(metrics.helpfulRatio * 100).toFixed(0)}%`}
                subtitle="Feedback positivi"
                highlight={metrics.helpfulRatio >= 0.8}
                icon="👍"
              />
              <MetricCard
                title="Pattern Corretti"
                value={metrics.patternsCorrected}
                subtitle="Auto-correzioni"
                icon="🔧"
              />
              <MetricCard
                title="Costo API"
                value={`€${metrics.totalApiCost.toFixed(2)}`}
                subtitle="Totale periodo"
                icon="💰"
              />
              <MetricCard
                title="Risposta Media"
                value={`${Math.round(metrics.avgResponseTime)}ms`}
                subtitle="Tempo risposta"
                highlight={metrics.avgResponseTime < 3000}
                icon="⚡"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Conversations Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Trend Conversazioni
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={formattedDailyMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dateLabel" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="conversations" fill="#D97706" name="Conversazioni" />
                    <Bar dataKey="messages" fill="#F59E0B" name="Messaggi" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Rating & Helpful Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Qualita Risposte
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={formattedDailyMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dateLabel" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" domain={[0, 5]} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="rating" stroke="#10B981" name="Rating (0-5)" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="helpfulPercent" stroke="#3B82F6" name="Utilita %" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* API Cost Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Costo API Giornaliero
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={formattedDailyMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dateLabel" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(value) => `€${value.toFixed(2)}`} />
                    <Tooltip formatter={(value: number) => [`€${value.toFixed(4)}`, 'Costo']} />
                    <Bar dataKey="apiCost" fill="#6366F1" name="Costo API" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Response Time Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Tempo di Risposta
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={formattedDailyMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dateLabel" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(value) => `${value}ms`} />
                    <Tooltip formatter={(value: number) => [`${value}ms`, 'Tempo']} />
                    <Line type="monotone" dataKey="responseTime" stroke="#EF4444" name="Tempo Risposta" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Dati Giornalieri
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conv.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Msg</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilita</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Costo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risposta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {formattedDailyMetrics.slice().reverse().map(m => (
                      <tr key={m.date} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{m.dateLabel}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{m.conversations}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{m.messages}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={m.rating >= 4 ? 'text-green-600' : m.rating >= 3 ? 'text-yellow-600' : 'text-red-600'}>
                            {m.rating.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={m.helpfulPercent >= 80 ? 'text-green-600' : m.helpfulPercent >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                            {m.helpfulPercent}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">€{m.apiCost.toFixed(4)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{m.responseTime}ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Patterns Tab */}
        {activeTab === 'patterns' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Pattern in Attesa di Revisione
              </h2>
              <span className="px-3 py-1 text-sm bg-amber-100 text-amber-800 rounded-full">
                {patterns.filter(p => p.status === 'pending_review').length} in attesa
              </span>
            </div>
            {patterns.filter(p => p.status === 'pending_review').length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="text-4xl mb-4">✅</div>
                <p className="text-gray-500 dark:text-gray-400">Nessun pattern in attesa di revisione</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Il sistema sta funzionando correttamente</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {patterns
                  .filter(p => p.status === 'pending_review')
                  .map(pattern => (
                    <li key={pattern.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                              pattern.pattern_type === 'negative_feedback_cluster'
                                ? 'bg-red-100 text-red-800'
                                : pattern.pattern_type === 'success_pattern'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {pattern.pattern_type.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(pattern.created_at).toLocaleDateString('it-IT')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {pattern.pattern_description}
                          </p>
                          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <span className="font-medium">{pattern.occurrence_count}</span> occorrenze
                            </span>
                            <span className="text-amber-600">{pattern.suggested_action}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handlePatternAction(pattern.id, 'approve')}
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Approva
                          </button>
                          <button
                            onClick={() => handlePatternAction(pattern.id, 'reject')}
                            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Rifiuta
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        )}

        {/* Report Tab */}
        {activeTab === 'report' && (
          <div className="space-y-6">
            {latestReport ? (
              <>
                {/* Report Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Report Settimana {new Date(latestReport.week_start).toLocaleDateString('it-IT')} - {new Date(latestReport.week_end).toLocaleDateString('it-IT')}
                      </h2>
                      <span className={`inline-block mt-2 px-3 py-1 text-xs rounded-full ${
                        latestReport.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {latestReport.status === 'pending' ? '⏳ Da Revisionare' : '✅ Revisionato'}
                      </span>
                    </div>
                    {latestReport.status === 'pending' && (
                      <button
                        onClick={() => handleReportReview(latestReport.id)}
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                      >
                        Segna come Revisionato
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Conversazioni</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                        {latestReport.report_content.summary.total_conversations}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Rating Medio</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                        {latestReport.report_content.summary.avg_rating.toFixed(2)} ⭐
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Trend vs Settimana Precedente</p>
                      <p className={`text-3xl font-bold mt-1 ${
                        latestReport.report_content.summary.trend_vs_last_week.includes('+')
                          ? 'text-green-600'
                          : latestReport.report_content.summary.trend_vs_last_week.includes('-')
                          ? 'text-red-600'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {latestReport.report_content.summary.trend_vs_last_week}
                      </p>
                    </div>
                  </div>

                  {latestReport.report_content.summary.highlight && (
                    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        💡 {latestReport.report_content.summary.highlight}
                      </p>
                    </div>
                  )}
                </div>

                {/* Top Issues */}
                {latestReport.report_content.top_issues.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      🚨 Top Issues
                    </h3>
                    <ul className="space-y-3">
                      {latestReport.report_content.top_issues.map((issue, idx) => (
                        <li key={idx} className="flex items-start p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-800 text-sm flex items-center justify-center font-bold">
                            {issue.count}
                          </span>
                          <div className="ml-3">
                            <p className="text-sm text-gray-900 dark:text-white font-medium">{issue.description}</p>
                            {issue.suggested_fix && (
                              <p className="text-xs text-gray-500 mt-1">
                                <span className="text-green-600">Fix suggerito:</span> {issue.suggested_fix}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggested Changes */}
                {latestReport.report_content.suggested_prompt_changes.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      📝 Modifiche Prompt Suggerite
                    </h3>
                    <ul className="space-y-3">
                      {latestReport.report_content.suggested_prompt_changes.map((suggestion, idx) => (
                        <li key={idx} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-sm text-gray-900 dark:text-white font-medium">{suggestion.change}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            <span className="text-blue-600">Motivazione:</span> {suggestion.reason}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggested RAG Additions */}
                {latestReport.report_content.suggested_rag_additions.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      📚 Contenuti RAG Suggeriti
                    </h3>
                    <ul className="space-y-3">
                      {latestReport.report_content.suggested_rag_additions.map((rag, idx) => (
                        <li key={idx} className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                          <p className="text-sm text-gray-900 dark:text-white">{rag.content}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {rag.keywords.map((kw, kwIdx) => (
                              <span key={kwIdx} className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
                <div className="text-4xl mb-4">📊</div>
                <p className="text-gray-500 dark:text-gray-400">Nessun report settimanale disponibile</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  I report vengono generati automaticamente ogni lunedi
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  highlight = false,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  highlight?: boolean;
  icon?: string;
}) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 ${
      highlight ? 'ring-2 ring-green-500' : ''
    }`}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{title}</p>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
    </div>
  );
}
