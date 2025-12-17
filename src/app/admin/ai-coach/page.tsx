'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface MetricsSummary {
  totalConversations: number;
  avgRating: number;
  helpfulRatio: number;
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

export default function AICoachAdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [latestReport, setLatestReport] = useState<WeeklyReport | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'patterns' | 'report'>('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const response = await fetch('/api/admin/ai-coach/dashboard');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics);
        setPatterns(data.patterns || []);
        setLatestReport(data.latestReport);
      }
    } catch (error) {
      console.error('Errore caricamento dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handlePatternAction(patternId: string, action: 'approve' | 'reject') {
    try {
      const response = await fetch('/api/admin/ai-coach/patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patternId, action }),
      });

      if (response.ok) {
        // Aggiorna lista pattern
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI Coach Learning System
            </h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600"
            >
              Torna alla Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {(['overview', 'patterns', 'report'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
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
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Conversazioni Totali"
              value={metrics.totalConversations}
              subtitle="Ultimi 7 giorni"
            />
            <MetricCard
              title="Rating Medio"
              value={metrics.avgRating.toFixed(2)}
              subtitle="Su 5 stelle"
              highlight={metrics.avgRating >= 4}
            />
            <MetricCard
              title="Tasso Utilita"
              value={`${(metrics.helpfulRatio * 100).toFixed(0)}%`}
              subtitle="Feedback positivi"
              highlight={metrics.helpfulRatio >= 0.8}
            />
            <MetricCard
              title="Pattern Corretti"
              value={metrics.patternsCorrected}
              subtitle="Auto-correzioni applicate"
            />
          </div>
        )}

        {/* Patterns Tab */}
        {activeTab === 'patterns' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Pattern in Attesa di Revisione
              </h2>
            </div>
            {patterns.filter(p => p.status === 'pending_review').length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                Nessun pattern in attesa di revisione
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {patterns
                  .filter(p => p.status === 'pending_review')
                  .map(pattern => (
                    <li key={pattern.id} className="px-6 py-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            pattern.pattern_type === 'negative_feedback_cluster'
                              ? 'bg-red-100 text-red-800'
                              : pattern.pattern_type === 'success_pattern'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {pattern.pattern_type.replace(/_/g, ' ')}
                          </span>
                          <p className="mt-2 text-sm text-gray-900 dark:text-white">
                            {pattern.pattern_description}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {pattern.occurrence_count} occorrenze | {pattern.suggested_action}
                          </p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handlePatternAction(pattern.id, 'approve')}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            Approva
                          </button>
                          <button
                            onClick={() => handlePatternAction(pattern.id, 'reject')}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
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
        {activeTab === 'report' && latestReport && (
          <div className="space-y-6">
            {/* Report Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Report Settimana {latestReport.week_start} - {latestReport.week_end}
                  </h2>
                  <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                    latestReport.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {latestReport.status === 'pending' ? 'Da Revisionare' : 'Revisionato'}
                  </span>
                </div>
                {latestReport.status === 'pending' && (
                  <button
                    onClick={() => handleReportReview(latestReport.id)}
                    className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
                  >
                    Segna come Revisionato
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Conversazioni</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {latestReport.report_content.summary.total_conversations}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Rating Medio</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {latestReport.report_content.summary.avg_rating.toFixed(2)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Trend</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {latestReport.report_content.summary.trend_vs_last_week}
                  </p>
                </div>
              </div>

              {latestReport.report_content.summary.highlight && (
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    {latestReport.report_content.summary.highlight}
                  </p>
                </div>
              )}
            </div>

            {/* Top Issues */}
            {latestReport.report_content.top_issues.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Top Issues
                </h3>
                <ul className="space-y-3">
                  {latestReport.report_content.top_issues.map((issue, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-800 text-sm flex items-center justify-center">
                        {issue.count}
                      </span>
                      <div className="ml-3">
                        <p className="text-sm text-gray-900 dark:text-white">{issue.description}</p>
                        {issue.suggested_fix && (
                          <p className="text-xs text-gray-500 mt-1">Fix suggerito: {issue.suggested_fix}</p>
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
                  Modifiche Prompt Suggerite
                </h3>
                <ul className="space-y-3">
                  {latestReport.report_content.suggested_prompt_changes.map((suggestion, idx) => (
                    <li key={idx} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <p className="text-sm text-gray-900 dark:text-white">{suggestion.change}</p>
                      <p className="text-xs text-gray-500 mt-1">{suggestion.reason}</p>
                    </li>
                  ))}
                </ul>
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
}: {
  title: string;
  value: string | number;
  subtitle: string;
  highlight?: boolean;
}) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${
      highlight ? 'ring-2 ring-amber-500' : ''
    }`}>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
    </div>
  );
}
