'use client';

/**
 * RecommendedExercises Component
 *
 * Mostra gli esercizi raccomandati per l'utente basati sui risultati
 * dell'assessment. Visualizza le aree prioritarie e i prossimi esercizi
 * consigliati.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

interface RecommendedExercise {
  id: string;
  title: string;
  subtitle: string | null;
  week_number: number;
  characteristic_slug: string;
  exercise_type: string;
  difficulty_level: string;
  estimated_time_minutes: number;
  description: string;
  priority: number;
  reason: string;
  characteristicScore: number;
  characteristicName: string;
  pillar: string;
  isCompleted: boolean;
  isInProgress: boolean;
}

interface PriorityArea {
  pillar: string;
  avgScore: number;
  exerciseCount: number;
}

interface ExerciseRecommendation {
  userId: string;
  generatedAt: string;
  totalExercises: number;
  completedCount: number;
  recommendations: RecommendedExercise[];
  priorityAreas: PriorityArea[];
  nextRecommended: RecommendedExercise | null;
}

// Colori per i pillar
const PILLAR_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Vision': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Action': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  'Relations': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  'Adaptation': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' }
};

// Icone per tipo esercizio
const EXERCISE_TYPE_ICONS: Record<string, string> = {
  'riflessione': '🔍',
  'azione': '⚡',
  'sfida': '🎯',
  'analisi': '📊',
  'feedback': '💬',
  'pianificazione': '📋'
};

// Colori per difficoltà
const DIFFICULTY_COLORS: Record<string, string> = {
  'base': 'bg-green-100 text-green-800',
  'intermedio': 'bg-yellow-100 text-yellow-800',
  'avanzato': 'bg-red-100 text-red-800'
};

interface Props {
  userId: string;
  maxItems?: number;
  showPriorityAreas?: boolean;
}

export default function RecommendedExercises({
  userId,
  maxItems = 3,
  showPriorityAreas = true
}: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ExerciseRecommendation | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadRecommendations() {
      try {
        setLoading(true);

        // Ottieni token sessione
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
          setError('Sessione non valida');
          return;
        }

        const response = await fetch(`/api/recommendations?user_id=${userId}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (!response.ok) {
          throw new Error('Errore caricamento raccomandazioni');
        }

        const result = await response.json();
        setData(result);

      } catch (err) {
        console.error('Errore:', err);
        setError('Impossibile caricare le raccomandazioni');
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      loadRecommendations();
    }
  }, [userId, supabase.auth]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-100 rounded"></div>
            <div className="h-20 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="text-center text-gray-500">
          <p>{error || 'Nessuna raccomandazione disponibile'}</p>
          <Link
            href="/test"
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            Completa l&apos;assessment per ricevere raccomandazioni
          </Link>
        </div>
      </div>
    );
  }

  if (data.recommendations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="text-center text-gray-500">
          <p>Completa l&apos;assessment per ricevere raccomandazioni personalizzate.</p>
          <Link
            href="/test"
            className="mt-3 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Inizia il Test
          </Link>
        </div>
      </div>
    );
  }

  const topRecommendations = data.recommendations
    .filter(r => !r.isCompleted)
    .slice(0, maxItems);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <h3 className="text-lg font-semibold">Esercizi Consigliati per Te</h3>
        <p className="text-sm text-indigo-100 mt-1">
          {data.completedCount}/{data.totalExercises} completati
        </p>
      </div>

      {/* Priority Areas */}
      {showPriorityAreas && data.priorityAreas.length > 0 && (
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Aree Prioritarie
          </p>
          <div className="flex flex-wrap gap-2">
            {data.priorityAreas.map((area) => {
              const colors = PILLAR_COLORS[area.pillar] || PILLAR_COLORS['Vision'];
              return (
                <div
                  key={area.pillar}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${colors.bg} ${colors.text} border ${colors.border}`}
                >
                  {area.pillar}: {area.avgScore}%
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Next Recommended */}
      {data.nextRecommended && (
        <div className="px-6 py-4 border-b border-gray-100 bg-amber-50">
          <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-2">
            Prossimo Consigliato
          </p>
          <Link
            href={`/exercises/${data.nextRecommended.id}`}
            className="block group"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">
                {EXERCISE_TYPE_ICONS[data.nextRecommended.exercise_type] || '📝'}
              </span>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {data.nextRecommended.title}
                </h4>
                <p className="text-sm text-gray-600 mt-0.5">
                  {data.nextRecommended.characteristicName} ({data.nextRecommended.characteristicScore}%)
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  {data.nextRecommended.reason}
                </p>
              </div>
              <span className="text-gray-400 group-hover:text-indigo-500 transition-colors">
                →
              </span>
            </div>
          </Link>
        </div>
      )}

      {/* Recommendations List */}
      <div className="divide-y divide-gray-100">
        {topRecommendations.map((rec, index) => {
          const pillarColors = PILLAR_COLORS[rec.pillar] || PILLAR_COLORS['Vision'];

          return (
            <Link
              key={rec.id}
              href={`/exercises/${rec.id}`}
              className="block px-6 py-4 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-start gap-3">
                {/* Priority number */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${pillarColors.bg} ${pillarColors.text}`}>
                  {index + 1}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {rec.title}
                    </h4>
                    {rec.isInProgress && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        In corso
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`px-2 py-0.5 text-xs rounded ${pillarColors.bg} ${pillarColors.text}`}>
                      {rec.pillar}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded ${DIFFICULTY_COLORS[rec.difficulty_level] || 'bg-gray-100 text-gray-600'}`}>
                      {rec.difficulty_level}
                    </span>
                    <span className="text-xs text-gray-500">
                      {rec.estimated_time_minutes} min
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                    {rec.reason}
                  </p>
                </div>

                {/* Score indicator */}
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-bold text-gray-400">
                    {rec.characteristicScore}%
                  </div>
                  <div className="text-xs text-gray-400">
                    attuale
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <Link
          href="/exercises"
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center justify-center gap-1"
        >
          Vedi tutti gli esercizi
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
