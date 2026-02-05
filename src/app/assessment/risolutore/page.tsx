'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import RisolutoreQuestionCard from '@/components/assessment/RisolutoreQuestionCard';
import { QuestionWithDimension, DIMENSION_CONFIG } from '@/lib/risolutore-scoring';

interface SessionData {
  id: string;
  currentQuestionIndex: number;
  status: string;
}

export default function AssessmentRisolutorePage() {
  const router = useRouter();

  // Stati
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionWithDimension[]>([]);
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
          fetch('/api/assessment/risolutore/questions'),
          fetch('/api/assessment/risolutore/session', { method: 'POST' }),
        ]);

        if (!questionsRes.ok || !sessionRes.ok) {
          if (questionsRes.status === 401 || sessionRes.status === 401) {
            router.push('/auth/login?redirect=/assessment/risolutore');
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
        setError("Impossibile caricare l'assessment. Riprova più tardi.");
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

  // Calcola progresso per categoria
  const progress = {
    filtri: questions.filter(q => q.dimension.category === 'filtro' && answers[q.id] !== undefined).length,
    traditori: questions.filter(q => q.dimension.category === 'traditore' && answers[q.id] !== undefined).length,
    scala: questions.filter(q => q.dimension.category === 'scala' && answers[q.id] !== undefined).length,
  };

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
        await fetch('/api/assessment/risolutore/answer', {
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
        const completeRes = await fetch('/api/assessment/risolutore/complete', {
          method: 'POST',
        });

        if (!completeRes.ok) {
          throw new Error('Errore completamento');
        }

        const data = await completeRes.json();

        // Redirect ai risultati
        router.push(`/assessment/risolutore/results?id=${data.assessmentId}`);
      } catch (err) {
        console.error('Errore completamento:', err);
        setError('Errore nel completamento. Riprova.');
        setIsCompleting(false);
      }
    } else {
      // Salva e vai avanti
      setIsSaving(true);
      try {
        await fetch('/api/assessment/risolutore/answer', {
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
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento assessment...</p>
        </div>
      </div>
    );
  }

  if (error === 'ACCESS_DENIED') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg text-center">
          <div className="text-emerald-500 text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Assessment Bloccato</h2>
          <p className="text-gray-600 mb-6">
            L&apos;assessment &ldquo;Oltre gli Ostacoli&rdquo; è disponibile con l&apos;acquisto del libro o il completamento della Challenge di 7 giorni.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push('/libro/risolutore')}
              className="bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-600 transition"
            >
              Acquista il Libro
            </button>
            <button
              onClick={() => router.push('/challenge/ostacoli')}
              className="bg-white text-emerald-600 border-2 border-emerald-500 px-6 py-3 rounded-lg font-medium hover:bg-emerald-50 transition"
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
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Si è verificato un errore</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-600 transition"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <p className="text-gray-600">Nessuna domanda disponibile</p>
      </div>
    );
  }

  const dimensionConfig = DIMENSION_CONFIG[currentQuestion.dimension_code];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Assessment: Il Risolutore
          </h1>
          <p className="text-gray-600">
            Scopri i tuoi Filtri Risolutivi e supera i Traditori Silenziosi
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Progresso</span>
            <span className="text-sm text-gray-500">
              {answeredCount} / {totalQuestions} domande
            </span>
          </div>

          {/* Barra progresso principale */}
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
            />
          </div>

          {/* Progresso per categoria */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-gray-600">Filtri</span>
              </div>
              <span className="font-medium text-emerald-600">{progress.filtri}/18</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                <span className="text-gray-600">Traditori</span>
              </div>
              <span className="font-medium text-red-600">{progress.traditori}/18</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span className="text-gray-600">Scala</span>
              </div>
              <span className="font-medium text-indigo-600">{progress.scala}/12</span>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <RisolutoreQuestionCard
          questionNumber={currentIndex + 1}
          totalQuestions={totalQuestions}
          questionText={currentQuestion.question_text}
          questionCode={currentQuestion.code}
          dimensionCode={currentQuestion.dimension_code}
          dimensionName={currentQuestion.dimension.name}
          category={currentQuestion.dimension.category}
          dimensionColor={dimensionConfig?.color || currentQuestion.dimension.color}
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
            Rispondi onestamente. Non ci sono risposte giuste o sbagliate.
            <br />
            I tuoi progressi vengono salvati automaticamente.
          </p>
        </div>
      </div>
    </div>
  );
}
