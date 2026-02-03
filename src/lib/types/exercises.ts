// src/lib/types/exercises.ts
// Tipi per sistema esercizi Vitaeology - Versione 2.0
// Conforme a CLAUDE.md v2.6 - Framework Verifica Comprensione

// ============================================================
// ENUM E TIPI BASE
// ============================================================

export type ExerciseType =
  | 'riflessione'
  | 'azione'
  | 'sfida'
  | 'analisi'
  | 'feedback'
  | 'pianificazione'
  | 'fondamentale'    // NUOVO: esercizi di comprensione
  | 'facilitazione';  // NUOVO: esercizi mentor

export type DifficultyLevel = 'base' | 'intermedio' | 'avanzato';

export type ExerciseStatus = 'not_started' | 'in_progress' | 'completed';

export type Pillar = 'Vision' | 'Action' | 'Relations' | 'Adaptation';
// Alias italiano per compatibilità
export type PillarIT = 'ESSERE' | 'SENTIRE' | 'PENSARE' | 'AGIRE';

export type BookSlug = 'leadership' | 'risolutore' | 'microfelicita';

// NUOVO: Livello di accesso esercizio
export type ExerciseLevel = 'fondamentale' | 'applicazione' | 'mentor';

// NUOVO: Target audience
export type ExerciseTarget = 'leader' | 'mentor' | 'all';

// NUOVO: Livello di comprensione per reflection prompts
export type ComprensionLevel = 'dati_stabili' | 'doingness' | 'teoria';

// ============================================================
// INTERFACCE PREVENZIONE 3 BARRIERE
// ============================================================

/**
 * Voce del glossario per prevenire "parola mal compresa"
 */
export interface GlossaryEntry {
  term: string;           // Il termine da definire
  definition: string;     // Definizione chiara e semplice
  example: string;        // Esempio concreto dalla vita imprenditoriale
}

/**
 * Esempio concreto per prevenire "mancanza di concretezza"
 */
export interface ConcreteExample {
  situation: string;      // Situazione riconoscibile dall'imprenditore
  application: string;    // Come si applica il concetto
}

// ============================================================
// INTERFACCE 3 LIVELLI COMPRENSIONE
// ============================================================

/**
 * Concetto chiave per DATI STABILI (COSA)
 */
export interface KeyConcept {
  concept: string;        // Il concetto
  definition: string;     // Definizione chiara
  why_important: string;  // Perché è importante
}

/**
 * Fase 1 - Riconoscimento (ESSERE)
 */
export interface Phase1Recognition {
  title: string;          // Es: "Riconoscimento - Chi Eri"
  being_focus: string;    // Identità quando operi così
  prompt: string;         // Domanda principale
  instructions: string[]; // Passi concreti da seguire
}

/**
 * Fase 2 - Pattern (FARE)
 */
export interface Phase2Pattern {
  title: string;          // Es: "Pattern - Cosa Facevi"
  doing_focus: string;    // Comportamento caratteristico
  prompt: string;         // Domanda principale
  guiding_questions: string[]; // Domande guida per l'esplorazione
}

/**
 * Fase 3 - Espansione (AVERE)
 */
export interface Phase3Expansion {
  title: string;          // Es: "Espansione - Come Ricreare"
  having_focus: string;   // Risultato ottenibile
  prompt: string;         // Domanda principale
  action_steps: string[]; // Passi azione concreti
}

/**
 * Spiegazione del PERCHÉ funziona (TEORIA)
 */
export interface WhyItWorks {
  principle: string;          // Il principio sottostante
  explanation: string;        // Spiegazione del perché funziona
  scientific_basis?: string;  // Base scientifica (se applicabile)
}

/**
 * Domanda di riflessione con livello di comprensione
 */
export interface ReflectionPrompt {
  level: ComprensionLevel;    // dati_stabili | doingness | teoria
  question: string;           // La domanda di verifica
}

// ============================================================
// INTERFACCIA ESERCIZIO COMPLETO (CLAUDE.md v2.6)
// ============================================================

/**
 * Esercizio completo conforme al framework di verifica comprensione
 * Include prevenzione 3 barriere + 3 livelli comprensione
 */
export interface ExerciseComplete {
  // === IDENTIFICAZIONE ===
  id: string;
  code?: string;                    // Es: "L-F1", "MT-2", "FP-1"
  week_number?: number;             // 1-52 per esercizi settimanali
  title: string;                    // Titolo evocativo
  subtitle?: string;                // Sottotitolo descrittivo

