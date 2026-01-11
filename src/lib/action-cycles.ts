/**
 * Action Cycles Module - Sistema START:CHANGE:STOP
 *
 * Ogni ciclo di azione segue il pattern:
 * - START: Proposta con reasoning (perché questo passo)
 * - CHANGE: Pratica/esecuzione
 * - STOP: Conseguimento + proposta prossimo ciclo
 *
 * I micro-cicli (esercizi) compongono macro-cicli (trasformazione caratteristica)
 * Lo STOP di un ciclo è sempre un conseguimento che apre il prossimo START
 */

import { createClient } from '@supabase/supabase-js';

// ============================================================
// TYPES
// ============================================================

export type PathType = 'leadership' | 'ostacoli' | 'microfelicita';
export type CycleType = 'macro' | 'micro';
export type CyclePhase = 'start' | 'change' | 'stop';
export type AchievementType = 'micro' | 'macro' | 'milestone';

export interface ActionCycle {
  id: string;
  user_id: string;
  cycle_type: CycleType;
  exercise_id: string | null;
  target_characteristic: string | null;
  path_type: PathType;
  parent_cycle_id: string | null;
  current_phase: CyclePhase;

  // START
  start_proposal: string | null;
  start_reasoning: string | null;
  started_at: string | null;

  // CHANGE
  change_notes: string | null;
  change_started_at: string | null;

  // STOP
  stop_achievement: string | null;
  stop_achievement_type: AchievementType | null;
  stop_radar_delta: Record<string, number> | null;
  stop_reflection: string | null;
  stop_next_proposal: string | null;
  stopped_at: string | null;

  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  cycle_id: string | null;
  achievement_type: AchievementType;
  title: string;
  description: string | null;
  path_type: PathType;
  characteristic: string | null;
  evidence_type: string | null;
  evidence_data: Record<string, unknown> | null;
  micro_count: number;
  celebrated: boolean;
  celebrated_at: string | null;
  created_at: string;
}

export interface StartCycleInput {
  userId: string;
  exerciseId: string;
  exerciseTitle: string;
  pathType: PathType;
  reasoning: string;
  targetCharacteristic?: string;
  parentCycleId?: string;
}

export interface StopCycleInput {
  cycleId: string;
  achievement: string;
  reflection: string;
  radarDelta?: Record<string, number>;
}

export interface NextCycleProposal {
  exerciseId: string;
  exerciseTitle: string;
  reasoning: string;
  expectedBenefit: string;
}

// ============================================================
// SUPABASE CLIENT
// ============================================================

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ============================================================
// ACHIEVEMENT TEMPLATES
// ============================================================

const ACHIEVEMENT_TEMPLATES = {
  micro: {
    leadership: (characteristic: string) =>
      `Hai rafforzato la tua capacità di ${characteristic}`,
    ostacoli: (characteristic: string) =>
      `Hai sviluppato nuove strategie per ${characteristic}`,
    microfelicita: (characteristic: string) =>
      `Hai coltivato momenti di ${characteristic}`,
  },
  macro: {
    leadership: (characteristic: string) =>
      `Hai raggiunto una trasformazione significativa in ${characteristic}!`,
    ostacoli: (characteristic: string) =>
      `Hai superato un blocco importante in ${characteristic}!`,
    microfelicita: (characteristic: string) =>
      `Hai integrato ${characteristic} nella tua vita quotidiana!`,
  },
};

const NEXT_PROPOSAL_TEMPLATES = {
  leadership: (nextChar: string) =>
    `Ora che hai consolidato questo aspetto, sei pronto per esplorare ${nextChar}. Questo rafforzerà ulteriormente la tua leadership.`,
  ostacoli: (nextChar: string) =>
    `Con questa nuova consapevolezza, puoi affrontare ${nextChar} con più strumenti a disposizione.`,
  microfelicita: (nextChar: string) =>
    `Questo conseguimento ti prepara a notare e coltivare ${nextChar} nella tua giornata.`,
};

// ============================================================
// MAIN FUNCTIONS
// ============================================================

/**
 * START: Crea un nuovo micro-ciclo (quando Fernando propone un esercizio)
 */
