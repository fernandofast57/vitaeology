/**
 * Exercise Recommendation Service
 *
 * Genera raccomandazioni personalizzate di esercizi basate sui risultati
 * dell'assessment dell'utente. Supporta tutti e 3 i percorsi:
 * - Leadership (LITE): 24 caratteristiche, 52 esercizi
 * - Risolutore (Ostacoli): 7 dimensioni, 24 esercizi
 * - Microfelicità: 13 dimensioni, 24 esercizi
 *
 * Prioritizza le aree con punteggi più bassi (GAP maggiori) e crea
 * un percorso sequenziale personalizzato di sviluppo.
 */

import { SupabaseClient } from '@supabase/supabase-js';

// ============================================================
// TYPES
// ============================================================

export type PathType = 'leadership' | 'risolutore' | 'microfelicita';

export interface DimensionScore {
  dimensionCode: string;
  dimensionName: string;
  score: number; // 0-100 percentuale
  pillar: string; // Mappato al pillar per matching esercizi
  category?: string; // Per Risolutore/Microfelicità: filtro, traditore, radar, sabotatore, etc.
}

// Manteniamo compatibilità con vecchio nome
export interface CharacteristicScore extends DimensionScore {
  characteristicSlug: string;
  characteristicName: string;
}

export interface ExerciseInfo {
  id: string;
  title: string;
  subtitle: string | null;
  week_number: number;
  characteristic_slug: string | null;
  pillar_primary: string | null;
  book_slug: string | null;
  exercise_type: string;
  difficulty_level: string;
  estimated_time_minutes: number;
  description: string;
}

export interface RecommendedExercise extends ExerciseInfo {
  priority: number;           // 1 = highest priority
  reason: string;             // Why this exercise is recommended
  dimensionScore: number;     // User's current score for this dimension
  dimensionName: string;
  pillar: string;
  isCompleted: boolean;
  isInProgress: boolean;
  // Manteniamo compatibilità
  characteristicScore: number;
  characteristicName: string;
}

export interface ExerciseRecommendation {
  userId: string;
  path: PathType;
  generatedAt: string;
  totalExercises: number;
  completedCount: number;
  recommendations: RecommendedExercise[];
  priorityAreas: {
    pillar: string;
    avgScore: number;
    exerciseCount: number;
  }[];
  nextRecommended: RecommendedExercise | null;
}

// ============================================================
// MAPPING DIMENSIONI → PILLAR PER ESERCIZI
// ============================================================

// Risolutore: dimensione assessment → pillar esercizio
const RISOLUTORE_DIMENSION_TO_PILLAR: Record<string, string> = {
  FP: 'PENSARE',  // Filtro Pattern → Detective dei Pattern
  FS: 'SENTIRE',  // Filtro Segnali → Antenna dei Segnali
  FR: 'AGIRE',    // Filtro Risorse → Radar delle Risorse
  TP: 'PENSARE',  // Traditore Paralizzante
  TT: 'SENTIRE',  // Traditore Timoroso
  TC: 'AGIRE',    // Traditore Procrastinatore
  SR: 'ESSERE',   // Scala Risolutore → Integrazione
};

// Microfelicità: dimensione assessment → pillar esercizio
const MICROFELICITA_DIMENSION_TO_PILLAR: Record<string, string> = {
  RR: 'SENTIRE',  // Rileva
  RA: 'ESSERE',   // Accogli
  RD: 'PENSARE',  // Distingui
  RM: 'SENTIRE',  // Amplifica
  RS: 'AGIRE',    // Resta
  SM: 'SENTIRE',  // Sabotatore Minimizzazione
  SA: 'PENSARE',  // Sabotatore Anticipo
  SI: 'SENTIRE',  // Sabotatore Auto-Interruzione
  SC: 'PENSARE',  // Sabotatore Cambio Fuoco
  SE: 'AGIRE',    // Sabotatore Correzione
  L1: 'ESSERE',   // Livello 1: Campo Interno
  L2: 'SENTIRE',  // Livello 2: Spazio Relazionale
  L3: 'PENSARE',  // Livello 3: Campo Contesti
};

// ============================================================
// SERVICE CLASS
// ============================================================

