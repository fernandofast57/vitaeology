'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { MicrofelicitaResults, PROFILE_CONFIG } from '@/lib/microfelicita-scoring';

function MicrofelicitaResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<MicrofelicitaResults | null>(null);

  useEffect(() => {
    async function loadResults() {
      if (!assessmentId) {
        setError('ID assessment mancante');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/assessment/microfelicita/results/${assessmentId}`);
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/auth/login');
            return;
          }
          throw new Error('Errore caricamento');
        }
        const data = await res.json();
        setResults(data.results);
      } catch (err) {
        setError('Impossibile caricare i risultati');
      } finally {
        setLoading(false);
      }
    }
    loadResults();
  }, [assessmentId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento risultati...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-6">{error || 'Risultati non disponibili'}</p>
          <button onClick={() => router.push('/dashboard')} className="bg-violet-500 text-white px-6 py-3 rounded-lg">
            Torna alla Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Prepara dati radar
  const radarData = results.radar.map(r => ({
    name: r.dimensionName,
    value: r.percentage,
  }));

  const sabotatoriData = results.sabotatori.map(s => ({
    name: s.dimensionName.replace('Minimizzazione Istantanea', 'Minimizzazione').replace('Auto-Interruzione Cognitiva', 'Auto-Interruzione').replace('Cambio di Fuoco Immediato', 'Cambio Fuoco').replace('Anticipo Protettivo', 'Anticipo').replace('Correzione Emotiva', 'Correzione'),
    value: s.percentage,
  }));

  const profile = results.profile;

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">I Tuoi Risultati: Microfelicità</h1>
          <p className="text-gray-600">Ecco il tuo profilo come Praticante di Microfelicità</p>
        </div>

        {/* Punteggio Generale */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 text-center">
          <div className="text-6xl font-bold text-violet-600 mb-2">{results.overallPercentage}%</div>
          <p className="text-gray-600">Punteggio Complessivo</p>
        </div>

        {/* Profilo Praticante */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Il Tuo Profilo</h2>

          {/* Barra 3 livelli */}
          <div className="flex justify-between mb-4">
            {results.livelli.map((l, i) => (
              <div key={l.dimensionCode} className="flex-1 px-2">
                <div className="text-center mb-2">
                  <span className={`text-sm font-medium ${l.percentage >= 62 ? 'text-blue-600' : 'text-gray-400'}`}>
                    {l.dimensionName}
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${l.percentage >= 62 ? 'bg-blue-500' : 'bg-gray-300'}`}
                    style={{ width: `${l.percentage}%` }}
                  />
                </div>
                <div className="text-center mt-1">
                  <span className="text-xs text-gray-500">{l.percentage}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Nome Profilo */}
          <div className="text-center bg-violet-50 rounded-xl p-4 mt-4">
            <h3 className="text-xl font-bold text-violet-700 mb-2">{profile.profileName}</h3>
            <p className="text-violet-600">{profile.profileDescription}</p>
          </div>
        </div>

        {/* Radar Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* R.A.D.A.R. */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Le 5 Fasi R.A.D.A.R.</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar name="R.A.D.A.R." dataKey="value" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {results.radar.map(r => (
                <div key={r.dimensionCode} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                  <span className="text-sm text-gray-600 flex-1">{r.dimensionName}</span>
                  <span className="text-sm font-bold text-violet-600">{r.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sabotatori */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">I 5 Sabotatori</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={sabotatoriData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar name="Superamento" dataKey="value" stroke="#F97316" fill="#F97316" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {results.sabotatori.map(s => (
                <div key={s.dimensionCode} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-sm text-gray-600 flex-1">{s.dimensionName}</span>
                  <span className="text-sm font-bold text-orange-600">{s.percentage}%</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">💡 Punteggio alto = Sabotatore superato</p>
          </div>
        </div>

        {/* Interpretazioni */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Interpretazione</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-violet-700 mb-2">Fasi R.A.D.A.R.</h3>
              <div className="grid gap-2">
                {results.radar.map(r => (
                  <div key={r.dimensionCode} className="bg-violet-50 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-violet-800">{r.dimensionName}</span>
                      <span className="text-violet-600 font-bold">{r.percentage}%</span>
                    </div>
                    <p className="text-sm text-violet-700">{r.interpretation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl shadow-lg p-6 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Vuoi approfondire la Microfelicità?</h2>
          <p className="mb-6 opacity-90">Scopri il libro e la Challenge di 7 giorni</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => router.push('/libro/microfelicita')} className="bg-white text-violet-600 px-6 py-3 rounded-lg font-medium hover:bg-violet-50">
              Scopri il Libro
            </button>
            <button onClick={() => router.push('/challenge/microfelicita')} className="bg-violet-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-violet-800 border border-violet-500">
              Challenge 7 Giorni
            </button>
          </div>
        </div>

        <div className="text-center mt-8">
          <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-800 underline">
            ← Torna alla Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Caricamento...</p>
      </div>
    </div>
  );
}

export default function MicrofelicitaResultsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MicrofelicitaResultsContent />
    </Suspense>
  );
}
