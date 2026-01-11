'use client';

import { useMemo } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Sparkles, Target } from 'lucide-react';

// Configurazione colori per percorso
const PATH_COLORS = {
  leadership: {
    current: '#D4AF37',
    currentFill: 'rgba(212, 175, 55, 0.3)',
    accent: 'text-amber-600',
    accentBg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  ostacoli: {
    current: '#228B22',
    currentFill: 'rgba(34, 139, 34, 0.3)',
    accent: 'text-emerald-600',
    accentBg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  microfelicita: {
    current: '#8B5CF6',
    currentFill: 'rgba(139, 92, 246, 0.3)',
    accent: 'text-violet-600',
    accentBg: 'bg-violet-50',
    border: 'border-violet-200',
  },
} as const;

type PathType = keyof typeof PATH_COLORS;

interface AxisChange {
  axis: string;
  current: number;
  previous: number;
  delta: number;
  improved: boolean;
}

interface RadarComparisonProps {
  currentScores: Record<string, number>;
  previousScores: Record<string, number> | null;
  pathType: PathType;
  previousDate?: string;
}

export default function RadarComparison({
  currentScores,
  previousScores,
  pathType,
  previousDate,
}: RadarComparisonProps) {
  const colors = PATH_COLORS[pathType];

  // Prepara dati per il radar chart
  const chartData = useMemo(() => {
    const allAxes = Object.keys(currentScores);
    return allAxes.map(axis => ({
      axis,
      current: currentScores[axis] ?? 0,
      previous: previousScores?.[axis] ?? 0,
    }));
  }, [currentScores, previousScores]);

  // Calcola variazioni significative (delta > 0.5)
  const significantChanges = useMemo((): AxisChange[] => {
    if (!previousScores) return [];

    const changes: AxisChange[] = [];
    Object.keys(currentScores).forEach(axis => {
      const current = currentScores[axis] ?? 0;
      const previous = previousScores[axis] ?? 0;
      const delta = current - previous;

      if (Math.abs(delta) > 0.5) {
        changes.push({
          axis,
          current,
          previous,
          delta,
          improved: delta > 0,
        });
      }
    });

    // Ordina per delta assoluto decrescente
    return changes.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  }, [currentScores, previousScores]);

  // Calcola statistiche aggregate
  const stats = useMemo(() => {
    if (!previousScores) return null;

    const deltas = Object.keys(currentScores).map(axis => {
      const current = currentScores[axis] ?? 0;
      const previous = previousScores[axis] ?? 0;
      return current - previous;
    });

    const avgChange = deltas.length > 0
      ? deltas.reduce((sum, d) => sum + d, 0) / deltas.length
      : 0;

    const improvements = deltas.filter(d => d > 0.5).length;
    const declines = deltas.filter(d => d < -0.5).length;

    return { avgChange, improvements, declines };
  }, [currentScores, previousScores]);

  // Messaggio motivazionale
  const motivationalMessage = useMemo(() => {
    if (!stats) return null;

    if (stats.avgChange > 5) {
      return {
        icon: Sparkles,
        text: 'Ottimo progresso! Stai crescendo in modo significativo.',
        type: 'success' as const,
      };
    } else if (stats.avgChange >= -5 && stats.avgChange <= 5) {
      return {
        icon: Target,
        text: 'Stai consolidando le tue capacità. Continua così!',
        type: 'neutral' as const,
      };
    } else {
      return {
        icon: TrendingUp,
        text: 'Alcuni punteggi sono calati. Rifletti su cosa puoi migliorare.',
        type: 'warning' as const,
      };
    }
  }, [stats]);

  // Formatta data
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const hasPrevious = previousScores !== null;

      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-bold text-neutral-800 mb-2">{data.axis}</p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-neutral-600">Attuale: </span>
              <span className="font-semibold" style={{ color: colors.current }}>
                {data.current}%
              </span>
            </p>
            {hasPrevious && (
              <>
                <p className="text-sm">
                  <span className="text-neutral-600">Precedente: </span>
                  <span className="font-semibold text-gray-500">{data.previous}%</span>
                </p>
                <p className="text-sm">
                  <span className="text-neutral-600">Variazione: </span>
                  <span
                    className={`font-semibold ${
                      data.current - data.previous > 0
                        ? 'text-green-600'
                        : data.current - data.previous < 0
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {data.current - data.previous > 0 ? '+' : ''}
                    {(data.current - data.previous).toFixed(1)}%
                  </span>
                </p>
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const renderLegend = () => {
    if (!previousScores) return null;

    return (
      <div className="flex justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-1 rounded"
            style={{ backgroundColor: colors.current }}
          />
          <span className="text-neutral-600">Attuale</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-1 rounded bg-gray-400"
            style={{ borderStyle: 'dashed' }}
          />
          <span className="text-neutral-600">
            Precedente {previousDate && `(${formatDate(previousDate)})`}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-2xl border ${colors.border} p-6`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-neutral-900">
          Evoluzione del tuo Profilo
        </h3>
        {stats && (
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              stats.avgChange > 0
                ? 'bg-green-100 text-green-700'
                : stats.avgChange < 0
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {stats.avgChange > 0 ? '+' : ''}
            {stats.avgChange.toFixed(1)}% medio
          </div>
        )}
      </div>

      {/* Primo assessment message */}
      {!previousScores && (
        <div className={`mb-4 p-4 rounded-xl ${colors.accentBg} ${colors.border} border`}>
          <div className="flex items-center gap-3">
            <Sparkles className={`w-5 h-5 ${colors.accent}`} />
            <p className="text-neutral-700">
              Questo è il tuo primo assessment. Completa altri esercizi per vedere la tua evoluzione!
            </p>
          </div>
        </div>
      )}

      {/* Radar Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="#E5E7EB" />
            <PolarAngleAxis
              dataKey="axis"
              tick={{ fill: '#6B7280', fontSize: 11 }}
              tickLine={false}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
              tickCount={5}
            />

            {/* Radar precedente (sotto) */}
            {previousScores && (
              <Radar
                name="Precedente"
                dataKey="previous"
                stroke="#9CA3AF"
                fill="#9CA3AF"
                fillOpacity={0.1}
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            )}

            {/* Radar attuale (sopra) */}
            <Radar
              name="Attuale"
              dataKey="current"
              stroke={colors.current}
              fill={colors.current}
              fillOpacity={0.3}
              strokeWidth={2}
            />

            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend */}
      {renderLegend()}

      {/* Lista variazioni significative */}
      {significantChanges.length > 0 && (
        <div className="mt-6 pt-6 border-t border-neutral-200">
          <h4 className="text-sm font-semibold text-neutral-700 mb-3">
            Variazioni Significative
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {significantChanges.slice(0, 8).map(change => (
              <div
                key={change.axis}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  change.improved ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <span className="text-sm font-medium text-neutral-800 truncate">
                  {change.axis}
                </span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {change.improved ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm font-bold ${
                      change.improved ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {change.delta > 0 ? '+' : ''}
                    {change.delta.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messaggio motivazionale */}
      {motivationalMessage && previousScores && (
        <div
          className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${
            motivationalMessage.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : motivationalMessage.type === 'warning'
              ? 'bg-amber-50 border border-amber-200'
              : `${colors.accentBg} border ${colors.border}`
          }`}
        >
          <motivationalMessage.icon
            className={`w-5 h-5 flex-shrink-0 ${
              motivationalMessage.type === 'success'
                ? 'text-green-600'
                : motivationalMessage.type === 'warning'
                ? 'text-amber-600'
                : colors.accent
            }`}
          />
          <p
            className={`text-sm ${
              motivationalMessage.type === 'success'
                ? 'text-green-700'
                : motivationalMessage.type === 'warning'
                ? 'text-amber-700'
                : 'text-neutral-700'
            }`}
          >
            {motivationalMessage.text}
          </p>
        </div>
      )}

      {/* Stats summary */}
      {stats && previousScores && (
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{stats.improvements}</p>
            <p className="text-xs text-green-700">Miglioramenti</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-600">
              {Object.keys(currentScores).length - stats.improvements - stats.declines}
            </p>
            <p className="text-xs text-gray-700">Stabili</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{stats.declines}</p>
            <p className="text-xs text-red-700">Da migliorare</p>
          </div>
        </div>
      )}
    </div>
  );
}
