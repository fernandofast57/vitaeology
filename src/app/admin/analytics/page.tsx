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
} from 'recharts';

interface AnalyticsData {
  totalConversations: number;
  avgMessagesPerConversation: number;
  abandonmentRate: number;
  dau: number;
  wau: number;
  mau: number;
  hourlyDistribution: Array<{ hour: number; label: string; count: number }>;
  topUsers: Array<{
    userId: string;
    email: string;
    name: string | null;
    messageCount: number;
  }>;
  dailyActiveUsers: Array<{ date: string; count: number }>;
  conversationsTrend: Array<{ date: string; count: number }>;
  totalMessages: number;
  sessionsThisMonth: number;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/admin/analytics');
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
          <p className="text-gray-600">Caricamento analytics...</p>
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

  const getAbandonmentColor = (rate: number) => {
    if (rate < 20) return 'text-green-600';
    if (rate < 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAbandonmentBg = (rate: number) => {
    if (rate < 20) return 'bg-green-50 border-green-200';
    if (rate < 40) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#0A2540]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
              <div>
                <h1 className="text-2xl font-bold text-[#0A2540]">
                  Analytics Conversazioni
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Metriche di utilizzo Fernando AI Coach
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <a
                href="/admin/performance"
                className="text-sm text-gray-600 hover:text-[#0A2540] flex items-center gap-1"
              >
                Performance
              </a>
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

        {/* Cards utenti attivi */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-blue-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              <span className="text-sm text-gray-500">DAU (oggi)</span>
            </div>
            <div className="text-3xl font-bold text-[#0A2540]">{data.dau}</div>
            <div className="text-xs text-gray-400 mt-1">utenti attivi oggi</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-green-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
              <span className="text-sm text-gray-500">WAU (settimana)</span>
            </div>
            <div className="text-3xl font-bold text-[#0A2540]">{data.wau}</div>
            <div className="text-xs text-gray-400 mt-1">utenti attivi questa settimana</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-purple-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
              <span className="text-sm text-gray-500">MAU (mese)</span>
            </div>
            <div className="text-3xl font-bold text-[#0A2540]">{data.mau}</div>
            <div className="text-xs text-gray-400 mt-1">utenti attivi questo mese</div>
          </div>
        </div>

        {/* Cards metriche conversazioni */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500 mb-1">Conversazioni (mese)</div>
            <div className="text-2xl font-bold text-[#0A2540]">
              {data.totalConversations}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {data.totalMessages} messaggi totali
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500 mb-1">Media messaggi/conv</div>
            <div className="text-2xl font-bold text-[#0A2540]">
              {data.avgMessagesPerConversation}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              scambi per sessione
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${getAbandonmentBg(data.abandonmentRate)}`}>
            <div className="text-sm text-gray-500 mb-1">Tasso abbandono</div>
            <div className={`text-2xl font-bold ${getAbandonmentColor(data.abandonmentRate)}`}>
              {data.abandonmentRate}%
            </div>
            <div className="text-xs text-gray-400 mt-1">
              sessioni con 1 solo messaggio
            </div>
          </div>
        </div>

        {/* Trend DAU */}
        {data.dailyActiveUsers.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
            <h2 className="text-lg font-semibold text-[#0A2540] mb-4">
              Utenti attivi giornalieri (ultimi 30 giorni)
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.dailyActiveUsers}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => value.slice(5)}
                  fontSize={12}
                  stroke="#9CA3AF"
                />
                <YAxis fontSize={12} stroke="#9CA3AF" />
                <Tooltip
                  formatter={(value: number) => [value, 'Utenti']}
                  labelFormatter={(label) => `Data: ${label}`}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#0A2540"
                  strokeWidth={2}
                  dot={{ fill: '#0A2540', strokeWidth: 0, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Trend conversazioni */}
        {data.conversationsTrend.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
            <h2 className="text-lg font-semibold text-[#0A2540] mb-4">
              Messaggi per giorno (ultimi 30 giorni)
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.conversationsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => value.slice(5)}
                  fontSize={12}
                  stroke="#9CA3AF"
                />
                <YAxis fontSize={12} stroke="#9CA3AF" />
                <Tooltip
                  formatter={(value: number) => [value, 'Messaggi']}
                  labelFormatter={(label) => `Data: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#F4B942"
                  strokeWidth={2}
                  dot={{ fill: '#F4B942', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Distribuzione oraria */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
          <h2 className="text-lg font-semibold text-[#0A2540] mb-4">
            Distribuzione oraria (ultimi 30 giorni)
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.hourlyDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="label"
                fontSize={10}
                stroke="#9CA3AF"
                interval={2}
              />
              <YAxis fontSize={12} stroke="#9CA3AF" />
              <Tooltip
                formatter={(value: number) => [value, 'Messaggi']}
                labelFormatter={(label) => `Ora: ${label}`}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Bar
                dataKey="count"
                fill="#0A2540"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Orario di maggior utilizzo evidenziato
          </p>
        </div>

        {/* Top Users */}
        {data.topUsers.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-[#0A2540] mb-4">
              Top 10 Utenti (ultimi 30 giorni)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">#</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Utente</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">Messaggi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topUsers.map((user, index) => (
                    <tr key={user.userId} className="border-b border-gray-100 last:border-0">
                      <td className="py-3 px-3 text-sm text-gray-400">{index + 1}</td>
                      <td className="py-3 px-3">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || 'Nome non disponibile'}
                        </div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-[#0A2540] text-white">
                          {user.messageCount}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Info target */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600 mt-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
            <div>
              <p className="text-sm text-blue-900 font-medium">Metriche Chiave</p>
              <ul className="text-sm text-blue-700 mt-1 space-y-1">
                <li>• <span className="font-medium">DAU/WAU/MAU</span>: Daily/Weekly/Monthly Active Users</li>
                <li>• <span className="font-medium">Tasso abbandono</span>: % sessioni terminate dopo 1 solo messaggio (target &lt;20%)</li>
                <li>• <span className="font-medium">Media messaggi</span>: scambi medi per sessione (target &gt;3)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
