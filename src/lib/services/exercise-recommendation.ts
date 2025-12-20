/**
 * Exercise Recommendation Service
 *
 * Genera raccomandazioni personalizzate di esercizi basate sui risultati
 * dell'assessment dell'utente. Prioritizza le caratteristiche con punteggi
 * più bassi e crea un percorso sequenziale di sviluppo.
 */

import { SupabaseClient } from '@supabase/supabase-js';

// ============================================================
// TYPES
// ============================================================

export interface CharacteristicScore {
  characteristicSlug: string;
  characteristicName: string;
  score: number;
  pillar: string;
}

export interface ExerciseInfo {
  id: string;
  title: string;
  subtitle: string | null;
  week_number: number;
  characteristic_slug: string;
  exercise_type: string;
  difficulty_level: string;
  estimated_time_minutes: number;
  description: string;
}

export interface RecommendedExercise extends ExerciseInfo {
  priority: number;           // 1 = highest priority
  reason: string;             // Why this exercise is recommended
  characteristicScore: number; // User's current score for this characteristic
  characteristicName: string;
  pillar: string;
  isCompleted: boolean;
  isInProgress: boolean;
}

export interface ExerciseRecommendation {
  userId: string;
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
   * Genera raccomandazioni personalizzate per un utente
   */
  async generateRecommendations(userId: string): Promise<ExerciseRecommendation> {
    // Check cache
    const cached = this.cache.get(userId);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    // 1. Carica risultati assessment
    const scores = await this.getUserAssessmentScores(userId);

    if (scores.length === 0) {
      return this.createEmptyRecommendation(userId);
    }

    // 2. Carica tutti gli esercizi
    const exercises = await this.getAllExercises();

    // 3. Carica progressi utente
    const progress = await this.getUserProgress(userId);

    // 4. Genera raccomandazioni ordinate
    const recommendations = this.calculateRecommendations(scores, exercises, progress);

    // 5. Calcola aree prioritarie per pillar
    const priorityAreas = this.calculatePriorityAreas(scores, exercises);

    // 6. Costruisci risultato
    const result: ExerciseRecommendation = {
      userId,
      generatedAt: new Date().toISOString(),
      totalExercises: exercises.length,
      completedCount: progress.filter(p => p.status === 'completed').length,
      recommendations,
      priorityAreas,
      nextRecommended: recommendations.find(r => !r.isCompleted && !r.isInProgress) || null
    };

    // Cache result
    this.cache.set(userId, { data: result, expiry: Date.now() + this.CACHE_TTL });

    return result;
  }

