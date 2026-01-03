/**
 * useBehavioralTracking - Hook per tracking comportamentale landing pages
 *
 * Traccia: scroll depth, tempo pagina, exit intent, return visitors
 * Calcola engagement score in tempo reale
 * Invia eventi analytics a Supabase
 *
 * @author Vitaeology
 * @version 2.0.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  trackBehavioralEvent,
  type ChallengeType,
  type Variant,
  type EventType,
} from '@/lib/analytics/behavioral';

// ============================================================================
// TYPES
// ============================================================================

export interface BehaviorState {
  scrollDepth: number;           // 0-100 (percentuale corrente)
  maxScrollDepth: number;        // massimo raggiunto nella sessione
  timeOnPage: number;            // secondi
  isExitIntent: boolean;         // true quando mouse esce da viewport top
  exitIntentCount: number;       // quante volte exit intent triggered
  isReturnVisitor: boolean;      // true se localStorage flag presente
  visitCount: number;            // numero visite totali a questa challenge
  engagementScore: number;       // 0-100 calcolato
  scrollMilestones: number[];    // [25, 50, 75, 100] raggiunti
  formInteraction: boolean;      // true se focus su input
}

export interface BehaviorActions {
  trackFormFocus: () => void;    // chiamare su onFocus input
  trackFormBlur: () => void;     // chiamare su onBlur input
  dismissExitIntent: () => void; // resetta isExitIntent a false
  trackConversion: () => void;   // chiamare dopo submit success
  trackExitIntentConverted: () => void; // chiamare dopo conversione da exit intent
}

export type UseBehavioralTrackingReturn = [BehaviorState, BehaviorActions];

// ============================================================================
// CONSTANTS
// ============================================================================

const SCROLL_DEBOUNCE_MS = 100;
const TIME_UPDATE_INTERVAL_MS = 5000;
const EXIT_INTENT_THRESHOLD_Y = 50;
const SCROLL_MILESTONES = [25, 50, 75, 100];
const TIME_MILESTONES = [30, 60, 120];

const STORAGE_PREFIX = 'vt_visited_';
const STORAGE_COUNT_PREFIX = 'vt_visit_count_';
const STORAGE_CONVERTED_PREFIX = 'vt_converted_';

// Pesi per calcolo engagement score
const ENGAGEMENT_WEIGHTS = {
  scrollDepth: 0.25,        // max 25 punti
  timeOnPage: 0.25,         // max 25 punti (cap a 120s)
  formInteraction: 0.20,    // 20 punti se true
  returnVisitor: 0.15,      // 15 punti se true
  milestonesReached: 0.15,  // max 15 punti (3.75 per milestone)
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calcola scroll depth come percentuale 0-100
 */
function calculateScrollDepth(): number {
  if (typeof window === 'undefined') return 0;

  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight;
  const clientHeight = document.documentElement.clientHeight;

  // Evita divisione per zero
  const maxScroll = scrollHeight - clientHeight;
  if (maxScroll <= 0) return 100;

  const depth = (scrollTop / maxScroll) * 100;
  return Math.min(100, Math.max(0, Math.round(depth)));
}

/**
 * Calcola engagement score basato su tutti i fattori
 */
function calculateEngagementScore(state: {
  maxScrollDepth: number;
  timeOnPage: number;
  formInteraction: boolean;
  isReturnVisitor: boolean;
  scrollMilestones: number[];
}): number {
  const { maxScrollDepth, timeOnPage, formInteraction, isReturnVisitor, scrollMilestones } = state;

  // Scroll depth: 0-25 punti
  const scrollScore = (maxScrollDepth / 100) * (ENGAGEMENT_WEIGHTS.scrollDepth * 100);

  // Time on page: 0-25 punti (cap a 120 secondi)
  const cappedTime = Math.min(timeOnPage, 120);
  const timeScore = (cappedTime / 120) * (ENGAGEMENT_WEIGHTS.timeOnPage * 100);

  // Form interaction: 0 o 20 punti
  const formScore = formInteraction ? ENGAGEMENT_WEIGHTS.formInteraction * 100 : 0;

  // Return visitor: 0 o 15 punti
  const returnScore = isReturnVisitor ? ENGAGEMENT_WEIGHTS.returnVisitor * 100 : 0;

  // Milestones: 0-15 punti (3.75 per milestone raggiunto)
  const milestonesScore = (scrollMilestones.length / SCROLL_MILESTONES.length) *
    (ENGAGEMENT_WEIGHTS.milestonesReached * 100);

  const total = scrollScore + timeScore + formScore + returnScore + milestonesScore;
  return Math.min(100, Math.round(total));
}

