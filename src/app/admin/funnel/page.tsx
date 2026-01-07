'use client';

import { useEffect, useState } from 'react';

interface FunnelData {
  challenge_type: string;
  total_subscribers: number;
  day_completions: number[];
  assessment_completions: number;
  feedback_distribution: Record<string, number>;
}

const CHALLENGE_COLORS: Record<string, string> = {
  leadership: 'bg-amber-500',
  ostacoli: 'bg-emerald-500',
  microfelicita: 'bg-violet-500'
};

const CHALLENGE_NAMES: Record<string, string> = {
  leadership: 'Leadership Autentica',
  ostacoli: 'Oltre gli Ostacoli',
  microfelicita: 'Microfelicità'
};

const FEEDBACK_LABELS: Record<string, string> = {
  assessment: '📊 Assessment',
  exercises: '🎯 Esercizi',
  coach: '🤖 AI Coach',
  book: '📖 Libro',
  time: '⏳ Tempo'
};

export default function FunnelAnalysisPage() {
  const [data, setData] = useState<FunnelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/funnel-analysis')
      .then(res => {
        if (!res.ok) throw new Error('Errore caricamento dati');
        return res.json();
      })
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  // Calcola totali
  const totals = {
    subscribers: data.reduce((sum, f) => sum + f.total_subscribers, 0),
    day7: data.reduce((sum, f) => sum + (f.day_completions[6] || 0), 0),
    assessments: data.reduce((sum, f) => sum + f.assessment_completions, 0)
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Funnel Analysis</h1>
        <span className="text-sm text-gray-500">
          Conversione Challenge → Assessment
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-500">Totale Iscritti</div>
          <div className="text-3xl font-bold text-gray-900">{totals.subscribers}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-500">Completano Day 7</div>
          <div className="text-3xl font-bold text-emerald-600">{totals.day7}</div>
          <div className="text-sm text-gray-500">
            {totals.subscribers > 0 ? Math.round((totals.day7 / totals.subscribers) * 100) : 0}% retention
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-500">Assessment Completati</div>
          <div className="text-3xl font-bold text-blue-600">{totals.assessments}</div>
          <div className="text-sm text-gray-500">
            {totals.day7 > 0 ? Math.round((totals.assessments / totals.day7) * 100) : 0}% conversione
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-500">Conversione Totale</div>
          <div className="text-3xl font-bold text-violet-600">
            {totals.subscribers > 0 ? Math.round((totals.assessments / totals.subscribers) * 100) : 0}%
          </div>
          <div className="text-sm text-gray-500">iscrizione → assessment</div>
        </div>
      </div>

      {/* Funnel per Challenge */}
      {data.map(funnel => (
        <div key={funnel.challenge_type} className="bg-white rounded-xl border overflow-hidden">
          <div className={`${CHALLENGE_COLORS[funnel.challenge_type]} px-6 py-4`}>
            <h2 className="text-xl font-bold text-white">
              {CHALLENGE_NAMES[funnel.challenge_type]}
            </h2>
            <p className="text-white/80 text-sm">
              {funnel.total_subscribers} iscritti totali
            </p>
          </div>

          <div className="p-6 space-y-4">
            {/* Progress bars per giorno */}
            <div className="space-y-2">
              {funnel.day_completions.map((count, i) => {
                const percentage = funnel.total_subscribers > 0
                  ? Math.round((count / funnel.total_subscribers) * 100)
                  : 0;
                const dropoff = i > 0 && funnel.day_completions[i - 1] > 0
                  ? Math.round(((funnel.day_completions[i - 1] - count) / funnel.day_completions[i - 1]) * 100)
                  : 0;

                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-16 text-sm font-medium text-gray-600">Day {i + 1}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                      <div
                        className={`${CHALLENGE_COLORS[funnel.challenge_type]} h-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-24 text-sm text-right text-gray-700">
                      {count} <span className="text-gray-400">({percentage}%)</span>
                    </span>
                    {dropoff > 0 && (
                      <span className="w-16 text-xs text-red-500">-{dropoff}%</span>
                    )}
                  </div>
                );
              })}

              {/* Assessment bar */}
              <div className="flex items-center gap-3 pt-3 border-t mt-3">
                <span className="w-16 text-sm font-medium text-gray-600">📊 Test</span>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all duration-500"
                    style={{
                      width: `${funnel.total_subscribers > 0
                        ? Math.round((funnel.assessment_completions / funnel.total_subscribers) * 100)
                        : 0}%`
                    }}
                  />
                </div>
                <span className="w-24 text-sm text-right text-gray-700">
                  {funnel.assessment_completions}
                  <span className="text-gray-400">
                    ({funnel.total_subscribers > 0
                      ? Math.round((funnel.assessment_completions / funnel.total_subscribers) * 100)
                      : 0}%)
                  </span>
                </span>
                <span className="w-16"></span>
              </div>
            </div>

            {/* Feedback distribution */}
            {Object.keys(funnel.feedback_distribution).length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Feedback Post-Challenge
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(funnel.feedback_distribution).map(([action, count]) => (
                    <div
                      key={action}
                      className="bg-gray-50 rounded-lg p-3 text-center"
                    >
                      <div className="text-lg font-bold text-gray-900">{count as number}</div>
                      <div className="text-xs text-gray-500">
                        {FEEDBACK_LABELS[action] || action}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
