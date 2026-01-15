/**
 * Raccolta Indicatori per Awareness Level
 *
 * Recupera tutti i dati necessari dal database
 * per calcolare il livello di consapevolezza di un utente
 */

import { createClient } from '@supabase/supabase-js';
import { AwarenessIndicators } from './types';

// =====================================================
// SUPABASE CLIENT
// =====================================================

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// =====================================================
// COLLECT ALL INDICATORS
// =====================================================

export async function collectIndicators(userId: string): Promise<AwarenessIndicators> {
  const supabase = getSupabase();

  // Esegui tutte le query in parallelo
  const [
    challengeData,
    assessmentData,
    aiCoachData,
    exerciseData,
    engagementData,
    profileData,
  ] = await Promise.all([
    getChallengeIndicators(supabase, userId),
    getAssessmentIndicators(supabase, userId),
    getAICoachIndicators(supabase, userId),
    getExerciseIndicators(supabase, userId),
    getEngagementIndicators(supabase, userId),
    getProfileIndicators(supabase, userId),
  ]);

  return {
    // Challenge
    challengeStatus: challengeData.status,
    challengeDay: challengeData.currentDay,
    challengeCompletionRate: challengeData.completionRate,

    // Assessment
    assessmentCompleted: assessmentData.completed,
    assessmentScore: assessmentData.score,

    // AI Coach
    totalConversations: aiCoachData.totalConversations,
    avgRating: aiCoachData.avgRating,
    lastConversationDaysAgo: aiCoachData.lastConversationDaysAgo,

    // Exercises
    exercisesCompleted: exerciseData.completed,
    exercisesTotal: exerciseData.total,
    exerciseDifficultyMax: exerciseData.maxDifficulty,

    // Engagement
    daysActive: engagementData.daysActive,
    returnRate: engagementData.returnRate,
    subscriptionTier: profileData.subscriptionTier,
  };
}

// =====================================================
// CHALLENGE INDICATORS
// =====================================================

interface ChallengeIndicators {
  status: 'none' | 'active' | 'completed';
  currentDay: number;
  completionRate: number;
}

async function getChallengeIndicators(
  supabase: ReturnType<typeof getSupabase>,
  userId: string
): Promise<ChallengeIndicators> {
  // Prima otteniamo l'email dell'utente
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single();

  if (!profile?.email) {
    return { status: 'none', currentDay: 0, completionRate: 0 };
  }

  // Cerca la challenge più recente per questa email
  const { data: challenge } = await supabase
    .from('challenge_subscribers')
    .select('status, current_day, started_at, completed_at')
    .eq('email', profile.email)
    .order('started_at', { ascending: false })
    .limit(1)
    .single();

  if (!challenge) {
    return { status: 'none', currentDay: 0, completionRate: 0 };
  }

  // Conta i giorni completati
  const { count: completedDays } = await supabase
    .from('challenge_day_completions')
    .select('*', { count: 'exact', head: true })
    .eq('email', profile.email);

  const completionRate = (completedDays || 0) / 7;

  return {
    status: challenge.status as 'none' | 'active' | 'completed',
    currentDay: challenge.current_day || 0,
    completionRate,
  };
}

// =====================================================
// ASSESSMENT INDICATORS
// =====================================================

interface AssessmentIndicators {
  completed: boolean;
  score: number;
}

async function getAssessmentIndicators(
  supabase: ReturnType<typeof getSupabase>,
  userId: string
): Promise<AssessmentIndicators> {
  const { data: assessment } = await supabase
    .from('user_assessments')
    .select('status, overall_score')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .single();

  if (!assessment) {
    return { completed: false, score: 0 };
  }

  // Se non c'è overall_score, calcolalo dalla media delle caratteristiche
  if (!assessment.overall_score) {
    const { data: scores } = await supabase
      .from('characteristic_scores')
      .select('score')
      .eq('user_id', userId);

    if (scores && scores.length > 0) {
      const avgScore = scores.reduce((acc, s) => acc + (s.score || 0), 0) / scores.length;
      return { completed: true, score: avgScore };
    }
  }

  return {
    completed: true,
    score: assessment.overall_score || 0,
  };
}

// =====================================================
// AI COACH INDICATORS
// =====================================================

interface AICoachIndicators {
  totalConversations: number;
  avgRating: number | null;
  lastConversationDaysAgo: number;
}