export class ExerciseRecommendationService {
  private supabase: SupabaseClient;
  private cache: Map<string, { data: ExerciseRecommendation; expiry: number }> = new Map();
  private CACHE_TTL = 5 * 60 * 1000; // 5 minuti

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Genera raccomandazioni personalizzate per un utente per un percorso specifico
   * @param userId ID utente
   * @param path Percorso: 'leadership' | 'risolutore' | 'microfelicita'
   */
  async generateRecommendations(
    userId: string,
    path?: PathType
  ): Promise<ExerciseRecommendation> {
    // Se non specificato, determina il percorso dall'ultimo assessment completato
    const detectedPath = path || await this.detectUserPath(userId);
    const cacheKey = `${userId}-${detectedPath}`;

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    // 1. Carica risultati assessment per il percorso
    const scores = await this.getUserAssessmentScores(userId, detectedPath);

    if (scores.length === 0) {
      return this.createEmptyRecommendation(userId, detectedPath);
    }

    // 2. Carica esercizi per il percorso
    const exercises = await this.getExercisesForPath(detectedPath);

    // 3. Carica progressi utente
    const progress = await this.getUserProgress(userId);

    // 4. Genera raccomandazioni ordinate
    const recommendations = this.calculateRecommendations(scores, exercises, progress, detectedPath);

    // 5. Calcola aree prioritarie per pillar
    const priorityAreas = this.calculatePriorityAreas(scores, exercises, detectedPath);

    // 6. Costruisci risultato
    const result: ExerciseRecommendation = {
      userId,
      path: detectedPath,
      generatedAt: new Date().toISOString(),
      totalExercises: exercises.length,
      completedCount: progress.filter(p => p.status === 'completed').length,
      recommendations,
      priorityAreas,
      nextRecommended: recommendations.find(r => !r.isCompleted && !r.isInProgress) || null
    };

    // Cache result
    this.cache.set(cacheKey, { data: result, expiry: Date.now() + this.CACHE_TTL });

    return result;
  }

