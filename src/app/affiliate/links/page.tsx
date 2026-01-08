// ============================================================================
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
    { label: 'Challenge Leadership', url: `https://vitaeology.com/challenge/leadership?ref=${refCode}` },
    { label: 'Challenge Ostacoli', url: `https://vitaeology.com/challenge/ostacoli?ref=${refCode}` },
    { label: 'Challenge Microfelicita', url: `https://vitaeology.com/challenge/microfelicita?ref=${refCode}` },
    { label: 'Pricing', url: `https://vitaeology.com/pricing?ref=${refCode}` },
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
                  onClick={() => copyLink(link.url, `quick-${i}`)}
                  className="px-4 py-2 bg-[#0A2540] text-white text-sm rounded-lg hover:bg-[#0A2540]/90"
                >
                  {copied === `quick-${i}` ? '✓' : 'Copia'}
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
