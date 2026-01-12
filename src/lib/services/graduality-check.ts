/**
 * Graduality Check Service
 *
 * Verifica la corretta sequenza di apprendimento secondo il principio:
 * "Non dare per scontate conoscenze precedenti, costruire passo dopo passo"
 *
 * Le 3 difficoltà della Comprensione:
 * 1. PAROLE - Termini non comuni devono essere spiegati
 * 2. CONCRETEZZA - Concetti astratti illustrati con esempi
 * 3. GRADUALITÀ - Sequenza logica rispettata
 */

// ============================================================
// TYPES
// ============================================================

export interface GradualityIssue {
  type: 'unexplained_term' | 'missing_example' | 'sequence_gap' | 'assumed_knowledge';
  severity: 'low' | 'medium' | 'high';
  term?: string;
  context: string;
  suggestion: string;
  position?: number;
}

export interface GradualityCheckResult {
  score: number; // 0-100
  passed: boolean;
  issues: GradualityIssue[];
  metrics: {
    unexplained_terms: number;
    missing_examples: number;
    sequence_gaps: number;
    assumed_knowledge: number;
  };
  suggestions: string[];
}

export interface ConversationContext {
  previousMessages: { role: 'user' | 'assistant'; content: string }[];
  userKnowledgeLevel?: 'beginner' | 'intermediate' | 'advanced';
  topicsIntroduced: string[];
}

// ============================================================
// TERMINI TECNICI CHE RICHIEDONO SPIEGAZIONE
// ============================================================

const TECHNICAL_TERMS: Record<string, {
  category: string;
  simpleAlternative: string;
  requiresExplanation: boolean;
}> = {
  // Leadership/Management
  'framework': { category: 'management', simpleAlternative: 'schema/metodo', requiresExplanation: true },
  'mindset': { category: 'psicologia', simpleAlternative: 'mentalità/atteggiamento', requiresExplanation: true },
  'empowerment': { category: 'management', simpleAlternative: 'responsabilizzazione', requiresExplanation: true },
  'stakeholder': { category: 'business', simpleAlternative: 'parti interessate', requiresExplanation: true },
  'feedback': { category: 'comunicazione', simpleAlternative: 'riscontro', requiresExplanation: false },
  'paradigma': { category: 'filosofia', simpleAlternative: 'modo di vedere', requiresExplanation: true },
  'resilienza': { category: 'psicologia', simpleAlternative: 'capacità di riprendersi', requiresExplanation: true },
  'proattivo': { category: 'comportamento', simpleAlternative: 'che prende iniziativa', requiresExplanation: true },
  'accountability': { category: 'management', simpleAlternative: 'responsabilità', requiresExplanation: true },
  'benchmark': { category: 'business', simpleAlternative: 'punto di riferimento', requiresExplanation: true },
  'best practice': { category: 'management', simpleAlternative: 'pratica efficace', requiresExplanation: true },
  'kpi': { category: 'business', simpleAlternative: 'indicatore di risultato', requiresExplanation: true },
  'roi': { category: 'business', simpleAlternative: 'ritorno sull\'investimento', requiresExplanation: true },
  'soft skills': { category: 'hr', simpleAlternative: 'competenze relazionali', requiresExplanation: true },
  'hard skills': { category: 'hr', simpleAlternative: 'competenze tecniche', requiresExplanation: true },
  'onboarding': { category: 'hr', simpleAlternative: 'inserimento', requiresExplanation: true },
  'brainstorming': { category: 'creatività', simpleAlternative: 'sessione di idee', requiresExplanation: false },
  'team building': { category: 'hr', simpleAlternative: 'costruzione del gruppo', requiresExplanation: true },
  'leadership situazionale': { category: 'leadership', simpleAlternative: 'adattare lo stile alla situazione', requiresExplanation: true },
  'intelligenza emotiva': { category: 'psicologia', simpleAlternative: 'capacità di gestire emozioni', requiresExplanation: true },
  'growth mindset': { category: 'psicologia', simpleAlternative: 'mentalità di crescita', requiresExplanation: true },
  'fixed mindset': { category: 'psicologia', simpleAlternative: 'mentalità fissa', requiresExplanation: true },
  'self-efficacy': { category: 'psicologia', simpleAlternative: 'fiducia nelle proprie capacità', requiresExplanation: true },
  'burnout': { category: 'salute', simpleAlternative: 'esaurimento', requiresExplanation: false },
  'work-life balance': { category: 'benessere', simpleAlternative: 'equilibrio vita-lavoro', requiresExplanation: true },
  'time management': { category: 'produttività', simpleAlternative: 'gestione del tempo', requiresExplanation: false },
  'delegation': { category: 'management', simpleAlternative: 'delega', requiresExplanation: false },
  'assertività': { category: 'comunicazione', simpleAlternative: 'capacità di affermarsi', requiresExplanation: true },
  'empatia': { category: 'relazioni', simpleAlternative: 'mettersi nei panni degli altri', requiresExplanation: false },
  'metacognizione': { category: 'psicologia', simpleAlternative: 'pensare al proprio pensiero', requiresExplanation: true },
  'neuroplasticità': { category: 'neuroscienze', simpleAlternative: 'capacità del cervello di cambiare', requiresExplanation: true },
  'trigger': { category: 'psicologia', simpleAlternative: 'innesco/stimolo', requiresExplanation: true },
  'pattern': { category: 'comportamento', simpleAlternative: 'schema ricorrente', requiresExplanation: true },
  'bias': { category: 'psicologia', simpleAlternative: 'pregiudizio/distorsione', requiresExplanation: true },
  'heuristica': { category: 'psicologia', simpleAlternative: 'scorciatoia mentale', requiresExplanation: true },
  'cognitive load': { category: 'psicologia', simpleAlternative: 'carico mentale', requiresExplanation: true },
  'zona di comfort': { category: 'sviluppo', simpleAlternative: 'area di sicurezza abituale', requiresExplanation: false },
  'flow': { category: 'psicologia', simpleAlternative: 'stato di flusso/concentrazione totale', requiresExplanation: true },
  'purpose': { category: 'motivazione', simpleAlternative: 'scopo/senso', requiresExplanation: true },
  'vision': { category: 'leadership', simpleAlternative: 'visione/direzione', requiresExplanation: false },
  'mission': { category: 'business', simpleAlternative: 'missione/obiettivo', requiresExplanation: false },
  'value proposition': { category: 'business', simpleAlternative: 'proposta di valore', requiresExplanation: true },
  'scalabilità': { category: 'business', simpleAlternative: 'capacità di crescere', requiresExplanation: true },
  'pivot': { category: 'startup', simpleAlternative: 'cambio di direzione', requiresExplanation: true },
  'disruptive': { category: 'innovazione', simpleAlternative: 'rivoluzionario', requiresExplanation: true },
};

