// ============================================================================
// PAGE: /affiliate/payouts
// Descrizione: Storico pagamenti e richieste payout per affiliati
// Auth: Richiede autenticazione + status affiliato attivo
// ============================================================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Payout {
  id: string;
  importo_euro: number;
  metodo_pagamento: 'paypal' | 'bonifico' | null;
  stato: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  note: string | null;
  created_at: string;
  processed_at: string | null;
}

interface PayoutsData {
  payouts: Payout[];
  saldo_disponibile: number;
  soglia_minima: number;
}

const STATO_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: 'In attesa', className: 'bg-yellow-100 text-yellow-700' },
  processing: { label: 'In elaborazione', className: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completato', className: 'bg-green-100 text-green-700' },
  failed: { label: 'Fallito', className: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Annullato', className: 'bg-gray-100 text-gray-600' },
};

const METODO_LABELS: Record<string, string> = {
  paypal: 'PayPal',
  bonifico: 'Bonifico Bancario',
};

export default function AffiliatePayoutsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<PayoutsData | null>(null);

  // Form state
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'paypal' | 'bonifico'>('paypal');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login?redirect=/affiliate/payouts');
        return;
      }

      const res = await fetch('/api/affiliate/payouts');
      if (!res.ok) {
        if (res.status === 404) {
          router.push('/affiliate');
          return;
        }
        throw new Error('Errore caricamento dati');
      }

      const payoutsData = await res.json();
      setData(payoutsData);

    } catch (err) {
      console.error('Errore caricamento payouts:', err);
      setError('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleRequestPayout() {
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/affiliate/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metodo: selectedMethod }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Errore nella richiesta');
      }

      setSubmitSuccess(true);
      setShowRequestForm(false);

      // Reload data to show new payout
      await loadData();

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);

    } catch (err) {
      console.error('Errore richiesta payout:', err);
      setError(err instanceof Error ? err.message : 'Errore nella richiesta');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-petrol-600"></div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/affiliate/dashboard" className="text-petrol-600 underline">
            Torna alla Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const canRequestPayout = data.saldo_disponibile >= data.soglia_minima;
  const hasPendingPayout = data.payouts.some(p => p.stato === 'pending' || p.stato === 'processing');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-display font-bold text-petrol-600">
                Pagamenti
              </h1>
              <p className="text-gray-600 text-sm">
                Gestisci le tue richieste di pagamento
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
        {/* Success Message */}
        {submitSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">
              Richiesta di pagamento inviata con successo.
            </p>
            <p className="text-green-700 text-sm mt-1">
              Riceverai il pagamento entro 7 giorni lavorativi.
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Balance Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-500 text-sm mb-1">Saldo Disponibile</p>
              <p className="text-4xl font-bold text-green-600">
                €{data.saldo_disponibile.toFixed(2)}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Soglia minima per il prelievo: <span className="font-medium">€{data.soglia_minima.toFixed(2)}</span>
              </p>
            </div>

            <div className="flex items-center justify-end">
              {!canRequestPayout ? (
                <div className="text-right">
                  <p className="text-gray-500 text-sm">
                    Raggiungi €{data.soglia_minima.toFixed(2)} per richiedere il pagamento
                  </p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-petrol-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((data.saldo_disponibile / data.soglia_minima) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {((data.saldo_disponibile / data.soglia_minima) * 100).toFixed(0)}% raggiunto
                  </p>
                </div>
              ) : hasPendingPayout ? (
                <div className="text-right">
                  <p className="text-yellow-600 font-medium">
                    Hai già una richiesta in corso
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Attendi che venga elaborata
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => setShowRequestForm(!showRequestForm)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Richiedi Pagamento
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Request Form */}
        {showRequestForm && canRequestPayout && !hasPendingPayout && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6 border-2 border-green-200">
            <h2 className="font-semibold text-petrol-600 mb-4">Richiedi Pagamento</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metodo di pagamento
              </label>
              <div className="grid md:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('paypal')}
                  className={`p-4 border-2 rounded-lg text-left transition ${
                    selectedMethod === 'paypal'
                      ? 'border-petrol-600 bg-petrol-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium">PayPal</p>
                  <p className="text-sm text-gray-500">Ricevi in 1-2 giorni lavorativi</p>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMethod('bonifico')}
                  className={`p-4 border-2 rounded-lg text-left transition ${
                    selectedMethod === 'bonifico'
                      ? 'border-petrol-600 bg-petrol-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium">Bonifico Bancario</p>
                  <p className="text-sm text-gray-500">Ricevi in 3-5 giorni lavorativi</p>
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600">
                <strong>Importo richiesta:</strong> €{data.saldo_disponibile.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                L&apos;intero saldo disponibile verrà trasferito.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRequestPayout}
                disabled={submitting}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
              >
                {submitting ? 'Invio in corso...' : 'Conferma Richiesta'}
              </button>
              <button
                onClick={() => setShowRequestForm(false)}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Annulla
              </button>
            </div>
          </div>
        )}

        {/* Payouts History */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="font-semibold text-petrol-600">Storico Pagamenti</h2>
          </div>

          {data.payouts.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-4xl mb-3">💰</div>
              <p className="text-gray-500">
                Non hai ancora richieste di pagamento.
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Quando raggiungerai la soglia minima, potrai richiedere il tuo primo pagamento.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Data Richiesta</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Importo</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Metodo</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Stato</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Data Pagamento</th>
                  </tr>
                </thead>
                <tbody>
                  {data.payouts.map((payout) => {
                    const statoInfo = STATO_LABELS[payout.stato] || { label: payout.stato, className: 'bg-gray-100 text-gray-600' };

                    return (
                      <tr key={payout.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          {new Date(payout.created_at).toLocaleDateString('it-IT', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-4 px-4 text-right font-medium">
                          €{payout.importo_euro.toFixed(2)}
                        </td>
                        <td className="py-4 px-4">
                          {payout.metodo_pagamento
                            ? METODO_LABELS[payout.metodo_pagamento] || payout.metodo_pagamento
                            : '-'}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full ${statoInfo.className}`}>
                            {statoInfo.label}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {payout.processed_at
                            ? new Date(payout.processed_at).toLocaleDateString('it-IT', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-petrol-50 rounded-xl p-6">
          <h3 className="font-semibold text-petrol-700 mb-2">Come funziona?</h3>
          <ul className="text-sm text-petrol-600 space-y-2">
            <li>• Le commissioni maturano 30 giorni dopo l&apos;acquisto del cliente</li>
            <li>• Puoi richiedere il pagamento quando raggiungi €{data.soglia_minima.toFixed(2)}</li>
            <li>• I pagamenti vengono elaborati entro 7 giorni lavorativi</li>
            <li>• PayPal: 1-2 giorni | Bonifico: 3-5 giorni</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
