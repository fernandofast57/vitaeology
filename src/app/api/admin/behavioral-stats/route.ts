import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface EventCount {
  challenge_type: string;
  event_type: string;
  count: number;
}

interface FunnelData {
  challenge_type: string;
  views: number;
  scroll_50: number;
  engaged: number;
  converted: number;
}

interface VariantEngagement {
  challenge_type: string;
  variant: string;
  avg_engagement: number;
  sessions: number;
}

interface DeviceBreakdown {
  device_type: string;
  sessions: number;
  avg_engagement: number;
}

interface ReturnVisitorData {
  challenge_type: string;
  is_return_visitor: boolean;
  sessions: number;
  conversions: number;
}

interface DailyTrend {
  date: string;
  sessions: number;
  events: number;
  conversions: number;
  avg_engagement: number;
}

interface ExitIntentData {
  challenge_type: string;
  triggered: number;
  dismissed: number;
  converted: number;
  conversion_rate: number;
}

interface ScrollDepthData {
  challenge_type: string;
  scroll_25: number;
  scroll_50: number;
  scroll_75: number;
  scroll_100: number;
}

interface BehavioralStats {
  eventCounts: EventCount[];
  funnel: FunnelData[];
  variantEngagement: VariantEngagement[];
  deviceBreakdown: DeviceBreakdown[];
  returnVisitors: ReturnVisitorData[];
  dailyTrend: DailyTrend[];
  exitIntent: ExitIntentData[];
  scrollDepth: ScrollDepthData[];
  summary: {
    totalSessions: number;
    totalEvents: number;
    avgEngagement: number;
    conversionRate: number;
  };
}

