/**
 * Feature Gating Configuration
 *
 * Definisce quali features sono disponibili per ogni subscription tier.
 */

import { SubscriptionTier } from '@/lib/types/roles';

// ============================================================================
// FEATURE DEFINITIONS
// ============================================================================

export type FeatureName =
  // AI Coach
  | 'ai_coach_basic'
  | 'ai_coach_unlimited'
  | 'ai_coach_export'
  // Exercises
  | 'exercises_basic'
  | 'exercises_advanced'
  | 'exercises_all'
  // Assessment
  | 'assessment_lite'
  | 'assessment_full'
  // Content
  | 'content_free'
  | 'content_premium'
  | 'content_exclusive'
  // Support
  | 'support_community'
  | 'support_email'
  | 'support_priority'
  | 'support_direct'
  // Analytics
  | 'analytics_basic'
  | 'analytics_advanced';

// ============================================================================
// TIER FEATURE MAP
// ============================================================================

export const TIER_FEATURES: Record<SubscriptionTier, FeatureName[]> = {
  explorer: [
    'ai_coach_basic',
    'exercises_basic',
    'assessment_lite',
    'content_free',
    'support_community',
    'analytics_basic',
  ],
  leader: [
    'ai_coach_basic',
    'exercises_basic',
    'exercises_advanced',
    'assessment_lite',
    'assessment_full',
    'content_free',
    'content_premium',
    'support_community',
    'support_email',
    'analytics_basic',
  ],
  mentor: [
    'ai_coach_basic',
    'ai_coach_unlimited',
    'exercises_basic',
    'exercises_advanced',
    'exercises_all',
    'assessment_lite',
    'assessment_full',
    'content_free',
    'content_premium',
    'support_community',
    'support_email',
    'support_priority',
    'analytics_basic',
    'analytics_advanced',
  ],
  mastermind: [
    'ai_coach_basic',
    'ai_coach_unlimited',
    'ai_coach_export',
    'exercises_basic',
    'exercises_advanced',
    'exercises_all',
    'assessment_lite',
    'assessment_full',
    'content_free',
    'content_premium',
    'content_exclusive',
    'support_community',
    'support_email',
    'support_priority',
    'support_direct',
    'analytics_basic',
    'analytics_advanced',
  ],
  partner_elite: [
    'ai_coach_basic',
    'ai_coach_unlimited',
    'ai_coach_export',
    'exercises_basic',
    'exercises_advanced',
    'exercises_all',
    'assessment_lite',
    'assessment_full',
    'content_free',
    'content_premium',
    'content_exclusive',
    'support_community',
    'support_email',
    'support_priority',
    'support_direct',
    'analytics_basic',
    'analytics_advanced',
  ],
};

// ============================================================================
// FEATURE METADATA
// ============================================================================

export interface FeatureMetadata {
  name: FeatureName;
  displayName: string;
  description: string;
  minTier: SubscriptionTier;
  category: 'ai_coach' | 'exercises' | 'assessment' | 'content' | 'support' | 'analytics';
}

