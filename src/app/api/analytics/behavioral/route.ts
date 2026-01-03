/**
 * API Route: POST /api/analytics/behavioral
 *
 * Riceve batch di eventi comportamentali dalle landing pages challenge
 * e li salva in Supabase per analytics.
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ============================================================================
// TYPES
// ============================================================================

const VALID_CHALLENGE_TYPES = ['leadership', 'ostacoli', 'microfelicita'] as const;
const VALID_VARIANTS = ['A', 'B', 'C'] as const;
const VALID_DEVICE_TYPES = ['mobile', 'tablet', 'desktop'] as const;
const VALID_EVENT_TYPES = [
  'page_view',
  'scroll_25', 'scroll_50', 'scroll_75', 'scroll_100',
  'exit_intent_triggered', 'exit_intent_dismissed', 'exit_intent_converted',
  'engagement_high', 'engagement_very_high',
  'return_visitor_identified', 'return_visitor_banner_shown', 'return_visitor_banner_clicked',
  'form_focus', 'form_abandon',
  'badge_shown',
  'time_milestone_30s', 'time_milestone_60s', 'time_milestone_120s',
] as const;

type ChallengeType = typeof VALID_CHALLENGE_TYPES[number];
type Variant = typeof VALID_VARIANTS[number];
type DeviceType = typeof VALID_DEVICE_TYPES[number];
type EventType = typeof VALID_EVENT_TYPES[number];

interface BehavioralEventPayload {
  sessionId: string;
  challengeType: ChallengeType;
  variant?: Variant;
  eventType: EventType;
  engagementScore?: number;
  scrollDepth?: number;
  timeOnPage?: number;
  isReturnVisitor?: boolean;
  visitCount?: number;
  deviceType?: DeviceType;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

interface BatchPayload {
  events: BehavioralEventPayload[];
}

// ============================================================================
// VALIDATION
// ============================================================================

function isValidChallengeType(value: unknown): value is ChallengeType {
  return typeof value === 'string' && VALID_CHALLENGE_TYPES.includes(value as ChallengeType);
}

function isValidVariant(value: unknown): value is Variant {
  return value === undefined || (typeof value === 'string' && VALID_VARIANTS.includes(value as Variant));
}

function isValidDeviceType(value: unknown): value is DeviceType {
  return value === undefined || (typeof value === 'string' && VALID_DEVICE_TYPES.includes(value as DeviceType));
}

function isValidEventType(value: unknown): value is EventType {
  return typeof value === 'string' && VALID_EVENT_TYPES.includes(value as EventType);
}

function isValidSessionId(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 64;
}

function isValidScore(value: unknown): boolean {
  return value === undefined || (typeof value === 'number' && value >= 0 && value <= 100);
}

function isValidTimeOnPage(value: unknown): boolean {
  return value === undefined || (typeof value === 'number' && value >= 0);
}

function validateEvent(event: unknown): BehavioralEventPayload | null {
  if (!event || typeof event !== 'object') return null;

  const e = event as Record<string, unknown>;

  // Required fields
  if (!isValidSessionId(e.sessionId)) return null;
  if (!isValidChallengeType(e.challengeType)) return null;
  if (!isValidEventType(e.eventType)) return null;

  // Optional fields with validation
  if (!isValidVariant(e.variant)) return null;
  if (!isValidDeviceType(e.deviceType)) return null;
  if (!isValidScore(e.engagementScore)) return null;
  if (!isValidScore(e.scrollDepth)) return null;
  if (!isValidTimeOnPage(e.timeOnPage)) return null;

  return {
    sessionId: e.sessionId as string,
    challengeType: e.challengeType as ChallengeType,
    eventType: e.eventType as EventType,
    variant: e.variant as Variant | undefined,
    engagementScore: e.engagementScore as number | undefined,
    scrollDepth: e.scrollDepth as number | undefined,
    timeOnPage: e.timeOnPage as number | undefined,
    isReturnVisitor: typeof e.isReturnVisitor === 'boolean' ? e.isReturnVisitor : undefined,
    visitCount: typeof e.visitCount === 'number' ? e.visitCount : undefined,
    deviceType: e.deviceType as DeviceType | undefined,
    referrer: typeof e.referrer === 'string' ? e.referrer.slice(0, 500) : undefined,
    utmSource: typeof e.utmSource === 'string' ? e.utmSource.slice(0, 100) : undefined,
    utmMedium: typeof e.utmMedium === 'string' ? e.utmMedium.slice(0, 100) : undefined,
    utmCampaign: typeof e.utmCampaign === 'string' ? e.utmCampaign.slice(0, 100) : undefined,
  };
}

// ============================================================================
// SUPABASE CLIENT
// ============================================================================

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ============================================================================
// API HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Parse body
    const body: BatchPayload = await request.json();

    // Validate batch
    if (!body.events || !Array.isArray(body.events)) {
      return NextResponse.json({ success: false, count: 0 });
    }

    // Limit batch size
    const eventsToProcess = body.events.slice(0, 20);

    // Validate and transform events
    const validEvents: BehavioralEventPayload[] = [];
    for (const event of eventsToProcess) {
      const validated = validateEvent(event);
      if (validated) {
        validEvents.push(validated);
      }
    }

    if (validEvents.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    // Transform to DB format
    const dbRecords = validEvents.map((event) => ({
      session_id: event.sessionId,
      challenge_type: event.challengeType,
      variant: event.variant || null,
      event_type: event.eventType,
      engagement_score: event.engagementScore ?? null,
      scroll_depth: event.scrollDepth ?? null,
      time_on_page: event.timeOnPage ?? null,
      is_return_visitor: event.isReturnVisitor ?? false,
      visit_count: event.visitCount ?? 1,
      device_type: event.deviceType || null,
      referrer: event.referrer || null,
      utm_source: event.utmSource || null,
      utm_medium: event.utmMedium || null,
      utm_campaign: event.utmCampaign || null,
    }));

    // Insert into Supabase
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('behavioral_events')
      .insert(dbRecords);

    if (error) {
      // Log error but don't block UX
      console.error('Behavioral events insert error:', error.message);
      // Still return success to not block client
      return NextResponse.json({ success: true, count: 0 });
    }

    return NextResponse.json({
      success: true,
      count: validEvents.length,
    });
  } catch (error) {
    // Log error but always return 200 to not block UX
    console.error('Behavioral tracking error:', error);
    return NextResponse.json({ success: false, count: 0 });
  }
}
