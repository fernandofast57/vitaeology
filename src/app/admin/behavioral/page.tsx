'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface Overview {
  totalSessions: number;
  totalEvents: number;
  uniqueVisitors: number;
  returnVisitors: number;
  avgEngagementScore: number;
  avgTimeOnPage: number;
  avgScrollDepth: number;
}

interface ChallengeMetrics {
  challenge_type: string;
  sessions: number;
  events: number;
  avg_engagement: number;
  avg_scroll: number;
  avg_time: number;
  exit_intent_rate: number;
  conversion_rate: number;
}

interface VariantMetrics {
  challenge_type: string;
  variant: string;
  sessions: number;
  avg_engagement: number;
  exit_intent_triggered: number;
  exit_intent_converted: number;
  conversion_rate: number;
}

interface EventBreakdown {
  event_type: string;
  count: number;
  percentage: number;
}

interface DeviceBreakdown {
  device_type: string;
  sessions: number;
  percentage: number;
}

interface TimelineData {
  date: string;
  sessions: number;
  events: number;
  conversions: number;
}

interface ReferrerData {
  referrer: string;
  sessions: number;
  conversions: number;
}

interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
}

interface BehavioralMetrics {
  overview: Overview;
  byChallenge: ChallengeMetrics[];
  byVariant: VariantMetrics[];
  eventBreakdown: EventBreakdown[];
  deviceBreakdown: DeviceBreakdown[];
  timelineData: TimelineData[];
  topReferrers: ReferrerData[];
  engagementFunnel: FunnelStage[];
}

const challengeNames: Record<string, string> = {
  leadership: 'Leadership Autentica',
  ostacoli: 'Oltre gli Ostacoli',
  microfelicita: 'Microfelicità',
};

const challengeColors: Record<string, { bg: string; text: string; border: string }> = {
  leadership: { bg: 'bg-amber-900/20', text: 'text-amber-400', border: 'border-amber-500/50' },
  ostacoli: { bg: 'bg-emerald-900/20', text: 'text-emerald-400', border: 'border-emerald-500/50' },
  microfelicita: { bg: 'bg-violet-900/20', text: 'text-violet-400', border: 'border-violet-500/50' },
};

const eventLabels: Record<string, string> = {
  page_view: 'Page View',
  scroll_25: 'Scroll 25%',
  scroll_50: 'Scroll 50%',
  scroll_75: 'Scroll 75%',
  scroll_100: 'Scroll 100%',
  exit_intent_triggered: 'Exit Intent',
  exit_intent_dismissed: 'Exit Dismissed',
  exit_intent_converted: 'Exit Converted',
  engagement_high: 'High Engagement',
  engagement_very_high: 'Very High Engagement',
  return_visitor_identified: 'Return Visitor',
  return_visitor_banner_shown: 'Banner Shown',
  return_visitor_banner_clicked: 'Banner Clicked',
  form_focus: 'Form Focus',
  form_abandon: 'Form Abandon',
  badge_shown: 'Badge Shown',
  time_milestone_30s: '30s on Page',
  time_milestone_60s: '60s on Page',
  time_milestone_120s: '120s on Page',
};

