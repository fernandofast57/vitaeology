// src/lib/supabase/exercises.ts
// Funzioni database per sistema 52 esercizi - Conforme MEGA_PROMPT v3.1

import { createClient } from '@/lib/supabase/client';
import type { 
  Exercise, 
  UserExerciseProgress, 
  ExerciseWithProgress,
  ExerciseStatus 
} from '@/lib/types/exercises';

// ===========================================
// FETCH ESERCIZI
// ===========================================

/**
 * Recupera tutti gli esercizi attivi ordinati per settimana
 */
export async function getExercises(): Promise<Exercise[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('week_number', { ascending: true });

  if (error) {
    console.error('Errore fetch esercizi:', error);
    throw new Error('Impossibile caricare gli esercizi');
  }

  return data || [];
}

/**
 * Recupera un singolo esercizio per ID
 */
export async function getExerciseById(exerciseId: string): Promise<Exercise | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', exerciseId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error('Errore fetch esercizio:', error);
    throw new Error('Impossibile caricare l\'esercizio');
  }

  return data;
}

/**
 * Recupera esercizio per numero settimana
 */
export async function getExerciseByWeek(weekNumber: number): Promise<Exercise | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('week_number', weekNumber)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Errore fetch esercizio settimana:', error);
    throw new Error('Impossibile caricare l\'esercizio');
  }

  return data;
}

// ===========================================
// FETCH PROGRESSI UTENTE
// ===========================================

/**
 * Recupera tutti i progressi dell'utente corrente
 */
export async function getUserExerciseProgress(userId: string): Promise<UserExerciseProgress[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_exercise_progress')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Errore fetch progressi:', error);
    throw new Error('Impossibile caricare i progressi');
  }

  return data || [];
}

/**
 * Recupera il progresso per un esercizio specifico
 */
export async function getExerciseProgress(
  userId: string,
  exerciseId: string
): Promise<UserExerciseProgress | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('user_exercise_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Errore fetch progresso:', error);
    return null;
  }

  return data;
}

/**
 * Recupera esercizi con i progressi dell'utente (JOIN)
 */
export async function getExercisesWithProgress(userId: string): Promise<ExerciseWithProgress[]> {
  const supabase = createClient();
  
  // Fetch esercizi
  const { data: exercises, error: exError } = await supabase
    .from('exercises')
    .select('*')
    .eq('is_active', true)
    .order('week_number', { ascending: true });

  if (exError) {
    console.error('Errore fetch esercizi:', exError);
    throw new Error('Impossibile caricare gli esercizi');
  }

  // Fetch progressi utente
  const { data: progress, error: prError } = await supabase
    .from('user_exercise_progress')
    .select('*')
    .eq('user_id', userId);

  if (prError) {
    console.error('Errore fetch progressi:', prError);
    throw new Error('Impossibile caricare i progressi');
  }

  // Combina i dati
  const progressMap = new Map(
    (progress || []).map(p => [p.exercise_id, p])
  );

  return (exercises || []).map(exercise => ({
    ...exercise,
    progress: progressMap.get(exercise.id) || null
  }));
}

// ===========================================
// AGGIORNAMENTO PROGRESSI
// ===========================================

/**
 * Inizia un esercizio (crea record progresso)
 */
