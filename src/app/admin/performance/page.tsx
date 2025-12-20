'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface PerformanceData {
  today: { avg: number; count: number };
  week: { avg: number; count: number };
  month: { avg: number; count: number };
  percentiles: { p50: number; p90: number; p99: number };
  distribution: Array<{ label: string; count: number; color: string }>;
  dailyTrend: Array<{ date: string; avg: number; count: number }>;
  alert: boolean;
}

export default function PerformancePage() {
  const router = useRouter();
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/admin/performance');
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        if (response.status === 403) {
          setError('Accesso non autorizzato. Solo admin.');
          return;
        }
        if (!response.ok) {
          throw new Error('Errore caricamento dati');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#0A2540] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Caricamento dati performance...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-lg mx-auto bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const formatMs = (ms: number) => {
    if (ms === 0) return '0ms';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getColorClass = (ms: number) => {
    if (ms === 0) return 'text-gray-400';
    if (ms < 3000) return 'text-green-600';
    if (ms < 5000) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBgColorClass = (ms: number) => {
    if (ms === 0) return 'bg-gray-100';
    if (ms < 3000) return 'bg-green-50 border-green-200';
    if (ms < 5000) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const barColors: Record<string, string> = {
    green: '#22C55E',
    yellow: '#EAB308',
    red: '#EF4444',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#0A2540]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <div>
                <h1 className="text-2xl font-bold text-[#0A2540]">
                  Performance Tempi Risposta
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Monitoraggio tempi di risposta Fernando AI Coach
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <a
                href="/admin/api-costs"
                className="text-sm text-gray-600 hover:text-[#0A2540] flex items-center gap-1"
              >
                Costi API
              </a>
              <a
                href="/admin/ai-coach"
                className="text-sm text-[#0A2540] hover:underline flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Dashboard AI Coach
              </a>
            </div>
          </div>
        </div>

        {/* Alert se P90 > 5 secondi */}
        {data.alert && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <span className="text-red-700 font-medium">
              Attenzione: P90 superiore a 5 secondi - ottimizzazione necessaria
            </span>
          </div>
        )}

        {/* Cards medie tempi */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className={`p-4 rounded-lg border ${getBgColorClass(data.today.avg)}`}>
            <div className="text-sm text-gray-500">Media oggi</div>
            <div className={`text-2xl font-bold ${getColorClass(data.today.avg)}`}>
              {formatMs(data.today.avg)}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {data.today.count} risposte
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${getBgColorClass(data.week.avg)}`}>
            <div className="text-sm text-gray-500">Media settimana</div>
            <div className={`text-2xl font-bold ${getColorClass(data.week.avg)}`}>
              {formatMs(data.week.avg)}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {data.week.count} risposte
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${getBgColorClass(data.month.avg)}`}>
            <div className="text-sm text-gray-500">Media mese</div>
            <div className={`text-2xl font-bold ${getColorClass(data.month.avg)}`}>
              {formatMs(data.month.avg)}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {data.month.count} risposte
            </div>
          </div>
        </div>

        {/* Percentili */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
          <h2 className="text-lg font-semibold text-[#0A2540] mb-4">Percentili</h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-500">P50 (mediana)</div>
              <div className={`text-xl font-bold ${getColorClass(data.percentiles.p50)}`}>
                {formatMs(data.percentiles.p50)}
              </div>
              <div className="text-xs text-gray-400">
                50% delle risposte
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">P90</div>
              <div className={`text-xl font-bold ${getColorClass(data.percentiles.p90)}`}>
                {formatMs(data.percentiles.p90)}
              </div>
              <div className="text-xs text-gray-400">
                90% delle risposte
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">P99</div>
              <div className={`text-xl font-bold ${getColorClass(data.percentiles.p99)}`}>
                {formatMs(data.percentiles.p99)}
              </div>
              <div className="text-xs text-gray-400">
                99% delle risposte
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4 border-t pt-3">
            Target: P90 &lt; 5 secondi per garantire UX ottimale
          </p>
        </div>

        {/* Trend giornaliero */}
        {data.dailyTrend.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
            <h2 className="text-lg font-semibold text-[#0A2540] mb-4">
              Trend tempi medi (ultimi 30 giorni)
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => value.slice(5)}
                  fontSize={12}
                  stroke="#9CA3AF"
                />
                <YAxis
                  tickFormatter={(value) => `${(value / 1000).toFixed(1)}s`}
                  fontSize={12}
                  stroke="#9CA3AF"
                />
                <Tooltip
                  formatter={(value: number) => [`${(value / 1000).toFixed(2)}s`, 'Media']}
                  labelFormatter={(label) => `Data: ${label}`}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
                {/* Linea target 3 secondi */}
                <Line
                  type="monotone"
                  dataKey={() => 3000}
                  stroke="#22C55E"
                  strokeDasharray="5 5"
                  strokeWidth={1}
                  dot={false}
                  name="Target (3s)"
                />
                {/* Linea dati */}
                <Line
                  type="monotone"
                  dataKey="avg"
                  stroke="#0A2540"
                  strokeWidth={2}
                  dot={{ fill: '#0A2540', strokeWidth: 0, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-4 h-0.5 bg-[#0A2540]"></span> Tempo medio
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-0.5 bg-green-500 border-dashed"></span> Target (3s)
              </span>
            </div>
          </div>
        )}

        {/* Histogram distribuzione */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-[#0A2540] mb-4">
            Distribuzione Tempi (ultimo mese)
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.distribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="label" fontSize={12} stroke="#9CA3AF" />
              <YAxis fontSize={12} stroke="#9CA3AF" />
              <Tooltip
                formatter={(value: number) => [value, 'Risposte']}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" name="Risposte" radius={[4, 4, 0, 0]}>
                {data.distribution.map((entry, index) => (
                  <Cell key={index} fill={barColors[entry.color]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-500 rounded"></span> Ottimo (&lt;3s)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-yellow-500 rounded"></span> Accettabile (3-5s)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-red-500 rounded"></span> Da ottimizzare (&gt;5s)
            </span>
          </div>
        </div>

        {/* Info target */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600 mt-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
            <div>
              <p className="text-sm text-blue-900 font-medium">Target Performance</p>
              <ul className="text-sm text-blue-700 mt-1 space-y-1">
                <li>• <span className="text-green-600 font-medium">&lt;3 secondi</span>: UX ottimale</li>
                <li>• <span className="text-yellow-600 font-medium">3-5 secondi</span>: accettabile con messaggi dinamici</li>
                <li>• <span className="text-red-600 font-medium">&gt;5 secondi</span>: richiede ottimizzazione</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