  // === CATEGORIZZAZIONE ===
  book_slug: BookSlug;              // leadership | risolutore | microfelicita
  characteristic_slug?: string;     // Collegamento a caratteristica (se applicabile)
  dimension_code?: string;          // Codice dimensione assessment (es: FP, FS, RR)
  pillar?: Pillar;                  // Vision | Action | Relations | Adaptation
  pillar_it?: PillarIT;             // ESSERE | SENTIRE | PENSARE | AGIRE
  exercise_type: ExerciseType;
  difficulty_level: DifficultyLevel;
  estimated_time_minutes: number;

  // === NUOVO: LIVELLO E TARGET ===
  level: ExerciseLevel;             // fondamentale | applicazione | mentor
  target: ExerciseTarget;           // leader | mentor | all
  quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';

  // === PREVENZIONE 3 BARRIERE ===
  glossary: GlossaryEntry[];        // BARRIERA 1: Parole mal comprese
  concrete_examples: ConcreteExample[]; // BARRIERA 2: Mancanza concretezza
  prerequisites: string[];          // BARRIERA 3: Gradiente saltato

  // === LIVELLO 1: DATI STABILI (COSA) ===
  key_concepts: KeyConcept[];

  // === LIVELLO 2: DOINGNESS (COME) ===
  intro_validante: string;          // Intro che PRESUME la capacità esistente
  phase_1_recognition: Phase1Recognition;
  phase_2_pattern: Phase2Pattern;
  phase_3_expansion: Phase3Expansion;
  deliverable: string;              // Output tangibile richiesto

  // === LIVELLO 3: TEORIA (PERCHÉ) ===
  why_it_works: WhyItWorks;

  // === VERIFICA COMPRENSIONE ===
  reflection_prompts: ReflectionPrompt[];

  // === SUPPORTO ===
  failure_response: string;         // Risposta validante se non completa
  ai_coach_hints: string[];         // Suggerimenti per AI Coach Fernando

  // === METADATA ===
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ============================================================
// INTERFACCIA ESERCIZIO LEGACY (per retrocompatibilità)
// ============================================================

/**
 * Esercizio nella struttura attuale del database
 * Da migrare gradualmente a ExerciseComplete
 */
export interface Exercise {
  id: string;
  book_slug: string;
  book_id?: number;                 // Legacy: riferimento numerico
  week_number: number;
  title: string;
  subtitle: string | null;
  characteristic_slug: string;
  exercise_type: ExerciseType;
  difficulty_level: DifficultyLevel;
  estimated_time_minutes: number;
  month_name?: string;
  description: string;
  instructions: string;
  deliverable: string;
  reflection_prompts: string[];     // Legacy: array semplice senza livelli
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;

