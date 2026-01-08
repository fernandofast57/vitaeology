// ============================================================================
// PAGE: /affiliate/dashboard
// Descrizione: Dashboard affiliato con stats, struttura commissioni e milestone
// Auth: Richiede utente autenticato + affiliato attivo
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ProssimoObiettivo {
  tipo: string;
  clienti_necessari: number;
  bonus: string;
  descrizione: string;
}

interface Milestone {
  milestone_type: string;
  importo: number;
  is_recurring: boolean;
  achieved_at: string;
}

interface AffiliateStats {
  affiliate: {
    id: string;
    nome: string;
    cognome: string;
    email: string;
    ref_code: string;
    categoria: string;
    stato: string;
    created_at: string;
  };
  stats: {
    totale_click: number;
    totale_conversioni: number;
    totale_commissioni_euro: number;
    saldo_disponibile_euro: number;
    totale_pagato_euro: number;
    clienti_attivi: number;
  };
  commissioni: {
    abbonamento: string;
    base: number;
    bonus_performance: number;
    totale: number;
    bonus_milestone_mensile: number;
    prossimo_obiettivo: ProssimoObiettivo | null;
  };
  milestones: Milestone[];
  recent_clicks: Array<{
    clicked_at: string;
    landing_page: string;
    challenge_type: string;
    stato_conversione: string;
  }>;
  pending_commissions: Array<{
    importo_commissione_euro: number;
    created_at: string;
    prodotto: string;
  }>;
  recent_commissions: Array<{
    importo_commissione_euro: number;
    created_at: string;
    prodotto: string;
    stato: string;
    percentuale_applicata: number;
  }>;
}