// Framework e acronimi Vitaeology
const VITAEOLOGY_CONCEPTS: Record<string, {
  fullName: string;
  requiresPriorIntroduction: boolean;
  dependencies: string[];
}> = {
  'R.A.D.A.R.': {
    fullName: 'Riconosci-Amplifica-Dirigi-Ancora-Resta',
    requiresPriorIntroduction: true,
    dependencies: []
  },
  'SCARF': {
    fullName: 'Status-Certainty-Autonomy-Relatedness-Fairness',
    requiresPriorIntroduction: true,
    dependencies: []
  },
  'Tre Traditori': {
    fullName: 'Paralizzante, Timoroso, Procrastinatore',
    requiresPriorIntroduction: true,
    dependencies: []
  },
  'Principio Validante': {
    fullName: 'Riconoscere capacità esistenti vs diagnosticare carenze',
    requiresPriorIntroduction: true,
    dependencies: []
  },
  '4 Pilastri': {
    fullName: 'Visione, Azione, Relazioni, Adattamento',
    requiresPriorIntroduction: true,
    dependencies: []
  },
  '24 Caratteristiche': {
    fullName: 'Le 24 caratteristiche di leadership',
    requiresPriorIntroduction: true,
    dependencies: ['4 Pilastri']
  },
  'Ciclo Errore-Comprensione-Riprova': {
    fullName: 'Processo di apprendimento dagli errori',
    requiresPriorIntroduction: true,
    dependencies: []
  },
  'Microfelicità': {
    fullName: 'Momenti di benessere quotidiano',
    requiresPriorIntroduction: false,
    dependencies: []
  },
};

// ============================================================
// PATTERN DI GRADUALITÀ
// ============================================================

// Frasi che indicano assunzione di conoscenza pregressa
const ASSUMED_KNOWLEDGE_PATTERNS = [
  /come (già )?sai/i,
  /ovviamente/i,
  /naturalmente/i,
  /è (chiaro|ovvio|evidente) che/i,
  /non c'è bisogno di spiegare/i,
  /sappiamo (tutti )?che/i,
  /come abbiamo (già )?visto/i,  // ok solo se effettivamente visto prima
  /ricorderai che/i,
  /come ti ho (già )?detto/i,  // ok solo se effettivamente detto prima
];