  // Campi opzionali per nuova struttura
  source_type?: string;             // 'dimension' | 'characteristic' | 'general'
  pillar_primary?: string;
  dimension_code?: string;
}

// ============================================================
// INTERFACCE PROGRESSO UTENTE
// ============================================================

export interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface UserExerciseProgress {
  id: string;
  user_id: string;
  exercise_id: string;
  status: ExerciseStatus;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
  reflection_answers: Record<string, string>;
  action_checklist: ActionItem[];
  rating_difficulty: number | null;
  rating_usefulness: number | null;
  feedback: string | null;
  created_at: string;
  updated_at: string;

  // NUOVO: tracking comprensione per livello
  comprehension_verified?: {
    dati_stabili: boolean;
    doingness: boolean;
    teoria: boolean;
  };
}

export interface ExerciseWithProgress extends Exercise {
  progress: UserExerciseProgress | null;
}

export interface ExerciseCompleteWithProgress extends ExerciseComplete {
  progress: UserExerciseProgress | null;
}

// ============================================================
// CONFIGURAZIONE UI
// ============================================================

export const EXERCISE_TYPE_CONFIG: Record<ExerciseType, {
  icon: string;
  label: string;
  color: string;
}> = {
  riflessione: { icon: '🔍', label: 'Riflessione', color: 'bg-blue-100 text-blue-800' },
  azione: { icon: '⚡', label: 'Azione Pratica', color: 'bg-orange-100 text-orange-800' },
  sfida: { icon: '🎯', label: 'Sfida', color: 'bg-purple-100 text-purple-800' },
  analisi: { icon: '📊', label: 'Analisi', color: 'bg-green-100 text-green-800' },
  feedback: { icon: '💬', label: 'Feedback 360°', color: 'bg-pink-100 text-pink-800' },
  pianificazione: { icon: '📋', label: 'Pianificazione', color: 'bg-indigo-100 text-indigo-800' },
  fondamentale: { icon: '📚', label: 'Fondamentale', color: 'bg-amber-100 text-amber-800' },
  facilitazione: { icon: '🤝', label: 'Facilitazione', color: 'bg-teal-100 text-teal-800' }
};

export const DIFFICULTY_CONFIG: Record<DifficultyLevel, {
  label: string;
  color: string;
}> = {
  base: { label: 'Base', color: 'bg-green-100 text-green-800' },
  intermedio: { label: 'Intermedio', color: 'bg-yellow-100 text-yellow-800' },
  avanzato: { label: 'Avanzato', color: 'bg-red-100 text-red-800' }
};

export const STATUS_CONFIG: Record<ExerciseStatus, {
  label: string;
  color: string;
  icon: string;
}> = {
  not_started: { label: 'Da iniziare', color: 'bg-gray-100 text-gray-600', icon: '○' },
  in_progress: { label: 'In corso', color: 'bg-yellow-100 text-yellow-800', icon: '◐' },
  completed: { label: 'Completato', color: 'bg-green-100 text-green-800', icon: '●' }
};

// NUOVO: Configurazione livelli esercizio
export const EXERCISE_LEVEL_CONFIG: Record<ExerciseLevel, {
  label: string;
  description: string;
  color: string;
  icon: string;
}> = {
  fondamentale: {
    label: 'Fondamentale',
    description: 'Comprensione dei concetti base',
    color: 'bg-amber-100 text-amber-800',
    icon: '📚'
  },
  applicazione: {
    label: 'Applicazione',
    description: 'Pratica e applicazione personale',
    color: 'bg-blue-100 text-blue-800',
    icon: '⚡'
  },
  mentor: {
    label: 'Mentor',
    description: 'Facilitazione per consulenti',
    color: 'bg-purple-100 text-purple-800',
    icon: '🤝'
  }
};

// NUOVO: Configurazione target
export const EXERCISE_TARGET_CONFIG: Record<ExerciseTarget, {
  label: string;
  minTier: string;
}> = {
  leader: { label: 'Leader', minTier: 'leader' },
  mentor: { label: 'Mentor', minTier: 'mentor' },
  all: { label: 'Tutti', minTier: 'leader' }
};

// ============================================================
// SISTEMA ACCESSO BASATO SU SUBSCRIPTION
// ============================================================

export type ExercisesAccessLevel = 'basic' | 'advanced' | 'all';

export const DIFFICULTY_ACCESS_MAP: Record<DifficultyLevel, ExercisesAccessLevel> = {
  base: 'basic',
  intermedio: 'advanced',
  avanzato: 'all'
};

// NUOVO: Accesso basato su livello esercizio
export const LEVEL_ACCESS_MAP: Record<ExerciseLevel, string> = {
  fondamentale: 'leader',    // Leader e Mentor
  applicazione: 'leader',    // Leader e Mentor
  mentor: 'mentor'           // Solo Mentor
};

export const ACCESS_TIER_REQUIREMENTS: Record<ExercisesAccessLevel, {
  minTier: string;
  tierDisplayName: string;
}> = {
  basic: { minTier: 'explorer', tierDisplayName: 'Explorer' },
  advanced: { minTier: 'mentor', tierDisplayName: 'Mentor' },
  all: { minTier: 'mastermind', tierDisplayName: 'Mastermind' }
};

/**
 * Verifica se un utente può accedere a un esercizio basato sul suo tier
 */
export function canAccessExercise(
  exerciseDifficulty: DifficultyLevel,
  userAccessLevel: ExercisesAccessLevel
): boolean {
  const requiredAccess = DIFFICULTY_ACCESS_MAP[exerciseDifficulty];
  const accessHierarchy: ExercisesAccessLevel[] = ['basic', 'advanced', 'all'];
  const userLevel = accessHierarchy.indexOf(userAccessLevel);
  const requiredLevel = accessHierarchy.indexOf(requiredAccess);
  return userLevel >= requiredLevel;
}

/**
 * NUOVO: Verifica se un utente può accedere a un esercizio basato sul livello
 */
export function canAccessExerciseByLevel(
  exerciseLevel: ExerciseLevel,
  userTier: 'challenge' | 'leader' | 'mentor'
): boolean {
  const requiredTier = LEVEL_ACCESS_MAP[exerciseLevel];
  const tierHierarchy = ['challenge', 'leader', 'mentor'];
  const userTierIndex = tierHierarchy.indexOf(userTier);
  const requiredTierIndex = tierHierarchy.indexOf(requiredTier);
  return userTierIndex >= requiredTierIndex;
}

/**
 * Ottieni il tier minimo richiesto per accedere a un esercizio
 */
export function getRequiredTierForExercise(exerciseDifficulty: DifficultyLevel): {
  minTier: string;
  tierDisplayName: string;
} {
  const requiredAccess = DIFFICULTY_ACCESS_MAP[exerciseDifficulty];
  return ACCESS_TIER_REQUIREMENTS[requiredAccess];
}

export interface ExerciseWithAccess extends ExerciseWithProgress {
  isLocked: boolean;
  requiredTier?: string;
  requiredTierDisplayName?: string;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Converte un esercizio legacy in formato ExerciseComplete (parziale)
 * Usato per la migrazione graduale
 */
export function legacyToComplete(legacy: Exercise): Partial<ExerciseComplete> {
  return {
    id: legacy.id,
    week_number: legacy.week_number,
    title: legacy.title,
    subtitle: legacy.subtitle || undefined,
    book_slug: legacy.book_slug as BookSlug,
    characteristic_slug: legacy.characteristic_slug,
    exercise_type: legacy.exercise_type,
    difficulty_level: legacy.difficulty_level,
    estimated_time_minutes: legacy.estimated_time_minutes,
    level: 'applicazione',  // Default per esercizi esistenti
    target: 'leader',       // Default per esercizi esistenti
    // I campi complessi vanno popolati manualmente
    glossary: [],
    concrete_examples: [],
    prerequisites: [],
    key_concepts: [],
    intro_validante: legacy.description,
    deliverable: legacy.deliverable,
    reflection_prompts: legacy.reflection_prompts.map(q => ({
      level: 'doingness' as ComprensionLevel,  // Default
      question: q
    })),
    why_it_works: {
      principle: '',
      explanation: ''
    },
    failure_response: '',
    ai_coach_hints: [],
    is_active: legacy.is_active,
    sort_order: legacy.sort_order,
    created_at: legacy.created_at,
    updated_at: legacy.updated_at
  };
}

/**
 * Valida che un esercizio rispetti il framework di comprensione
 * Usato prima della pubblicazione
 */
export function validateExerciseCompleteness(exercise: ExerciseComplete): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // PREVENZIONE BARRIERE
  if (exercise.glossary.length === 0) {
    warnings.push('Glossario vuoto - verificare che non ci siano termini da spiegare');
  }
  if (exercise.concrete_examples.length < 2) {
    errors.push('Servono almeno 2 esempi concreti');
  }