export async function GET() {
  try {
    const supabase = await createClient();

    // Verify admin access
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, role_id, roles (level)')
      .eq('id', user.id)
      .single();

    const roleLevel = (profile?.roles as { level?: number })?.level ?? 0;
    const isAdmin = profile?.is_admin === true || roleLevel >= 80;

    if (!isAdmin) {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 });
    }

    // Fetch all events from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: events, error: eventsError } = await supabase
      .from('behavioral_events')
      .select('*')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      return NextResponse.json({ error: 'Errore nel caricamento dati' }, { status: 500 });
    }

    if (!events || events.length === 0) {
      const emptyStats: BehavioralStats = {
        eventCounts: [],
        funnel: [],
        variantEngagement: [],
        deviceBreakdown: [],
        returnVisitors: [],
        dailyTrend: [],
        exitIntent: [],
        scrollDepth: [],
        summary: {
          totalSessions: 0,
          totalEvents: 0,
          avgEngagement: 0,
          conversionRate: 0,
        },
      };
      return NextResponse.json(emptyStats);
    }

    // 1. Event counts by challenge and type
    const eventCountMap = new Map<string, number>();
    events.forEach(e => {
      const key = `${e.challenge_type}|${e.event_type}`;
      eventCountMap.set(key, (eventCountMap.get(key) || 0) + 1);
    });

    const eventCounts: EventCount[] = Array.from(eventCountMap.entries())
      .map(([key, count]) => {
        const [challenge_type, event_type] = key.split('|');
        return { challenge_type, event_type, count };
      })
      .sort((a, b) => b.count - a.count);

    // 2. Funnel by challenge
    const challenges = ['leadership', 'ostacoli', 'microfelicita'];
    const funnel: FunnelData[] = challenges.map(challenge => {
      const challengeEvents = events.filter(e => e.challenge_type === challenge);
      return {
        challenge_type: challenge,
        views: challengeEvents.filter(e => e.event_type === 'page_view').length,
        scroll_50: challengeEvents.filter(e => e.event_type === 'scroll_50').length,
        engaged: challengeEvents.filter(e => e.event_type === 'engagement_high').length,
        converted: challengeEvents.filter(e => e.event_type === 'exit_intent_converted').length,
      };
    }).filter(f => f.views > 0);

    // 3. Variant engagement
    const variantMap = new Map<string, { scores: number[]; sessions: Set<string> }>();
    events.forEach(e => {
      if (e.variant && e.engagement_score != null) {
        const key = `${e.challenge_type}|${e.variant}`;
        if (!variantMap.has(key)) {
          variantMap.set(key, { scores: [], sessions: new Set() });
        }
        const data = variantMap.get(key)!;
        data.scores.push(e.engagement_score);
        data.sessions.add(e.session_id);
      }
    });

    const variantEngagement: VariantEngagement[] = Array.from(variantMap.entries())
      .map(([key, data]) => {
        const [challenge_type, variant] = key.split('|');
        return {
          challenge_type,
          variant,
          avg_engagement: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length * 10) / 10,
          sessions: data.sessions.size,
        };
      })
      .sort((a, b) => b.avg_engagement - a.avg_engagement);

    // 4. Device breakdown
    const deviceMap = new Map<string, { sessions: Set<string>; scores: number[] }>();
    events.forEach(e => {
      const device = e.device_type || 'unknown';
      if (!deviceMap.has(device)) {
        deviceMap.set(device, { sessions: new Set(), scores: [] });
      }
      const data = deviceMap.get(device)!;
      data.sessions.add(e.session_id);
      if (e.engagement_score != null) {
        data.scores.push(e.engagement_score);
      }
    });

    const deviceBreakdown: DeviceBreakdown[] = Array.from(deviceMap.entries())
      .map(([device_type, data]) => ({
        device_type,
        sessions: data.sessions.size,
        avg_engagement: data.scores.length > 0
          ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length * 10) / 10
          : 0,
      }))
      .sort((a, b) => b.sessions - a.sessions);

    // 5. Return visitors
    const returnVisitorMap = new Map<string, { sessions: Set<string>; conversions: number }>();
    events.forEach(e => {
      const key = `${e.challenge_type}|${e.is_return_visitor ? 'true' : 'false'}`;
      if (!returnVisitorMap.has(key)) {
        returnVisitorMap.set(key, { sessions: new Set(), conversions: 0 });
      }
      const data = returnVisitorMap.get(key)!;
      data.sessions.add(e.session_id);
      if (e.event_type === 'exit_intent_converted') {
        data.conversions++;
      }
    });

    const returnVisitors: ReturnVisitorData[] = Array.from(returnVisitorMap.entries())
      .map(([key, data]) => {
        const [challenge_type, isReturn] = key.split('|');
        return {
          challenge_type,
          is_return_visitor: isReturn === 'true',
          sessions: data.sessions.size,
          conversions: data.conversions,
        };
      });

    // 6. Daily trend
    const dailyMap = new Map<string, { sessions: Set<string>; events: number; conversions: number; scores: number[] }>();
    events.forEach(e => {
      const date = new Date(e.created_at).toISOString().split('T')[0];
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { sessions: new Set(), events: 0, conversions: 0, scores: [] });
      }
      const data = dailyMap.get(date)!;
      data.sessions.add(e.session_id);
      data.events++;
      if (e.event_type === 'exit_intent_converted') {
        data.conversions++;
      }
      if (e.engagement_score != null) {
        data.scores.push(e.engagement_score);
      }
    });

    const dailyTrend: DailyTrend[] = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        sessions: data.sessions.size,
        events: data.events,
        conversions: data.conversions,
        avg_engagement: data.scores.length > 0
          ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length * 10) / 10
          : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 7. Exit intent effectiveness
    const exitIntentMap = new Map<string, { triggered: number; dismissed: number; converted: number }>();
    challenges.forEach(c => exitIntentMap.set(c, { triggered: 0, dismissed: 0, converted: 0 }));

    events.forEach(e => {
      if (!exitIntentMap.has(e.challenge_type)) return;
      const data = exitIntentMap.get(e.challenge_type)!;
      if (e.event_type === 'exit_intent_triggered') data.triggered++;
      if (e.event_type === 'exit_intent_dismissed') data.dismissed++;
      if (e.event_type === 'exit_intent_converted') data.converted++;
    });

    const exitIntent: ExitIntentData[] = Array.from(exitIntentMap.entries())
      .map(([challenge_type, data]) => ({
        challenge_type,
        ...data,
        conversion_rate: data.triggered > 0
          ? Math.round((data.converted / data.triggered) * 1000) / 10
          : 0,
      }))
      .filter(e => e.triggered > 0);

    // 8. Scroll depth
    const scrollDepth: ScrollDepthData[] = challenges.map(challenge => {
      const challengeEvents = events.filter(e => e.challenge_type === challenge);
      return {
        challenge_type: challenge,
        scroll_25: challengeEvents.filter(e => e.event_type === 'scroll_25').length,
        scroll_50: challengeEvents.filter(e => e.event_type === 'scroll_50').length,
        scroll_75: challengeEvents.filter(e => e.event_type === 'scroll_75').length,
        scroll_100: challengeEvents.filter(e => e.event_type === 'scroll_100').length,
      };
    }).filter(s => s.scroll_25 > 0 || s.scroll_50 > 0);

    // Summary
    const uniqueSessions = new Set(events.map(e => e.session_id));
    const engagementScores = events.filter(e => e.engagement_score != null).map(e => e.engagement_score);
    const totalConversions = events.filter(e => e.event_type === 'exit_intent_converted').length;

    const summary = {
      totalSessions: uniqueSessions.size,
      totalEvents: events.length,
      avgEngagement: engagementScores.length > 0
        ? Math.round(engagementScores.reduce((a, b) => a + b, 0) / engagementScores.length * 10) / 10
        : 0,
      conversionRate: uniqueSessions.size > 0
        ? Math.round((totalConversions / uniqueSessions.size) * 1000) / 10
        : 0,
    };

    const stats: BehavioralStats = {
      eventCounts,
      funnel,
      variantEngagement,
      deviceBreakdown,
      returnVisitors,
      dailyTrend,
      exitIntent,
      scrollDepth,
      summary,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in behavioral stats API:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
