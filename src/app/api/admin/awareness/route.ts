/**
 * Admin API: Awareness Analytics
 *
 * GET /api/admin/awareness
 * Returns awareness level distribution, progression data, and user details
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getLevelName, getZoneForLevel, getZoneInfo, AWARENESS_ZONES, AWARENESS_SCALE } from '@/lib/awareness/types';
import { verifyAdminFromRequest } from '@/lib/admin/verify-admin';

export const dynamic = 'force-dynamic';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  try {
    // Verifica admin auth
    const auth = await verifyAdminFromRequest();
    if (!auth.isAdmin) {
      return auth.response;
    }

    const supabase = getSupabase();

    // 1. Distribuzione per livello
    const { data: levelDistribution } = await supabase
      .from('ai_coach_user_memory')
      .select('awareness_level')
      .not('awareness_level', 'is', null);

    // Conta per livello
    const levelCounts: Record<number, number> = {};
    levelDistribution?.forEach((row) => {
      const level = row.awareness_level ?? -5;
      levelCounts[level] = (levelCounts[level] || 0) + 1;
    });

    // Trasforma in array per frontend
    const distribution = Object.entries(levelCounts).map(([level, count]) => ({
      level: parseInt(level),
      levelName: getLevelName(parseInt(level)),
      zone: getZoneForLevel(parseInt(level)),
      zoneName: getZoneInfo(getZoneForLevel(parseInt(level))).name,
      count,
    })).sort((a, b) => b.level - a.level);

    // 2. Distribuzione per zona
    const zoneCounts: Record<string, number> = {
      sotto_necessita: 0,
      transizione: 0,
      riconoscimento: 0,
      trasformazione: 0,
      padronanza: 0,
    };

    distribution.forEach((d) => {
      zoneCounts[d.zone] += d.count;
    });

    const zoneDistribution = Object.entries(AWARENESS_ZONES).map(([key, info]) => ({
      zone: key,
      name: info.name,
      minLevel: info.minLevel,
      maxLevel: info.maxLevel,
      description: info.description,
      vitaeologyPhase: info.vitaeologyPhase,
      count: zoneCounts[key] || 0,
    }));

    // 3. Progressione recente (ultimi 7 giorni)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentHistory } = await supabase
      .from('user_awareness_history')
      .select('level, trigger_event, calculated_at')
      .gte('calculated_at', sevenDaysAgo.toISOString())
      .order('calculated_at', { ascending: true });

    // Raggruppa per giorno
    const dailyProgress: Record<string, { date: string; calculations: number; levelChanges: number }> = {};
    recentHistory?.forEach((entry) => {
      const date = new Date(entry.calculated_at).toISOString().split('T')[0];
      if (!dailyProgress[date]) {
        dailyProgress[date] = { date, calculations: 0, levelChanges: 0 };
      }
      dailyProgress[date].calculations++;
      // Conta cambi livello basandosi su trigger event diversi da scheduled_update
      if (entry.trigger_event !== 'scheduled_update') {
        dailyProgress[date].levelChanges++;
      }
    });

    const progressTrend = Object.values(dailyProgress).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    // 4. Top trigger events
    const triggerCounts: Record<string, number> = {};
    recentHistory?.forEach((entry) => {
      const trigger = entry.trigger_event || 'unknown';
      triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
    });

    const topTriggers = Object.entries(triggerCounts)
      .map(([trigger, count]) => ({ trigger, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 5. Utenti per livello alto (>= 3) con dettagli
    const { data: topUsers } = await supabase
      .from('ai_coach_user_memory')
      .select(`
        user_id,
        awareness_level,
        awareness_score,
        awareness_calculated_at
      `)
      .gte('awareness_level', 3)
      .order('awareness_level', { ascending: false })
      .limit(20);

    // Arricchisci con email
    let enrichedTopUsers: Array<{
      userId: string;
      email: string;
      level: number;
      levelName: string;
      score: number;
      calculatedAt: string;
    }> = [];

    if (topUsers && topUsers.length > 0) {
      const userIds = topUsers.map((u) => u.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);

      const emailMap = new Map(profiles?.map((p) => [p.id, p.email]) || []);

      enrichedTopUsers = topUsers.map((u) => ({
        userId: u.user_id,
        email: emailMap.get(u.user_id) || 'unknown',
        level: u.awareness_level,
        levelName: getLevelName(u.awareness_level),
        score: u.awareness_score || 0,
        calculatedAt: u.awareness_calculated_at,
      }));
    }

    // 6. Statistiche aggregate
    const totalUsers = levelDistribution?.length || 0;
    const avgLevel = totalUsers > 0
      ? levelDistribution!.reduce((sum, r) => sum + (r.awareness_level || -5), 0) / totalUsers
      : -5;

    // Conta utenti che hanno completato challenge
    const challengeCompletedCount = zoneCounts.transizione + zoneCounts.riconoscimento +
      zoneCounts.trasformazione + zoneCounts.padronanza;

    // Conta utenti sopra livello 0
    const aboveZeroCount = zoneCounts.riconoscimento + zoneCounts.trasformazione + zoneCounts.padronanza;

    return NextResponse.json({
      summary: {
        totalUsers,
        avgLevel: Math.round(avgLevel * 10) / 10,
        avgLevelName: getLevelName(Math.round(avgLevel)),
        challengeCompletedCount,
        aboveZeroCount,
        lastUpdated: new Date().toISOString(),
      },
      distribution,
      zoneDistribution,
      progressTrend,
      topTriggers,
      topUsers: enrichedTopUsers,
      scale: AWARENESS_SCALE,
    });
  } catch (error) {
    console.error('[Admin Awareness API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
