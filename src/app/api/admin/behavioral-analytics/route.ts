import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface BehavioralMetrics {
  overview: {
    totalSessions: number;
    totalEvents: number;
    uniqueVisitors: number;
    returnVisitors: number;
    avgEngagementScore: number;
    avgTimeOnPage: number;
    avgScrollDepth: number;
  };
  byChallenge: {
    challenge_type: string;
    sessions: number;
    events: number;
    avg_engagement: number;
    avg_scroll: number;
    avg_time: number;
    exit_intent_rate: number;
    conversion_rate: number;
  }[];
  byVariant: {
    challenge_type: string;
    variant: string;
    sessions: number;
    avg_engagement: number;
    exit_intent_triggered: number;
    exit_intent_converted: number;
    conversion_rate: number;
  }[];
  eventBreakdown: {
    event_type: string;
    count: number;
    percentage: number;
  }[];
  deviceBreakdown: {
    device_type: string;
    sessions: number;
    percentage: number;
  }[];
  timelineData: {
    date: string;
    sessions: number;
    events: number;
    conversions: number;
  }[];
  topReferrers: {
    referrer: string;
    sessions: number;
    conversions: number;
  }[];
  engagementFunnel: {
    stage: string;
    count: number;
    percentage: number;
  }[];
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

    // Fetch all behavioral events
    const { data: events, error: eventsError } = await supabase
      .from('behavioral_events')
      .select('*')
      .order('created_at', { ascending: false });

    if (eventsError) {
      console.error('Error fetching behavioral events:', eventsError);
      return NextResponse.json({ error: 'Errore nel caricamento dati' }, { status: 500 });
    }

    if (!events || events.length === 0) {
      // Return empty metrics
      const emptyMetrics: BehavioralMetrics = {
        overview: {
          totalSessions: 0,
          totalEvents: 0,
          uniqueVisitors: 0,
          returnVisitors: 0,
          avgEngagementScore: 0,
          avgTimeOnPage: 0,
          avgScrollDepth: 0,
        },
        byChallenge: [],
        byVariant: [],
        eventBreakdown: [],
        deviceBreakdown: [],
        timelineData: [],
        topReferrers: [],
        engagementFunnel: [],
      };
      return NextResponse.json(emptyMetrics);
    }

    // Calculate overview metrics
    const uniqueSessions = new Set(events.map(e => e.session_id));
    const returnVisitorEvents = events.filter(e => e.is_return_visitor);
    const engagementScores = events.filter(e => e.engagement_score != null).map(e => e.engagement_score);
    const timeOnPageValues = events.filter(e => e.time_on_page != null).map(e => e.time_on_page);
    const scrollDepthValues = events.filter(e => e.scroll_depth != null).map(e => e.scroll_depth);

    const overview = {
      totalSessions: uniqueSessions.size,
      totalEvents: events.length,
      uniqueVisitors: uniqueSessions.size,
      returnVisitors: new Set(returnVisitorEvents.map(e => e.session_id)).size,
      avgEngagementScore: engagementScores.length > 0
        ? Math.round(engagementScores.reduce((a, b) => a + b, 0) / engagementScores.length)
        : 0,
      avgTimeOnPage: timeOnPageValues.length > 0
        ? Math.round(timeOnPageValues.reduce((a, b) => a + b, 0) / timeOnPageValues.length)
        : 0,
      avgScrollDepth: scrollDepthValues.length > 0
        ? Math.round(scrollDepthValues.reduce((a, b) => a + b, 0) / scrollDepthValues.length)
        : 0,
    };

    // By challenge aggregation
    const challengeGroups = new Map<string, typeof events>();
    events.forEach(e => {
      const group = challengeGroups.get(e.challenge_type) || [];
      group.push(e);
      challengeGroups.set(e.challenge_type, group);
    });

    const byChallenge = Array.from(challengeGroups.entries()).map(([challenge, evts]) => {
      const sessions = new Set(evts.map(e => e.session_id)).size;
      const engScores = evts.filter(e => e.engagement_score != null).map(e => e.engagement_score);
      const scrolls = evts.filter(e => e.scroll_depth != null).map(e => e.scroll_depth);
      const times = evts.filter(e => e.time_on_page != null).map(e => e.time_on_page);
      const exitIntentTriggered = evts.filter(e => e.event_type === 'exit_intent_triggered').length;
      const exitIntentConverted = evts.filter(e => e.event_type === 'exit_intent_converted').length;

      return {
        challenge_type: challenge,
        sessions,
        events: evts.length,
        avg_engagement: engScores.length > 0
          ? Math.round(engScores.reduce((a, b) => a + b, 0) / engScores.length)
          : 0,
        avg_scroll: scrolls.length > 0
          ? Math.round(scrolls.reduce((a, b) => a + b, 0) / scrolls.length)
          : 0,
        avg_time: times.length > 0
          ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
          : 0,
        exit_intent_rate: sessions > 0
          ? Math.round((exitIntentTriggered / sessions) * 100)
          : 0,
        conversion_rate: exitIntentTriggered > 0
          ? Math.round((exitIntentConverted / exitIntentTriggered) * 100)
          : 0,
      };
    });

    // By variant aggregation
    const variantGroups = new Map<string, typeof events>();
    events.forEach(e => {
      if (e.variant) {
        const key = `${e.challenge_type}|${e.variant}`;
        const group = variantGroups.get(key) || [];
        group.push(e);
        variantGroups.set(key, group);
      }
    });

    const byVariant = Array.from(variantGroups.entries()).map(([key, evts]) => {
      const [challenge_type, variant] = key.split('|');
      const sessions = new Set(evts.map(e => e.session_id)).size;
      const engScores = evts.filter(e => e.engagement_score != null).map(e => e.engagement_score);
      const exitIntentTriggered = evts.filter(e => e.event_type === 'exit_intent_triggered').length;
      const exitIntentConverted = evts.filter(e => e.event_type === 'exit_intent_converted').length;

      return {
        challenge_type,
        variant,
        sessions,
        avg_engagement: engScores.length > 0
          ? Math.round(engScores.reduce((a, b) => a + b, 0) / engScores.length)
          : 0,
        exit_intent_triggered: exitIntentTriggered,
        exit_intent_converted: exitIntentConverted,
        conversion_rate: exitIntentTriggered > 0
          ? Math.round((exitIntentConverted / exitIntentTriggered) * 100)
          : 0,
      };
    });

    // Event breakdown
    const eventCounts = new Map<string, number>();
    events.forEach(e => {
      eventCounts.set(e.event_type, (eventCounts.get(e.event_type) || 0) + 1);
    });

    const eventBreakdown = Array.from(eventCounts.entries())
      .map(([event_type, count]) => ({
        event_type,
        count,
        percentage: Math.round((count / events.length) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    // Device breakdown
    const deviceCounts = new Map<string, Set<string>>();
    events.forEach(e => {
      const device = e.device_type || 'unknown';
      if (!deviceCounts.has(device)) {
        deviceCounts.set(device, new Set());
      }
      deviceCounts.get(device)!.add(e.session_id);
    });

    const totalDeviceSessions = Array.from(deviceCounts.values())
      .reduce((sum, set) => sum + set.size, 0);

    const deviceBreakdown = Array.from(deviceCounts.entries())
      .map(([device_type, sessions]) => ({
        device_type,
        sessions: sessions.size,
        percentage: totalDeviceSessions > 0
          ? Math.round((sessions.size / totalDeviceSessions) * 100)
          : 0,
      }))
      .sort((a, b) => b.sessions - a.sessions);

    // Timeline data (last 7 days)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const timelineMap = new Map<string, { sessions: Set<string>; events: number; conversions: number }>();

    for (let d = new Date(sevenDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      timelineMap.set(dateStr, { sessions: new Set(), events: 0, conversions: 0 });
    }

    events.forEach(e => {
      const dateStr = new Date(e.created_at).toISOString().split('T')[0];
      if (timelineMap.has(dateStr)) {
        const data = timelineMap.get(dateStr)!;
        data.sessions.add(e.session_id);
        data.events++;
        if (e.event_type === 'exit_intent_converted') {
          data.conversions++;
        }
      }
    });

    const timelineData = Array.from(timelineMap.entries())
      .map(([date, data]) => ({
        date,
        sessions: data.sessions.size,
        events: data.events,
        conversions: data.conversions,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top referrers
    const referrerCounts = new Map<string, { sessions: Set<string>; conversions: number }>();
    events.forEach(e => {
      const referrer = e.referrer || 'Direct';
      if (!referrerCounts.has(referrer)) {
        referrerCounts.set(referrer, { sessions: new Set(), conversions: 0 });
      }
      const data = referrerCounts.get(referrer)!;
      data.sessions.add(e.session_id);
      if (e.event_type === 'exit_intent_converted') {
        data.conversions++;
      }
    });

    const topReferrers = Array.from(referrerCounts.entries())
      .map(([referrer, data]) => ({
        referrer: referrer.length > 50 ? referrer.substring(0, 50) + '...' : referrer,
        sessions: data.sessions.size,
        conversions: data.conversions,
      }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 10);

    // Engagement funnel
    const pageViews = events.filter(e => e.event_type === 'page_view').length;
    const scroll50 = events.filter(e => e.event_type === 'scroll_50').length;
    const scroll100 = events.filter(e => e.event_type === 'scroll_100').length;
    const formFocus = events.filter(e => e.event_type === 'form_focus').length;
    const exitIntentConv = events.filter(e => e.event_type === 'exit_intent_converted').length;

    const engagementFunnel = [
      { stage: 'Page View', count: pageViews, percentage: 100 },
      { stage: 'Scroll 50%', count: scroll50, percentage: pageViews > 0 ? Math.round((scroll50 / pageViews) * 100) : 0 },
      { stage: 'Scroll 100%', count: scroll100, percentage: pageViews > 0 ? Math.round((scroll100 / pageViews) * 100) : 0 },
      { stage: 'Form Focus', count: formFocus, percentage: pageViews > 0 ? Math.round((formFocus / pageViews) * 100) : 0 },
      { stage: 'Conversion', count: exitIntentConv, percentage: pageViews > 0 ? Math.round((exitIntentConv / pageViews) * 100) : 0 },
    ];

    const metrics: BehavioralMetrics = {
      overview,
      byChallenge,
      byVariant,
      eventBreakdown,
      deviceBreakdown,
      timelineData,
      topReferrers,
      engagementFunnel,
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error in behavioral analytics API:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
