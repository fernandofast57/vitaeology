// Microfelicità Assessment Scoring Logic
// 47 domande, scala VERO/INCERTO/FALSO (0-2), scoring inverse per Sabotatori

export interface MicrofelicitaQuestion {
  id: number;
  code: string;
  dimension_code: string;
  question_text: string;
  scoring_type: 'inverse' | 'direct';
  order_index: number;
}

export interface MicrofelicitaDimension {
  id: number;
  code: string;
  name: string;
  category: 'radar' | 'sabotatore' | 'livello';
  scoring_type: 'inverse' | 'direct';
  description: string;
  color: string;
  sort_order: number;
}

export interface QuestionWithDimension extends MicrofelicitaQuestion {
  dimension: MicrofelicitaDimension;
}

export interface MicrofelicitaAnswer {
  questionId: number;
  rawScore: number; // 0-2: FALSO=0, INCERTO=1, VERO=2
  normalizedScore: number; // 0-2 dopo inversione se necessario
}

export interface DimensionResult {
  dimensionCode: string;
  dimensionName: string;
  category: 'radar' | 'sabotatore' | 'livello';
  totalScore: number;
  maxScore: number;
  percentage: number;
  color: string;
  interpretation: string;
}

export interface ProfileResult {
  profileType: 'principiante' | 'praticante' | 'esperto';
  profileName: string;
  profileDescription: string;
  level1Score: number;
  level2Score: number;
  level3Score: number;
}

export interface MicrofelicitaResults {
  dimensions: DimensionResult[];
  radar: DimensionResult[];
  sabotatori: DimensionResult[];
  livelli: DimensionResult[];
  profile: ProfileResult;
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
  // R.A.D.A.R.
  RR: { label: 'Rileva', color: '#8B5CF6', category: 'radar' },
  RA: { label: 'Accogli', color: '#A78BFA', category: 'radar' },
  RD: { label: 'Distingui', color: '#C4B5FD', category: 'radar' },
  RM: { label: 'Amplifica', color: '#DDD6FE', category: 'radar' },
  RS: { label: 'Resta', color: '#EDE9FE', category: 'radar' },
  // Sabotatori
  SM: { label: 'Minimizzazione', color: '#EF4444', category: 'sabotatore' },
  SA: { label: 'Anticipo', color: '#F97316', category: 'sabotatore' },
  SI: { label: 'Auto-Interruzione', color: '#EAB308', category: 'sabotatore' },
  SC: { label: 'Cambio Fuoco', color: '#84CC16', category: 'sabotatore' },
  SE: { label: 'Correzione', color: '#22C55E', category: 'sabotatore' },
  // Livelli
  L1: { label: 'Campo Interno', color: '#3B82F6', category: 'livello' },
  L2: { label: 'Spazio Relazionale', color: '#6366F1', category: 'livello' },
  L3: { label: 'Campo Contesti', color: '#8B5CF6', category: 'livello' },
};

// Profili Praticante
export const PROFILE_CONFIG: Record<string, { name: string; description: string }> = {
  principiante: {
    name: 'Principiante',
    description: 'Stai iniziando a sviluppare la capacità di cogliere micro-momenti di benessere nella tua giornata personale.',
  },
  praticante: {
    name: 'Praticante',
    description: 'Riconosci micro-momenti sia nella tua giornata che nelle relazioni. Il prossimo passo è influenzare positivamente i contesti.',
  },
  esperto: {
    name: 'Esperto',
    description: 'Hai sviluppato la capacità di cogliere e coltivare micro-momenti di benessere a tutti e tre i livelli: personale, relazionale e contestuale.',
  },
};

/**
 * Normalizza il punteggio in base al tipo di scoring
 * - direct: usa il valore così com'è (R.A.D.A.R., Livelli)
 * - inverse: inverte (2 - valore) (Sabotatori)
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
 * Interpreta il punteggio per R.A.D.A.R. (0-8 per 4 domande)
 */
export function interpretRadar(score: number): string {
  if (score <= 2) return 'Fase da sviluppare - potenziale inespresso';
  if (score <= 5) return 'Fase attiva - uso intermittente';
  return 'Fase padroneggiata - uso automatico';
}

