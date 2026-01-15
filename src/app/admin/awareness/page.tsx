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
  PieChart,
  Pie,
} from 'recharts';
import Breadcrumb from '@/components/ui/Breadcrumb';

interface AwarenessData {
  summary: {
    totalUsers: number;
    avgLevel: number;
    avgLevelName: string;
    challengeCompletedCount: number;
    aboveZeroCount: number;
    lastUpdated: string;
  };
  distribution: Array<{
    level: number;
    levelName: string;
    zone: string;
    zoneName: string;
    count: number;
  }>;
  zoneDistribution: Array<{
    zone: string;
    name: string;
    minLevel: number;
    maxLevel: number;
    description: string;
    vitaeologyPhase: string;
    count: number;
  }>;
  progressTrend: Array<{
    date: string;
    calculations: number;
    levelChanges: number;
  }>;
  topTriggers: Array<{
    trigger: string;
    count: number;
  }>;
  topUsers: Array<{
    userId: string;
    email: string;
    level: number;
    levelName: string;
    score: number;
    calculatedAt: string;
  }>;
}

// Colori per zone
const ZONE_COLORS: Record<string, string> = {
  sotto_necessita: '#EF4444', // Red
  transizione: '#F59E0B',     // Amber
  riconoscimento: '#3B82F6',  // Blue
  trasformazione: '#8B5CF6',  // Purple
  padronanza: '#10B981',      // Green
};

// Nomi trigger leggibili
const TRIGGER_NAMES: Record<string, string> = {
  challenge_day_completed: 'Giorno Challenge',
  challenge_completed: 'Challenge Completata',
  assessment_completed: 'Assessment',
  first_ai_conversation: 'Prima AI Chat',
  ai_conversation_rated: 'Rating AI Chat',
  exercise_completed: 'Esercizio',
  subscription_changed: 'Subscription',
  manual_recalculate: 'Manuale',
  scheduled_update: 'Schedulato',
};

