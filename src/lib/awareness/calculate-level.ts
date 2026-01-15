/**
 * Calcolo Livello di Consapevolezza
 *
 * Calcola il livello basandosi su indicatori oggettivi:
 * - Challenge progress
 * - Assessment completion
 * - AI Coach engagement
 * - Exercise progress
 * - Subscription tier
 */

import {
  AwarenessIndicators,
  AwarenessResult,
  AwarenessZone,
  getLevelName,
  getZoneForLevel,
  getZoneInfo,
  AWARENESS_CONSTANTS,
} from './types';

// =====================================================
// CALCOLO LIVELLO PRINCIPALE
// =====================================================

export function calculateAwarenessLevel(indicators: AwarenessIndicators): AwarenessResult {
  let level: number = AWARENESS_CONSTANTS.DEFAULT_LEVEL; // -5 default
  const reasons: string[] = [];

  // FASE 1: Challenge (-7 → -1)
  // Entry point: -7 Rovina (percezione di rovina nella propria efficacia)
  // Progressione attraverso la Challenge fino a -1 Aiuto
  if (indicators.challengeStatus === 'active') {
    if (indicators.challengeDay >= 1 && indicators.challengeDay <= 2) {
      level = -6; // Effetto - inizia a vedere l'effetto della rovina
      reasons.push(`Challenge giorno ${indicators.challengeDay}: Effetto`);
    }
    if (indicators.challengeDay >= 3 && indicators.challengeDay <= 4) {
      level = -5; // Paura di Peggiorare
      reasons.push(`Challenge giorno ${indicators.challengeDay}: Paura di Peggiorare`);
    }
    if (indicators.challengeDay >= 5 && indicators.challengeDay <= 6) {
      level = -4; // Necessità di Cambiare
      reasons.push(`Challenge giorno ${indicators.challengeDay}: Necessità di Cambiare`);
    }
    if (indicators.challengeDay >= 7) {
      level = -1; // Aiuto - sente la possibilità di essere aiutato
      reasons.push('Challenge giorno 7: Aiuto');
    }
  }

  if (indicators.challengeStatus === 'completed') {
    level = Math.max(level, -1); // Aiuto
    if (indicators.challengeCompletionRate >= 0.7) {
      reasons.push(`Challenge completata (${Math.round(indicators.challengeCompletionRate * 100)}%): Aiuto`);
    }
  }

  // FASE 2: Assessment (1-2)
  // Assessment completato = Riconoscimento di sé
  if (indicators.assessmentCompleted) {
    level = Math.max(level, 1); // Riconoscimento
    reasons.push('Assessment completato: Riconoscimento');

    if (indicators.assessmentScore > 60) {
      level = Math.max(level, 2); // Comunicazione
      reasons.push(`Score assessment ${indicators.assessmentScore}%: Comunicazione`);
    }
  }

  // FASE 3: AI Coach (2-3)
  // Dialogo con Fernando = Comunicazione
  if (indicators.totalConversations > 0 && level >= 1) {
    level = Math.max(level, 2); // Comunicazione
    reasons.push(`${indicators.totalConversations} conversazioni AI: Comunicazione`);

    // Conversazioni regolari con buon feedback = Percezione
    if (
      indicators.totalConversations >= 3 &&
      indicators.avgRating !== null &&
      indicators.avgRating >= 4
    ) {
      level = Math.max(level, 3); // Percezione
      reasons.push(`Rating medio ${indicators.avgRating.toFixed(1)}: Percezione`);
    }

    // Engagement costante = Orientamento
    if (indicators.totalConversations >= 10 && indicators.lastConversationDaysAgo < 7) {
      level = Math.max(level, 4); // Orientamento
      reasons.push('Engagement AI costante: Orientamento');
    }
  }

  // FASE 4: Esercizi (3-15)
  // Pratica = Trasformazione
  if (indicators.exercisesCompleted > 0 && level >= 2) {
    const completionRatio =
      indicators.exercisesCompleted / Math.max(indicators.exercisesTotal, 52);

    // Progression based on completion
    if (completionRatio >= 0.05) {
      level = Math.max(level, 4); // Orientamento
      reasons.push(`${indicators.exercisesCompleted} esercizi completati: Orientamento`);
    }
    if (completionRatio >= 0.15) {
      level = Math.max(level, 5); // Comprensioni
      reasons.push('15% esercizi: Comprensioni');
    }
    if (completionRatio >= 0.25) {
      level = Math.max(level, 6); // Illuminazione
      reasons.push('25% esercizi: Illuminazione');
    }
    if (completionRatio >= 0.40) {
      level = Math.max(level, 8); // Aggiustamento
      reasons.push('40% esercizi: Aggiustamento');
    }
    if (completionRatio >= 0.55) {
      level = Math.max(level, 10); // Predizione
      reasons.push('55% esercizi: Predizione');
    }
    if (completionRatio >= 0.70) {
      level = Math.max(level, 12); // Produzione
      reasons.push('70% esercizi: Produzione');
    }
    if (completionRatio >= 0.85) {
      level = Math.max(level, 13); // Risultato
      reasons.push('85% esercizi: Risultato');
    }
    if (completionRatio >= 0.95) {
      level = Math.max(level, 14); // Correzione
      reasons.push('95% esercizi: Correzione');
    }

    // Bonus per difficoltà avanzata
    if (indicators.exerciseDifficultyMax === 'avanzato' && completionRatio >= 0.5) {
      level = Math.max(level, 14); // Correzione
      reasons.push('Esercizi avanzati completati: Correzione');
    }
  }

  // FASE 5: Subscription/Engagement (15-21)
  // Impegno a lungo termine = Padronanza
  if (indicators.subscriptionTier === 'mentor') {
    level = Math.max(level, 15); // Capacità
    reasons.push('Subscription Mentor: Capacità');
  }
  if (indicators.subscriptionTier === 'mastermind') {
    level = Math.max(level, 17); // Clearing
    reasons.push('Subscription Mastermind: Clearing');
  }
  if (indicators.subscriptionTier === 'partner_elite') {
    level = Math.max(level, 20); // Esistenza
    reasons.push('Partner Elite: Esistenza');
  }

  // Bonus per engagement costante
  if (indicators.returnRate >= 0.8 && indicators.daysActive >= 60 && level >= 10) {
    level = Math.min(level + 1, AWARENESS_CONSTANTS.MAX_LEVEL);
    reasons.push('Engagement eccezionale: +1 livello');
  }

  // Calcola score nel livello corrente
  const score = calculateScoreWithinLevel(level, indicators);

  // Genera hint per prossimo livello
  const nextLevelHint = generateNextLevelHint(level, indicators);

  // Determina zona
  const zone = getZoneForLevel(level);
  const zoneInfo = getZoneInfo(zone);

  return {
    level,
    levelName: getLevelName(level),
    score,
    zone,
    zoneName: zoneInfo.name,
    reasoning: reasons.join(' → '),
    nextLevelHint,
    calculatedAt: new Date(),
  };
}

