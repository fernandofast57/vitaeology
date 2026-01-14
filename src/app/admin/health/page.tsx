'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ServiceHealth {
  service: string;
  status: 'ok' | 'error' | 'warning';
  message: string;
  latency?: number;
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: ServiceHealth[];
}

export default function HealthDashboardPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/health');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setHealth(data);
      setLastCheck(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();

    // Auto-refresh ogni 60 secondi
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: 'ok' | 'error' | 'warning') => {
    switch (status) {
      case 'ok':
        return (
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
    }
  };

  const getOverallStatusBadge = (status: 'healthy' | 'degraded' | 'unhealthy') => {
    switch (status) {
      case 'healthy':
        return (
          <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-lg font-bold">
            TUTTO OK
          </span>
        );
      case 'degraded':
        return (
          <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-lg font-bold">
            ATTENZIONE
          </span>
        );
      case 'unhealthy':
        return (
          <span className="px-4 py-2 bg-red-100 text-red-800 rounded-full text-lg font-bold">
            PROBLEMI RILEVATI
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin" className="text-slate-500 hover:text-slate-700 text-sm mb-2 inline-block">
              ← Torna all&apos;Admin
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Health Check</h1>
            <p className="text-slate-600 mt-1">Stato di tutti i servizi</p>
          </div>

          <button
            onClick={checkHealth}
            disabled={loading}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Controllo...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Ricontrolla
              </>
            )}
          </button>
        </div>

        {/* Overall Status */}
        {health && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 text-center">
            <div className="mb-4">{getOverallStatusBadge(health.status)}</div>
            {lastCheck && (
              <p className="text-slate-500 text-sm">
                Ultimo controllo: {lastCheck.toLocaleTimeString('it-IT')}
              </p>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <h2 className="text-red-800 font-bold mb-2">Errore nel controllo</h2>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && !health && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <svg className="animate-spin h-12 w-12 mx-auto text-slate-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="mt-4 text-slate-600">Controllo servizi in corso...</p>
          </div>
        )}

        {/* Services Grid */}
        {health && (
          <div className="grid gap-4">
            {health.services.map((service, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl shadow-sm border p-6 flex items-center gap-4 ${
                  service.status === 'error'
                    ? 'border-red-200'
                    : service.status === 'warning'
                    ? 'border-yellow-200'
                    : 'border-slate-200'
                }`}
              >
                {getStatusIcon(service.status)}

                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">{service.service}</h3>
                  <p className={`text-sm ${
                    service.status === 'error'
                      ? 'text-red-600'
                      : service.status === 'warning'
                      ? 'text-yellow-600'
                      : 'text-slate-600'
                  }`}>
                    {service.message}
                  </p>
                </div>

                {service.latency && (
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Latenza</p>
                    <p className={`font-mono ${
                      service.latency > 2000
                        ? 'text-red-600'
                        : service.latency > 500
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}>
                      {service.latency}ms
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 bg-slate-100 rounded-xl p-6">
          <h2 className="font-bold text-slate-900 mb-4">Azioni Rapide</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Link
              href="/admin/monitoring"
              className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg text-center hover:shadow-md transition"
            >
              <div className="text-2xl mb-2">📡</div>
              <div className="text-sm text-blue-700 font-medium">4P×3F</div>
            </Link>
            <Link
              href="/admin/users"
              className="p-4 bg-white rounded-lg text-center hover:shadow-md transition"
            >
              <div className="text-2xl mb-2">👥</div>
              <div className="text-sm text-slate-700">Utenti</div>
            </Link>
            <Link
              href="/admin/challenges"
              className="p-4 bg-white rounded-lg text-center hover:shadow-md transition"
            >
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-sm text-slate-700">Challenge</div>
            </Link>
            <Link
              href="/admin/ai-coach"
              className="p-4 bg-white rounded-lg text-center hover:shadow-md transition"
            >
              <div className="text-2xl mb-2">🤖</div>
              <div className="text-sm text-slate-700">AI Coach</div>
            </Link>
            <Link
              href="/admin/analytics"
              className="p-4 bg-white rounded-lg text-center hover:shadow-md transition"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm text-slate-700">Analytics</div>
            </Link>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-2">Come usare questa pagina</h3>
          <ul className="text-blue-800 text-sm space-y-2">
            <li>• <strong>TUTTO OK</strong> = Tutti i servizi funzionano correttamente</li>
            <li>• <strong>ATTENZIONE</strong> = Alcuni servizi hanno warning ma funzionano</li>
            <li>• <strong>PROBLEMI RILEVATI</strong> = Almeno un servizio critico non funziona</li>
            <li>• La pagina si aggiorna automaticamente ogni 60 secondi</li>
            <li>• Latenza &gt; 500ms = giallo, &gt; 2000ms = rosso</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
