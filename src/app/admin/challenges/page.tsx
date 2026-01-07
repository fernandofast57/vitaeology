'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Subscriber {
  id: string;
  email: string;
  nome: string | null;
  challenge: string;
  variant: string;
  current_day: number;
  status: string;
  subscribed_at: string;
  last_email_sent_at: string | null;
  last_email_type: string | null;
  last_activity_at: string | null;
  completed_at: string | null;
  post_email_1_sent: string | null;
  post_email_2_sent: string | null;
  post_email_3_sent: string | null;
}

interface ChallengeStats {
  challenge: string;
  total: number;
  active: number;
  completed: number;
  avgDay: number;
}

interface CronResult {
  success: boolean;
  results?: {
    day_content_sent: number;
    day_content_errors: number;
    reminders_sent: number;
    reminders_errors: number;
    force_unlocks: number;
    force_unlock_errors: number;
    post_challenge_sent: number;
    post_challenge_errors: number;
  };
  duration_ms?: number;
  error?: string;
}

export default function ChallengesAdminPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<ChallengeStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [cronRunning, setCronRunning] = useState(false);
  const [cronResult, setCronResult] = useState<CronResult | null>(null);

  const supabase = createClient();

  const challengeNames: Record<string, string> = {
    'leadership-autentica': 'Leadership Autentica',
    'oltre-ostacoli': 'Oltre gli Ostacoli',
    'microfelicita': 'Microfelicita'
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-500/20 text-green-400',
    completed: 'bg-blue-500/20 text-blue-400',
    unsubscribed: 'bg-red-500/20 text-red-400',
    paused: 'bg-yellow-500/20 text-yellow-400'
  };

  const fetchData = useCallback(async () => {
    try {
      // Fetch subscribers
      const { data: subs, error } = await supabase
        .from('challenge_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });

      if (error) {
        console.error('Error fetching subscribers:', error);
        return;
      }

      if (subs) {
        setSubscribers(subs);

        // Calculate stats per challenge
        const statsMap: Record<string, ChallengeStats> = {};
        for (const sub of subs) {
          if (!statsMap[sub.challenge]) {
            statsMap[sub.challenge] = {
              challenge: sub.challenge,
              total: 0,
              active: 0,
              completed: 0,
              avgDay: 0
            };
          }
          statsMap[sub.challenge].total++;
          if (sub.status === 'active') statsMap[sub.challenge].active++;
          if (sub.status === 'completed') statsMap[sub.challenge].completed++;
          statsMap[sub.challenge].avgDay += sub.current_day || 0;
        }

        // Calculate averages
        Object.values(statsMap).forEach(s => {
          s.avgDay = s.total > 0 ? Math.round((s.avgDay / s.total) * 10) / 10 : 0;
        });

        setStats(Object.values(statsMap));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const runCronManually = async () => {
    setCronRunning(true);
    setCronResult(null);

    try {
      const response = await fetch('/api/cron/challenge-emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'manual-test'}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      setCronResult(result);
      // Refresh data after cron
      await fetchData();
    } catch (error) {
      console.error('Error running cron:', error);
      setCronResult({ success: false, error: 'Errore nella chiamata cron' });
    } finally {
      setCronRunning(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeSince = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return 'Meno di 1h fa';
    if (diffHours < 24) return `${diffHours}h fa`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} giorni fa`;
  };

  const getEmailStatusIcon = (sub: Subscriber) => {
    const lastEmail = sub.last_email_sent_at;
    if (!lastEmail) return '❓';

    const hoursSince = (new Date().getTime() - new Date(lastEmail).getTime()) / (1000 * 60 * 60);

    if (sub.status === 'completed') return '✅';
    if (hoursSince > 72) return '⚠️'; // Needs attention
    if (hoursSince > 48) return '🔔'; // Reminder pending
    return '✉️'; // Normal
  };

  const filteredSubscribers = subscribers.filter(sub => {
    if (selectedChallenge !== 'all' && sub.challenge !== selectedChallenge) return false;
    if (selectedStatus !== 'all' && sub.status !== selectedStatus) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Caricamento dati challenge...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Challenge Email Manager</h1>
            <p className="text-slate-400 mt-1">
              Gestisci iscritti e monitora il flusso email delle sfide 7 giorni
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={runCronManually}
              disabled={cronRunning}
              className={`px-4 py-2 rounded-lg transition ${
                cronRunning
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              {cronRunning ? 'Esecuzione...' : 'Esegui Cron Manuale'}
            </button>
            <button
              onClick={fetchData}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition"
            >
              Aggiorna
            </button>
            <Link
              href="/admin/ab-testing"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              A/B Testing
            </Link>
          </div>
        </div>

        {/* Cron Result */}
        {cronResult && (
          <div className={`mb-6 p-4 rounded-xl ${cronResult.success ? 'bg-green-900/20 border border-green-500/50' : 'bg-red-900/20 border border-red-500/50'}`}>
            <h3 className={`font-bold mb-2 ${cronResult.success ? 'text-green-400' : 'text-red-400'}`}>
              {cronResult.success ? '✅ Cron eseguito con successo' : '❌ Errore nel cron'}
            </h3>
            {cronResult.results && (
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Day Content:</span>
                  <span className="text-white ml-2">{cronResult.results.day_content_sent} inviati</span>
                  {cronResult.results.day_content_errors > 0 && (
                    <span className="text-red-400 ml-1">({cronResult.results.day_content_errors} errori)</span>
                  )}
                </div>
                <div>
                  <span className="text-slate-400">Reminder:</span>
                  <span className="text-white ml-2">{cronResult.results.reminders_sent} inviati</span>
                </div>
                <div>
                  <span className="text-slate-400">Force Unlock:</span>
                  <span className="text-white ml-2">{cronResult.results.force_unlocks}</span>
                </div>
                <div>
                  <span className="text-slate-400">Post-Challenge:</span>
                  <span className="text-white ml-2">{cronResult.results.post_challenge_sent}</span>
                </div>
              </div>
            )}
            {cronResult.duration_ms && (
              <p className="text-slate-500 text-xs mt-2">Durata: {cronResult.duration_ms}ms</p>
            )}
            {cronResult.error && (
              <p className="text-red-400 mt-2">{cronResult.error}</p>
            )}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.challenge}
              className={`p-6 rounded-xl border ${
                stat.challenge === 'leadership-autentica'
                  ? 'bg-amber-900/20 border-amber-500/50'
                  : stat.challenge === 'oltre-ostacoli'
                  ? 'bg-emerald-900/20 border-emerald-500/50'
                  : 'bg-violet-900/20 border-violet-500/50'
              }`}
            >
              <h3 className="text-white font-bold text-lg mb-4">
                {challengeNames[stat.challenge] || stat.challenge}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Totale</p>
                  <p className="text-2xl font-bold text-white">{stat.total}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Attivi</p>
                  <p className="text-2xl font-bold text-green-400">{stat.active}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Completati</p>
                  <p className="text-2xl font-bold text-blue-400">{stat.completed}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Giorno Medio</p>
                  <p className="text-2xl font-bold text-white">{stat.avgDay}</p>
                </div>
              </div>
            </div>
          ))}
          {stats.length === 0 && (
            <div className="col-span-3 text-center py-12 text-slate-400">
              Nessun iscritto alle challenge ancora
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <select
            value={selectedChallenge}
            onChange={(e) => setSelectedChallenge(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg"
          >
            <option value="all">Tutte le Challenge</option>
            <option value="leadership-autentica">Leadership Autentica</option>
            <option value="oltre-ostacoli">Oltre gli Ostacoli</option>
            <option value="microfelicita">Microfelicita</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg"
          >
            <option value="all">Tutti gli Stati</option>
            <option value="active">Attivi</option>
            <option value="completed">Completati</option>
            <option value="unsubscribed">Disiscritti</option>
          </select>
          <div className="flex-1 text-right text-slate-400">
            {filteredSubscribers.length} iscritti
          </div>
        </div>

        {/* Subscribers Table */}
        <div className="bg-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-400 text-sm border-b border-slate-700 bg-slate-800/50">
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Challenge</th>
                  <th className="px-4 py-3 text-center">Giorno</th>
                  <th className="px-4 py-3">Ultima Email</th>
                  <th className="px-4 py-3">Tipo Email</th>
                  <th className="px-4 py-3">Iscritto</th>
                  <th className="px-4 py-3">Post Email</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((sub) => (
                  <tr
                    key={sub.id}
                    className="border-b border-slate-700/50 hover:bg-slate-700/20 transition"
                  >
                    <td className="px-4 py-3">
                      <span className="text-xl" title={sub.status}>
                        {getEmailStatusIcon(sub)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-white font-medium">{sub.email}</div>
                      {sub.nome && <div className="text-slate-400 text-sm">{sub.nome}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        sub.challenge === 'leadership-autentica'
                          ? 'bg-amber-500/20 text-amber-400'
                          : sub.challenge === 'oltre-ostacoli'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-violet-500/20 text-violet-400'
                      }`}>
                        {challengeNames[sub.challenge] || sub.challenge}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block w-8 h-8 rounded-full text-center leading-8 font-bold ${
                        sub.current_day >= 7
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-slate-700 text-white'
                      }`}>
                        {sub.current_day}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-white text-sm">{formatDate(sub.last_email_sent_at)}</div>
                      <div className="text-slate-500 text-xs">{getTimeSince(sub.last_email_sent_at)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        sub.last_email_type === 'welcome'
                          ? 'bg-purple-500/20 text-purple-400'
                          : sub.last_email_type === 'day_content'
                          ? 'bg-blue-500/20 text-blue-400'
                          : sub.last_email_type === 'reminder'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : sub.last_email_type === 'challenge_complete'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-slate-700 text-slate-400'
                      }`}>
                        {sub.last_email_type || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-sm">
                      {formatDate(sub.subscribed_at)}
                    </td>
                    <td className="px-4 py-3">
                      {sub.status === 'completed' && (
                        <div className="flex gap-1">
                          <span className={`w-2 h-2 rounded-full ${sub.post_email_1_sent ? 'bg-green-400' : 'bg-slate-600'}`} title="Post 1"></span>
                          <span className={`w-2 h-2 rounded-full ${sub.post_email_2_sent ? 'bg-green-400' : 'bg-slate-600'}`} title="Post 2"></span>
                          <span className={`w-2 h-2 rounded-full ${sub.post_email_3_sent ? 'bg-green-400' : 'bg-slate-600'}`} title="Post 3"></span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredSubscribers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                      Nessun iscritto trovato con i filtri selezionati
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-slate-800/50 rounded-xl">
          <h3 className="text-white font-bold mb-3">Legenda Stati Email</h3>
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-xl">✉️</span>
              <span className="text-slate-400">Flusso normale</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🔔</span>
              <span className="text-slate-400">Reminder pendente (48h+)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <span className="text-slate-400">Richiede attenzione (72h+)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">✅</span>
              <span className="text-slate-400">Challenge completata</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">❓</span>
              <span className="text-slate-400">Nessuna email inviata</span>
            </div>
          </div>
        </div>

        {/* Email Flow Info */}
        <div className="mt-6 p-4 bg-slate-800/50 rounded-xl">
          <h3 className="text-white font-bold mb-3">Flusso Email Challenge</h3>
          <div className="text-slate-400 text-sm space-y-2">
            <p><strong className="text-purple-400">Welcome</strong> → Inviata subito dopo iscrizione</p>
            <p><strong className="text-blue-400">Day Content</strong> → Contenuto giornaliero (2h dopo welcome, poi dopo completamento giorno)</p>
            <p><strong className="text-yellow-400">Reminder</strong> → Inviato dopo 48h di inattività</p>
            <p><strong className="text-orange-400">Force Unlock</strong> → Auto-sblocco giorno dopo 72h di inattività</p>
            <p><strong className="text-green-400">Challenge Complete</strong> → Inviata al completamento del Giorno 7</p>
            <p><strong className="text-slate-400">Post Challenge 1/2/3</strong> → Sequenza follow-up (24h, 72h, 7 giorni dopo completamento)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
