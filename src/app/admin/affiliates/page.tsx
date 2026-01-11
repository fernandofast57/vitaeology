// ============================================================================
// PAGE: /admin/affiliates
// Descrizione: Gestione affiliati per admin con struttura commissioni
// Auth: Richiede admin (is_admin = true)
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Affiliate {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  ref_code: string;
  categoria: string;
  stato: string;
  abbonamento_utente: string;
  commissione_base: number;
  bonus_performance: number;
  bonus_milestone_mensile: number;
  commissione_totale: number;
  totale_clienti_attivi: number;
  totale_click: number;
  totale_conversioni: number;
  totale_commissioni_euro: number;
  totale_pagato_euro: number;
  saldo_disponibile_euro: number;
  created_at: string;
}

interface Totals {
  affiliati_totali: number;
  affiliati_attivi: number;
  affiliati_pending: number;
  saldo_totale_pending: number;
  commissioni_totali_pagate: number;
  commissioni_totali_generate: number;
  bonus_milestone_mensili: number;
  totale_click: number;
  totale_conversioni: number;
  totale_clienti_attivi: number;
}

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'attivo' | 'sospeso'>('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const fetchAffiliates = async () => {
    try {
      const res = await fetch('/api/admin/affiliates');
      if (!res.ok) throw new Error('Errore');
      const data = await res.json();
      setAffiliates(data.affiliates || []);
      setTotals(data.totals || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, stato: string) => {
    try {
      const res = await fetch('/api/admin/affiliates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stato }),
      });
      if (!res.ok) throw new Error('Errore');
      await fetchAffiliates();
    } catch (err) {
      alert('Errore aggiornamento stato');
    }
  };

  const filteredAffiliates = affiliates.filter(a => {
    if (filter === 'all') return true;
    return a.stato === filter;
  });

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
            <h1 className="text-2xl font-bold">Gestione Affiliati</h1>
            <p className="text-slate-300">Admin Panel - Struttura Commissioni</p>
          </div>
          <Link href="/admin" className="text-slate-300 hover:text-white">
            &larr; Admin
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4">
        {/* Stats Cards */}
        {totals && (
          <div className="grid md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <p className="text-sm text-slate-500">Affiliati Totali</p>
              <p className="text-3xl font-bold text-slate-800">{totals.affiliati_totali}</p>
              <p className="text-xs text-slate-400 mt-1">
                {totals.affiliati_attivi} attivi, {totals.affiliati_pending} pending
              </p>
            </div>
            <div className="bg-yellow-50 p-6 rounded-xl shadow-sm border border-yellow-200">
              <p className="text-sm text-yellow-700">Saldo Pending</p>
              <p className="text-3xl font-bold text-yellow-800">
                &euro;{totals.saldo_totale_pending.toFixed(0)}
              </p>
              <p className="text-xs text-yellow-600 mt-1">Da pagare agli affiliati</p>
            </div>
            <div className="bg-green-50 p-6 rounded-xl shadow-sm border border-green-200">
              <p className="text-sm text-green-700">Commissioni Pagate</p>
              <p className="text-3xl font-bold text-green-800">
                &euro;{totals.commissioni_totali_pagate.toFixed(0)}
              </p>
              <p className="text-xs text-green-600 mt-1">Totale storico</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-xl shadow-sm border border-purple-200">
              <p className="text-sm text-purple-700">Bonus Milestone Mensili</p>
              <p className="text-3xl font-bold text-purple-800">
                &euro;{totals.bonus_milestone_mensili.toFixed(0)}
              </p>
              <p className="text-xs text-purple-600 mt-1">Da pagare questo mese</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl shadow-sm border border-blue-200">
              <p className="text-sm text-blue-700">Performance Totale</p>
              <p className="text-3xl font-bold text-blue-800">{totals.totale_clienti_attivi}</p>
              <p className="text-xs text-blue-600 mt-1">
                {totals.totale_click} click &rarr; {totals.totale_conversioni} conv.
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'attivo', 'sospeso'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === f
                  ? 'bg-[#0A2540] text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f === 'all' ? 'Tutti' : f === 'pending' ? 'In Attesa' : f === 'attivo' ? 'Attivi' : 'Sospesi'}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-slate-600">Affiliato</th>
                  <th className="text-center p-4 text-sm font-medium text-slate-600">Ref Code</th>
                  <th className="text-center p-4 text-sm font-medium text-slate-600">Stato</th>
                  <th className="text-center p-4 text-sm font-medium text-slate-600">Commissione</th>
                  <th className="text-right p-4 text-sm font-medium text-slate-600">Clienti</th>
                  <th className="text-right p-4 text-sm font-medium text-slate-600">Saldo</th>
                  <th className="text-right p-4 text-sm font-medium text-slate-600">Totale</th>
                  <th className="text-center p-4 text-sm font-medium text-slate-600">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filteredAffiliates.map((a) => (
                  <>
                    <tr
                      key={a.id}
                      className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                      onClick={() => setExpandedRow(expandedRow === a.id ? null : a.id)}
                    >
                      <td className="p-4">
                        <p className="font-medium text-slate-800">{a.nome} {a.cognome}</p>
                        <p className="text-sm text-slate-500">{a.email}</p>
                      </td>
                      <td className="p-4 text-center">
                        <code className="text-sm bg-slate-100 px-2 py-1 rounded">{a.ref_code}</code>
                      </td>
                      <td className="p-4 text-center">
                        <StatusBadge status={a.stato} />
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-bold text-lg text-[#0A2540]">{a.commissione_totale}%</span>
                          <span className="text-xs text-slate-500">
                            {a.commissione_base}% + {a.bonus_performance}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-medium text-slate-800">{a.totale_clienti_attivi || 0}</span>
                        <p className="text-xs text-slate-500">
                          {a.totale_click} click / {a.totale_conversioni} conv
                        </p>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-medium text-yellow-700">
                          &euro;{Number(a.saldo_disponibile_euro || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-bold text-slate-800">
                          &euro;{Number(a.totale_commissioni_euro || 0).toFixed(2)}
                        </span>
                        <p className="text-xs text-green-600">
                          Pagato: &euro;{Number(a.totale_pagato_euro || 0).toFixed(0)}
                        </p>
                      </td>
                      <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                        {a.stato === 'pending' && (
                          <button
                            onClick={() => updateStatus(a.id, 'attivo')}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            Approva
                          </button>
                        )}
                        {a.stato === 'attivo' && (
                          <button
                            onClick={() => updateStatus(a.id, 'sospeso')}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                          >
                            Sospendi
                          </button>
                        )}
                        {a.stato === 'sospeso' && (
                          <button
                            onClick={() => updateStatus(a.id, 'attivo')}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            Riattiva
                          </button>
                        )}
                      </td>
                    </tr>
                    {/* Expanded Row - Dettagli Commissioni */}
                    {expandedRow === a.id && (
                      <tr key={`${a.id}-details`} className="bg-slate-50">
                        <td colSpan={8} className="p-4">
                          <div className="grid md:grid-cols-4 gap-4">
                            {/* Struttura Commissioni */}
                            <div className="bg-white p-4 rounded-lg border">
                              <h4 className="font-medium text-slate-700 mb-2">Struttura Commissioni</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Base:</span>
                                  <span className="font-medium">{a.commissione_base}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Bonus Performance:</span>
                                  <span className="font-medium text-green-600">+{a.bonus_performance}%</span>
                                </div>
                                <div className="flex justify-between border-t pt-1 mt-1">
                                  <span className="font-medium">Totale:</span>
                                  <span className="font-bold text-[#0A2540]">{a.commissione_totale}%</span>
                                </div>
                              </div>
                            </div>

                            {/* Bonus Milestone */}
                            <div className="bg-white p-4 rounded-lg border">
                              <h4 className="font-medium text-slate-700 mb-2">Bonus Milestone</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Bonus Mensile:</span>
                                  <span className="font-medium text-purple-600">
                                    &euro;{Number(a.bonus_milestone_mensile || 0).toFixed(0)}/mese
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Clienti Attivi:</span>
                                  <span className="font-medium">{a.totale_clienti_attivi || 0}</span>
                                </div>
                                <div className="mt-2">
                                  <MilestoneProgress clienti={a.totale_clienti_attivi || 0} />
                                </div>
                              </div>
                            </div>

                            {/* Abbonamento */}
                            <div className="bg-white p-4 rounded-lg border">
                              <h4 className="font-medium text-slate-700 mb-2">Dettagli</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Categoria:</span>
                                  <span className="px-2 py-0.5 bg-[#F4B942]/20 text-[#0A2540] rounded text-xs">
                                    {a.categoria}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Piano Utente:</span>
                                  <span className="font-medium capitalize">{a.abbonamento_utente || 'leader'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Iscritto:</span>
                                  <span className="text-slate-600">
                                    {new Date(a.created_at).toLocaleDateString('it-IT')}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Riepilogo Economico */}
                            <div className="bg-white p-4 rounded-lg border">
                              <h4 className="font-medium text-slate-700 mb-2">Riepilogo Economico</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Totale Generato:</span>
                                  <span className="font-medium">
                                    &euro;{Number(a.totale_commissioni_euro || 0).toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Totale Pagato:</span>
                                  <span className="font-medium text-green-600">
                                    &euro;{Number(a.totale_pagato_euro || 0).toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between border-t pt-1 mt-1">
                                  <span className="font-medium">Da Pagare:</span>
                                  <span className="font-bold text-yellow-700">
                                    &euro;{Number(a.saldo_disponibile_euro || 0).toFixed(2)}
                                  </span>
                                </div>
                              </div>
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

          {filteredAffiliates.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              Nessun affiliato trovato con questo filtro
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'In Attesa' },
    attivo: { bg: 'bg-green-100', text: 'text-green-800', label: 'Attivo' },
    sospeso: { bg: 'bg-red-100', text: 'text-red-800', label: 'Sospeso' },
    terminato: { bg: 'bg-slate-100', text: 'text-slate-800', label: 'Terminato' },
  };
  const c = config[status] || config.pending;
  return (
    <span className={`px-2 py-1 rounded text-sm ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

function MilestoneProgress({ clienti }: { clienti: number }) {
  const milestones = [
    { soglia: 10, bonus: '+3%' },
    { soglia: 30, bonus: '+5%' },
    { soglia: 50, bonus: '500/m' },
    { soglia: 100, bonus: '1000/m' },
  ];

  const currentMilestone = milestones.findIndex(m => clienti < m.soglia);
  const nextMilestone = currentMilestone === -1 ? null : milestones[currentMilestone];
  const progress = nextMilestone ? (clienti / nextMilestone.soglia) * 100 : 100;

  return (
    <div>
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>{clienti} clienti</span>
        <span>{nextMilestone ? `${nextMilestone.soglia} per ${nextMilestone.bonus}` : 'Max raggiunto'}</span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-purple-500 rounded-full transition-all"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}
