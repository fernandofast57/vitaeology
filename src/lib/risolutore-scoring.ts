// Risolutore Assessment Scoring Logic
// 48 domande, scala VERO/INCERTO/FALSO (0-2), scoring inverse per Traditori

export interface RisolutoreQuestion {
  id: number;
  code: string;
  dimension_code: string;
  question_text: string;
  scoring_type: 'inverse' | 'direct';
  order_index: number;
  level_group: number | null;
}

export interface RisolutoreDimension {
  id: number;
  code: string;
  name: string;
  category: 'filtro' | 'traditore' | 'scala';
  scoring_type: 'inverse' | 'direct';
  description: string;
  color: string;
  sort_order: number;
}

export interface QuestionWithDimension extends RisolutoreQuestion {
  dimension: RisolutoreDimension;
}

export interface RisolutoreAnswer {
  questionId: number;
  rawScore: number; // 0-2: FALSO=0, INCERTO=1, VERO=2
  normalizedScore: number; // 0-2 dopo inversione se necessario
}

export interface DimensionResult {
  dimensionCode: string;
  dimensionName: string;
  category: 'filtro' | 'traditore' | 'scala';
  totalScore: number; // Somma punteggi
  maxScore: number; // Punteggio massimo possibile
  percentage: number; // 0-100
  color: string;
  interpretation: string;
}

export interface LevelResult {
  level: number; // 1-5
  levelName: string;
  levelDescription: string;
}

export interface RisolutoreResults {
  dimensions: DimensionResult[];
  filtri: DimensionResult[];
  traditori: DimensionResult[];
  level: LevelResult;
  overallPercentage: number;
}

// Costanti scala
export const SCALE_MIN = 0;
export const SCALE_MAX = 2;

export const SCALE_LABELS: Record<number, string> = {
  0: 'FALSO',
  1: 'INCERTO',
  2: 'VERO',
};

// Configurazione dimensioni
export const DIMENSION_CONFIG: Record<string, { label: string; color: string; category: string }> = {
  FP: { label: 'Detective dei Pattern', color: '#10B981', category: 'filtro' },
  FS: { label: 'Antenna dei Segnali', color: '#3B82F6', category: 'filtro' },
  FR: { label: 'Radar delle Risorse', color: '#8B5CF6', category: 'filtro' },
  TP: { label: 'Il Paralizzante', color: '#EF4444', category: 'traditore' },
  TT: { label: 'Il Timoroso', color: '#F97316', category: 'traditore' },
  TC: { label: 'Il Procrastinatore', color: '#EAB308', category: 'traditore' },
  SR: { label: 'Scala del Risolutore', color: '#6366F1', category: 'scala' },
};

// Livelli Risolutore
export const LEVEL_CONFIG: Record<number, { name: string; description: string }> = {
  1: {
    name: 'Risolutore Base',
    description: 'Applichi i filtri consapevolmente e risolvi problemi individuali',
  },
  2: {
    name: 'Risolutore Competente',
    description: 'Automatizzi i filtri con risultati consistenti e prima credibilità',
  },
  3: {
    name: 'Risolutore Esperto',
    description: 'Leadership situazionale, influenzi processi con autonomia operativa',
  },
  4: {
    name: 'Risolutore Senior',
    description: 'Formi altri risolutori con influenza strategica e guidi progetti critici',
  },
  5: {
    name: 'Moltiplicatore di Libertà',
    description: 'Trasformi sistemi organizzativi con leadership riconosciuta',
  },
};

/**
 * Normalizza il punteggio in base al tipo di scoring
 * - direct: usa il valore così com'è (Filtri, Scala)
 * - inverse: inverte (2 - valore) (Traditori)
 */
export function normalizeScore(rawScore: number, scoringType: 'inverse' | 'direct'): number {
  if (scoringType === 'inverse') {
    return SCALE_MAX - rawScore;
  }
  return rawScore;
}

/**
 * Converte punteggio totale in percentuale
 */
export function scoreToPercentage(score: number, maxScore: number): number {
  if (maxScore === 0) return 0;
  return Math.round((score / maxScore) * 100);
}

/**
 * Interpreta il punteggio per Filtri (0-12 per 6 domande)
 */
export function interpretFiltro(score: number): string {
  if (score <= 4) return 'Filtro da sviluppare - potenziale inespresso';
  if (score <= 8) return 'Filtro attivo - uso intermittente';
  return 'Filtro padroneggiato - uso automatico';
}

/**
 * Interpreta il punteggio per Traditori (0-12 per 6 domande, dopo inversione)
 */
