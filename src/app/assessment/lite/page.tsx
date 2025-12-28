'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import QuestionCard from '@/components/assessment/QuestionCard';
import ProgressBar from '@/components/assessment/ProgressBar';
import { QuestionWithCharacteristic, PILLAR_CONFIG } from '@/lib/assessment-scoring';

interface SessionData {
  id: string;
  currentQuestionIndex: number;
  status: string;
}

export default function AssessmentLitePage() {
  const router = useRouter();

  // Stati
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionWithCharacteristic[]>([]);
  const [session, setSession] = useState<SessionData | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Carica dati iniziali
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Carica domande e sessione in parallelo
        const [questionsRes, sessionRes] = await Promise.all([
          fetch('/api/assessment/questions'),
          fetch('/api/assessment/session'),
        ]);

        if (!questionsRes.ok || !sessionRes.ok) {
          if (questionsRes.status === 401 || sessionRes.status === 401) {
            router.push('/auth/login?redirect=/assessment/lite');
            return;
          }
          if (sessionRes.status === 403) {
            setError('ACCESS_DENIED');
            setLoading(false);
            return;
          }
          throw new Error('Errore caricamento dati');
        }

        const questionsData = await questionsRes.json();
        const sessionData = await sessionRes.json();

        setQuestions(questionsData.questions);
        setSession(sessionData.session);
        setAnswers(sessionData.answers || {});
        setCurrentIndex(sessionData.session.currentQuestionIndex || 0);
      } catch (err) {
        console.error('Errore:', err);
        setError('Impossibile caricare l\'assessment. Riprova più tardi.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  // Domanda corrente
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  // Gestione selezione risposta
  const handleSelect = useCallback((value: number) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  }, [currentQuestion]);

  // Salva risposta e vai avanti
  const handleNext = useCallback(async () => {
    if (!currentQuestion || !session) return;

    const selectedValue = answers[currentQuestion.id];
    if (selectedValue === undefined) return;

    // Ultima domanda?
    const isLast = currentIndex === totalQuestions - 1;

    if (isLast) {
      // Completa l'assessment
      setIsCompleting(true);
      try {
        // Prima salva l'ultima risposta
        await fetch('/api/assessment/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId: currentQuestion.id,
            rawScore: selectedValue,
            scoringType: currentQuestion.scoring_type,
            nextQuestionIndex: currentIndex,
          }),
        });

        // Poi completa
        const completeRes = await fetch('/api/assessment/complete', {
          method: 'POST',
        });

        if (!completeRes.ok) {
          throw new Error('Errore completamento');
        }

        const data = await completeRes.json();

        // Redirect ai risultati
        router.push(`/assessment/lite/results?id=${data.assessmentId}`);
      } catch (err) {
        console.error('Errore completamento:', err);
        setError('Errore nel completamento. Riprova.');
        setIsCompleting(false);
      }
    } else {
      // Salva e vai avanti
      setIsSaving(true);
      try {
        await fetch('/api/assessment/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId: currentQuestion.id,
            rawScore: selectedValue,
            scoringType: currentQuestion.scoring_type,
            nextQuestionIndex: currentIndex + 1,
          }),
        });

        setCurrentIndex(prev => prev + 1);
      } catch (err) {
        console.error('Errore salvataggio:', err);
        // Procedi comunque localmente
        setCurrentIndex(prev => prev + 1);
      } finally {
        setIsSaving(false);
      }
    }
  }, [currentQuestion, session, currentIndex, totalQuestions, answers, router]);

  // Torna indietro
  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  // Rendering condizionale
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento assessment...</p>
        </div>
      </div>
    );
  }

  if (error === 'ACCESS_DENIED') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg text-center">
          <div className="text-amber-500 text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Assessment Bloccato</h2>
          <p className="text-gray-600 mb-6">
            Per accedere all'assessment "Leadership Autentica" devi prima acquistare il libro o completare la Challenge di 7 giorni.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push('/libro/leadership')}
              className="bg-amber-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-600 transition"
            >
              Acquista il Libro
            </button>
            <button
              onClick={() => router.push('/challenge/leadership')}
              className="bg-white text-amber-600 border-2 border-amber-500 px-6 py-3 rounded-lg font-medium hover:bg-amber-50 transition"
            >
              Inizia la Challenge
            </button>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-6 text-gray-500 hover:text-gray-700 underline text-sm"
          >
            ← Torna alla Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Si è verificato un errore</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-amber-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-600 transition"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <p className="text-gray-600">Nessuna domanda disponibile</p>
      </div>
    );
  }

  const pillarConfig = PILLAR_CONFIG[currentQuestion.characteristic.pillar];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Leadership Assessment LITE
          </h1>
          <p className="text-gray-600">
            Rispondi onestamente a ogni domanda per scoprire il tuo profilo
          </p>
        </div>

        {/* Progress Bar */}
        <ProgressBar
          currentQuestion={currentIndex + 1}
          totalQuestions={totalQuestions}
          answeredCount={answeredCount}
          currentPillar={currentQuestion.characteristic.pillar}
        />

        {/* Question Card */}
        <QuestionCard
          questionNumber={currentIndex + 1}
          totalQuestions={totalQuestions}
          questionText={currentQuestion.question_text}
          characteristicName={currentQuestion.characteristic.name}
          pillar={pillarConfig?.label || currentQuestion.characteristic.pillar}
          pillarColor={pillarConfig?.color || '#D4AF37'}
          selectedValue={answers[currentQuestion.id] ?? null}
          onSelect={handleSelect}
          onNext={handleNext}
          onPrevious={handlePrevious}
          isFirst={currentIndex === 0}
          isLast={currentIndex === totalQuestions - 1}
          isSubmitting={isSaving || isCompleting}
        />

        {/* Info aggiuntive */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Puoi tornare indietro per modificare le risposte precedenti.
            <br />
            I tuoi progressi vengono salvati automaticamente.
          </p>
        </div>
      </div>
    </div>
  );
}
