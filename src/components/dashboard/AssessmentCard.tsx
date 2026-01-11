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

type PathType = 'leadership' | 'ostacoli' | 'microfelicita';

const PATH_CONFIG = {
  leadership: {
    name: 'Leadership Autentica',
    totalQuestions: 240,
    testUrl: '/test',
    resultsUrl: '/results',
  },
  ostacoli: {
    name: 'Oltre gli Ostacoli',
    totalQuestions: 48,
    testUrl: '/assessment/risolutore',
    resultsUrl: '/assessment/risolutore/results',
  },
  microfelicita: {
    name: 'Microfelicita',
    totalQuestions: 47,
    testUrl: '/assessment/microfelicita',
    resultsUrl: '/assessment/microfelicita/results',
  },
};

interface AssessmentCardProps {
  assessment: AssessmentData | null;
  pathType?: PathType;
}

export default function AssessmentCard({ assessment, pathType = 'leadership' }: AssessmentCardProps) {
  const config = PATH_CONFIG[pathType];
  const totalQuestions = config.totalQuestions;
  const progress = assessment ? (assessment.questions_answered / totalQuestions) * 100 : 0;
  const isCompleted = assessment?.status === 'completed';
  const isInProgress = assessment?.status === 'in_progress' || (assessment && !isCompleted && assessment.questions_answered > 0);

  if (!assessment) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="p-4 md:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-petrol-600/10 rounded-xl flex-shrink-0">
              <ClipboardCheck className="w-6 h-6 sm:w-8 sm:h-8 text-petrol-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-1">Assessment {config.name}</h2>
              <p className="text-sm sm:text-base text-neutral-600 mb-3 sm:mb-4">Scopri il tuo profilo. {totalQuestions} domande.</p>
              <Link href={config.testUrl} className="inline-flex items-center gap-2 bg-petrol-600 hover:bg-petrol-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-colors text-sm sm:text-base">
                <Play className="w-4 h-4 sm:w-5 sm:h-5" />
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
        <div className="p-4 md:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-amber-100 rounded-xl flex-shrink-0">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0 w-full">
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-1">Assessment in Corso</h2>
              <div className="mb-3 sm:mb-4">
                <div className="flex justify-between text-xs sm:text-sm mb-2">
                  <span className="text-neutral-600">Progresso</span>
                  <span className="font-medium">{assessment.questions_answered}/{totalQuestions}</span>
                </div>
                <div className="h-2 sm:h-3 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <Link href={config.testUrl} className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-colors text-sm sm:text-base">
                Riprendi Test
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
      <div className="p-4 md:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 bg-emerald-100 rounded-xl flex-shrink-0">
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-1">Assessment Completato!</h2>
            {assessment.total_score !== null && (
              <p className="text-sm sm:text-base text-emerald-700 font-medium mb-3 sm:mb-4">Punteggio: {assessment.total_score}%</p>
            )}
            <Link href={config.resultsUrl} className="inline-flex items-center gap-2 bg-petrol-600 hover:bg-petrol-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-colors text-sm sm:text-base">
              Vedi Risultati
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
