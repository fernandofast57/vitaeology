'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock, Activity, TrendingUp, Zap } from 'lucide-react';

interface MetricCard {
  label: string;
  value: string | number | null;
  status: 'ok' | 'warning' | 'critical' | 'neutral';
  description: string;
}

interface ProductMetrics {
  name: string;
  code: 'P1' | 'P2' | 'P3' | 'P4';
  description: string;
  color: string;
  metrics: {
    quantity: MetricCard;
    quality: MetricCard;
    viability: MetricCard;
  };
}

interface ScheduleState {
  check_type: string;
  is_anomaly_mode: boolean;
  last_status: string | null;
  current_interval_ms: number;
  last_check_at: string | null;
  consecutive_anomalies: number;
}

interface Alert {
  id: string;
  alert_type: string;
  severity: string;
  message: string;
  created_at: string;
  resolved_at: string | null;
}

export default function MonitoringDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [products, setProducts] = useState<ProductMetrics[]>([]);
  const [scheduleStates, setScheduleStates] = useState<ScheduleState[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [overallStatus, setOverallStatus] = useState<'healthy' | 'degraded' | 'unhealthy'>('healthy');

  const fetchData = useCallback(async () => {
    try {
      // Fetch metriche recenti
      const metricsRes = await fetch('/api/admin/monitoring');
      const metricsData = await metricsRes.json();

      if (metricsData.success) {
        setProducts(metricsData.products);
        setScheduleStates(metricsData.scheduleStates);
        setRecentAlerts(metricsData.recentAlerts);
        setOverallStatus(metricsData.overallStatus);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Errore fetch monitoring:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Auto-refresh ogni 60 secondi
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const handleForceCheck = async () => {
    setRefreshing(true);
    try {
      await fetch('/api/cron/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: 'manual-trigger' })
      });
      await fetchData();
    } catch (error) {
      console.error('Errore force check:', error);
    }
    setRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatInterval = (ms: number) => {
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    if (ms < 3600000) return `${Math.round(ms / 60000)}min`;
    return `${Math.round(ms / 3600000)}h`;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monitoraggio 4P×3F</h1>
          <p className="text-gray-500 mt-1">
            Sistema di controllo basato sui 4 Prodotti × 3 Fattori
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Overall Status */}
          <div className={`px-4 py-2 rounded-full font-medium ${
            overallStatus === 'healthy' ? 'bg-green-100 text-green-800' :
            overallStatus === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {overallStatus === 'healthy' ? 'Sistema OK' :
             overallStatus === 'degraded' ? 'Degradato' : 'Critico'}
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Aggiorna
          </button>

          <button
            onClick={handleForceCheck}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-petrol-600 text-white rounded-lg hover:bg-petrol-700 disabled:opacity-50"
          >
            <Zap className="h-4 w-4" />
            Force Check
          </button>
        </div>
      </div>

      {/* Last Update */}
      {lastUpdate && (
        <p className="text-sm text-gray-400">
          Ultimo aggiornamento: {lastUpdate.toLocaleTimeString('it-IT')}
        </p>
      )}

      {/* 4P×3F Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.code}
            className="bg-white rounded-xl border shadow-sm overflow-hidden"
          >
            {/* Product Header */}
            <div
              className="p-4 text-white"
              style={{ backgroundColor: product.color }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">{product.code}</h3>
                {getStatusIcon(
                  [product.metrics.quantity.status, product.metrics.quality.status, product.metrics.viability.status]
                    .includes('critical') ? 'critical' :
                  [product.metrics.quantity.status, product.metrics.quality.status, product.metrics.viability.status]
                    .includes('warning') ? 'warning' : 'ok'
                )}
              </div>
              <p className="text-sm opacity-90">{product.name}</p>
            </div>

            {/* 3 Factors */}
            <div className="p-4 space-y-3">
              {/* Quantity */}
              <div className={`p-3 rounded-lg border ${getStatusColor(product.metrics.quantity.status)}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 uppercase">Quantità</span>
                  {getStatusIcon(product.metrics.quantity.status)}
                </div>
                <p className="text-lg font-bold mt-1">
                  {product.metrics.quantity.value ?? '-'}
                </p>
                <p className="text-xs text-gray-500">{product.metrics.quantity.label}</p>
              </div>

              {/* Quality */}
              <div className={`p-3 rounded-lg border ${getStatusColor(product.metrics.quality.status)}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 uppercase">Qualità</span>
                  {getStatusIcon(product.metrics.quality.status)}
                </div>
                <p className="text-lg font-bold mt-1">
                  {product.metrics.quality.value ?? '-'}
                </p>
                <p className="text-xs text-gray-500">{product.metrics.quality.label}</p>
              </div>

              {/* Viability */}
              <div className={`p-3 rounded-lg border ${getStatusColor(product.metrics.viability.status)}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 uppercase">Viability</span>
                  {getStatusIcon(product.metrics.viability.status)}
                </div>
                <p className="text-lg font-bold mt-1">
                  {product.metrics.viability.value ?? '-'}
                </p>
                <p className="text-xs text-gray-500">{product.metrics.viability.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scheduler Status */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Scheduler Adattivo
        </h2>

        <div className="grid grid-cols-4 gap-4">
          {scheduleStates.map((state) => (
            <div
              key={state.check_type}
              className={`p-4 rounded-lg border ${
                state.is_anomaly_mode ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium capitalize">{state.check_type}</span>
                {state.is_anomaly_mode && (
                  <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs rounded-full">
                    Anomaly Mode
                  </span>
                )}
              </div>

              <div className="space-y-1 text-sm">
                <p className="text-gray-600">
                  Intervallo: <span className="font-medium">{formatInterval(state.current_interval_ms)}</span>
                </p>
                <p className="text-gray-600">
                  Ultimo: <span className="font-medium">
                    {state.last_check_at
                      ? new Date(state.last_check_at).toLocaleTimeString('it-IT')
                      : 'Mai'}
                  </span>
                </p>
                {state.consecutive_anomalies > 0 && (
                  <p className="text-yellow-700">
                    Anomalie consecutive: {state.consecutive_anomalies}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Alert Recenti
        </h2>

        {recentAlerts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nessun alert nelle ultime 24 ore
          </p>
        ) : (
          <div className="space-y-2">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border flex items-center justify-between ${
                  alert.severity === 'critical' ? 'bg-red-50 border-red-200' :
                  alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(alert.severity)}
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(alert.created_at).toLocaleString('it-IT')}
                    </p>
                  </div>
                </div>

                {alert.resolved_at ? (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Risolto
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    Attivo
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium mb-2">Legenda 4 Prodotti</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-bold text-blue-600">P1</span>: Sistema (Istituzione)
          </div>
          <div>
            <span className="font-bold text-green-600">P2</span>: Output (Trasformazione)
          </div>
          <div>
            <span className="font-bold text-purple-600">P3</span>: Manutenzione (Riparazione)
          </div>
          <div>
            <span className="font-bold text-orange-600">P4</span>: Correzione (AI Coach)
          </div>
        </div>
      </div>
    </div>
  );
}
