// src/components/exercises/ExerciseDetail.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Exercise, UserExerciseProgress } from '@/lib/types/exercises';
import { EXERCISE_TYPE_CONFIG, DIFFICULTY_CONFIG, STATUS_CONFIG } from '@/lib/types/exercises';
import { startExercise, saveExerciseNotes, completeExercise } from '@/lib/supabase/exercises';

interface ExerciseDetailProps {
  exercise: Exercise;
  progress: UserExerciseProgress | null;
  userId: string;
}

export default function ExerciseDetail({ exercise, progress, userId }: ExerciseDetailProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [notes, setNotes] = useState(progress?.notes || '');
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<string, string>>(
    progress?.reflection_answers || {}
  );
  const [ratingDifficulty, setRatingDifficulty] = useState(progress?.rating_difficulty || 0);
  const [ratingUsefulness, setRatingUsefulness] = useState(progress?.rating_usefulness || 0);
  const [feedback, setFeedback] = useState(progress?.feedback || '');
  const [currentStatus, setCurrentStatus] = useState(progress?.status || 'not_started');

  const status = currentStatus;
  const statusConfig = STATUS_CONFIG[status];
  const typeConfig = EXERCISE_TYPE_CONFIG[exercise.exercise_type];
  const difficultyConfig = DIFFICULTY_CONFIG[exercise.difficulty_level];

  const handleStart = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await startExercise(userId, exercise.id);
      setCurrentStatus('in_progress');
      setSuccessMessage('Esercizio iniziato! Buon lavoro.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Errore nell\'avvio. Riprova.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await saveExerciseNotes(userId, exercise.id, notes, reflectionAnswers);
      setSuccessMessage('Progressi salvati!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Errore nel salvataggio. Riprova.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async () => {
    if (ratingDifficulty === 0 || ratingUsefulness === 0) {
      setError('Valuta difficoltà e utilità prima di completare.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await completeExercise(userId, exercise.id, {
        notes,
        reflection_answers: reflectionAnswers,
        rating_difficulty: ratingDifficulty,
        rating_usefulness: ratingUsefulness,
        feedback: feedback || undefined
      });
      setCurrentStatus('completed');
      setSuccessMessage('Esercizio completato!');
    } catch (err) {
      setError('Errore nel completamento. Riprova.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateReflection = (index: number, value: string) => {
    setReflectionAnswers(prev => ({ ...prev, [index.toString()]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/exercises" className="text-blue-600 hover:text-blue-800">
          ← Torna agli esercizi
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
      )}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">{successMessage}</div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            Settimana {exercise.week_number}
          </span>
          <span className={'px-3 py-1 rounded-full text-sm font-medium ' + statusConfig.color}>
            {statusConfig.label}
          </span>
          <span className={'px-3 py-1 rounded-full text-sm font-medium ' + typeConfig.color}>
            {typeConfig.label}
          </span>
          <span className={'px-3 py-1 rounded-full text-sm font-medium ' + difficultyConfig.color}>
            {difficultyConfig.label}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{exercise.title}</h1>
        {exercise.subtitle && (
          <p className="text-lg text-blue-600 font-medium mb-4">{exercise.subtitle}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>Tempo stimato: {exercise.estimated_time_minutes} minuti</span>
          <span>{exercise.month_name}</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Introduzione</h2>
        <p className="text-gray-700 leading-relaxed">{exercise.description}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Istruzioni</h2>
        <div className="prose prose-blue max-w-none">
          {exercise.instructions.split('\n').map((line, idx) => (
            <p key={idx} className="text-gray-700 mb-2">{line}</p>
          ))}
        </div>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm font-medium text-blue-800">Deliverable: {exercise.deliverable}</p>
        </div>
      </div>

      {status === 'not_started' ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-gray-600 mb-4">Pronto per iniziare questo esercizio?</p>
          <button
            onClick={handleStart}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Avvio...' : 'Inizia Esercizio'}
          </button>
        </div>
      ) : status === 'in_progress' ? (
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🚀</span>
            <h3 className="text-lg font-semibold text-yellow-800">Esercizio in Corso</h3>
          </div>
          <p className="text-yellow-700">
            Hai iniziato questo esercizio. Completa le attività e segna come completato quando hai finito.
          </p>
        </div>
      ) : null}

      {status !== 'not_started' && (
        <div>
          {exercise.reflection_prompts && exercise.reflection_prompts.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Domande di Riflessione</h2>
              <div className="space-y-4">
                {exercise.reflection_prompts.map((prompt, idx) => (
                  <div key={idx}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{prompt}</label>
                    <textarea
                      value={reflectionAnswers[idx.toString()] || ''}
                      onChange={(e) => updateReflection(idx, e.target.value)}
                      disabled={status === 'completed'}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      placeholder="Scrivi la tua riflessione..."
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Le Tue Note</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={status === 'completed'}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Scrivi qui le tue osservazioni..."
            />
            {status !== 'completed' && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="mt-3 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                {isSaving ? 'Salvataggio...' : 'Salva Progressi'}
              </button>
            )}
          </div>

          {status === 'in_progress' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Completa Esercizio</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficoltà percepita</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatingDifficulty(star)}
                      className={'w-10 h-10 rounded-lg border ' + (ratingDifficulty >= star ? 'bg-yellow-400 border-yellow-500' : 'bg-gray-100 border-gray-300')}
                    >
                      {star}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Utilità esercizio</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatingUsefulness(star)}
                      className={'w-10 h-10 rounded-lg border ' + (ratingUsefulness >= star ? 'bg-green-400 border-green-500' : 'bg-gray-100 border-gray-300')}
                    >
                      {star}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Feedback (opzionale)</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Commenti su questo esercizio..."
                />
              </div>
              <button
                onClick={handleComplete}
                disabled={isLoading}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Completamento...' : 'Segna come Completato'}
              </button>
            </div>
          )}

          {status === 'completed' && progress && (
            <div className="bg-green-50 rounded-lg border border-green-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">✅</span>
                <h2 className="text-xl font-semibold text-green-800">Esercizio Completato!</h2>
              </div>
              <p className="text-green-700">
                Completato il {new Date(progress.completed_at!).toLocaleDateString('it-IT')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}