export async function startMicroCycle(input: StartCycleInput): Promise<ActionCycle> {
  const supabase = getSupabaseClient();

  const proposal = `Esercizio: ${input.exerciseTitle}`;

  const { data: cycle, error } = await supabase
    .from('action_cycles')
    .insert({
      user_id: input.userId,
      cycle_type: 'micro',
      exercise_id: input.exerciseId,
      target_characteristic: input.targetCharacteristic || null,
      path_type: input.pathType,
      parent_cycle_id: input.parentCycleId || null,
      current_phase: 'start',
      start_proposal: proposal,
      start_reasoning: input.reasoning,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Errore creazione micro-ciclo:', error);
    throw new Error('Impossibile creare il ciclo');
  }

  return cycle;
}

/**
 * CHANGE: Avanza il ciclo alla fase di pratica (quando l'utente inizia l'esercizio)
 */
export async function advanceToChange(cycleId: string): Promise<ActionCycle> {
  const supabase = getSupabaseClient();

  const { data: cycle, error } = await supabase
    .from('action_cycles')
    .update({
      current_phase: 'change',
      change_started_at: new Date().toISOString(),
    })
    .eq('id', cycleId)
    .eq('current_phase', 'start')
    .select()
    .single();

  if (error) {
    console.error('Errore avanzamento a CHANGE:', error);
    throw new Error('Impossibile avanzare il ciclo');
  }

  return cycle;
}

/**
 * STOP: Completa il ciclo con conseguimento e proposta prossimo ciclo
 */
export async function completeCycleWithAchievement(
  input: StopCycleInput,
  nextProposal: NextCycleProposal | null
): Promise<{ cycle: ActionCycle; achievement: Achievement }> {
  const supabase = getSupabaseClient();

  // Recupera info ciclo corrente
  const { data: currentCycle, error: fetchError } = await supabase
    .from('action_cycles')
    .select('*')
    .eq('id', input.cycleId)
    .single();

  if (fetchError || !currentCycle) {
    throw new Error('Ciclo non trovato');
  }

  // Genera testo proposta prossimo ciclo
  const nextProposalText = nextProposal
    ? `Prossimo passo: ${nextProposal.exerciseTitle}. ${nextProposal.reasoning}`
    : 'Hai completato tutti gli esercizi disponibili per ora. Continua a praticare!';

  // Aggiorna ciclo a STOP
  const { data: updatedCycle, error: updateError } = await supabase
    .from('action_cycles')
    .update({
      current_phase: 'stop',
      stop_achievement: input.achievement,
      stop_achievement_type: 'micro',
      stop_radar_delta: input.radarDelta || null,
      stop_reflection: input.reflection,
      stop_next_proposal: nextProposalText,
      stopped_at: new Date().toISOString(),
    })
    .eq('id', input.cycleId)
    .select()
    .single();

  if (updateError) {
    console.error('Errore completamento ciclo:', updateError);
    throw new Error('Impossibile completare il ciclo');
  }

  // Crea record conseguimento
  const { data: achievement, error: achievementError } = await supabase
    .from('user_achievements')
    .insert({
      user_id: currentCycle.user_id,
      cycle_id: input.cycleId,
      achievement_type: 'micro',
      title: input.achievement,
      description: input.reflection,
      path_type: currentCycle.path_type,
      characteristic: currentCycle.target_characteristic,
      evidence_type: 'exercise_complete',
      evidence_data: {
        exercise_id: currentCycle.exercise_id,
        radar_delta: input.radarDelta,
        next_proposal: nextProposal,
      },
    })
    .select()
    .single();

  if (achievementError) {
    console.error('Errore creazione conseguimento:', achievementError);
    throw new Error('Impossibile creare il conseguimento');
  }

  return { cycle: updatedCycle, achievement };
}

/**
 * Recupera il ciclo attivo per un utente/percorso
 */
export async function getActiveCycle(
  userId: string,
  pathType: PathType
): Promise<ActionCycle | null> {
  const supabase = getSupabaseClient();

  const { data: cycle } = await supabase
    .from('action_cycles')
    .select('*')
    .eq('user_id', userId)
    .eq('path_type', pathType)
    .eq('cycle_type', 'micro')
    .in('current_phase', ['start', 'change'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return cycle || null;
}

/**
 * Recupera storico cicli completati
 */
export async function getCompletedCycles(
  userId: string,
  pathType: PathType,
  limit: number = 10
): Promise<ActionCycle[]> {
  const supabase = getSupabaseClient();

  const { data: cycles } = await supabase
    .from('action_cycles')
    .select('*')
    .eq('user_id', userId)
    .eq('path_type', pathType)
    .eq('current_phase', 'stop')
    .order('stopped_at', { ascending: false })
    .limit(limit);

  return cycles || [];
}

/**
 * Recupera conseguimenti utente
 */
export async function getUserAchievements(
  userId: string,
  pathType?: PathType,
  type?: AchievementType
): Promise<Achievement[]> {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('user_achievements')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (pathType) {
    query = query.eq('path_type', pathType);
  }

  if (type) {
    query = query.eq('achievement_type', type);
  }

  const { data: achievements } = await query;

  return achievements || [];
}

/**
 * Conta micro-conseguimenti per caratteristica (per verificare macro-conseguimento)
 */
export async function countMicroAchievements(
  userId: string,
  pathType: PathType,
  characteristic?: string
): Promise<number> {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('user_achievements')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('path_type', pathType)
    .eq('achievement_type', 'micro');

  if (characteristic) {
    query = query.eq('characteristic', characteristic);
  }

  const { count } = await query;

  return count || 0;
}

/**
 * Verifica e crea macro-conseguimento se raggiunta soglia
 */
export async function checkAndCreateMacroAchievement(
  userId: string,
  pathType: PathType,
  characteristic: string,
  threshold: number = 5
): Promise<Achievement | null> {
  const supabase = getSupabaseClient();

  // Conta micro-conseguimenti
  const microCount = await countMicroAchievements(userId, pathType, characteristic);

  if (microCount < threshold) {
    return null;
  }

  // Verifica se esiste già macro-conseguimento
  const { data: existing } = await supabase
    .from('user_achievements')
    .select('id')
    .eq('user_id', userId)
    .eq('path_type', pathType)
    .eq('characteristic', characteristic)
    .eq('achievement_type', 'macro')
    .single();

  if (existing) {
    return null; // Già creato
  }

  // Crea macro-conseguimento
  const title = ACHIEVEMENT_TEMPLATES.macro[pathType](characteristic);

  const { data: achievement, error } = await supabase
    .from('user_achievements')
    .insert({
      user_id: userId,
      achievement_type: 'macro',
      title,
      description: `Hai completato ${microCount} micro-cicli su ${characteristic}`,
      path_type: pathType,
      characteristic,
      evidence_type: 'radar_delta',
      micro_count: microCount,
    })
    .select()
    .single();

  if (error) {
    console.error('Errore creazione macro-conseguimento:', error);
    return null;
  }

  return achievement;
}

/**
 * Marca conseguimento come celebrato
 */
export async function celebrateAchievement(achievementId: string): Promise<void> {
  const supabase = getSupabaseClient();

  await supabase
    .from('user_achievements')
    .update({
      celebrated: true,
      celebrated_at: new Date().toISOString(),
    })
    .eq('id', achievementId);
}

/**
 * Recupera conseguimenti non celebrati
 */
export async function getUncelebratedAchievements(
  userId: string
): Promise<Achievement[]> {
  const supabase = getSupabaseClient();

  const { data: achievements } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('user_id', userId)
    .eq('celebrated', false)
    .order('created_at', { ascending: false });

  return achievements || [];
}

/**
 * Genera achievement text basato su path e caratteristica
 */
export function generateAchievementText(
  pathType: PathType,
  characteristic: string,
  type: 'micro' | 'macro' = 'micro'
): string {
  return ACHIEVEMENT_TEMPLATES[type][pathType](characteristic);
}

/**
 * Genera proposta prossimo ciclo
 */
export function generateNextProposalText(
  pathType: PathType,
  nextCharacteristic: string
): string {
  return NEXT_PROPOSAL_TEMPLATES[pathType](nextCharacteristic);
}

// ============================================================
// ORCHESTRATION FUNCTION
// ============================================================

/**
 * Funzione principale: completa esercizio con il ciclo START:CHANGE:STOP completo
 *
 * 1. Trova o crea ciclo per l'esercizio
 * 2. Se in START, avanza a CHANGE
 * 3. Completa ciclo con STOP (conseguimento)
 * 4. Verifica macro-conseguimento
 * 5. Prepara prossimo ciclo (prossimo START)
 */
export async function completeExerciseWithCycle(
  userId: string,
  exerciseId: string,
  exerciseTitle: string,
  pathType: PathType,
  characteristic: string,
  reflection: string,
  radarDelta?: Record<string, number>,
  nextExercise?: { id: string; title: string; reasoning: string }
): Promise<{
  cycle: ActionCycle;
  achievement: Achievement;
  macroAchievement: Achievement | null;
  nextProposal: string;
}> {
  const supabase = getSupabaseClient();

  // 1. Trova ciclo esistente per questo esercizio o creane uno
  let { data: cycle } = await supabase
    .from('action_cycles')
    .select('*')
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)
    .in('current_phase', ['start', 'change'])
    .single();

  if (!cycle) {
    // Crea nuovo ciclo (era implicito, ora lo rendiamo esplicito)
    cycle = await startMicroCycle({
      userId,
      exerciseId,
      exerciseTitle,
      pathType,
      reasoning: 'Esercizio iniziato direttamente',
      targetCharacteristic: characteristic,
    });
  }

  // 2. Se in START, avanza a CHANGE
  if (cycle.current_phase === 'start') {
    cycle = await advanceToChange(cycle.id);
  }

  // 3. Genera achievement text
  const achievementText = generateAchievementText(pathType, characteristic, 'micro');

  // 4. Prepara next proposal
  const nextProposal: NextCycleProposal | null = nextExercise
    ? {
        exerciseId: nextExercise.id,
        exerciseTitle: nextExercise.title,
        reasoning: nextExercise.reasoning,
        expectedBenefit: generateNextProposalText(pathType, characteristic),
      }
    : null;

  // 5. Completa ciclo con STOP
  const { cycle: completedCycle, achievement } = await completeCycleWithAchievement(
    {
      cycleId: cycle.id,
      achievement: achievementText,
      reflection,
      radarDelta,
    },
    nextProposal
  );

  // 6. Verifica macro-conseguimento
  const macroAchievement = await checkAndCreateMacroAchievement(
    userId,
    pathType,
    characteristic,
    5 // Soglia: 5 micro per 1 macro
  );

  // 7. Genera testo prossimo passo
  const nextProposalText = nextProposal
    ? `${nextProposal.exerciseTitle}: ${nextProposal.reasoning}`
    : 'Continua a praticare per consolidare i tuoi progressi.';

  return {
    cycle: completedCycle,
    achievement,
    macroAchievement,
    nextProposal: nextProposalText,
  };
}
