// Risolutore Assessment - Supabase Data Layer
import { SupabaseClient } from '@supabase/supabase-js';
import {
  QuestionWithDimension,
  RisolutoreDimension,
  RisolutoreAnswer,
  RisolutoreResults,
  normalizeScore,
  calculateResults,
  shuffleQuestions,
  LEVEL_CONFIG,
} from '@/lib/risolutore-scoring';

// Tipi per le risposte dal DB
interface DBDimension {
  id: number;
  code: string;
  name: string;
  category: 'filtro' | 'traditore' | 'scala';
  scoring_type: 'inverse' | 'direct';
  description: string;
  color: string;
  sort_order: number;
}

interface DBQuestion {
  id: number;
  code: string;
  dimension_code: string;
  question_text: string;
  scoring_type: 'inverse' | 'direct';
  order_index: number;
  level_group: number | null;
  risolutore_dimensions: DBDimension;
}

interface DBAssessment {
  id: string;
  user_id: string;
  assessment_type: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  current_question_index: number;
  started_at: string;
  completed_at: string | null;
}

interface DBAnswer {
  id: string;
  assessment_id: string;
  question_id: number;
  raw_score: number;
  normalized_score: number;
  answered_at: string;
}

/**
 * Carica tutte le domande Risolutore con le dimensioni associate
 */
export async function loadRisolutoreQuestions(
  supabase: SupabaseClient,
  shuffle: boolean = false
): Promise<QuestionWithDimension[]> {
  const { data, error } = await supabase
    .from('risolutore_questions')
    .select(`
      id,
      code,
      dimension_code,
      question_text,
      scoring_type,
      order_index,
      level_group,
      risolutore_dimensions (
        id,
        code,
        name,
        category,
        scoring_type,
        description,
        color,
        sort_order
      )
    `)
    .order('order_index');

  if (error) {
    console.error('Errore caricamento domande Risolutore:', error);
    throw new Error('Impossibile caricare le domande');
  }

  // Trasforma in formato applicazione
  const questions = (data as unknown[]).map((q: unknown) => {
    const question = q as DBQuestion;
    const dim = question.risolutore_dimensions;
    return {
      id: question.id,
      code: question.code,
      dimension_code: question.dimension_code,
      question_text: question.question_text,
      scoring_type: question.scoring_type,
      order_index: question.order_index,
      level_group: question.level_group,
      dimension: {
        id: dim.id,
        code: dim.code,
        name: dim.name,
        category: dim.category,
        scoring_type: dim.scoring_type,
        description: dim.description,
        color: dim.color,
        sort_order: dim.sort_order,
      },
    };
  });

  return shuffle ? shuffleQuestions(questions) : questions;
}

/**
 * Carica tutte le dimensioni Risolutore
 */
export async function loadRisolutoreDimensions(
  supabase: SupabaseClient
): Promise<RisolutoreDimension[]> {
  const { data, error } = await supabase
    .from('risolutore_dimensions')
    .select('*')
    .order('sort_order');

  if (error) {
    console.error('Errore caricamento dimensioni:', error);
    throw new Error('Impossibile caricare le dimensioni');
  }

  return data;
}

/**
 * Crea una nuova sessione assessment Risolutore
 */
export async function createRisolutoreSession(
  supabase: SupabaseClient,
  userId: string
): Promise<string> {
  const { data, error } = await supabase
    .from('user_assessments_v2')
    .insert({
      user_id: userId,
      assessment_type: 'risolutore',
      status: 'in_progress',
      current_question_index: 0,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Errore creazione sessione Risolutore:', error);
    throw new Error('Impossibile creare la sessione');
  }

  return data.id;
}

/**
 * Recupera sessione Risolutore in corso per l'utente
 */
export async function getInProgressRisolutore(
  supabase: SupabaseClient,
  userId: string
): Promise<DBAssessment | null> {
  const { data, error } = await supabase
    .from('user_assessments_v2')
    .select('*')
    .eq('user_id', userId)
    .eq('assessment_type', 'risolutore')
    .eq('status', 'in_progress')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Errore recupero sessione:', error);
  }

  return data || null;
}

/**
 * Recupera assessment Risolutore completato per ID
 */
export async function getCompletedRisolutore(
  supabase: SupabaseClient,
  assessmentId: string
): Promise<DBAssessment | null> {
  const { data, error } = await supabase
    .from('user_assessments_v2')
    .select('*')
    .eq('id', assessmentId)
    .eq('assessment_type', 'risolutore')
    .eq('status', 'completed')
    .single();

  if (error) {
    console.error('Errore recupero assessment:', error);
    return null;
  }

  return data;
}

