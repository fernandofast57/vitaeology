/**
 * Milestone Service - Logica per verificare e assegnare milestone
 */

import { createClient } from '@supabase/supabase-js';
import {
  PathType,
  MilestoneCheckResult,
  MilestoneAwardResult,
  MilestoneWithDefinition,
  EXERCISE_THRESHOLDS,
  EXERCISE_MILESTONE_MAP,
  LEADERSHIP_MILESTONES,
  OSTACOLI_MILESTONES,
  MICROFELICITA_MILESTONES,
} from './types';

// ============================================================================
// SUPABASE CLIENT
// ============================================================================

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Verifica se un utente ha già una milestone
 */
export async function hasMilestone(
  userId: string,
  milestoneCode: string,
  pathType: PathType = 'global'
): Promise<boolean> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('user_milestones')
    .select('id')
    .eq('user_id', userId)
    .eq('milestone_type', milestoneCode)
    .eq('path_type', pathType)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Errore verifica milestone:', error);
  }

  return !!data;
}

/**
 * Assegna una milestone a un utente (idempotente)
 */
export async function awardMilestone(
  userId: string,
  milestoneCode: string,
  pathType: PathType = 'global',
  milestoneData: Record<string, unknown> = {}
): Promise<MilestoneAwardResult> {
  const supabase = getSupabaseClient();

  // Verifica se già esiste
  const exists = await hasMilestone(userId, milestoneCode, pathType);
  if (exists) {
    return { success: true, alreadyExists: true };
  }

  // Inserisci nuova milestone
  const { data, error } = await supabase
    .from('user_milestones')
    .insert({
      user_id: userId,
      milestone_type: milestoneCode,
      path_type: pathType,
      milestone_data: milestoneData,
    })
    .select()
    .single();

  if (error) {
    // Potrebbe essere un race condition, verifica di nuovo
    if (error.code === '23505') {
      return { success: true, alreadyExists: true };
    }
    console.error('Errore assegnazione milestone:', error);
    return { success: false };
  }

  // Recupera definizione
  const { data: definition } = await supabase
    .from('milestone_definitions')
    .select('*')
    .eq('code', milestoneCode)
    .single();

  return {
    success: true,
    milestoneId: data.id,
    milestone: {
      id: data.id,
      userId: data.user_id,
      milestoneType: data.milestone_type,
      pathType: data.path_type,
      milestoneData: data.milestone_data,
      achievedAt: data.achieved_at,
      notified: data.notified,
      createdAt: data.created_at,
      definition: definition ? {
        code: definition.code,
        pathType: definition.path_type,
        category: definition.category,
        name: definition.name,
        description: definition.description,
        icon: definition.icon,
        xpReward: definition.xp_reward,
        displayOrder: definition.display_order,
      } : undefined,
    },
  };
}

/**
 * Ottiene milestone non notificate per un utente
 */
export async function getUnnotifiedMilestones(
  userId: string
): Promise<MilestoneWithDefinition[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('user_milestones')
    .select(`
      *,
      milestone_definitions!milestone_type (
        code,
        path_type,
        category,
        name,
        description,
        icon,
        xp_reward,
        display_order
      )
    `)
    .eq('user_id', userId)
    .eq('notified', false)
    .order('achieved_at', { ascending: false });

  if (error) {
    console.error('Errore recupero milestone non notificate:', error);
    return [];
  }

  return (data || []).map((m: any) => ({
    id: m.id,
    userId: m.user_id,
    milestoneType: m.milestone_type,
    pathType: m.path_type,
    milestoneData: m.milestone_data,
    achievedAt: m.achieved_at,
    notified: m.notified,
    createdAt: m.created_at,
    definition: m.milestone_definitions ? {
      code: m.milestone_definitions.code,
      pathType: m.milestone_definitions.path_type,
      category: m.milestone_definitions.category,
      name: m.milestone_definitions.name,
      description: m.milestone_definitions.description,
      icon: m.milestone_definitions.icon,
      xpReward: m.milestone_definitions.xp_reward,
      displayOrder: m.milestone_definitions.display_order,
    } : undefined,
  }));
}

/**
 * Marca una milestone come notificata
 */
export async function markMilestoneNotified(milestoneId: string): Promise<void> {
  const supabase = getSupabaseClient();

  await supabase
    .from('user_milestones')
    .update({ notified: true })
    .eq('id', milestoneId);
}

/**
 * Ottiene XP totali utente
 */
