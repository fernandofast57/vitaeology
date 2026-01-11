// src/lib/types/exercises.ts
// Tipi per sistema 52 esercizi - Conforme MEGA_PROMPT v3.1

export type ExerciseType = 
  | 'riflessione' 
  | 'azione' 
  | 'sfida' 
  | 'analisi' 
  | 'feedback' 
  | 'pianificazione';

export type DifficultyLevel = 'base' | 'intermedio' | 'avanzato';

export type ExerciseStatus = 'not_started' | 'in_progress' | 'completed';

export interface Exercise {
  id: string;
  book_slug: string;
  week_number: number;
  title: string;
  subtitle: string | null;
  characteristic_slug: string;
  exercise_type: ExerciseType;
  difficulty_level: DifficultyLevel;
  estimated_time_minutes: number;
  month_name: string;
  description: string;
  instructions: string;
  deliverable: string;
  reflection_prompts: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
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
}

export interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ExerciseWithProgress extends Exercise {
  progress: UserExerciseProgress | null;
}

// Configurazione UI per tipi esercizio
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
  pianificazione: { icon: '📋', label: 'Pianificazione', color: 'bg-indigo-100 text-indigo-800' }
};

// Configurazione UI per difficoltà
export const DIFFICULTY_CONFIG: Record<DifficultyLevel, {
  label: string;
  color: string;
}> = {
  base: { label: 'Base', color: 'bg-green-100 text-green-800' },
  intermedio: { label: 'Intermedio', color: 'bg-yellow-100 text-yellow-800' },
  avanzato: { label: 'Avanzato', color: 'bg-red-100 text-red-800' }
};

// Configurazione UI per status
export const STATUS_CONFIG: Record<ExerciseStatus, {
  label: string;
  color: string;
  icon: string;
}> = {
  not_started: { label: 'Da iniziare', color: 'bg-gray-100 text-gray-600', icon: '○' },
  in_progress: { label: 'In corso', color: 'bg-yellow-100 text-yellow-800', icon: '◐' },
  completed: { label: 'Completato', color: 'bg-green-100 text-green-800', icon: '●' }
};

// ============================================================
// ACCESSO ESERCIZI BASATO SU SUBSCRIPTION TIER
// ============================================================

export type ExercisesAccessLevel = 'basic' | 'advanced' | 'all';

/**
 * Mappa difficoltà esercizio -> livello accesso richiesto
 * - base: accessibile a tutti (explorer+)
 * - intermedio: richiede mentor+ (advanced access)
 * - avanzato: richiede mastermind+ (all access)
 */
export const DIFFICULTY_ACCESS_MAP: Record<DifficultyLevel, ExercisesAccessLevel> = {
  base: 'basic',
  intermedio: 'advanced',
  avanzato: 'all'
};

/**
 * Tier minimo richiesto per ogni livello di accesso
 */
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

  // Gerarchia accesso: basic < advanced < all
  const accessHierarchy: ExercisesAccessLevel[] = ['basic', 'advanced', 'all'];
  const userLevel = accessHierarchy.indexOf(userAccessLevel);
  const requiredLevel = accessHierarchy.indexOf(requiredAccess);

  return userLevel >= requiredLevel;
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