export default function AffiliateDashboard() {
  const router = useRouter();
  const [data, setData] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/affiliate/stats');
      if (res.status === 401) {
        router.push('/auth/login?redirect=/affiliate/dashboard');
        return;
      }
      if (res.status === 404) {
        router.push('/affiliate');
        return;
      }
      if (!res.ok) throw new Error('Errore caricamento dati');
      const json = await res.json();
      setData(json);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Errore sconosciuto';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (!data) return;
    const link = `https://vitaeology.com/challenge/leadership?ref=${data.affiliate.ref_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A2540]"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Errore caricamento'}</p>
          <button onClick={() => window.location.reload()} className="text-[#0A2540] underline">
            Riprova
          </button>
        </div>
      </div>
    );
  }

  const conversionRate = data.stats.totale_click > 0
    ? ((data.stats.totale_conversioni / data.stats.totale_click) * 100).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-[#0A2540] text-white py-6 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Affiliato</h1>
            <p className="text-slate-300">Benvenuto, {data.affiliate.nome}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-[#F4B942] text-[#0A2540] rounded-full text-sm font-medium">
              {data.commissioni.abbonamento.charAt(0).toUpperCase() + data.commissioni.abbonamento.slice(1)}
            </span>
            <Link href="/dashboard" className="text-slate-300 hover:text-white">
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-8 px-4">
        {/* Link Rapido */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Il tuo Link Affiliato</h2>
          <div className="flex gap-3">
            <code className="flex-1 px-4 py-3 bg-slate-100 rounded-lg text-sm text-slate-700 overflow-x-auto">
              https://vitaeology.com/challenge/leadership?ref={data.affiliate.ref_code}
            </code>
            <button
              onClick={copyLink}
              className="px-6 py-3 bg-[#0A2540] text-white rounded-lg hover:bg-[#0A2540]/90 transition whitespace-nowrap"
            >
              {copied ? '✓ Copiato!' : 'Copia'}
            </button>
          </div>
          <p className="text-sm text-slate-500 mt-2">
            Cookie: 90 giorni | Commissione: {data.commissioni.totale}% | Codice: {data.affiliate.ref_code}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <StatCard
            title="Click Totali"
            value={data.stats.totale_click.toLocaleString()}
            icon="cursor"
          />
          <StatCard
            title="Conversioni"
            value={data.stats.totale_conversioni.toLocaleString()}
            subtitle={`${conversionRate}% tasso`}
            icon="check"
          />
          <StatCard
            title="Clienti Attivi"
            value={data.stats.clienti_attivi.toLocaleString()}
            icon="users"
          />
          <StatCard
            title="Commissioni Totali"
            value={`€${data.stats.totale_commissioni_euro.toFixed(2)}`}
            icon="euro"
          />
          <StatCard
            title="Saldo Disponibile"
            value={`€${data.stats.saldo_disponibile_euro.toFixed(2)}`}
            highlight={data.stats.saldo_disponibile_euro >= 50}
            icon="wallet"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Struttura Commissioni */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-[#0A2540] mb-4">
              La Tua Struttura Commissioni
            </h3>

            <div className="space-y-4">
              {/* Abbonamento */}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Tuo abbonamento</span>
                <span className="font-medium text-[#0A2540] capitalize">
                  {data.commissioni.abbonamento}
                </span>
              </div>

              {/* Commissione Base */}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Commissione base</span>
                <span className="font-medium text-[#0A2540]">
                  {data.commissioni.base}%
                </span>
              </div>

              {/* Bonus Performance */}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Bonus performance</span>
                <span className={`font-medium ${data.commissioni.bonus_performance > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                  {data.commissioni.bonus_performance > 0
                    ? `+${data.commissioni.bonus_performance}%`
                    : 'Non ancora sbloccato'}
                </span>
              </div>

              {/* Totale */}
              <div className="flex justify-between items-center py-3 bg-[#0A2540]/5 rounded-lg px-3 -mx-3">
                <span className="font-semibold text-[#0A2540]">Commissione totale</span>
                <span className="text-2xl font-bold text-[#F4B942]">
                  {data.commissioni.totale}%
                </span>
              </div>

              {/* Bonus Milestone Mensile (se attivo) */}
              {data.commissioni.bonus_milestone_mensile > 0 && (
                <div className="flex justify-between items-center py-3 bg-[#F4B942]/10 rounded-lg px-3 -mx-3 mt-2">
                  <span className="font-medium text-[#0A2540]">🏆 Bonus mensile</span>
                  <span className="text-xl font-bold text-[#0A2540]">
                    €{data.commissioni.bonus_milestone_mensile}/mese
                  </span>
                </div>
              )}
            </div>

            {/* Prossimo Obiettivo */}
            {data.commissioni.prossimo_obiettivo && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎯</span>
                  <div className="flex-1">
                    <p className="font-medium text-blue-900">
                      Prossimo obiettivo: {data.commissioni.prossimo_obiettivo.bonus}
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      {data.commissioni.prossimo_obiettivo.descrizione}
                    </p>
                    {/* Progress bar */}
                    <div className="mt-3 h-2 bg-blue-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (data.stats.clienti_attivi / (data.stats.clienti_attivi + data.commissioni.prossimo_obiettivo.clienti_necessari)) * 100)}%`
                        }}
                      />
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      {data.stats.clienti_attivi} / {data.stats.clienti_attivi + data.commissioni.prossimo_obiettivo.clienti_necessari} clienti
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Milestone Raggiunti */}
            {data.milestones && data.milestones.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-3">Traguardi raggiunti</h4>
                <div className="space-y-2">
                  {data.milestones.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-700">
                        {m.milestone_type === 'prima_vendita' && 'Prima vendita'}
                        {m.milestone_type === '50_clienti' && '50 clienti attivi'}
                        {m.milestone_type === '100_clienti' && '100 clienti attivi'}
                      </span>
                      <span className="text-gray-400 ml-auto">
                        €{m.importo}{m.is_recurring ? '/mese' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Azioni Rapide */}
          <div className="space-y-4">
            <Link
              href="/affiliate/links"
              className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#0A2540]/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#0A2540]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Genera Link</h3>
                  <p className="text-sm text-slate-600">Crea link personalizzati con UTM</p>
                </div>
              </div>
            </Link>

            {data.stats.saldo_disponibile_euro >= 50 && (
              <button
                onClick={() => alert('Funzione payout in arrivo!')}
                className="block w-full p-6 bg-green-50 border-2 border-green-200 rounded-xl text-left hover:bg-green-100 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800">Richiedi Payout</h3>
                    <p className="text-sm text-green-600">Hai €{data.stats.saldo_disponibile_euro.toFixed(2)} disponibili</p>
                  </div>
                </div>
              </button>
            )}

            <Link
              href="/affiliate"
              className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#F4B942]/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#F4B942]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Materiali Marketing</h3>
                  <p className="text-sm text-slate-600">Badge, banner, email template</p>
                </div>
              </div>
            </Link>

            {/* Info Parametri */}
            <div className="p-4 bg-slate-100 rounded-xl">
              <h4 className="text-sm font-medium text-slate-600 mb-2">Parametri Programma</h4>
              <ul className="text-sm text-slate-500 space-y-1">
                <li>• Cookie: 90 giorni</li>
                <li>• Ricorrenza: A vita sui rinnovi</li>
                <li>• Payout minimo: €50</li>
                <li>• Elaborazione: 5 giorni lavorativi</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Ultime Commissioni */}
        {data.pending_commissions.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Commissioni in Attesa</h2>
            <div className="space-y-3">
              {data.pending_commissions.map((c, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <span className="font-medium text-slate-800">{c.prodotto}</span>
                    <span className="text-sm text-slate-500 ml-2">
                      {new Date(c.created_at).toLocaleDateString('it-IT')}
                    </span>
                  </div>
                  <span className="font-semibold text-[#F4B942]">
                    +€{Number(c.importo_commissione_euro).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Storico Commissioni */}
        {data.recent_commissions && data.recent_commissions.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Ultime Commissioni</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-600">Data</th>
                    <th className="text-left py-2 font-medium text-gray-600">Prodotto</th>
                    <th className="text-center py-2 font-medium text-gray-600">%</th>
                    <th className="text-right py-2 font-medium text-gray-600">Importo</th>
                    <th className="text-center py-2 font-medium text-gray-600">Stato</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_commissions.map((c, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-3 text-gray-600">
                        {new Date(c.created_at).toLocaleDateString('it-IT')}
                      </td>
                      <td className="py-3 font-medium text-gray-800">{c.prodotto}</td>
                      <td className="py-3 text-center text-gray-600">{c.percentuale_applicata}%</td>
                      <td className="py-3 text-right font-semibold text-[#0A2540]">
                        €{Number(c.importo_commissione_euro).toFixed(2)}
                      </td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                          ${c.stato === 'approved' ? 'bg-green-100 text-green-800' : ''}
                          ${c.stato === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${c.stato === 'paid' ? 'bg-blue-100 text-blue-800' : ''}
                        `}>
                          {c.stato === 'approved' && 'Approvata'}
                          {c.stato === 'pending' && 'In attesa'}
                          {c.stato === 'paid' && 'Pagata'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ title, value, subtitle, highlight, icon }: {
  title: string;
  value: string;
  subtitle?: string;
  highlight?: boolean;
  icon: string;
}) {
  return (
    <div className={`p-5 rounded-xl shadow-sm ${highlight ? 'bg-green-50 border-2 border-green-200' : 'bg-white border border-gray-100'}`}>
      <p className="text-sm text-slate-500 mb-1">{title}</p>
      <p className={`text-2xl font-bold ${highlight ? 'text-green-700' : 'text-slate-800'}`}>{value}</p>
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
}
