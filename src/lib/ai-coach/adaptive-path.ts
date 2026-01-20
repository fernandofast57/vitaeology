/**
 * Adaptive Path Module
 *
 * Sistema di percorso adattivo che seleziona esercizi personalizzati
 * basandosi sui risultati dell'assessment, risposte discovery e
 * progressi dell'utente. L'AI Fernando usa questo modulo per
 * raccomandare il prossimo passo nel percorso di crescita.
 */

import { createClient } from '@supabase/supabase-js';

// ============================================================
// TYPES
// ============================================================

export type PathType = 'leadership' | 'ostacoli' | 'microfelicita';

export interface UserContext {
  assessmentScores: Record<string, number>;
  discoveryResponses: string[];
  completedExerciseIds: string[];
  recentReflections: string[];
  pathType: PathType;
}

export interface ExerciseRecommendation {
  exerciseId: string;
  exerciseTitle: string;
  reasoning: string;
  expectedBenefit: string;
  priority: 'high' | 'medium' | 'low';
  targetCharacteristic: string;
}

export interface Exercise {
  id: string;
  title: string;
  subtitle: string | null;
  description: string;
  characteristic_slug: string;
  pillar_primary: string;
  difficulty_level: string;
  estimated_time_minutes: number;
  week_number: number;
  book_slug: string;
}

// Mappa pathType -> book_slug
const PATH_TO_BOOK: Record<PathType, string> = {
  leadership: 'leadership',
  ostacoli: 'risolutore',
  microfelicita: 'microfelicita',
};

// Mappa pathType -> tabella assessment
const PATH_TO_ASSESSMENT_TABLE: Record<PathType, string> = {
  leadership: 'user_assessments',
  ostacoli: 'risolutore_results',
  microfelicita: 'microfelicita_results',
};

// Reasoning templates per caratteristica
const REASONING_TEMPLATES: Record<string, string> = {
  default: 'Questo esercizio ti aiuta a sviluppare {characteristic} perché ti guida in una pratica mirata che rafforza questa capacità.',
  low_score: 'Questo esercizio è stato selezionato perché {characteristic} è un\'area dove puoi crescere molto. Con la pratica costante puoi espandere questa capacità.',
  medium_score: 'Hai già buone basi in {characteristic}. Con questo esercizio puoi consolidare e approfondire ulteriormente.',
  high_score: 'Eccelli già in {characteristic}! Questo esercizio ti sfiderà a portare questa capacità al livello successivo.',
};

// Expected benefit templates
const BENEFIT_TEMPLATES: Record<string, string> = {
  default: 'Dopo questo esercizio potrai applicare {characteristic} con maggiore consapevolezza nelle tue attività quotidiane.',
  leadership: 'Dopo questo esercizio potrai guidare il tuo team con maggiore {characteristic}, ispirando fiducia e risultati.',
  ostacoli: 'Dopo questo esercizio potrai affrontare gli ostacoli con più {characteristic}, trasformando le sfide in opportunità.',
  microfelicita: 'Dopo questo esercizio potrai coltivare momenti di {characteristic} nella tua vita quotidiana.',
};

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
// MAIN FUNCTIONS
// ============================================================

/**
 * Recupera il contesto completo dell'utente per il percorso
 */