export function interpretTraditore(score: number): string {
  if (score <= 4) return 'Traditore attivo - impatta significativamente';
  if (score <= 8) return 'Traditore riconosciuto - impatto moderato';
  return 'Traditore superato - impatto minimo';
}

/**
 * Calcola il livello Risolutore basato sulle domande SR01-SR12
 * - level_group 1 (SR01-04): Base/Competente
 * - level_group 2 (SR05-08): Esperto
 * - level_group 3 (SR09-12): Senior/Moltiplicatore
 */
export function calculateLevel(
  answers: Map<number, RisolutoreAnswer>,
  questions: QuestionWithDimension[]
): LevelResult {
  // Filtra solo domande della scala (SR)
  const scalaQuestions = questions.filter(q => q.dimension_code === 'SR');

  // Raggruppa per level_group
  const groupScores: Record<number, { veroCount: number; total: number }> = {
    1: { veroCount: 0, total: 0 },
    2: { veroCount: 0, total: 0 },
    3: { veroCount: 0, total: 0 },
  };

  scalaQuestions.forEach(q => {
    const answer = answers.get(q.id);
    if (answer && q.level_group) {
      groupScores[q.level_group].total++;
      if (answer.rawScore === 2) { // VERO
        groupScores[q.level_group].veroCount++;
      }
    }
  });

  // Determina livello
  // Logica: 3-4 VERO su 4 domande = passa al livello successivo
  let level = 1;

  // Gruppo 1: 0-2 VERO = Livello 1, 3-4 VERO = Livello 2
  if (groupScores[1].veroCount >= 3) {
    level = 2;

    // Gruppo 2: se passa anche questo, Livello 3
    if (groupScores[2].veroCount >= 3) {
      level = 3;

      // Gruppo 3: se passa anche questo, Livello 4-5
      if (groupScores[3].veroCount >= 3) {
        level = groupScores[3].veroCount === 4 ? 5 : 4;
      }
    }
  }

  return {
    level,
    levelName: LEVEL_CONFIG[level].name,
    levelDescription: LEVEL_CONFIG[level].description,
  };
}

/**
 * Calcola risultati completi dell'assessment Risolutore
 */
export function calculateResults(
  answers: Map<number, RisolutoreAnswer>,
  questions: QuestionWithDimension[],
  dimensions: RisolutoreDimension[]
): RisolutoreResults {
  // Raggruppa punteggi per dimensione (esclusa SR che va calcolata diversamente)
  const dimensionScores: Map<string, { total: number; count: number }> = new Map();

  questions.forEach(q => {
    if (q.dimension_code === 'SR') return; // Scala gestita separatamente

    const answer = answers.get(q.id);
    if (answer) {
      const current = dimensionScores.get(q.dimension_code) || { total: 0, count: 0 };
      current.total += answer.normalizedScore;
      current.count++;
      dimensionScores.set(q.dimension_code, current);
    }
  });

  // Calcola risultati per dimensione
  const dimensionResults: DimensionResult[] = dimensions
    .filter(d => d.code !== 'SR')
    .map(dim => {
      const scores = dimensionScores.get(dim.code) || { total: 0, count: 0 };
      const maxScore = scores.count * SCALE_MAX; // 6 domande × 2 = 12
      const percentage = scoreToPercentage(scores.total, maxScore);

      const interpretation = dim.category === 'filtro'
        ? interpretFiltro(scores.total)
        : interpretTraditore(scores.total);

      return {
        dimensionCode: dim.code,
        dimensionName: dim.name,
        category: dim.category as 'filtro' | 'traditore' | 'scala',
        totalScore: scores.total,
        maxScore,
        percentage,
        color: dim.color,
        interpretation,
      };
    });

  // Separa filtri e traditori
  const filtri = dimensionResults.filter(d => d.category === 'filtro');
  const traditori = dimensionResults.filter(d => d.category === 'traditore');

  // Calcola livello
  const level = calculateLevel(answers, questions);

  // Overall percentage (media delle 6 dimensioni)
  const totalPercentage = dimensionResults.reduce((sum, d) => sum + d.percentage, 0);
  const overallPercentage = Math.round(totalPercentage / dimensionResults.length);

  return {
    dimensions: dimensionResults,
    filtri,
    traditori,
    level,
    overallPercentage,
  };
}

/**
 * Mescola le domande per presentazione randomizzata
 */
export function shuffleQuestions(questions: QuestionWithDimension[]): QuestionWithDimension[] {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
