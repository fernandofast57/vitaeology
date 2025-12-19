// src/components/exercises/LockedExerciseView.tsx
// Vista esercizio bloccato con preview e CTA upgrade

'use client';

import Link from 'next/link';
import { EXERCISE_TYPE_CONFIG, DIFFICULTY_CONFIG } from '@/lib/types/exercises';
import { SUBSCRIPTION_TIERS, SubscriptionTier } from '@/lib/types/roles';
import type { Exercise } from '@/lib/types/exercises';

interface LockedExerciseViewProps {
  exercise: Exercise;
  requiredTier: string;
  requiredTierDisplayName: string;
  userTier: SubscriptionTier;
}

export default function LockedExerciseView({
  exercise,
  requiredTier,
  requiredTierDisplayName,
  userTier
}: LockedExerciseViewProps) {
  const typeConfig = EXERCISE_TYPE_CONFIG[exercise.exercise_type];
  const difficultyConfig = DIFFICULTY_CONFIG[exercise.difficulty_level];
  const userTierConfig = SUBSCRIPTION_TIERS[userTier];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header con navigazione */}
      <div className="mb-6">
        <Link
          href="/exercises"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Torna agli esercizi
        </Link>
      </div>

      {/* Card esercizio bloccato */}
      <div className="bg-white rounded-xl shadow-lg border border-amber-200 overflow-hidden">
        {/* Banner bloccato */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold">Contenuto Premium</p>
              <p className="text-amber-100 text-sm">
                Richiede piano {requiredTierDisplayName}
              </p>
            </div>
          </div>
        </div>

        {/* Contenuto esercizio (preview) */}
        <div className="p-6">
          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
              Settimana {exercise.week_number}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyConfig.color}`}>
              {difficultyConfig.label}
            </span>
            <span className={`px-3 py-1 rounded text-sm ${typeConfig.color}`}>
              {typeConfig.label}
            </span>
          </div>

          {/* Titolo */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {exercise.title}
          </h1>
          {exercise.subtitle && (
            <p className="text-lg text-gray-600 mb-4">{exercise.subtitle}</p>
          )}

          {/* Descrizione con blur */}
          <div className="relative">
            <p className="text-gray-600 mb-6">{exercise.description}</p>

            {/* Sezione blurred */}
            <div className="relative">
              <div className="blur-sm select-none pointer-events-none">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Istruzioni</h3>
                  <p className="text-gray-500 line-clamp-3">
                    {exercise.instructions || 'Le istruzioni dettagliate per completare questo esercizio sono disponibili per i membri del piano ' + requiredTierDisplayName + '.'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Deliverable</h3>
                  <p className="text-gray-500 line-clamp-2">
                    {exercise.deliverable || 'Il risultato atteso da questo esercizio...'}
                  </p>
                </div>

                {exercise.reflection_prompts && exercise.reflection_prompts.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Domande di Riflessione</h3>
                    <ul className="space-y-2">
                      {exercise.reflection_prompts.slice(0, 2).map((prompt, i) => (
                        <li key={i} className="text-gray-500">{prompt}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/70 to-white flex items-end justify-center pb-4">
                <p className="text-gray-500 text-sm">
                  Contenuto disponibile con piano {requiredTierDisplayName}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Upgrade */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-t border-amber-200 p-6">
          <div className="text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Sblocca questo esercizio
            </h3>
            <p className="text-gray-600 mb-4">
              Passa al piano <span className="font-semibold text-amber-700">{requiredTierDisplayName}</span> per
              accedere a questo esercizio e a tutti i contenuti {exercise.difficulty_level === 'avanzato' ? 'avanzati' : 'intermedi e avanzati'}.
            </p>

            <div className="bg-white rounded-lg p-4 mb-4 border border-amber-200">
              <p className="text-sm text-gray-500 mb-1">Il tuo piano attuale</p>
              <p className="text-lg font-semibold text-gray-700">{userTierConfig.display_name}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Passa a {requiredTierDisplayName}
              </Link>
              <Link
                href="/exercises"
                className="inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors"
              >
                Torna agli esercizi
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Suggerimento esercizi disponibili */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">
              Hai ancora tanti esercizi da esplorare!
            </h4>
            <p className="text-blue-700 text-sm">
              Con il tuo piano {userTierConfig.display_name} hai accesso a tutti gli esercizi di livello Base.
              Completa quelli per costruire solide fondamenta prima di passare ai contenuti avanzati.
            </p>
            <Link
              href="/exercises?filter=not_started"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mt-2 text-sm"
            >
              Vedi esercizi disponibili
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
