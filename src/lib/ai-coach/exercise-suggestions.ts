// src/lib/ai-coach/exercise-suggestions.ts
// Mapping tra topic di conversazione e esercizi suggeriti per wrap-up

export interface ExerciseSuggestion {
  exerciseTitle: string;
  exerciseSlug?: string;
  keywords: string[];
}

export const TOPIC_EXERCISE_MAP: Record<string, ExerciseSuggestion[]> = {
  leadership: [
    {
      exerciseTitle: "Pratica di Delega Progressiva",
      keywords: ["delega", "delegare", "fiducia", "team", "responsabilità", "affidare", "collaboratori"]
    },
    {
      exerciseTitle: "Ascolto Attivo Consapevole",
      keywords: ["ascolto", "ascoltare", "comunicazione", "empatia", "capire", "comprendere"]
    },
    {
      exerciseTitle: "Visione Strategica",
      keywords: ["visione", "strategia", "obiettivi", "futuro", "direzione", "lungo termine", "pianificare"]
    },
    {
      exerciseTitle: "Gestione dei Conflitti",
      keywords: ["conflitto", "conflitti", "tensione", "disaccordo", "mediare", "litigare", "scontro"]
    },
    {
      exerciseTitle: "Decision Making sotto Pressione",
      keywords: ["decisione", "decidere", "scelta", "incertezza", "analisi", "dubbio", "scegliere"]
    },
    {
      exerciseTitle: "Feedback Costruttivo",
      keywords: ["feedback", "critica", "valutazione", "miglioramento", "recensione", "giudizio"]
    },
    {
      exerciseTitle: "Time Management per Leader",
      keywords: ["tempo", "priorità", "urgente", "importante", "organizzazione", "agenda", "scadenze"]
    },
    {
      exerciseTitle: "Motivazione del Team",
      keywords: ["motivazione", "motivare", "engagement", "coinvolgimento", "entusiasmo", "demotivato"]
    },
    {
      exerciseTitle: "Comunicazione Efficace",
      keywords: ["comunicare", "messaggio", "chiaro", "fraintendimento", "spiegare", "presentare"]
    },
    {
      exerciseTitle: "Gestione dello Stress",
      keywords: ["stress", "ansia", "pressione", "sovraccarico", "burnout", "stanchezza", "esausto"]
    },
    {
      exerciseTitle: "Autenticità nella Leadership",
      keywords: ["autentico", "autenticità", "vero", "maschera", "vulnerabile", "trasparente"]
    },
    {
      exerciseTitle: "Gestione del Cambiamento",
      keywords: ["cambiamento", "cambiare", "transizione", "novità", "resistenza", "adattare"]
    }
  ],
  risolutore: [
    {
      exerciseTitle: "Riconoscimento dei Pattern",
      keywords: ["pattern", "schema", "ripetizione", "abitudine", "ciclo", "ricorrente"]
    },
    {
      exerciseTitle: "Lettura dei Segnali Deboli",
      keywords: ["segnale", "segnali", "intuizione", "anticipare", "prevedere", "presagio"]
    },
    {
      exerciseTitle: "Inventario delle Risorse",
      keywords: ["risorsa", "risorse", "strumenti", "capacità", "supporto", "aiuto"]
    },
    {
      exerciseTitle: "Gestione dei 3 Traditori",
      keywords: ["paralisi", "paura", "procrastinazione", "blocco", "resistenza", "rimandare"]
    },
    {
      exerciseTitle: "Trasformazione Problema in Opportunità",
      keywords: ["problema", "ostacolo", "difficoltà", "sfida", "opportunità", "crisi"]
    },
    {
      exerciseTitle: "Modalità Sorgente vs Bersaglio",
      keywords: ["vittima", "subire", "colpa", "responsabile", "controllo", "impotente"]
    }
  ],
  microfelicita: [
    {
      exerciseTitle: "Pratica R.A.D.A.R. Quotidiana",
      keywords: ["momento", "presente", "consapevolezza", "attenzione", "mindfulness", "qui e ora"]
    },
    {
      exerciseTitle: "Diario della Gratitudine",
      keywords: ["gratitudine", "apprezzare", "riconoscere", "positivo", "grato", "fortuna"]
    },
    {
      exerciseTitle: "Amplificazione Sensoriale",
      keywords: ["sensi", "sensoriale", "percepire", "gustare", "assaporare", "sentire"]
    },
    {
      exerciseTitle: "Riconoscimento Nutriente vs Sabotante",
      keywords: ["nutriente", "sabotante", "tossico", "energia", "drena", "ricarica"]
    },
    {
      exerciseTitle: "Pause di Microfelicità",
      keywords: ["pausa", "fermarsi", "rallentare", "respiro", "momento", "stop"]
    }
  ]
};

// Pattern per riconoscere messaggi di chiusura conversazione
export const CLOSING_PATTERNS = [
  /^grazie/i,
  /grazie mille/i,
  /ti ringrazio/i,
  /^ok\s*(grazie|perfetto|capito)?[\s!.]*$/i,
  /a presto/i,
  /arrivederci/i,
  /ci vediamo/i,
  /buona giornata/i,
  /buona serata/i,
  /^ciao[\s!.]*$/i,
  /^perfetto[\s!.]*$/i,
  /è stato utile/i,
  /mi hai aiutato/i,
  /devo andare/i,
  /devo scappare/i,
  /ci sentiamo/i
];

/**
 * Verifica se un messaggio è un saluto/chiusura conversazione
 */
export function isClosingMessage(message: string): boolean {
  const trimmed = message.trim();
  return CLOSING_PATTERNS.some(pattern => pattern.test(trimmed));
}

/**
 * Trova l'esercizio suggerito basato sul contenuto della conversazione
 * @param conversationContent - Contenuto recente della conversazione
 * @param userPath - Percorso utente (leadership, risolutore, microfelicita)
 * @returns Nome dell'esercizio suggerito o null
 */
export function findSuggestedExercise(
  conversationContent: string,
  userPath: string = 'leadership'
): string | null {
  const content = conversationContent.toLowerCase();
  const exercises = TOPIC_EXERCISE_MAP[userPath] || TOPIC_EXERCISE_MAP.leadership;

  // Cerca match con keywords
  for (const exercise of exercises) {
    for (const keyword of exercise.keywords) {
      if (content.includes(keyword)) {
        return exercise.exerciseTitle;
      }
    }
  }

  return null;
}

/**
 * Genera lista esercizi disponibili per il system prompt
 * @param userPath - Percorso utente
 * @returns Lista formattata degli esercizi
 */
export function getExerciseListForPrompt(userPath: string = 'leadership'): string {
  const exercises = TOPIC_EXERCISE_MAP[userPath] || TOPIC_EXERCISE_MAP.leadership;
  return exercises.map(e => `- ${e.exerciseTitle}`).join('\n');
}
