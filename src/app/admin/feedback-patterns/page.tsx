'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ============================================================
// TYPES
// ============================================================

interface FeedbackPattern {
  id: string;
  pattern_type: string;
  pattern_name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  trigger_phrases: string[];
  suggested_fix: string | null;
  times_detected: number;
  times_confirmed: number;
  times_rejected: number;
  false_positive_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Calcolati
  weekly_detections?: number;
  confirmation_rate?: number;
}

interface PatternMatch {
  id: string;
  pattern_id: string;
  conversation_id: string;
  confidence: number;
  matched_text: string;
  feedback_type: string;
  reviewed: boolean;
  confirmed: boolean | null;
  created_at: string;
  // Join data
  pattern_name?: string;
  pattern_type?: string;
  user_message?: string;
  ai_response?: string;
}

interface AutoCorrection {
  id: string;
  pattern_id: string;
  correction_type: 'prompt_adjustment' | 'add_rag_chunk' | 'flag_for_review' | 'other';
  description: string;
  content: string;
  effectiveness_score: number | null;
  effectiveness_trend: number | null;
  status: 'pending' | 'approved' | 'auto_applied' | 'rejected';
  applied_count: number;
  created_at: string;
  pattern_name?: string;
}

interface Stats {
  total_patterns: number;
  active_patterns: number;
  pending_reviews: number;
  weekly_corrections: number;
  weekly_trend: number;
}

// ============================================================
// CONSTANTS
// ============================================================

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  troppo_lungo: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  manca_validazione: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  troppo_prescrittivo: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  linguaggio_complesso: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30' },
  off_topic: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  tono_giudicante: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
};

const CORRECTION_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  prompt_adjustment: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  add_rag_chunk: { bg: 'bg-violet-500/20', text: 'text-violet-400' },
  flag_for_review: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  other: { bg: 'bg-green-500/20', text: 'text-green-400' },
};

// ============================================================
// COMPONENTS
// ============================================================

