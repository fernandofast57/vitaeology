#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, '..', 'src', 'app');

// Dashboard Affiliato
const dashboardContent = `// ============================================================================
// PAGE: /affiliate/dashboard
// Descrizione: Dashboard affiliato con stats e azioni rapide
// Auth: Richiede utente autenticato + affiliato attivo
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AffiliateStats {
  affiliate: {
    id: string;
    nome: string;
    email: string;
    ref_code: string;
    categoria: string;
    commissione_percentuale: number;
    stato: string;
  };
  stats: {
    totale_click: number;
    totale_conversioni: number;
    totale_commissioni_euro: number;
    saldo_disponibile_euro: number;
    totale_pagato_euro: number;
  };
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (!data) return;
    const link = \`https://vitaeology.com/challenge/leadership?ref=\${data.affiliate.ref_code}\`;
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
              {data.affiliate.categoria}
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
            Cookie: 90 giorni | Commissione: {data.affiliate.commissione_percentuale}%
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Click Totali"
            value={data.stats.totale_click.toLocaleString()}
            icon="cursor"
          />
          <StatCard
            title="Conversioni"
            value={data.stats.totale_conversioni.toLocaleString()}
            subtitle={\`\${conversionRate}% tasso\`}
            icon="check"
          />
          <StatCard
            title="Commissioni Totali"
            value={\`€\${data.stats.totale_commissioni_euro.toFixed(2)}\`}
            icon="euro"
          />
          <StatCard
            title="Saldo Disponibile"
            value={\`€\${data.stats.saldo_disponibile_euro.toFixed(2)}\`}
            highlight={data.stats.saldo_disponibile_euro >= 50}
            icon="wallet"
          />
        </div>

        {/* Azioni */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/affiliate/links"
            className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition"
          >
            <h3 className="font-semibold text-slate-800 mb-1">Genera Link</h3>
            <p className="text-sm text-slate-600">Crea link personalizzati con UTM</p>
          </Link>

          {data.stats.saldo_disponibile_euro >= 50 && (
            <button
              onClick={() => alert('Funzione payout in arrivo!')}
              className="block p-6 bg-green-50 border-2 border-green-200 rounded-xl text-left hover:bg-green-100 transition"
            >
              <h3 className="font-semibold text-green-800 mb-1">Richiedi Payout</h3>
              <p className="text-sm text-green-600">Hai €{data.stats.saldo_disponibile_euro.toFixed(2)} disponibili</p>
            </button>
          )}

          <Link
            href="/affiliate"
            className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition"
          >
            <h3 className="font-semibold text-slate-800 mb-1">Materiali Marketing</h3>
            <p className="text-sm text-slate-600">Badge, banner, email template</p>
          </Link>
        </div>

        {/* Ultime Commissioni */}
        {data.pending_commissions.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
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
    <div className={\`p-6 rounded-xl shadow-sm \${highlight ? 'bg-green-50 border-2 border-green-200' : 'bg-white'}\`}>
      <p className="text-sm text-slate-500 mb-1">{title}</p>
      <p className={\`text-2xl font-bold \${highlight ? 'text-green-700' : 'text-slate-800'}\`}>{value}</p>
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
}
`;

