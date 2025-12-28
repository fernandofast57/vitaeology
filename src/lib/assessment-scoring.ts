// Assessment LITE Scoring Logic
// 72 domande, scala 1-5, scoring inverse/direct

export interface Question {
  id: number;
  code: string;
  question_text: string;
  question_type: 'passive' | 'interlocutory' | 'active' | 'standard';
  scoring_type: 'inverse' | 'direct';
  order_index: number;
  characteristic_id: number;
}

export interface Characteristic {
  id: number;
  name: string;
  slug: string;
  code: string;
  pillar: 'visione' | 'azione' | 'relazioni' | 'adattamento';
  pillar_order: number;
  description: string;
}

export interface QuestionWithCharacteristic extends Question {
  characteristic: Characteristic;
}

export interface Answer {
  questionId: number;
  rawScore: number; // 1-5 come risposto dall'utente
  normalizedScore: number; // 1-5 dopo inversione se necessario
}

export interface CharacteristicResult {
  characteristicId: number;
  characteristicName: string;
  characteristicCode: string;
  pillar: string;
  averageScore: number; // 1-5
  percentage: number; // 0-100
}

export interface PillarResult {
  pillar: string;
  pillarLabel: string;
  averageScore: number;
  percentage: number;
  color: string;
}

export interface AssessmentResults {
  characteristics: CharacteristicResult[];
  pillars: PillarResult[];
  overallScore: number;
  overallPercentage: number;
  topStrengths: CharacteristicResult[];
  growthAreas: CharacteristicResult[];
}

// Costanti
export const SCALE_MIN = 1;
export const SCALE_MAX = 5;

export const SCALE_LABELS: Record<number, string> = {
  1: 'Quasi mai',
  2: 'Occasionalmente',
  3: 'Regolarmente',
  4: 'Frequentemente',
  5: 'Costantemente',
};

export const PILLAR_CONFIG: Record<string, { label: string; color: string }> = {
  visione: { label: 'Visione', color: '#0F4C81' },
  azione: { label: 'Azione', color: '#C1272D' },
  relazioni: { label: 'Relazioni', color: '#2D9B6D' },
  adattamento: { label: 'Adattamento', color: '#E87722' },
};

/**
 * Normalizza il punteggio in base al tipo di scoring
 * - direct: usa il valore così com'è
 * - inverse: inverte (6 - valore)
 */
export function normalizeScore(rawScore: number, scoringType: 'inverse' | 'direct'): number {
  if (scoringType === 'inverse') {
    return 6 - rawScore;
  }
  return rawScore;
}

/**
 * Calcola la media per una caratteristica
 */
export function calculateCharacteristicAverage(
  answers: Answer[],
  characteristicId: number
): number {
  const charAnswers = answers.filter(a => {
    // Nota: in pratica dovremmo avere il mapping question -> characteristic
    // Per ora assumiamo che sia passato correttamente
    return true; // placeholder
  });

  if (charAnswers.length === 0) return 0;

  const sum = charAnswers.reduce((acc, a) => acc + a.normalizedScore, 0);
  return sum / charAnswers.length;
}

/**
 * Converte punteggio 1-5 in percentuale 0-100
 */
export function scoreToPercentage(score: number): number {
  return Math.round(((score - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100);
}

/**
 * Calcola risultati completi dell'assessment
 */
export function calculateResults(
  answers: Map<number, Answer>,
  questions: QuestionWithCharacteristic[],
  characteristics: Characteristic[]
): AssessmentResults {
  // Raggruppa risposte per caratteristica
  const characteristicScores: Map<number, number[]> = new Map();

  questions.forEach(q => {
    const answer = answers.get(q.id);
    if (answer) {
      const scores = characteristicScores.get(q.characteristic_id) || [];
      scores.push(answer.normalizedScore);
      characteristicScores.set(q.characteristic_id, scores);
    }
  });

  // Calcola media per caratteristica
  const characteristicResults: CharacteristicResult[] = characteristics.map(char => {
    const scores = characteristicScores.get(char.id) || [];
    const avgScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;

    return {
      characteristicId: char.id,
      characteristicName: char.name,
      characteristicCode: char.code,
      pillar: char.pillar,
      averageScore: Math.round(avgScore * 100) / 100,
      percentage: scoreToPercentage(avgScore),
    };
  });

  // Calcola media per pilastro
  const pillarScores: Map<string, number[]> = new Map();
  characteristicResults.forEach(cr => {
    const scores = pillarScores.get(cr.pillar) || [];
    scores.push(cr.averageScore);
    pillarScores.set(cr.pillar, scores);
  });

  const pillarResults: PillarResult[] = Object.keys(PILLAR_CONFIG).map(pillar => {
    const scores = pillarScores.get(pillar) || [];
    const avgScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;

    return {
      pillar,
      pillarLabel: PILLAR_CONFIG[pillar].label,
      averageScore: Math.round(avgScore * 100) / 100,
      percentage: scoreToPercentage(avgScore),
      color: PILLAR_CONFIG[pillar].color,
    };
  });

  // Overall score
  const allScores = characteristicResults.map(cr => cr.averageScore);
  const overallScore = allScores.length > 0
    ? allScores.reduce((a, b) => a + b, 0) / allScores.length
    : 0;

  // Top 3 strengths e growth areas
  const sorted = [...characteristicResults].sort((a, b) => b.averageScore - a.averageScore);
  const topStrengths = sorted.slice(0, 3);
  const growthAreas = sorted.slice(-3).reverse();

  return {
    characteristics: characteristicResults,
    pillars: pillarResults,
    overallScore: Math.round(overallScore * 100) / 100,
    overallPercentage: scoreToPercentage(overallScore),
    topStrengths,
    growthAreas,
  };
}

/**
 * Ordina le domande per pilastro e caratteristica
 */
export function sortQuestionsByPillar(questions: QuestionWithCharacteristic[]): QuestionWithCharacteristic[] {
  return [...questions].sort((a, b) => {
    // Prima per pillar_order
    if (a.characteristic.pillar_order !== b.characteristic.pillar_order) {
      return a.characteristic.pillar_order - b.characteristic.pillar_order;
    }
    // Poi per order_index della domanda
    return a.order_index - b.order_index;
  });
}
