// Microfelicità Assessment - Supabase Data Layer
import { SupabaseClient } from '@supabase/supabase-js';
import {
  QuestionWithDimension,
  MicrofelicitaDimension,
  MicrofelicitaAnswer,
  MicrofelicitaResults,
  normalizeScore,
  calculateResults,
  shuffleQuestions,
  PROFILE_CONFIG,
} from '@/lib/microfelicita-scoring';

// Tipi per le risposte dal DB
interface DBDimension {
  id: number;
  code: string;
  name: string;
  category: 'radar' | 'sabotatore' | 'livello';
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
  microfelicita_dimensions: DBDimension;
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
 * Carica tutte le domande Microfelicità con le dimensioni associate
 */
export async function loadMicrofelicitaQuestions(
  supabase: SupabaseClient,
  shuffle: boolean = false
): Promise<QuestionWithDimension[]> {
  const { data, error } = await supabase
    .from('microfelicita_questions')
    .select(`
      id,
      code,
      dimension_code,
      question_text,
      scoring_type,
      order_index,
      microfelicita_dimensions (
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
    console.error('Errore caricamento domande Microfelicità:', error);
    throw new Error('Impossibile caricare le domande');
  }

  // Trasforma in formato applicazione
  const questions = (data as unknown[]).map((q: unknown) => {
    const question = q as DBQuestion;
    const dim = question.microfelicita_dimensions;
    return {
      id: question.id,
      code: question.code,
      dimension_code: question.dimension_code,
      question_text: question.question_text,
      scoring_type: question.scoring_type,
      order_index: question.order_index,
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
 * Carica tutte le dimensioni Microfelicità
 */
export async function loadMicrofelicitaDimensions(
  supabase: SupabaseClient
): Promise<MicrofelicitaDimension[]> {
  const { data, error } = await supabase
    .from('microfelicita_dimensions')
    .select('*')
    .order('sort_order');

  if (error) {
    console.error('Errore caricamento dimensioni:', error);
    throw new Error('Impossibile caricare le dimensioni');
  }

  return data;
}

/**
 * Crea una nuova sessione assessment Microfelicità
 */
export async function createMicrofelicitaSession(
  supabase: SupabaseClient,
  userId: string
): Promise<string> {
  const { data, error } = await supabase
    .from('user_assessments_v2')
    .insert({
      user_id: userId,
      assessment_type: 'microfelicita',
      status: 'in_progress',
      current_question_index: 0,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Errore creazione sessione Microfelicità:', error);
    throw new Error('Impossibile creare la sessione');
  }

  return data.id;
}

/**
 * Recupera sessione Microfelicità in corso per l'utente
 */
export async function getInProgressMicrofelicita(
  supabase: SupabaseClient,
  userId: string
): Promise<DBAssessment | null> {
  const { data, error } = await supabase
    .from('user_assessments_v2')
    .select('*')
    .eq('user_id', userId)
    .eq('assessment_type', 'microfelicita')
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
 * Recupera assessment Microfelicità completato per ID
 */
export async function getCompletedMicrofelicita(
  supabase: SupabaseClient,
  assessmentId: string
): Promise<DBAssessment | null> {
  const { data, error } = await supabase
    .from('user_assessments_v2')
    .select('*')
    .eq('id', assessmentId)
    .eq('assessment_type', 'microfelicita')
    .eq('status', 'completed')
    .single();

  if (error) {
    console.error('Errore recupero assessment:', error);
    return null;
  }

  return data;
}

/**
 * Carica le risposte per una sessione Microfelicità
 */
export async function loadMicrofelicitaAnswers(
  supabase: SupabaseClient,
  assessmentId: string
): Promise<Map<number, MicrofelicitaAnswer>> {
  const { data, error } = await supabase
    .from('microfelicita_answers')
    .select('*')
    .eq('assessment_id', assessmentId);

  if (error) {
    console.error('Errore caricamento risposte:', error);
    throw new Error('Impossibile caricare le risposte');
  }

  const answers = new Map<number, MicrofelicitaAnswer>();
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
 * Salva una risposta Microfelicità (upsert)
 */
export async function saveMicrofelicitaAnswer(
  supabase: SupabaseClient,
  assessmentId: string,
  questionId: number,
  rawScore: number,
  scoringType: 'inverse' | 'direct'
): Promise<void> {
  const normalizedScore = normalizeScore(rawScore, scoringType);

  const { error } = await supabase
    .from('microfelicita_answers')
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
export async function updateMicrofelicitaCurrentQuestion(
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
 * Completa l'assessment Microfelicità e calcola i risultati
 */
export async function completeMicrofelicitaAssessment(
  supabase: SupabaseClient,
  assessmentId: string
): Promise<MicrofelicitaResults> {
  // 1. Carica domande e dimensioni
  const [questions, dimensions] = await Promise.all([
    loadMicrofelicitaQuestions(supabase),
    loadMicrofelicitaDimensions(supabase),
  ]);

  // 2. Carica risposte
  const answers = await loadMicrofelicitaAnswers(supabase, assessmentId);

  // 3. Calcola risultati
  const results = calculateResults(answers, questions, dimensions);

  // 4. Salva risultati per dimensione
  for (const dimResult of results.dimensions) {
    const { error } = await supabase
      .from('microfelicita_results')
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

  // 5. Salva profilo praticante
  const { error: profileError } = await supabase
    .from('microfelicita_level_results')
    .upsert(
      {
        assessment_id: assessmentId,
        profile_type: results.profile.profileType,
        level1_score: results.profile.level1Score,
        level2_score: results.profile.level2Score,
        level3_score: results.profile.level3Score,
      },
      {
        onConflict: 'assessment_id',
      }
    );

  if (profileError) {
    console.error('Errore salvataggio profilo:', profileError);
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
 * Carica i risultati salvati per un assessment Microfelicità
 */
export async function loadSavedMicrofelicitaResults(
  supabase: SupabaseClient,
  assessmentId: string
): Promise<MicrofelicitaResults | null> {
  // Carica domande e dimensioni
  const [questions, dimensions] = await Promise.all([
    loadMicrofelicitaQuestions(supabase),
    loadMicrofelicitaDimensions(supabase),
  ]);

  // Carica risposte
  const answers = await loadMicrofelicitaAnswers(supabase, assessmentId);

  if (answers.size === 0) {
    return null;
  }

  // Ricalcola risultati dalle risposte salvate
  return calculateResults(answers, questions, dimensions);
}