// Links Affiliato
const linksContent = `// ============================================================================
// PAGE: /affiliate/links
// Descrizione: Generatore link affiliato con UTM tracking
// Auth: Richiede utente autenticato + affiliato attivo
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

export default function AffiliateLinksPage() {
  const router = useRouter();
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [refCode, setRefCode] = useState('');

  // Form state
  const [form, setForm] = useState({
    destination_type: 'challenge',
    challenge_type: 'leadership',
    nome_link: '',
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/affiliate/links');
      if (res.status === 401) {
        router.push('/auth/login?redirect=/affiliate/links');
        return;
      }
      if (res.status === 404) {
        router.push('/affiliate');
        return;
      }
      if (!res.ok) throw new Error('Errore');
      const data = await res.json();
      setLinks(data.links || []);

      // Get ref_code from stats
      const statsRes = await fetch('/api/affiliate/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setRefCode(statsData.affiliate?.ref_code || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createLink = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/affiliate/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Errore creazione link');
      await fetchLinks();
      setForm({ ...form, nome_link: '', utm_source: '', utm_medium: '', utm_campaign: '' });
    } catch (err) {
      alert('Errore nella creazione del link');
    } finally {
      setCreating(false);
    }
  };

  const copyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const quickLinks = [
    { label: 'Challenge Leadership', url: \`https://vitaeology.com/challenge/leadership?ref=\${refCode}\` },
    { label: 'Challenge Ostacoli', url: \`https://vitaeology.com/challenge/ostacoli?ref=\${refCode}\` },
    { label: 'Challenge Microfelicita', url: \`https://vitaeology.com/challenge/microfelicita?ref=\${refCode}\` },
    { label: 'Pricing', url: \`https://vitaeology.com/pricing?ref=\${refCode}\` },
  ];

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
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Genera Link</h1>
            <p className="text-slate-300">Crea link personalizzati per le tue campagne</p>
          </div>
          <Link href="/affiliate/dashboard" className="text-slate-300 hover:text-white">
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-8 px-4">
        {/* Link Rapidi */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Link Rapidi</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {quickLinks.map((link, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <span className="flex-1 text-sm text-slate-700 truncate">{link.label}</span>
                <button
                  onClick={() => copyLink(link.url, \`quick-\${i}\`)}
                  className="px-4 py-2 bg-[#0A2540] text-white text-sm rounded-lg hover:bg-[#0A2540]/90"
                >
                  {copied === \`quick-\${i}\` ? '✓' : 'Copia'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Generatore Avanzato */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Generatore Avanzato</h2>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Destinazione</label>
              <select
                value={form.destination_type}
                onChange={(e) => setForm({ ...form, destination_type: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              >
                <option value="challenge">Challenge</option>
                <option value="pricing">Pricing</option>
                <option value="homepage">Homepage</option>
              </select>
            </div>

            {form.destination_type === 'challenge' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Challenge</label>
                <select
                  value={form.challenge_type}
                  onChange={(e) => setForm({ ...form, challenge_type: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="leadership">Leadership Autentica</option>
                  <option value="ostacoli">Oltre gli Ostacoli</option>
                  <option value="microfelicita">Microfelicità</option>
                </select>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">UTM Source</label>
              <input
                type="text"
                value={form.utm_source}
                onChange={(e) => setForm({ ...form, utm_source: e.target.value })}
                placeholder="es: facebook"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">UTM Medium</label>
              <input
                type="text"
                value={form.utm_medium}
                onChange={(e) => setForm({ ...form, utm_medium: e.target.value })}
                placeholder="es: social"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">UTM Campaign</label>
              <input
                type="text"
                value={form.utm_campaign}
                onChange={(e) => setForm({ ...form, utm_campaign: e.target.value })}
                placeholder="es: gennaio2026"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome Link (opzionale)</label>
            <input
              type="text"
              value={form.nome_link}
              onChange={(e) => setForm({ ...form, nome_link: e.target.value })}
              placeholder="es: Newsletter Gennaio"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <button
            onClick={createLink}
            disabled={creating}
            className="px-6 py-3 bg-[#F4B942] text-[#0A2540] font-semibold rounded-lg hover:bg-[#F4B942]/90 disabled:opacity-50"
          >
            {creating ? 'Creazione...' : 'Crea Link'}
          </button>
        </div>

        {/* Lista Link Creati */}
        {links.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">I Tuoi Link ({links.length})</h2>
            <div className="space-y-3">
              {links.map((link) => (
                <div key={link.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">
                      {link.nome_link || link.destination_type}
                    </p>
                    <p className="text-sm text-slate-500 truncate">{link.url_generato}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-slate-700">{link.totale_click} click</p>
                    <p className="text-green-600">{link.totale_conversioni} conv.</p>
                  </div>
                  <button
                    onClick={() => copyLink(link.url_generato, link.id)}
                    className="px-4 py-2 bg-[#0A2540] text-white text-sm rounded-lg"
                  >
                    {copied === link.id ? '✓' : 'Copia'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
`;