  // LIVELLO 1: DATI STABILI
  if (exercise.key_concepts.length === 0) {
    errors.push('Mancano i concetti chiave (Dati Stabili)');
  }

  // LIVELLO 2: DOINGNESS
  if (!exercise.intro_validante) {
    errors.push('Manca l\'intro validante');
  }
  if (!exercise.phase_1_recognition?.instructions?.length) {
    errors.push('Fase 1 senza istruzioni');
  }
  if (!exercise.phase_2_pattern?.guiding_questions?.length) {
    errors.push('Fase 2 senza domande guida');
  }
  if (!exercise.phase_3_expansion?.action_steps?.length) {
    errors.push('Fase 3 senza passi azione');
  }
  if (!exercise.deliverable) {
    errors.push('Manca il deliverable');
  }

  // LIVELLO 3: TEORIA
  if (!exercise.why_it_works?.principle || !exercise.why_it_works?.explanation) {
    errors.push('Manca la spiegazione del perché funziona (Teoria)');
  }

  // VERIFICA COMPRENSIONE
  const levels = exercise.reflection_prompts.map(r => r.level);
  if (!levels.includes('dati_stabili')) {
    errors.push('Manca domanda di riflessione per Dati Stabili');
  }
  if (!levels.includes('doingness')) {
    errors.push('Manca domanda di riflessione per Doingness');
  }
  if (!levels.includes('teoria')) {
    errors.push('Manca domanda di riflessione per Teoria');
  }

  // SUPPORTO
  if (!exercise.failure_response) {
    warnings.push('Manca la risposta per fallimento');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Conta esercizi per categoria
 */
export function countExercisesByCategory(exercises: Exercise[] | ExerciseComplete[]): {
  byBook: Record<string, number>;
  byLevel: Record<string, number>;
  byDifficulty: Record<string, number>;
  byType: Record<string, number>;
  total: number;
} {
  const byBook: Record<string, number> = {};
  const byLevel: Record<string, number> = {};
  const byDifficulty: Record<string, number> = {};
  const byType: Record<string, number> = {};

  exercises.forEach(ex => {
    // By book
    const book = ex.book_slug || 'unknown';
    byBook[book] = (byBook[book] || 0) + 1;

    // By level (se disponibile)
    const level = (ex as ExerciseComplete).level || 'applicazione';
    byLevel[level] = (byLevel[level] || 0) + 1;

    // By difficulty
    byDifficulty[ex.difficulty_level] = (byDifficulty[ex.difficulty_level] || 0) + 1;

    // By type
    byType[ex.exercise_type] = (byType[ex.exercise_type] || 0) + 1;
  });

  return {
    byBook,
    byLevel,
    byDifficulty,
    byType,
    total: exercises.length
  };
}