// Frasi che indicano buona gradualità
const GOOD_GRADUALITY_PATTERNS = [
  /prima di tutto/i,
  /partiamo da/i,
  /iniziamo con/i,
  /il primo passo/i,
  /vediamo (prima )?cos'è/i,
  /in parole semplici/i,
  /significa che/i,
  /in pratica/i,
  /per (farti )?un esempio/i,
  /è come quando/i,
  /immagina (di )?/i,
  /pensa a quando/i,
];

// ============================================================
// MAIN SERVICE
// ============================================================

/**
 * Verifica la gradualità di un testo
 */
export function checkGraduality(
  text: string,
  context?: ConversationContext
): GradualityCheckResult {
  const issues: GradualityIssue[] = [];
  const topicsAlreadyIntroduced = context?.topicsIntroduced || [];
  const previousContent = context?.previousMessages
    ?.map(m => m.content)
    .join(' ') || '';

  // 1. Check termini tecnici non spiegati
  const unexplainedTerms = findUnexplainedTerms(text, previousContent);
  issues.push(...unexplainedTerms);

  // 2. Check concetti Vitaeology usati senza introduzione
  const missingIntroductions = findMissingIntroductions(text, topicsAlreadyIntroduced, previousContent);
  issues.push(...missingIntroductions);

  // 3. Check assunzioni di conoscenza pregressa
  const assumedKnowledge = findAssumedKnowledge(text, previousContent);
  issues.push(...assumedKnowledge);

  // 4. Check presenza esempi concreti per concetti astratti
  const missingExamples = findMissingExamples(text);
  issues.push(...missingExamples);

  // 5. Check pattern di buona gradualità (bonus)
  const hasGoodPatterns = GOOD_GRADUALITY_PATTERNS.some(p => p.test(text));

  // Calcola metriche
  const metrics = {
    unexplained_terms: issues.filter(i => i.type === 'unexplained_term').length,
    missing_examples: issues.filter(i => i.type === 'missing_example').length,
    sequence_gaps: issues.filter(i => i.type === 'sequence_gap').length,
    assumed_knowledge: issues.filter(i => i.type === 'assumed_knowledge').length,
  };

  // Calcola score (100 = perfetto, 0 = pessimo)
  let score = 100;

  // Penalità per issue
  score -= metrics.unexplained_terms * 15;
  score -= metrics.missing_examples * 10;
  score -= metrics.sequence_gaps * 20;
  score -= metrics.assumed_knowledge * 10;

  // Bonus per buona gradualità
  if (hasGoodPatterns) {
    score += 5;
  }

  // Normalizza score
  score = Math.max(0, Math.min(100, score));

  // Genera suggerimenti
  const suggestions = generateSuggestions(issues);

  return {
    score,
    passed: score >= 70,
    issues,
    metrics,
    suggestions,
  };
}

/**
 * Trova termini tecnici non spiegati
 */
function findUnexplainedTerms(
  text: string,
  previousContent: string
): GradualityIssue[] {
  const issues: GradualityIssue[] = [];
  const textLower = text.toLowerCase();
  const previousLower = previousContent.toLowerCase();

  for (const [term, info] of Object.entries(TECHNICAL_TERMS)) {
    if (!info.requiresExplanation) continue;

    const termLower = term.toLowerCase();
    const termRegex = new RegExp(`\\b${termLower}\\b`, 'i');

    if (termRegex.test(textLower)) {
      // Verifica se il termine è stato spiegato nel testo corrente
      const explanationPatterns = [
        new RegExp(`${termLower}[,:]? (cioè|ovvero|significa|vale a dire)`, 'i'),
        new RegExp(`(cioè|ovvero|in altre parole)[^.]*${termLower}`, 'i'),
        new RegExp(`${termLower}[^.]*\\(`, 'i'), // termine seguito da parentesi (spiegazione)
        new RegExp(`cosa (significa|vuol dire)[^.]*${termLower}`, 'i'),
      ];

      const isExplained = explanationPatterns.some(p => p.test(text));
      const wasExplainedBefore = termRegex.test(previousLower);

      if (!isExplained && !wasExplainedBefore) {
        issues.push({
          type: 'unexplained_term',
          severity: 'medium',
          term,
          context: extractContext(text, term),
          suggestion: `Sostituisci "${term}" con "${info.simpleAlternative}" o spiega brevemente cosa significa`,
        });
      }
    }
  }

  return issues;
}