// Admin Affiliates
const adminContent = `// ============================================================================
// PAGE: /admin/affiliates
// Descrizione: Gestione affiliati per admin
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
  commissione_percentuale: number;
  totale_click: number;
  totale_conversioni: number;
  totale_commissioni_euro: number;
  saldo_disponibile_euro: number;
  created_at: string;
}

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'suspended'>('all');

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const fetchAffiliates = async () => {
    try {
      const res = await fetch('/api/admin/affiliates');
      if (!res.ok) throw new Error('Errore');
      const data = await res.json();
      setAffiliates(data.affiliates || []);
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

  const stats = {
    total: affiliates.length,
    pending: affiliates.filter(a => a.stato === 'pending').length,
    active: affiliates.filter(a => a.stato === 'active').length,
    totalCommissions: affiliates.reduce((sum, a) => sum + Number(a.totale_commissioni_euro || 0), 0),
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
            <h1 className="text-2xl font-bold">Gestione Affiliati</h1>
            <p className="text-slate-300">Admin Panel</p>
          </div>
          <Link href="/admin" className="text-slate-300 hover:text-white">
            ← Admin
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-sm text-slate-500">Totale Affiliati</p>
            <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-xl shadow-sm border border-yellow-200">
            <p className="text-sm text-yellow-700">In Attesa</p>
            <p className="text-3xl font-bold text-yellow-800">{stats.pending}</p>
          </div>
          <div className="bg-green-50 p-6 rounded-xl shadow-sm border border-green-200">
            <p className="text-sm text-green-700">Attivi</p>
            <p className="text-3xl font-bold text-green-800">{stats.active}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-sm text-slate-500">Commissioni Totali</p>
            <p className="text-3xl font-bold text-slate-800">€{stats.totalCommissions.toFixed(0)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'active', 'suspended'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={\`px-4 py-2 rounded-lg text-sm font-medium transition \${
                filter === f
                  ? 'bg-[#0A2540] text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }\`}
            >
              {f === 'all' ? 'Tutti' : f === 'pending' ? 'In Attesa' : f === 'active' ? 'Attivi' : 'Sospesi'}
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
                  <th className="text-left p-4 text-sm font-medium text-slate-600">Ref Code</th>
                  <th className="text-center p-4 text-sm font-medium text-slate-600">Categoria</th>
                  <th className="text-center p-4 text-sm font-medium text-slate-600">Stato</th>
                  <th className="text-right p-4 text-sm font-medium text-slate-600">Click</th>
                  <th className="text-right p-4 text-sm font-medium text-slate-600">Conv.</th>
                  <th className="text-right p-4 text-sm font-medium text-slate-600">Commissioni</th>
                  <th className="text-center p-4 text-sm font-medium text-slate-600">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filteredAffiliates.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4">
                      <p className="font-medium text-slate-800">{a.nome} {a.cognome}</p>
                      <p className="text-sm text-slate-500">{a.email}</p>
                    </td>
                    <td className="p-4">
                      <code className="text-sm bg-slate-100 px-2 py-1 rounded">{a.ref_code}</code>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-1 bg-[#F4B942]/20 text-[#0A2540] rounded text-sm">
                        {a.categoria}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <StatusBadge status={a.stato} />
                    </td>
                    <td className="p-4 text-right text-slate-700">{a.totale_click}</td>
                    <td className="p-4 text-right text-slate-700">{a.totale_conversioni}</td>
                    <td className="p-4 text-right font-medium text-slate-800">
                      €{Number(a.totale_commissioni_euro || 0).toFixed(2)}
                    </td>
                    <td className="p-4 text-center">
                      {a.stato === 'pending' && (
                        <button
                          onClick={() => updateStatus(a.id, 'active')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Approva
                        </button>
                      )}
                      {a.stato === 'active' && (
                        <button
                          onClick={() => updateStatus(a.id, 'suspended')}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Sospendi
                        </button>
                      )}
                      {a.stato === 'suspended' && (
                        <button
                          onClick={() => updateStatus(a.id, 'active')}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Riattiva
                        </button>
                      )}
                    </td>
                  </tr>
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
    active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Attivo' },
    suspended: { bg: 'bg-red-100', text: 'text-red-800', label: 'Sospeso' },
    terminated: { bg: 'bg-slate-100', text: 'text-slate-800', label: 'Terminato' },
  };
  const c = config[status] || config.pending;
  return (
    <span className={\`px-2 py-1 rounded text-sm \${c.bg} \${c.text}\`}>
      {c.label}
    </span>
  );
}
`;

// Admin API for affiliates
const adminApiContent = `// API: /api/admin/affiliates - Gestione affiliati admin
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    // Verifica admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 });
    }

    const { data: affiliates, error } = await supabase
      .from('affiliates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ affiliates: affiliates || [] });

  } catch (error) {
    console.error('Errore API admin/affiliates:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 });
    }

    const body = await request.json();
    const { id, stato, categoria, commissione_percentuale } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID mancante' }, { status: 400 });
    }

    const updateData: Record<string, any> = {};
    if (stato) updateData.stato = stato;
    if (categoria) updateData.categoria = categoria;
    if (commissione_percentuale) updateData.commissione_percentuale = commissione_percentuale;
    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('affiliates')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Errore API admin/affiliates PATCH:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
`;

// Create directories
const dirs = [
  'affiliate/dashboard',
  'affiliate/links',
  'admin/affiliates',
  'api/admin/affiliates'
];

dirs.forEach(dir => {
  const fullPath = path.join(appDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Write files
fs.writeFileSync(path.join(appDir, 'affiliate/dashboard/page.tsx'), dashboardContent);
console.log('✅ affiliate/dashboard/page.tsx');

fs.writeFileSync(path.join(appDir, 'affiliate/links/page.tsx'), linksContent);
console.log('✅ affiliate/links/page.tsx');

fs.writeFileSync(path.join(appDir, 'admin/affiliates/page.tsx'), adminContent);
console.log('✅ admin/affiliates/page.tsx');

fs.writeFileSync(path.join(appDir, 'api/admin/affiliates/route.ts'), adminApiContent);
console.log('✅ api/admin/affiliates/route.ts');

console.log('\\n✅ All affiliate frontend pages created!');
