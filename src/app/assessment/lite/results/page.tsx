'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ResultsRadar from '@/components/assessment/ResultsRadar';
import ExportAssessmentButton from '@/components/assessment/ExportAssessmentButton';
import { AssessmentResults, PILLAR_CONFIG } from '@/lib/assessment-scoring';

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const assessmentId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [completedAt, setCompletedAt] = useState<string | null>(null);

  useEffect(() => {
    async function loadResults() {
      if (!assessmentId) {
        setError('ID assessment mancante');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const res = await fetch(`/api/assessment/results/${assessmentId}`);

        if (res.status === 401) {
          router.push('/auth/login?redirect=/assessment/lite/results');
          return;
        }

        if (!res.ok) {
          throw new Error('Assessment non trovato');
        }

        const data = await res.json();
        setResults(data.results);
        setCompletedAt(data.completedAt);

        // Salva radar snapshot automaticamente
        try {
          const scoresJson: Record<string, number> = {};
          data.results.characteristics.forEach((char: { characteristicName: string; percentage: number }) => {
            scoresJson[char.characteristicName] = char.percentage;
          });

          const snapshotRes = await fetch('/api/radar/snapshot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              assessment_type: 'leadership',
              scores_json: scoresJson,
              triggered_by: 'assessment_complete',
            }),
          });

          if (snapshotRes.ok) {
            const snapshotData = await snapshotRes.json();
            console.log('Radar snapshot saved:', snapshotData.data?.id);
          }
        } catch (snapshotErr) {
          // Errore silenzioso - non blocca il flusso utente
          console.warn('Radar snapshot save failed:', snapshotErr);
        }
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
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento risultati...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {error || 'Risultati non disponibili'}
          </h2>
          <p className="text-gray-600 mb-6">
            Potrebbe essere necessario completare prima l&apos;assessment.
          </p>
          <Link
            href="/assessment/lite"
            className="inline-block bg-amber-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-600 transition"
          >
            Vai all&apos;Assessment
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Il Tuo Profilo Leadership
          </h1>
          {completedAt && (
            <p className="text-gray-500 text-sm mb-4">
              Completato il {new Date(completedAt).toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}
          {assessmentId && (
            <ExportAssessmentButton assessmentId={assessmentId} />
          )}
        </div>

        {/* Punteggio Overall */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 text-center">
          <h2 className="text-lg font-medium text-gray-600 mb-2">
            Punteggio Complessivo
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="text-5xl font-bold text-amber-500">
              {results.overallPercentage}%
            </div>
            <div className="text-left">
              <div className="text-sm text-gray-500">Media</div>
              <div className="text-xl font-semibold text-gray-800">
                {results.overallScore.toFixed(2)} / 5
              </div>
            </div>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            I Quattro Pilastri della Leadership
          </h2>
          <ResultsRadar pillars={results.pillars} size={320} animate={true} />
        </div>

        {/* Dettaglio Pilastri */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {results.pillars.map((pillar) => (
            <div
              key={pillar.pillar}
              className="bg-white rounded-xl shadow p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="font-semibold"
                  style={{ color: pillar.color }}
                >
                  {pillar.pillarLabel}
                </span>
                <span className="text-xl font-bold text-gray-800">
                  {pillar.percentage}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-1000 rounded-full"
                  style={{
                    width: `${pillar.percentage}%`,
                    backgroundColor: pillar.color,
                  }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Media: {pillar.averageScore.toFixed(2)} / 5
              </p>
            </div>
          ))}
        </div>

        {/* Punti di Forza */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">💪</span>
            Le Tue Aree di Eccellenza
          </h2>
          <p className="text-gray-600 mb-4 text-sm">
            Queste sono le caratteristiche in cui già operi con maggiore consapevolezza.
          </p>
          <div className="space-y-3">
            {results.topStrengths.map((char, index) => {
              const pillarConfig = PILLAR_CONFIG[char.pillar];
              return (
                <div
                  key={char.characteristicId}
                  className="flex items-center gap-4 p-3 bg-green-50 rounded-lg"
                >
                  <div className="text-2xl font-bold text-green-600">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      {char.characteristicName}
                    </div>
                    <div
                      className="text-sm"
                      style={{ color: pillarConfig?.color }}
                    >
                      {pillarConfig?.label || char.pillar}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-600">
                      {char.percentage}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {char.averageScore.toFixed(2)} / 5
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Aree di Crescita */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            Opportunità di Espansione
          </h2>
          <p className="text-gray-600 mb-4 text-sm">
            Queste caratteristiche rappresentano spazi dove puoi espandere ulteriormente
            le tue capacità di leadership.
          </p>
          <div className="space-y-3">
            {results.growthAreas.map((char, index) => {
              const pillarConfig = PILLAR_CONFIG[char.pillar];
              return (
                <div
                  key={char.characteristicId}
                  className="flex items-center gap-4 p-3 bg-amber-50 rounded-lg"
                >
                  <div className="text-2xl font-bold text-amber-600">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      {char.characteristicName}
                    </div>
                    <div
                      className="text-sm"
                      style={{ color: pillarConfig?.color }}
                    >
                      {pillarConfig?.label || char.pillar}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-amber-600">
                      {char.percentage}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {char.averageScore.toFixed(2)} / 5
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tutte le Caratteristiche */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Dettaglio Completo - 24 Caratteristiche
          </h2>

          {/* Raggruppa per pilastro */}
          {Object.entries(PILLAR_CONFIG).map(([pillarKey, config]) => {
            const pillarChars = results.characteristics.filter(
              (c) => c.pillar === pillarKey
            );
            if (pillarChars.length === 0) return null;

            return (
              <div key={pillarKey} className="mb-6">
                <h3
                  className="font-semibold mb-3 pb-2 border-b"
                  style={{ color: config.color, borderColor: config.color }}
                >
                  {config.label}
                </h3>
                <div className="space-y-2">
                  {pillarChars.map((char) => (
                    <div
                      key={char.characteristicId}
                      className="flex items-center gap-3"
                    >
                      <span className="text-xs font-mono text-gray-400 w-8">
                        {char.characteristicCode}
                      </span>
                      <span className="flex-1 text-sm text-gray-700">
                        {char.characteristicName}
                      </span>
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${char.percentage}%`,
                            backgroundColor: config.color,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600 w-12 text-right">
                        {char.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl shadow-lg p-6 text-white text-center">
          <h2 className="text-xl font-bold mb-2">
            Pronto a sviluppare la tua leadership?
          </h2>
          <p className="mb-4 text-amber-100">
            Esplora gli esercizi personalizzati basati sul tuo profilo
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="bg-white text-amber-600 px-6 py-3 rounded-lg font-medium hover:bg-amber-50 transition"
            >
              Vai alla Dashboard
            </Link>
            <Link
              href="/exercises"
              className="bg-amber-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-800 transition"
            >
              Esplora Esercizi
            </Link>
          </div>
        </div>

        {/* CTA Fernando AI Coach */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mt-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-14 h-14 bg-[#0A2540] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl font-bold">F</span>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Vuoi approfondire i tuoi risultati?
              </h3>
              <p className="text-gray-600 text-sm">
                Parla con Fernando, il tuo AI Coach, per capire come valorizzare
                i tuoi punti di forza e lavorare sulle aree di crescita.
              </p>
            </div>
            <Link
              href="/dashboard?openChat=true"
              className="bg-[#0A2540] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#0A2540]/90 transition flex items-center gap-2 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Parla con Fernando
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Questo assessment è basato sul modello delle 24 caratteristiche
            di leadership organizzate nei 4 pilastri fondamentali.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AssessmentResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
