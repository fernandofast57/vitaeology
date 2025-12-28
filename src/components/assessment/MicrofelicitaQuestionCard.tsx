'use client';

import React from 'react';
import { DIMENSION_CONFIG } from '@/lib/microfelicita-scoring';

interface MicrofelicitaQuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  questionText: string;
  questionCode: string;
  dimensionCode: string;
  dimensionName: string;
  category: 'radar' | 'sabotatore' | 'livello';
  dimensionColor: string;
  selectedValue: number | null;
  onSelect: (value: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
  isSubmitting?: boolean;
}

const CATEGORY_LABELS = {
  radar: 'Fase R.A.D.A.R.',
  sabotatore: 'Sabotatore Automatico',
  livello: 'Livello Praticante',
};

const CATEGORY_COLORS = {
  radar: { bg: 'bg-violet-50', text: 'text-violet-700' },
  sabotatore: { bg: 'bg-orange-50', text: 'text-orange-700' },
  livello: { bg: 'bg-blue-50', text: 'text-blue-700' },
};

export default function MicrofelicitaQuestionCard({
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
}: MicrofelicitaQuestionCardProps) {
  const scaleOptions = [
    { value: 2, label: 'VERO', icon: '✓', color: 'violet' },
    { value: 1, label: 'INCERTO', icon: '?', color: 'amber' },
    { value: 0, label: 'FALSO', icon: '✗', color: 'gray' },
  ];

  const categoryStyle = CATEGORY_COLORS[category];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryStyle.bg} ${categoryStyle.text}`}>
            {CATEGORY_LABELS[category]}
          </span>
          <span
            className="px-3 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: dimensionColor }}
          >
            {dimensionName}
          </span>
        </div>
        <span className="text-xs text-gray-400 font-mono">{questionCode}</span>
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
      <div className="grid grid-cols-3 gap-3 mb-8">
        {scaleOptions.map((option) => {
          const isSelected = selectedValue === option.value;
          const styles = {
            2: { selected: 'border-violet-500 bg-violet-50', icon: 'bg-violet-500 text-white' },
            1: { selected: 'border-amber-500 bg-amber-50', icon: 'bg-amber-500 text-white' },
            0: { selected: 'border-gray-400 bg-gray-100', icon: 'bg-gray-500 text-white' },
          };
          const style = styles[option.value as 0 | 1 | 2];

          return (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              disabled={isSubmitting}
              className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2
                ${isSelected ? style.selected : 'border-gray-200 hover:border-gray-300'}
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg
                ${isSelected ? style.icon : 'bg-gray-100 text-gray-500'}`}
              >
                {option.icon}
              </div>
              <span className="font-semibold text-sm">{option.label}</span>
            </button>
          );
        })}
      </div>

      {/* Nota per Sabotatori */}
      {category === 'sabotatore' && (
        <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-700 text-center">
            💡 Per i Sabotatori, rispondere FALSO indica che hai superato questo pattern
          </p>
        </div>
      )}

      {/* Navigazione */}
      <div className="flex justify-between items-center">
        <button
          onClick={onPrevious}
          disabled={isFirst || isSubmitting}
          className={`px-6 py-3 rounded-lg font-medium transition-all
            ${isFirst || isSubmitting ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
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
              : 'bg-violet-500 text-white hover:bg-violet-600'}
          `}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Elaborazione...
            </span>
          ) : isLast ? 'Completa Assessment →' : 'Avanti →'}
        </button>
      </div>
    </div>
  );
}