/**
 * Trova concetti Vitaeology usati senza introduzione
 */
function findMissingIntroductions(
  text: string,
  topicsIntroduced: string[],
  previousContent: string
): GradualityIssue[] {
  const issues: GradualityIssue[] = [];

  for (const [concept, info] of Object.entries(VITAEOLOGY_CONCEPTS)) {
    if (!info.requiresPriorIntroduction) continue;

    const conceptRegex = new RegExp(concept.replace(/\./g, '\\.'), 'i');

    if (conceptRegex.test(text)) {
      // Verifica se è stato introdotto prima
      const wasIntroduced = topicsIntroduced.includes(concept) ||
                           conceptRegex.test(previousContent);

      // Verifica se viene spiegato nel testo corrente
      const isBeingIntroduced = text.toLowerCase().includes('vediamo') ||
                                text.toLowerCase().includes('significa') ||
                                text.toLowerCase().includes('si tratta di');

      if (!wasIntroduced && !isBeingIntroduced) {
        issues.push({
          type: 'sequence_gap',
          severity: 'high',
          term: concept,
          context: extractContext(text, concept),
          suggestion: `Il concetto "${concept}" (${info.fullName}) andrebbe introdotto prima di usarlo`,
        });
      }

      // Verifica dipendenze
      for (const dep of info.dependencies) {
        if (!topicsIntroduced.includes(dep) && !previousContent.includes(dep)) {
          issues.push({
            type: 'sequence_gap',
            severity: 'medium',
            term: dep,
            context: `Usato "${concept}" che dipende da "${dep}"`,
            suggestion: `Prima di parlare di "${concept}", introduci "${dep}"`,
          });
        }
      }
    }
  }

  return issues;
}

/**
 * Trova assunzioni di conoscenza pregressa non verificate
 */
function findAssumedKnowledge(
  text: string,
  previousContent: string
): GradualityIssue[] {
  const issues: GradualityIssue[] = [];

  for (const pattern of ASSUMED_KNOWLEDGE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      // Alcuni pattern sono ok se il contenuto è stato effettivamente menzionato prima
      const isJustified = previousContent.length > 100; // Heuristic: c'è contesto precedente

      if (!isJustified) {
        issues.push({
          type: 'assumed_knowledge',
          severity: 'low',
          context: extractContext(text, match[0]),
          suggestion: `Evita "${match[0]}" - non dare per scontato che l'utente sappia già`,
        });
      }
    }
  }

  return issues;
}

/**
 * Trova concetti astratti senza esempi concreti
 */
function findMissingExamples(text: string): GradualityIssue[] {
  const issues: GradualityIssue[] = [];

  // Concetti astratti che richiedono esempi
  const abstractConcepts = [
    'leadership', 'visione', 'strategia', 'comunicazione efficace',
    'gestione del tempo', 'delega', 'motivazione', 'resilienza',
    'intelligenza emotiva', 'ascolto attivo', 'assertività',
  ];

  // Pattern che indicano presenza di esempi
  const examplePatterns = [
    /per esempio/i,
    /ad esempio/i,
    /come quando/i,
    /immagina/i,
    /pensa a/i,
    /è come/i,
    /tipo quando/i,
    /nella pratica/i,
    /concretamente/i,
    /in situazioni come/i,
  ];

  const hasExample = examplePatterns.some(p => p.test(text));

  // Se il testo è lungo (>200 caratteri) e contiene concetti astratti ma nessun esempio
  if (text.length > 200 && !hasExample) {
    for (const concept of abstractConcepts) {
      if (text.toLowerCase().includes(concept)) {
        issues.push({
          type: 'missing_example',
          severity: 'medium',
          term: concept,
          context: `Parli di "${concept}" senza un esempio concreto`,
          suggestion: `Aggiungi un esempio pratico: "Per esempio, quando..." o "È come quando..."`,
        });
        break; // Un solo issue per mancanza di esempi
      }
    }
  }

  return issues;
}

/**
 * Estrae contesto attorno a un termine
 */
function extractContext(text: string, term: string): string {
  const index = text.toLowerCase().indexOf(term.toLowerCase());
  if (index === -1) return text.substring(0, 100);

  const start = Math.max(0, index - 30);
  const end = Math.min(text.length, index + term.length + 30);

  let context = text.substring(start, end);
  if (start > 0) context = '...' + context;
  if (end < text.length) context = context + '...';

  return context;
}