function CategoryBadge({ category }: { category: string }) {
  const colors = CATEGORY_COLORS[category] || { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' };
  const label = category.replace(/_/g, ' ');

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
      {label}
    </span>
  );
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  let colors = 'bg-blue-500/20 text-blue-400';
  if (pct >= 80) colors = 'bg-red-500/20 text-red-400';
  else if (pct >= 60) colors = 'bg-amber-500/20 text-amber-400';

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors}`}>
      {pct}%
    </span>
  );
}

function PatternCard({
  pattern,
  onToggle,
  onViewMatches,
}: {
  pattern: FeedbackPattern;
  onToggle: () => void;
  onViewMatches: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const confirmationRate = pattern.times_detected > 0
    ? Math.round((pattern.times_confirmed / pattern.times_detected) * 100)
    : 0;

  return (
    <div className={`bg-slate-800/50 border rounded-xl overflow-hidden transition-all ${
      pattern.is_active ? 'border-slate-700/50' : 'border-slate-700/30 opacity-60'
    }`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left hover:bg-slate-700/20 transition-colors"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CategoryBadge category={pattern.pattern_type} />
              {!pattern.is_active && (
                <span className="px-2 py-0.5 text-xs font-medium bg-slate-600/50 text-slate-400 rounded-full">
                  Disattivo
                </span>
              )}
            </div>
            <h3 className="font-medium text-white truncate">{pattern.pattern_name}</h3>
            <p className="text-sm text-slate-400 line-clamp-1">{pattern.description}</p>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className={`w-5 h-5 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-3 text-sm">
          <div className="flex items-center gap-1.5 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5" />
            </svg>
            <span>{pattern.times_detected} rilevati</span>
          </div>
          <div className="flex items-center gap-1.5 text-green-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span>{confirmationRate}% confermati</span>
          </div>
          {pattern.weekly_detections !== undefined && pattern.weekly_detections > 0 && (
            <div className="flex items-center gap-1.5 text-amber-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
              </svg>
              <span>+{pattern.weekly_detections} settimana</span>
            </div>
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-700/50">
          {/* Trigger phrases */}
          {pattern.trigger_phrases && pattern.trigger_phrases.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Trigger Phrases</p>
              <div className="flex flex-wrap gap-2">
                {pattern.trigger_phrases.map((phrase, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 text-xs bg-slate-700/50 text-slate-300 rounded-lg font-mono"
                  >
                    {phrase}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggested fix */}
          {pattern.suggested_fix && (
            <div className="mt-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Suggested Fix</p>
              <div className="p-3 bg-slate-900/50 rounded-lg text-sm text-slate-300 whitespace-pre-wrap">
                {pattern.suggested_fix}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={(e) => { e.stopPropagation(); onViewMatches(); }}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              Vedi Match
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onToggle(); }}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                pattern.is_active
                  ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                  : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
              }`}
            >
              {pattern.is_active ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  Disattiva
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  Attiva
                </>
              )}
            </button>
          </div>

          {/* False positive rate warning */}
          {pattern.false_positive_rate > 0.3 && (
            <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-400 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              Alto tasso falsi positivi: {Math.round(pattern.false_positive_rate * 100)}%
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MatchReviewCard({
  match,
  onConfirm,
  onReject,
  loading,
}: {
  match: PatternMatch;
  onConfirm: () => void;
  onReject: () => void;
  loading: boolean;
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-3 bg-slate-700/30 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium text-white truncate">
            {match.pattern_name || 'Pattern'}
          </span>
          <ConfidenceBadge confidence={match.confidence} />
        </div>
        <span className="text-xs text-slate-500 shrink-0">
          {match.feedback_type === 'thumbs_down' ? '👎' : match.feedback_type}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {match.user_message && (
          <div>
            <p className="text-xs text-slate-500 mb-1">Messaggio utente:</p>
            <p className="text-sm text-slate-300 line-clamp-2">{match.user_message}</p>
          </div>
        )}
        {match.ai_response && (
          <div>
            <p className="text-xs text-slate-500 mb-1">Risposta AI:</p>
            <p className="text-sm text-slate-400 line-clamp-4">{match.ai_response}</p>
          </div>
        )}
        {match.matched_text && (
          <div>
            <p className="text-xs text-slate-500 mb-1">Testo matchato:</p>
            <p className="text-sm text-amber-400/80 font-mono bg-slate-900/50 px-2 py-1 rounded">
              {match.matched_text}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-700/50 flex items-center gap-2">
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
          </svg>
          Pattern Corretto
        </button>
        <button
          onClick={onReject}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.498 15.25H4.372c-1.026 0-1.945-.694-2.054-1.715a12.137 12.137 0 0 1-.068-1.285c0-2.848.992-5.464 2.649-7.521C5.287 4.247 5.886 4 6.504 4h4.016a4.5 4.5 0 0 1 1.423.23l3.114 1.04a4.5 4.5 0 0 0 1.423.23h1.294M7.498 15.25c.618 0 .991.724.725 1.282A7.471 7.471 0 0 0 7.5 19.75 2.25 2.25 0 0 0 9.75 22a.75.75 0 0 0 .75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 0 0 2.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384m-10.253 1.5H9.7m8.075-9.75c.01.05.027.1.05.148.593 1.2.925 2.55.925 3.977 0 1.487-.36 2.89-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398-.306.774-1.086 1.227-1.918 1.227h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 0 0 .303-.54" />
          </svg>
          Falso Positivo
        </button>
      </div>
    </div>
  );
}

function CorrectionCard({ correction }: { correction: AutoCorrection }) {
  const typeColors = CORRECTION_TYPE_COLORS[correction.correction_type] || CORRECTION_TYPE_COLORS.other;
  const typeLabel = correction.correction_type.replace(/_/g, ' ');

  const getStatusBadge = () => {
    switch (correction.status) {
      case 'auto_applied':
        return (
          <span className="flex items-center gap-1 text-xs text-amber-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
            </svg>
            Auto-applicato
          </span>
        );
      case 'approved':
        return (
          <span className="flex items-center gap-1 text-xs text-green-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            Approvato
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            In attesa
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${typeColors.bg} ${typeColors.text}`}>
            {typeLabel}
          </span>
          {correction.effectiveness_score !== null && (
            <span className="flex items-center gap-1 text-sm">
              <span className={correction.effectiveness_score >= 0.7 ? 'text-green-400' : correction.effectiveness_score >= 0.4 ? 'text-amber-400' : 'text-red-400'}>
                {Math.round(correction.effectiveness_score * 100)}%
              </span>
              {correction.effectiveness_trend !== null && (
                <span className={correction.effectiveness_trend > 0 ? 'text-green-400' : 'text-red-400'}>
                  {correction.effectiveness_trend > 0 ? '↑' : '↓'}
                </span>
              )}
            </span>
          )}
        </div>
        {getStatusBadge()}
      </div>

      <p className="text-sm text-white mb-2">{correction.description}</p>

      {correction.content && (
        <pre className="p-2 bg-slate-900/50 rounded-lg text-xs text-slate-400 overflow-x-auto font-mono">
          {correction.content.slice(0, 300)}{correction.content.length > 300 ? '...' : ''}
        </pre>
      )}

      <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
        <span>{correction.pattern_name || 'Pattern'}</span>
        <span>Applicato {correction.applied_count}x</span>
      </div>
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function FeedbackPatternsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // State
  const [activeTab, setActiveTab] = useState<'patterns' | 'review' | 'corrections'>('patterns');
  const [patterns, setPatterns] = useState<FeedbackPattern[]>([]);
  const [pendingMatches, setPendingMatches] = useState<PatternMatch[]>([]);
  const [corrections, setCorrections] = useState<AutoCorrection[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_patterns: 0,
    active_patterns: 0,
    pending_reviews: 0,
    weekly_corrections: 0,
    weekly_trend: 0,
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Load data
  const loadData = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/admin/feedback-patterns');

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
      setPatterns(data.patterns || []);
      setPendingMatches(data.pendingMatches || []);
      setCorrections(data.corrections || []);
      setStats(data.stats || {
        total_patterns: 0,
        active_patterns: 0,
        pending_reviews: 0,
        weekly_corrections: 0,
        weekly_trend: 0,
      });
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

  // Toggle pattern active state
  const togglePattern = async (patternId: string, currentState: boolean) => {
    setActionLoading(patternId);
    try {
      const response = await fetch('/api/admin/feedback-patterns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_pattern',
          pattern_id: patternId,
          is_active: !currentState,
        }),
      });

      if (!response.ok) throw new Error('Errore aggiornamento pattern');

      setPatterns(prev =>
        prev.map(p =>
          p.id === patternId ? { ...p, is_active: !currentState } : p
        )
      );
      setStats(prev => ({
        ...prev,
        active_patterns: prev.active_patterns + (currentState ? -1 : 1),
      }));
    } catch (err) {
      console.error('Errore toggle pattern:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Review match
  const reviewMatch = async (matchId: string, confirmed: boolean) => {
    setActionLoading(matchId);
    try {
      const response = await fetch('/api/admin/feedback-patterns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'review_match',
          match_id: matchId,
          confirmed,
        }),
      });

      if (!response.ok) throw new Error('Errore review match');

      setPendingMatches(prev => prev.filter(m => m.id !== matchId));
      setStats(prev => ({
        ...prev,
        pending_reviews: Math.max(0, prev.pending_reviews - 1),
      }));
    } catch (err) {
      console.error('Errore review match:', err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A2540] to-[#0d1f33] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-red-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Caricamento patterns...</p>
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
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0A2540]/95 backdrop-blur border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-400/10 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-red-400"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Feedback Patterns</h1>
                <p className="text-sm text-slate-400">
                  Detection automatica da thumbs down
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/admin/quality-audit"
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Quality Audit
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
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Pattern Attivi</p>
            <p className="text-2xl font-bold text-white mt-1">
              {stats.active_patterns}
              <span className="text-sm font-normal text-slate-500">/{stats.total_patterns}</span>
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Da Revisionare</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{stats.pending_reviews}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Correzioni Settimana</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{stats.weekly_corrections}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Trend</p>
            <p className={`text-2xl font-bold mt-1 ${stats.weekly_trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.weekly_trend >= 0 ? '+' : ''}{stats.weekly_trend}%
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 bg-slate-800/30 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('patterns')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'patterns'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pattern
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'review'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Da Revisionare
            {stats.pending_reviews > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded-full">
                {stats.pending_reviews}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('corrections')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'corrections'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Correzioni
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'patterns' && (
          <div className="space-y-4">
            {patterns.length === 0 ? (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-slate-500 mx-auto mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5" />
                </svg>
                <p className="text-slate-400">Nessun pattern configurato</p>
                <p className="text-sm text-slate-500 mt-1">
                  I pattern vengono creati automaticamente dall&apos;analisi dei feedback
                </p>
              </div>
            ) : (
              patterns.map(pattern => (
                <PatternCard
                  key={pattern.id}
                  pattern={pattern}
                  onToggle={() => togglePattern(pattern.id, pattern.is_active)}
                  onViewMatches={() => {
                    setActiveTab('review');
                    // Could filter by pattern_id here
                  }}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'review' && (
          <div>
            {pendingMatches.length === 0 ? (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-green-500 mx-auto mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <p className="text-green-400 font-medium">Tutti i match revisionati!</p>
                <p className="text-sm text-slate-500 mt-1">
                  Non ci sono pattern match in attesa di revisione
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingMatches.map(match => (
                  <MatchReviewCard
                    key={match.id}
                    match={match}
                    onConfirm={() => reviewMatch(match.id, true)}
                    onReject={() => reviewMatch(match.id, false)}
                    loading={actionLoading === match.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'corrections' && (
          <div className="space-y-4">
            {corrections.length === 0 ? (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-slate-500 mx-auto mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
                <p className="text-slate-400">Nessuna correzione automatica</p>
                <p className="text-sm text-slate-500 mt-1">
                  Le correzioni vengono generate quando vengono rilevati pattern ricorrenti
                </p>
              </div>
            ) : (
              corrections.map(correction => (
                <CorrectionCard key={correction.id} correction={correction} />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
