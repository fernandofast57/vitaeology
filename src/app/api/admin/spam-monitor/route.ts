// ============================================================================
// API: /api/admin/spam-monitor
// Descrizione: Endpoint per monitoraggio spam con alert automatici
// Metodo: GET
// Auth: Solo admin (check ruolo)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { getResend } from '@/lib/email/client';
import { getServiceClient } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';

// Soglie per alert
const ALERT_THRESHOLDS = {
  registrationsPerHour: 10,
  sameIPAttemptsPerHour: 3,
  highSuspicionNamesIn24h: 5,
  blockedAttemptsPerHour: 3,
};

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

export async function GET(request: NextRequest) {
  // Verifica autorizzazione: cron (Bearer CRON_SECRET) o admin (session cookie)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  let isAuthorized = false;

  // 1. Check cron auth
  if (authHeader === `Bearer ${cronSecret}`) {
    isAuthorized = true;
  }

  // 2. Check admin session auth (C10 fix: rimosso NEXT_PUBLIC_CRON_SECRET)
  if (!isAuthorized) {
    try {
      const authSupabase = await createServerClient();
      const { data: { user } } = await authSupabase.auth.getUser();
      if (user) {
        const { data: profile } = await getServiceClient()
          .from('profiles')
          .select('role_id')
          .eq('id', user.id)
          .single();
        // Admin check: role_id presente (admin ha un ruolo assegnato)
        if (profile?.role_id) {
          isAuthorized = true;
        }
      }
    } catch {
      // Auth fallita silenziosamente
    }
  }

  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Non autorizzato' },
      { status: 401 }
    );
  }

  try {
    const stats = await getSpamStats();
    const alerts = checkAlerts(stats);

    const response: SpamStats = {
      ...stats,
      alerts,
      isAnomaly: alerts.length > 0,
    };

    // Se ci sono anomalie, invia alert email
    if (response.isAnomaly) {
      await sendAlertEmail(response);
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Errore spam-monitor:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

async function getSpamStats(): Promise<Omit<SpamStats, 'alerts' | 'isAnomaly'>> {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Stats ultima ora
  const { data: lastHourData }: { data: any[] | null } = await getServiceClient()
    .from('signup_attempts')
    .select('*')
    .gte('created_at', oneHourAgo.toISOString());

  const lastHour = {
    total: lastHourData?.length || 0,
    blocked: lastHourData?.filter(d => d.blocked).length || 0,
    success: lastHourData?.filter(d => d.success).length || 0,
    bySource: groupBySource(lastHourData || []),
  };

  // Stats ultime 24h
  const { data: last24hData }: { data: any[] | null } = await getServiceClient()
    .from('signup_attempts')
    .select('*')
    .gte('created_at', oneDayAgo.toISOString());

  const suspicionScores = (last24hData || [])
    .map(d => d.name_suspicion_score)
    .filter(s => s != null);

  const avgSuspicionScore = suspicionScores.length > 0
    ? suspicionScores.reduce((a, b) => a + b, 0) / suspicionScores.length
    : 0;

  const last24h = {
    total: last24hData?.length || 0,
    blocked: last24hData?.filter(d => d.blocked).length || 0,
    success: last24hData?.filter(d => d.success).length || 0,
    bySource: groupBySource(last24hData || []),
    avgSuspicionScore: Math.round(avgSuspicionScore * 10) / 10,
  };

  // IP sospetti (più di 3 tentativi in 1 ora)
  const ipCounts = new Map<string, { attempts: number; blocked: number; lastAttempt: string }>();
  for (const attempt of lastHourData || []) {
    const ip = attempt.ip_address;
    if (!ip) continue;

    const existing = ipCounts.get(ip) || { attempts: 0, blocked: 0, lastAttempt: '' };
    existing.attempts++;
    if (attempt.blocked) existing.blocked++;
    if (!existing.lastAttempt || attempt.created_at > existing.lastAttempt) {
      existing.lastAttempt = attempt.created_at;
    }
    ipCounts.set(ip, existing);
  }

  const suspiciousIPs = Array.from(ipCounts.entries())
    .filter(([, stats]) => stats.attempts > 3)
    .map(([ip, stats]) => ({ ip, ...stats }))
    .sort((a, b) => b.attempts - a.attempts)
    .slice(0, 10);

  // Nomi con alto suspicion score nelle ultime 24h
  const highSuspicionNames = (last24hData || [])
    .filter(d => d.name_suspicion_score && d.name_suspicion_score >= 40)
    .map(d => ({
      name: d.name || 'N/A',
      email: d.email,
      score: d.name_suspicion_score,
      source: d.source,
      createdAt: d.created_at,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  // Tentativi bloccati nelle ultime 24h
  const blockedAttempts = (last24hData || [])
    .filter(d => d.blocked)
    .map(d => ({
      email: d.email,
      reason: d.block_reason || 'unknown',
      source: d.source,
      createdAt: d.created_at,
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 50);

  return {
    lastHour,
    last24h,
    suspiciousIPs,
    highSuspicionNames,
    blockedAttempts,
  };
}

function groupBySource(data: { source: string }[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of data) {
    counts[item.source] = (counts[item.source] || 0) + 1;
  }
  return counts;
}

function checkAlerts(stats: Omit<SpamStats, 'alerts' | 'isAnomaly'>): string[] {
  const alerts: string[] = [];

  // Check soglie
  if (stats.lastHour.total > ALERT_THRESHOLDS.registrationsPerHour) {
    alerts.push(`⚠️ ${stats.lastHour.total} registrazioni nell'ultima ora (soglia: ${ALERT_THRESHOLDS.registrationsPerHour})`);
  }

  if (stats.suspiciousIPs.length > 0) {
    for (const ip of stats.suspiciousIPs) {
      if (ip.attempts > ALERT_THRESHOLDS.sameIPAttemptsPerHour) {
        alerts.push(`⚠️ IP ${ip.ip} ha ${ip.attempts} tentativi nell'ultima ora`);
      }
    }
  }

  const highSuspicionCount = stats.highSuspicionNames.filter(n => n.score >= 60).length;
  if (highSuspicionCount > ALERT_THRESHOLDS.highSuspicionNamesIn24h) {
    alerts.push(`⚠️ ${highSuspicionCount} nomi con score ≥60 nelle ultime 24h`);
  }

  if (stats.lastHour.blocked > ALERT_THRESHOLDS.blockedAttemptsPerHour) {
    alerts.push(`⚠️ ${stats.lastHour.blocked} tentativi bloccati nell'ultima ora`);
  }

  return alerts;
}

async function sendAlertEmail(stats: SpamStats) {
  const alertEmail = process.env.ERROR_ALERT_EMAIL;
  if (!alertEmail) return;

  const html = `
    <h2>⚠️ Anomalia Anti-Spam Rilevata</h2>
    <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>

    <h3>Alert</h3>
    <ul>
      ${stats.alerts.map(a => `<li>${a}</li>`).join('')}
    </ul>

    <h3>Stats Ultima Ora</h3>
    <ul>
      <li>Totale tentativi: ${stats.lastHour.total}</li>
      <li>Bloccati: ${stats.lastHour.blocked}</li>
      <li>Successi: ${stats.lastHour.success}</li>
    </ul>

    <h3>IP Sospetti</h3>
    <ul>
      ${stats.suspiciousIPs.slice(0, 5).map(ip =>
        `<li>${ip.ip}: ${ip.attempts} tentativi, ${ip.blocked} bloccati</li>`
      ).join('')}
    </ul>

    <h3>Nomi con Alto Suspicion Score</h3>
    <ul>
      ${stats.highSuspicionNames.slice(0, 5).map(n =>
        `<li>${n.name} (${n.email}): score ${n.score}</li>`
      ).join('')}
    </ul>

    <p><a href="https://www.vitaeology.com/admin/spam-monitoring">Vai alla Dashboard</a></p>
  `;

  try {
    await getResend().emails.send({
      from: 'Vitaeology Alerts <alerts@vitaeology.com>',
      to: alertEmail,
      subject: `⚠️ Anomalia Anti-Spam - ${stats.alerts.length} alert`,
      html,
    });
  } catch (error) {
    console.error('Errore invio email alert spam:', error);
  }
}