/**
 * Genera suggerimenti basati sugli issues trovati
 */
function generateSuggestions(issues: GradualityIssue[]): string[] {
  const suggestions: string[] = [];

  if (issues.some(i => i.type === 'unexplained_term')) {
    suggestions.push('Usa termini più semplici o spiega brevemente quelli tecnici');
  }

  if (issues.some(i => i.type === 'sequence_gap')) {
    suggestions.push('Introduci i concetti prima di usarli - "Vediamo prima cos\'è..."');
  }

  if (issues.some(i => i.type === 'assumed_knowledge')) {
    suggestions.push('Non dare per scontato che l\'utente sappia già - verifica sempre');
  }

  if (issues.some(i => i.type === 'missing_example')) {
    suggestions.push('Aggiungi un esempio concreto dalla vita quotidiana');
  }

  if (suggestions.length === 0) {
    suggestions.push('La gradualità è buona - continua così!');
  }

  return suggestions;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Verifica se un testo segue la struttura graduata corretta
 */
export function analyzeStructure(text: string): {
  hasIntroduction: boolean;
  hasExplanation: boolean;
  hasExample: boolean;
  hasConclusion: boolean;
  score: number;
} {
  const introPatterns = [/^(prima|iniziamo|partiamo|vediamo)/i, /il (primo|punto)/i];
  const explanationPatterns = [/significa|vuol dire|in pratica|cioè/i];
  const examplePatterns = [/esempio|come quando|immagina|pensa a/i];
  const conclusionPatterns = [/quindi|in sintesi|riassumendo|il punto è/i];

  const hasIntroduction = introPatterns.some(p => p.test(text));
  const hasExplanation = explanationPatterns.some(p => p.test(text));
  const hasExample = examplePatterns.some(p => p.test(text));
  const hasConclusion = conclusionPatterns.some(p => p.test(text));

  let score = 0;
  if (hasIntroduction) score += 25;
  if (hasExplanation) score += 25;
  if (hasExample) score += 30;
  if (hasConclusion) score += 20;

  return { hasIntroduction, hasExplanation, hasExample, hasConclusion, score };
}

/**
 * Suggerisce come riscrivere un testo per migliorare la gradualità
 */
export function suggestRewrite(
  originalTerm: string,
  context: string
): string {
  const termInfo = TECHNICAL_TERMS[originalTerm.toLowerCase()];

  if (termInfo) {
    return `Invece di "${originalTerm}", prova: "${termInfo.simpleAlternative}" oppure spiega brevemente: "${originalTerm} (cioè ${termInfo.simpleAlternative})"`;
  }

  return `Considera di spiegare "${originalTerm}" prima di usarlo`;
}

/**
 * Calcola score di gradualità per una conversazione intera
 */
export function checkConversationGraduality(
  messages: { role: 'user' | 'assistant'; content: string }[]
): {
  overallScore: number;
  messageScores: number[];
  trend: 'improving' | 'stable' | 'declining';
  summary: string;
} {
  const topicsIntroduced: string[] = [];
  const messageScores: number[] = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.role !== 'assistant') continue;

    const context: ConversationContext = {
      previousMessages: messages.slice(0, i),
      topicsIntroduced: [...topicsIntroduced],
    };

    const result = checkGraduality(msg.content, context);
    messageScores.push(result.score);

    // Aggiorna topics introdotti
    for (const concept of Object.keys(VITAEOLOGY_CONCEPTS)) {
      if (msg.content.includes(concept)) {
        topicsIntroduced.push(concept);
      }
    }
  }

  const overallScore = messageScores.length > 0
    ? Math.round(messageScores.reduce((a, b) => a + b, 0) / messageScores.length)
    : 100;

  // Calcola trend
  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (messageScores.length >= 3) {
    const firstHalf = messageScores.slice(0, Math.floor(messageScores.length / 2));
    const secondHalf = messageScores.slice(Math.floor(messageScores.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    if (secondAvg - firstAvg > 5) trend = 'improving';
    else if (firstAvg - secondAvg > 5) trend = 'declining';
  }

  const summary = overallScore >= 80
    ? 'Eccellente gradualità nella conversazione'
    : overallScore >= 60
    ? 'Buona gradualità con margini di miglioramento'
    : 'Gradualità da migliorare - verificare spiegazioni e esempi';

  return { overallScore, messageScores, trend, summary };
}
