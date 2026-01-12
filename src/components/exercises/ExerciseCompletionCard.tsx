// src/components/exercises/ExerciseCompletionCard.tsx
// Componente per mostrare celebrazione e next steps dopo completamento esercizio
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface NextExercise {
  id: string;
  title: string;
  week_number: number;
  month_name?: string;
}

interface ExerciseCompletionCardProps {
  exerciseTitle: string;
  completedAt: string;
  totalCompleted: number;
  totalExercises: number;
  nextExercise: NextExercise | null;
  bookSlug: string;
}

// Icone inline SVG per evitare dipendenze
const CheckCircleIcon = () => (
  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

export default function ExerciseCompletionCard({
  exerciseTitle,
  completedAt,
  totalCompleted,
  totalExercises,
  nextExercise,
  bookSlug
}: ExerciseCompletionCardProps) {
  const [showAnimation, setShowAnimation] = useState(true);
  const progressPercent = totalExercises > 0 ? Math.round((totalCompleted / totalExercises) * 100) : 0;

  // Colori per percorso
  const pathColors: Record<string, { bg: string; border: string; light: string }> = {
    leadership: { bg: 'bg-amber-500', border: 'border-amber-500', light: 'bg-amber-50' },
    risolutore: { bg: 'bg-emerald-500', border: 'border-emerald-500', light: 'bg-emerald-50' },
    microfelicita: { bg: 'bg-violet-500', border: 'border-violet-500', light: 'bg-violet-50' }
  };

  const colors = pathColors[bookSlug] || pathColors.leadership;

  // Nascondi animazione dopo 3 secondi
  useEffect(() => {
    const timer = setTimeout(() => setShowAnimation(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Messaggio motivazionale basato sul progresso
  const getProgressMessage = () => {
    if (progressPercent >= 100) return 'Hai completato tutti gli esercizi! Straordinario! 🏆';
    if (progressPercent >= 75) return 'Sei quasi alla fine del percorso! Continua così!';
    if (progressPercent >= 50) return 'Ottimo progresso! Sei oltre la metà del percorso.';
    if (progressPercent >= 25) return 'Stai costruendo solide fondamenta. Avanti!';
    return 'Ogni esercizio è un passo avanti. Continua il tuo percorso!';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header celebrativo con animazione */}
      <div className={`${colors.bg} p-8 text-center relative overflow-hidden`}>
        {/* Animazione confetti (solo iniziale) */}
        {showAnimation && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="absolute top-0 left-1/2 w-2 h-2 bg-yellow-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="absolute top-0 left-3/4 w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        )}

        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
            <CheckCircleIcon />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            🎉 Ottimo lavoro!
          </h2>
          <p className="text-white/90">
            Hai completato &quot;<span className="font-medium">{exerciseTitle}</span>&quot;
          </p>
          <p className="text-white/70 text-sm mt-2">
            {new Date(completedAt).toLocaleDateString('it-IT', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Progress bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 flex items-center gap-1.5">
              <TrendingUpIcon />
              Il tuo progresso
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {totalCompleted}/{totalExercises} esercizi ({progressPercent}%)
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${colors.bg} transition-all duration-1000 ease-out rounded-full`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {getProgressMessage()}
          </p>
        </div>

        {/* Prossimo esercizio consigliato */}
        {nextExercise && (
          <div className={`border-2 ${colors.border} rounded-xl p-4 ${colors.light}`}>
            <p className="text-sm text-gray-600 mb-2 flex items-center gap-1.5">
              <span>✨</span>
              Prossimo esercizio consigliato
            </p>
            <p className="font-semibold text-gray-900 mb-1">
              Settimana {nextExercise.week_number}: {nextExercise.title}
            </p>
            {nextExercise.month_name && (
              <p className="text-sm text-gray-500 mb-3">{nextExercise.month_name}</p>
            )}
            <Link
              href={`/exercises/${nextExercise.id}`}
              className={`inline-flex items-center gap-2 ${colors.bg} text-white px-4 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity`}
            >
              Inizia Ora
              <ArrowRightIcon />
            </Link>
          </div>
        )}

        {/* Link torna indietro */}
        <div className="text-center pt-2 border-t border-gray-100">
          <Link
            href="/exercises"
            className="text-gray-500 hover:text-gray-700 transition-colors text-sm"
          >
            ← Torna alla lista esercizi
          </Link>
        </div>
      </div>
    </div>
  );
}