export async function getUserTotalXP(userId: string): Promise<number> {
  const supabase = getSupabaseClient();

  // Recupera milestone utente
  const { data: userMilestones, error: umError } = await supabase
    .from('user_milestones')
    .select('milestone_type')
    .eq('user_id', userId);

  if (umError || !userMilestones || userMilestones.length === 0) {
    return 0;
  }

  // Recupera XP dalle definizioni
  const milestoneCodes = userMilestones.map(m => m.milestone_type);
  const { data: definitions, error: defError } = await supabase
    .from('milestone_definitions')
    .select('code, xp_reward')
    .in('code', milestoneCodes);

  if (defError) {
    console.error('Errore calcolo XP:', defError);
    return 0;
  }

  return (definitions || []).reduce((total: number, d: any) => {
    return total + (d.xp_reward || 0);
  }, 0);
}

/**
 * Ottiene tutte le milestone di un utente per path
 */
export async function getUserMilestones(
  userId: string,
  pathType?: PathType
): Promise<MilestoneWithDefinition[]> {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('user_milestones')
    .select(`
      *,
      milestone_definitions!milestone_type (
        code,
        path_type,
        category,
        name,
        description,
        icon,
        xp_reward,
        display_order
      )
    `)
    .eq('user_id', userId)
    .order('achieved_at', { ascending: false });

  if (pathType) {
    query = query.eq('path_type', pathType);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Errore recupero milestone utente:', error);
    return [];
  }

  return (data || []).map((m: any) => ({
    id: m.id,
    userId: m.user_id,
    milestoneType: m.milestone_type,
    pathType: m.path_type,
    milestoneData: m.milestone_data,
    achievedAt: m.achieved_at,
    notified: m.notified,
    createdAt: m.created_at,
    definition: m.milestone_definitions ? {
      code: m.milestone_definitions.code,
      pathType: m.milestone_definitions.path_type,
      category: m.milestone_definitions.category,
      name: m.milestone_definitions.name,
      description: m.milestone_definitions.description,
      icon: m.milestone_definitions.icon,
      xpReward: m.milestone_definitions.xp_reward,
      displayOrder: m.milestone_definitions.display_order,
    } : undefined,
  }));
}

// ============================================================================
// MILESTONE CHECKERS
// ============================================================================

/**
 * Verifica milestone per esercizi completati
 */
export async function checkExerciseMilestones(
  userId: string,
  pathType: PathType,
  bookSlug: string
): Promise<MilestoneCheckResult[]> {
  const supabase = getSupabaseClient();
  const results: MilestoneCheckResult[] = [];

  // Conta esercizi completati per questo path usando join
  const { data: completed } = await supabase
    .from('user_exercise_progress')
    .select('exercise_id, exercises!inner(book_slug)')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .eq('exercises.book_slug', bookSlug);

  const exerciseCount = completed?.length || 0;

  // Verifica quale threshold è stato raggiunto
  const thresholds = EXERCISE_THRESHOLDS[pathType] || [];
  const milestoneMap = EXERCISE_MILESTONE_MAP[pathType] || {};

  for (const threshold of thresholds) {
    if (exerciseCount >= threshold) {
      const milestoneCode = milestoneMap[threshold];
      if (milestoneCode) {
        const exists = await hasMilestone(userId, milestoneCode, pathType);
        if (!exists) {
          results.push({
            earned: true,
            milestoneCode,
            pathType,
            data: { exerciseCount, threshold },
          });
        }
      }
    }
  }

  return results;
}

/**
 * Verifica milestone per primo assessment
 */
export async function checkFirstAssessmentMilestone(
  userId: string,
  pathType: PathType
): Promise<MilestoneCheckResult | null> {
  const milestoneMap: Record<PathType, string> = {
    leadership: LEADERSHIP_MILESTONES.FIRST_ASSESSMENT,
    ostacoli: OSTACOLI_MILESTONES.FIRST_ASSESSMENT,
    microfelicita: MICROFELICITA_MILESTONES.FIRST_ASSESSMENT,
    global: '',
  };

  const milestoneCode = milestoneMap[pathType];
  if (!milestoneCode) return null;

  const exists = await hasMilestone(userId, milestoneCode, pathType);
  if (exists) return null;

  return {
    earned: true,
    milestoneCode,
    pathType,
  };
}

/**
 * Verifica milestone per pilastri leadership
 */
