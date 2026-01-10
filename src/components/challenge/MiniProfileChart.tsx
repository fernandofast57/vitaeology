'use client';

import { useMemo } from 'react';

// Tipi
interface DimensionScore {
  score: number;
  maxScore: number;
  percentage: number;
}

interface MiniProfileData {
  challengeType: 'leadership' | 'ostacoli' | 'microfelicita';
  totalScore: number;
  maxScore: number;
  percentage: number;
  dimensionScores: Record<string, DimensionScore>;
  completedDays: number;
}

interface MiniProfileChartProps {
  profile: MiniProfileData;
}

// Labels italiani per le dimensioni
const DIMENSION_LABELS: Record<string, string> = {
  // Leadership
  visione: 'Visione',
  azione: 'Azione',
  relazioni: 'Relazioni',
  adattamento: 'Adattamento',
  // Ostacoli
  pattern: 'Pattern',
  segnali: 'Segnali',
  risorse: 'Risorse',
  // Microfelicità
  rileva: 'Rileva',
  accogli: 'Accogli',
  distingui: 'Distingui',
  amplifica: 'Amplifica',
  resta: 'Resta',
};

// Colori per challenge type
const CHALLENGE_COLORS: Record<string, string> = {
  leadership: '#F4B942',
  ostacoli: '#10B981',
  microfelicita: '#8B5CF6',
};

// Nomi challenge per i testi
const CHALLENGE_NAMES: Record<string, string> = {
  leadership: 'Leadership Autentica',
  ostacoli: 'Oltre gli Ostacoli',
  microfelicita: 'Microfelicità',
};

// Testi interpretativi VALIDANTI (mai deficit!)
// Seguono il Principio Unificante: la capacità è PRESENTE, varia solo la frequenza d'uso
function getInterpretiveText(dimension: string, percentage: number): string {
  const label = DIMENSION_LABELS[dimension] || dimension;

  if (percentage >= 70) {
    return `La tua capacità di ${label} è già ben attiva — la usi in modo naturale e frequente.`;
  } else if (percentage >= 40) {
    return `La tua capacità di ${label} è presente — la usi in alcune situazioni, specialmente quando ti fermi a riflettere.`;
  } else {
    return `La tua capacità di ${label} è presente — la usi in modo occasionale. Il percorso ti aiuterà a renderla più intenzionale.`;
  }
}

// Messaggio principale validante basato sulla dimensione più forte
function getMainMessage(strongestDimension: string, challengeType: string): string {
  const label = DIMENSION_LABELS[strongestDimension] || strongestDimension;
  const challengeName = CHALLENGE_NAMES[challengeType] || challengeType;

  return `Le tue risposte mostrano che la capacità di ${label} è particolarmente attiva in te. Questo è un punto di forza naturale che ${challengeName} ti aiuterà a usare in modo ancora più intenzionale.`;
}

export default function MiniProfileChart({ profile }: MiniProfileChartProps) {
  const color = CHALLENGE_COLORS[profile.challengeType];

  // Trova la dimensione più forte per il messaggio principale
  const strongestDimension = useMemo(() => {
    let strongest = { key: '', percentage: 0 };
    Object.entries(profile.dimensionScores).forEach(([key, value]) => {
      if (value.percentage > strongest.percentage) {
        strongest = { key, percentage: value.percentage };
      }
    });
    return strongest;
  }, [profile.dimensionScores]);

  // Ordina le dimensioni per percentage decrescente
  const sortedDimensions = useMemo(() => {
    return Object.entries(profile.dimensionScores)
      .sort(([, a], [, b]) => b.percentage - a.percentage);
  }, [profile.dimensionScores]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Ecco cosa emerge dalle tue riflessioni
        </h3>
        <p className="text-gray-600 text-sm">
          Basato sulle tue {profile.completedDays * 3} risposte durante la Challenge
        </p>
      </div>

      {/* Messaggio principale validante */}
      {strongestDimension.key && (
        <div
          className="p-4 rounded-lg border-l-4"
          style={{ borderColor: color, backgroundColor: `${color}10` }}
        >
          <p className="text-gray-700 text-sm leading-relaxed">
            {getMainMessage(strongestDimension.key, profile.challengeType)}
          </p>
        </div>
      )}

      {/* Barre dimensioni */}
      <div className="space-y-4">
        {sortedDimensions.map(([dimension, data]) => (
          <div key={dimension} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">
                {DIMENSION_LABELS[dimension] || dimension}
              </span>
              <span className="text-gray-500">
                {Math.round(data.percentage)}%
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${data.percentage}%`,
                  backgroundColor: color,
                }}
              />
            </div>
            {/* Testo interpretativo validante */}
            <p className="text-xs text-gray-500 leading-relaxed">
              {getInterpretiveText(dimension, data.percentage)}
            </p>
          </div>
        ))}
      </div>

      {/* Punteggio totale */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Punteggio complessivo</span>
          <div className="flex items-center gap-2">
            <span
              className="text-2xl font-bold"
              style={{ color }}
            >
              {profile.totalScore}
            </span>
            <span className="text-gray-400 text-sm">/ {profile.maxScore}</span>
          </div>
        </div>
        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${profile.percentage}%`,
              backgroundColor: color,
            }}
          />
        </div>
      </div>

      {/* Footer motivazionale */}
      <div className="text-center pt-2">
        <p className="text-sm text-gray-600">
          Queste capacità sono già tue — il percorso completo ti aiuterà a usarle in modo più intenzionale.
        </p>
      </div>
    </div>
  );
}