export const FEATURE_METADATA: Record<FeatureName, FeatureMetadata> = {
  // AI Coach
  ai_coach_basic: {
    name: 'ai_coach_basic',
    displayName: 'AI Coach Base',
    description: 'Accesso limitato all\'AI Coach (5 messaggi/giorno)',
    minTier: 'explorer',
    category: 'ai_coach',
  },
  ai_coach_unlimited: {
    name: 'ai_coach_unlimited',
    displayName: 'AI Coach Illimitato',
    description: 'Messaggi illimitati con l\'AI Coach',
    minTier: 'mentor',
    category: 'ai_coach',
  },
  ai_coach_export: {
    name: 'ai_coach_export',
    displayName: 'Export Conversazioni',
    description: 'Esporta le conversazioni in PDF',
    minTier: 'mastermind',
    category: 'ai_coach',
  },

  // Exercises
  exercises_basic: {
    name: 'exercises_basic',
    displayName: 'Esercizi Base',
    description: 'Accesso ai primi 10 esercizi',
    minTier: 'explorer',
    category: 'exercises',
  },
  exercises_advanced: {
    name: 'exercises_advanced',
    displayName: 'Esercizi Avanzati',
    description: 'Accesso a 30 esercizi',
    minTier: 'leader',
    category: 'exercises',
  },
  exercises_all: {
    name: 'exercises_all',
    displayName: 'Tutti gli Esercizi',
    description: 'Accesso completo a 52 esercizi',
    minTier: 'mentor',
    category: 'exercises',
  },

  // Assessment
  assessment_lite: {
    name: 'assessment_lite',
    displayName: 'Assessment Lite',
    description: 'Assessment rapido a 72 domande',
    minTier: 'explorer',
    category: 'assessment',
  },
  assessment_full: {
    name: 'assessment_full',
    displayName: 'Assessment Completo',
    description: 'Assessment completo a 240 domande',
    minTier: 'leader',
    category: 'assessment',
  },

  // Content
  content_free: {
    name: 'content_free',
    displayName: 'Contenuti Gratuiti',
    description: 'Articoli e guide base',
    minTier: 'explorer',
    category: 'content',
  },
  content_premium: {
    name: 'content_premium',
    displayName: 'Contenuti Premium',
    description: 'Video corsi e masterclass',
    minTier: 'leader',
    category: 'content',
  },
  content_exclusive: {
    name: 'content_exclusive',
    displayName: 'Contenuti Esclusivi',
    description: 'Sessioni live e Q&A',
    minTier: 'mastermind',
    category: 'content',
  },

  // Support
  support_community: {
    name: 'support_community',
    displayName: 'Community',
    description: 'Accesso alla community',
    minTier: 'explorer',
    category: 'support',
  },
  support_email: {
    name: 'support_email',
    displayName: 'Supporto Email',
    description: 'Supporto via email (48h)',
    minTier: 'leader',
    category: 'support',
  },
  support_priority: {
    name: 'support_priority',
    displayName: 'Supporto Prioritario',
    description: 'Risposta entro 24h',
    minTier: 'mentor',
    category: 'support',
  },
  support_direct: {
    name: 'support_direct',
    displayName: 'Accesso Diretto',
    description: 'Chiamate 1:1 con Fernando',
    minTier: 'mastermind',
    category: 'support',
  },

  // Analytics
  analytics_basic: {
    name: 'analytics_basic',
    displayName: 'Analytics Base',
    description: 'Visualizza i tuoi progressi',
    minTier: 'explorer',
    category: 'analytics',
  },
  analytics_advanced: {
    name: 'analytics_advanced',
    displayName: 'Analytics Avanzate',
    description: 'Report dettagliati e trend',
    minTier: 'mentor',
    category: 'analytics',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Verifica se un tier ha accesso a una feature
 */
export function tierHasFeature(tier: SubscriptionTier, feature: FeatureName): boolean {
  return TIER_FEATURES[tier].includes(feature);
}

/**
 * Ottiene tutte le features per un tier
 */
export function getFeaturesForTier(tier: SubscriptionTier): FeatureName[] {
  return TIER_FEATURES[tier];
}

/**
 * Ottiene il tier minimo richiesto per una feature
 */
export function getMinTierForFeature(feature: FeatureName): SubscriptionTier {
  return FEATURE_METADATA[feature].minTier;
}

/**
 * Ottiene le features mancanti rispetto a un tier superiore
 */
export function getMissingFeatures(
  currentTier: SubscriptionTier,
  targetTier: SubscriptionTier
): FeatureName[] {
  const currentFeatures = TIER_FEATURES[currentTier];
  const targetFeatures = TIER_FEATURES[targetTier];

  return targetFeatures.filter(f => !currentFeatures.includes(f));
}

/**
 * Ottiene metadata per upgrade suggestion
 */
export function getUpgradeSuggestion(
  currentTier: SubscriptionTier,
  feature: FeatureName
): { suggestedTier: SubscriptionTier; missingFeatures: FeatureName[] } | null {
  if (tierHasFeature(currentTier, feature)) {
    return null; // Already has access
  }

  const minTier = getMinTierForFeature(feature);
  const missingFeatures = getMissingFeatures(currentTier, minTier);

  return {
    suggestedTier: minTier,
    missingFeatures,
  };
}

// ============================================================================
// USAGE LIMITS
// ============================================================================

export interface UsageLimits {
  aiCoachMessagesPerDay: number | 'unlimited';
  exercisesCount: number;
  assessmentType: 'lite' | 'full';
}

export function getUsageLimits(tier: SubscriptionTier): UsageLimits {
  switch (tier) {
    case 'explorer':
      return {
        aiCoachMessagesPerDay: 5,
        exercisesCount: 10,
        assessmentType: 'lite',
      };
    case 'leader':
      return {
        aiCoachMessagesPerDay: 20,
        exercisesCount: 30,
        assessmentType: 'full',
      };
    case 'mentor':
      return {
        aiCoachMessagesPerDay: 50,
        exercisesCount: 52,
        assessmentType: 'full',
      };
    case 'mastermind':
    case 'partner_elite':
      return {
        aiCoachMessagesPerDay: 'unlimited',
        exercisesCount: 52,
        assessmentType: 'full',
      };
    default:
      return {
        aiCoachMessagesPerDay: 5,
        exercisesCount: 10,
        assessmentType: 'lite',
      };
  }
}