export async function startExercise(
  userId: string,
  exerciseId: string
): Promise<UserExerciseProgress> {
  const supabase = createClient();

  // Prima controlla se esiste già un record
  const { data: existing } = await supabase
    .from('user_exercise_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)
    .single();

  if (existing) {
    // Aggiorna il record esistente
    const { data, error } = await supabase
      .from('user_exercise_progress')
      .update({
        status: 'in_progress' as ExerciseStatus,
        started_at: existing.started_at || new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('exercise_id', exerciseId)
      .select()
      .single();

    if (error) {
      console.error('Errore aggiornamento esercizio:', error);
      throw new Error('Impossibile avviare l\'esercizio');
    }
    return data;
  }

  // Crea nuovo record
  const { data, error } = await supabase
    .from('user_exercise_progress')
    .insert({
      user_id: userId,
      exercise_id: exerciseId,
      status: 'in_progress' as ExerciseStatus,
      started_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Errore avvio esercizio:', error);
    throw new Error('Impossibile avviare l\'esercizio');
  }

  return data;
}

/**
 * Salva le note/riflessioni dell'esercizio
 */
export async function saveExerciseNotes(
  userId: string,
  exerciseId: string,
  notes: string,
  reflectionAnswers?: Record<string, string>
): Promise<UserExerciseProgress> {
  const supabase = createClient();

  // Prepara i dati base
  const updateData: Record<string, unknown> = {
    notes,
    status: 'in_progress' as ExerciseStatus
  };

  if (reflectionAnswers) {
    updateData.reflection_answers = reflectionAnswers;
  }

  // Prima controlla se esiste già un record
  const { data: existing } = await supabase
    .from('user_exercise_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from('user_exercise_progress')
      .update(updateData)
      .eq('user_id', userId)
      .eq('exercise_id', exerciseId)
      .select()
      .single();

    if (error) {
      console.error('Errore salvataggio note:', error);
      throw new Error('Impossibile salvare le note');
    }
    return data;
  }

  // Crea nuovo record
  const { data, error } = await supabase
    .from('user_exercise_progress')
    .insert({
      user_id: userId,
      exercise_id: exerciseId,
      ...updateData,
      started_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Errore salvataggio note:', error);
    throw new Error('Impossibile salvare le note');
  }

  return data;
}

/**
 * Completa un esercizio con rating e feedback
 */
export async function completeExercise(
  userId: string,
  exerciseId: string,
  inputData: {
    notes?: string;
    reflection_answers?: Record<string, string>;
    rating_difficulty?: number;
    rating_usefulness?: number;
    feedback?: string;
  }
): Promise<UserExerciseProgress> {
  const supabase = createClient();

  // Prepara i dati
  const updateData: Record<string, unknown> = {
    status: 'completed' as ExerciseStatus,
    completed_at: new Date().toISOString()
  };

  if (inputData.notes !== undefined) updateData.notes = inputData.notes;
  if (inputData.reflection_answers) updateData.reflection_answers = inputData.reflection_answers;
  if (inputData.rating_difficulty) updateData.rating_difficulty = inputData.rating_difficulty;
  if (inputData.rating_usefulness) updateData.rating_usefulness = inputData.rating_usefulness;
  if (inputData.feedback) updateData.feedback = inputData.feedback;

  // Prima controlla se esiste già un record
  const { data: existing } = await supabase
    .from('user_exercise_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)
    .single();

  if (existing) {
    const { data: result, error } = await supabase
      .from('user_exercise_progress')
      .update(updateData)
      .eq('user_id', userId)
      .eq('exercise_id', exerciseId)
      .select()
      .single();

    if (error) {
      console.error('Errore completamento esercizio:', error);
      throw new Error('Impossibile completare l\'esercizio');
    }
    return result;
  }

  // Crea nuovo record
  const { data: result, error } = await supabase
    .from('user_exercise_progress')
    .insert({
      user_id: userId,
      exercise_id: exerciseId,
      started_at: new Date().toISOString(),
      ...updateData
    })
    .select()
    .single();

  if (error) {
    console.error('Errore completamento esercizio:', error);
    throw new Error('Impossibile completare l\'esercizio');
  }

  return result;
}

/**
 * Completa esercizio con ciclo START:CHANGE:STOP
 * Questa funzione integra il completamento con il sistema di cicli di azione
 */
export async function completeExerciseWithCycleIntegration(
  userId: string,
  exerciseId: string,
  inputData: {
    notes?: string;
    reflection_answers?: Record<string, string>;
    rating_difficulty?: number;
    rating_usefulness?: number;
    feedback?: string;
    reflection?: string;
  },
  pathType: 'leadership' | 'ostacoli' | 'microfelicita'
): Promise<{
  progress: UserExerciseProgress;
  cycleResult?: {
    achievementTitle: string;
    nextProposal: string;
    isMacroAchievement: boolean;
  };
}> {
  // 1. Completa esercizio nel sistema esistente
  const progress = await completeExercise(userId, exerciseId, inputData);

  // 2. Recupera info esercizio per il ciclo
  const supabase = createClient();
  const { data: exercise } = await supabase
    .from('exercises')
    .select('title, characteristic_slug, pillar')
    .eq('id', exerciseId)
    .single();

  if (!exercise) {
    return { progress };
  }

  // 3. Prova ad integrare con action cycles (se la tabella esiste)
  try {
    const { completeExerciseWithCycle } = await import('@/lib/action-cycles');
    const { getNextExercise } = await import('@/lib/ai-coach/adaptive-path');

    // Recupera prossimo esercizio
    const nextRec = await getNextExercise(userId, pathType);
    const nextExercise = nextRec ? {
      id: nextRec.exerciseId,
      title: nextRec.exerciseTitle,
      reasoning: nextRec.reasoning,
    } : undefined;

    // Completa ciclo
    const cycleResult = await completeExerciseWithCycle(
      userId,
      exerciseId,
      exercise.title,
      pathType,
      exercise.characteristic_slug || exercise.pillar || 'generale',
      inputData.reflection || inputData.feedback || 'Esercizio completato',
      undefined, // radarDelta - da calcolare se disponibile
      nextExercise
    );

    return {
      progress,
      cycleResult: {
        achievementTitle: cycleResult.achievement.title,
        nextProposal: cycleResult.nextProposal,
        isMacroAchievement: !!cycleResult.macroAchievement,
      },
    };
  } catch (error) {
    // Se il sistema cicli non è disponibile, ritorna solo il progress
    console.warn('Sistema cicli non disponibile:', error);
    return { progress };
  }
}

// ===========================================
// STATISTICHE
// ===========================================

/**
 * Calcola statistiche progressi utente
 */
export async function getExerciseStats(userId: string): Promise<{
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  completionRate: number;
}> {
  const supabase = createClient();
  
  // Conta totale esercizi attivi
  const { count: totalCount } = await supabase
    .from('exercises')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  // Conta progressi per status
  const { data: progress } = await supabase
    .from('user_exercise_progress')
    .select('status')
    .eq('user_id', userId);

  const total = totalCount || 0;
  const completed = (progress || []).filter(p => p.status === 'completed').length;
  const inProgress = (progress || []).filter(p => p.status === 'in_progress').length;
  const notStarted = total - completed - inProgress;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    inProgress,
    notStarted,
    completionRate
  };
}
