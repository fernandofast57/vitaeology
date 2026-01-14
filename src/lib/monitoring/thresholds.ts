/**
 * Soglie per il Sistema di Monitoraggio 4P×3F
 *
 * Ogni prodotto ha 3 fattori: Quantità, Qualità, Viability
 * Ogni fattore può avere soglie warning e critical
 */

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface ThresholdConfig {
  metricName: string;
  warningThreshold: number;
  criticalThreshold: number;
  comparison: 'gt' | 'lt' | 'eq'; // greater than, less than, equal
  description: string;
}

// =====================================================
// P1: SISTEMA (Istituzione di ciò che produce)
// =====================================================

export const P1_THRESHOLDS: Record<string, ThresholdConfig> = {
  // Quantità: Servizi attivi
  services_active: {
    metricName: 'p1_quantity_services_active',
    warningThreshold: 5,        // Warning se < 5 servizi
    criticalThreshold: 4,       // Critical se < 4 servizi
    comparison: 'lt',
    description: 'Numero di servizi esterni attivi (max 6)'
  },

  // Qualità: Uptime percentuale
  uptime_percent: {
    metricName: 'p1_quality_uptime_percent',
    warningThreshold: 99.5,     // Warning se < 99.5%
    criticalThreshold: 98,      // Critical se < 98%
    comparison: 'lt',
    description: 'Percentuale uptime nelle ultime 24h'
  },

  // Viability: Costo API giornaliero
  api_cost_daily: {
    metricName: 'p1_viability_api_cost_eur',
    warningThreshold: 5,        // Warning se > €5/giorno
    criticalThreshold: 15,      // Critical se > €15/giorno
    comparison: 'gt',
    description: 'Costo API giornaliero in EUR'
  },

  // Viability: Latenza media
  avg_latency: {
    metricName: 'p1_viability_avg_latency_ms',
    warningThreshold: 2000,     // Warning se > 2s
    criticalThreshold: 5000,    // Critical se > 5s
    comparison: 'gt',
    description: 'Latenza media risposta API in ms'
  }
};

// =====================================================
// P2: OUTPUT (Prodotto generato - trasformazione utente)
// =====================================================

export const P2_THRESHOLDS: Record<string, ThresholdConfig> = {
  // Qualità: Rating medio AI Coach
  avg_rating: {
    metricName: 'p2_quality_avg_rating',
    warningThreshold: 3.5,      // Warning se < 3.5
    criticalThreshold: 3.0,     // Critical se < 3.0
    comparison: 'lt',
    description: 'Rating medio conversazioni AI Coach (1-5)'
  },

  // Qualità: Tasso completamento esercizi
  completion_rate: {
    metricName: 'p2_quality_completion_rate',
    warningThreshold: 50,       // Warning se < 50%
    criticalThreshold: 30,      // Critical se < 30%
    comparison: 'lt',
    description: 'Percentuale esercizi completati'
  },

  // Viability: Retention utenti (7 giorni)
  user_retention: {
    metricName: 'p2_viability_user_retention',
    warningThreshold: 40,       // Warning se < 40%
    criticalThreshold: 20,      // Critical se < 20%
    comparison: 'lt',
    description: 'Percentuale utenti che ritornano entro 7 giorni'
  },

  // Viability: Conversione challenge→assessment
  challenge_conversion: {
    metricName: 'p2_viability_challenge_conversion',
    warningThreshold: 20,       // Warning se < 20%
    criticalThreshold: 10,      // Critical se < 10%
    comparison: 'lt',
    description: 'Percentuale challenge completate che portano ad assessment'
  }
};

// =====================================================
// P3: MANUTENZIONE (Riparazione di ciò che produce)
// =====================================================

export const P3_THRESHOLDS: Record<string, ThresholdConfig> = {
  // Viability: Mean Time To Recovery
  mttr_hours: {
    metricName: 'p3_viability_mttr_hours',
    warningThreshold: 4,        // Warning se > 4 ore
    criticalThreshold: 12,      // Critical se > 12 ore
    comparison: 'gt',
    description: 'Tempo medio per risolvere un problema (ore)'
  },

  // Qualità: Efficacia fix
  fix_effectiveness: {
    metricName: 'p3_quality_fix_effectiveness',
    warningThreshold: 80,       // Warning se < 80%
    criticalThreshold: 60,      // Critical se < 60%
    comparison: 'lt',
    description: 'Percentuale fix che risolvono definitivamente'
  }
};

