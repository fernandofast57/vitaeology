// ============================================================================
// PAGE: /admin/beta-testing
// Descrizione: Dashboard gestione beta testing (testers + feedback)
// Auth: Richiede admin (is_admin = true)
// ============================================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  MessageSquare,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Bug,
  Lightbulb,
  HelpCircle,
  Heart,
  ChevronDown,
  ChevronUp,
  Star,
  TrendingUp,
  Award,
} from 'lucide-react';

// Types
interface TesterStats {
  total: number;
  pending: number;
  approved: number;
  active: number;
  rejected: number;
  completed: number;
}

interface FeedbackStats {
  total: number;
  bugs: number;
  suggestions: number;
  questions: number;
  praise: number;
  open: number;
  resolved: number;
  criticalOpen: number;
  highOpen: number;
}

interface WeeklyStats {
  applications: number;
  feedback: {
    total: number;
    bugs: number;
    suggestions: number;
  };
}

interface CriticalBug {
  id: string;
  created_at: string;
  description: string;
  page_url: string;
  beta_testers: { full_name: string } | null;
}

interface Stats {
  testers: TesterStats;
  feedback: FeedbackStats;
  criticalBugs: CriticalBug[];
  weekly: WeeklyStats;
}

interface Tester {
  id: string;
  created_at: string;
  email: string;
  full_name: string;
  job_title: string;
  company: string | null;
  years_experience: string;
  device: string;
  motivation: string;
  hours_available: string;
  source: string | null;
  status: string;
  cohort: string | null;
  notes: string | null;
}

interface Feedback {
  id: string;
  created_at: string;
  type: string;
  description: string;
  page_url: string | null;
  severity: string | null;
  status: string;
  resolution_notes: string | null;
  beta_testers: { email: string; full_name: string } | null;
}

type Tab = 'candidature' | 'feedback' | 'report' | 'challenge-feedback';

// Challenge Beta Feedback types
interface ChallengeFeedbackStats {
  total_feedbacks: number;
  avg_rating: number;
  avg_nps: number;
  testimonials_available: number;
  promoters: number;
  passives: number;
  detractors: number;
  nps_net_score: number;
  by_challenge: Record<string, {
    count: number;
    avg_rating: number;
    testimonials: number;
  }>;
  rating_distribution: number[];
}

interface ChallengeFeedbackTestimonial {
  id: string;
  challenge_type: string;
  overall_rating: number;
  testimonial: string;
  display_name: string | null;
  created_at: string;
}

interface ChallengeChoiceStats {
  total_signups: number;
  by_challenge: Record<string, {
    signups: number;
    active: number;
    completed: number;
    avg_progress: number;
    percentage: number;
  }>;
}

