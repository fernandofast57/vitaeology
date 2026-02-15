/**
 * Master Scheduler - Endpoint Cron Unificato
 *
 * Eseguito ogni 2 minuti, decide dinamicamente quali check eseguire
 * basandosi sullo stato dello scheduler adattivo.
 *
 * GET /api/cron/monitoring - Esecuzione automatica (Vercel Cron)
 * POST /api/cron/monitoring - Esecuzione manuale con CRON_SECRET
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/service';
import { determineChecksToRun, updateScheduleState, CheckType, initializeScheduler } from '@/lib/monitoring/scheduler';
import { calculateAll12Factors, saveMetrics12F, HealthCheckResult } from '@/lib/monitoring/metrics-12f';
import {
  evaluateProductThresholds,
  P1_THRESHOLDS,
  P2_THRESHOLDS,
  P4_THRESHOLDS,
  ThresholdResult
} from '@/lib/monitoring/thresholds';
import { sendErrorAlert } from '@/lib/error-alerts';
import { cleanupExpiredBlocks } from '@/lib/validation/ip-blocklist';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// =====================================================
// HEALTH CHECK (P1)
// =====================================================

async function runHealthCheck(): Promise<{ results: HealthCheckResult[]; isAnomaly: boolean }> {
  const results: HealthCheckResult[] = [];

  // Database
  const dbStart = Date.now();
  try {
    const supabase = getServiceClient();
    await supabase.from('profiles').select('id').limit(1);
    results.push({ service: 'Database', status: 'ok', latency: Date.now() - dbStart });
  } catch {
    results.push({ service: 'Database', status: 'error', latency: Date.now() - dbStart, message: 'Connection failed' });
  }

  // Auth
  const authStart = Date.now();
  try {
    const supabase = getServiceClient();
    await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    results.push({ service: 'Auth', status: 'ok', latency: Date.now() - authStart });
  } catch {
    results.push({ service: 'Auth', status: 'error', latency: Date.now() - authStart, message: 'Auth service failed' });
  }

  // Resend
  const emailStart = Date.now();
  try {
    const res = await fetch('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` }
    });
    results.push({
      service: 'Email',
      status: res.ok ? 'ok' : 'warning',
      latency: Date.now() - emailStart
    });
  } catch {
    results.push({ service: 'Email', status: 'error', latency: Date.now() - emailStart });
  }

  // Anthropic
  const aiStart = Date.now();
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 5,
        messages: [{ role: 'user', content: 'ping' }]
      })
    });
    results.push({
      service: 'AI Coach',
      status: res.ok || res.status === 429 ? 'ok' : 'error',
      latency: Date.now() - aiStart
    });
  } catch {
    results.push({ service: 'AI Coach', status: 'error', latency: Date.now() - aiStart });
  }

  // Stripe
  const stripeStart = Date.now();
  try {
    const res = await fetch('https://api.stripe.com/v1/balance', {
      headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` }
    });
    results.push({ service: 'Payments', status: res.ok ? 'ok' : 'error', latency: Date.now() - stripeStart });
  } catch {
    results.push({ service: 'Payments', status: 'error', latency: Date.now() - stripeStart });
  }

  // OpenAI
  const openaiStart = Date.now();
  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }
    });
    results.push({ service: 'Embeddings', status: res.ok ? 'ok' : 'warning', latency: Date.now() - openaiStart });
  } catch {
    results.push({ service: 'Embeddings', status: 'warning', latency: Date.now() - openaiStart });
  }

  // Determina se c'è un'anomalia (meno di 5 servizi OK o errori critici)
  const okCount = results.filter(r => r.status === 'ok').length;
  const hasErrors = results.some(r => r.status === 'error' && ['Database', 'Auth', 'Payments'].includes(r.service));
  const isAnomaly = okCount < 5 || hasErrors;

  return { results, isAnomaly };
}

// =====================================================
// SPAM CHECK
// =====================================================

interface SpamCheckResult {
  lastHour: {
    total: number;
    blocked: number;
    success: number;
  };
  last24h: {
    total: number;
    blocked: number;
  };
  suspiciousIPCount: number;
  highSuspicionNameCount: number;
  alerts: string[];
  isAnomaly: boolean;
}

// Soglie per spam alerts
const SPAM_THRESHOLDS = {
  registrationsPerHour: 10,
  sameIPAttemptsPerHour: 3,
  highSuspicionNamesIn24h: 5,
  blockedAttemptsPerHour: 3,
};

async function runSpamCheck(supabase: ReturnType<typeof getServiceClient>): Promise<SpamCheckResult> {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Cleanup expired IP blocks
  await cleanupExpiredBlocks();

  // Stats ultima ora
  const { data: lastHourData } = await supabase
    .from('signup_attempts')
    .select('*')
    .gte('created_at', oneHourAgo.toISOString());

  const lastHour = {
    total: lastHourData?.length || 0,
    blocked: lastHourData?.filter(d => d.blocked).length || 0,
    success: lastHourData?.filter(d => d.success).length || 0,
  };

  // Stats ultime 24h
  const { data: last24hData } = await supabase
    .from('signup_attempts')
    .select('*')
    .gte('created_at', oneDayAgo.toISOString());

  const last24h = {
    total: last24hData?.length || 0,
    blocked: last24hData?.filter(d => d.blocked).length || 0,
  };

  // IP sospetti (più di 3 tentativi in 1 ora)
  const ipCounts = new Map<string, number>();
  for (const attempt of lastHourData || []) {
    const ip = attempt.ip_address;
    if (ip) {
      ipCounts.set(ip, (ipCounts.get(ip) || 0) + 1);
    }
  }
  const suspiciousIPCount = Array.from(ipCounts.values()).filter(c => c > 3).length;

  // Nomi con alto suspicion score nelle ultime 24h
  const highSuspicionNameCount = (last24hData || [])
    .filter(d => d.name_suspicion_score && d.name_suspicion_score >= 60)
    .length;

  // Valuta alerts
  const alerts: string[] = [];

  if (lastHour.total > SPAM_THRESHOLDS.registrationsPerHour) {
    alerts.push(`⚠️ ${lastHour.total} registrazioni nell'ultima ora (soglia: ${SPAM_THRESHOLDS.registrationsPerHour})`);
  }

  if (suspiciousIPCount > 0) {
    alerts.push(`⚠️ ${suspiciousIPCount} IP sospetti (>3 tentativi/ora)`);
  }

  if (highSuspicionNameCount > SPAM_THRESHOLDS.highSuspicionNamesIn24h) {
    alerts.push(`⚠️ ${highSuspicionNameCount} nomi con score ≥60 nelle ultime 24h`);
  }

  if (lastHour.blocked > SPAM_THRESHOLDS.blockedAttemptsPerHour) {
    alerts.push(`⚠️ ${lastHour.blocked} tentativi bloccati nell'ultima ora`);
  }

  return {
    lastHour,
    last24h,
    suspiciousIPCount,
    highSuspicionNameCount,
    alerts,
    isAnomaly: alerts.length > 0,
  };
}

// =====================================================
// VALUTA ALERT E INVIA SE NECESSARIO
// =====================================================

async function evaluateAndAlert(
  supabase: ReturnType<typeof getServiceClient>,
  metrics: Record<string, number | null>,
  checkType: 'P1' | 'P2' | 'P4'
): Promise<ThresholdResult[]> {
  const thresholds = checkType === 'P1' ? P1_THRESHOLDS
    : checkType === 'P2' ? P2_THRESHOLDS
    : P4_THRESHOLDS;

  const results = evaluateProductThresholds(metrics, thresholds);

  // Filtra solo alert triggered
  const triggeredAlerts = results.filter(r => r.triggered);

  for (const alert of triggeredAlerts) {
    // Log nel database (sempre)
    await supabase.from('monitoring_alerts_log').insert({
      alert_type: `${checkType.toLowerCase()}_${alert.metricName}`,
      severity: alert.severity,
      metric_name: alert.metricName,
      threshold_value: alert.threshold,
      actual_value: alert.value,
      message: `${alert.description}: ${alert.value} (soglia: ${alert.threshold})`
    });

    // Invia email SOLO per P1 critical (problemi di sistema reali)
    // P2 e P4 potrebbero non avere dati sufficienti in un sistema nuovo
    if (alert.severity === 'critical' && checkType === 'P1') {
      await sendErrorAlert({
        type: `monitoring_${checkType.toLowerCase()}`,
        severity: 'critical',
        message: `[${checkType}] ${alert.description}`,
        context: {
          metric: alert.metricName,
          value: alert.value,
          threshold: alert.threshold
        }
      });
    }
  }

  return results;
}

// =====================================================
// HANDLER PRINCIPALE
// =====================================================

export async function GET(request: NextRequest) {
  // Verifica autorizzazione per Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // In development permetti senza auth
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return runMonitoring();
}

export async function POST(request: NextRequest) {
  // Verifica CRON_SECRET
  const { secret } = await request.json().catch(() => ({ secret: null }));
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return runMonitoring();
}

async function runMonitoring(): Promise<NextResponse> {
  const startTime = Date.now();
  const supabase = getServiceClient();

  try {
    // Inizializza scheduler se necessario
    const { data: scheduleExists } = await supabase
      .from('monitoring_schedule_state')
      .select('check_type')
      .limit(1);

    if (!scheduleExists || scheduleExists.length === 0) {
      await initializeScheduler(supabase);
    }

    // Determina quali check eseguire
    const decisions = await determineChecksToRun(supabase);
    const checksToRun = decisions.filter(d => d.shouldRun);

    if (checksToRun.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nessun check da eseguire',
        decisions,
        duration_ms: Date.now() - startTime
      });
    }

    console.log(`[Monitoring] Check da eseguire: ${checksToRun.map(c => c.checkType).join(', ')}`);

    const results: Record<string, unknown> = {};
    let healthResults: HealthCheckResult[] = [];
    let overallIsAnomaly = false;
    let spamCheckResult: SpamCheckResult | null = null;

    // Esegui Health Check (sempre prioritario)
    if (checksToRun.some(c => c.checkType === 'health')) {
      const health = await runHealthCheck();
      healthResults = health.results;
      overallIsAnomaly = health.isAnomaly;

      await updateScheduleState(
        supabase,
        'health',
        overallIsAnomaly ? 'warning' : 'ok',
        overallIsAnomaly
      );

      results.health = {
        services: healthResults,
        isAnomaly: overallIsAnomaly
      };

      // Run spam check alongside health check
      try {
        spamCheckResult = await runSpamCheck(supabase);
        results.spam = spamCheckResult;

        if (spamCheckResult.isAnomaly) {
          overallIsAnomaly = true;

          // Log spam alerts
          for (const alert of spamCheckResult.alerts) {
            await supabase.from('monitoring_alerts_log').insert({
              alert_type: 'spam_anomaly',
              severity: 'warning',
              metric_name: 'spam_check',
              threshold_value: null,
              actual_value: null,
              message: alert
            });
          }

          // Send email alert for spam anomalies
          await sendErrorAlert({
            type: 'spam_monitoring',
            severity: 'medium',
            message: `[SPAM] ${spamCheckResult.alerts.length} anomalie rilevate - ` +
              `Ultima ora: ${spamCheckResult.lastHour.total} tentativi, ${spamCheckResult.lastHour.blocked} bloccati - ` +
              `IP sospetti: ${spamCheckResult.suspiciousIPCount} - Nomi sospetti: ${spamCheckResult.highSuspicionNameCount}`,
            context: {
              requestBody: {
                lastHour: spamCheckResult.lastHour,
                last24h: spamCheckResult.last24h,
                suspiciousIPCount: spamCheckResult.suspiciousIPCount,
                highSuspicionNameCount: spamCheckResult.highSuspicionNameCount,
                alerts: spamCheckResult.alerts
              }
            }
          });
        }
      } catch (spamError) {
        console.error('[Monitoring] Errore spam check:', spamError);
        results.spam = { error: 'Failed to run spam check' };
      }
    } else {
      // Recupera ultimo health check per metriche
      const { data: lastMetrics } = await supabase
        .from('system_metrics_12f')
        .select('check_details')
        .order('measured_at', { ascending: false })
        .limit(1)
        .single();

      if (lastMetrics?.check_details?.health) {
        healthResults = lastMetrics.check_details.health as HealthCheckResult[];
      }
    }

    // Calcola metriche 12F
    const metrics = await calculateAll12Factors(supabase, healthResults);

    // Esegui check P2 se schedulato
    if (checksToRun.some(c => c.checkType === 'p2')) {
      const p2Results = await evaluateAndAlert(supabase, metrics as unknown as Record<string, number | null>, 'P2');
      const p2IsAnomaly = p2Results.some(r => r.triggered && r.severity === 'critical');

      await updateScheduleState(
        supabase,
        'p2',
        p2IsAnomaly ? 'warning' : 'ok',
        p2IsAnomaly
      );

      overallIsAnomaly = overallIsAnomaly || p2IsAnomaly;
      results.p2 = p2Results;
    }

    // Esegui check P4 se schedulato
    if (checksToRun.some(c => c.checkType === 'p4')) {
      const p4Results = await evaluateAndAlert(supabase, metrics as unknown as Record<string, number | null>, 'P4');
      const p4IsAnomaly = p4Results.some(r => r.triggered && r.severity === 'critical');

      await updateScheduleState(
        supabase,
        'p4',
        p4IsAnomaly ? 'warning' : 'ok',
        p4IsAnomaly
      );

      overallIsAnomaly = overallIsAnomaly || p4IsAnomaly;
      results.p4 = p4Results;
    }

    // Valuta anche P1 per alert
    const p1Results = await evaluateAndAlert(supabase, metrics as unknown as Record<string, number | null>, 'P1');
    results.p1 = p1Results;

    // Determina tipo metrica basato su cosa abbiamo eseguito
    const metricType = checksToRun.some(c => c.checkType === 'report') ? 'daily' : 'realtime';

    // Salva snapshot metriche
    const alertsTriggered = [
      ...(results.p1 as ThresholdResult[] || []),
      ...(results.p2 as ThresholdResult[] || []),
      ...(results.p4 as ThresholdResult[] || [])
    ].filter((r: ThresholdResult) => r.triggered).map((r: ThresholdResult) => ({
      type: r.metricName,
      severity: r.severity,
      message: r.description
    }));

    const metricsId = await saveMetrics12F(
      supabase,
      metrics,
      metricType,
      alertsTriggered,
      { health: healthResults }
    );

    return NextResponse.json({
      success: true,
      metricsId,
      checksExecuted: checksToRun.map(c => c.checkType),
      isAnomaly: overallIsAnomaly,
      metrics: {
        p1: {
          services_active: metrics.p1_quantity_services_active,
          uptime: metrics.p1_quality_uptime_percent,
          cost_eur: metrics.p1_viability_api_cost_eur,
          latency_ms: metrics.p1_viability_avg_latency_ms
        },
        p2: {
          conversations: metrics.p2_quantity_conversations,
          rating: metrics.p2_quality_avg_rating,
          completion: metrics.p2_quality_completion_rate
        },
        p4: {
          patterns_detected: metrics.p4_quantity_patterns_detected,
          patterns_corrected: metrics.p4_quantity_patterns_corrected
        },
        spam: spamCheckResult ? {
          lastHour: spamCheckResult.lastHour,
          last24h: spamCheckResult.last24h,
          suspiciousIPs: spamCheckResult.suspiciousIPCount,
          highSuspicionNames: spamCheckResult.highSuspicionNameCount,
          alertsCount: spamCheckResult.alerts.length
        } : null
      },
      alertsTriggered: alertsTriggered.length + (spamCheckResult?.alerts.length || 0),
      spamAlerts: spamCheckResult?.alerts || [],
      decisions,
      duration_ms: Date.now() - startTime
    });

  } catch (error) {
    console.error('[Monitoring] Errore:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - startTime
    }, { status: 500 });
  }
}
