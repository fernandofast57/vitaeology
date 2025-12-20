'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

interface CostData {
  today: { usd: number; eur: number };
  week: { usd: number; eur: number };
  month: { usd: number; eur: number };
  projection: { usd: number; eur: number };
  avgPerConversation: { usd: number; eur: number };
  tokens: { input: number; output: number; total: number };
  conversations: { thisMonth: number; today: number };
  modelUsage: Record<string, number>;
  trend: Array<{
    date: string;
    cost_usd: number;
    cost_eur: number;
    conversations: number;
    input_tokens: number;
    output_tokens: number;
  }>;
  alert: boolean;
}

export default function ApiCostsPage() {
  const router = useRouter();
  const [data, setData] = useState<CostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/admin/api-costs');
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
          <p className="text-gray-600">Caricamento dati costi...</p>
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

  const formatEur = (value: number) => `€${value.toFixed(2)}`;
  const formatTokens = (value: number) => value.toLocaleString('it-IT');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0A2540]">
                Dashboard Costi API
              </h1>
              <p className="text-gray-500 mt-1">
                Monitoraggio spese Claude API per Fernando AI Coach
              </p>
            </div>
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

        {/* Alert se proiezione > €500 */}
        {data.alert && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <span className="text-red-700 font-medium">
              Attenzione: proiezione mensile superiore a €500
            </span>
          </div>
        )}

        {/* Cards metriche principali */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Oggi"
            value={formatEur(data.today.eur)}
            subtitle={`$${data.today.usd.toFixed(4)}`}
          />
          <MetricCard
            title="Questa settimana"
            value={formatEur(data.week.eur)}
            subtitle={`$${data.week.usd.toFixed(4)}`}
          />
          <MetricCard
            title="Questo mese"
            value={formatEur(data.month.eur)}
            subtitle={`$${data.month.usd.toFixed(4)}`}
          />
          <MetricCard
            title="Proiezione mese"
            value={formatEur(data.projection.eur)}
            subtitle={`$${data.projection.usd.toFixed(2)}`}
            highlight={data.alert}
          />
        </div>

        {/* Cards secondarie */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500 mb-1">Costo medio per conversazione</div>
            <div className="text-xl font-bold text-[#0A2540]">
              {formatEur(data.avgPerConversation.eur)}
            </div>
            <div className="text-xs text-gray-400">
              {data.conversations.thisMonth} conversazioni questo mese
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500 mb-1">Token totali (mese)</div>
            <div className="text-xl font-bold text-[#0A2540]">
              {formatTokens(data.tokens.total)}
            </div>
            <div className="text-xs text-gray-400">
              Input: {formatTokens(data.tokens.input)} | Output: {formatTokens(data.tokens.output)}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500 mb-1">Conversazioni oggi</div>
            <div className="text-xl font-bold text-[#0A2540]">
              {data.conversations.today}
            </div>
            <div className="text-xs text-gray-400">
              Costo: {formatEur(data.today.eur)}
            </div>
          </div>
        </div>

        {/* Grafico trend */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
          <h2 className="text-lg font-semibold text-[#0A2540] mb-4">
            Trend costi ultimi 30 giorni
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.trend}>
              <defs>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0A2540" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0A2540" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => value.slice(5)} // MM-DD
                fontSize={12}
                stroke="#9CA3AF"
              />
              <YAxis
                tickFormatter={(value) => `€${value.toFixed(2)}`}
                fontSize={12}
                stroke="#9CA3AF"
              />
              <Tooltip
                formatter={(value: number) => [`€${value.toFixed(4)}`, 'Costo']}
                labelFormatter={(label) => `Data: ${label}`}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="cost_eur"
                stroke="#0A2540"
                strokeWidth={2}
                fill="url(#colorCost)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Grafico conversazioni */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
          <h2 className="text-lg font-semibold text-[#0A2540] mb-4">
            Conversazioni per giorno
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => value.slice(5)}
                fontSize={12}
                stroke="#9CA3AF"
              />
              <YAxis fontSize={12} stroke="#9CA3AF" />
              <Tooltip
                formatter={(value: number) => [value, 'Conversazioni']}
                labelFormatter={(label) => `Data: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="conversations"
                stroke="#F4B942"
                strokeWidth={2}
                dot={{ fill: '#F4B942', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Modelli usati */}
        {Object.keys(data.modelUsage).length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-[#0A2540] mb-4">
              Modelli usati (ultimi 30 giorni)
            </h2>
            <div className="space-y-2">
              {Object.entries(data.modelUsage).map(([model, count]) => (
                <div key={model} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-gray-700 font-mono text-sm">{model}</span>
                  <span className="text-[#0A2540] font-semibold">{count} chiamate</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info pricing */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600 mt-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
            <div>
              <p className="text-sm text-blue-900 font-medium">Pricing Claude Sonnet 4</p>
              <p className="text-sm text-blue-700">
                Input: $3.00 / 1M tokens | Output: $15.00 / 1M tokens
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Tasso di cambio: 1 USD = 0.92 EUR (fisso)
              </p>
            </div>
          </div>
        </div>
      </div>
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
  value: string;
  subtitle?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`p-4 rounded-lg border ${highlight ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
      <div className="text-sm text-gray-500">{title}</div>
      <div className={`text-2xl font-bold ${highlight ? 'text-red-600' : 'text-[#0A2540]'}`}>
        {value}
      </div>
      {subtitle && (
        <div className="text-xs text-gray-400 mt-1">{subtitle}</div>
      )}
    </div>
  );
}
