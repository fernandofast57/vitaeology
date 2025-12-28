'use client';

import React from 'react';
import { SCALE_LABELS, SCALE_MIN, SCALE_MAX } from '@/lib/assessment-scoring';

interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  questionText: string;
  characteristicName: string;
  pillar: string;
  pillarColor: string;
  selectedValue: number | null;
  onSelect: (value: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
  isSubmitting?: boolean;
}

export default function QuestionCard({
  questionNumber,
  totalQuestions,
  questionText,
  characteristicName,
  pillar,
  pillarColor,
  selectedValue,
  onSelect,
  onNext,
  onPrevious,
  isFirst,
  isLast,
  isSubmitting = false,
}: QuestionCardProps) {
  const scaleOptions = Array.from(
    { length: SCALE_MAX - SCALE_MIN + 1 },
    (_, i) => i + SCALE_MIN
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 max-w-2xl mx-auto">
      {/* Header con pilastro */}
      <div className="flex items-center justify-between mb-6">
        <span
          className="px-3 py-1 rounded-full text-sm font-medium text-white"
          style={{ backgroundColor: pillarColor }}
        >
          {pillar}
        </span>
        <span className="text-sm text-gray-500">
          {characteristicName}
        </span>
      </div>

      {/* Numero domanda */}
      <div className="text-center mb-4">
        <span className="text-sm font-medium text-gray-400">
          Domanda {questionNumber} di {totalQuestions}
        </span>
      </div>

      {/* Testo domanda */}
      <div className="mb-8">
        <p className="text-lg md:text-xl text-gray-800 leading-relaxed text-center">
          {questionText}
        </p>
      </div>

      {/* Scala risposte */}
      <div className="space-y-3 mb-8">
        {scaleOptions.map((value) => (
          <button
            key={value}
            onClick={() => onSelect(value)}
            disabled={isSubmitting}
            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left
              ${selectedValue === value
                ? 'border-amber-500 bg-amber-50 text-amber-900'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
              }
              ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold
                  ${selectedValue === value
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                  }
                `}
              >
                {value}
              </div>
              <span className="font-medium">{SCALE_LABELS[value]}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Navigazione */}
      <div className="flex justify-between items-center">
        <button
          onClick={onPrevious}
          disabled={isFirst || isSubmitting}
          className={`px-6 py-3 rounded-lg font-medium transition-all
            ${isFirst || isSubmitting
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          ← Indietro
        </button>

        <button
          onClick={onNext}
          disabled={selectedValue === null || isSubmitting}
          className={`px-6 py-3 rounded-lg font-medium transition-all
            ${selectedValue === null || isSubmitting
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-amber-500 text-white hover:bg-amber-600'
            }
          `}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Elaborazione...
            </span>
          ) : isLast ? (
            'Completa Assessment →'
          ) : (
            'Avanti →'
          )}
        </button>
      </div>
    </div>
  );
}
