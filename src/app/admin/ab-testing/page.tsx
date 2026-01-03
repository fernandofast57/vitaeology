'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface VariantPerformance {
  challenge: string;
  variant: string;
  page_views: number;
  signups: number;
  completed: number;
  converted: number;
  signup_rate: number;
  conversion_rate: number;
}

interface CampaignPerformance {
  utm_campaign: string;
  challenge: string;
  variant: string;
  total_events: number;
  signups: number;
  conversions: number;
  signup_rate: number;
}

interface BestVariant {
  challenge: string;
  best_variant: string;
  signup_rate: number;
  conversion_rate: number;
  total_signups: number;
}

export default function ABTestingDashboard() {
  const [variantData, setVariantData] = useState<VariantPerformance[]>([]);
  const [campaignData, setCampaignData] = useState<CampaignPerformance[]>([]);
  const [bestVariants, setBestVariants] = useState<BestVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<string>('all');

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    try {
      // Fetch variant performance
      const { data: variants } = await supabase
        .from('ab_test_performance')
        .select('*')
        .order('challenge', { ascending: true });

      // Fetch campaign performance
      const { data: campaigns } = await supabase
        .from('campaign_performance')
        .select('*')
        .order('signups', { ascending: false })
        .limit(20);

      // Fetch best variants
      const { data: best } = await supabase
        .from('best_variant_per_challenge')
        .select('*');

      if (variants) setVariantData(variants);
      if (campaigns) setCampaignData(campaigns);
      if (best) setBestVariants(best);
    } catch (error) {
      console.error('Error fetching AB test data:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
    // Auto-refresh ogni 30 secondi
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const challenges = ['leadership-autentica', 'oltre-ostacoli', 'microfelicita'];
  const challengeNames: Record<string, string> = {
    'leadership-autentica': 'Leadership Autentica',
    'oltre-ostacoli': 'Oltre gli Ostacoli',
    'microfelicita': 'Microfelicità'
  };

  const filteredVariants = selectedChallenge === 'all'
    ? variantData
    : variantData.filter(v => v.challenge === selectedChallenge);

  const filteredCampaigns = selectedChallenge === 'all'
    ? campaignData
    : campaignData.filter(c => c.challenge === selectedChallenge);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Caricamento dati A/B Testing...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">A/B Testing Dashboard</h1>
            <p className="text-slate-400 mt-1">
              100 Ads Test - Trova la variante vincente
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchData}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition"
            >
              Aggiorna
            </button>
            <Link
              href="/admin/behavioral"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              Behavioral Analytics
            </Link>
            <Link
              href="/admin/ai-coach"
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition"
            >
              AI Coach
            </Link>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <select
            value={selectedChallenge}
            onChange={(e) => setSelectedChallenge(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg"
          >
            <option value="all">Tutte le Challenge</option>
            {challenges.map(c => (
              <option key={c} value={c}>{challengeNames[c]}</option>
            ))}
          </select>
        </div>

        {/* Best Variants - Hero Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {bestVariants.length > 0 ? bestVariants.map((best) => (
            <div
              key={best.challenge}
              className={`p-6 rounded-xl border-2 ${
                best.challenge === 'leadership-autentica'
                  ? 'bg-amber-900/20 border-amber-500/50'
                  : best.challenge === 'oltre-ostacoli'
                  ? 'bg-emerald-900/20 border-emerald-500/50'
                  : 'bg-violet-900/20 border-violet-500/50'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-400 text-sm">
                    {challengeNames[best.challenge]}
                  </p>
                  <h3 className="text-white text-xl font-bold">
                    Variante {best.best_variant}
                  </h3>
                </div>
                <span className={`text-4xl font-bold ${
                  best.challenge === 'leadership-autentica'
                    ? 'text-amber-400'
                    : best.challenge === 'oltre-ostacoli'
                    ? 'text-emerald-400'
                    : 'text-violet-400'
                }`}>
                  {best.signup_rate}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Signup Rate</p>
                  <p className="text-white font-semibold">{best.signup_rate}%</p>
                </div>
                <div>
                  <p className="text-slate-400">Conversion</p>
                  <p className="text-white font-semibold">{best.conversion_rate}%</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-400">Totale Iscritti</p>
                  <p className="text-white font-semibold">{best.total_signups}</p>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-3 text-center py-12 text-slate-400">
              Nessun dato disponibile. Inizia a raccogliere iscrizioni alle challenge!
            </div>
          )}
        </div>

        {/* Variant Performance Table */}
        <div className="bg-slate-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">
            Performance per Variante
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-400 text-sm border-b border-slate-700">
                  <th className="pb-3">Challenge</th>
                  <th className="pb-3">Variante</th>
                  <th className="pb-3 text-right">Page Views</th>
                  <th className="pb-3 text-right">Signups</th>
                  <th className="pb-3 text-right">Signup Rate</th>
                  <th className="pb-3 text-right">Completati</th>
                  <th className="pb-3 text-right">Convertiti</th>
                  <th className="pb-3 text-right">Conv. Rate</th>
                </tr>
              </thead>
              <tbody>
                {filteredVariants.length > 0 ? filteredVariants.map((row) => (
                  <tr
                    key={`${row.challenge}-${row.variant}`}
                    className="border-b border-slate-700/50 text-white"
                  >
                    <td className="py-3">{challengeNames[row.challenge]}</td>
                    <td className="py-3">
                      <span className={`inline-block w-8 h-8 rounded-full text-center leading-8 font-bold ${
                        row.challenge === 'leadership-autentica'
                          ? 'bg-amber-500/20 text-amber-400'
                          : row.challenge === 'oltre-ostacoli'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-violet-500/20 text-violet-400'
                      }`}>
                        {row.variant}
                      </span>
                    </td>
                    <td className="py-3 text-right">{row.page_views}</td>
                    <td className="py-3 text-right font-semibold">{row.signups}</td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-1 rounded text-sm ${
                        row.signup_rate >= 10
                          ? 'bg-green-500/20 text-green-400'
                          : row.signup_rate >= 5
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {row.signup_rate}%
                      </span>
                    </td>
                    <td className="py-3 text-right">{row.completed}</td>
                    <td className="py-3 text-right">{row.converted}</td>
                    <td className="py-3 text-right">{row.conversion_rate}%</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Nessun dato disponibile
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Campaign Performance (Top 100 Ads) */}
        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Top Campaigns (100 Ads Test)
          </h2>
          <p className="text-slate-400 text-sm mb-4">
            Ordinate per numero di signup. Usa la campagna con più conversioni come base per scaling.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-400 text-sm border-b border-slate-700">
                  <th className="pb-3">#</th>
                  <th className="pb-3">Campaign</th>
                  <th className="pb-3">Challenge</th>
                  <th className="pb-3">Variante</th>
                  <th className="pb-3 text-right">Signups</th>
                  <th className="pb-3 text-right">Rate</th>
                  <th className="pb-3 text-right">Conv.</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.length > 0 ? filteredCampaigns.map((row, index) => (
                  <tr
                    key={`${row.utm_campaign}-${row.challenge}-${row.variant}`}
                    className={`border-b border-slate-700/50 text-white ${
                      index === 0 ? 'bg-green-900/20' : ''
                    }`}
                  >
                    <td className="py-3">
                      {index === 0 && <span className="text-green-400">1</span>}
                      {index === 1 && <span className="text-slate-400">2</span>}
                      {index === 2 && <span className="text-amber-600">3</span>}
                      {index > 2 && <span className="text-slate-500">{index + 1}</span>}
                    </td>
                    <td className="py-3 font-mono text-sm">{row.utm_campaign}</td>
                    <td className="py-3 text-sm">{challengeNames[row.challenge]}</td>
                    <td className="py-3">
                      <span className="text-xs bg-slate-700 px-2 py-1 rounded">
                        {row.variant}
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold">{row.signups}</td>
                    <td className="py-3 text-right">{row.signup_rate}%</td>
                    <td className="py-3 text-right">{row.conversions}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Nessuna campagna ancora. Inizia a lanciare le 100 ads!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-6 bg-slate-800/50 rounded-xl border border-slate-700">
          <h3 className="text-white font-bold mb-3">Come Usare il Test 100 Ads</h3>
          <ol className="text-slate-300 space-y-2 text-sm">
            <li><strong>1.</strong> Crea 100 varianti ads su Facebook/Instagram</li>
            <li><strong>2.</strong> Usa UTM diversi per ogni ad: <code className="bg-slate-700 px-2 py-1 rounded">utm_campaign=fb_leadership_v01</code></li>
            <li><strong>3.</strong> Budget minimo per ad: 5-10 euro</li>
            <li><strong>4.</strong> Aspetta 48-72 ore per dati significativi</li>
            <li><strong>5.</strong> Spegni gli ads con signup_rate &lt; 5%</li>
            <li><strong>6.</strong> Scala gli ads con signup_rate &gt; 10%</li>
          </ol>
        </div>

        {/* Challenge Links */}
        <div className="mt-8 p-6 bg-slate-800/50 rounded-xl border border-slate-700">
          <h3 className="text-white font-bold mb-3">Link alle Landing Page</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-amber-400 font-semibold mb-2">Leadership Autentica</p>
              <code className="text-slate-400 text-xs block bg-slate-800 p-2 rounded">/challenge/leadership</code>
            </div>
            <div>
              <p className="text-emerald-400 font-semibold mb-2">Oltre gli Ostacoli</p>
              <code className="text-slate-400 text-xs block bg-slate-800 p-2 rounded">/challenge/ostacoli</code>
            </div>
            <div>
              <p className="text-violet-400 font-semibold mb-2">Microfelicità</p>
              <code className="text-slate-400 text-xs block bg-slate-800 p-2 rounded">/challenge/microfelicita</code>
            </div>
          </div>
          <p className="text-slate-500 text-xs mt-4">
            Aggiungi <code>?v=A</code>, <code>?v=B</code> o <code>?v=C</code> per forzare una variante specifica
          </p>
        </div>
      </div>
    </div>
  );
}
