/**
 * API Endpoint per Dashboard Monitoraggio 4P×3F
 *
 * GET /api/admin/monitoring - Recupera metriche e stato scheduler
 */

import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/service';
import {
  evaluateThreshold,
  P1_THRESHOLDS,
  P2_THRESHOLDS,
  P3_THRESHOLDS,
  P4_THRESHOLDS
} from '@/lib/monitoring/thresholds';
import { verifyAdminFromRequest } from '@/lib/admin/verify-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Verifica admin auth
  const auth = await verifyAdminFromRequest();
  if (!auth.isAdmin) {
    return auth.response;
  }

  const supabase = getServiceClient();

  try {
    // Recupera ultime metriche
    const { data: lastMetrics } = await supabase
      .from('system_metrics_12f')
      .select('*')
      .order('measured_at', { ascending: false })
      .limit(1)
      .single();

    // Recupera stato scheduler
    const { data: scheduleStates } = await supabase
      .from('monitoring_schedule_state')
      .select('*');

    // Recupera alert recenti (ultime 24h)
    const { data: recentAlerts } = await supabase
      .from('monitoring_alerts_log')
      .select('*')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(20);

    // Costruisci risposta per dashboard
    const metrics = lastMetrics || {};

    // Valuta status per ogni metrica
    const getStatus = (value: number | null, thresholdKey: string, thresholds: Record<string, { warningThreshold: number; criticalThreshold: number; comparison: string }>) => {
      const config = thresholds[thresholdKey];
      if (!config || value === null) return 'neutral';
      const result = evaluateThreshold(value, config as Parameters<typeof evaluateThreshold>[1]);
      return result.triggered ? result.severity : 'ok';
    };

    const products = [
      {
        code: 'P1' as const,
        name: 'Sistema',
        description: 'Istituzione di ciò che produce',
        color: '#3B82F6', // blue
        metrics: {
          quantity: {
            label: 'Servizi attivi',
            value: metrics.p1_quantity_services_active ?? null,
            status: getStatus(metrics.p1_quantity_services_active, 'services_active', P1_THRESHOLDS),
            description: 'Numero di servizi esterni funzionanti'
          },
          quality: {
            label: 'Uptime',
            value: metrics.p1_quality_uptime_percent ? `${metrics.p1_quality_uptime_percent}%` : null,
            status: getStatus(metrics.p1_quality_uptime_percent, 'uptime_percent', P1_THRESHOLDS),
            description: 'Percentuale uptime ultime 24h'
          },
          viability: {
            label: 'Costo/Latenza',
            value: metrics.p1_viability_avg_latency_ms ? `${metrics.p1_viability_avg_latency_ms}ms` : null,
            status: getStatus(metrics.p1_viability_avg_latency_ms, 'avg_latency', P1_THRESHOLDS),
            description: 'Latenza media API'
          }
        }
      },
      {
        code: 'P2' as const,
        name: 'Output',
        description: 'Prodotto generato (trasformazione utente)',
        color: '#10B981', // green
        metrics: {
          quantity: {
            label: 'Conversazioni',
            value: metrics.p2_quantity_conversations ?? null,
            status: 'ok' as const,
            description: 'Conversazioni AI Coach ultime 24h'
          },
          quality: {
            label: 'Rating',
            value: metrics.p2_quality_avg_rating ? `${metrics.p2_quality_avg_rating}/5` : null,
            status: getStatus(metrics.p2_quality_avg_rating, 'avg_rating', P2_THRESHOLDS),
            description: 'Rating medio conversazioni'
          },
          viability: {
            label: 'Retention',
            value: metrics.p2_viability_user_retention ? `${metrics.p2_viability_user_retention}%` : null,
            status: getStatus(metrics.p2_viability_user_retention, 'user_retention', P2_THRESHOLDS),
            description: 'Utenti che ritornano entro 7 giorni'
          }
        }
      },
      {
        code: 'P3' as const,
        name: 'Manutenzione',
        description: 'Riparazione di ciò che produce',
        color: '#8B5CF6', // purple
        metrics: {
          quantity: {
            label: 'Errori risolti',
            value: metrics.p3_quantity_errors_fixed ?? null,
            status: 'ok' as const,
            description: 'Errori risolti ultime 24h'
          },
          quality: {
            label: 'Fix efficaci',
            value: metrics.p3_quality_fix_effectiveness ? `${metrics.p3_quality_fix_effectiveness}%` : null,
            status: getStatus(metrics.p3_quality_fix_effectiveness, 'fix_effectiveness', P3_THRESHOLDS),
            description: 'Percentuale fix definitivi'
          },
          viability: {
            label: 'MTTR',
            value: metrics.p3_viability_mttr_hours ? `${metrics.p3_viability_mttr_hours}h` : null,
            status: getStatus(metrics.p3_viability_mttr_hours, 'mttr_hours', P3_THRESHOLDS),
            description: 'Tempo medio risoluzione'
          }
        }
      },
      {
        code: 'P4' as const,
        name: 'Correzione',
        description: 'Correzione del prodotto (AI Coach)',
        color: '#F59E0B', // orange
        metrics: {
          quantity: {
            label: 'Pattern rilevati',
            value: metrics.p4_quantity_patterns_detected ?? null,
            status: getStatus(metrics.p4_quantity_patterns_detected, 'patterns_pending', P4_THRESHOLDS),
            description: 'Pattern in attesa di correzione'
          },
          quality: {
            label: 'Efficacia',
            value: metrics.p4_quality_correction_effectiveness ? `${metrics.p4_quality_correction_effectiveness}%` : null,
            status: getStatus(metrics.p4_quality_correction_effectiveness, 'correction_effectiveness', P4_THRESHOLDS),
            description: 'Correzioni che migliorano rating'
          },
          viability: {
            label: 'Prevenzione',
            value: metrics.p4_viability_prevention_rate ? `${metrics.p4_viability_prevention_rate}%` : null,
            status: getStatus(metrics.p4_viability_prevention_rate, 'prevention_rate', P4_THRESHOLDS),
            description: 'Pattern prevenuti vs rilevati'
          }
        }
      }
    ];

    // Determina status complessivo
    const allStatuses = products.flatMap(p => [
      p.metrics.quantity.status,
      p.metrics.quality.status,
      p.metrics.viability.status
    ]);

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (allStatuses.includes('critical')) {
      overallStatus = 'unhealthy';
    } else if (allStatuses.includes('warning')) {
      overallStatus = 'degraded';
    }

    return NextResponse.json({
      success: true,
      products,
      scheduleStates: scheduleStates || [],
      recentAlerts: recentAlerts || [],
      overallStatus,
      lastMetricsAt: metrics.measured_at || null
    });

  } catch (error) {
    console.error('[Monitoring API] Errore:', error);

    // Ritorna dati vuoti in caso di errore (tabelle potrebbero non esistere ancora)
    return NextResponse.json({
      success: true,
      products: [
        {
          code: 'P1',
          name: 'Sistema',
          description: 'Istituzione di ciò che produce',
          color: '#3B82F6',
          metrics: {
            quantity: { label: 'Servizi attivi', value: null, status: 'neutral', description: 'Nessun dato' },
            quality: { label: 'Uptime', value: null, status: 'neutral', description: 'Nessun dato' },
            viability: { label: 'Latenza', value: null, status: 'neutral', description: 'Nessun dato' }
          }
        },
        {
          code: 'P2',
          name: 'Output',
          description: 'Prodotto generato',
          color: '#10B981',
          metrics: {
            quantity: { label: 'Conversazioni', value: null, status: 'neutral', description: 'Nessun dato' },
            quality: { label: 'Rating', value: null, status: 'neutral', description: 'Nessun dato' },
            viability: { label: 'Retention', value: null, status: 'neutral', description: 'Nessun dato' }
          }
        },
        {
          code: 'P3',
          name: 'Manutenzione',
          description: 'Riparazione',
          color: '#8B5CF6',
          metrics: {
            quantity: { label: 'Errori', value: null, status: 'neutral', description: 'Nessun dato' },
            quality: { label: 'Fix efficaci', value: null, status: 'neutral', description: 'Nessun dato' },
            viability: { label: 'MTTR', value: null, status: 'neutral', description: 'Nessun dato' }
          }
        },
        {
          code: 'P4',
          name: 'Correzione',
          description: 'AI Coach',
          color: '#F59E0B',
          metrics: {
            quantity: { label: 'Pattern', value: null, status: 'neutral', description: 'Nessun dato' },
            quality: { label: 'Efficacia', value: null, status: 'neutral', description: 'Nessun dato' },
            viability: { label: 'Prevenzione', value: null, status: 'neutral', description: 'Nessun dato' }
          }
        }
      ],
      scheduleStates: [],
      recentAlerts: [],
      overallStatus: 'healthy',
      lastMetricsAt: null,
      note: 'Esegui la migrazione SQL per attivare il monitoraggio'
    });
  }
}