  /**
   * Determina il percorso dell'utente dall'ultimo assessment completato
   */
  private async detectUserPath(userId: string): Promise<PathType> {
    // Controlla assessment Risolutore
    const { data: risolutore } = await this.supabase
      .from('risolutore_assessments')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Controlla assessment Microfelicità
    const { data: microfelicita } = await this.supabase
      .from('microfelicita_assessments')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Controlla assessment Leadership (LITE)
    const { data: leadership } = await this.supabase
      .from('user_assessments')
      .select('id, completed_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Ritorna l'ultimo completato (più recente vince)
    // Default a leadership se nessun assessment
    if (!risolutore && !microfelicita && !leadership) {
      return 'leadership';
    }

    // Logica semplificata: ritorna in base a quale esiste
    // In futuro si può aggiungere comparazione date
    if (risolutore) return 'risolutore';
    if (microfelicita) return 'microfelicita';
    return 'leadership';
  }

  /**
   * Recupera i punteggi dell'assessment più recente per il percorso specificato
   */
  private async getUserAssessmentScores(
    userId: string,
    path: PathType
  ): Promise<DimensionScore[]> {
    switch (path) {
      case 'risolutore':
        return this.getRisolutoreScores(userId);
      case 'microfelicita':
        return this.getMicrofelicitaScores(userId);
      case 'leadership':
      default:
        return this.getLeadershipScores(userId);
    }
  }

  /**
   * Punteggi assessment Leadership (LITE) - 24 caratteristiche
   */
  private async getLeadershipScores(userId: string): Promise<DimensionScore[]> {
    // Trova l'assessment completato più recente
    const { data: assessment } = await this.supabase
      .from('user_assessments')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    if (!assessment) {
      return [];
    }

    // Carica caratteristiche
    const { data: characteristics } = await this.supabase
      .from('characteristics')
      .select('id, slug, name_familiar, name_barrios, pillar')
      .eq('is_active', true);

    if (!characteristics) {
      return [];
    }

    // Carica risposte con domande
    const { data: answers } = await this.supabase
      .from('user_answers')
      .select(`
        question_id,
        points_earned,
        assessment_questions (
          characteristic_id
        )
      `)
      .eq('assessment_id', assessment.id);

    if (!answers) {
      return [];
    }

    // Calcola punteggi per caratteristica
    const scoresByChar: Record<number, { points: number; count: number }> = {};

    answers.forEach((answer: any) => {
      const charId = answer.assessment_questions?.characteristic_id;
      if (charId) {
        if (!scoresByChar[charId]) {
          scoresByChar[charId] = { points: 0, count: 0 };
        }
        scoresByChar[charId].points += answer.points_earned || 0;
        scoresByChar[charId].count += 1;
      }
    });

    // Costruisci array punteggi
    return characteristics.map((char: any) => {
      const scores = scoresByChar[char.id] || { points: 0, count: 0 };
      const maxScore = scores.count * 2;
      const percentage = maxScore > 0 ? Math.round((scores.points / maxScore) * 100) : 0;

      return {
        dimensionCode: char.slug,
        dimensionName: char.name_familiar || char.name_barrios,
        score: percentage,
        pillar: this.normalizePillar(char.pillar),
        // Compatibilità
        characteristicSlug: char.slug,
        characteristicName: char.name_familiar || char.name_barrios,
      } as DimensionScore;
    });
  }

  /**
   * Punteggi assessment Risolutore - 7 dimensioni (Filtri + Traditori + Scala)
   */
  private async getRisolutoreScores(userId: string): Promise<DimensionScore[]> {
    // Trova l'assessment completato più recente
    const { data: assessment } = await this.supabase
      .from('risolutore_assessments')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    if (!assessment) {
      return [];
    }

    // Carica dimensioni
    const { data: dimensions } = await this.supabase
      .from('risolutore_dimensions')
      .select('id, code, name, category')
      .order('sort_order');

    if (!dimensions) {
      return [];
    }

    // Carica risposte con domande
    const { data: answers } = await this.supabase
      .from('risolutore_answers')
      .select(`
        question_id,
        raw_score,
        normalized_score,
        risolutore_questions (
          dimension_code
        )
      `)
      .eq('assessment_id', assessment.id);

    if (!answers) {
      return [];
    }

    // Calcola punteggi per dimensione
    const scoresByDim: Record<string, { total: number; count: number }> = {};

    answers.forEach((answer: any) => {
      const dimCode = answer.risolutore_questions?.dimension_code;
      if (dimCode && dimCode !== 'SR') { // Escludi scala
        if (!scoresByDim[dimCode]) {
          scoresByDim[dimCode] = { total: 0, count: 0 };
        }
        scoresByDim[dimCode].total += answer.normalized_score || 0;
        scoresByDim[dimCode].count += 1;
      }
    });

    // Costruisci array punteggi
    return dimensions
      .filter(d => d.code !== 'SR') // Escludi scala dal matching esercizi
      .map((dim: any) => {
        const scores = scoresByDim[dim.code] || { total: 0, count: 0 };
        const maxScore = scores.count * 2; // Max 2 per domanda
        const percentage = maxScore > 0 ? Math.round((scores.total / maxScore) * 100) : 0;

        return {
          dimensionCode: dim.code,
          dimensionName: dim.name,
          score: percentage,
          pillar: RISOLUTORE_DIMENSION_TO_PILLAR[dim.code] || 'ESSERE',
          category: dim.category,
          // Compatibilità
          characteristicSlug: dim.code,
          characteristicName: dim.name,
        } as DimensionScore;
      });
  }

  /**
   * Punteggi assessment Microfelicità - 13 dimensioni (RADAR + Sabotatori + Livelli)
   */
  private async getMicrofelicitaScores(userId: string): Promise<DimensionScore[]> {
    // Trova l'assessment completato più recente
    const { data: assessment } = await this.supabase
      .from('microfelicita_assessments')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    if (!assessment) {
      return [];
    }

    // Carica dimensioni
    const { data: dimensions } = await this.supabase
      .from('microfelicita_dimensions')
      .select('id, code, name, category')
      .order('sort_order');

    if (!dimensions) {
      return [];
    }

    // Carica risposte con domande
    const { data: answers } = await this.supabase
      .from('microfelicita_answers')
      .select(`
        question_id,
        raw_score,
        normalized_score,
        microfelicita_questions (
          dimension_code
        )
      `)
      .eq('assessment_id', assessment.id);

    if (!answers) {
      return [];
    }

    // Calcola punteggi per dimensione
    const scoresByDim: Record<string, { total: number; count: number }> = {};

    answers.forEach((answer: any) => {
      const dimCode = answer.microfelicita_questions?.dimension_code;
      if (dimCode) {
        if (!scoresByDim[dimCode]) {
          scoresByDim[dimCode] = { total: 0, count: 0 };
        }
        scoresByDim[dimCode].total += answer.normalized_score || 0;
        scoresByDim[dimCode].count += 1;
      }
    });

    // Costruisci array punteggi
    return dimensions.map((dim: any) => {
      const scores = scoresByDim[dim.code] || { total: 0, count: 0 };
      const maxScore = scores.count * 2; // Max 2 per domanda
      const percentage = maxScore > 0 ? Math.round((scores.total / maxScore) * 100) : 0;

      return {
        dimensionCode: dim.code,
        dimensionName: dim.name,
        score: percentage,
        pillar: MICROFELICITA_DIMENSION_TO_PILLAR[dim.code] || 'SENTIRE',
        category: dim.category,
        // Compatibilità
        characteristicSlug: dim.code,
        characteristicName: dim.name,
      } as DimensionScore;
    });
  }

  /**
   * Carica esercizi per un percorso specifico
   */
  private async getExercisesForPath(path: PathType): Promise<ExerciseInfo[]> {
    const bookSlug = this.pathToBookSlug(path);

    const { data } = await this.supabase
      .from('exercises')
      .select(`
        id,
        title,
        subtitle,
        week_number,
        characteristic_slug,
        pillar_primary,
        book_slug,
        exercise_type,
        difficulty_level,
        estimated_time_minutes,
        description
      `)
      .eq('is_active', true)
      .eq('book_slug', bookSlug)
      .order('week_number', { ascending: true });

    return data || [];
  }

  /**
   * Mappa percorso → book_slug
   */
  private pathToBookSlug(path: PathType): string {
    switch (path) {
      case 'risolutore': return 'risolutore';
      case 'microfelicita': return 'microfelicita';
      case 'leadership':
      default: return 'leadership';
    }
  }

  /**
   * Carica progressi esercizi utente
   */
  private async getUserProgress(userId: string): Promise<{ exercise_id: string; status: string }[]> {
    const { data } = await this.supabase
      .from('user_exercise_progress')
      .select('exercise_id, status')
      .eq('user_id', userId);

    return data || [];
  }

  /**
   * Calcola raccomandazioni ordinate per priorità
   *
   * Per Leadership: match by characteristic_slug
   * Per Risolutore/Microfelicità: match by pillar_primary (mappato da dimensione)
   */
  private calculateRecommendations(
    scores: DimensionScore[],
    exercises: ExerciseInfo[],
    progress: { exercise_id: string; status: string }[],
    path: PathType
  ): RecommendedExercise[] {
    const progressMap = new Map(progress.map(p => [p.exercise_id, p.status]));

    // Ordina dimensioni per punteggio (dal più basso = GAP maggiore)
    const sortedScores = [...scores].sort((a, b) => a.score - b.score);

    // Per Leadership: mappa caratteristica → score
    // Per Risolutore/Microfelicità: mappa pillar → scores (può esserci più di una dimensione per pillar)
    const isLeadership = path === 'leadership';

    // Crea mappa per matching
    let scoreMap: Map<string, DimensionScore>;
    let pillarToLowestScore: Map<string, DimensionScore>;

    if (isLeadership) {
      // Leadership: match diretto per characteristic_slug
      scoreMap = new Map(scores.map(s => [s.dimensionCode, s]));
      pillarToLowestScore = new Map();
    } else {
      // Risolutore/Microfelicità: raggruppa per pillar, usa il punteggio più basso
      scoreMap = new Map();
      pillarToLowestScore = new Map();

      sortedScores.forEach(s => {
        const pillar = s.pillar;
        if (!pillarToLowestScore.has(pillar)) {
          pillarToLowestScore.set(pillar, s); // Il primo (punteggio più basso) vince
        }
      });
    }

    // Assegna priorità agli esercizi
    const recommendations: RecommendedExercise[] = [];

    exercises.forEach(exercise => {
      let matchedScore: DimensionScore | undefined;
      let pillarForExercise: string;

      if (isLeadership && exercise.characteristic_slug) {
        // Leadership: match per characteristic_slug
        matchedScore = scoreMap.get(exercise.characteristic_slug);
        pillarForExercise = matchedScore?.pillar || 'Vision';
      } else if (exercise.pillar_primary) {
        // Risolutore/Microfelicità: match per pillar_primary
        pillarForExercise = exercise.pillar_primary.toUpperCase();
        matchedScore = pillarToLowestScore.get(pillarForExercise);
      } else {
        // Nessun match possibile
        return;
      }

      if (!matchedScore) {
        // Esercizio senza match - assegna priorità bassa
        const status = progressMap.get(exercise.id);
        recommendations.push({
          ...exercise,
          priority: 999,
          reason: 'Esercizio di base per il percorso',
          dimensionScore: 50,
          dimensionName: 'Generale',
          characteristicScore: 50,
          characteristicName: 'Generale',
          pillar: pillarForExercise || 'ESSERE',
          isCompleted: status === 'completed',
          isInProgress: status === 'in_progress',
        });
        return;
      }

      // Calcola priorità basata su:
      // 1. Punteggio dimensione (più basso = più prioritario)
      // 2. Difficoltà esercizio (base prima)
      // 3. Settimana (progressione naturale)

      const scoreRank = sortedScores.findIndex(s =>
        isLeadership
          ? s.dimensionCode === exercise.characteristic_slug
          : s.pillar === pillarForExercise
      );
      const difficultyWeight = this.getDifficultyWeight(exercise.difficulty_level);

      // Priority formula: lower = better
      const priority = (scoreRank >= 0 ? scoreRank * 10 : 50) + difficultyWeight + (exercise.week_number * 0.1);

      const status = progressMap.get(exercise.id);
      const isCompleted = status === 'completed';
      const isInProgress = status === 'in_progress';

      // Genera reason basato sul punteggio
      const reason = this.generateReason(matchedScore.score, matchedScore.dimensionName);

      recommendations.push({
        ...exercise,
        priority: Math.round(priority),
        reason,
        dimensionScore: matchedScore.score,
        dimensionName: matchedScore.dimensionName,
        characteristicScore: matchedScore.score, // Compatibilità
        characteristicName: matchedScore.dimensionName, // Compatibilità
        pillar: matchedScore.pillar,
        isCompleted,
        isInProgress
      });
    });

    // Ordina per priorità (e metti completati alla fine)
    return recommendations.sort((a, b) => {
      // Completati alla fine
      if (a.isCompleted && !b.isCompleted) return 1;
      if (!a.isCompleted && b.isCompleted) return -1;

      // In progress prima dei non iniziati
      if (a.isInProgress && !b.isInProgress && !b.isCompleted) return -1;
      if (!a.isInProgress && b.isInProgress && !a.isCompleted) return 1;

      // Altrimenti per priorità
      return a.priority - b.priority;
    });
  }

  /**
   * Calcola aree prioritarie per pillar
   */
  private calculatePriorityAreas(
    scores: DimensionScore[],
    exercises: ExerciseInfo[],
    path: PathType
  ): { pillar: string; avgScore: number; exerciseCount: number }[] {
    // I pillar per Risolutore/Microfelicità sono in italiano (PENSARE, SENTIRE, AGIRE, ESSERE)
    // Per Leadership sono in inglese (Vision, Action, Relations, Adaptation)
    const isLeadership = path === 'leadership';

    const pillarData: Record<string, { scores: number[]; exercises: Set<string> }> = isLeadership
      ? {
          'Vision': { scores: [], exercises: new Set() },
          'Action': { scores: [], exercises: new Set() },
          'Relations': { scores: [], exercises: new Set() },
          'Adaptation': { scores: [], exercises: new Set() }
        }
      : {
          'ESSERE': { scores: [], exercises: new Set() },
          'PENSARE': { scores: [], exercises: new Set() },
          'SENTIRE': { scores: [], exercises: new Set() },
          'AGIRE': { scores: [], exercises: new Set() }
        };

    // Raggruppa punteggi per pillar
    scores.forEach(score => {
      const pillar = isLeadership ? this.normalizePillar(score.pillar) : score.pillar;
      if (pillarData[pillar]) {
        pillarData[pillar].scores.push(score.score);
      }
    });

    // Conta esercizi per pillar
    if (isLeadership) {
      // Leadership: tramite characteristic_slug → pillar
      const charToPillar = new Map(scores.map(s => [s.dimensionCode, s.pillar]));
      exercises.forEach(ex => {
        if (ex.characteristic_slug) {
          const pillar = charToPillar.get(ex.characteristic_slug);
          if (pillar && pillarData[pillar]) {
            pillarData[pillar].exercises.add(ex.id);
          }
        }
      });
    } else {
      // Risolutore/Microfelicità: direttamente da pillar_primary
      exercises.forEach(ex => {
        if (ex.pillar_primary) {
          const pillar = ex.pillar_primary.toUpperCase();
          if (pillarData[pillar]) {
            pillarData[pillar].exercises.add(ex.id);
          }
        }
      });
    }

    // Costruisci risultato ordinato per media punteggio (più basso prima)
    return Object.entries(pillarData)
      .map(([pillar, data]) => ({
        pillar,
        avgScore: data.scores.length > 0
          ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
          : 0,
        exerciseCount: data.exercises.size
      }))
      .sort((a, b) => a.avgScore - b.avgScore);
  }

  /**
   * Genera una reason personalizzata
   */
  private generateReason(score: number, characteristicName: string): string {
    if (score <= 20) {
      return `Area prioritaria: ${characteristicName} è un'opportunità chiave di espansione`;
    } else if (score <= 40) {
      return `${characteristicName} può essere significativamente potenziata`;
    } else if (score <= 60) {
      return `Rafforza ${characteristicName} per consolidare la tua leadership`;
    } else if (score <= 80) {
      return `${characteristicName} è già forte, questo esercizio la perfeziona`;
    } else {
      return `Mantieni l'eccellenza in ${characteristicName}`;
    }
  }

  /**
   * Peso difficoltà per ordinamento
   */
  private getDifficultyWeight(level: string): number {
    switch (level) {
      case 'base': return 0;
      case 'intermedio': return 5;
      case 'avanzato': return 10;
      default: return 5;
    }
  }

  /**
   * Normalizza nome pillar
   */
  private normalizePillar(pillar: string): string {
    const mapping: Record<string, string> = {
      'VISIONE': 'Vision',
      'AZIONE': 'Action',
      'RELAZIONI': 'Relations',
      'ADATTAMENTO': 'Adaptation',
      'VISION': 'Vision',
      'ACTION': 'Action',
      'RELATIONS': 'Relations',
      'ADAPTATION': 'Adaptation'
    };
    return mapping[pillar?.toUpperCase()] || pillar;
  }

  /**
   * Crea raccomandazione vuota (no assessment)
   */
  private createEmptyRecommendation(userId: string, path: PathType): ExerciseRecommendation {
    return {
      userId,
      path,
      generatedAt: new Date().toISOString(),
      totalExercises: 0,
      completedCount: 0,
      recommendations: [],
      priorityAreas: [],
      nextRecommended: null
    };
  }

  /**
   * Genera contesto per l'AI Coach per un percorso specifico
   */
  async generateAICoachContext(userId: string, path?: PathType): Promise<string> {
    const recommendation = await this.generateRecommendations(userId, path);

    if (recommendation.recommendations.length === 0) {
      const pathName = this.getPathDisplayName(recommendation.path);
      return `\n\n## ESERCIZI\nL'utente non ha ancora completato l'assessment ${pathName}. Suggerisci di completare prima il test per ottenere raccomandazioni personalizzate.`;
    }

    const pathName = this.getPathDisplayName(recommendation.path);
    let context = `\n\n---\n## ESERCIZI RACCOMANDATI - ${pathName}\n`;
    context += `Progresso: ${recommendation.completedCount}/${recommendation.totalExercises} esercizi completati.\n\n`;

    // Aree prioritarie
    context += '### Aree Prioritarie (dal punteggio più basso):\n';
    recommendation.priorityAreas.forEach((area, idx) => {
      context += `${idx + 1}. ${area.pillar}: ${area.avgScore}% (${area.exerciseCount} esercizi disponibili)\n`;
    });

    // Top 5 esercizi raccomandati non completati
    const topRecommendations = recommendation.recommendations
      .filter(r => !r.isCompleted)
      .slice(0, 5);

    if (topRecommendations.length > 0) {
      context += '\n### Esercizi Consigliati (in ordine di priorità):\n';
      topRecommendations.forEach((rec, idx) => {
        const status = rec.isInProgress ? ' [IN CORSO]' : '';
        context += `\n${idx + 1}. **${rec.title}**${status}\n`;
        context += `   - Area: ${rec.dimensionName} (${rec.dimensionScore}%)\n`;
        context += `   - Pillar: ${rec.pillar}\n`;
        context += `   - Tipo: ${rec.exercise_type || 'pratico'}, Difficoltà: ${rec.difficulty_level}\n`;
        context += `   - Tempo stimato: ${rec.estimated_time_minutes} minuti\n`;
        context += `   - Motivo: ${rec.reason}\n`;
      });
    }

    // Prossimo esercizio consigliato
    if (recommendation.nextRecommended) {
      context += '\n### Prossimo Esercizio Consigliato:\n';
      context += `Suggerisci "${recommendation.nextRecommended.title}" per lavorare su ${recommendation.nextRecommended.dimensionName}.\n`;
    }

    context += '\n---\n';
    context += 'ISTRUZIONI: Quando l\'utente chiede un programma o quali esercizi fare, usa queste raccomandazioni. ';
    context += 'Proponi gli esercizi in sequenza, partendo dalle aree prioritarie. ';
    context += 'Spiega brevemente perché ogni esercizio è importante per il suo sviluppo.\n';

    return context;
  }

  /**
   * Genera contesto AI Coach per TUTTI i percorsi (per utenti Mentor)
   */
  async generateAICoachContextAllPaths(userId: string): Promise<string> {
    const paths: PathType[] = ['leadership', 'risolutore', 'microfelicita'];
    const contexts: string[] = [];

    for (const path of paths) {
      const recommendation = await this.generateRecommendations(userId, path);
      if (recommendation.recommendations.length > 0) {
        const pathName = this.getPathDisplayName(path);
        let context = `\n### ${pathName}\n`;
        context += `Progresso: ${recommendation.completedCount}/${recommendation.totalExercises}\n`;

        // Top 3 per questo percorso
        const top3 = recommendation.recommendations
          .filter(r => !r.isCompleted)
          .slice(0, 3);

        if (top3.length > 0) {
          top3.forEach((rec, idx) => {
            context += `${idx + 1}. ${rec.title} (${rec.dimensionName}: ${rec.dimensionScore}%)\n`;
          });
        }
        contexts.push(context);
      }
    }

    if (contexts.length === 0) {
      return '\n\n## ESERCIZI\nNessun assessment completato. Suggerisci di iniziare con uno dei 3 percorsi.';
    }

    let fullContext = '\n\n---\n## ESERCIZI RACCOMANDATI (Tutti i Percorsi)\n';
    fullContext += contexts.join('\n');
    fullContext += '\n---\n';

    return fullContext;
  }

  /**
   * Nome leggibile del percorso
   */
  private getPathDisplayName(path: PathType): string {
    switch (path) {
      case 'risolutore': return 'Oltre gli Ostacoli';
      case 'microfelicita': return 'Microfelicità';
      case 'leadership':
      default: return 'Leadership Autentica';
    }
  }

  /**
   * Invalida cache per un utente (tutti i percorsi)
   */
  invalidateCache(userId: string): void {
    // Invalida tutte le chiavi cache per questo utente
    const paths: PathType[] = ['leadership', 'risolutore', 'microfelicita'];
    paths.forEach(path => {
      this.cache.delete(`${userId}-${path}`);
    });
  }

  /**
   * Invalida cache per un utente e percorso specifico
   */
  invalidateCacheForPath(userId: string, path: PathType): void {
    this.cache.delete(`${userId}-${path}`);
  }
}

// Factory function
export function createExerciseRecommendationService(supabase: SupabaseClient): ExerciseRecommendationService {
  return new ExerciseRecommendationService(supabase);
}
