'use client';

// ============================================================================
// PAGE: /admin/spam-monitoring
// Descrizione: Dashboard monitoraggio anti-spam
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { Shield, AlertTriangle, CheckCircle, RefreshCw, Ban, Activity, Users, Mail } from 'lucide-react';

interface SpamStats {
  lastHour: {
    total: number;
    blocked: number;
    success: number;
    bySource: Record<string, number>;
  };
  last24h: {
    total: number;
    blocked: number;
    success: number;
    bySource: Record<string, number>;
    avgSuspicionScore: number;
  };
  suspiciousIPs: Array<{
    ip: string;
    attempts: number;
    blocked: number;
    lastAttempt: string;
  }>;
  highSuspicionNames: Array<{
    name: string;
    email: string;
    score: number;
    source: string;
    createdAt: string;
  }>;
  blockedAttempts: Array<{
    email: string;
    reason: string;
    source: string;
    createdAt: string;
  }>;
  alerts: string[];
  isAnomaly: boolean;
}

export default function SpamMonitoringPage() {
  const [stats, setStats] = useState<SpamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // C10 fix: usa cookie auth, non CRON_SECRET client-side
      const res = await fetch('/api/admin/spam-monitor');

      if (!res.ok) {
        throw new Error('Errore nel caricamento delle statistiche');
      }

      const data = await res.json();
      setStats(data);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // Auto-refresh ogni 5 minuti
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const getSourceLabel = (source: string) => {
    const labels: Record<string, string> = {
      signup: 'Registrazione',
      challenge: 'Challenge',
      affiliate: 'Affiliati',
      beta: 'Beta Tester',
      contact: 'Contatti',
      forgot_password: 'Reset Password',
    };
    return labels[source] || source;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && !stats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-petrol-600" />
          <span>Caricamento statistiche...</span>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <AlertTriangle className="h-5 w-5 inline mr-2" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-7 w-7 text-petrol-600" />
            Monitoraggio Anti-Spam
          </h1>
          <p className="text-gray-500 mt-1">
            Ultimo aggiornamento: {lastRefresh?.toLocaleTimeString('it-IT') || '-'}
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-petrol-600 text-white rounded-lg hover:bg-petrol-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Aggiorna
        </button>
      </div>

      {/* Alert Banner */}
      {stats?.isAnomaly && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-amber-800 font-medium mb-2">
            <AlertTriangle className="h-5 w-5" />
            Anomalie Rilevate
          </div>
          <ul className="list-disc list-inside text-amber-700 text-sm space-y-1">
            {stats.alerts.map((alert, i) => (
              <li key={i}>{alert}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Activity className="h-5 w-5" />}
          label="Ultima Ora"
          value={stats?.lastHour.total || 0}
          subValue={`${stats?.lastHour.blocked || 0} bloccati`}
          color="blue"
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Ultime 24h"
          value={stats?.last24h.total || 0}
          subValue={`${stats?.last24h.success || 0} successi`}
          color="green"
        />
        <StatCard
          icon={<Ban className="h-5 w-5" />}
          label="Bloccati 24h"
          value={stats?.last24h.blocked || 0}
          subValue={`${((stats?.last24h.blocked || 0) / Math.max(stats?.last24h.total || 1, 1) * 100).toFixed(1)}%`}
          color="red"
        />
        <StatCard
          icon={<Mail className="h-5 w-5" />}
          label="Suspicion Score Medio"
          value={stats?.last24h.avgSuspicionScore || 0}
          subValue="su 100"
          color="amber"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IP Sospetti */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              IP Sospetti (ultima ora)
            </h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
            {stats?.suspiciousIPs.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                <CheckCircle className="h-5 w-5 mx-auto mb-2 text-green-500" />
                Nessun IP sospetto rilevato
              </div>
            ) : (
              stats?.suspiciousIPs.map((ip, i) => (
                <div key={i} className="px-4 py-3 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <code className="text-sm font-mono text-gray-800">{ip.ip}</code>
                    <p className="text-xs text-gray-500">
                      Ultimo tentativo: {formatDate(ip.lastAttempt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">{ip.attempts} tentativi</span>
                    <p className="text-xs text-red-600">{ip.blocked} bloccati</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Nomi Alto Suspicion */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="h-4 w-4 text-red-500" />
              Nomi con Alto Suspicion Score (24h)
            </h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
            {stats?.highSuspicionNames.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                <CheckCircle className="h-5 w-5 mx-auto mb-2 text-green-500" />
                Nessun nome sospetto rilevato
              </div>
            ) : (
              stats?.highSuspicionNames.map((item, i) => (
                <div key={i} className="px-4 py-3 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.email}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                        item.score >= 70 ? 'bg-red-100 text-red-700' :
                        item.score >= 50 ? 'bg-amber-100 text-amber-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        Score: {item.score}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {getSourceLabel(item.source)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tentativi Bloccati */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden lg:col-span-2">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Ban className="h-4 w-4 text-red-500" />
              Ultimi Tentativi Bloccati (24h)
            </h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {stats?.blockedAttempts.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                <CheckCircle className="h-5 w-5 mx-auto mb-2 text-green-500" />
                Nessun tentativo bloccato nelle ultime 24h
              </div>
            ) : (
              stats?.blockedAttempts.map((attempt, i) => (
                <div key={i} className="px-4 py-3 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <p className="text-sm text-gray-800">{attempt.email}</p>
                    <p className="text-xs text-gray-500">
                      {getSourceLabel(attempt.source)} • {formatDate(attempt.createdAt)}
                    </p>
                  </div>
                  <code className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded">
                    {attempt.reason}
                  </code>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Distribuzione per Fonte */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden lg:col-span-2">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Distribuzione per Fonte (24h)</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(stats?.last24h.bySource || {}).map(([source, count]) => (
                <div key={source} className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-petrol-600">{count}</p>
                  <p className="text-xs text-gray-500">{getSourceLabel(source)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subValue,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  subValue: string;
  color: 'blue' | 'green' | 'red' | 'amber';
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className={`inline-flex p-2 rounded-lg ${colors[color]} mb-3`}>
        {icon}
      </div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400">{subValue}</p>
    </div>
  );
}
