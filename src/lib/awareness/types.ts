/**
 * Sistema Livelli di Consapevolezza
 *
 * Scala completa da -34 (Inesistenza) a +21 (Sorgente)
 * Per analytics e segmentazione contenuti - INVISIBILE all'utente
 *
 * Entry Point Vitaeology: -7 (Rovina)
 * La persona sente una "rovina" nella sua efficacia (P1 viability/quality/quantity)
 * e cerca soluzione nella Challenge gratuita.
 *
 * Obiettivo Challenge: Portare da -7 a -1 (Aiuto)
 * "3 Passi in Libertà": I 3 libri per salire da -1 in su
 */

// =====================================================
// SCALA COMPLETA DI CONSAPEVOLEZZA
// =====================================================

export const AWARENESS_SCALE = {
  // Sotto Necessità di Cambiare (-34 a -5)
  '-34': 'Inesistenza',
  '-33': 'Disconnessione',
  '-32': 'Non causatività',
  '-31': 'Criminalità',
  '-30': 'Dissociazione',
  '-29': 'Dispersione',
  '-28': 'Erosione',
  '-27': 'Fissità',
  '-26': 'Glee',
  '-25': 'Esaltazione',
  '-24': 'Masochismo',
  '-23': 'Sadismo',
  '-22': 'Allucinazione',
  '-21': 'Segretezza',
  '-20': 'Dualità',
  '-19': 'Distacco',
  '-18': 'Oblio',
  '-17': 'Catatonia',
  '-16': 'Shock',
  '-15': 'Isteria',
  '-14': 'Illusione Ingannevole',
  '-13': 'Irrealtà',
  '-12': 'Disastro',
  '-11': 'Introversione',
  '-10': 'Intontimento',
  '-9': 'Sofferenza',
  '-8': 'Disperazione',
  '-7': 'Rovina', // ENTRY POINT VITAEOLOGY - Percezione di rovina nella propria efficacia
  '-6': 'Effetto',
  '-5': 'Paura di Peggiorare',

  // Transizione (-4 a -1)
  '-4': 'Necessità di Cambiare',
  '-3': 'Richiesta',
  '-2': 'Speranza',
  '-1': 'Aiuto', // POST-CHALLENGE TARGET

  // Percorso Vitaeology (1 a 21)
  '1': 'Riconoscimento',
  '2': 'Comunicazione',
  '3': 'Percezione',
  '4': 'Orientamento',
  '5': 'Comprensioni',
  '6': 'Illuminazione',
  '7': 'Energia',
  '8': 'Aggiustamento',
  '9': 'Corpo',
  '10': 'Predizione',
  '11': 'Attività',
  '12': 'Produzione',
  '13': 'Risultato',
  '14': 'Correzione',
  '15': 'Capacità',
  '16': 'Scopi',
  '17': 'Clearing',
  '18': 'Realizzazione',
  '19': 'Condizioni',
  '20': 'Esistenza',
  '21': 'Sorgente', // LIBERTÀ TOTALE
} as const;

export type AwarenessLevel = keyof typeof AWARENESS_SCALE;
export type AwarenessLevelNumber = -34 | -33 | -32 | -31 | -30 | -29 | -28 | -27 | -26 | -25 |
  -24 | -23 | -22 | -21 | -20 | -19 | -18 | -17 | -16 | -15 | -14 | -13 | -12 | -11 | -10 |
  -9 | -8 | -7 | -6 | -5 | -4 | -3 | -2 | -1 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
  11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21;

// =====================================================
// ZONE DI CONSAPEVOLEZZA
// =====================================================

export type AwarenessZone =
  | 'sotto_necessita'  // -34 a -5: Non target, troppo disconnessi
  | 'transizione'      // -4 a -1: Zona Challenge
  | 'riconoscimento'   // 1 a 6: Assessment + primi esercizi
  | 'trasformazione'   // 7 a 14: Esercizi avanzati
  | 'padronanza';      // 15 a 21: Mentor/Mastermind

export const AWARENESS_ZONES: Record<AwarenessZone, {
  name: string;
  minLevel: number;
  maxLevel: number;
  description: string;
  vitaeologyPhase: string;
}> = {
  sotto_necessita: {
    name: 'Sotto Necessità',
    minLevel: -34,
    maxLevel: -7,
    description: 'Entry Point: Rovina percepita nella propria efficacia (P1)',
    vitaeologyPhase: 'Entry Point (ADS/Challenge)',
  },
  transizione: {
    name: 'Transizione',
    minLevel: -6,
    maxLevel: -1,
    description: 'Zona Challenge - Da rovina ad aiuto',
    vitaeologyPhase: 'Challenge 7 Giorni',
  },
  riconoscimento: {
    name: 'Riconoscimento',
    minLevel: 1,
    maxLevel: 6,
    description: 'Riconoscimento di sé, comunicazione, percezione',
    vitaeologyPhase: 'Assessment + Primi Esercizi',
  },
  trasformazione: {
    name: 'Trasformazione',
    minLevel: 7,
    maxLevel: 14,
    description: 'Energia, aggiustamento, produzione',
    vitaeologyPhase: 'Esercizi Avanzati',
  },
  padronanza: {
    name: 'Padronanza',
    minLevel: 15,
    maxLevel: 21,
    description: 'Capacità, scopi, esistenza, sorgente',
    vitaeologyPhase: 'Mentor/Mastermind',
  },
};

// =====================================================
// FUNNEL MAPPING (Fase Utente → Livello)
// =====================================================

export interface FunnelLevelMapping {
  phase: string;
  minLevel: number;
  targetLevel: number;
  triggerEvents: string[];
}

