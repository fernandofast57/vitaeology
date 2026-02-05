// ============================================================================
// PAGE: /affiliate/leaderboard
// Descrizione: Classifica top affiliati - gamification
// Auth: Opzionale (mostra classifica a tutti, posizione utente se loggato)
// ============================================================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface LeaderboardEntry {
  posizione: number;
  nome_visualizzato: string;
  totale_commissioni: number;
  totale_clienti: number;
  categoria: string;
  is_current_user: boolean;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  current_user: {
    posizione: number;
    totale_commissioni: number;
    totale_clienti: number;
  } | null;
  period: string;
}

const CATEGORIA_LABELS: Record<string, { label: string; className: string }> = {
  AFFILIATO: { label: 'Affiliato', className: 'bg-gray-100 text-gray-700' },
  PARTNER: { label: 'Partner', className: 'bg-blue-100 text-blue-700' },
  AMBASSADOR: { label: 'Ambassador', className: 'bg-purple-100 text-purple-700' },
  VIP: { label: 'VIP', className: 'bg-amber-100 text-amber-700' },
};

// Medaglie per top 3
const MEDALS = ['🥇', '🥈', '🥉'];

export default function AffiliateLeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [period, setPeriod] = useState<'all' | 'month'>('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/affiliate/leaderboard?period=${period}`);
      if (!res.ok) {
        throw new Error('Errore caricamento classifica');
      }

      const leaderboardData = await res.json();
      setData(leaderboardData);

    } catch (err) {
      console.error('Errore caricamento leaderboard:', err);
      setError('Errore nel caricamento della classifica');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const userInTop20 = data?.leaderboard.some(entry => entry.is_current_user);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-display font-bold text-petrol-600">
                Classifica Partner
              </h1>
              <p className="text-gray-600 text-sm">
                I migliori affiliati Vitaeology
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
        {/* Period Filter */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setPeriod('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                period === 'all'
                  ? 'bg-petrol-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Di sempre
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                period === 'month'
                  ? 'bg-petrol-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Questo mese
            </button>
          </div>
        </div>

        {/* Current User Position Card (if not in top 20) */}
        {data?.current_user && !userInTop20 && (
          <div className="bg-gradient-to-r from-petrol-600 to-petrol-700 rounded-xl p-6 text-white mb-6">
            <p className="text-petrol-200 text-sm mb-1">La tua posizione</p>
            <div className="flex items-baseline gap-4">
              <span className="text-5xl font-bold">#{data.current_user.posizione}</span>
              <div>
                <p className="text-lg">€{data.current_user.totale_commissioni.toFixed(2)}</p>
                <p className="text-petrol-200 text-sm">{data.current_user.totale_clienti} clienti</p>
              </div>
            </div>
            <p className="text-petrol-200 text-sm mt-3">
              Continua così! Porta nuovi clienti per scalare la classifica.
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadData}
              className="mt-3 text-petrol-600 underline text-sm"
            >
              Riprova
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl p-12 shadow-sm flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-petrol-600"></div>
          </div>
        )}

        {/* Leaderboard Table */}
        {!loading && !error && data && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {data.leaderboard.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-gray-400 text-5xl mb-4">🏆</div>
                <p className="text-gray-500 text-lg">
                  {period === 'month'
                    ? 'Nessuna commissione questo mese'
                    : 'La classifica è ancora vuota'}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Sii il primo a portare clienti!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-center py-4 px-4 font-semibold text-gray-600 w-16">#</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-600">Partner</th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-600">Livello</th>
                      <th className="text-right py-4 px-4 font-semibold text-gray-600">Clienti</th>
                      <th className="text-right py-4 px-4 font-semibold text-gray-600">Commissioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.leaderboard.map((entry) => {
                      const catInfo = CATEGORIA_LABELS[entry.categoria] || CATEGORIA_LABELS.AFFILIATO;
                      const isTopThree = entry.posizione <= 3;

                      return (
                        <tr
                          key={entry.posizione}
                          className={`border-b border-gray-100 transition ${
                            entry.is_current_user
                              ? 'bg-petrol-50 border-petrol-200'
                              : isTopThree
                              ? 'bg-amber-50/50'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <td className="py-4 px-4 text-center">
                            {isTopThree ? (
                              <span className="text-2xl">{MEDALS[entry.posizione - 1]}</span>
                            ) : (
                              <span className="text-gray-500 font-medium">{entry.posizione}</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${entry.is_current_user ? 'text-petrol-700' : 'text-gray-900'}`}>
                                {entry.nome_visualizzato}
                              </span>
                              {entry.is_current_user && (
                                <span className="text-xs bg-petrol-600 text-white px-2 py-0.5 rounded-full">
                                  Tu
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`text-xs px-2 py-1 rounded-full ${catInfo.className}`}>
                              {catInfo.label}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right text-gray-600">
                            {entry.totale_clienti}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className={`font-semibold ${isTopThree ? 'text-amber-600' : 'text-gray-900'}`}>
                              €{entry.totale_commissioni.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Motivational Box */}
        {!loading && !error && (
          <div className="mt-6 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
            <div className="flex items-start gap-4">
              <span className="text-3xl">🚀</span>
              <div>
                <h3 className="font-semibold text-amber-800 mb-1">Come salire in classifica?</h3>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Condividi il tuo link nelle community di imprenditori</li>
                  <li>• Scrivi contenuti che parlano delle sfide della leadership</li>
                  <li>• Consiglia Vitaeology a chi sta affrontando un momento di crescita</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* CTA for non-affiliates */}
        {!data?.current_user && !loading && (
          <div className="mt-6 bg-white rounded-xl p-6 shadow-sm text-center">
            <p className="text-gray-600 mb-4">
              Non sei ancora affiliato?
            </p>
            <Link
              href="/affiliate"
              className="inline-block px-6 py-3 bg-petrol-600 text-white rounded-lg hover:bg-petrol-700 transition font-medium"
            >
              Diventa Partner Vitaeology
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
