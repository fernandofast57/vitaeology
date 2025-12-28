'use client';

import React from 'react';
import { PILLAR_CONFIG } from '@/lib/assessment-scoring';

interface ProgressBarProps {
  currentQuestion: number;
  totalQuestions: number;
  answeredCount: number;
  currentPillar?: string;
}

export default function ProgressBar({
  currentQuestion,
  totalQuestions,
  answeredCount,
  currentPillar,
}: ProgressBarProps) {
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);
  const pillarColor = currentPillar && PILLAR_CONFIG[currentPillar]
    ? PILLAR_CONFIG[currentPillar].color
    : '#D4AF37'; // vitaeology-gold default

  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      {/* Barra progresso principale */}
      <div className="relative">
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-500 ease-out rounded-full"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: pillarColor,
            }}
          />
        </div>

        {/* Indicatori pilastri (ogni 18 domande) */}
        <div className="absolute top-0 left-0 w-full h-full flex pointer-events-none">
          {[25, 50, 75].map((marker) => (
            <div
              key={marker}
              className="absolute h-full w-0.5 bg-gray-300"
              style={{ left: `${marker}%` }}
            />
          ))}
        </div>
      </div>

      {/* Info progresso */}
      <div className="flex justify-between items-center mt-2">
        <span className="text-sm text-gray-600">
          {answeredCount} di {totalQuestions} risposte
        </span>
        <span className="text-sm font-medium" style={{ color: pillarColor }}>
          {progressPercent}% completato
        </span>
      </div>

      {/* Legenda pilastri */}
      <div className="flex justify-center gap-4 mt-4 flex-wrap">
        {Object.entries(PILLAR_CONFIG).map(([key, config]) => (
          <div
            key={key}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs
              ${currentPillar === key ? 'bg-gray-100' : ''}
            `}
          >
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: config.color }}
            />
            <span className={currentPillar === key ? 'font-semibold' : 'text-gray-600'}>
              {config.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
