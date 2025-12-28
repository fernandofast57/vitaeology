'use client';

import React, { useState, useEffect, Suspense } from 'react';

export const dynamic = 'force-dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { RisolutoreResults, LEVEL_CONFIG } from '@/lib/risolutore-scoring';

function RisolutoreResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<RisolutoreResults | null>(null);

  useEffect(() => {
    async function loadResults() {
      if (!assessmentId) {
        setError('ID assessment mancante');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/assessment/risolutore/results/${assessmentId}`);

        if (!res.ok) {
          if (res.status === 401) {
            router.push('/auth/login');
            return;
          }
          throw new Error('Errore caricamento risultati');
        }

        const data = await res.json();
        setResults(data.results);
      } catch (err) {
        console.error('Errore:', err);
        setError('Impossibile caricare i risultati');
      } finally {
        setLoading(false);
      }
    }

    loadResults();
  }, [assessmentId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento risultati...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Errore</h2>
          <p className="text-gray-600 mb-6">{error || 'Risultati non disponibili'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-600 transition"
          >
            Torna alla Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Prepara dati per radar chart Filtri
  const filtriData = results.filtri.map(f => ({
    name: f.dimensionName.replace('Detective dei ', '').replace('Antenna dei ', '').replace('Radar delle ', ''),
    fullName: f.dimensionName,
    value: f.percentage,
    fill: f.color,
  }));

  // Prepara dati per radar chart Traditori (inverso: alto = superato)
  const traditoriData = results.traditori.map(t => ({
    name: t.dimensionName.replace('Il ', ''),
    fullName: t.dimensionName,
    value: t.percentage,
    fill: t.color,
  }));

  // Livello corrente
  const level = results.level;
  const levelProgress = (level.level / 5) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            I Tuoi Risultati: Il Risolutore
          </h1>
          <p className="text-gray-600">
            Ecco il tuo profilo come risolutore di problemi
          </p>
        </div>

        {/* Punteggio Generale */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="text-center">
            <div className="text-6xl font-bold text-emerald-600 mb-2">
              {results.overallPercentage}%
            </div>
            <p className="text-gray-600">Punteggio Complessivo</p>
          </div>
        </div>

        {/* Livello Risolutore */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
            Il Tuo Livello
          </h2>

          {/* Indicatore Livello */}
          <div className="relative mb-6">
            <div className="flex justify-between mb-2">
              {[1, 2, 3, 4, 5].map(l => (
                <div
                  key={l}
                  className={`flex flex-col items-center ${l <= level.level ? 'text-indigo-600' : 'text-gray-300'}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2
                      ${l === level.level
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : l < level.level
                          ? 'bg-indigo-100 text-indigo-600 border-indigo-300'
                          : 'bg-gray-100 text-gray-400 border-gray-200'
                      }
                    `}
                  >
                    {l}
                  </div>
                </div>
              ))}
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>

          {/* Nome e descrizione livello */}
          <div className="text-center bg-indigo-50 rounded-xl p-4">
            <h3 className="text-xl font-bold text-indigo-700 mb-2">
              {level.levelName}
            </h3>
            <p className="text-indigo-600">
              {level.levelDescription}
            </p>
          </div>
        </div>

        {/* Radar Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Filtri Risolutivi */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
              I Tuoi Filtri Risolutivi
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={filtriData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar
                    name="Filtri"
                    dataKey="value"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Dettaglio Filtri */}
            <div className="mt-4 space-y-2">
              {results.filtri.map(f => (
                <div key={f.dimensionCode} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: f.color }}
                  />
                  <span className="text-sm text-gray-600 flex-1">{f.dimensionName}</span>
                  <span className="text-sm font-bold" style={{ color: f.color }}>
                    {f.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Traditori Silenziosi */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
              I Traditori Silenziosi
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={traditoriData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar
                    name="Superamento"
                    dataKey="value"
                    stroke="#EF4444"
                    fill="#EF4444"
                    fillOpacity={0.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Dettaglio Traditori */}
            <div className="mt-4 space-y-2">
              {results.traditori.map(t => (
                <div key={t.dimensionCode} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: t.color }}
                  />
                  <span className="text-sm text-gray-600 flex-1">{t.dimensionName}</span>
                  <span className="text-sm font-bold" style={{ color: t.color }}>
                    {t.percentage}%
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              💡 Punteggio alto = Traditore superato
            </p>
          </div>
        </div>

        {/* Interpretazioni */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Interpretazione dei Risultati
          </h2>

          <div className="space-y-4">
            {/* Filtri */}
            <div>
              <h3 className="font-semibold text-emerald-700 mb-2">Filtri Risolutivi</h3>
              <div className="grid gap-2">
                {results.filtri.map(f => (
                  <div key={f.dimensionCode} className="bg-emerald-50 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-emerald-800">{f.dimensionName}</span>
                      <span className="text-emerald-600 font-bold">{f.percentage}%</span>
                    </div>
                    <p className="text-sm text-emerald-700">{f.interpretation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Traditori */}
            <div>
              <h3 className="font-semibold text-red-700 mb-2">Traditori Silenziosi</h3>
              <div className="grid gap-2">
                {results.traditori.map(t => (
                  <div key={t.dimensionCode} className="bg-red-50 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-red-800">{t.dimensionName}</span>
                      <span className="text-red-600 font-bold">{t.percentage}%</span>
                    </div>
                    <p className="text-sm text-red-700">{t.interpretation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-lg p-6 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">
            Vuoi potenziare le tue capacità di Risolutore?
          </h2>
          <p className="mb-6 opacity-90">
            Scopri il libro &ldquo;Oltre gli Ostacoli&rdquo; e la Challenge di 7 giorni
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/libro/risolutore')}
              className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-medium hover:bg-emerald-50 transition"
            >
              Scopri il Libro
            </button>
            <button
              onClick={() => router.push('/challenge/ostacoli')}
              className="bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-800 transition border border-emerald-500"
            >
              Challenge 7 Giorni
            </button>
          </div>
        </div>

        {/* Link Dashboard */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-800 underline"
          >
            ← Torna alla Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Caricamento...</p>
      </div>
    </div>
  );
}

export default function RisolutoreResultsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RisolutoreResultsContent />
    </Suspense>
  );
}