// =====================================================
// P4: CORREZIONE (AI Coach - correzione del prodotto)
// =====================================================

export const P4_THRESHOLDS: Record<string, ThresholdConfig> = {
  // Quantità: Pattern in attesa
  patterns_pending: {
    metricName: 'p4_quantity_patterns_detected',
    warningThreshold: 10,       // Warning se > 10 pattern pending
    criticalThreshold: 25,      // Critical se > 25 pattern pending
    comparison: 'gt',
    description: 'Pattern identificati in attesa di correzione'
  },

  // Qualità: Efficacia correzioni
  correction_effectiveness: {
    metricName: 'p4_quality_correction_effectiveness',
    warningThreshold: 70,       // Warning se < 70%
    criticalThreshold: 50,      // Critical se < 50%
    comparison: 'lt',
    description: 'Percentuale correzioni che migliorano il rating'
  },

  // Viability: Tasso prevenzione
  prevention_rate: {
    metricName: 'p4_viability_prevention_rate',
    warningThreshold: 60,       // Warning se < 60%
    criticalThreshold: 40,      // Critical se < 40%
    comparison: 'lt',
    description: 'Percentuale pattern prevenuti vs rilevati'
  }
};

// =====================================================
// HELPER: Valuta se una metrica supera la soglia
// =====================================================

export function evaluateThreshold(
  value: number | null,
  config: ThresholdConfig
): { severity: AlertSeverity; triggered: boolean } {
  if (value === null || value === undefined) {
    return { severity: 'info', triggered: false };
  }

  const { warningThreshold, criticalThreshold, comparison } = config;

  let isCritical = false;
  let isWarning = false;

  switch (comparison) {
    case 'gt':
      isCritical = value > criticalThreshold;
      isWarning = value > warningThreshold && !isCritical;
      break;
    case 'lt':
      isCritical = value < criticalThreshold;
      isWarning = value < warningThreshold && !isCritical;
      break;
    case 'eq':
      isCritical = value === criticalThreshold;
      isWarning = value === warningThreshold && !isCritical;
      break;
  }

  if (isCritical) {
    return { severity: 'critical', triggered: true };
  }
  if (isWarning) {
    return { severity: 'warning', triggered: true };
  }
  return { severity: 'info', triggered: false };
}

// =====================================================
// HELPER: Valuta tutte le soglie di un prodotto
// =====================================================

export interface ThresholdResult {
  metricName: string;
  value: number | null;
  threshold: number;
  severity: AlertSeverity;
  triggered: boolean;
  description: string;
}

export function evaluateProductThresholds(
  metrics: Record<string, number | null>,
  thresholds: Record<string, ThresholdConfig>
): ThresholdResult[] {
  const results: ThresholdResult[] = [];

  for (const [key, config] of Object.entries(thresholds)) {
    const value = metrics[config.metricName] ?? null;
    const evaluation = evaluateThreshold(value, config);

    results.push({
      metricName: config.metricName,
      value,
      threshold: evaluation.severity === 'critical'
        ? config.criticalThreshold
        : config.warningThreshold,
      severity: evaluation.severity,
      triggered: evaluation.triggered,
      description: config.description
    });
  }

  return results;
}

// =====================================================
// EXPORT: Tutte le soglie raggruppate
// =====================================================

export const ALL_THRESHOLDS = {
  P1: P1_THRESHOLDS,
  P2: P2_THRESHOLDS,
  P3: P3_THRESHOLDS,
  P4: P4_THRESHOLDS
};

// =====================================================
// CONFIGURAZIONE INTERVALLI ADATTIVI (millisecondi)
// =====================================================

export const SCHEDULE_INTERVALS = {
  health: {
    base: 15 * 60 * 1000,      // 15 minuti
    anomaly: 2 * 60 * 1000,    // 2 minuti
  },
  p4: {
    base: 60 * 60 * 1000,      // 1 ora
    anomaly: 10 * 60 * 1000,   // 10 minuti
  },
  p2: {
    base: 4 * 60 * 60 * 1000,  // 4 ore
    anomaly: 30 * 60 * 1000,   // 30 minuti
  },
  report: {
    base: 7 * 24 * 60 * 60 * 1000,  // 7 giorni
    anomaly: 24 * 60 * 60 * 1000,   // 1 giorno
  }
};