/**
 * Debounce function senza dipendenze esterne
 */
function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

// ============================================================================
// HOOK
// ============================================================================

export function useBehavioralTracking(
  challengeType: ChallengeType,
  variant?: Variant
): UseBehavioralTrackingReturn {
  // State
  const [state, setState] = useState<BehaviorState>({
    scrollDepth: 0,
    maxScrollDepth: 0,
    timeOnPage: 0,
    isExitIntent: false,
    exitIntentCount: 0,
    isReturnVisitor: false,
    visitCount: 1,
    engagementScore: 0,
    scrollMilestones: [],
    formInteraction: false,
  });

  // Refs per evitare stale closures
  const stateRef = useRef(state);
  stateRef.current = state;

  const milestonesReachedRef = useRef<Set<number>>(new Set());
  const startTimeRef = useRef<number>(Date.now());
  const hasConvertedRef = useRef<boolean>(false);

  // Refs per tracking analytics (evita duplicati)
  const trackedEventsRef = useRef<Set<string>>(new Set());
  const timeMilestonesReachedRef = useRef<Set<number>>(new Set());

  // ============================================================================
  // HELPER: Track event once
  // ============================================================================

  const trackOnce = useCallback((eventType: EventType, extraData?: {
    engagementScore?: number;
    scrollDepth?: number;
    timeOnPage?: number;
  }) => {
    const eventKey = `${challengeType}-${eventType}`;
    if (trackedEventsRef.current.has(eventKey)) return;

    trackedEventsRef.current.add(eventKey);

    trackBehavioralEvent({
      challengeType,
      variant,
      eventType,
      isReturnVisitor: stateRef.current.isReturnVisitor,
      visitCount: stateRef.current.visitCount,
      ...extraData,
    });
  }, [challengeType, variant]);

  // ============================================================================
  // INITIALIZATION (localStorage check + page view tracking)
  // ============================================================================

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storageKey = `${STORAGE_PREFIX}${challengeType}`;
    const countKey = `${STORAGE_COUNT_PREFIX}${challengeType}`;
    const convertedKey = `${STORAGE_CONVERTED_PREFIX}${challengeType}`;

    let isReturnVisitor = false;
    let newCount = 1;

    try {
      // Check return visitor
      const wasVisited = localStorage.getItem(storageKey);
      isReturnVisitor = wasVisited === 'true';

      // Get/update visit count
      const storedCount = localStorage.getItem(countKey);
      const previousCount = storedCount ? parseInt(storedCount, 10) : 0;
      newCount = previousCount + 1;
      localStorage.setItem(countKey, String(newCount));

      // Mark as visited
      localStorage.setItem(storageKey, 'true');

      // Check if already converted
      hasConvertedRef.current = localStorage.getItem(convertedKey) === 'true';

      setState((prev) => ({
        ...prev,
        isReturnVisitor,
        visitCount: newCount,
      }));
    } catch {
      // localStorage non disponibile (es. privacy mode)
      console.warn('[useBehavioralTracking] localStorage non disponibile');
    }

    // Track page view
    trackBehavioralEvent({
      challengeType,
      variant,
      eventType: 'page_view',
      isReturnVisitor,
      visitCount: newCount,
    });
    trackedEventsRef.current.add(`${challengeType}-page_view`);

    // Track return visitor if applicable
    if (isReturnVisitor) {
      trackBehavioralEvent({
        challengeType,
        variant,
        eventType: 'return_visitor_identified',
        isReturnVisitor: true,
        visitCount: newCount,
      });
      trackedEventsRef.current.add(`${challengeType}-return_visitor_identified`);
    }
  }, [challengeType, variant]);

  // ============================================================================
  // SCROLL TRACKING
  // ============================================================================

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = debounce(() => {
      const currentDepth = calculateScrollDepth();

      setState((prev) => {
        const newMaxDepth = Math.max(prev.maxScrollDepth, currentDepth);

        // Check milestones
        const newMilestones = [...prev.scrollMilestones];
        for (const milestone of SCROLL_MILESTONES) {
          if (
            currentDepth >= milestone &&
            !milestonesReachedRef.current.has(milestone)
          ) {
            milestonesReachedRef.current.add(milestone);
            newMilestones.push(milestone);

            // Track scroll milestone
            const eventType = `scroll_${milestone}` as EventType;
            const eventKey = `${challengeType}-${eventType}`;
            if (!trackedEventsRef.current.has(eventKey)) {
              trackedEventsRef.current.add(eventKey);

              const engagementScore = calculateEngagementScore({
                maxScrollDepth: newMaxDepth,
                timeOnPage: prev.timeOnPage,
                formInteraction: prev.formInteraction,
                isReturnVisitor: prev.isReturnVisitor,
                scrollMilestones: newMilestones,
              });

              trackBehavioralEvent({
                challengeType,
                variant,
                eventType,
                engagementScore,
                scrollDepth: milestone,
                timeOnPage: prev.timeOnPage,
                isReturnVisitor: prev.isReturnVisitor,
                visitCount: prev.visitCount,
              });
            }
          }
        }

        // Ricalcola engagement score
        const engagementScore = calculateEngagementScore({
          maxScrollDepth: newMaxDepth,
          timeOnPage: prev.timeOnPage,
          formInteraction: prev.formInteraction,
          isReturnVisitor: prev.isReturnVisitor,
          scrollMilestones: newMilestones,
        });

        // Track engagement thresholds
        if (engagementScore >= 60 && prev.engagementScore < 60) {
          const eventKey = `${challengeType}-engagement_high`;
          if (!trackedEventsRef.current.has(eventKey)) {
            trackedEventsRef.current.add(eventKey);
            trackBehavioralEvent({
              challengeType,
              variant,
              eventType: 'engagement_high',
              engagementScore,
              scrollDepth: newMaxDepth,
              timeOnPage: prev.timeOnPage,
              isReturnVisitor: prev.isReturnVisitor,
              visitCount: prev.visitCount,
            });
          }
        }

        if (engagementScore >= 80 && prev.engagementScore < 80) {
          const eventKey = `${challengeType}-engagement_very_high`;
          if (!trackedEventsRef.current.has(eventKey)) {
            trackedEventsRef.current.add(eventKey);
            trackBehavioralEvent({
              challengeType,
              variant,
              eventType: 'engagement_very_high',
              engagementScore,
              scrollDepth: newMaxDepth,
              timeOnPage: prev.timeOnPage,
              isReturnVisitor: prev.isReturnVisitor,
              visitCount: prev.visitCount,
            });
          }
        }

        return {
          ...prev,
          scrollDepth: currentDepth,
          maxScrollDepth: newMaxDepth,
          scrollMilestones: newMilestones,
          engagementScore,
        };
      });
    }, SCROLL_DEBOUNCE_MS);

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [challengeType, variant]);

  // ============================================================================
  // TIME ON PAGE TRACKING
  // ============================================================================

  useEffect(() => {
    if (typeof window === 'undefined') return;

    startTimeRef.current = Date.now();

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);

      setState((prev) => {
        // Track time milestones
        for (const milestone of TIME_MILESTONES) {
          if (elapsed >= milestone && !timeMilestonesReachedRef.current.has(milestone)) {
            timeMilestonesReachedRef.current.add(milestone);

            const eventType = `time_milestone_${milestone}s` as EventType;
            const eventKey = `${challengeType}-${eventType}`;
            if (!trackedEventsRef.current.has(eventKey)) {
              trackedEventsRef.current.add(eventKey);

              const engagementScore = calculateEngagementScore({
                maxScrollDepth: prev.maxScrollDepth,
                timeOnPage: elapsed,
                formInteraction: prev.formInteraction,
                isReturnVisitor: prev.isReturnVisitor,
                scrollMilestones: prev.scrollMilestones,
              });

              trackBehavioralEvent({
                challengeType,
                variant,
                eventType,
                engagementScore,
                scrollDepth: prev.maxScrollDepth,
                timeOnPage: elapsed,
                isReturnVisitor: prev.isReturnVisitor,
                visitCount: prev.visitCount,
              });
            }
          }
        }

        const engagementScore = calculateEngagementScore({
          maxScrollDepth: prev.maxScrollDepth,
          timeOnPage: elapsed,
          formInteraction: prev.formInteraction,
          isReturnVisitor: prev.isReturnVisitor,
          scrollMilestones: prev.scrollMilestones,
        });

        return {
          ...prev,
          timeOnPage: elapsed,
          engagementScore,
        };
      });
    }, TIME_UPDATE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [challengeType, variant]);

  // ============================================================================
  // EXIT INTENT TRACKING
  // ============================================================================

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Solo desktop (no touch devices)
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Exit intent: mouse esce dalla parte superiore della finestra
      if (e.clientY < EXIT_INTENT_THRESHOLD_Y) {
        setState((prev) => {
          // Non triggerare se già attivo
          if (prev.isExitIntent) return prev;

          // Track exit intent
          const eventKey = `${challengeType}-exit_intent_triggered`;
          if (!trackedEventsRef.current.has(eventKey)) {
            trackedEventsRef.current.add(eventKey);
            trackBehavioralEvent({
              challengeType,
              variant,
              eventType: 'exit_intent_triggered',
              engagementScore: prev.engagementScore,
              scrollDepth: prev.maxScrollDepth,
              timeOnPage: prev.timeOnPage,
              isReturnVisitor: prev.isReturnVisitor,
              visitCount: prev.visitCount,
            });
          }

          return {
            ...prev,
            isExitIntent: true,
            exitIntentCount: prev.exitIntentCount + 1,
          };
        });
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [challengeType, variant]);

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const trackFormFocus = useCallback(() => {
    setState((prev) => {
      if (prev.formInteraction) return prev;

      // Track form focus
      trackOnce('form_focus', {
        engagementScore: prev.engagementScore,
        scrollDepth: prev.maxScrollDepth,
        timeOnPage: prev.timeOnPage,
      });

      const engagementScore = calculateEngagementScore({
        maxScrollDepth: prev.maxScrollDepth,
        timeOnPage: prev.timeOnPage,
        formInteraction: true,
        isReturnVisitor: prev.isReturnVisitor,
        scrollMilestones: prev.scrollMilestones,
      });

      return {
        ...prev,
        formInteraction: true,
        engagementScore,
      };
    });
  }, [trackOnce]);

  const trackFormBlur = useCallback(() => {
    // Per ora non facciamo nulla su blur, ma disponibile per future estensioni
    // Potrebbe tracciare "form abandonment"
  }, []);

  const dismissExitIntent = useCallback(() => {
    // Track exit intent dismissed
    trackOnce('exit_intent_dismissed', {
      engagementScore: stateRef.current.engagementScore,
      scrollDepth: stateRef.current.maxScrollDepth,
      timeOnPage: stateRef.current.timeOnPage,
    });

    setState((prev) => ({
      ...prev,
      isExitIntent: false,
    }));
  }, [trackOnce]);

  const trackConversion = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (hasConvertedRef.current) return;

    const convertedKey = `${STORAGE_CONVERTED_PREFIX}${challengeType}`;

    try {
      localStorage.setItem(convertedKey, 'true');
      hasConvertedRef.current = true;
    } catch {
      // localStorage non disponibile
    }
  }, [challengeType]);

  const trackExitIntentConverted = useCallback(() => {
    trackOnce('exit_intent_converted', {
      engagementScore: stateRef.current.engagementScore,
      scrollDepth: stateRef.current.maxScrollDepth,
      timeOnPage: stateRef.current.timeOnPage,
    });
    trackConversion();
  }, [trackOnce, trackConversion]);

  // ============================================================================
  // RETURN
  // ============================================================================

  const actions: BehaviorActions = {
    trackFormFocus,
    trackFormBlur,
    dismissExitIntent,
    trackConversion,
    trackExitIntentConverted,
  };

  return [state, actions];
}

export default useBehavioralTracking;
