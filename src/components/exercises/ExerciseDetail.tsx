// src/components/exercises/ExerciseDetail.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Exercise, UserExerciseProgress } from '@/lib/types/exercises';
import { EXERCISE_TYPE_CONFIG, DIFFICULTY_CONFIG, STATUS_CONFIG } from '@/lib/types/exercises';
import { startExercise, saveExerciseNotes } from '@/lib/supabase/exercises';
import { createClient } from '@/lib/supabase/client';
import ExerciseCompletionCard from './ExerciseCompletionCard';
import { CelebrationModal, type Achievement } from '@/components/dashboard/AchievementCard';

// Tipo per le statistiche di completamento
interface CompletionStats {
  totalCompleted: number;
  totalExercises: number;
  nextExercise: {
    id: string;
    title: string;
    week_number: number;
    month_name?: string;
  } | null;
  bookSlug: string;
}

// Tipo per eleggibilità aggiornamento radar
interface RadarUpdateEligibility {
  eligible: boolean;
  reason: string;
  daysSinceLastSnapshot: number | null;
  exercisesSinceSnapshot: number;
}

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
  const [completionStats, setCompletionStats] = useState<CompletionStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [earnedAchievement, setEarnedAchievement] = useState<Achievement | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [radarUpdateEligibility, setRadarUpdateEligibility] = useState<RadarUpdateEligibility | null>(null);
  // const [showRadarPrompt, setShowRadarPrompt] = useState(false); // Commentato per ora

  // Fetch completion stats quando l'esercizio è completato
  useEffect(() => {
    async function fetchCompletionStats() {
      if (currentStatus !== 'completed') return;

      setIsLoadingStats(true);
      try {
        const res = await fetch(
          `/api/exercises/completion-stats?currentExerciseId=${exercise.id}&bookSlug=${exercise.book_slug}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setCompletionStats({
              totalCompleted: data.totalCompleted,
              totalExercises: data.totalExercises,
              nextExercise: data.nextExercise,
              bookSlug: data.bookSlug
            });
          }
        }
      } catch (err) {
        console.error('Errore fetch completion stats:', err);
      } finally {
        setIsLoadingStats(false);
      }
    }

    fetchCompletionStats();
  }, [currentStatus, exercise.id, exercise.book_slug]);

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
      // Recupera token per auth
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError('Sessione scaduta. Ricarica la pagina.');
        return;
      }

      // Chiama API con integrazione cicli
      const response = await fetch('/api/exercises/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          exerciseId: exercise.id,
          notes,
          reflectionAnswers,
          ratingDifficulty,
          ratingUsefulness,
          feedback: feedback || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Errore nel completamento');
      }

      setCurrentStatus('completed');

      // Gestisci radar update eligibility
      if (result.data?.radarUpdate) {
        setRadarUpdateEligibility(result.data.radarUpdate);

        // Log per tracking (utile per analytics future)
        if (result.data.radarUpdate.eligible) {
          console.log('[Radar Update] Utente eleggibile per aggiornamento radar:', {
            reason: result.data.radarUpdate.reason,
            daysSinceLastSnapshot: result.data.radarUpdate.daysSinceLastSnapshot,
            exercisesSinceSnapshot: result.data.radarUpdate.exercisesSinceSnapshot,
          });

          // PROMPT UTENTE (commentato per ora)
          // Quando attivato, mostrerà un dialog chiedendo se vuole aggiornare il profilo
          // setShowRadarPrompt(true);
        }
      }

      // Se c'è un achievement, mostra celebrazione
      if (result.data?.cycle?.achievement) {
        const pathTypeMap: Record<string, 'leadership' | 'ostacoli' | 'microfelicita'> = {
          'leadership': 'leadership',
          'risolutore': 'ostacoli',
          'microfelicita': 'microfelicita',
        };
        const pathType = pathTypeMap[exercise.book_slug] || 'leadership';

        setEarnedAchievement({
          id: result.data.cycle.achievement.id,
          title: result.data.cycle.achievement.title,
          description: result.data.cycle.nextProposal,
          achievement_type: result.data.cycle.achievement.type,
          path_type: pathType,
          celebrated: false,
          created_at: new Date().toISOString(),
        });
        setShowCelebration(true);
      } else {
        setSuccessMessage('Esercizio completato!');
      }
    } catch (err) {
      console.error('Errore completamento:', err);
      setError('Errore nel completamento. Riprova.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseCelebration = () => {
    setShowCelebration(false);
    setSuccessMessage('Conseguimento sbloccato!');
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
            <>
              {isLoadingStats ? (
                <div className="bg-white rounded-2xl shadow-lg p-8 animate-pulse">
                  <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ) : completionStats ? (
                <ExerciseCompletionCard
                  exerciseTitle={exercise.title}
                  completedAt={progress.completed_at!}
                  totalCompleted={completionStats.totalCompleted}
                  totalExercises={completionStats.totalExercises}
                  nextExercise={completionStats.nextExercise}
                  bookSlug={completionStats.bookSlug}
                />
              ) : (
                <div className="bg-green-50 rounded-lg border border-green-200 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">✅</span>
                    <h2 className="text-xl font-semibold text-green-800">Esercizio Completato!</h2>
                  </div>
                  <p className="text-green-700">
                    Completato il {new Date(progress.completed_at!).toLocaleDateString('it-IT')}
                  </p>
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <Link
                      href="/dashboard?openChat=true"
                      className="text-green-700 hover:text-green-900 font-medium"
                    >
                      💬 Rifletti con Fernando →
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Celebration Modal per achievement */}
      <CelebrationModal
        achievement={earnedAchievement}
        isOpen={showCelebration}
        onClose={handleCloseCelebration}
      />

      {/*
        RADAR UPDATE PROMPT (commentato per ora)
        Quando attivato, mostrerà un dialog chiedendo all'utente se vuole
        aggiornare il proprio profilo radar rispondendo a 10 domande rapide.

        Condizioni per mostrare il prompt:
        - radarUpdateEligibility.eligible === true
        - Almeno 7 giorni dall'ultimo snapshot
        - Almeno 3 esercizi completati dall'ultimo snapshot

        Implementazione futura:
        {showRadarPrompt && radarUpdateEligibility?.eligible && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Aggiorna il Tuo Profilo
              </h3>
              <p className="text-gray-600 mb-4">
                Hai completato {radarUpdateEligibility.exercisesSinceSnapshot} esercizi
                negli ultimi {radarUpdateEligibility.daysSinceLastSnapshot} giorni.
                Vuoi aggiornare il tuo profilo rispondendo a 10 domande rapide?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push(`/assessment/mini?type=${exercise.book_slug}`)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700"
                >
                  Sì, aggiorna
                </button>
                <button
                  onClick={() => setShowRadarPrompt(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200"
                >
                  Non ora
                </button>
              </div>
            </div>
          </div>
        )}
      */}

      {/* Debug info per tracking (rimuovere in produzione) */}
      {process.env.NODE_ENV === 'development' && radarUpdateEligibility && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white text-xs p-3 rounded-lg opacity-75">
          <div className="font-bold mb-1">Radar Update Debug:</div>
          <div>Eligible: {radarUpdateEligibility.eligible ? 'Yes' : 'No'}</div>
          <div>Reason: {radarUpdateEligibility.reason}</div>
          <div>Days: {radarUpdateEligibility.daysSinceLastSnapshot ?? 'N/A'}</div>
          <div>Exercises: {radarUpdateEligibility.exercisesSinceSnapshot}</div>
        </div>
      )}
    </div>
  );
}