// =====================================================
// SCORE NEL LIVELLO CORRENTE (0-100)
// =====================================================

function calculateScoreWithinLevel(level: number, indicators: AwarenessIndicators): number {
  // Lo score rappresenta il progresso verso il prossimo livello

  // Entry zone (-7 Rovina)
  if (level === -7) {
    // Appena entrato, progress = engagement iniziale nella Challenge
    return Math.min((indicators.daysActive / 2) * 100, 99);
  }

  // Challenge zone (-6 to -1)
  if (level === -6) {
    // Progress = primi giorni challenge
    return Math.min((indicators.challengeDay / 2) * 100, 99);
  }
  if (level === -5) {
    // Progress = giorni challenge 3-4
    return Math.min(((indicators.challengeDay - 2) / 2) * 100, 99);
  }
  if (level === -4) {
    // Progress = giorni challenge 5-6
    return Math.min(((indicators.challengeDay - 4) / 2) * 100, 99);
  }
  if (level === -1) {
    // Progress verso assessment (Aiuto -> Riconoscimento)
    return indicators.assessmentCompleted ? 99 : 50;
  }

  // Riconoscimento zone (1-6)
  if (level >= 1 && level <= 6) {
    const baseProgress = indicators.assessmentScore || 50;
    const aiBonus = Math.min(indicators.totalConversations * 5, 25);
    const exerciseBonus = Math.min(indicators.exercisesCompleted * 2, 25);
    return Math.min(baseProgress + aiBonus + exerciseBonus - (level - 1) * 15, 99);
  }

  // Trasformazione zone (7-14)
  if (level >= 7 && level <= 14) {
    const exerciseRatio = indicators.exercisesCompleted / Math.max(indicators.exercisesTotal, 52);
    const targetRatio = 0.3 + (level - 7) * 0.1; // 30% to 100%
    return Math.min((exerciseRatio / targetRatio) * 100, 99);
  }

  // Padronanza zone (15-21)
  if (level >= 15) {
    const exerciseRatio = indicators.exercisesCompleted / Math.max(indicators.exercisesTotal, 52);
    const engagementScore = (indicators.returnRate * 50) + (indicators.daysActive > 180 ? 50 : indicators.daysActive / 3.6);
    return Math.min((exerciseRatio * 50) + engagementScore, 99);
  }

  return 50; // Default
}