async function getAICoachIndicators(
  supabase: ReturnType<typeof getSupabase>,
  userId: string
): Promise<AICoachIndicators> {
  // Conta conversazioni totali
  const { count: conversationCount } = await supabase
    .from('ai_coach_conversations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // Media rating
  const { data: ratings } = await supabase
    .from('ai_coach_messages')
    .select('rating')
    .eq('user_id', userId)
    .not('rating', 'is', null);

  let avgRating: number | null = null;
  if (ratings && ratings.length > 0) {
    const validRatings = ratings.filter((r) => r.rating !== null);
    if (validRatings.length > 0) {
      avgRating = validRatings.reduce((acc, r) => acc + (r.rating || 0), 0) / validRatings.length;
    }
  }

  // Ultima conversazione
  const { data: lastConversation } = await supabase
    .from('ai_coach_conversations')
    .select('updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  let lastConversationDaysAgo = 999;
  if (lastConversation?.updated_at) {
    const lastDate = new Date(lastConversation.updated_at);
    const now = new Date();
    lastConversationDaysAgo = Math.floor(
      (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  return {
    totalConversations: conversationCount || 0,
    avgRating,
    lastConversationDaysAgo,
  };
}

// =====================================================
// EXERCISE INDICATORS
// =====================================================

interface ExerciseIndicators {
  completed: number;
  total: number;
  maxDifficulty: 'none' | 'base' | 'intermedio' | 'avanzato';
}

async function getExerciseIndicators(
  supabase: ReturnType<typeof getSupabase>,
  userId: string
): Promise<ExerciseIndicators> {
  // Conta esercizi completati
  const { data: completedExercises, count } = await supabase
    .from('user_exercise_progress')
    .select('exercise_id, exercises(difficulty)', { count: 'exact' })
    .eq('user_id', userId)
    .eq('status', 'completed');

  // Conta esercizi totali disponibili
  const { count: totalCount } = await supabase
    .from('exercises')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  // Determina difficoltà massima completata
  let maxDifficulty: 'none' | 'base' | 'intermedio' | 'avanzato' = 'none';
  if (completedExercises && completedExercises.length > 0) {
    const difficulties = completedExercises
      .map((e) => {
        // Type assertion per gestire il join
        const exercise = e.exercises as unknown as { difficulty: string } | null;
        return exercise?.difficulty;
      })
      .filter(Boolean);

    if (difficulties.includes('avanzato')) {
      maxDifficulty = 'avanzato';
    } else if (difficulties.includes('intermedio')) {
      maxDifficulty = 'intermedio';
    } else if (difficulties.includes('base')) {
      maxDifficulty = 'base';
    }
  }

  return {
    completed: count || 0,
    total: totalCount || 52,
    maxDifficulty,
  };
}

// =====================================================
// ENGAGEMENT INDICATORS
// =====================================================

interface EngagementIndicators {
  daysActive: number;
  returnRate: number;
}

async function getEngagementIndicators(
  supabase: ReturnType<typeof getSupabase>,
  userId: string
): Promise<EngagementIndicators> {
  // Conta giorni unici con attività negli ultimi 30 giorni
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Prova a usare behavioral_events se esiste
  const { data: events } = await supabase
    .from('behavioral_events')
    .select('created_at')
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo.toISOString());

  // Calcola giorni unici
  const uniqueDays = new Set<string>();
  if (events) {
    events.forEach((e) => {
      if (e.created_at) {
        uniqueDays.add(new Date(e.created_at).toISOString().split('T')[0]);
      }
    });
  }

  // Se non ci sono behavioral_events, usa altre fonti
  if (uniqueDays.size === 0) {
    // Controlla conversazioni AI
    const { data: conversations } = await supabase
      .from('ai_coach_conversations')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (conversations) {
      conversations.forEach((c) => {
        if (c.created_at) {
          uniqueDays.add(new Date(c.created_at).toISOString().split('T')[0]);
        }
      });
    }

    // Controlla esercizi
    const { data: exercises } = await supabase
      .from('user_exercise_progress')
      .select('started_at, completed_at')
      .eq('user_id', userId)
      .or(`started_at.gte.${thirtyDaysAgo.toISOString()},completed_at.gte.${thirtyDaysAgo.toISOString()}`);

    if (exercises) {
      exercises.forEach((ex) => {
        if (ex.started_at) {
          uniqueDays.add(new Date(ex.started_at).toISOString().split('T')[0]);
        }
        if (ex.completed_at) {
          uniqueDays.add(new Date(ex.completed_at).toISOString().split('T')[0]);
        }
      });
    }
  }

  const daysActive = uniqueDays.size;
  const returnRate = daysActive / 30; // Percentuale su 30 giorni

  return {
    daysActive,
    returnRate,
  };
}

// =====================================================
// PROFILE INDICATORS
// =====================================================

interface ProfileIndicators {
  subscriptionTier: 'explorer' | 'leader' | 'mentor' | 'mastermind' | 'partner_elite';
}

async function getProfileIndicators(
  supabase: ReturnType<typeof getSupabase>,
  userId: string
): Promise<ProfileIndicators> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single();

  const tier = (profile?.subscription_tier || 'explorer') as ProfileIndicators['subscriptionTier'];

  return {
    subscriptionTier: tier,
  };
}

// =====================================================
// COLLECT BY EMAIL (for Challenge users without auth)
// =====================================================

export async function collectIndicatorsByEmail(email: string): Promise<AwarenessIndicators | null> {
  const supabase = getSupabase();

  // Prima cerca se c'è un utente con questa email
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (profile) {
    return collectIndicators(profile.id);
  }

  // Se non c'è un profilo, raccogli solo dati challenge
  const { data: challenge } = await supabase
    .from('challenge_subscribers')
    .select('status, current_day')
    .eq('email', email)
    .order('started_at', { ascending: false })
    .limit(1)
    .single();

  if (!challenge) {
    return null;
  }

  const { count: completedDays } = await supabase
    .from('challenge_day_completions')
    .select('*', { count: 'exact', head: true })
    .eq('email', email);

  // Ritorna indicatori minimali per utente non autenticato (Challenge only)
  // Entry point: -7 Rovina
  return {
    challengeStatus: challenge.status as 'none' | 'active' | 'completed',
    challengeDay: challenge.current_day || 0,
    challengeCompletionRate: (completedDays || 0) / 7,
    assessmentCompleted: false,
    assessmentScore: 0,
    totalConversations: 0,
    avgRating: null,
    lastConversationDaysAgo: 999,
    exercisesCompleted: 0,
    exercisesTotal: 52,
    exerciseDifficultyMax: 'none',
    daysActive: 0,
    returnRate: 0,
    subscriptionTier: 'explorer',
  };
}