export default function AdminBetaTestingPage() {
  const [activeTab, setActiveTab] = useState<Tab>('candidature');
  const [stats, setStats] = useState<Stats | null>(null);
  const [testers, setTesters] = useState<Tester[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  // Challenge feedback state
  const [challengeFeedbackStats, setChallengeFeedbackStats] = useState<ChallengeFeedbackStats | null>(null);
  const [challengeTestimonials, setChallengeTestimonials] = useState<ChallengeFeedbackTestimonial[]>([]);
  const [challengeChoiceStats, setChallengeChoiceStats] = useState<ChallengeChoiceStats | null>(null);

  // Filters
  const [testerFilter, setTesterFilter] = useState<string>('all');
  const [feedbackTypeFilter, setFeedbackTypeFilter] = useState<string>('all');
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<string>('all');

  // Expanded rows
  const [expandedTester, setExpandedTester] = useState<string | null>(null);
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);

  // Editing state
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/beta/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Errore caricamento stats:', err);
    }
  }, []);

  const fetchTesters = useCallback(async () => {
    try {
      let url = '/api/beta/testers';
      if (testerFilter !== 'all') {
        url += `?status=${testerFilter}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTesters(data.testers || []);
      }
    } catch (err) {
      console.error('Errore caricamento testers:', err);
    }
  }, [testerFilter]);

  const fetchFeedback = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (feedbackTypeFilter !== 'all') params.set('type', feedbackTypeFilter);
      if (feedbackStatusFilter !== 'all') params.set('status', feedbackStatusFilter);
      const url = '/api/beta/feedback' + (params.toString() ? `?${params}` : '');
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setFeedback(data.feedback || []);
      }
    } catch (err) {
      console.error('Errore caricamento feedback:', err);
    }
  }, [feedbackTypeFilter, feedbackStatusFilter]);

  // Fetch challenge beta feedback (from new system)
  const fetchChallengeFeedback = useCallback(async () => {
    try {
      const res = await fetch('/api/challenge/beta-feedback');
      if (res.ok) {
        const data = await res.json();
        setChallengeFeedbackStats(data.stats || null);
        setChallengeTestimonials(data.testimonials || []);
        setChallengeChoiceStats(data.challenge_choice_stats || null);
      }
    } catch (err) {
      console.error('Errore caricamento challenge feedback:', err);
    }
  }, []);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchTesters(), fetchFeedback(), fetchChallengeFeedback()]);
      setLoading(false);
    };
    loadAll();
  }, [fetchStats, fetchTesters, fetchFeedback, fetchChallengeFeedback]);

  // Tester actions
  const updateTester = async (id: string, data: Record<string, unknown>) => {
    try {
      const res = await fetch(`/api/beta/testers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await fetchTesters();
        await fetchStats();
      }
    } catch (err) {
      console.error('Errore update tester:', err);
    }
  };

  // Feedback actions
  const updateFeedback = async (id: string, data: Record<string, unknown>) => {
    try {
      const res = await fetch(`/api/beta/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await fetchFeedback();
        await fetchStats();
        setEditingNotes(null);
      }
    } catch (err) {
      console.error('Errore update feedback:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A2540]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-[#0A2540] text-white py-6 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Beta Testing Dashboard</h1>
            <p className="text-slate-300">Gestione testers e feedback</p>
          </div>
          <Link href="/admin" className="text-slate-300 hover:text-white">
            &larr; Admin
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4">
        {/* Stats Cards */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-blue-500" />
                <p className="text-sm text-slate-500">Candidature Totali</p>
              </div>
              <p className="text-3xl font-bold text-slate-800">{stats.testers.total}</p>
              <p className="text-xs text-slate-400 mt-1">
                {stats.testers.pending} pending, {stats.testers.active} attivi
              </p>
            </div>

            <div className="bg-yellow-50 p-6 rounded-xl shadow-sm border border-yellow-200">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <p className="text-sm text-yellow-700">In Attesa</p>
              </div>
              <p className="text-3xl font-bold text-yellow-800">{stats.testers.pending}</p>
              <p className="text-xs text-yellow-600 mt-1">Da approvare/rifiutare</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare className="w-5 h-5 text-purple-500" />
                <p className="text-sm text-slate-500">Feedback Totali</p>
              </div>
              <p className="text-3xl font-bold text-slate-800">{stats.feedback.total}</p>
              <p className="text-xs text-slate-400 mt-1">
                {stats.feedback.open} aperti, {stats.feedback.resolved} risolti
              </p>
            </div>

            <div className="bg-red-50 p-6 rounded-xl shadow-sm border border-red-200">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-700">Bug Critici Aperti</p>
              </div>
              <p className="text-3xl font-bold text-red-800">{stats.feedback.criticalOpen}</p>
              <p className="text-xs text-red-600 mt-1">
                + {stats.feedback.highOpen} high priority
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-lg p-1 shadow-sm w-fit flex-wrap">
          {([
            { key: 'candidature', label: 'Candidature', icon: Users },
            { key: 'feedback', label: 'Feedback', icon: MessageSquare },
            { key: 'challenge-feedback', label: 'Challenge Feedback', icon: Heart },
            { key: 'report', label: 'Report', icon: BarChart3 },
          ] as const).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
                  activeTab === tab.key
                    ? 'bg-[#0A2540] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'candidature' && (
          <CandidatureTab
            testers={testers}
            filter={testerFilter}
            setFilter={setTesterFilter}
            expandedId={expandedTester}
            setExpandedId={setExpandedTester}
            updateTester={updateTester}
          />
        )}

        {activeTab === 'feedback' && (
          <FeedbackTab
            feedback={feedback}
            typeFilter={feedbackTypeFilter}
            setTypeFilter={setFeedbackTypeFilter}
            statusFilter={feedbackStatusFilter}
            setStatusFilter={setFeedbackStatusFilter}
            expandedId={expandedFeedback}
            setExpandedId={setExpandedFeedback}
            updateFeedback={updateFeedback}
            editingNotes={editingNotes}
            setEditingNotes={setEditingNotes}
            notesValue={notesValue}
            setNotesValue={setNotesValue}
          />
        )}

        {activeTab === 'report' && stats && (
          <ReportTab stats={stats} />
        )}

        {activeTab === 'challenge-feedback' && (
          <ChallengeFeedbackTab
            stats={challengeFeedbackStats}
            testimonials={challengeTestimonials}
            choiceStats={challengeChoiceStats}
          />
        )}
      </main>
    </div>
  );
}

// ============================================================================
// CANDIDATURE TAB
// ============================================================================

interface CandidatureTabProps {
  testers: Tester[];
  filter: string;
  setFilter: (f: string) => void;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  updateTester: (id: string, data: Record<string, unknown>) => void;
}

function CandidatureTab({
  testers,
  filter,
  setFilter,
  expandedId,
  setExpandedId,
  updateTester,
}: CandidatureTabProps) {
  const statuses = ['all', 'pending', 'approved', 'active', 'rejected', 'completed'];

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === s
                ? 'bg-[#0A2540] text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {s === 'all' ? 'Tutti' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-slate-600">Candidato</th>
                <th className="text-left p-4 text-sm font-medium text-slate-600">Ruolo</th>
                <th className="text-center p-4 text-sm font-medium text-slate-600">Esperienza</th>
                <th className="text-center p-4 text-sm font-medium text-slate-600">Device</th>
                <th className="text-center p-4 text-sm font-medium text-slate-600">Stato</th>
                <th className="text-center p-4 text-sm font-medium text-slate-600">Cohort</th>
                <th className="text-center p-4 text-sm font-medium text-slate-600">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {testers.map((t) => (
                <>
                  <tr
                    key={t.id}
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {expandedId === t.id ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                        <div>
                          <p className="font-medium text-slate-800">{t.full_name}</p>
                          <p className="text-sm text-slate-500">{t.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-slate-800">{t.job_title}</p>
                      {t.company && <p className="text-sm text-slate-500">{t.company}</p>}
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-slate-700">{t.years_experience} anni</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-slate-700 capitalize">{t.device}</span>
                    </td>
                    <td className="p-4 text-center">
                      <TesterStatusBadge status={t.status} />
                    </td>
                    <td className="p-4 text-center">
                      {t.cohort ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          {t.cohort}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        {t.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateTester(t.id, { status: 'approved' })}
                              className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200"
                              title="Approva"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateTester(t.id, { status: 'rejected' })}
                              className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200"
                              title="Rifiuta"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {t.status === 'approved' && (
                          <button
                            onClick={() => updateTester(t.id, { status: 'active' })}
                            className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                          >
                            Attiva
                          </button>
                        )}
                        {t.status === 'active' && (
                          <button
                            onClick={() => updateTester(t.id, { status: 'completed' })}
                            className="px-2 py-1 bg-slate-600 text-white text-xs rounded hover:bg-slate-700"
                          >
                            Completa
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {/* Expanded details */}
                  {expandedId === t.id && (
                    <tr key={`${t.id}-details`} className="bg-slate-50">
                      <td colSpan={7} className="p-4">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="bg-white p-4 rounded-lg border">
                            <h4 className="font-medium text-slate-700 mb-2">Motivazione</h4>
                            <p className="text-sm text-slate-600">{t.motivation}</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg border">
                            <h4 className="font-medium text-slate-700 mb-2">Disponibilità</h4>
                            <p className="text-sm text-slate-600">{t.hours_available} ore/settimana</p>
                            <p className="text-xs text-slate-400 mt-1">
                              Source: {t.source || 'non specificato'}
                            </p>
                            <p className="text-xs text-slate-400">
                              Iscritto: {new Date(t.created_at).toLocaleDateString('it-IT')}
                            </p>
                          </div>
                          <div className="bg-white p-4 rounded-lg border">
                            <h4 className="font-medium text-slate-700 mb-2">Assegna Cohort</h4>
                            <select
                              value={t.cohort || ''}
                              onChange={(e) => updateTester(t.id, { cohort: e.target.value || null })}
                              className="w-full px-2 py-1.5 border rounded text-sm"
                            >
                              <option value="">Nessuna</option>
                              <option value="A">Cohort A</option>
                              <option value="B">Cohort B</option>
                              <option value="C">Cohort C</option>
                              <option value="open">Open Beta</option>
                            </select>
                            {t.notes && (
                              <p className="text-xs text-slate-500 mt-2">Note: {t.notes}</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {testers.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            Nessun tester trovato con questo filtro
          </div>
        )}
      </div>
    </div>
  );
}

function TesterStatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'In Attesa' },
    approved: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Approvato' },
    active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Attivo' },
    rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rifiutato' },
    completed: { bg: 'bg-slate-100', text: 'text-slate-800', label: 'Completato' },
  };
  const c = config[status] || config.pending;
  return (
    <span className={`px-2 py-1 rounded text-sm ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

// ============================================================================
// FEEDBACK TAB
// ============================================================================

interface FeedbackTabProps {
  feedback: Feedback[];
  typeFilter: string;
  setTypeFilter: (f: string) => void;
  statusFilter: string;
  setStatusFilter: (f: string) => void;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  updateFeedback: (id: string, data: Record<string, unknown>) => void;
  editingNotes: string | null;
  setEditingNotes: (id: string | null) => void;
  notesValue: string;
  setNotesValue: (v: string) => void;
}

function FeedbackTab({
  feedback,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  expandedId,
  setExpandedId,
  updateFeedback,
  editingNotes,
  setEditingNotes,
  notesValue,
  setNotesValue,
}: FeedbackTabProps) {
  const types = ['all', 'bug', 'suggestion', 'question', 'praise'];
  const statuses = ['all', 'new', 'in_progress', 'resolved', 'wont_fix'];

  const typeIcons: Record<string, typeof Bug> = {
    bug: Bug,
    suggestion: Lightbulb,
    question: HelpCircle,
    praise: Heart,
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex gap-2 items-center">
          <span className="text-sm text-slate-500">Tipo:</span>
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                typeFilter === t
                  ? 'bg-[#0A2540] text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t === 'all' ? 'Tutti' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-sm text-slate-500">Stato:</span>
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                statusFilter === s
                  ? 'bg-[#0A2540] text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {s === 'all' ? 'Tutti' : s === 'wont_fix' ? "Won't Fix" : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-slate-600">Tipo</th>
                <th className="text-left p-4 text-sm font-medium text-slate-600">Descrizione</th>
                <th className="text-left p-4 text-sm font-medium text-slate-600">Utente</th>
                <th className="text-center p-4 text-sm font-medium text-slate-600">Severità</th>
                <th className="text-center p-4 text-sm font-medium text-slate-600">Stato</th>
                <th className="text-center p-4 text-sm font-medium text-slate-600">Data</th>
              </tr>
            </thead>
            <tbody>
              {feedback.map((f) => {
                const TypeIcon = typeIcons[f.type] || MessageSquare;
                return (
                  <>
                    <tr
                      key={f.id}
                      className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                      onClick={() => setExpandedId(expandedId === f.id ? null : f.id)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <TypeIcon className={`w-5 h-5 ${
                            f.type === 'bug' ? 'text-red-500' :
                            f.type === 'suggestion' ? 'text-amber-500' :
                            f.type === 'question' ? 'text-blue-500' : 'text-pink-500'
                          }`} />
                          <span className="capitalize">{f.type}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-slate-800 line-clamp-2">{f.description}</p>
                        {f.page_url && (
                          <p className="text-xs text-slate-400 mt-1">{f.page_url}</p>
                        )}
                      </td>
                      <td className="p-4">
                        {f.beta_testers ? (
                          <div>
                            <p className="text-slate-800">{f.beta_testers.full_name}</p>
                            <p className="text-sm text-slate-500">{f.beta_testers.email}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400">Anonimo</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {f.severity ? (
                          <SeverityBadge severity={f.severity} />
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <FeedbackStatusBadge status={f.status} />
                      </td>
                      <td className="p-4 text-center text-sm text-slate-500">
                        {new Date(f.created_at).toLocaleDateString('it-IT')}
                      </td>
                    </tr>
                    {/* Expanded details */}
                    {expandedId === f.id && (
                      <tr key={`${f.id}-details`} className="bg-slate-50">
                        <td colSpan={6} className="p-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-lg border">
                              <h4 className="font-medium text-slate-700 mb-2">Descrizione Completa</h4>
                              <p className="text-sm text-slate-600 whitespace-pre-wrap">{f.description}</p>
                              {f.page_url && (
                                <p className="text-xs text-slate-400 mt-2">Pagina: {f.page_url}</p>
                              )}
                            </div>
                            <div className="space-y-4">
                              <div className="bg-white p-4 rounded-lg border">
                                <h4 className="font-medium text-slate-700 mb-2">Cambia Stato</h4>
                                <div className="flex gap-2 flex-wrap">
                                  {['new', 'in_progress', 'resolved', 'wont_fix'].map((s) => (
                                    <button
                                      key={s}
                                      onClick={() => updateFeedback(f.id, { status: s })}
                                      className={`px-3 py-1 rounded text-sm ${
                                        f.status === s
                                          ? 'bg-[#0A2540] text-white'
                                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                      }`}
                                    >
                                      {s === 'wont_fix' ? "Won't Fix" : s.replace('_', ' ')}
                                    </button>
                                  ))}
                                </div>
                                {f.type === 'bug' && (
                                  <div className="mt-3">
                                    <p className="text-sm text-slate-500 mb-1">Severità:</p>
                                    <div className="flex gap-2">
                                      {['critical', 'high', 'medium', 'low'].map((sev) => (
                                        <button
                                          key={sev}
                                          onClick={() => updateFeedback(f.id, { severity: sev })}
                                          className={`px-2 py-1 rounded text-xs ${
                                            f.severity === sev
                                              ? 'bg-[#0A2540] text-white'
                                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                          }`}
                                        >
                                          {sev}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="bg-white p-4 rounded-lg border">
                                <h4 className="font-medium text-slate-700 mb-2">Note di Risoluzione</h4>
                                {editingNotes === f.id ? (
                                  <div>
                                    <textarea
                                      value={notesValue}
                                      onChange={(e) => setNotesValue(e.target.value)}
                                      className="w-full px-2 py-1.5 border rounded text-sm"
                                      rows={3}
                                      placeholder="Aggiungi note..."
                                    />
                                    <div className="flex gap-2 mt-2">
                                      <button
                                        onClick={() => updateFeedback(f.id, { resolution_notes: notesValue })}
                                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                      >
                                        Salva
                                      </button>
                                      <button
                                        onClick={() => setEditingNotes(null)}
                                        className="px-3 py-1 bg-slate-200 text-slate-700 text-sm rounded hover:bg-slate-300"
                                      >
                                        Annulla
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    {f.resolution_notes ? (
                                      <p className="text-sm text-slate-600">{f.resolution_notes}</p>
                                    ) : (
                                      <p className="text-sm text-slate-400">Nessuna nota</p>
                                    )}
                                    <button
                                      onClick={() => {
                                        setNotesValue(f.resolution_notes || '');
                                        setEditingNotes(f.id);
                                      }}
                                      className="mt-2 text-sm text-blue-600 hover:underline"
                                    >
                                      {f.resolution_notes ? 'Modifica' : 'Aggiungi nota'}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        {feedback.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            Nessun feedback trovato con questi filtri
          </div>
        )}
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    critical: { bg: 'bg-red-100', text: 'text-red-800' },
    high: { bg: 'bg-orange-100', text: 'text-orange-800' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    low: { bg: 'bg-slate-100', text: 'text-slate-800' },
  };
  const c = config[severity] || config.medium;
  return (
    <span className={`px-2 py-1 rounded text-xs uppercase ${c.bg} ${c.text}`}>
      {severity}
    </span>
  );
}

function FeedbackStatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    new: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Nuovo' },
    in_progress: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'In Corso' },
    resolved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Risolto' },
    wont_fix: { bg: 'bg-slate-100', text: 'text-slate-800', label: "Won't Fix" },
  };
  const c = config[status] || config.new;
  return (
    <span className={`px-2 py-1 rounded text-sm ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

// ============================================================================
// REPORT TAB
// ============================================================================

interface ReportTabProps {
  stats: Stats;
}

function ReportTab({ stats }: ReportTabProps) {
  return (
    <div className="space-y-6">
      {/* Weekly Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Riepilogo Ultimi 7 Giorni</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">Nuove Candidature</p>
            <p className="text-2xl font-bold text-blue-800">{stats.weekly.applications}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-700">Feedback Ricevuti</p>
            <p className="text-2xl font-bold text-purple-800">{stats.weekly.feedback.total}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-700">Bug Segnalati</p>
            <p className="text-2xl font-bold text-red-800">{stats.weekly.feedback.bugs}</p>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg">
            <p className="text-sm text-amber-700">Suggerimenti</p>
            <p className="text-2xl font-bold text-amber-800">{stats.weekly.feedback.suggestions}</p>
          </div>
        </div>
      </div>

      {/* Feedback Breakdown */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Breakdown Feedback</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {/* By Type */}
          <div>
            <h4 className="text-sm font-medium text-slate-600 mb-3">Per Tipo</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Bug className="w-4 h-4 text-red-500" />
                  <span>Bug</span>
                </div>
                <span className="font-bold">{stats.feedback.bugs}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>Suggerimenti</span>
                </div>
                <span className="font-bold">{stats.feedback.suggestions}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-500" />
                  <span>Domande</span>
                </div>
                <span className="font-bold">{stats.feedback.questions}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-500" />
                  <span>Complimenti</span>
                </div>
                <span className="font-bold">{stats.feedback.praise}</span>
              </div>
            </div>
          </div>

          {/* By Status */}
          <div>
            <h4 className="text-sm font-medium text-slate-600 mb-3">Per Stato</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-blue-700">Aperti</span>
                <span className="font-bold text-blue-800">{stats.feedback.open}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-green-700">Risolti</span>
                <span className="font-bold text-green-800">{stats.feedback.resolved}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="text-red-700">Critici Aperti</span>
                <span className="font-bold text-red-800">{stats.feedback.criticalOpen}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="text-orange-700">High Priority Aperti</span>
                <span className="font-bold text-orange-800">{stats.feedback.highOpen}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Bugs List */}
      {stats.criticalBugs.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Bug Critici Aperti
          </h3>
          <div className="space-y-3">
            {stats.criticalBugs.map((bug) => (
              <div key={bug.id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-slate-800 font-medium">{bug.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                  <span>{new Date(bug.created_at).toLocaleDateString('it-IT')}</span>
                  {bug.page_url && <span className="text-slate-400">{bug.page_url}</span>}
                  {bug.beta_testers && (
                    <span className="text-slate-400">da {bug.beta_testers.full_name}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Testers Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Stato Testers</h3>
        <div className="grid grid-cols-5 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-800">{stats.testers.pending}</p>
            <p className="text-sm text-yellow-700">Pending</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-800">{stats.testers.approved}</p>
            <p className="text-sm text-blue-700">Approved</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-800">{stats.testers.active}</p>
            <p className="text-sm text-green-700">Active</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-800">{stats.testers.rejected}</p>
            <p className="text-sm text-red-700">Rejected</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-800">{stats.testers.completed}</p>
            <p className="text-sm text-slate-700">Completed</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CHALLENGE FEEDBACK TAB
// Feedback raccolti dalle challenge 7 giorni (obiettivo: 30+ feedback, 10+ testimonials)
// ============================================================================

interface ChallengeFeedbackTabProps {
  stats: ChallengeFeedbackStats | null;
  testimonials: ChallengeFeedbackTestimonial[];
  choiceStats: ChallengeChoiceStats | null;
}

function ChallengeFeedbackTab({ stats, testimonials, choiceStats }: ChallengeFeedbackTabProps) {
  if (!stats) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-slate-500">Nessun feedback challenge ancora raccolto.</p>
        <p className="text-sm text-slate-400 mt-2">
          I feedback verranno raccolti quando i beta tester completeranno le challenge.
        </p>
      </div>
    );
  }

  const challengeColors: Record<string, { bg: string; text: string; border: string }> = {
    leadership: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
    ostacoli: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
    microfelicita: { bg: 'bg-violet-50', text: 'text-violet-800', border: 'border-violet-200' },
  };

  // Progress toward goals
  const feedbackProgress = Math.min((stats.total_feedbacks / 30) * 100, 100);
  const testimonialsProgress = Math.min((stats.testimonials_available / 10) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Progress toward Goals */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Progresso Obiettivi Beta
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-slate-600">Feedback Raccolti</span>
              <span className="text-sm font-semibold text-slate-800">
                {stats.total_feedbacks} / 30
              </span>
            </div>
            <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${feedbackProgress}%` }}
              />
            </div>
            {feedbackProgress >= 100 && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Obiettivo raggiunto!
              </p>
            )}
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-slate-600">Testimonials Utilizzabili</span>
              <span className="text-sm font-semibold text-slate-800">
                {stats.testimonials_available} / 10
              </span>
            </div>
            <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${testimonialsProgress}%` }}
              />
            </div>
            {testimonialsProgress >= 100 && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Obiettivo raggiunto!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Challenge Choice Stats (Most Popular) */}
      {choiceStats && choiceStats.total_signups > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Challenge Scelte dai Beta Tester
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            {choiceStats.total_signups} iscrizioni totali dalla pagina /beta
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(choiceStats.by_challenge)
              .sort(([, a], [, b]) => b.signups - a.signups)
              .map(([challenge, data], index) => {
                const colors = challengeColors[challenge] || challengeColors.leadership;
                const challengeNames: Record<string, string> = {
                  leadership: 'Leadership Autentica',
                  ostacoli: 'Oltre gli Ostacoli',
                  microfelicita: 'Microfelicita',
                };
                const isWinner = index === 0;

                return (
                  <div
                    key={challenge}
                    className={`p-4 rounded-xl border-2 ${colors.bg} ${colors.border} ${
                      isWinner ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                    }`}
                  >
                    {isWinner && (
                      <div className="flex items-center gap-1 text-xs font-bold text-blue-600 mb-2">
                        <Award className="w-4 h-4" /> PIU&apos; SCELTA
                      </div>
                    )}
                    <h4 className={`font-semibold ${colors.text} mb-3`}>
                      {challengeNames[challenge] || challenge}
                    </h4>

                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Iscrizioni</span>
                        <span className="font-bold">{data.signups} ({data.percentage}%)</span>
                      </div>
                      <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            challenge === 'leadership' ? 'bg-amber-500' :
                            challenge === 'ostacoli' ? 'bg-emerald-500' : 'bg-violet-500'
                          }`}
                          style={{ width: `${data.percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-center p-2 bg-white/50 rounded-lg">
                        <div className="font-semibold text-green-700">{data.completed}</div>
                        <div className="text-xs text-slate-500">Completati</div>
                      </div>
                      <div className="text-center p-2 bg-white/50 rounded-lg">
                        <div className="font-semibold text-slate-700">{data.avg_progress.toFixed(1)}</div>
                        <div className="text-xs text-slate-500">Giorno medio</div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <p className="text-sm text-slate-500">Rating Medio</p>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-slate-800">{stats.avg_rating.toFixed(1)}</p>
            <p className="text-slate-400">/ 5</p>
          </div>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(stats.avg_rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-slate-300'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <p className="text-sm text-slate-500">NPS Score</p>
          </div>
          <p className={`text-3xl font-bold ${
            stats.nps_net_score >= 50 ? 'text-green-600' :
            stats.nps_net_score >= 0 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {stats.nps_net_score}
          </p>
          <p className="text-xs text-slate-400 mt-2">
            {stats.promoters} promoter, {stats.passives} passive, {stats.detractors} detractor
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <p className="text-sm text-slate-500">Feedback Totali</p>
          </div>
          <p className="text-3xl font-bold text-slate-800">{stats.total_feedbacks}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-5 h-5 text-green-500" />
            <p className="text-sm text-slate-500">Testimonials</p>
          </div>
          <p className="text-3xl font-bold text-slate-800">{stats.testimonials_available}</p>
          <p className="text-xs text-slate-400 mt-2">Con consenso all&apos;uso</p>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Distribuzione Rating</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.rating_distribution[rating - 1] || 0;
            const percentage = stats.total_feedbacks > 0
              ? (count / stats.total_feedbacks) * 100
              : 0;
            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-20">
                  <span className="text-sm text-slate-600">{rating}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-slate-500 w-12 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* By Challenge */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Feedback per Challenge</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(stats.by_challenge).map(([challenge, data]) => {
            const colors = challengeColors[challenge] || challengeColors.leadership;
            const challengeNames: Record<string, string> = {
              leadership: 'Leadership Autentica',
              ostacoli: 'Oltre gli Ostacoli',
              microfelicita: 'Microfelicita',
            };
            return (
              <div
                key={challenge}
                className={`p-4 rounded-xl border ${colors.bg} ${colors.border}`}
              >
                <h4 className={`font-semibold ${colors.text} mb-3`}>
                  {challengeNames[challenge] || challenge}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Feedback:</span>
                    <span className="font-semibold">{data.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Rating medio:</span>
                    <span className="font-semibold">{data.avg_rating.toFixed(1)} / 5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Testimonials:</span>
                    <span className="font-semibold">{data.testimonials}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {Object.keys(stats.by_challenge).length === 0 && (
          <p className="text-slate-400 text-center py-4">Nessun feedback per challenge ancora</p>
        )}
      </div>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-green-500" />
            Testimonials Approvati
          </h3>
          <div className="space-y-4">
            {testimonials.map((t) => {
              const colors = challengeColors[t.challenge_type] || challengeColors.leadership;
              return (
                <div
                  key={t.id}
                  className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-slate-700 italic">&quot;{t.testimonial}&quot;</p>
                      <div className="flex items-center gap-3 mt-3 text-sm">
                        <span className={`font-medium ${colors.text}`}>
                          {t.display_name || 'Anonimo'}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500 capitalize">{t.challenge_type}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= t.overall_rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
