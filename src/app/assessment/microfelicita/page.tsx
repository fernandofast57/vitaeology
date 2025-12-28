'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import MicrofelicitaQuestionCard from '@/components/assessment/MicrofelicitaQuestionCard';
import { QuestionWithDimension, DIMENSION_CONFIG } from '@/lib/microfelicita-scoring';

interface SessionData {
  id: string;
  currentQuestionIndex: number;
  status: string;
}

export default function AssessmentMicrofelicitaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionWithDimension[]>([]);
  const [session, setSession] = useState<SessionData | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [questionsRes, sessionRes] = await Promise.all([
          fetch('/api/assessment/microfelicita/questions'),
          fetch('/api/assessment/microfelicita/session', { method: 'POST' }),
        ]);

        if (!questionsRes.ok || !sessionRes.ok) {
          if (questionsRes.status === 401 || sessionRes.status === 401) {
            router.push('/auth/login?redirect=/assessment/microfelicita');
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
        setError("Impossibile caricare l'assessment");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  const progress = {
    radar: questions.filter(q => q.dimension.category === 'radar' && answers[q.id] !== undefined).length,
    sabotatori: questions.filter(q => q.dimension.category === 'sabotatore' && answers[q.id] !== undefined).length,
    livelli: questions.filter(q => q.dimension.category === 'livello' && answers[q.id] !== undefined).length,
  };

  const handleSelect = useCallback((value: number) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  }, [currentQuestion]);

  const handleNext = useCallback(async () => {
    if (!currentQuestion || !session) return;
    const selectedValue = answers[currentQuestion.id];
    if (selectedValue === undefined) return;

    const isLast = currentIndex === totalQuestions - 1;

    if (isLast) {
      setIsCompleting(true);
      try {
        await fetch('/api/assessment/microfelicita/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId: currentQuestion.id,
            rawScore: selectedValue,
            scoringType: currentQuestion.scoring_type,
            nextQuestionIndex: currentIndex,
          }),
        });

        const completeRes = await fetch('/api/assessment/microfelicita/complete', { method: 'POST' });
        if (!completeRes.ok) throw new Error('Errore completamento');

        const data = await completeRes.json();
        router.push(`/assessment/microfelicita/results?id=${data.assessmentId}`);
      } catch (err) {
        console.error('Errore:', err);
        setError('Errore nel completamento');
        setIsCompleting(false);
      }
    } else {
      setIsSaving(true);
      try {
        await fetch('/api/assessment/microfelicita/answer', {
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
        console.error('Errore:', err);
        setCurrentIndex(prev => prev + 1);
      } finally {
        setIsSaving(false);
      }
    }
  }, [currentQuestion, session, currentIndex, totalQuestions, answers, router]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  }, [currentIndex]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento assessment...</p>
        </div>
      </div>
    );
  }

  if (error === 'ACCESS_DENIED') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg text-center">
          <div className="text-violet-500 text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Assessment Bloccato</h2>
          <p className="text-gray-600 mb-6">
            Per accedere all'assessment "Microfelicità" devi prima acquistare il libro o completare la Challenge di 7 giorni.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push('/libro/microfelicita')}
              className="bg-violet-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-violet-600 transition"
            >
              Acquista il Libro
            </button>
            <button
              onClick={() => router.push('/challenge/microfelicita')}
              className="bg-white text-violet-600 border-2 border-violet-500 px-6 py-3 rounded-lg font-medium hover:bg-violet-50 transition"
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
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Errore</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-violet-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-violet-600">
            Riprova
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white flex items-center justify-center">
        <p className="text-gray-600">Nessuna domanda disponibile</p>
      </div>
    );
  }

  const dimConfig = DIMENSION_CONFIG[currentQuestion.dimension_code];

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Assessment: Praticante Microfelicità
          </h1>
          <p className="text-gray-600">Scopri il tuo profilo R.A.D.A.R. e i Sabotatori da superare</p>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Progresso</span>
            <span className="text-sm text-gray-500">{answeredCount} / {totalQuestions}</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${(answeredCount / totalQuestions) * 100}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                <span className="text-gray-600">R.A.D.A.R.</span>
              </div>
              <span className="font-medium text-violet-600">{progress.radar}/20</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                <span className="text-gray-600">Sabotatori</span>
              </div>
              <span className="font-medium text-orange-600">{progress.sabotatori}/15</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="text-gray-600">Livelli</span>
              </div>
              <span className="font-medium text-blue-600">{progress.livelli}/12</span>
            </div>
          </div>
        </div>

        <MicrofelicitaQuestionCard
          questionNumber={currentIndex + 1}
          totalQuestions={totalQuestions}
          questionText={currentQuestion.question_text}
          questionCode={currentQuestion.code}
          dimensionCode={currentQuestion.dimension_code}
          dimensionName={currentQuestion.dimension.name}
          category={currentQuestion.dimension.category}
          dimensionColor={dimConfig?.color || currentQuestion.dimension.color}
          selectedValue={answers[currentQuestion.id] ?? null}
          onSelect={handleSelect}
          onNext={handleNext}
          onPrevious={handlePrevious}
          isFirst={currentIndex === 0}
          isLast={currentIndex === totalQuestions - 1}
          isSubmitting={isSaving || isCompleting}
        />

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Rispondi onestamente. I tuoi progressi vengono salvati automaticamente.</p>
        </div>
      </div>
    </div>
  );
}