export const FUNNEL_LEVEL_MAPPING: FunnelLevelMapping[] = [
  {
    phase: 'Lead (ADS click)',
    minLevel: -5,
    targetLevel: -4,
    triggerEvents: ['ad_click', 'landing_view'],
  },
  {
    phase: 'Challenge Day 1-3',
    minLevel: -4,
    targetLevel: -2,
    triggerEvents: ['challenge_day_1', 'challenge_day_2', 'challenge_day_3'],
  },
  {
    phase: 'Challenge Day 4-7',
    minLevel: -2,
    targetLevel: -1,
    triggerEvents: ['challenge_day_4', 'challenge_day_5', 'challenge_day_6', 'challenge_day_7'],
  },
  {
    phase: 'Challenge Completata',
    minLevel: -1,
    targetLevel: 1,
    triggerEvents: ['challenge_completed'],
  },
  {
    phase: 'Assessment Completato',
    minLevel: 1,
    targetLevel: 2,
    triggerEvents: ['assessment_completed'],
  },
  {
    phase: 'Primo AI Coach',
    minLevel: 2,
    targetLevel: 3,
    triggerEvents: ['first_ai_conversation'],
  },
  {
    phase: 'Esercizi Base',
    minLevel: 3,
    targetLevel: 6,
    triggerEvents: ['exercise_completed_base'],
  },
  {
    phase: 'Esercizi Intermedi',
    minLevel: 6,
    targetLevel: 10,
    triggerEvents: ['exercise_completed_intermediate'],
  },
  {
    phase: 'Esercizi Avanzati',
    minLevel: 10,
    targetLevel: 15,
    triggerEvents: ['exercise_completed_advanced'],
  },
  {
    phase: 'Mentor/Mastermind',
    minLevel: 15,
    targetLevel: 21,
    triggerEvents: ['subscription_mentor', 'subscription_mastermind'],
  },
];

// =====================================================
// INDICATORI PER CALCOLO LIVELLO
// =====================================================

export interface AwarenessIndicators {
  // Dati Challenge
  challengeStatus: 'none' | 'active' | 'completed';
  challengeDay: number; // 0-7
  challengeCompletionRate: number; // % giorni completati

  // Dati Assessment
  assessmentCompleted: boolean;
  assessmentScore: number; // media 24 caratteristiche (0-100)

  // Dati AI Coach
  totalConversations: number;
  avgRating: number | null; // media feedback 1-5
  lastConversationDaysAgo: number;

  // Dati Esercizi
  exercisesCompleted: number;
  exercisesTotal: number;
  exerciseDifficultyMax: 'none' | 'base' | 'intermedio' | 'avanzato';

  // Engagement
  daysActive: number;
  returnRate: number; // % giorni con attività su ultimi 30
  subscriptionTier: 'explorer' | 'leader' | 'mentor' | 'mastermind' | 'partner_elite';
}

// =====================================================
// RISULTATO CALCOLO AWARENESS
// =====================================================

export interface AwarenessResult {
  level: number;
  levelName: string;
  score: number; // 0-100 nel livello corrente
  zone: AwarenessZone;
  zoneName: string;
  reasoning: string;
  nextLevelHint?: string; // cosa fare per salire
  calculatedAt: Date;
}

// =====================================================
// STORICO AWARENESS
// =====================================================

export interface AwarenessHistoryEntry {
  id: string;
  userId: string;
  level: number;
  score: number;
  indicators: AwarenessIndicators;
  triggerEvent: string;
  calculatedAt: Date;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export function getLevelName(level: number): string {
  const key = level.toString() as AwarenessLevel;
  return AWARENESS_SCALE[key] || 'Unknown';
}

export function getZoneForLevel(level: number): AwarenessZone {
  if (level <= -7) return 'sotto_necessita';
  if (level <= -1) return 'transizione';
  if (level <= 6) return 'riconoscimento';
  if (level <= 14) return 'trasformazione';
  return 'padronanza';
}

export function getZoneInfo(zone: AwarenessZone) {
  return AWARENESS_ZONES[zone];
}

export function isValidLevel(level: number): boolean {
  // Nota: non esiste livello 0 nella scala
  return (level >= -34 && level <= -1) || (level >= 1 && level <= 21);
}

/**
 * Calcola il prossimo livello valido
 * (salta lo 0 che non esiste nella scala)
 */
export function getNextLevel(currentLevel: number): number {
  if (currentLevel === -1) return 1; // Salta lo 0
  if (currentLevel >= 21) return 21; // Max level
  return currentLevel + 1;
}

/**
 * Calcola il livello precedente valido
 * (salta lo 0 che non esiste nella scala)
 */
export function getPreviousLevel(currentLevel: number): number {
  if (currentLevel === 1) return -1; // Salta lo 0
  if (currentLevel <= -34) return -34; // Min level
  return currentLevel - 1;
}

// =====================================================
// CONSTANTS
// =====================================================

export const AWARENESS_CONSTANTS = {
  MIN_LEVEL: -34,
  MAX_LEVEL: 21,
  ENTRY_POINT: -7,              // Livello entry utenti via ADS/Challenge (Rovina)
  CHALLENGE_TARGET: -1,         // Obiettivo post-Challenge (Aiuto)
  ASSESSMENT_LEVEL: 1,          // Livello dopo Assessment (Riconoscimento)
  DEFAULT_LEVEL: -7,            // Default per nuovi utenti (Rovina)
  LEVEL_ZERO_EXISTS: false,     // Non esiste livello 0
} as const;
