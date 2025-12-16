'use client';

import { ClipboardCheck, Play, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface AssessmentData {
  id: string;
  status: string;
  questions_answered: number;
  total_score: number | null;
  completed_at: string | null;
  created_at: string;
}

interface AssessmentCardProps {
  assessment: AssessmentData | null;
}

export default function AssessmentCard({ assessment }: AssessmentCardProps) {
  const totalQuestions = 240;
  const progress = assessment ? (assessment.questions_answered / totalQuestions) * 100 : 0;
  const isCompleted = assessment?.status === 'completed';
  const isInProgress = assessment?.status === 'in_progress' || (assessment && !isCompleted && assessment.questions_answered > 0);

  if (!assessment) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-petrol-600/10 rounded-xl">
              <ClipboardCheck className="w-8 h-8 text-petrol-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-neutral-900 mb-1">Assessment Leadership Autentica</h2>
              <p className="text-neutral-600 mb-4">Scopri il tuo profilo. 240 domande, circa 30 minuti.</p>
              <Link href="/test" className="inline-flex items-center gap-2 bg-petrol-600 hover:bg-petrol-700 text-white px-6 py-3 rounded-xl font-medium transition-colors">
                <Play className="w-5 h-5" />
                Inizia il Test
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isInProgress) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-neutral-900 mb-1">Assessment in Corso</h2>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-neutral-600">Progresso</span>
                  <span className="font-medium">{assessment.questions_answered}/{totalQuestions}</span>
                </div>
                <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <Link href="/test" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-medium transition-colors">
                Riprendi Test
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-100 rounded-xl">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-neutral-900 mb-1">Assessment Completato!</h2>
            {assessment.total_score !== null && (
              <p className="text-emerald-700 font-medium mb-4">Punteggio: {assessment.total_score}%</p>
            )}
            <div className="flex gap-3">
              <Link href={`/results/${assessment.id}`} className="inline-flex items-center gap-2 bg-petrol-600 hover:bg-petrol-700 text-white px-6 py-3 rounded-xl font-medium transition-colors">
                Vedi Risultati
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
