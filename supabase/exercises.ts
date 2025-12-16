// src/lib/supabase/exercises.ts
import { createClient } from '@/lib/supabase/server';
import type { 
  Exercise, 
  UserExerciseProgress, 
  ExerciseWithProgress,
  ExerciseStatus 
} from '@/lib/types/exercises';

export async function getExercises(): Promise<Exercise[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('is_active', true)
    .order('week_number', { ascending: true });

  if (error) {
    console.error('Errore fetch esercizi:', error);
    return [];
  }

  return data || [];
}

export async function getExerciseById(exerciseId: string): Promise<Exercise | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', exerciseId)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Errore fetch esercizio:', error);
    return null;
  }

  return data;
}

export async function getUserExerciseProgress(userId: string): Promise<UserExerciseProgress[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('user_exercise_progress')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Errore fetch progressi:', error);
    return [];
  }

  return data || [];
}

export async function getExerciseProgress(
  userId: string, 
  exerciseId: string
): Promise<UserExerciseProgress | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('user_exercise_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getExercisesWithProgress(userId: string): Promise<ExerciseWithProgress[]> {
  const supabase = await createClient();
  
  const { data: exercises, error: exError } = await supabase
    .from('exercises')
    .select('*')
    .eq('is_active', true)
    .order('week_number', { ascending: true });

  if (exError) {
    console.error('Errore fetch esercizi:', exError);
    return [];
  }

  const { data: progress, error: prError } = await supabase
    .from('user_exercise_progress')
    .select('*')
    .eq('user_id', userId);

  if (prError) {
    console.error('Errore fetch progressi:', prError);
  }

  const progressMap = new Map(
    (progress || []).map(p => [p.exercise_id, p])
  );

  return (exercises || []).map(exercise => ({
    ...exercise,
    progress: progressMap.get(exercise.id) || null
  }));
}

export async function getExerciseStats(userId: string) {
  const supabase = await createClient();
  
  const { count: totalCount } = await supabase
    .from('exercises')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  const { data: progress } = await supabase
    .from('user_exercise_progress')
    .select('status')
    .eq('user_id', userId);

  const total = totalCount || 0;
  const completed = (progress || []).filter(p => p.status === 'completed').length;
  const inProgress = (progress || []).filter(p => p.status === 'in_progress').length;
  const notStarted = total - completed - inProgress;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, inProgress, notStarted, completionRate };
}

export async function startExercise(userId: string, exerciseId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('user_exercise_progress')
    .upsert({
      user_id: userId,
      exercise_id: exerciseId,
      status: 'in_progress' as ExerciseStatus,
      started_at: new Date().toISOString()
    }, { onConflict: 'user_id,exercise_id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function saveExerciseNotes(
  userId: string,
  exerciseId: string,
  notes: string,
  reflectionAnswers?: Record<string, string>
) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('user_exercise_progress')
    .upsert({
      user_id: userId,
      exercise_id: exerciseId,
      status: 'in_progress' as ExerciseStatus,
      notes,
      reflection_answers: reflectionAnswers || {},
      started_at: new Date().toISOString()
    }, { onConflict: 'user_id,exercise_id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function completeExercise(
  userId: string,
  exerciseId: string,
  data: {
    notes?: string;
    reflection_answers?: Record<string, string>;
    rating_difficulty?: number;
    rating_usefulness?: number;
    feedback?: string;
  }
) {
  const supabase = await createClient();
  
  const { data: result, error } = await supabase
    .from('user_exercise_progress')
    .upsert({
      user_id: userId,
      exercise_id: exerciseId,
      status: 'completed' as ExerciseStatus,
      completed_at: new Date().toISOString(),
      ...data
    }, { onConflict: 'user_id,exercise_id' })
    .select()
    .single();

  if (error) throw error;
  return result;
}