export async function checkPillarMilestones(
  userId: string,
  pillarScores: Record<string, number>
): Promise<MilestoneCheckResult[]> {
  const results: MilestoneCheckResult[] = [];

  const pillars = Object.values(pillarScores);
  if (pillars.length !== 4) return results;

  // Tutti sopra 50%
  if (pillars.every(score => score >= 50)) {
    const exists = await hasMilestone(userId, LEADERSHIP_MILESTONES.ALL_PILLARS_ABOVE_50, 'leadership');
    if (!exists) {
      results.push({
        earned: true,
        milestoneCode: LEADERSHIP_MILESTONES.ALL_PILLARS_ABOVE_50,
        pathType: 'leadership',
        data: { pillarScores },
      });
    }
  }

  // Tutti sopra 70%
  if (pillars.every(score => score >= 70)) {
    const exists = await hasMilestone(userId, LEADERSHIP_MILESTONES.ALL_PILLARS_ABOVE_70, 'leadership');
    if (!exists) {
      results.push({
        earned: true,
        milestoneCode: LEADERSHIP_MILESTONES.ALL_PILLARS_ABOVE_70,
        pathType: 'leadership',
        data: { pillarScores },
      });
    }
  }

  return results;
}

/**
 * Verifica milestone per mastery di caratteristiche (80%+)
 */
export async function checkMasteryMilestones(
  userId: string,
  characteristicScores: Record<string, number>
): Promise<MilestoneCheckResult[]> {
  const results: MilestoneCheckResult[] = [];

  // Mappa caratteristica → milestone code
  const masteryMap: Record<string, string> = {
    'Motivazione': LEADERSHIP_MILESTONES.MASTERY_MOTIVAZIONE,
    'Coraggio': LEADERSHIP_MILESTONES.MASTERY_CORAGGIO,
    'Empatia': LEADERSHIP_MILESTONES.MASTERY_EMPATIA,
    'Creatività': LEADERSHIP_MILESTONES.MASTERY_CREATIVITA,
  };

  for (const [characteristic, score] of Object.entries(characteristicScores)) {
    if (score >= 80) {
      const milestoneCode = masteryMap[characteristic];
      if (milestoneCode) {
        const exists = await hasMilestone(userId, milestoneCode, 'leadership');
        if (!exists) {
          results.push({
            earned: true,
            milestoneCode,
            pathType: 'leadership',
            data: { characteristic, score },
          });
        }
      }
    }
  }

  return results;
}

// ============================================================================
// MAIN CHECK & AWARD FUNCTION
// ============================================================================

/**
 * Verifica e assegna tutte le milestone guadagnate dopo un'azione
 */
export async function checkAndAwardMilestones(
  userId: string,
  context: {
    action: 'exercise_complete' | 'assessment_complete' | 'chat' | 'profile_update';
    pathType?: PathType;
    bookSlug?: string;
    scores?: Record<string, number>;
    pillarScores?: Record<string, number>;
  }
): Promise<MilestoneAwardResult[]> {
  const results: MilestoneAwardResult[] = [];
  const milestonesToCheck: MilestoneCheckResult[] = [];

  switch (context.action) {
    case 'exercise_complete':
      if (context.pathType && context.bookSlug) {
        const exerciseMilestones = await checkExerciseMilestones(
          userId,
          context.pathType,
          context.bookSlug
        );
        milestonesToCheck.push(...exerciseMilestones);
      }
      break;

    case 'assessment_complete':
      if (context.pathType) {
        // Primo assessment
        const firstAssessment = await checkFirstAssessmentMilestone(userId, context.pathType);
        if (firstAssessment) milestonesToCheck.push(firstAssessment);

        // Leadership specific
        if (context.pathType === 'leadership') {
          // Pillar milestones
          if (context.pillarScores) {
            const pillarMilestones = await checkPillarMilestones(userId, context.pillarScores);
            milestonesToCheck.push(...pillarMilestones);
          }

          // Mastery milestones
          if (context.scores) {
            const masteryMilestones = await checkMasteryMilestones(userId, context.scores);
            milestonesToCheck.push(...masteryMilestones);
          }
        }
      }
      break;

    case 'chat':
      // Verifica prima chat
      const hasFirstChat = await hasMilestone(userId, 'first_chat', 'global');
      if (!hasFirstChat) {
        milestonesToCheck.push({
          earned: true,
          milestoneCode: 'first_chat',
          pathType: 'global',
        });
      }
      break;

    case 'profile_update':
      // Verifica profilo completo
      const hasProfileComplete = await hasMilestone(userId, 'profile_complete', 'global');
      if (!hasProfileComplete) {
        milestonesToCheck.push({
          earned: true,
          milestoneCode: 'profile_complete',
          pathType: 'global',
        });
      }
      break;
  }

  // Assegna le milestone guadagnate
  for (const milestone of milestonesToCheck) {
    if (milestone.earned) {
      const result = await awardMilestone(
        userId,
        milestone.milestoneCode,
        milestone.pathType,
        milestone.data || {}
      );
      results.push(result);
    }
  }

  return results;
}