  /**
   * Recupera i punteggi dell'assessment più recente
   */
  private async getUserAssessmentScores(userId: string): Promise<CharacteristicScore[]> {
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
        characteristicSlug: char.slug,
        characteristicName: char.name_familiar || char.name_barrios,
        score: percentage,
        pillar: this.normalizePillar(char.pillar)
      };
    });
  }

  /**
   * Carica tutti gli esercizi attivi
   */
  private async getAllExercises(): Promise<ExerciseInfo[]> {
    const { data } = await this.supabase
      .from('exercises')
      .select(`
        id,
        title,
        subtitle,
        week_number,
        characteristic_slug,
        exercise_type,
        difficulty_level,
        estimated_time_minutes,
        description
      `)
      .eq('is_active', true)
      .order('week_number', { ascending: true });

    return data || [];
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
   */
  private calculateRecommendations(
    scores: CharacteristicScore[],
    exercises: ExerciseInfo[],
    progress: { exercise_id: string; status: string }[]
  ): RecommendedExercise[] {
    const progressMap = new Map(progress.map(p => [p.exercise_id, p.status]));

    // Crea mappa caratteristiche -> punteggi
    const scoreMap = new Map(scores.map(s => [s.characteristicSlug, s]));

    // Ordina caratteristiche per punteggio (dal più basso)
    const sortedScores = [...scores].sort((a, b) => a.score - b.score);

    // Assegna priorità agli esercizi
    const recommendations: RecommendedExercise[] = [];

    exercises.forEach(exercise => {
      const charScore = scoreMap.get(exercise.characteristic_slug);

      if (!charScore) {
        // Esercizio senza match caratteristica
        return;
      }

      // Calcola priorità basata su:
      // 1. Punteggio caratteristica (più basso = più prioritario)
      // 2. Difficoltà esercizio (base prima)
      // 3. Settimana (progressione naturale)

      const scoreRank = sortedScores.findIndex(s => s.characteristicSlug === exercise.characteristic_slug);
      const difficultyWeight = this.getDifficultyWeight(exercise.difficulty_level);

      // Priority formula: lower = better
      const priority = (scoreRank * 10) + difficultyWeight + (exercise.week_number * 0.1);

      const status = progressMap.get(exercise.id);
      const isCompleted = status === 'completed';
      const isInProgress = status === 'in_progress';

      // Genera reason basato sul punteggio
      const reason = this.generateReason(charScore.score, charScore.characteristicName);

      recommendations.push({
        ...exercise,
        priority: Math.round(priority),
        reason,
        characteristicScore: charScore.score,
        characteristicName: charScore.characteristicName,
        pillar: charScore.pillar,
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
    scores: CharacteristicScore[],
    exercises: ExerciseInfo[]
  ): { pillar: string; avgScore: number; exerciseCount: number }[] {
    const pillarData: Record<string, { scores: number[]; exercises: Set<string> }> = {
      'Vision': { scores: [], exercises: new Set() },
      'Action': { scores: [], exercises: new Set() },
      'Relations': { scores: [], exercises: new Set() },
      'Adaptation': { scores: [], exercises: new Set() }
    };

    // Raggruppa punteggi per pillar
    scores.forEach(score => {
      const pillar = this.normalizePillar(score.pillar);
      if (pillarData[pillar]) {
        pillarData[pillar].scores.push(score.score);
      }
    });

    // Conta esercizi per pillar (tramite caratteristica)
    const charToPillar = new Map(scores.map(s => [s.characteristicSlug, s.pillar]));
    exercises.forEach(ex => {
      const pillar = charToPillar.get(ex.characteristic_slug);
      if (pillar && pillarData[pillar]) {
        pillarData[pillar].exercises.add(ex.id);
      }
    });

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
  private createEmptyRecommendation(userId: string): ExerciseRecommendation {
    return {
      userId,
      generatedAt: new Date().toISOString(),
      totalExercises: 0,
      completedCount: 0,
      recommendations: [],
      priorityAreas: [],
      nextRecommended: null
    };
  }

  /**
   * Genera contesto per l'AI Coach
   */
  async generateAICoachContext(userId: string): Promise<string> {
    const recommendation = await this.generateRecommendations(userId);

    if (recommendation.recommendations.length === 0) {
      return '\n\n## ESERCIZI\nL\'utente non ha ancora completato l\'assessment. Suggerisci di completare prima il test per ottenere raccomandazioni personalizzate.';
    }

    let context = '\n\n---\n## ESERCIZI RACCOMANDATI\n';
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
        context += `   - Caratteristica: ${rec.characteristicName} (${rec.characteristicScore}%)\n`;
        context += `   - Pillar: ${rec.pillar}\n`;
        context += `   - Tipo: ${rec.exercise_type}, Difficoltà: ${rec.difficulty_level}\n`;
        context += `   - Tempo stimato: ${rec.estimated_time_minutes} minuti\n`;
        context += `   - Motivo: ${rec.reason}\n`;
      });
    }

    // Prossimo esercizio consigliato
    if (recommendation.nextRecommended) {
      context += '\n### Prossimo Esercizio Consigliato:\n';
      context += `Suggerisci "${recommendation.nextRecommended.title}" per lavorare su ${recommendation.nextRecommended.characteristicName}.\n`;
    }

    context += '\n---\n';
    context += 'ISTRUZIONI: Quando l\'utente chiede un programma o quali esercizi fare, usa queste raccomandazioni. ';
    context += 'Proponi gli esercizi in sequenza, partendo dalle aree prioritarie. ';
    context += 'Spiega brevemente perché ogni esercizio è importante per il suo sviluppo.\n';

    return context;
  }

  /**
   * Invalida cache per un utente
   */
  invalidateCache(userId: string): void {
    this.cache.delete(userId);
  }
}

// Factory function
export function createExerciseRecommendationService(supabase: SupabaseClient): ExerciseRecommendationService {
  return new ExerciseRecommendationService(supabase);
}
