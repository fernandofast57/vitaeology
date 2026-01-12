'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/components/ui/Breadcrumb';

// =====================================================
// Tipi per analisi COMPRENSIONE (3 Difficoltà)
// =====================================================

// 1. PAROLE - Termini tecnici non spiegati
interface ParoleIssue {
  term: string;
  type: 'technical_term' | 'acronym' | 'anglicism';
  severity: 'low' | 'medium' | 'high';
  alternative?: string;
  context: string;
}

interface ParoleAnalysis {
  score: number;
  passed: boolean;
  issues: ParoleIssue[];
  metrics: {
    total_technical_terms: number;
    unexplained_count: number;
    acronyms_count: number;
    anglicisms_count: number;
  };
  suggestions: string[];
}

// 2. CONCRETEZZA - Esempi concreti
interface ConcretezzaIssue {
  concept: string;
  type: 'abstract_concept' | 'missing_example' | 'vague_statement';
  severity: 'low' | 'medium' | 'high';
  examplePrompt?: string;
  context: string;
}

interface ConcretezzaAnalysis {
  score: number;
  passed: boolean;
  exampleQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'none';
  issues: ConcretezzaIssue[];
  metrics: {
    examples_count: number;
    metaphors_count: number;
    scenarios_count: number;
    abstract_concepts: number;
    example_quality_score: number;
  };
  suggestions: string[];
}

// 3. GRADUALITÀ - Sequenza logica
interface GradualityIssue {
  type: 'unexplained_term' | 'missing_example' | 'sequence_gap' | 'assumed_knowledge';
  severity: 'low' | 'medium' | 'high';
  term?: string;
  context: string;
  suggestion: string;
}

interface GradualityAnalysis {
  score: number;
  passed: boolean;
  issues: GradualityIssue[];
  metrics: {
    unexplained_terms: number;
    missing_examples: number;
    sequence_gaps: number;
    assumed_knowledge: number;
  };
  suggestions: string[];
}

// Tipi allineati con API
interface ConversationSample {
  id: string;
  conversation_id?: string;
  message_id?: string;
  user_message: string;
  ai_response: string;
  created_at: string;
  user_rating?: number | null;
  feedback_type?: string | null;
  priority_level?: number;
  session_id?: string;
  user_id?: string;
  tokens_used?: number | null;
  // Analisi COMPRENSIONE (3 difficoltà)
  parole_analysis?: ParoleAnalysis;
  concretezza_analysis?: ConcretezzaAnalysis;
  graduality_analysis?: GradualityAnalysis;
}

interface AuditRecord {
  id: string;
  conversation_id: string;
  score_validante?: number;
  score_user_agency?: number;
  score_comprensione?: number;
  score_conoscenza_operativa?: number;
  // 3 score Comprensione dettagliati
  score_parole?: number;
  score_concretezza?: number;
  score_gradualita?: number;
  score_medio: number;
  issues: string[];
  notes?: string | null;
  created_at: string;
  user_message_preview?: string;
}

interface WeeklySummary {
  total_audits: number;
  avg_score: number | null;
  excellent_count: number;
  needs_improvement_count: number;
}

// Issues predefiniti
const ISSUE_OPTIONS = [
  { id: 'troppo_lungo', label: 'Troppo lungo' },
  { id: 'manca_validazione', label: 'Manca validazione' },
  { id: 'tono_prescrittivo', label: 'Tono prescrittivo' },
  { id: 'linguaggio_complesso', label: 'Linguaggio complesso' },
  { id: 'cita_fonti', label: 'Cita fonti' },
  { id: 'off_topic', label: 'Off-topic' },
  { id: 'non_risponde', label: 'Non risponde' },
];

// Componente stelle rating
function RatingStars({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: number;
  onChange: (rating: number) => void;
}) {
  const [hoverValue, setHoverValue] = useState(0);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white">{label}</span>
        <div
          className="flex gap-0.5"
          onMouseLeave={() => setHoverValue(0)}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHoverValue(star)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={star <= (hoverValue || value) ? '#FBBF24' : '#475569'}
                className="w-6 h-6 transition-colors"
              >
                <path
                  fillRule="evenodd"
                  d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-slate-400">{description}</p>
    </div>
  );
}

