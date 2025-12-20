'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Types
interface CorrectionSuggestion {
  pattern_id: string;
  pattern_name: string;
  pattern_type: string;
  correction_type: 'prompt_adjustment' | 'add_rag_chunk' | 'flag_for_review';
  description: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  based_on: {
    detections: number;
    confirmed: number;
    false_positive_rate: number;
  };
}

interface Correction {
  id: string;
  pattern_id: string | null;
  pattern_name: string | null;
  pattern_type: string | null;
  correction_type: string;
  description: string;
  content: string;
  effectiveness_score: number | null;
  status: string;
  applied_count: number;
  created_at: string;
}

interface Stats {
  active_corrections: number;
  pending_corrections: number;
  total_suggestions: number;
  avg_effectiveness: number;
}

// Badge componenti
function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    low: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium border rounded-full ${colors[priority] || colors.low}`}>
      {priority.toUpperCase()}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    approved: 'bg-green-500/20 text-green-400',
    auto_applied: 'bg-blue-500/20 text-blue-400',
    pending: 'bg-amber-500/20 text-amber-400',
    rejected: 'bg-red-500/20 text-red-400',
  };

  const labels: Record<string, string> = {
    approved: 'Approvata',
    auto_applied: 'Auto-applicata',
    pending: 'In attesa',
    rejected: 'Rifiutata',
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors[status] || 'bg-slate-500/20 text-slate-400'}`}>
      {labels[status] || status}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const config: Record<string, { label: string; color: string }> = {
    prompt_adjustment: { label: 'Prompt', color: 'bg-purple-500/20 text-purple-400' },
    add_rag_chunk: { label: 'RAG', color: 'bg-cyan-500/20 text-cyan-400' },
    flag_for_review: { label: 'Review', color: 'bg-slate-500/20 text-slate-400' },
  };

  const c = config[type] || { label: type, color: 'bg-slate-500/20 text-slate-400' };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${c.color}`}>
      {c.label}
    </span>
  );
}

// Card suggerimento
function SuggestionCard({
  suggestion,
  onApply,
  loading,
}: {
  suggestion: CorrectionSuggestion;
  onApply: (suggestion: CorrectionSuggestion, autoApply: boolean) => void;
  loading: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <PriorityBadge priority={suggestion.priority} />
            <TypeBadge type={suggestion.correction_type} />
            <span className="text-xs text-slate-500">
              {Math.round(suggestion.confidence * 100)}% confidence
            </span>
          </div>
          <h3 className="font-medium text-white mb-1">{suggestion.pattern_name}</h3>
          <p className="text-sm text-slate-400">{suggestion.description}</p>

          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
            <span>{suggestion.based_on.detections} rilevazioni</span>
            <span>{suggestion.based_on.confirmed} confermate</span>
            <span>{Math.round(suggestion.based_on.false_positive_rate * 100)}% FP</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => onApply(suggestion, false)}
            disabled={loading}
            className="px-3 py-1.5 text-sm bg-amber-400/20 text-amber-400 rounded-lg hover:bg-amber-400/30 transition-colors disabled:opacity-50"
          >
            Applica
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-slate-400 hover:text-white"
          >
            {expanded ? 'Nascondi' : 'Mostra'} contenuto
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 p-3 bg-slate-900/50 rounded-lg">
          <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono">
            {suggestion.content}
          </pre>
        </div>
      )}
    </div>
  );
}

// Card correzione attiva
function CorrectionCard({
  correction,
  onApprove,
  onReject,
  onDelete,
  loading,
}: {
  correction: Correction;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  loading: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <StatusBadge status={correction.status} />
            <TypeBadge type={correction.correction_type} />
            {correction.effectiveness_score !== null && (
              <span className="text-xs text-green-400">
                {correction.effectiveness_score}% efficacia
              </span>
            )}
          </div>

          <h3 className="font-medium text-white mb-1">
            {correction.pattern_name || 'Correzione manuale'}
          </h3>
          <p className="text-sm text-slate-400">{correction.description}</p>

          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
            <span>Applicata {correction.applied_count}x</span>
            <span>
              Creata {new Date(correction.created_at).toLocaleDateString('it-IT')}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {correction.status === 'pending' && (
            <>
              <button
                onClick={() => onApprove(correction.id)}
                disabled={loading}
                className="px-3 py-1.5 text-sm bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
              >
                Approva
              </button>
              <button
                onClick={() => onReject(correction.id)}
                disabled={loading}
                className="px-3 py-1.5 text-sm bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
              >
                Rifiuta
              </button>
            </>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-slate-400 hover:text-white"
          >
            {expanded ? 'Nascondi' : 'Mostra'}
          </button>
          <button
            onClick={() => onDelete(correction.id)}
            disabled={loading}
            className="text-xs text-red-400 hover:text-red-300"
          >
            Elimina
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 p-3 bg-slate-900/50 rounded-lg">
          <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono">
            {correction.content}
          </pre>
        </div>
      )}
    </div>
  );
}

// Main page
export default function CorrectionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [suggestions, setSuggestions] = useState<CorrectionSuggestion[]>([]);
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [stats, setStats] = useState<Stats>({
    active_corrections: 0,
    pending_corrections: 0,
    total_suggestions: 0,
    avg_effectiveness: 0,
  });

  const [activeTab, setActiveTab] = useState<'suggestions' | 'active' | 'pending' | 'all'>('suggestions');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/corrections');

      if (response.status === 401) {
        router.push('/auth/login');
        return;
      }
      if (response.status === 403) {
        setError('Accesso non autorizzato');
        return;
      }
      if (!response.ok) throw new Error('Errore caricamento dati');

      const data = await response.json();
      setSuggestions(data.suggestions || []);
      setCorrections(data.corrections || []);
      setStats(data.stats || {
        active_corrections: 0,
        pending_corrections: 0,
        total_suggestions: 0,
        avg_effectiveness: 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const applySuggestion = async (suggestion: CorrectionSuggestion, autoApply: boolean) => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/corrections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'apply_suggestion',
          suggestion,
          auto_apply: autoApply,
        }),
      });

      if (!response.ok) throw new Error('Errore applicazione');

      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Errore');
    } finally {
      setActionLoading(false);
    }
  };

  const approveCorrection = async (id: string) => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/corrections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', correction_id: id }),
      });

      if (!response.ok) throw new Error('Errore approvazione');
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Errore');
    } finally {
      setActionLoading(false);
    }
  };

  const rejectCorrection = async (id: string) => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/corrections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', correction_id: id }),
      });

      if (!response.ok) throw new Error('Errore rifiuto');
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Errore');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteCorrection = async (id: string) => {
    if (!confirm('Eliminare questa correzione?')) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/corrections?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Errore eliminazione');
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Errore');
    } finally {
      setActionLoading(false);
    }
  };

  const applyAllHighPriority = async () => {
    if (!confirm('Applicare tutti i suggerimenti ad alta priorità?')) return;

    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/corrections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'apply_all_high_priority' }),
      });

      if (!response.ok) throw new Error('Errore applicazione');

      const data = await response.json();
      alert(`Applicati ${data.applied} suggerimenti`);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Errore');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtra correzioni per tab
  const filteredCorrections = corrections.filter(c => {
    if (activeTab === 'active') return c.status === 'approved' || c.status === 'auto_applied';
    if (activeTab === 'pending') return c.status === 'pending';
    if (activeTab === 'all') return true;
    return false;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A2540] to-[#0d1f33] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Caricamento correzioni...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A2540] to-[#0d1f33] p-8">
        <div className="max-w-lg mx-auto bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2540] to-[#0d1f33]">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0A2540]/95 backdrop-blur border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-400/10 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-purple-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Ottimizzazione AI</h1>
                <p className="text-sm text-slate-400">Gestione correzioni automatiche</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a href="/admin/ai-coach" className="text-sm text-slate-400 hover:text-white">
                Dashboard AI Coach
              </a>
              <button
                onClick={loadData}
                className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                Aggiorna
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Suggerimenti</p>
            <p className="text-2xl font-bold text-purple-400 mt-1">{stats.total_suggestions}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Correzioni Attive</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{stats.active_corrections}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide">In Attesa</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{stats.pending_corrections}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Efficacia Media</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.avg_effectiveness}%</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-700/50 pb-3">
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'suggestions'
                ? 'bg-purple-400/20 text-purple-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Suggerimenti ({suggestions.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'active'
                ? 'bg-green-400/20 text-green-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Attive ({corrections.filter(c => c.status === 'approved' || c.status === 'auto_applied').length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'pending'
                ? 'bg-amber-400/20 text-amber-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            In Attesa ({corrections.filter(c => c.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'all'
                ? 'bg-slate-400/20 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tutte ({corrections.length})
          </button>

          {activeTab === 'suggestions' && suggestions.filter(s => s.priority === 'critical' || s.priority === 'high').length > 0 && (
            <button
              onClick={applyAllHighPriority}
              disabled={actionLoading}
              className="ml-auto px-4 py-2 bg-amber-400 text-[#0A2540] font-medium rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50"
            >
              Applica Alta Priorità
            </button>
          )}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {activeTab === 'suggestions' && (
            <>
              {suggestions.length === 0 ? (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
                  <p className="text-slate-400">Nessun suggerimento disponibile</p>
                  <p className="text-sm text-slate-500 mt-1">
                    I suggerimenti vengono generati in base ai pattern rilevati
                  </p>
                </div>
              ) : (
                suggestions.map((suggestion, idx) => (
                  <SuggestionCard
                    key={`${suggestion.pattern_id}-${idx}`}
                    suggestion={suggestion}
                    onApply={applySuggestion}
                    loading={actionLoading}
                  />
                ))
              )}
            </>
          )}

          {activeTab !== 'suggestions' && (
            <>
              {filteredCorrections.length === 0 ? (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
                  <p className="text-slate-400">Nessuna correzione in questa categoria</p>
                </div>
              ) : (
                filteredCorrections.map(correction => (
                  <CorrectionCard
                    key={correction.id}
                    correction={correction}
                    onApprove={approveCorrection}
                    onReject={rejectCorrection}
                    onDelete={deleteCorrection}
                    loading={actionLoading}
                  />
                ))
              )}
            </>
          )}
        </div>

        {/* Info box */}
        <div className="mt-8 bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
          <h3 className="font-semibold text-white mb-3">Come funziona il sistema di ottimizzazione</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-purple-400 font-medium mb-1">1. Rilevazione Pattern</p>
              <p className="text-slate-400">
                Quando un utente dà thumbs down, il sistema analizza la risposta e rileva pattern problematici.
              </p>
            </div>
            <div>
              <p className="text-amber-400 font-medium mb-1">2. Suggerimenti</p>
              <p className="text-slate-400">
                Basandosi sui pattern frequenti, vengono generati suggerimenti di correzione per il prompt o contenuti RAG.
              </p>
            </div>
            <div>
              <p className="text-green-400 font-medium mb-1">3. Applicazione</p>
              <p className="text-slate-400">
                Le correzioni approvate vengono automaticamente incluse nel system prompt dell&apos;AI Coach.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
