'use client';

import React from 'react';
import { SCALE_LABELS, DIMENSION_CONFIG } from '@/lib/risolutore-scoring';

interface RisolutoreQuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  questionText: string;
  questionCode: string;
  dimensionCode: string;
  dimensionName: string;
  category: 'filtro' | 'traditore' | 'scala';
  dimensionColor: string;
  selectedValue: number | null;
  onSelect: (value: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
  isSubmitting?: boolean;
}

// Colori per categoria
const CATEGORY_COLORS = {
  filtro: { bg: 'bg-emerald-50', border: 'border-emerald-500', text: 'text-emerald-700' },
  traditore: { bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-700' },
  scala: { bg: 'bg-indigo-50', border: 'border-indigo-500', text: 'text-indigo-700' },
};

// Etichette categoria in italiano
const CATEGORY_LABELS = {
  filtro: 'Filtro Risolutivo',
  traditore: 'Traditore Silenzioso',
  scala: 'Scala del Risolutore',
};

export default function RisolutoreQuestionCard({
  questionNumber,
  totalQuestions,
  questionText,
  questionCode,
  dimensionCode,
  dimensionName,
  category,
  dimensionColor,
  selectedValue,
  onSelect,
  onNext,
  onPrevious,
  isFirst,
  isLast,
  isSubmitting = false,
}: RisolutoreQuestionCardProps) {
  // Scala 0-2: FALSO, INCERTO, VERO (ordine inverso per UX)
  const scaleOptions = [
    { value: 2, label: 'VERO', color: 'emerald' },
    { value: 1, label: 'INCERTO', color: 'amber' },
    { value: 0, label: 'FALSO', color: 'gray' },
  ];

  const categoryStyle = CATEGORY_COLORS[category];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 max-w-2xl mx-auto">
      {/* Header con categoria e dimensione */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${categoryStyle.bg} ${categoryStyle.text}`}
          >
            {CATEGORY_LABELS[category]}
          </span>
          <span
            className="px-3 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: dimensionColor }}
          >
            {dimensionName}
          </span>
        </div>
        <span className="text-xs text-gray-400 font-mono">
          {questionCode}
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

      {/* Scala risposte VERO / INCERTO / FALSO */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {scaleOptions.map((option) => {
          const isSelected = selectedValue === option.value;

          // Colori per ogni opzione
          const optionStyles = {
            2: { // VERO
              selected: 'border-emerald-500 bg-emerald-50 text-emerald-900',
              icon: 'bg-emerald-500 text-white',
              hover: 'hover:border-emerald-300 hover:bg-emerald-50/50',
            },
            1: { // INCERTO
              selected: 'border-amber-500 bg-amber-50 text-amber-900',
              icon: 'bg-amber-500 text-white',
              hover: 'hover:border-amber-300 hover:bg-amber-50/50',
            },
            0: { // FALSO
              selected: 'border-gray-400 bg-gray-100 text-gray-900',
              icon: 'bg-gray-500 text-white',
              hover: 'hover:border-gray-300 hover:bg-gray-50',
            },
          };

          const style = optionStyles[option.value as 0 | 1 | 2];

          return (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              disabled={isSubmitting}
              className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2
                ${isSelected ? style.selected : `border-gray-200 ${style.hover} text-gray-700`}
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg
                  ${isSelected ? style.icon : 'bg-gray-100 text-gray-500'}
                `}
              >
                {option.value === 2 && '✓'}
                {option.value === 1 && '?'}
                {option.value === 0 && '✗'}
              </div>
              <span className="font-semibold text-sm">{option.label}</span>
            </button>
          );
        })}
      </div>

      {/* Nota per Traditori */}
      {category === 'traditore' && (
        <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-700 text-center">
            💡 Per i Traditori, rispondere FALSO indica che hai superato questo blocco
          </p>
        </div>
      )}

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
              : 'bg-emerald-500 text-white hover:bg-emerald-600'
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