/**
 * Interpreta il punteggio per Sabotatori (0-6 per 3 domande, dopo inversione)
 */
export function interpretSabotatore(score: number): string {
  if (score <= 2) return 'Sabotatore attivo - impatta significativamente';
  if (score <= 4) return 'Sabotatore riconosciuto - impatto moderato';
  return 'Sabotatore superato - impatto minimo';
}

/**
 * Interpreta il punteggio per Livelli (0-8 per 4 domande)
 */
export function interpretLivello(score: number): string {
  if (score <= 2) return 'Livello emergente - in sviluppo';
  if (score <= 5) return 'Livello attivo - buona padronanza';
  return 'Livello padroneggiato - integrato naturalmente';
}

/**
 * Calcola il profilo praticante basato sui punteggi dei 3 livelli
 */
export function calculateProfile(
  level1Score: number,
  level2Score: number,
  level3Score: number
): ProfileResult {
  // Soglia: 5+ su 8 punti per considerare un livello "attivo"
  const l1Active = level1Score >= 5;
  const l2Active = level2Score >= 5;
  const l3Active = level3Score >= 5;

  let profileType: 'principiante' | 'praticante' | 'esperto' = 'principiante';

  if (l1Active && l2Active && l3Active) {
    profileType = 'esperto';
  } else if (l1Active && l2Active) {
    profileType = 'praticante';
  }

  return {
    profileType,
    profileName: PROFILE_CONFIG[profileType].name,
    profileDescription: PROFILE_CONFIG[profileType].description,
    level1Score,
    level2Score,
    level3Score,
  };
}

/**
 * Calcola risultati completi dell'assessment Microfelicità
 */
export function calculateResults(
  answers: Map<number, MicrofelicitaAnswer>,
  questions: QuestionWithDimension[],
  dimensions: MicrofelicitaDimension[]
): MicrofelicitaResults {
  // Raggruppa punteggi per dimensione
  const dimensionScores: Map<string, { total: number; count: number }> = new Map();

  questions.forEach(q => {
    const answer = answers.get(q.id);
    if (answer) {
      const current = dimensionScores.get(q.dimension_code) || { total: 0, count: 0 };
      current.total += answer.normalizedScore;
      current.count++;
      dimensionScores.set(q.dimension_code, current);
    }
  });

  // Calcola risultati per dimensione
  const dimensionResults: DimensionResult[] = dimensions.map(dim => {
    const scores = dimensionScores.get(dim.code) || { total: 0, count: 0 };
    const maxScore = scores.count * SCALE_MAX;
    const percentage = scoreToPercentage(scores.total, maxScore);

    let interpretation = '';
    if (dim.category === 'radar') {
      interpretation = interpretRadar(scores.total);
    } else if (dim.category === 'sabotatore') {
      interpretation = interpretSabotatore(scores.total);
    } else {
      interpretation = interpretLivello(scores.total);
    }

    return {
      dimensionCode: dim.code,
      dimensionName: dim.name,
      category: dim.category as 'radar' | 'sabotatore' | 'livello',
      totalScore: scores.total,
      maxScore,
      percentage,
      color: dim.color,
      interpretation,
    };
  });

  // Separa per categoria
  const radar = dimensionResults.filter(d => d.category === 'radar');
  const sabotatori = dimensionResults.filter(d => d.category === 'sabotatore');
  const livelli = dimensionResults.filter(d => d.category === 'livello');

  // Calcola profilo
  const l1 = livelli.find(l => l.dimensionCode === 'L1');
  const l2 = livelli.find(l => l.dimensionCode === 'L2');
  const l3 = livelli.find(l => l.dimensionCode === 'L3');
  const profile = calculateProfile(
    l1?.totalScore || 0,
    l2?.totalScore || 0,
    l3?.totalScore || 0
  );

  // Overall percentage (media di tutte le dimensioni)
  const allDimensions = [...radar, ...sabotatori, ...livelli];
  const totalPercentage = allDimensions.reduce((sum, d) => sum + d.percentage, 0);
  const overallPercentage = Math.round(totalPercentage / allDimensions.length);

  return {
    dimensions: dimensionResults,
    radar,
    sabotatori,
    livelli,
    profile,
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
