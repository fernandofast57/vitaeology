// Assessment LITE - Supabase Data Layer
import { SupabaseClient } from '@supabase/supabase-js';
import {
  QuestionWithCharacteristic,
  Characteristic,
  normalizeScore,
  calculateResults,
  AssessmentResults,
  Answer
} from '@/lib/assessment-scoring';

// Tipi per le risposte dal DB
interface DBCharacteristic {
  id: number;
  name: string;
  slug: string;
  code: string;
  pillar: 'visione' | 'azione' | 'relazioni' | 'adattamento';
  pillar_order: number;
  description: string;
}

interface DBQuestion {
  id: number;
  code: string;
  question_text: string;
  question_type: 'passive' | 'interlocutory' | 'active' | 'standard';
  scoring_type: 'inverse' | 'direct';
  order_index: number;
  characteristic_id: number;
  characteristics_v2: DBCharacteristic;
}

interface DBAssessment {
  id: string;
  user_id: string;
  assessment_type: 'lite' | 'full';
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
 * Carica tutte le domande LITE con le caratteristiche associate
 */
export async function loadLiteQuestions(
  supabase: SupabaseClient
): Promise<QuestionWithCharacteristic[]> {
  const { data, error } = await supabase
    .from('assessment_questions_v2')
    .select(`
      id,
      code,
      question_text,
      question_type,
      scoring_type,
      order_index,
      characteristic_id,
      characteristics_v2 (
        id,
        name,
        slug,
        code,
        pillar,
        pillar_order,
        description
      )
    `)
    .eq('is_lite', true)
    .order('characteristic_id')
    .order('order_index');

  if (error) {
    console.error('Errore caricamento domande:', error);
    throw new Error('Impossibile caricare le domande');
  }

  // Trasforma in formato applicazione
  return (data as unknown[]).map((q: unknown) => {
    const question = q as {
      id: number;
      code: string;
      question_text: string;
      question_type: string;
      scoring_type: string;
      order_index: number;
      characteristic_id: number;
      characteristics_v2: DBCharacteristic;
    };
    const char = question.characteristics_v2;
    return {
      id: question.id,
      code: question.code,
      question_text: question.question_text,
      question_type: question.question_type as 'passive' | 'interlocutory' | 'active' | 'standard',
      scoring_type: question.scoring_type as 'inverse' | 'direct',
      order_index: question.order_index,
      characteristic_id: question.characteristic_id,
      characteristic: {
        id: char.id,
        name: char.name,
        slug: char.slug,
        code: char.code,
        pillar: char.pillar,
        pillar_order: char.pillar_order,
        description: char.description,
      },
    };
  });
}

/**
 * Carica tutte le caratteristiche
 */
export async function loadCharacteristics(
  supabase: SupabaseClient
): Promise<Characteristic[]> {
  const { data, error } = await supabase
    .from('characteristics_v2')
    .select('*')
    .order('pillar_order');

  if (error) {
    console.error('Errore caricamento caratteristiche:', error);
    throw new Error('Impossibile caricare le caratteristiche');
  }

  return data;
}

/**
 * Crea una nuova sessione assessment
 */
export async function createAssessmentSession(
  supabase: SupabaseClient,
  userId: string
): Promise<string> {
  const { data, error } = await supabase
    .from('user_assessments_v2')
    .insert({
      user_id: userId,
      assessment_type: 'lite',
      status: 'in_progress',
      current_question_index: 0,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Errore creazione sessione:', error);
    throw new Error('Impossibile creare la sessione');
  }

  return data.id;
}

/**
 * Recupera sessione assessment in corso per l'utente
 */
export async function getInProgressAssessment(
  supabase: SupabaseClient,
  userId: string
): Promise<DBAssessment | null> {
  const { data, error } = await supabase
    .from('user_assessments_v2')
    .select('*')
    .eq('user_id', userId)
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
 * Recupera assessment completato per ID
 */
export async function getCompletedAssessment(
  supabase: SupabaseClient,
  assessmentId: string
): Promise<DBAssessment | null> {
  const { data, error } = await supabase
    .from('user_assessments_v2')
    .select('*')
    .eq('id', assessmentId)
    .eq('status', 'completed')
    .single();

  if (error) {
    console.error('Errore recupero assessment:', error);
    return null;
  }

  return data;
}

/**
 * Recupera l'ultimo assessment completato dell'utente
 */
export async function getLatestCompletedAssessment(
  supabase: SupabaseClient,
  userId: string
): Promise<DBAssessment | null> {
  const { data, error } = await supabase
    .from('user_assessments_v2')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Errore recupero assessment:', error);
  }

  return data || null;
}

/**
 * Carica le risposte per una sessione
 */
export async function loadAnswers(
  supabase: SupabaseClient,
  assessmentId: string
): Promise<Map<number, Answer>> {
  const { data, error } = await supabase
    .from('user_assessment_answers_v2')
    .select('*')
    .eq('assessment_id', assessmentId);

  if (error) {
    console.error('Errore caricamento risposte:', error);
    throw new Error('Impossibile caricare le risposte');
  }

  const answers = new Map<number, Answer>();
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
 * Salva una risposta (upsert)
 */
export async function saveAnswer(
  supabase: SupabaseClient,
  assessmentId: string,
  questionId: number,
  rawScore: number,
  scoringType: 'inverse' | 'direct'
): Promise<void> {
  const normalizedScore = normalizeScore(rawScore, scoringType);

  const { error } = await supabase
    .from('user_assessment_answers_v2')
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
export async function updateCurrentQuestion(
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
 * Completa l'assessment e calcola i risultati
 */
export async function completeAssessment(
  supabase: SupabaseClient,
  assessmentId: string
): Promise<AssessmentResults> {
  // 1. Carica domande e caratteristiche
  const [questions, characteristics] = await Promise.all([
    loadLiteQuestions(supabase),
    loadCharacteristics(supabase),
  ]);

  // 2. Carica risposte
  const answers = await loadAnswers(supabase, assessmentId);

  // 3. Calcola risultati
  const results = calculateResults(answers, questions, characteristics);

  // 4. Salva risultati per caratteristica
  for (const charResult of results.characteristics) {
    const { error } = await supabase
      .from('user_assessment_results_v2')
      .upsert(
        {
          assessment_id: assessmentId,
          characteristic_id: charResult.characteristicId,
          average_score: charResult.averageScore,
        },
        {
          onConflict: 'assessment_id,characteristic_id',
        }
      );

    if (error) {
      console.error('Errore salvataggio risultato caratteristica:', error);
    }
  }

  // 5. Marca assessment come completato
  const { error } = await supabase
    .from('user_assessments_v2')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', assessmentId);

  if (error) {
    console.error('Errore completamento assessment:', error);
    throw new Error('Impossibile completare l\'assessment');
  }

  return results;
}

/**
 * Carica i risultati salvati per un assessment
 */
export async function loadSavedResults(
  supabase: SupabaseClient,
  assessmentId: string
): Promise<AssessmentResults | null> {
  // Carica domande e caratteristiche
  const [questions, characteristics] = await Promise.all([
    loadLiteQuestions(supabase),
    loadCharacteristics(supabase),
  ]);

  // Carica risposte
  const answers = await loadAnswers(supabase, assessmentId);

  if (answers.size === 0) {
    return null;
  }

  // Ricalcola risultati dalle risposte salvate
  return calculateResults(answers, questions, characteristics);
}
