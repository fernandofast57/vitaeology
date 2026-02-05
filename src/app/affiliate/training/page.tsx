// ============================================================================
// PAGE: /affiliate/training
// Descrizione: Percorso 6 fasi per diventare Super Affiliate
// Auth: Richiede autenticazione + status affiliato
// ============================================================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  TRAINING_PHASES,
  getTotalDuration,
  getTotalExercises,
  getTotalChecklist,
  type TrainingPhase,
} from '@/lib/affiliate/training-content';

// Local storage key for progress
const PROGRESS_KEY = 'vitaeology_affiliate_training_progress';

interface ProgressData {
  completedPhases: number[];
  checkedItems: Record<string, boolean>;
  lastVisited: number;
}

export default function AffiliateTrainingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [expandedPhase, setExpandedPhase] = useState<number | null>(1);
  const [progress, setProgress] = useState<ProgressData>({
    completedPhases: [],
    checkedItems: {},
    lastVisited: 1,
  });

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(PROGRESS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProgress(parsed);
        setExpandedPhase(parsed.lastVisited || 1);
      } catch (e) {
        console.error('Error loading progress:', e);
      }
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = useCallback((newProgress: ProgressData) => {
    setProgress(newProgress);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress));
  }, []);

  // Check authentication
  const checkAuth = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login?redirect=/affiliate/training');
        return;
      }

      const res = await fetch('/api/affiliate/stats');
      if (!res.ok && res.status === 404) {
        router.push('/affiliate');
        return;
      }
    } catch (err) {
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Toggle checklist item
  function toggleCheckItem(phaseNum: number, index: number) {
    const key = `phase_${phaseNum}_item_${index}`;
    const newCheckedItems = { ...progress.checkedItems, [key]: !progress.checkedItems[key] };

    // Check if all items in phase are completed
    const phase = TRAINING_PHASES.find(p => p.fase === phaseNum);
    if (phase) {
      const allChecked = phase.checklist.every((_, i) =>
        newCheckedItems[`phase_${phaseNum}_item_${i}`]
      );

      let newCompletedPhases = progress.completedPhases;
      if (allChecked && !progress.completedPhases.includes(phaseNum)) {
        newCompletedPhases = [...progress.completedPhases, phaseNum];
      } else if (!allChecked && progress.completedPhases.includes(phaseNum)) {
        newCompletedPhases = progress.completedPhases.filter(p => p !== phaseNum);
      }

      saveProgress({
        ...progress,
        checkedItems: newCheckedItems,
        completedPhases: newCompletedPhases,
      });
    }
  }

  // Expand phase and save as last visited
  function handleExpandPhase(phaseNum: number) {
    setExpandedPhase(expandedPhase === phaseNum ? null : phaseNum);
    saveProgress({ ...progress, lastVisited: phaseNum });
  }

  // Calculate overall progress
  const completedCount = progress.completedPhases.length;
  const progressPercent = Math.round((completedCount / TRAINING_PHASES.length) * 100);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-petrol-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-display font-bold text-petrol-600">
                Training Super Affiliate
              </h1>
              <p className="text-gray-600 text-sm">
                Il percorso in 6 fasi per massimizzare i tuoi risultati
              </p>
            </div>
            <Link
              href="/affiliate/dashboard"
              className="text-petrol-600 hover:text-petrol-700 text-sm font-medium"
            >
              &larr; Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Overview */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="font-semibold text-petrol-600 mb-1">Il tuo progresso</h2>
              <p className="text-sm text-gray-500">
                {completedCount} di {TRAINING_PHASES.length} fasi completate
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>⏱️ {getTotalDuration()}</span>
              <span>📝 {getTotalExercises()} esercizi</span>
              <span>✓ {getTotalChecklist()} checkpoint</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-petrol-500 to-petrol-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2">
              {TRAINING_PHASES.map((phase) => (
                <div
                  key={phase.fase}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition ${
                    progress.completedPhases.includes(phase.fase)
                      ? 'bg-green-500 text-white'
                      : expandedPhase === phase.fase
                      ? 'bg-petrol-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {progress.completedPhases.includes(phase.fase) ? '✓' : phase.fase}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Phases */}
        <div className="space-y-4">
          {TRAINING_PHASES.map((phase) => (
            <PhaseCard
              key={phase.fase}
              phase={phase}
              isExpanded={expandedPhase === phase.fase}
              isCompleted={progress.completedPhases.includes(phase.fase)}
              checkedItems={progress.checkedItems}
              onToggle={() => handleExpandPhase(phase.fase)}
              onCheckItem={(index) => toggleCheckItem(phase.fase, index)}
            />
          ))}
        </div>

        {/* Completion Message */}
        {completedCount === TRAINING_PHASES.length && (
          <div className="mt-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white text-center">
            <span className="text-4xl mb-3 block">🎉</span>
            <h3 className="text-xl font-bold mb-2">Congratulazioni!</h3>
            <p className="mb-4">Hai completato il training Super Affiliate!</p>
            <p className="text-sm text-green-100">
              Ora sei pronto per massimizzare i tuoi risultati. Ricorda: la costanza vince sempre.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

// Phase Card Component
function PhaseCard({
  phase,
  isExpanded,
  isCompleted,
  checkedItems,
  onToggle,
  onCheckItem,
}: {
  phase: TrainingPhase;
  isExpanded: boolean;
  isCompleted: boolean;
  checkedItems: Record<string, boolean>;
  onToggle: () => void;
  onCheckItem: (index: number) => void;
}) {
  const [activeTab, setActiveTab] = useState<'contenuto' | 'esercizi' | 'checklist'>('contenuto');

  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden border-2 transition ${
      isCompleted ? 'border-green-200' : isExpanded ? 'border-petrol-200' : 'border-transparent'
    }`}>
      {/* Header - Always visible */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-4">
          <span className="text-3xl">{phase.icona}</span>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-petrol-600 bg-petrol-50 px-2 py-0.5 rounded">
                Fase {phase.fase}
              </span>
              {isCompleted && (
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
                  ✓ Completata
                </span>
              )}
            </div>
            <h3 className="font-semibold text-gray-800 mt-1">{phase.titolo}</h3>
            <p className="text-sm text-gray-500">{phase.sottotitolo}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{phase.durata}</span>
          <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 px-6">
            <button
              onClick={() => setActiveTab('contenuto')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === 'contenuto'
                  ? 'border-petrol-600 text-petrol-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Contenuto
            </button>
            <button
              onClick={() => setActiveTab('esercizi')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === 'esercizi'
                  ? 'border-petrol-600 text-petrol-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Esercizi ({phase.esercizi.length})
            </button>
            <button
              onClick={() => setActiveTab('checklist')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === 'checklist'
                  ? 'border-petrol-600 text-petrol-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Checklist ({phase.checklist.length})
            </button>
          </div>

          <div className="p-6">
            {/* Contenuto Tab */}
            {activeTab === 'contenuto' && (
              <div className="space-y-6">
                {/* Descrizione */}
                <div>
                  <p className="text-gray-700">{phase.descrizione}</p>
                </div>

                {/* Perché */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-medium text-amber-800 mb-1">Perché è importante</h4>
                  <p className="text-sm text-amber-700">{phase.perche}</p>
                </div>

                {/* Contenuto principale */}
                <div className="prose prose-sm max-w-none prose-headings:text-petrol-700 prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-gray-800">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: phase.contenuto
                        .replace(/^## /gm, '<h2>')
                        .replace(/^### /gm, '<h3>')
                        .replace(/\n\n/g, '</p><p>')
                        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n- /g, '</li><li>')
                        .replace(/<li>/g, '<ul><li>')
                        .replace(/<\/li>(?!<li>)/g, '</li></ul>')
                        .replace(/\|([^|]+)\|([^|]+)\|/g, '<tr><td>$1</td><td>$2</td></tr>')
                    }}
                  />
                </div>

                {/* Errori comuni */}
                {phase.erroriComuni.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-800 mb-2">Errori comuni da evitare</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {phase.erroriComuni.map((errore, i) => (
                        <li key={i}>• {errore}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Risorse */}
                {phase.risorse.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Risorse utili</h4>
                    <div className="flex flex-wrap gap-2">
                      {phase.risorse.map((risorsa, i) => (
                        risorsa.url ? (
                          <Link
                            key={i}
                            href={risorsa.url}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-petrol-50 text-petrol-700 rounded-lg text-sm hover:bg-petrol-100 transition"
                          >
                            {risorsa.tipo === 'link' && '🔗'}
                            {risorsa.tipo === 'download' && '📥'}
                            {risorsa.tipo === 'video' && '🎬'}
                            {risorsa.titolo}
                          </Link>
                        ) : (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-sm"
                          >
                            {risorsa.titolo} (coming soon)
                          </span>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Esercizi Tab */}
            {activeTab === 'esercizi' && (
              <div className="space-y-4">
                {phase.esercizi.map((esercizio, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-2">
                      {i + 1}. {esercizio.titolo}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">{esercizio.descrizione}</p>
                    <div className="bg-gray-50 rounded p-3">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Deliverable</span>
                      <p className="text-sm text-gray-700 mt-1">{esercizio.deliverable}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Checklist Tab */}
            {activeTab === 'checklist' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-500 mb-4">
                  Spunta ogni punto quando lo hai completato. Il progresso viene salvato automaticamente.
                </p>
                {phase.checklist.map((item, i) => {
                  const key = `phase_${phase.fase}_item_${i}`;
                  const isChecked = checkedItems[key] || false;

                  return (
                    <label
                      key={i}
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition ${
                        isChecked ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onCheckItem(i)}
                        className="mt-0.5 w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className={`text-sm ${isChecked ? 'text-green-700 line-through' : 'text-gray-700'}`}>
                        {item}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
