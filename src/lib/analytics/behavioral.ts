/**
 * Behavioral Analytics Client Helper
 *
 * Fornisce funzioni per tracciare eventi comportamentali sulle landing pages.
 * Implementa buffering degli eventi per ottimizzare le chiamate API.
 */

// ============================================================================
// TYPES
// ============================================================================

export type ChallengeType = 'leadership' | 'ostacoli' | 'microfelicita';
export type Variant = 'A' | 'B' | 'C';
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export type EventType =
  | 'page_view'
  | 'scroll_25' | 'scroll_50' | 'scroll_75' | 'scroll_100'
  | 'exit_intent_triggered' | 'exit_intent_dismissed' | 'exit_intent_converted'
  | 'engagement_high' | 'engagement_very_high'
  | 'return_visitor_identified' | 'return_visitor_banner_shown' | 'return_visitor_banner_clicked'
  | 'form_focus' | 'form_abandon'
  | 'badge_shown'
  | 'time_milestone_30s' | 'time_milestone_60s' | 'time_milestone_120s';

export interface BehavioralEventPayload {
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

export interface TrackEventParams {
  challengeType: ChallengeType;
  variant?: Variant;
  eventType: EventType;
  engagementScore?: number;
  scrollDepth?: number;
  timeOnPage?: number;
  isReturnVisitor?: boolean;
  visitCount?: number;
}

// ============================================================================
// SESSION ID
// ============================================================================

const SESSION_ID_KEY = 'vt_session_id';

/**
 * Genera o recupera session ID univoco per la sessione browser
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  try {
    let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      sessionStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    return sessionId;
  } catch {
    // sessionStorage non disponibile
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}

// ============================================================================
// DEVICE DETECTION
// ============================================================================

/**
 * Rileva tipo device basato su viewport width
 */
export function getDeviceType(): DeviceType {
  if (typeof window === 'undefined') return 'desktop';

  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

// ============================================================================
// UTM PARAMS
// ============================================================================

interface UtmParams {
  source?: string;
  medium?: string;
  campaign?: string;
}

/**
 * Estrai UTM params dalla URL corrente
 */
export function getUtmParams(): UtmParams {
  if (typeof window === 'undefined') return {};

  try {
    const params = new URLSearchParams(window.location.search);
    return {
      source: params.get('utm_source') || undefined,
      medium: params.get('utm_medium') || undefined,
      campaign: params.get('utm_campaign') || undefined,
    };
  } catch {
    return {};
  }
}

/**
 * Ottieni referrer
 */
export function getReferrer(): string | undefined {
  if (typeof window === 'undefined') return undefined;

  try {
    return document.referrer || undefined;
  } catch {
    return undefined;
  }
}

// ============================================================================
// EVENT BUFFER
// ============================================================================

let eventBuffer: BehavioralEventPayload[] = [];
let flushTimeout: ReturnType<typeof setTimeout> | null = null;

const BUFFER_SIZE_LIMIT = 10;
const FLUSH_DELAY_MS = 2000;

/**
 * Invia eventi bufferizzati al server
 */
async function flushEvents(): Promise<void> {
  // Clear timeout
  if (flushTimeout) {
    clearTimeout(flushTimeout);
    flushTimeout = null;
  }

  // Nothing to send
  if (eventBuffer.length === 0) return;

  // Take events and clear buffer
  const eventsToSend = [...eventBuffer];
  eventBuffer = [];

  try {
    // Use sendBeacon for reliability on page unload, fetch otherwise
    const payload = JSON.stringify({ events: eventsToSend });

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      // Try sendBeacon first (more reliable on unload)
      const sent = navigator.sendBeacon(
        '/api/analytics/behavioral',
        new Blob([payload], { type: 'application/json' })
      );

      if (!sent) {
        // Fallback to fetch if sendBeacon fails
        await fetch('/api/analytics/behavioral', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        });
      }
    } else {
      // Fallback for environments without sendBeacon
      await fetch('/api/analytics/behavioral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      });
    }
  } catch (error) {
    // Silent fail - non bloccare UX per analytics
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Behavioral Analytics] Flush error:', error);
    }
  }
}

/**
 * Schedula flush degli eventi
 */
function scheduleFlush(): void {
  if (flushTimeout) return;

  flushTimeout = setTimeout(() => {
    flushTimeout = null;
    flushEvents();
  }, FLUSH_DELAY_MS);
}

// ============================================================================
// MAIN TRACKING FUNCTION
// ============================================================================

/**
 * Traccia un evento comportamentale
 *
 * @param params - Parametri dell'evento (senza sessionId e deviceType che vengono aggiunti automaticamente)
 */
export function trackBehavioralEvent(params: TrackEventParams): void {
  // Skip in SSR
  if (typeof window === 'undefined') return;

  // Skip in development mode (opzionale - rimuovi per debug)
  // if (process.env.NODE_ENV === 'development') {
  //   console.log('[Behavioral Analytics]', params.eventType, params);
  //   return;
  // }

  const utmParams = getUtmParams();

  const fullEvent: BehavioralEventPayload = {
    sessionId: getSessionId(),
    challengeType: params.challengeType,
    variant: params.variant,
    eventType: params.eventType,
    engagementScore: params.engagementScore,
    scrollDepth: params.scrollDepth,
    timeOnPage: params.timeOnPage,
    isReturnVisitor: params.isReturnVisitor,
    visitCount: params.visitCount,
    deviceType: getDeviceType(),
    referrer: getReferrer(),
    utmSource: utmParams.source,
    utmMedium: utmParams.medium,
    utmCampaign: utmParams.campaign,
  };

  // Add to buffer
  eventBuffer.push(fullEvent);

  // Flush immediately if buffer is full
  if (eventBuffer.length >= BUFFER_SIZE_LIMIT) {
    flushEvents();
  } else {
    scheduleFlush();
  }
}

// ============================================================================
// PAGE LIFECYCLE HANDLERS
// ============================================================================

/**
 * Setup event listeners for page unload
 * Chiamare una volta all'inizializzazione dell'app
 */
export function initBehavioralTracking(): void {
  if (typeof window === 'undefined') return;

  // Flush on page hide (more reliable than beforeunload)
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      flushEvents();
    }
  };

  // Flush on beforeunload as backup
  const handleBeforeUnload = () => {
    flushEvents();
  };

  // Flush on pagehide (iOS Safari)
  const handlePageHide = () => {
    flushEvents();
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('beforeunload', handleBeforeUnload);
  window.addEventListener('pagehide', handlePageHide);
}

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
  // Defer initialization to not block page load
  if (document.readyState === 'complete') {
    initBehavioralTracking();
  } else {
    window.addEventListener('load', initBehavioralTracking);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

const behavioralAnalytics = {
  trackBehavioralEvent,
  getSessionId,
  getDeviceType,
  getUtmParams,
  initBehavioralTracking,
};

export default behavioralAnalytics;