/**
 * Carica le risposte per una sessione Risolutore
 */
export async function loadRisolutoreAnswers(
  supabase: SupabaseClient,
  assessmentId: string
): Promise<Map<number, RisolutoreAnswer>> {
  const { data, error } = await supabase
    .from('risolutore_answers')
    .select('*')
    .eq('assessment_id', assessmentId);

  if (error) {
    console.error('Errore caricamento risposte:', error);
    throw new Error('Impossibile caricare le risposte');
  }

  const answers = new Map<number, RisolutoreAnswer>();
  (data as DBAnswer[]).forEach((a) => {
    answers.set(a.question_id, {
      questionId: a.question_id,
      rawScore: a.raw_score,
      normalizedScore: a.normalized_score,
    });
  });

  return answers;
}

/**
 * Salva una risposta Risolutore (upsert)
 */
export async function saveRisolutoreAnswer(
  supabase: SupabaseClient,
  assessmentId: string,
  questionId: number,
  rawScore: number,
  scoringType: 'inverse' | 'direct'
): Promise<void> {
  const normalizedScore = normalizeScore(rawScore, scoringType);

  const { error } = await supabase
    .from('risolutore_answers')
    .upsert(
      {
        assessment_id: assessmentId,
        question_id: questionId,
        raw_score: rawScore,
        normalized_score: normalizedScore,
      },
      {
        onConflict: 'assessment_id,question_id',
      }
    );

  if (error) {
    console.error('Errore salvataggio risposta:', error);
    throw new Error('Impossibile salvare la risposta');
  }
}

/**
 * Aggiorna posizione corrente nell'assessment
 */
export async function updateRisolutoreCurrentQuestion(
  supabase: SupabaseClient,
  assessmentId: string,
  questionIndex: number
): Promise<void> {
  const { error } = await supabase
    .from('user_assessments_v2')
    .update({ current_question_index: questionIndex })
    .eq('id', assessmentId);

  if (error) {
    console.error('Errore aggiornamento posizione:', error);
  }
}

/**
 * Completa l'assessment Risolutore e calcola i risultati
 */
export async function completeRisolutoreAssessment(
  supabase: SupabaseClient,
  assessmentId: string
): Promise<RisolutoreResults> {
  // 1. Carica domande e dimensioni
  const [questions, dimensions] = await Promise.all([
    loadRisolutoreQuestions(supabase),
    loadRisolutoreDimensions(supabase),
  ]);

  // 2. Carica risposte
  const answers = await loadRisolutoreAnswers(supabase, assessmentId);

  // 3. Calcola risultati
  const results = calculateResults(answers, questions, dimensions);

  // 4. Salva risultati per dimensione
  for (const dimResult of results.dimensions) {
    const { error } = await supabase
      .from('risolutore_results')
      .upsert(
        {
          assessment_id: assessmentId,
          dimension_code: dimResult.dimensionCode,
          score: dimResult.totalScore,
          percentage: dimResult.percentage,
        },
        {
          onConflict: 'assessment_id,dimension_code',
        }
      );

    if (error) {
      console.error('Errore salvataggio risultato dimensione:', error);
    }
  }

  // 5. Salva livello risolutore
  const levelConfig = LEVEL_CONFIG[results.level.level];
  const { error: levelError } = await supabase
    .from('risolutore_level_results')
    .upsert(
      {
        assessment_id: assessmentId,
        level: results.level.level,
        level_name: levelConfig.name,
        level_description: levelConfig.description,
      },
      {
        onConflict: 'assessment_id',
      }
    );

  if (levelError) {
    console.error('Errore salvataggio livello:', levelError);
  }

  // 6. Marca assessment come completato
  const { error } = await supabase
    .from('user_assessments_v2')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', assessmentId);

  if (error) {
    console.error('Errore completamento assessment:', error);
    throw new Error("Impossibile completare l'assessment");
  }

  return results;
}

/**
 * Carica i risultati salvati per un assessment Risolutore
 */
export async function loadSavedRisolutoreResults(
  supabase: SupabaseClient,
  assessmentId: string
): Promise<RisolutoreResults | null> {
  // Carica domande e dimensioni
  const [questions, dimensions] = await Promise.all([
    loadRisolutoreQuestions(supabase),
    loadRisolutoreDimensions(supabase),
  ]);

  // Carica risposte
  const answers = await loadRisolutoreAnswers(supabase, assessmentId);

  if (answers.size === 0) {
    return null;
  }

  // Ricalcola risultati dalle risposte salvate
  return calculateResults(answers, questions, dimensions);
}
