/**
 * Milestone Types - Definizioni TypeScript per il sistema milestone
 */

export type PathType = 'leadership' | 'ostacoli' | 'microfelicita' | 'global';

export type MilestoneCategory = 'assessment' | 'exercises' | 'time' | 'mastery' | 'special';

export interface MilestoneDefinition {
  code: string;
  pathType: PathType;
  category: MilestoneCategory;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  displayOrder: number;
}

export interface UserMilestone {
  id: string;
  userId: string;
  milestoneType: string;
  pathType: PathType;
  milestoneData: Record<string, unknown>;
  achievedAt: string;
  notified: boolean;
  createdAt: string;
}

export interface MilestoneWithDefinition extends UserMilestone {
  definition?: MilestoneDefinition;
}

export interface MilestoneCheckResult {
  earned: boolean;
  milestoneCode: string;
  pathType: PathType;
  data?: Record<string, unknown>;
}

export interface MilestoneAwardResult {
  success: boolean;
  milestoneId?: string;
  alreadyExists?: boolean;
  milestone?: MilestoneWithDefinition;
}

// ============================================================================
// MILESTONE CODES
// ============================================================================

export const GLOBAL_MILESTONES = {
  WELCOME: 'welcome',
  PROFILE_COMPLETE: 'profile_complete',
  FIRST_CHAT: 'first_chat',
} as const;

export const LEADERSHIP_MILESTONES = {
  // Assessment
  FIRST_ASSESSMENT: 'first_assessment_leadership',
  ALL_PILLARS_ABOVE_50: 'all_pillars_above_50',
  ALL_PILLARS_ABOVE_70: 'all_pillars_above_70',

  // Exercises
  EXERCISES_1: 'exercises_1_leadership',
  EXERCISES_5: 'exercises_5_leadership',
  EXERCISES_10: 'exercises_10_leadership',
  EXERCISES_25: 'exercises_25_leadership',
  EXERCISES_52: 'exercises_52_leadership',

  // Time
  WEEK_1: 'week_1_leadership',
  MONTH_1: 'month_1_leadership',
  MONTH_3: 'month_3_leadership',
  MONTH_6: 'month_6_leadership',

  // Mastery
  MASTERY_MOTIVAZIONE: 'mastery_motivazione',
  MASTERY_CORAGGIO: 'mastery_coraggio',
  MASTERY_EMPATIA: 'mastery_empatia',
  MASTERY_CREATIVITA: 'mastery_creativita',
} as const;

export const OSTACOLI_MILESTONES = {
  // Assessment
  FIRST_ASSESSMENT: 'first_assessment_ostacoli',
  LEVEL_3: 'level_3_risolutore',
  LEVEL_5: 'level_5_risolutore',

  // Exercises
  EXERCISES_1: 'exercises_1_ostacoli',
  EXERCISES_5: 'exercises_5_ostacoli',
  EXERCISES_10: 'exercises_10_ostacoli',
  EXERCISES_24: 'exercises_24_ostacoli',

  // Filters
  FILTER_DATI: 'filter_dati',
  FILTER_SEGNALI: 'filter_segnali',
  FILTER_RISORSE: 'filter_risorse',

  // Traitors
  TRAITOR_FRETTA: 'traitor_fretta',
  TRAITOR_ABITUDINE: 'traitor_abitudine',
  TRAITOR_EGO: 'traitor_ego',
} as const;

export const MICROFELICITA_MILESTONES = {
  // Assessment
  FIRST_ASSESSMENT: 'first_assessment_microfelicita',
  PRATICANTE_ESPERTO: 'praticante_esperto',
  PRATICANTE_MAESTRO: 'praticante_maestro',

  // Exercises
  EXERCISES_1: 'exercises_1_microfelicita',
  EXERCISES_5: 'exercises_5_microfelicita',
  EXERCISES_10: 'exercises_10_microfelicita',
  EXERCISES_24: 'exercises_24_microfelicita',

  // R.A.D.A.R. phases
  RADAR_RICONOSCIMENTO: 'radar_riconoscimento',
  RADAR_AMPLIFICAZIONE: 'radar_amplificazione',
  RADAR_DOCUMENTAZIONE: 'radar_documentazione',
  RADAR_ANCORA: 'radar_ancora',
  RADAR_RIPETIZIONE: 'radar_ripetizione',

  // Saboteurs
  SABOTEUR_MINIMIZZAZIONE: 'saboteur_minimizzazione',
  SABOTEUR_AUTOINTERRUZIONE: 'saboteur_autointerruzione',
  SABOTEUR_CAMBIO_FUOCO: 'saboteur_cambio_fuoco',
  SABOTEUR_ANTICIPO: 'saboteur_anticipo',
  SABOTEUR_CORREZIONE: 'saboteur_correzione',
} as const;

// Exercise count thresholds per path
export const EXERCISE_THRESHOLDS: Record<PathType, number[]> = {
  leadership: [1, 5, 10, 25, 52],
  ostacoli: [1, 5, 10, 24],
  microfelicita: [1, 5, 10, 24],
  global: [],
};

// Mappa threshold → milestone code
export const EXERCISE_MILESTONE_MAP: Record<PathType, Record<number, string>> = {
  leadership: {
    1: LEADERSHIP_MILESTONES.EXERCISES_1,
    5: LEADERSHIP_MILESTONES.EXERCISES_5,
    10: LEADERSHIP_MILESTONES.EXERCISES_10,
    25: LEADERSHIP_MILESTONES.EXERCISES_25,
    52: LEADERSHIP_MILESTONES.EXERCISES_52,
  },
  ostacoli: {
    1: OSTACOLI_MILESTONES.EXERCISES_1,
    5: OSTACOLI_MILESTONES.EXERCISES_5,
    10: OSTACOLI_MILESTONES.EXERCISES_10,
    24: OSTACOLI_MILESTONES.EXERCISES_24,
  },
  microfelicita: {
    1: MICROFELICITA_MILESTONES.EXERCISES_1,
    5: MICROFELICITA_MILESTONES.EXERCISES_5,
    10: MICROFELICITA_MILESTONES.EXERCISES_10,
    24: MICROFELICITA_MILESTONES.EXERCISES_24,
  },
  global: {},
};