export async function getUserContext(
  userId: string,
  pathType: PathType
): Promise<UserContext> {
  const supabase = getSupabaseClient();
  const bookSlug = PATH_TO_BOOK[pathType];

  // 1. Recupera assessment scores
  let assessmentScores: Record<string, number> = {};

  if (pathType === 'leadership') {
    // Per leadership, recupera da user_assessments_v2 + user_assessment_answers_v2
    const { data: assessment } = await supabase
      .from('user_assessments_v2')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    if (assessment) {
      const { data: characteristics } = await supabase
        .from('characteristics_v2')
        .select('id, name_familiar')
        .eq('is_active', true);

      const { data: answers } = await supabase
        .from('user_assessment_answers_v2')
        .select(`
          normalized_score,
          assessment_questions_v2 (characteristic_id)
        `)
        .eq('assessment_id', assessment.id);

      if (characteristics && answers) {
        const scoresByChar: Record<number, { points: number; count: number }> = {};
        answers.forEach((answer: any) => {
          const charId = answer.assessment_questions_v2?.characteristic_id;
          if (charId) {
            if (!scoresByChar[charId]) scoresByChar[charId] = { points: 0, count: 0 };
            scoresByChar[charId].points += answer.normalized_score;
            scoresByChar[charId].count += 1;
          }
        });

        characteristics.forEach((char: any) => {
          const scores = scoresByChar[char.id];
          if (scores && scores.count > 0) {
            const maxPoints = scores.count * 2;
            assessmentScores[char.name_familiar] = Math.round((scores.points / maxPoints) * 100);
          }
        });
      }
    }
  } else {
    // Per ostacoli e microfelicita, recupera scores_json dalla tabella results
    const tableName = PATH_TO_ASSESSMENT_TABLE[pathType];
    const { data: result } = await supabase
      .from(tableName)
      .select('scores_json')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (result?.scores_json) {
      assessmentScores = typeof result.scores_json === 'string'
        ? JSON.parse(result.scores_json)
        : result.scores_json;
    }
  }

  // 2. Recupera risposte discovery
  const { data: discoveryData } = await supabase
    .from('challenge_discovery_responses')
    .select('response')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(21); // Max 7 giorni x 3 risposte

  const discoveryResponses = (discoveryData || []).map((d: any) => d.response);

  // 3. Recupera esercizi completati per questo percorso
  const { data: progressData } = await supabase
    .from('user_exercise_progress')
    .select('exercise_id, exercises!inner(book_slug)')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .eq('exercises.book_slug', bookSlug);

  const completedExerciseIds = (progressData || []).map((p: any) => p.exercise_id);

  // 4. Recupera ultime 5 riflessioni (dal feedback esercizi)
  const { data: reflectionsData } = await supabase
    .from('user_exercise_progress')
    .select('ai_feedback, exercises!inner(book_slug)')
    .eq('user_id', userId)
    .eq('exercises.book_slug', bookSlug)
    .not('ai_feedback', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(5);

  const recentReflections = (reflectionsData || [])
    .map((r: any) => r.ai_feedback)
    .filter(Boolean);

  return {
    assessmentScores,
    discoveryResponses,
    completedExerciseIds,
    recentReflections,
    pathType,
  };
}

/**
 * Recupera esercizi disponibili (non completati) per il percorso
 */
export async function getAvailableExercises(
  pathType: PathType,
  completedIds: string[]
): Promise<Exercise[]> {
  const supabase = getSupabaseClient();
  const bookSlug = PATH_TO_BOOK[pathType];

  let query = supabase
    .from('exercises')
    .select(`
      id,
      title,
      subtitle,
      description,
      characteristic_slug,
      pillar_primary,
      difficulty_level,
      estimated_time_minutes,
      week_number,
      book_slug
    `)
    .eq('book_slug', bookSlug)
    .eq('is_active', true)
    .order('difficulty_level', { ascending: true })
    .order('week_number', { ascending: true });

  // Escludi esercizi già completati
  if (completedIds.length > 0) {
    query = query.not('id', 'in', `(${completedIds.join(',')})`);
  }

  const { data: exercises, error } = await query;

  if (error) {
    console.error('Errore recupero esercizi:', error);
    return [];
  }

  // Ordina per difficoltà: base -> intermedio -> avanzato
  const difficultyOrder: Record<string, number> = {
    base: 1,
    intermedio: 2,
    avanzato: 3,
  };

  return (exercises || []).sort((a, b) => {
    const diffA = difficultyOrder[a.difficulty_level] || 2;
    const diffB = difficultyOrder[b.difficulty_level] || 2;
    if (diffA !== diffB) return diffA - diffB;
    return a.week_number - b.week_number;
  });
}

/**
 * Seleziona il miglior esercizio basandosi sul contesto utente
 */
export async function selectBestExercise(
  context: UserContext,
  available: Exercise[]
): Promise<ExerciseRecommendation | null> {
  if (available.length === 0) {
    return null;
  }

  const { assessmentScores, pathType } = context;

  // Trova la caratteristica con punteggio più basso
  let lowestChar: string | null = null;
  let lowestScore = 100;

  Object.entries(assessmentScores).forEach(([char, score]) => {
    if (score < lowestScore) {
      lowestScore = score;
      lowestChar = char;
    }
  });

  // Cerca un esercizio che lavora sulla caratteristica più debole
  let selectedExercise: Exercise | null = null;

  if (lowestChar) {
    // Prova a trovare esercizio per la caratteristica più debole
    selectedExercise = available.find(
      ex => ex.characteristic_slug?.toLowerCase() === lowestChar?.toLowerCase()
    ) || null;
  }

  // Fallback: primo esercizio disponibile
  if (!selectedExercise) {
    selectedExercise = available[0];
  }

  // Determina priorità basata sul punteggio
  let priority: 'high' | 'medium' | 'low' = 'medium';
  let reasoningTemplate = REASONING_TEMPLATES.default;

  if (lowestScore < 40) {
    priority = 'high';
    reasoningTemplate = REASONING_TEMPLATES.low_score;
  } else if (lowestScore < 70) {
    priority = 'medium';
    reasoningTemplate = REASONING_TEMPLATES.medium_score;
  } else {
    priority = 'low';
    reasoningTemplate = REASONING_TEMPLATES.high_score;
  }

  // Genera reasoning
  const targetCharacteristic = selectedExercise.characteristic_slug || lowestChar || 'la tua crescita';
  const reasoning = reasoningTemplate.replace(/{characteristic}/g, targetCharacteristic);

  // Genera expected benefit
  const benefitTemplate = BENEFIT_TEMPLATES[pathType] || BENEFIT_TEMPLATES.default;
  const expectedBenefit = benefitTemplate.replace(/{characteristic}/g, targetCharacteristic);

  return {
    exerciseId: selectedExercise.id,
    exerciseTitle: selectedExercise.title,
    reasoning,
    expectedBenefit,
    priority,
    targetCharacteristic,
  };
}

/**
 * Salva una raccomandazione nel database
 */
export async function saveRecommendation(
  userId: string,
  recommendation: ExerciseRecommendation,
  pathType: PathType
): Promise<void> {
  const supabase = getSupabaseClient();

  // Prima segna le raccomandazioni precedenti come expired
  await supabase
    .from('ai_exercise_recommendations')
    .update({ status: 'expired' })
    .eq('user_id', userId)
    .eq('based_on_assessment_type', pathType)
    .eq('status', 'pending');

  // Inserisci nuova raccomandazione
  const { error } = await supabase
    .from('ai_exercise_recommendations')
    .insert({
      user_id: userId,
      recommended_exercise_id: recommendation.exerciseId,
      reasoning: recommendation.reasoning,
      priority: recommendation.priority === 'high' ? 1 : recommendation.priority === 'medium' ? 2 : 3,
      based_on_assessment_type: pathType,
      status: 'pending',
    });

  if (error) {
    console.error('Errore salvataggio raccomandazione:', error);
    throw new Error('Impossibile salvare la raccomandazione');
  }
}

/**
 * Ottiene il prossimo esercizio raccomandato (funzione principale)
 */
export async function getNextExercise(
  userId: string,
  pathType: PathType
): Promise<ExerciseRecommendation | null> {
  const supabase = getSupabaseClient();

  // 1. Controlla se esiste una raccomandazione pending
  const { data: existingRec } = await supabase
    .from('ai_exercise_recommendations')
    .select(`
      id,
      reasoning,
      priority,
      exercises (
        id,
        title,
        characteristic_slug
      )
    `)
    .eq('user_id', userId)
    .eq('based_on_assessment_type', pathType)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (existingRec?.exercises) {
    const exercise = existingRec.exercises as any;
    const priorityMap: Record<number, 'high' | 'medium' | 'low'> = {
      1: 'high',
      2: 'medium',
      3: 'low',
    };

    return {
      exerciseId: exercise.id,
      exerciseTitle: exercise.title,
      reasoning: existingRec.reasoning,
      expectedBenefit: BENEFIT_TEMPLATES[pathType]?.replace(
        /{characteristic}/g,
        exercise.characteristic_slug || 'la tua crescita'
      ) || '',
      priority: priorityMap[existingRec.priority as number] || 'medium',
      targetCharacteristic: exercise.characteristic_slug || '',
    };
  }

  // 2. Genera nuova raccomandazione
  const context = await getUserContext(userId, pathType);
  const available = await getAvailableExercises(pathType, context.completedExerciseIds);

  if (available.length === 0) {
    // Tutti gli esercizi completati!
    return null;
  }

  const recommendation = await selectBestExercise(context, available);

  if (!recommendation) {
    return null;
  }

  // 3. Salva la raccomandazione
  await saveRecommendation(userId, recommendation, pathType);

  return recommendation;
}

/**
 * Accetta una raccomandazione (l'utente inizia l'esercizio)
 */
export async function acceptRecommendation(
  userId: string,
  exerciseId: string
): Promise<void> {
  const supabase = getSupabaseClient();

  await supabase
    .from('ai_exercise_recommendations')
    .update({ status: 'accepted' })
    .eq('user_id', userId)
    .eq('recommended_exercise_id', exerciseId)
    .eq('status', 'pending');
}

/**
 * Salta una raccomandazione
 */
export async function skipRecommendation(
  userId: string,
  exerciseId: string
): Promise<void> {
  const supabase = getSupabaseClient();

  await supabase
    .from('ai_exercise_recommendations')
    .update({ status: 'skipped' })
    .eq('user_id', userId)
    .eq('recommended_exercise_id', exerciseId)
    .eq('status', 'pending');
}

/**
 * Completa una raccomandazione
 */
export async function completeRecommendation(
  userId: string,
  exerciseId: string
): Promise<void> {
  const supabase = getSupabaseClient();

  await supabase
    .from('ai_exercise_recommendations')
    .update({ status: 'completed' })
    .eq('user_id', userId)
    .eq('recommended_exercise_id', exerciseId)
    .in('status', ['pending', 'accepted']);
}
