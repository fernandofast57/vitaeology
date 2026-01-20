// ============================================================================
// PAGE: /affiliate/dashboard
// Descrizione: Dashboard affiliato - statistiche, link, commissioni
// Auth: Richiede autenticazione + status affiliato attivo
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

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
    prossimo_obiettivo: {
      tipo: string;
      clienti_necessari: number;
      bonus: string;
      descrizione: string;
    } | null;
  };
  milestones: Array<{
    milestone_type: string;
    importo: number;
    is_recurring: boolean;
    achieved_at: string;
  }>;
  recent_clicks: Array<{
    clicked_at: string;
    landing_page: string;
    challenge_type: string;
    stato_conversione: string;
  }>;
  recent_commissions: Array<{
    importo_commissione_euro: number;
    created_at: string;
    prodotto: string;
    stato: string;
    percentuale_applicata: number;
  }>;
}

interface AffiliateLink {
  id: string;
  destination_type: string;
  challenge_type: string | null;
  url_generato: string;
  nome_link: string | null;
  totale_click: number;
  totale_conversioni: number;
  created_at: string;
}

export default function AffiliateDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'links' | 'commissions'>('overview');
  const [copySuccess, setCopySuccess] = useState('');
  const [creatingLink, setCreatingLink] = useState(false);
  const [newLink, setNewLink] = useState({
    destination_type: 'challenge',
    challenge_type: 'leadership',
    nome_link: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login?redirect=/affiliate/dashboard');
        return;
      }

      // Load stats
      const statsRes = await fetch('/api/affiliate/stats');
      if (!statsRes.ok) {
        if (statsRes.status === 404) {
          router.push('/affiliate');
          return;
        }
        throw new Error('Errore caricamento statistiche');
      }
      const statsData = await statsRes.json();
      setStats(statsData);

      // Load links
      const linksRes = await fetch('/api/affiliate/links');
      if (linksRes.ok) {
        const linksData = await linksRes.json();
        setLinks(linksData.links || []);
      }

    } catch (err) {
      console.error('Errore caricamento dati:', err);
      setError('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  }

  async function createNewLink() {
    setCreatingLink(true);
    try {
      const res = await fetch('/api/affiliate/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLink),
      });

      if (!res.ok) throw new Error('Errore creazione link');

      const data = await res.json();
      setLinks([data.link, ...links]);
      setNewLink({ destination_type: 'challenge', challenge_type: 'leadership', nome_link: '' });
    } catch (err) {
      console.error('Errore creazione link:', err);
    } finally {
      setCreatingLink(false);
    }
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopySuccess(label);
    setTimeout(() => setCopySuccess(''), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-petrol-600"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Dati non disponibili'}</p>
          <Link href="/affiliate" className="text-petrol-600 underline">
            Torna alla pagina affiliati
          </Link>
        </div>
      </div>
    );
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://vitaeology.com';
  const defaultLink = `${baseUrl}/challenge/leadership?ref=${stats.affiliate.ref_code}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-display font-bold text-petrol-600">
                Dashboard Partner
              </h1>
              <p className="text-gray-600 text-sm">
                Ciao {stats.affiliate.nome}, ecco le tue statistiche
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-petrol-600 hover:text-petrol-700 text-sm font-medium"
            >
              Torna alla Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Banner */}
        {stats.affiliate.stato === 'pending' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              Il tuo account affiliato è in attesa di approvazione.
              Riceverai una email quando sarà attivato.
            </p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Saldo Disponibile</p>
            <p className="text-3xl font-bold text-green-600">
              {stats.stats.saldo_disponibile_euro.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Totale Guadagnato</p>
            <p className="text-3xl font-bold text-petrol-600">
              {stats.stats.totale_commissioni_euro.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Click Totali</p>
            <p className="text-3xl font-bold text-petrol-600">
              {stats.stats.totale_click}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Conversioni</p>
            <p className="text-3xl font-bold text-petrol-600">
              {stats.stats.totale_conversioni}
            </p>
          </div>
        </div>

        {/* Main Link Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h2 className="font-semibold text-petrol-600 mb-4">Il tuo link principale</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              readOnly
              value={defaultLink}
              className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm"
            />
            <button
              onClick={() => copyToClipboard(defaultLink, 'main')}
              className="px-4 py-2 bg-petrol-600 text-white rounded-lg hover:bg-petrol-700 transition whitespace-nowrap"
            >
              {copySuccess === 'main' ? 'Copiato!' : 'Copia Link'}
            </button>
          </div>
          <p className="text-gray-500 text-sm mt-2">
            Codice affiliato: <span className="font-mono font-semibold">{stats.affiliate.ref_code}</span>
          </p>
        </div>

        {/* Commission Info */}
        <div className="bg-gradient-to-r from-petrol-600 to-petrol-700 rounded-xl p-6 text-white mb-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-petrol-200 text-sm mb-1">La tua commissione</p>
              <p className="text-4xl font-bold">{stats.commissioni.totale}%</p>
              <p className="text-petrol-200 text-sm mt-1">
                Base {stats.commissioni.base}% + Bonus {stats.commissioni.bonus_performance}%
              </p>
            </div>
            <div>
              <p className="text-petrol-200 text-sm mb-1">Clienti attivi</p>
              <p className="text-4xl font-bold">{stats.stats.clienti_attivi}</p>
            </div>
            {stats.commissioni.prossimo_obiettivo && (
              <div>
                <p className="text-petrol-200 text-sm mb-1">Prossimo obiettivo</p>
                <p className="text-lg font-semibold">{stats.commissioni.prossimo_obiettivo.bonus}</p>
                <p className="text-petrol-200 text-sm">
                  {stats.commissioni.prossimo_obiettivo.descrizione}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition ${
                  activeTab === 'overview'
                    ? 'border-petrol-600 text-petrol-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Panoramica
              </button>
              <button
                onClick={() => setActiveTab('links')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition ${
                  activeTab === 'links'
                    ? 'border-petrol-600 text-petrol-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                I miei link
              </button>
              <button
                onClick={() => setActiveTab('commissions')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition ${
                  activeTab === 'commissions'
                    ? 'border-petrol-600 text-petrol-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Commissioni
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-petrol-600 mb-4">Attività recente</h3>
                  {stats.recent_clicks.length === 0 ? (
                    <p className="text-gray-500 text-sm">I click sui tuoi link appariranno qui.</p>
                  ) : (
                    <div className="space-y-2">
                      {stats.recent_clicks.slice(0, 5).map((click, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100">
                          <div>
                            <span className="text-sm font-medium">
                              {click.challenge_type || 'Challenge'}
                            </span>
                            <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                              click.stato_conversione === 'converted'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {click.stato_conversione === 'converted' ? 'Convertito' : 'Click'}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(click.clicked_at).toLocaleDateString('it-IT')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {stats.milestones.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-petrol-600 mb-4">Milestone raggiunti</h3>
                    <div className="space-y-2">
                      {stats.milestones.map((m, i) => (
                        <div key={i} className="flex items-center gap-3 py-2">
                          <span className="text-2xl">&#127942;</span>
                          <div>
                            <p className="font-medium">{m.milestone_type}</p>
                            <p className="text-sm text-gray-500">
                              {m.importo} {m.is_recurring ? '/mese' : 'una tantum'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Links Tab */}
            {activeTab === 'links' && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-petrol-600 mb-4">Crea nuovo link</h3>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Destinazione</label>
                      <select
                        value={newLink.destination_type}
                        onChange={(e) => setNewLink({ ...newLink, destination_type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                      >
                        <option value="challenge">Challenge</option>
                        <option value="homepage">Homepage</option>
                        <option value="pricing">Pricing</option>
                      </select>
                    </div>
                    {newLink.destination_type === 'challenge' && (
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Challenge</label>
                        <select
                          value={newLink.challenge_type}
                          onChange={(e) => setNewLink({ ...newLink, challenge_type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                        >
                          <option value="leadership">Leadership</option>
                          <option value="ostacoli">Ostacoli</option>
                          <option value="microfelicita">Microfelicità</option>
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Nome (opzionale)</label>
                      <input
                        type="text"
                        value={newLink.nome_link}
                        onChange={(e) => setNewLink({ ...newLink, nome_link: e.target.value })}
                        placeholder="Es: Instagram Bio"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={createNewLink}
                        disabled={creatingLink}
                        className="w-full px-4 py-2 bg-petrol-600 text-white rounded-lg hover:bg-petrol-700 transition disabled:opacity-50"
                      >
                        {creatingLink ? 'Creazione...' : 'Crea Link'}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-petrol-600 mb-4">I tuoi link</h3>
                  {links.length === 0 ? (
                    <p className="text-gray-500 text-sm">I tuoi link personalizzati appariranno qui.</p>
                  ) : (
                    <div className="space-y-3">
                      {links.map((link) => (
                        <div key={link.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {link.nome_link || link.destination_type}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{link.url_generato}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {link.totale_click} click - {link.totale_conversioni} conversioni
                            </p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(link.url_generato, link.id)}
                            className="px-3 py-1 text-sm bg-white border border-gray-200 rounded hover:bg-gray-50 transition"
                          >
                            {copySuccess === link.id ? 'OK' : 'Copia'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Commissions Tab */}
            {activeTab === 'commissions' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-petrol-600">Storico commissioni</h3>
                  {stats.stats.saldo_disponibile_euro >= 50 && (
                    <button
                      onClick={() => router.push('/affiliate/payout')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                    >
                      Richiedi Pagamento
                    </button>
                  )}
                </div>

                {stats.recent_commissions.length === 0 ? (
                  <p className="text-gray-500 text-sm">Le tue commissioni appariranno qui.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-2 font-medium text-gray-600">Data</th>
                          <th className="text-left py-3 px-2 font-medium text-gray-600">Prodotto</th>
                          <th className="text-right py-3 px-2 font-medium text-gray-600">%</th>
                          <th className="text-right py-3 px-2 font-medium text-gray-600">Importo</th>
                          <th className="text-center py-3 px-2 font-medium text-gray-600">Stato</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recent_commissions.map((c, i) => (
                          <tr key={i} className="border-b border-gray-100">
                            <td className="py-3 px-2">
                              {new Date(c.created_at).toLocaleDateString('it-IT')}
                            </td>
                            <td className="py-3 px-2">{c.prodotto}</td>
                            <td className="py-3 px-2 text-right">{c.percentuale_applicata}%</td>
                            <td className="py-3 px-2 text-right font-medium">
                              {c.importo_commissione_euro.toFixed(2)}
                            </td>
                            <td className="py-3 px-2 text-center">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                c.stato === 'approved' ? 'bg-green-100 text-green-700' :
                                c.stato === 'paid' ? 'bg-blue-100 text-blue-700' :
                                c.stato === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {c.stato === 'approved' ? 'Approvata' :
                                 c.stato === 'paid' ? 'Pagata' :
                                 c.stato === 'pending' ? 'In attesa' : c.stato}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <p className="text-sm text-gray-500">
                  Le commissioni maturano dopo 30 giorni. Puoi richiedere il pagamento quando il saldo raggiunge 50 euro.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