// =====================================================
// HINT PER PROSSIMO LIVELLO
// =====================================================

function generateNextLevelHint(level: number, indicators: AwarenessIndicators): string | undefined {
  // Entry zone
  if (level === -7) {
    return 'Inizia la Challenge gratuita dei 7 giorni';
  }

  // Challenge zone
  if (level === -6 || level === -5) {
    return 'Continua con i prossimi giorni della Challenge';
  }
  if (level === -4) {
    return 'Completa la Challenge per sentire la possibilità di essere aiutato';
  }
  if (level === -1) {
    if (!indicators.assessmentCompleted) {
      return 'Completa l\'Assessment per riconoscere le tue capacità';
    }
  }

  // Assessment/AI zone
  if (level === 1) {
    if (indicators.totalConversations === 0) {
      return 'Inizia una conversazione con Fernando, il tuo AI Coach';
    }
  }
  if (level === 2) {
    if (indicators.totalConversations < 3) {
      return 'Continua a dialogare con Fernando';
    }
    if (indicators.exercisesCompleted === 0) {
      return 'Inizia il primo esercizio settimanale';
    }
  }

  // Exercise zone
  if (level >= 3 && level <= 14) {
    const completionRatio = indicators.exercisesCompleted / Math.max(indicators.exercisesTotal, 52);
    if (completionRatio < 0.9) {
      return 'Continua con gli esercizi settimanali';
    }
    if (indicators.exerciseDifficultyMax !== 'avanzato') {
      return 'Prova gli esercizi di livello avanzato';
    }
  }

  // Subscription zone
  if (level >= 14 && level < 15) {
    if (indicators.subscriptionTier === 'leader') {
      return 'Considera il percorso Mentor per accesso esclusivo';
    }
  }

  if (level >= 21) {
    return undefined; // Massimo livello raggiunto
  }

  return 'Continua il tuo percorso di crescita';
}

// =====================================================
// EXPORT UTILITIES
// =====================================================

/**
 * Calcola rapidamente il livello senza tutti i dettagli
 * Utile per query veloci
 */
export function quickCalculateLevel(indicators: Partial<AwarenessIndicators>): number {
  // Default values per indicatori mancanti
  const fullIndicators: AwarenessIndicators = {
    challengeStatus: indicators.challengeStatus || 'none',
    challengeDay: indicators.challengeDay || 0,
    challengeCompletionRate: indicators.challengeCompletionRate || 0,
    assessmentCompleted: indicators.assessmentCompleted || false,
    assessmentScore: indicators.assessmentScore || 0,
    totalConversations: indicators.totalConversations || 0,
    avgRating: indicators.avgRating ?? null,
    lastConversationDaysAgo: indicators.lastConversationDaysAgo || 999,
    exercisesCompleted: indicators.exercisesCompleted || 0,
    exercisesTotal: indicators.exercisesTotal || 52,
    exerciseDifficultyMax: indicators.exerciseDifficultyMax || 'none',
    daysActive: indicators.daysActive || 0,
    returnRate: indicators.returnRate || 0,
    subscriptionTier: indicators.subscriptionTier || 'explorer',
  };

  return calculateAwarenessLevel(fullIndicators).level;
}

/**
 * Verifica se un utente può salire di livello
 */
export function canLevelUp(
  currentLevel: number,
  indicators: AwarenessIndicators
): { canLevel: boolean; blockers: string[] } {
  const calculated = calculateAwarenessLevel(indicators);
  const canLevel = calculated.level > currentLevel;
  const blockers: string[] = [];

  if (!canLevel && calculated.nextLevelHint) {
    blockers.push(calculated.nextLevelHint);
  }

  return { canLevel, blockers };
}
