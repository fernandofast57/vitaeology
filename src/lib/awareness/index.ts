/**
 * Awareness Module - Entry Point
 *
 * Sistema Livelli di Consapevolezza per Vitaeology
 * Scala da -34 (Inesistenza) a +21 (Sorgente)
 */

// Types
export * from './types';

// Calculate
export { calculateAwarenessLevel, quickCalculateLevel, canLevelUp } from './calculate-level';

// Indicators
export { collectIndicators, collectIndicatorsByEmail } from './indicators';

// Update
export {
  updateUserAwarenessLevel,
  updateAwarenessByEmail,
  getCurrentAwarenessLevel,
  getAwarenessHistory,
  bulkRecalculateAwareness,
  // Hooks
  onChallengeDayCompleted,
  onAssessmentCompleted,
  onAIConversation,
  onExerciseCompleted,
  onSubscriptionChanged,
} from './update-level';

export type { TriggerEvent, UpdateResult } from './update-level';