// Componente badge score
function ScoreBadge({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' }) {
  const getColor = () => {
    if (score >= 4) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (score >= 3) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  const getLabel = () => {
    if (score >= 4) return 'Eccellente';
    if (score >= 3) return 'Accettabile';
    return 'Da migliorare';
  };

  return (
    <span
      className={`inline-flex items-center gap-1 border rounded-full font-medium ${getColor()} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}
    >
      <span>{score.toFixed(1)}</span>
      <span className="opacity-70">•</span>
      <span>{getLabel()}</span>
    </span>
  );
}

export default function QualityAuditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Dati
  const [samples, setSamples] = useState<ConversationSample[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recentAudits, setRecentAudits] = useState<AuditRecord[]>([]);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary>({
    total_audits: 0,
    avg_score: null,
    excellent_count: 0,
    needs_improvement_count: 0,
  });

  // Form state - nomi allineati con API (7 score totali)
  const [ratings, setRatings] = useState({
    score_validante: 0,
    score_user_agency: 0,
    score_comprensione: 0,
    score_conoscenza_operativa: 0,
    // 3 score Comprensione dettagliati
    score_parole: 0,
    score_concretezza: 0,
    score_gradualita: 0,
  });
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Calcolo score medio (7 criteri)
  const avgScore =
    Object.values(ratings).filter((r) => r > 0).length === 7
      ? Object.values(ratings).reduce((a, b) => a + b, 0) / 7
      : 0;

  // Tutti i rating compilati?
  const allRated = Object.values(ratings).every((r) => r > 0);

  // Sample corrente
  const currentSample = samples[currentIndex];

  // Carica dati
  const loadData = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/admin/quality-audit');

      if (response.status === 401) {
        router.push('/auth/login');
        return;
      }
      if (response.status === 403) {
        setError('Accesso non autorizzato. Solo admin.');
        return;
      }
      if (!response.ok) {
        throw new Error('Errore caricamento dati');
      }

      const data = await response.json();
      setSamples(data.samples || []);
      setRecentAudits(data.recentAudits || []);
      setWeeklySummary(data.summary || {
        total_audits: 0,
        avg_score: null,
        excellent_count: 0,
        needs_improvement_count: 0,
      });
      setCurrentIndex(0);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset form
  const resetForm = () => {
    setRatings({
      score_validante: 0,
      score_user_agency: 0,
      score_comprensione: 0,
      score_conoscenza_operativa: 0,
      score_parole: 0,
      score_concretezza: 0,
      score_gradualita: 0,
    });
    setSelectedIssues([]);
    setNotes('');
  };

  // Cambia campione
  const goToSample = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < samples.length) {
      setCurrentIndex(newIndex);
      resetForm();
    }
  };

  // Toggle issue
  const toggleIssue = (issueId: string) => {
    setSelectedIssues((prev) =>
      prev.includes(issueId)
        ? prev.filter((i) => i !== issueId)
        : [...prev, issueId]
    );
  };

  // Invia valutazione
  const submitAudit = async () => {
    if (!currentSample || !allRated) return;

    setSubmitting(true);
    try {
      const conversationId = currentSample.conversation_id || currentSample.id;

      const response = await fetch('/api/admin/quality-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          ...ratings,
          issues: selectedIssues,
          notes: notes.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore salvataggio audit');
      }

      const data = await response.json();

      // Aggiorna lista audit recenti
      if (data.audit) {
        const newAudit: AuditRecord = {
          id: data.audit.id,
          conversation_id: data.audit.conversation_id,
          score_validante: data.audit.score_validante,
          score_user_agency: data.audit.score_user_agency,
          score_comprensione: data.audit.score_comprensione,
          score_conoscenza_operativa: data.audit.score_conoscenza_operativa,
          // 3 score Comprensione dettagliati
          score_parole: data.audit.score_parole,
          score_concretezza: data.audit.score_concretezza,
          score_gradualita: data.audit.score_gradualita,
          score_medio: data.audit.score_medio,
          issues: data.audit.issues || [],
          notes: data.audit.notes,
          created_at: data.audit.created_at,
          user_message_preview: currentSample.ai_response?.slice(0, 60) || '',
        };
        setRecentAudits((prev) => [newAudit, ...prev.slice(0, 19)]);
      }

      // Aggiorna summary
      if (data.updatedSummary) {
        setWeeklySummary(data.updatedSummary);
      }

      // Rimuovi sample corrente e vai al prossimo
      setSamples(prev => prev.filter((_, i) => i !== currentIndex));

      // Se era l'ultimo, ricarica
      if (samples.length <= 1) {
        await loadData();
      } else if (currentIndex >= samples.length - 1) {
        setCurrentIndex(Math.max(0, currentIndex - 1));
        resetForm();
      } else {
        resetForm();
      }
    } catch (err) {
      console.error('Errore submit audit:', err);
      alert(err instanceof Error ? err.message : 'Errore salvataggio');
    } finally {
      setSubmitting(false);
    }
  };

  // Badge tipo campione basato su priority_level o feedback_type
  const getSampleTypeBadge = (sample: ConversationSample) => {
    // Priorità 1: thumbs_down
    if (sample.priority_level === 1 || sample.feedback_type === 'thumbs_down') {
      return (
        <span className="px-2 py-0.5 text-xs font-medium bg-red-500/20 text-red-400 rounded-full">
          Feedback negativo
        </span>
      );
    }
    // Priorità 2: rating basso
    if (sample.priority_level === 2 || (sample.user_rating && sample.user_rating <= 2)) {
      return (
        <span className="px-2 py-0.5 text-xs font-medium bg-amber-500/20 text-amber-400 rounded-full">
          Rating basso
        </span>
      );
    }
    // Default: random
    return (
      <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full">
        Campione random
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A2540] to-[#0d1f33] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Caricamento audit...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A2540] to-[#0d1f33] p-8">
        <div className="max-w-lg mx-auto bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/admin/ai-coach')}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Torna alla Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2540] to-[#0d1f33]">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-4 sm:px-6 lg:px-8">
        <Breadcrumb
          items={[
            { label: 'Admin', href: '/admin/ai-coach' },
            { label: 'Quality Audit' }
          ]}
          homeHref="/dashboard"
          variant="dark"
        />
      </div>
      {/* Header sticky */}
      <header className="sticky top-0 z-20 bg-[#0A2540]/95 backdrop-blur border-b border-slate-700/50 mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-400/10 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-amber-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Quality Audit</h1>
                <p className="text-sm text-slate-400">
                  Valutazione aderenza ai 4 Principi
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/admin/ai-coach"
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Dashboard AI Coach
              </a>
              <button
                onClick={loadData}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <svg
                  className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Aggiorna
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide">
              Audit Settimana
            </p>
            <p className="text-2xl font-bold text-white mt-1">
              {weeklySummary.total_audits}
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide">
              Score Medio
            </p>
            <p className="text-2xl font-bold text-amber-400 mt-1">
              {weeklySummary.avg_score !== null
                ? weeklySummary.avg_score.toFixed(2)
                : '-'}
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide">
              Eccellenti
            </p>
            <p className="text-2xl font-bold text-green-400 mt-1">
              {weeklySummary.excellent_count}
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide">
              Da Migliorare
            </p>
            <p className="text-2xl font-bold text-red-400 mt-1">
              {weeklySummary.needs_improvement_count}
            </p>
          </div>
        </div>

        {/* Grid principale */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonna principale (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {samples.length === 0 ? (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-12 h-12 text-slate-500 mx-auto mb-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                <p className="text-slate-400">
                  Nessun campione da valutare al momento
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  I campioni vengono generati automaticamente dalle conversazioni recenti
                </p>
                <button
                  onClick={loadData}
                  className="mt-4 px-4 py-2 bg-amber-400/20 text-amber-400 rounded-lg hover:bg-amber-400/30 transition-colors"
                >
                  Ricarica campioni
                </button>
              </div>
            ) : (
              <>
                {/* Navigazione campioni */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => goToSample(currentIndex - 1)}
                    disabled={currentIndex === 0}
                    className="p-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 19.5 8.25 12l7.5-7.5"
                      />
                    </svg>
                  </button>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400">
                      Campione {currentIndex + 1} di {samples.length}
                    </span>
                    {currentSample && getSampleTypeBadge(currentSample)}
                  </div>
                  <button
                    onClick={() => goToSample(currentIndex + 1)}
                    disabled={currentIndex >= samples.length - 1}
                    className="p-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m8.25 4.5 7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </button>
                </div>

                {/* Box conversazione */}
                {currentSample && (
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
                    {/* Messaggio utente */}
                    <div className="p-4 bg-slate-700/30">
                      <div className="flex items-center gap-2 mb-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4 text-slate-400"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                          />
                        </svg>
                        <span className="text-xs font-medium text-slate-400 uppercase">
                          Messaggio Utente
                        </span>
                      </div>
                      <p className="text-white text-sm whitespace-pre-wrap">
                        {currentSample.user_message}
                      </p>
                    </div>

                    {/* Risposta AI */}
                    <div className="p-4 bg-slate-800/50">
                      <div className="flex items-center gap-2 mb-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4 text-amber-400"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                          />
                        </svg>
                        <span className="text-xs font-medium text-amber-400 uppercase">
                          Risposta Fernando AI
                        </span>
                      </div>
                      <p className="text-slate-200 text-sm whitespace-pre-wrap max-h-80 overflow-y-auto">
                        {currentSample.ai_response}
                      </p>
                    </div>

                    {/* Footer stats */}
                    <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-700/50 flex items-center gap-4 text-xs text-slate-500">
                      <span>
                        {currentSample.ai_response?.split(/\s+/).length || 0} parole
                      </span>
                      <span>•</span>
                      <span>{currentSample.ai_response?.length || 0} caratteri</span>
                      <span>•</span>
                      <span>
                        {new Date(currentSample.created_at).toLocaleDateString(
                          'it-IT',
                          { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }
                        )}
                      </span>
                      {currentSample.user_rating && (
                        <>
                          <span>•</span>
                          <span className="text-amber-400">
                            Rating: {currentSample.user_rating}/5
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* ===================================== */}
                {/* ANALISI COMPRENSIONE (3 Difficoltà) */}
                {/* ===================================== */}

                {/* 1. Analisi PAROLE Automatica */}
                {currentSample?.parole_analysis && (
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <span className="text-lg">📖</span>
                        Analisi PAROLE Automatica
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        currentSample.parole_analysis.passed
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {currentSample.parole_analysis.score}/100
                      </span>
                    </div>

                    {/* Metriche PAROLE */}
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="bg-slate-900/50 rounded p-2 text-center">
                        <div className="font-bold text-slate-300">
                          {currentSample.parole_analysis.metrics.total_technical_terms}
                        </div>
                        <div className="text-slate-500">Tecnici</div>
                      </div>
                      <div className="bg-slate-900/50 rounded p-2 text-center">
                        <div className={`font-bold ${currentSample.parole_analysis.metrics.unexplained_count > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {currentSample.parole_analysis.metrics.unexplained_count}
                        </div>
                        <div className="text-slate-500">Non spiegati</div>
                      </div>
                      <div className="bg-slate-900/50 rounded p-2 text-center">
                        <div className={`font-bold ${currentSample.parole_analysis.metrics.acronyms_count > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                          {currentSample.parole_analysis.metrics.acronyms_count}
                        </div>
                        <div className="text-slate-500">Acronimi</div>
                      </div>
                      <div className="bg-slate-900/50 rounded p-2 text-center">
                        <div className={`font-bold ${currentSample.parole_analysis.metrics.anglicisms_count > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                          {currentSample.parole_analysis.metrics.anglicisms_count}
                        </div>
                        <div className="text-slate-500">Anglicismi</div>
                      </div>
                    </div>

                    {/* Issues PAROLE */}
                    {currentSample.parole_analysis.issues.length > 0 && (
                      <div className="space-y-1">
                        {currentSample.parole_analysis.issues.slice(0, 3).map((issue, idx) => (
                          <div key={idx} className={`text-xs p-2 rounded ${
                            issue.severity === 'high' ? 'bg-red-500/10 text-red-300' :
                            issue.severity === 'medium' ? 'bg-amber-500/10 text-amber-300' :
                            'bg-blue-500/10 text-blue-300'
                          }`}>
                            <span className="font-medium">{issue.term}: </span>
                            {issue.alternative ? `Usa "${issue.alternative}" invece` : `Termine ${issue.type} non spiegato`}
                          </div>
                        ))}
                        {currentSample.parole_analysis.issues.length > 3 && (
                          <div className="text-xs text-slate-500 text-center">
                            + {currentSample.parole_analysis.issues.length - 3} altri termini
                          </div>
                        )}
                      </div>
                    )}

                    {/* Suggerimento rating PAROLE */}
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span>💡</span>
                      <span>
                        Suggerimento rating Parole: <strong className="text-white">
                          {Math.max(1, Math.round(currentSample.parole_analysis.score / 20))}
                        </strong>/5
                      </span>
                      <button
                        onClick={() => setRatings(r => ({
                          ...r,
                          score_parole: Math.max(1, Math.round(currentSample.parole_analysis!.score / 20))
                        }))}
                        className="text-amber-400 hover:text-amber-300 underline"
                      >
                        Applica
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Analisi CONCRETEZZA Automatica */}
                {currentSample?.concretezza_analysis && (
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <span className="text-lg">🎯</span>
                        Analisi CONCRETEZZA Automatica
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                          currentSample.concretezza_analysis.exampleQuality === 'excellent' ? 'bg-green-500/20 text-green-400' :
                          currentSample.concretezza_analysis.exampleQuality === 'good' ? 'bg-emerald-500/20 text-emerald-400' :
                          currentSample.concretezza_analysis.exampleQuality === 'fair' ? 'bg-amber-500/20 text-amber-400' :
                          currentSample.concretezza_analysis.exampleQuality === 'poor' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {currentSample.concretezza_analysis.exampleQuality}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          currentSample.concretezza_analysis.passed
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {currentSample.concretezza_analysis.score}/100
                        </span>
                      </div>
                    </div>

                    {/* Metriche CONCRETEZZA */}
                    <div className="grid grid-cols-5 gap-2 text-xs">
                      <div className="bg-slate-900/50 rounded p-2 text-center">
                        <div className={`font-bold ${currentSample.concretezza_analysis.metrics.examples_count > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {currentSample.concretezza_analysis.metrics.examples_count}
                        </div>
                        <div className="text-slate-500">Esempi</div>
                      </div>
                      <div className="bg-slate-900/50 rounded p-2 text-center">
                        <div className={`font-bold ${currentSample.concretezza_analysis.metrics.metaphors_count > 0 ? 'text-green-400' : 'text-slate-400'}`}>
                          {currentSample.concretezza_analysis.metrics.metaphors_count}
                        </div>
                        <div className="text-slate-500">Metafore</div>
                      </div>
                      <div className="bg-slate-900/50 rounded p-2 text-center">
                        <div className={`font-bold ${currentSample.concretezza_analysis.metrics.scenarios_count > 0 ? 'text-green-400' : 'text-slate-400'}`}>
                          {currentSample.concretezza_analysis.metrics.scenarios_count}
                        </div>
                        <div className="text-slate-500">Scenari</div>
                      </div>
                      <div className="bg-slate-900/50 rounded p-2 text-center">
                        <div className={`font-bold ${currentSample.concretezza_analysis.metrics.abstract_concepts > 2 ? 'text-amber-400' : 'text-green-400'}`}>
                          {currentSample.concretezza_analysis.metrics.abstract_concepts}
                        </div>
                        <div className="text-slate-500">Astratti</div>
                      </div>
                      <div className="bg-slate-900/50 rounded p-2 text-center">
                        <div className={`font-bold ${currentSample.concretezza_analysis.metrics.example_quality_score >= 0.7 ? 'text-green-400' : 'text-amber-400'}`}>
                          {Math.round(currentSample.concretezza_analysis.metrics.example_quality_score * 100)}%
                        </div>
                        <div className="text-slate-500">Qualità</div>
                      </div>
                    </div>

                    {/* Issues CONCRETEZZA */}
                    {currentSample.concretezza_analysis.issues.length > 0 && (
                      <div className="space-y-1">
                        {currentSample.concretezza_analysis.issues.slice(0, 3).map((issue, idx) => (
                          <div key={idx} className={`text-xs p-2 rounded ${
                            issue.severity === 'high' ? 'bg-red-500/10 text-red-300' :
                            issue.severity === 'medium' ? 'bg-amber-500/10 text-amber-300' :
                            'bg-blue-500/10 text-blue-300'
                          }`}>
                            <span className="font-medium">{issue.concept}: </span>
                            {issue.examplePrompt || 'Aggiungi un esempio concreto'}
                          </div>
                        ))}
                        {currentSample.concretezza_analysis.issues.length > 3 && (
                          <div className="text-xs text-slate-500 text-center">
                            + {currentSample.concretezza_analysis.issues.length - 3} altri concetti
                          </div>
                        )}
                      </div>
                    )}

                    {/* Suggerimento rating CONCRETEZZA */}
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span>💡</span>
                      <span>
                        Suggerimento rating Concretezza: <strong className="text-white">
                          {Math.max(1, Math.round(currentSample.concretezza_analysis.score / 20))}
                        </strong>/5
                      </span>
                      <button
                        onClick={() => setRatings(r => ({
                          ...r,
                          score_concretezza: Math.max(1, Math.round(currentSample.concretezza_analysis!.score / 20))
                        }))}
                        className="text-amber-400 hover:text-amber-300 underline"
                      >
                        Applica
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. Analisi GRADUALITÀ Automatica */}
                {currentSample?.graduality_analysis && (
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <span className="text-lg">📊</span>
                        Analisi Gradualità Automatica
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        currentSample.graduality_analysis.passed
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {currentSample.graduality_analysis.score}/100
                      </span>
                    </div>

                    {/* Metriche */}
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="bg-slate-900/50 rounded p-2 text-center">
                        <div className={`font-bold ${currentSample.graduality_analysis.metrics.unexplained_terms > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {currentSample.graduality_analysis.metrics.unexplained_terms}
                        </div>
                        <div className="text-slate-500">Termini</div>
                      </div>
                      <div className="bg-slate-900/50 rounded p-2 text-center">
                        <div className={`font-bold ${currentSample.graduality_analysis.metrics.missing_examples > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                          {currentSample.graduality_analysis.metrics.missing_examples}
                        </div>
                        <div className="text-slate-500">Esempi</div>
                      </div>
                      <div className="bg-slate-900/50 rounded p-2 text-center">
                        <div className={`font-bold ${currentSample.graduality_analysis.metrics.sequence_gaps > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {currentSample.graduality_analysis.metrics.sequence_gaps}
                        </div>
                        <div className="text-slate-500">Sequenza</div>
                      </div>
                      <div className="bg-slate-900/50 rounded p-2 text-center">
                        <div className={`font-bold ${currentSample.graduality_analysis.metrics.assumed_knowledge > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                          {currentSample.graduality_analysis.metrics.assumed_knowledge}
                        </div>
                        <div className="text-slate-500">Assunti</div>
                      </div>
                    </div>

                    {/* Issues */}
                    {currentSample.graduality_analysis.issues.length > 0 && (
                      <div className="space-y-1">
                        {currentSample.graduality_analysis.issues.slice(0, 3).map((issue, idx) => (
                          <div key={idx} className={`text-xs p-2 rounded ${
                            issue.severity === 'high' ? 'bg-red-500/10 text-red-300' :
                            issue.severity === 'medium' ? 'bg-amber-500/10 text-amber-300' :
                            'bg-blue-500/10 text-blue-300'
                          }`}>
                            <span className="font-medium">{issue.term || issue.type}: </span>
                            {issue.suggestion}
                          </div>
                        ))}
                        {currentSample.graduality_analysis.issues.length > 3 && (
                          <div className="text-xs text-slate-500 text-center">
                            + {currentSample.graduality_analysis.issues.length - 3} altri problemi
                          </div>
                        )}
                      </div>
                    )}

                    {/* Suggerimento auto per rating */}
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span>💡</span>
                      <span>
                        Suggerimento rating Gradualità: <strong className="text-white">
                          {Math.max(1, Math.round(currentSample.graduality_analysis.score / 20))}
                        </strong>/5
                      </span>
                      <button
                        onClick={() => setRatings(r => ({
                          ...r,
                          score_gradualita: Math.max(1, Math.round(currentSample.graduality_analysis!.score / 20))
                        }))}
                        className="text-amber-400 hover:text-amber-300 underline"
                      >
                        Applica
                      </button>
                    </div>
                  </div>
                )}

                {/* Form valutazione */}
                {currentSample && (
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-white">
                      Valutazione
                    </h3>

                    {/* Rating stars per ogni principio */}
                    <div className="space-y-4">
                      {/* 4 Principi base */}
                      <RatingStars
                        label="Principio Validante"
                        description="Riconosce risorse esistenti? Evita diagnosi deficit?"
                        value={ratings.score_validante}
                        onChange={(v) =>
                          setRatings((r) => ({ ...r, score_validante: v }))
                        }
                      />
                      <RatingStars
                        label="User Agency"
                        description="Utente resta agente? AI facilita senza prescrivere?"
                        value={ratings.score_user_agency}
                        onChange={(v) =>
                          setRatings((r) => ({ ...r, score_user_agency: v }))
                        }
                      />
                      <RatingStars
                        label="Comprensione (generale)"
                        description="Linguaggio semplice? Accessibile? Non accademico?"
                        value={ratings.score_comprensione}
                        onChange={(v) =>
                          setRatings((r) => ({ ...r, score_comprensione: v }))
                        }
                      />
                      <RatingStars
                        label="Conoscenza Operativa"
                        description="Usa ciò che sa senza citare fonti? Applica naturalmente?"
                        value={ratings.score_conoscenza_operativa}
                        onChange={(v) =>
                          setRatings((r) => ({ ...r, score_conoscenza_operativa: v }))
                        }
                      />

                      {/* Separatore 3 Difficoltà Comprensione */}
                      <div className="border-t border-slate-700/50 pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs text-slate-500 uppercase tracking-wide">
                            3 Difficoltà Comprensione
                          </p>
                          {/* Applica tutti button */}
                          {currentSample?.parole_analysis && currentSample?.concretezza_analysis && currentSample?.graduality_analysis && (
                            <button
                              onClick={() => setRatings(r => ({
                                ...r,
                                score_parole: Math.max(1, Math.round(currentSample.parole_analysis!.score / 20)),
                                score_concretezza: Math.max(1, Math.round(currentSample.concretezza_analysis!.score / 20)),
                                score_gradualita: Math.max(1, Math.round(currentSample.graduality_analysis!.score / 20)),
                              }))}
                              className="text-xs px-2 py-1 bg-amber-400/20 text-amber-400 hover:bg-amber-400/30 rounded transition-colors"
                            >
                              Applica tutti i suggerimenti
                            </button>
                          )}
                        </div>
                      </div>

                      <RatingStars
                        label="📖 Parole"
                        description="Termini tecnici spiegati? Acronimi espansi? No anglicismi inutili?"
                        value={ratings.score_parole}
                        onChange={(v) =>
                          setRatings((r) => ({ ...r, score_parole: v }))
                        }
                      />
                      <RatingStars
                        label="🎯 Concretezza"
                        description="Esempi concreti? Metafore? Scenari dalla vita reale?"
                        value={ratings.score_concretezza}
                        onChange={(v) =>
                          setRatings((r) => ({ ...r, score_concretezza: v }))
                        }
                      />
                      <RatingStars
                        label="📊 Gradualità"
                        description="Sequenza logica? Spiega prima di usare? Costruisce passo dopo passo?"
                        value={ratings.score_gradualita}
                        onChange={(v) =>
                          setRatings((r) => ({ ...r, score_gradualita: v }))
                        }
                      />
                    </div>

                    {/* Score preview */}
                    {allRated && (
                      <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                        <span className="text-sm text-slate-400">
                          Score complessivo:
                        </span>
                        <ScoreBadge score={avgScore} />
                      </div>
                    )}

                    {/* Issues chips */}
                    <div>
                      <p className="text-sm text-slate-400 mb-2">
                        Problemi riscontrati (opzionale):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {ISSUE_OPTIONS.map((issue) => (
                          <button
                            key={issue.id}
                            type="button"
                            onClick={() => toggleIssue(issue.id)}
                            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                              selectedIssues.includes(issue.id)
                                ? 'bg-amber-400/20 border-amber-400/50 text-amber-400'
                                : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:border-slate-500'
                            }`}
                          >
                            {issue.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Note */}
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">
                        Note aggiuntive (opzionale):
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Osservazioni specifiche sulla risposta..."
                        rows={3}
                        className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400/50 resize-none"
                      />
                    </div>

                    {/* Submit button */}
                    <button
                      onClick={submitAudit}
                      disabled={!allRated || submitting}
                      className="w-full py-3 bg-amber-400 hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-500 text-[#0A2540] font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Salvataggio...' : 'Salva Valutazione'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar (1/3) */}
          <div className="space-y-6">
            {/* Audit recenti */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-700/50">
                <h3 className="font-semibold text-white">Audit Recenti</h3>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {recentAudits.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-sm">
                    Nessun audit completato
                  </div>
                ) : (
                  <div className="divide-y divide-slate-700/50">
                    {recentAudits.map((audit) => (
                      <div key={audit.id} className="p-3 hover:bg-slate-700/20">
                        <div className="flex items-center justify-between mb-2">
                          <ScoreBadge score={audit.score_medio} size="sm" />
                          <span className="text-xs text-slate-500">
                            {new Date(audit.created_at).toLocaleDateString(
                              'it-IT',
                              { day: '2-digit', month: 'short' }
                            )}
                          </span>
                        </div>
                        {audit.user_message_preview && (
                          <p className="text-sm text-slate-300 line-clamp-2 mb-2">
                            {audit.user_message_preview}...
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
                          <span title="Validante" className="px-1 bg-slate-900/50 rounded">
                            V:{audit.score_validante || '-'}
                          </span>
                          <span title="Agency" className="px-1 bg-slate-900/50 rounded">
                            A:{audit.score_user_agency || '-'}
                          </span>
                          <span title="Comprensione" className="px-1 bg-slate-900/50 rounded">
                            C:{audit.score_comprensione || '-'}
                          </span>
                          <span title="Operativa" className="px-1 bg-slate-900/50 rounded">
                            O:{audit.score_conoscenza_operativa || '-'}
                          </span>
                          {/* 3 Comprensione */}
                          <span title="Parole" className="px-1 bg-blue-900/30 rounded text-blue-400">
                            P:{audit.score_parole || '-'}
                          </span>
                          <span title="Concretezza" className="px-1 bg-emerald-900/30 rounded text-emerald-400">
                            Co:{audit.score_concretezza || '-'}
                          </span>
                          <span title="Gradualità" className="px-1 bg-violet-900/30 rounded text-violet-400">
                            G:{audit.score_gradualita || '-'}
                          </span>
                        </div>
                        {audit.issues && audit.issues.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {audit.issues.slice(0, 3).map((issue) => (
                              <span
                                key={issue}
                                className="px-1.5 py-0.5 text-[10px] bg-slate-700/50 text-slate-400 rounded"
                              >
                                {ISSUE_OPTIONS.find(o => o.id === issue)?.label || issue}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Guida valutazione */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <h3 className="font-semibold text-white mb-3">
                Guida Valutazione (7 Score)
              </h3>
              <div className="space-y-3 text-sm">
                {/* 4 Principi Base */}
                <div>
                  <p className="text-amber-400 font-medium">
                    Principio Validante
                  </p>
                  <p className="text-slate-400 text-xs">
                    L&apos;AI riconosce le risorse già presenti nell&apos;utente? Evita di
                    evidenziare mancanze o deficit?
                  </p>
                </div>
                <div>
                  <p className="text-amber-400 font-medium">User Agency</p>
                  <p className="text-slate-400 text-xs">
                    L&apos;utente mantiene il controllo? L&apos;AI facilita invece di
                    prescrivere soluzioni?
                  </p>
                </div>
                <div>
                  <p className="text-amber-400 font-medium">Comprensione (gen.)</p>
                  <p className="text-slate-400 text-xs">
                    Linguaggio accessibile? Niente gergo accademico?
                  </p>
                </div>
                <div>
                  <p className="text-amber-400 font-medium">
                    Conoscenza Operativa
                  </p>
                  <p className="text-slate-400 text-xs">
                    Applica la conoscenza senza citare fonti o teorie? Integra
                    naturalmente?
                  </p>
                </div>

                {/* 3 Difficoltà Comprensione */}
                <div className="border-t border-slate-700/50 pt-3">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">
                    3 Difficoltà Comprensione
                  </p>
                </div>
                <div>
                  <p className="text-blue-400 font-medium">📖 Parole</p>
                  <p className="text-slate-400 text-xs">
                    Termini tecnici spiegati prima dell&apos;uso? Acronimi espansi?
                    Evita anglicismi inutili?
                  </p>
                </div>
                <div>
                  <p className="text-emerald-400 font-medium">🎯 Concretezza</p>
                  <p className="text-slate-400 text-xs">
                    Esempi dalla vita reale? Metafore? Scenari concreti?
                  </p>
                </div>
                <div>
                  <p className="text-violet-400 font-medium">📊 Gradualità</p>
                  <p className="text-slate-400 text-xs">
                    Sequenza logica? Spiega prima, usa dopo? Costruisce passo passo?
                  </p>
                </div>
              </div>

              {/* Scala punteggi */}
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <p className="text-xs font-medium text-white mb-2">Scala punteggi:</p>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-green-500/20 rounded" />
                    <span className="text-green-400">5</span>
                    <span className="text-slate-400">Eccellente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-green-500/10 rounded" />
                    <span className="text-green-400/70">4</span>
                    <span className="text-slate-400">Buono</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-amber-500/20 rounded" />
                    <span className="text-amber-400">3</span>
                    <span className="text-slate-400">Accettabile</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-red-500/10 rounded" />
                    <span className="text-red-400/70">2</span>
                    <span className="text-slate-400">Insufficiente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-red-500/20 rounded" />
                    <span className="text-red-400">1</span>
                    <span className="text-slate-400">Critico</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