export default function AwarenessPage() {
  const router = useRouter();
  const [data, setData] = useState<AwarenessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/admin/awareness');
        if (response.status === 401) {
          router.push('/auth/login');
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
          <p className="text-gray-600">Caricamento awareness...</p>
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

  // Prepara dati per pie chart zone
  const pieData = data.zoneDistribution.filter(z => z.count > 0).map(z => ({
    name: z.name,
    value: z.count,
    zone: z.zone,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto">
        <Breadcrumb
          items={[
            { label: 'Admin', href: '/admin' },
            { label: 'Awareness Levels' },
          ]}
        />

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#0A2540]">
            Livelli di Consapevolezza
          </h1>
          <span className="text-sm text-gray-500">
            Ultimo aggiornamento: {new Date(data.summary.lastUpdated).toLocaleString('it-IT')}
          </span>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">Utenti Totali</p>
            <p className="text-2xl font-bold text-[#0A2540]">{data.summary.totalUsers}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">Livello Medio</p>
            <p className="text-2xl font-bold text-[#0A2540]">{data.summary.avgLevel}</p>
            <p className="text-xs text-gray-400">{data.summary.avgLevelName}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">Post-Challenge (livello -1+)</p>
            <p className="text-2xl font-bold text-amber-600">{data.summary.challengeCompletedCount}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">Sopra Zero (livello 1+)</p>
            <p className="text-2xl font-bold text-green-600">{data.summary.aboveZeroCount}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Zone Distribution Pie */}
          <div className="bg-white rounded-lg border p-4">
            <h2 className="text-lg font-semibold text-[#0A2540] mb-4">Distribuzione per Zona</h2>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={ZONE_COLORS[entry.zone] || '#666'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">Nessun dato disponibile</p>
            )}
          </div>

          {/* Zone Details */}
          <div className="bg-white rounded-lg border p-4">
            <h2 className="text-lg font-semibold text-[#0A2540] mb-4">Dettaglio Zone</h2>
            <div className="space-y-3">
              {data.zoneDistribution.map((zone) => (
                <div key={zone.zone} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: ZONE_COLORS[zone.zone] }}
                    />
                    <div>
                      <p className="font-medium text-[#0A2540]">{zone.name}</p>
                      <p className="text-xs text-gray-500">
                        Livelli {zone.minLevel} a {zone.maxLevel} | {zone.vitaeologyPhase}
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-[#0A2540]">{zone.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Trend */}
        <div className="bg-white rounded-lg border p-4 mb-8">
          <h2 className="text-lg font-semibold text-[#0A2540] mb-4">
            Progressione Ultimi 7 Giorni
          </h2>
          {data.progressTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.progressTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(d) => new Date(d).toLocaleDateString('it-IT')}
                />
                <Line
                  type="monotone"
                  dataKey="calculations"
                  stroke="#3B82F6"
                  name="Ricalcoli"
                />
                <Line
                  type="monotone"
                  dataKey="levelChanges"
                  stroke="#10B981"
                  name="Cambi Livello"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">Nessun dato negli ultimi 7 giorni</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Triggers */}
          <div className="bg-white rounded-lg border p-4">
            <h2 className="text-lg font-semibold text-[#0A2540] mb-4">Trigger Eventi</h2>
            {data.topTriggers.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.topTriggers} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis
                    type="category"
                    dataKey="trigger"
                    width={120}
                    tickFormatter={(t) => TRIGGER_NAMES[t] || t}
                  />
                  <Tooltip
                    labelFormatter={(t) => TRIGGER_NAMES[t as string] || t}
                  />
                  <Bar dataKey="count" fill="#0A2540" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">Nessun trigger registrato</p>
            )}
          </div>

          {/* Level Distribution Bar */}
          <div className="bg-white rounded-lg border p-4">
            <h2 className="text-lg font-semibold text-[#0A2540] mb-4">Distribuzione Livelli</h2>
            {data.distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.distribution.slice(0, 15)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="level"
                    tickFormatter={(l) => l.toString()}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(l) => `Livello ${l}`}
                    formatter={(value, name, props) => [value, props.payload.levelName]}
                  />
                  <Bar dataKey="count">
                    {data.distribution.slice(0, 15).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={ZONE_COLORS[entry.zone] || '#666'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">Nessun dato disponibile</p>
            )}
          </div>
        </div>

        {/* Top Users Table */}
        <div className="bg-white rounded-lg border p-4">
          <h2 className="text-lg font-semibold text-[#0A2540] mb-4">
            Utenti con Livello Alto (3+)
          </h2>
          {data.topUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Email</th>
                    <th className="text-center py-2 px-3 text-sm font-medium text-gray-600">Livello</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Nome Livello</th>
                    <th className="text-center py-2 px-3 text-sm font-medium text-gray-600">Score</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Calcolato</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topUsers.map((user) => (
                    <tr key={user.userId} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3 text-sm">{user.email}</td>
                      <td className="py-2 px-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold">
                          {user.level}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-sm font-medium text-[#0A2540]">{user.levelName}</td>
                      <td className="py-2 px-3 text-center text-sm">{Math.round(user.score)}</td>
                      <td className="py-2 px-3 text-sm text-gray-500">
                        {user.calculatedAt
                          ? new Date(user.calculatedAt).toLocaleDateString('it-IT')
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Nessun utente con livello 3+</p>
          )}
        </div>

        {/* Scala Reference */}
        <div className="bg-white rounded-lg border p-4 mt-8">
          <h2 className="text-lg font-semibold text-[#0A2540] mb-4">
            Riferimento Scala di Consapevolezza
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-red-600 mb-2">Entry Point: -7 Rovina</h3>
              <p className="text-gray-600">Percezione di rovina nella propria efficacia (P1). La persona entra nella Challenge gratuita.</p>
            </div>
            <div>
              <h3 className="font-medium text-amber-600 mb-2">Transizione (-6 a -1)</h3>
              <p className="text-gray-600">Zona Challenge - da rovina ad aiuto</p>
            </div>
            <div>
              <h3 className="font-medium text-blue-600 mb-2">Riconoscimento (1 a 6)</h3>
              <p className="text-gray-600">Assessment + primi esercizi</p>
            </div>
            <div>
              <h3 className="font-medium text-purple-600 mb-2">Trasformazione (7 a 14)</h3>
              <p className="text-gray-600">Esercizi avanzati, pratica attiva</p>
            </div>
            <div>
              <h3 className="font-medium text-green-600 mb-2">Padronanza (15 a 21)</h3>
              <p className="text-gray-600">Mentor/Mastermind, leadership autentica</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