export default function BehavioralAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<BehavioralMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/behavioral-analytics');
      if (!response.ok) {
        throw new Error('Errore nel caricamento dati');
      }
      const data = await response.json();
      setMetrics(data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh ogni 30 secondi
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-white">Caricamento analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const { overview, byChallenge, byVariant, eventBreakdown, deviceBreakdown, timelineData, topReferrers, engagementFunnel } = metrics;

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Behavioral Analytics</h1>
            <p className="text-slate-400 mt-1">
              Tracciamento comportamentale landing pages
            </p>
            {lastUpdate && (
              <p className="text-slate-500 text-sm mt-1">
                Ultimo aggiornamento: {lastUpdate.toLocaleTimeString('it-IT')}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchData}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition"
            >
              Aggiorna
            </button>
            <Link
              href="/admin/ab-testing"
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition"
            >
              A/B Testing
            </Link>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <OverviewCard label="Sessioni" value={overview.totalSessions} />
          <OverviewCard label="Eventi" value={overview.totalEvents} />
          <OverviewCard label="Visitatori" value={overview.uniqueVisitors} />
          <OverviewCard label="Ritorno" value={overview.returnVisitors} suffix=" utenti" />
          <OverviewCard label="Engagement" value={overview.avgEngagementScore} suffix="%" highlight />
          <OverviewCard label="Tempo medio" value={overview.avgTimeOnPage} suffix="s" />
          <OverviewCard label="Scroll medio" value={overview.avgScrollDepth} suffix="%" />
        </div>

        {/* Challenge Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {byChallenge.length > 0 ? byChallenge.map((challenge) => {
            const colors = challengeColors[challenge.challenge_type] || challengeColors.leadership;
            return (
              <div
                key={challenge.challenge_type}
                className={`p-6 rounded-xl border-2 ${colors.bg} ${colors.border}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-slate-400 text-sm">
                      {challengeNames[challenge.challenge_type] || challenge.challenge_type}
                    </p>
                    <h3 className={`text-2xl font-bold ${colors.text}`}>
                      {challenge.sessions} sessioni
                    </h3>
                  </div>
                  <span className={`text-3xl font-bold ${colors.text}`}>
                    {challenge.avg_engagement}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Scroll medio</p>
                    <p className="text-white font-semibold">{challenge.avg_scroll}%</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Tempo medio</p>
                    <p className="text-white font-semibold">{challenge.avg_time}s</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Exit Intent</p>
                    <p className="text-white font-semibold">{challenge.exit_intent_rate}%</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Conversion</p>
                    <p className="text-green-400 font-semibold">{challenge.conversion_rate}%</p>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="col-span-3 text-center py-12 text-slate-400 bg-slate-800 rounded-xl">
              Nessun dato disponibile. Attendi le prime visite alle landing pages.
            </div>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Variant Performance */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Performance per Variante</h2>
            {byVariant.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-slate-400 text-sm border-b border-slate-700">
                      <th className="pb-3">Challenge</th>
                      <th className="pb-3">Var</th>
                      <th className="pb-3 text-right">Sessioni</th>
                      <th className="pb-3 text-right">Eng.</th>
                      <th className="pb-3 text-right">Conv.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byVariant.map((row) => {
                      const colors = challengeColors[row.challenge_type] || challengeColors.leadership;
                      return (
                        <tr
                          key={`${row.challenge_type}-${row.variant}`}
                          className="border-b border-slate-700/50 text-white"
                        >
                          <td className="py-3 text-sm">
                            {challengeNames[row.challenge_type]?.split(' ')[0] || row.challenge_type}
                          </td>
                          <td className="py-3">
                            <span className={`inline-block w-7 h-7 rounded-full text-center leading-7 text-sm font-bold ${colors.bg} ${colors.text}`}>
                              {row.variant}
                            </span>
                          </td>
                          <td className="py-3 text-right">{row.sessions}</td>
                          <td className="py-3 text-right">{row.avg_engagement}%</td>
                          <td className="py-3 text-right">
                            <span className={`px-2 py-1 rounded text-sm ${
                              row.conversion_rate >= 10
                                ? 'bg-green-500/20 text-green-400'
                                : row.conversion_rate >= 5
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-slate-700 text-slate-400'
                            }`}>
                              {row.conversion_rate}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">Nessun dato variante</p>
            )}
          </div>

          {/* Engagement Funnel */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Funnel Engagement</h2>
            {engagementFunnel.length > 0 ? (
              <div className="space-y-3">
                {engagementFunnel.map((stage, index) => (
                  <div key={stage.stage}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{stage.stage}</span>
                      <span className="text-white font-semibold">{stage.count} ({stage.percentage}%)</span>
                    </div>
                    <div className="h-8 bg-slate-700 rounded-lg overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          index === 0
                            ? 'bg-blue-500'
                            : index === engagementFunnel.length - 1
                              ? 'bg-green-500'
                              : 'bg-amber-500'
                        }`}
                        style={{ width: `${stage.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">Nessun dato funnel</p>
            )}
          </div>
        </div>

        {/* Three Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Event Breakdown */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Eventi</h2>
            {eventBreakdown.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {eventBreakdown.map((event) => (
                  <div key={event.event_type} className="flex justify-between items-center py-2 border-b border-slate-700/50">
                    <span className="text-slate-300 text-sm">
                      {eventLabels[event.event_type] || event.event_type}
                    </span>
                    <div className="text-right">
                      <span className="text-white font-semibold">{event.count}</span>
                      <span className="text-slate-500 text-sm ml-2">({event.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">Nessun evento</p>
            )}
          </div>

          {/* Device Breakdown */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Dispositivi</h2>
            {deviceBreakdown.length > 0 ? (
              <div className="space-y-4">
                {deviceBreakdown.map((device) => (
                  <div key={device.device_type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300 capitalize">{device.device_type}</span>
                      <span className="text-white font-semibold">{device.sessions} ({device.percentage}%)</span>
                    </div>
                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          device.device_type === 'mobile'
                            ? 'bg-blue-500'
                            : device.device_type === 'tablet'
                              ? 'bg-purple-500'
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${device.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">Nessun dato dispositivo</p>
            )}
          </div>

          {/* Top Referrers */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Top Referrers</h2>
            {topReferrers.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {topReferrers.map((ref, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-slate-700/50">
                    <span className="text-slate-300 text-sm truncate max-w-[150px]" title={ref.referrer}>
                      {ref.referrer}
                    </span>
                    <div className="text-right">
                      <span className="text-white font-semibold">{ref.sessions}</span>
                      {ref.conversions > 0 && (
                        <span className="text-green-400 text-sm ml-2">+{ref.conversions}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">Nessun referrer</p>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-slate-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Ultimi 7 Giorni</h2>
          {timelineData.some(d => d.sessions > 0) ? (
            <div className="overflow-x-auto">
              <div className="flex gap-4 min-w-max">
                {timelineData.map((day) => (
                  <div key={day.date} className="flex-1 min-w-[100px] text-center">
                    <p className="text-slate-400 text-sm mb-2">
                      {new Date(day.date).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric' })}
                    </p>
                    <div className="h-32 bg-slate-700 rounded-lg relative overflow-hidden">
                      {day.sessions > 0 && (
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-500 to-amber-400 transition-all duration-500"
                          style={{
                            height: `${Math.min(100, (day.sessions / Math.max(...timelineData.map(d => d.sessions || 1))) * 100)}%`
                          }}
                        />
                      )}
                    </div>
                    <div className="mt-2">
                      <p className="text-white font-bold">{day.sessions}</p>
                      <p className="text-slate-500 text-xs">sessioni</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">Nessun dato timeline</p>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-4">
          <Link
            href="/admin/ab-testing"
            className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg transition"
          >
            A/B Testing Dashboard
          </Link>
          <Link
            href="/admin/ai-coach"
            className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg transition"
          >
            AI Coach Dashboard
          </Link>
          <Link
            href="/admin/users"
            className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg transition"
          >
            Users
          </Link>
        </div>
      </div>
    </div>
  );
}

function OverviewCard({
  label,
  value,
  suffix = '',
  highlight = false,
}: {
  label: string;
  value: number;
  suffix?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`p-4 rounded-xl ${highlight ? 'bg-amber-900/30 border border-amber-500/30' : 'bg-slate-800'}`}>
      <p className="text-slate-400 text-sm">{label}</p>
      <p className={`text-2xl font-bold ${highlight ? 'text-amber-400' : 'text-white'}`}>
        {value}{suffix}
      </p>
    </div>
  );
}
