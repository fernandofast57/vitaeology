'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ClipboardCheck, Play, ArrowRight, CheckCircle, Clock, BookOpen, Sparkles, Target } from 'lucide-react';
import Link from 'next/link';

interface AssessmentStatus {
  id: string | null;
  status: 'not_started' | 'in_progress' | 'completed';
  questionsAnswered: number;
  totalQuestions: number;
  score: number | null;
  completedAt: string | null;
}

interface AssessmentConfig {
  type: 'lite' | 'risolutore' | 'microfelicita';
  title: string;
  subtitle: string;
  description: string;
  totalQuestions: number;
  duration: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  startUrl: string;
  resultsUrl: string;
  table: string;
}

const ASSESSMENTS: AssessmentConfig[] = [
  {
    type: 'lite',
    title: 'Leadership Autentica',
    subtitle: 'I 4 Pilastri della Leadership',
    description: 'Scopri il tuo profilo nei pilastri Essere, Sentire, Pensare, Agire',
    totalQuestions: 72,
    duration: '15-20 min',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    icon: <BookOpen className="w-6 h-6" />,
    startUrl: '/assessment/lite',
    resultsUrl: '/assessment/lite/results',
    table: 'user_assessments_v2',
  },
  {
    type: 'risolutore',
    title: 'Oltre gli Ostacoli',
    subtitle: 'Il Risolutore che hai in te',
    description: 'Scopri i tuoi Filtri, supera i Traditori, trova il tuo livello',
    totalQuestions: 48,
    duration: '10-15 min',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    icon: <Target className="w-6 h-6" />,
    startUrl: '/assessment/risolutore',
    resultsUrl: '/assessment/risolutore/results',
    table: 'user_assessments_v2',
  },
  {
    type: 'microfelicita',
    title: 'Microfelicità',
    subtitle: 'Praticante di Microfelicità',
    description: 'Esplora le 5 fasi R.A.D.A.R. e supera i 5 Sabotatori',
    totalQuestions: 47,
    duration: '10-15 min',
    color: 'text-violet-600',
    bgColor: 'bg-violet-100',
    icon: <Sparkles className="w-6 h-6" />,
    startUrl: '/assessment/microfelicita',
    resultsUrl: '/assessment/microfelicita/results',
    table: 'user_assessments_v2',
  },
];

export default function AssessmentsOverview() {
  const [statuses, setStatuses] = useState<Record<string, AssessmentStatus>>({});
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchStatuses() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const newStatuses: Record<string, AssessmentStatus> = {};

        for (const config of ASSESSMENTS) {
          const { data } = await supabase
            .from('user_assessments_v2')
            .select('id, status, questions_answered, total_score, completed_at')
            .eq('user_id', user.id)
            .eq('assessment_type', config.type)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (data) {
            newStatuses[config.type] = {
              id: data.id,
              status: data.status as 'not_started' | 'in_progress' | 'completed',
              questionsAnswered: data.questions_answered || 0,
              totalQuestions: config.totalQuestions,
              score: data.total_score,
              completedAt: data.completed_at,
            };
          } else {
            newStatuses[config.type] = {
              id: null,
              status: 'not_started',
              questionsAnswered: 0,
              totalQuestions: config.totalQuestions,
              score: null,
              completedAt: null,
            };
          }
        }

        setStatuses(newStatuses);
      } catch (error) {
        console.error('Error fetching assessment statuses:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStatuses();
  }, [supabase]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-neutral-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-petrol-600/10 rounded-xl">
          <ClipboardCheck className="w-6 h-6 text-petrol-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-neutral-900">I Tuoi Assessment</h2>
          <p className="text-sm text-neutral-600">Scopri i tuoi profili nei 3 percorsi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ASSESSMENTS.map(config => {
          const status = statuses[config.type];
          if (!status) return null;

          return (
            <AssessmentTile
              key={config.type}
              config={config}
              status={status}
            />
          );
        })}
      </div>
    </div>
  );
}

function AssessmentTile({ config, status }: { config: AssessmentConfig; status: AssessmentStatus }) {
  const progress = status.totalQuestions > 0
    ? (status.questionsAnswered / status.totalQuestions) * 100
    : 0;

  const getStatusBadge = () => {
    switch (status.status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
            <CheckCircle className="w-3 h-3" />
            Completato
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
            <Clock className="w-3 h-3" />
            In corso
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 text-neutral-600 text-xs font-medium rounded-full">
            {config.duration}
          </span>
        );
    }
  };

  const getActionButton = () => {
    switch (status.status) {
      case 'completed':
        return (
          <Link
            href={`${config.resultsUrl}?id=${status.id}`}
            className={`inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl font-medium transition-colors text-sm ${config.bgColor} ${config.color} hover:opacity-80`}
          >
            Vedi Risultati
            <ArrowRight className="w-4 h-4" />
          </Link>
        );
      case 'in_progress':
        return (
          <Link
            href={config.startUrl}
            className="inline-flex items-center justify-center gap-2 w-full bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors text-sm"
          >
            Riprendi
            <ArrowRight className="w-4 h-4" />
          </Link>
        );
      default:
        return (
          <Link
            href={config.startUrl}
            className="inline-flex items-center justify-center gap-2 w-full bg-petrol-600 hover:bg-petrol-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors text-sm"
          >
            <Play className="w-4 h-4" />
            Inizia
          </Link>
        );
    }
  };

  return (
    <div className="border border-neutral-200 rounded-xl p-4 flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-xl ${config.bgColor}`}>
          <span className={config.color}>{config.icon}</span>
        </div>
        {getStatusBadge()}
      </div>

      <h3 className="font-bold text-neutral-900 mb-1">{config.title}</h3>
      <p className="text-xs text-neutral-500 mb-2">{config.subtitle}</p>
      <p className="text-sm text-neutral-600 mb-4 flex-1">{config.description}</p>

      {status.status === 'in_progress' && (
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-neutral-500">Progresso</span>
            <span className="font-medium text-neutral-700">
              {status.questionsAnswered}/{status.totalQuestions}
            </span>
          </div>
          <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {status.status === 'completed' && status.score !== null && (
        <div className="mb-4 text-center">
          <span className={`text-2xl font-bold ${config.color}`}>{status.score}%</span>
          <p className="text-xs text-neutral-500">Punteggio</p>
        </div>
      )}

      {getActionButton()}
    </div>
  );
}
