/**
 * CONCRETEZZA Check Service
 *
 * Principio di Comprensione - Difficoltà #2: CONCRETEZZA
 * "Ogni concetto astratto deve essere illustrato con esempi concreti"
 *
 * Verifica:
 * - Presenza di esempi per concetti astratti
 * - Qualità degli esempi (relatabilità, praticità)
 * - Uso di metafore e analogie
 * - Scenari concreti dalla vita reale
 */

// ============================================================
// TYPES
// ============================================================

export interface ConcretezzaIssue {
  type: 'missing_example' | 'abstract_explanation' | 'weak_example' | 'too_theoretical';
  severity: 'low' | 'medium' | 'high';
  concept: string;
  context: string;
  suggestion: string;
  position: number;
}

export interface ConcretezzaCheckResult {
  score: number; // 0-100
  passed: boolean;
  issues: ConcretezzaIssue[];
  metrics: {
    abstract_concepts_found: number;
    examples_provided: number;
    metaphors_used: number;
    scenarios_described: number;
    example_ratio: number; // esempi / concetti astratti
  };
  suggestions: string[];
  exampleQuality: 'excellent' | 'good' | 'adequate' | 'poor' | 'none';
}

// ============================================================
// CONCETTI CHE RICHIEDONO ESEMPI
// ============================================================

// Concetti astratti che DEVONO avere esempi
const ABSTRACT_CONCEPTS: Record<string, {
  category: string;
  examplePrompt: string;
  severity: 'low' | 'medium' | 'high';
}> = {
  // Leadership - Alta necessità di esempi
  'leadership': {
    category: 'leadership',
    examplePrompt: 'come quando guidi il tuo team in una decisione difficile',
    severity: 'high'
  },
  'visione': {
    category: 'leadership',
    examplePrompt: 'come quando immagini dove vuoi portare la tua azienda tra 5 anni',
    severity: 'high'
  },
  'strategia': {
    category: 'business',
    examplePrompt: 'come quando decidi di concentrarti su un mercato specifico',
    severity: 'high'
  },
  'delega': {
    category: 'management',
    examplePrompt: 'come quando affidi un progetto importante a un collaboratore',
    severity: 'medium'
  },
  'motivazione': {
    category: 'psicologia',
    examplePrompt: 'come quando un obiettivo personale ti fa alzare presto la mattina',
    severity: 'medium'
  },
  'resilienza': {
    category: 'psicologia',
    examplePrompt: 'come quando ti rialzi dopo un fallimento importante',
    severity: 'high'
  },
  'comunicazione efficace': {
    category: 'soft-skills',
    examplePrompt: 'come quando riesci a far capire un\'idea complessa al tuo team',
    severity: 'medium'
  },
  'ascolto attivo': {
    category: 'comunicazione',
    examplePrompt: 'come quando ripeti con parole tue quello che l\'altro ha detto',
    severity: 'medium'
  },
  'intelligenza emotiva': {
    category: 'psicologia',
    examplePrompt: 'come quando noti che un collega è in difficoltà prima che lo dica',
    severity: 'high'
  },
  'empatia': {
    category: 'relazioni',
    examplePrompt: 'come quando ti metti nei panni di un cliente arrabbiato',
    severity: 'medium'
  },
  'assertività': {
    category: 'comunicazione',
    examplePrompt: 'come quando dici "no" a una richiesta senza sentirti in colpa',
    severity: 'medium'
  },
  'gestione del tempo': {
    category: 'produttività',
    examplePrompt: 'come quando blocchi le prime 2 ore per il lavoro importante',
    severity: 'low'
  },
  'problem solving': {
    category: 'competenze',
    examplePrompt: 'come quando trovi una soluzione creativa a un blocco nel progetto',
    severity: 'medium'
  },
  'decision making': {
    category: 'leadership',
    examplePrompt: 'come quando devi scegliere tra due opzioni entrambe valide',
    severity: 'high'
  },
  'feedback': {
    category: 'comunicazione',
    examplePrompt: 'come quando dici a un collaboratore cosa ha fatto bene e cosa migliorare',
    severity: 'low'
  },
  'crescita personale': {
    category: 'sviluppo',
    examplePrompt: 'come quando impari una nuova competenza che ti spaventa',
    severity: 'medium'
  },
  'autenticità': {
    category: 'valori',
    examplePrompt: 'come quando agisci secondo i tuoi valori anche se scomodo',
    severity: 'high'
  },
  'fiducia': {
    category: 'relazioni',
    examplePrompt: 'come quando dai carta bianca a un collaboratore su un progetto',
    severity: 'medium'
  },
  'cambiamento': {
    category: 'trasformazione',
    examplePrompt: 'come quando modifichi un processo che non funziona più',
    severity: 'medium'
  },
  'conflitto': {
    category: 'relazioni',
    examplePrompt: 'come quando due membri del team hanno visioni opposte',
    severity: 'medium'
  },
  'obiettivi': {
    category: 'planning',
    examplePrompt: 'come quando definisci esattamente cosa vuoi raggiungere entro fine mese',
    severity: 'low'
  },
  'priorità': {
    category: 'produttività',
    examplePrompt: 'come quando scegli le 3 cose più importanti da fare oggi',
    severity: 'low'
  },
  'responsabilità': {
    category: 'valori',
    examplePrompt: 'come quando ammetti un errore invece di cercare scuse',
    severity: 'medium'
  },
  'influenza': {
    category: 'leadership',
    examplePrompt: 'come quando convinci il team ad adottare un nuovo metodo',
    severity: 'high'
  },
  'consapevolezza': {
    category: 'psicologia',
    examplePrompt: 'come quando noti che stai reagendo con rabbia e ti fermi',
    severity: 'high'
  },
};

// Pattern che indicano presenza di esempi
const EXAMPLE_PATTERNS = [
  /per (fare un )?esempio/i,
  /ad esempio/i,
  /come quando/i,
  /immagina (di |che )?/i,
  /pensa a (quando |quella volta )?/i,
  /è come (se |quando )?/i,
  /tipo quando/i,
  /nella pratica/i,
  /concretamente/i,
  /in situazioni come/i,
  /supponiamo (che |di )?/i,
  /facciamo un esempio/i,
  /prendiamo il caso (di |in cui )?/i,
  /mettiamo che/i,
  /considera (questo|il caso|quando)/i,
  /nella vita reale/i,
  /in pratica significa/i,
  /in concreto/i,
];

// Pattern che indicano metafore/analogie
const METAPHOR_PATTERNS = [
  /è come un/i,
  /è simile a/i,
  /funziona come/i,
  /pensa a .* come/i,
  /proprio come/i,
  /allo stesso modo di/i,
  /immagina .* come/i,
  /un po' come/i,
  /paragonabile a/i,
];

// Pattern che indicano scenari concreti
const SCENARIO_PATTERNS = [
  /immagina di essere/i,
  /supponi di (essere |avere |dover )?/i,
  /pensa a una situazione in cui/i,
  /quando (ti trovi|sei|hai) .* e (devi|vuoi|puoi)/i,
  /la prossima volta che/i,
  /domani mattina quando/i,
  /durante (la prossima|una) riunione/i,
  /se un (collaboratore|dipendente|collega)/i,
  /quando parli con/i,
];

// Pattern che indicano spiegazione troppo teorica
const THEORETICAL_PATTERNS = [
  /secondo la teoria/i,
  /dal punto di vista teorico/i,
  /in linea di principio/i,
  /concettualmente/i,
  /a livello teorico/i,
  /l'approccio teorico/i,
  /il modello prevede/i,
  /la letteratura suggerisce/i,
  /gli studi dimostrano/i, // ok se seguito da esempio
];

// ============================================================
// MAIN SERVICE
// ============================================================

/**
 * Verifica la concretezza di un testo secondo il principio CONCRETEZZA
 */
export function checkConcretezza(
  text: string,
  previousContent: string = ''
): ConcretezzaCheckResult {
  const issues: ConcretezzaIssue[] = [];

  // Conta elementi
  const examplesCount = countExamples(text);
  const metaphorsCount = countMetaphors(text);
  const scenariosCount = countScenarios(text);
  const abstractConcepts = findAbstractConcepts(text);

  // Trova concetti senza esempi
  const conceptsWithoutExamples = findConceptsWithoutExamples(
    text,
    abstractConcepts,
    previousContent
  );
  issues.push(...conceptsWithoutExamples);

  // Verifica se troppo teorico
  const theoreticalIssues = findTheoreticalIssues(text, examplesCount);
  issues.push(...theoreticalIssues);

  // Calcola metriche
  const totalExamples = examplesCount + metaphorsCount + scenariosCount;
  const exampleRatio = abstractConcepts.length > 0
    ? totalExamples / abstractConcepts.length
    : 1;

  const metrics = {
    abstract_concepts_found: abstractConcepts.length,
    examples_provided: examplesCount,
    metaphors_used: metaphorsCount,
    scenarios_described: scenariosCount,
    example_ratio: Math.round(exampleRatio * 100) / 100,
  };

  // Determina qualità esempi
  const exampleQuality = determineExampleQuality(metrics, issues.length);

  // Calcola score
  let score = 100;

  // Penalità per issues
  for (const issue of issues) {
    switch (issue.severity) {
      case 'high': score -= 18; break;
      case 'medium': score -= 12; break;
      case 'low': score -= 6; break;
    }
  }

  // Bonus per buon rapporto esempi/concetti
  if (exampleRatio >= 1) score += 10;
  else if (exampleRatio >= 0.5) score += 5;

  // Bonus per varietà (esempi + metafore + scenari)
  if (examplesCount > 0 && metaphorsCount > 0) score += 5;
  if (scenariosCount > 0) score += 5;

  // Penalità se testo lungo senza esempi
  if (text.length > 300 && totalExamples === 0) {
    score -= 15;
  }

  // Normalizza
  score = Math.max(0, Math.min(100, score));

  // Genera suggerimenti
  const suggestions = generateConcretezzaSuggestions(issues, metrics);

  return {
    score,
    passed: score >= 70,
    issues,
    metrics,
    suggestions,
    exampleQuality,
  };
}

/**
 * Conta esempi nel testo
 */
function countExamples(text: string): number {
  let count = 0;
  for (const pattern of EXAMPLE_PATTERNS) {
    const matches = text.match(new RegExp(pattern.source, 'gi'));
    if (matches) count += matches.length;
  }
  return count;
}

/**
 * Conta metafore nel testo
 */
function countMetaphors(text: string): number {
  let count = 0;
  for (const pattern of METAPHOR_PATTERNS) {
    const matches = text.match(new RegExp(pattern.source, 'gi'));
    if (matches) count += matches.length;
  }
  return count;
}

/**
 * Conta scenari nel testo
 */
function countScenarios(text: string): number {
  let count = 0;
  for (const pattern of SCENARIO_PATTERNS) {
    const matches = text.match(new RegExp(pattern.source, 'gi'));
    if (matches) count += matches.length;
  }
  return count;
}

/**
 * Trova concetti astratti nel testo
 */
function findAbstractConcepts(text: string): string[] {
  const found: string[] = [];
  const textLower = text.toLowerCase();

  for (const concept of Object.keys(ABSTRACT_CONCEPTS)) {
    if (textLower.includes(concept.toLowerCase())) {
      found.push(concept);
    }
  }

  return found;
}

/**
 * Trova concetti astratti senza esempi
 */
function findConceptsWithoutExamples(
  text: string,
  concepts: string[],
  previousContent: string
): ConcretezzaIssue[] {
  const issues: ConcretezzaIssue[] = [];
  const textLower = text.toLowerCase();
  const hasAnyExample = EXAMPLE_PATTERNS.some(p => p.test(text));

  // Se il testo è breve (<150 caratteri), non richiedere esempi
  if (text.length < 150) return issues;

  // Se c'è almeno un esempio e pochi concetti, ok
  if (hasAnyExample && concepts.length <= 2) return issues;

  for (const concept of concepts) {
    const info = ABSTRACT_CONCEPTS[concept];
    if (!info) continue;

    const position = textLower.indexOf(concept.toLowerCase());

    // Verifica se c'è un esempio vicino al concetto
    const conceptContext = text.substring(
      Math.max(0, position - 50),
      Math.min(text.length, position + concept.length + 200)
    );

    const hasExampleNearby = EXAMPLE_PATTERNS.some(p => p.test(conceptContext)) ||
                             METAPHOR_PATTERNS.some(p => p.test(conceptContext)) ||
                             SCENARIO_PATTERNS.some(p => p.test(conceptContext));

    // Verifica se già esemplificato in precedenza
    const wasExemplifiedBefore = previousContent.toLowerCase().includes(concept) &&
      EXAMPLE_PATTERNS.some(p => p.test(previousContent));

    if (!hasExampleNearby && !wasExemplifiedBefore && !hasAnyExample) {
      issues.push({
        type: 'missing_example',
        severity: info.severity,
        concept,
        context: extractContext(text, concept),
        suggestion: `Aggiungi un esempio per "${concept}": "${info.examplePrompt}"`,
        position,
      });
    }
  }

  // Limita a max 3 issues per non sovraccaricare
  return issues.slice(0, 3);
}

/**
 * Trova spiegazioni troppo teoriche
 */
function findTheoreticalIssues(
  text: string,
  examplesCount: number
): ConcretezzaIssue[] {
  const issues: ConcretezzaIssue[] = [];

  // Se ci sono esempi, le spiegazioni teoriche vanno bene
  if (examplesCount > 0) return issues;

  for (const pattern of THEORETICAL_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const position = text.indexOf(match[0]);
      issues.push({
        type: 'too_theoretical',
        severity: 'medium',
        concept: 'spiegazione',
        context: extractContext(text, match[0]),
        suggestion: 'Bilancia la teoria con un esempio pratico: "In pratica, questo significa..."',
        position,
      });
      break; // Un solo issue per questo tipo
    }
  }

  return issues;
}

/**
 * Determina qualità complessiva degli esempi
 */
function determineExampleQuality(
  metrics: ConcretezzaCheckResult['metrics'],
  issuesCount: number
): ConcretezzaCheckResult['exampleQuality'] {
  const { examples_provided, metaphors_used, scenarios_described, example_ratio } = metrics;
  const total = examples_provided + metaphors_used + scenarios_described;

  if (total === 0) return 'none';
  if (issuesCount >= 3) return 'poor';
  if (example_ratio >= 1 && total >= 2) return 'excellent';
  if (example_ratio >= 0.5 || total >= 1) return 'good';
  return 'adequate';
}

/**
 * Estrae contesto attorno a un termine
 */
function extractContext(text: string, term: string): string {
  const index = text.toLowerCase().indexOf(term.toLowerCase());
  if (index === -1) return text.substring(0, 80);

  const start = Math.max(0, index - 30);
  const end = Math.min(text.length, index + term.length + 50);

  let context = text.substring(start, end);
  if (start > 0) context = '...' + context;
  if (end < text.length) context = context + '...';

  return context;
}

/**
 * Genera suggerimenti basati sugli issues
 */
function generateConcretezzaSuggestions(
  issues: ConcretezzaIssue[],
  metrics: ConcretezzaCheckResult['metrics']
): string[] {
  const suggestions: string[] = [];

  if (issues.filter(i => i.type === 'missing_example').length > 0) {
    suggestions.push('Aggiungi esempi concreti: "Per esempio..." o "Come quando..."');
  }

  if (issues.filter(i => i.type === 'too_theoretical').length > 0) {
    suggestions.push('Bilancia la teoria con applicazioni pratiche');
  }

  if (metrics.metaphors_used === 0 && metrics.abstract_concepts_found > 1) {
    suggestions.push('Usa metafore per rendere i concetti più vividi: "È come..."');
  }

  if (metrics.scenarios_described === 0 && metrics.abstract_concepts_found > 0) {
    suggestions.push('Descrivi uno scenario: "Immagina di essere in riunione e..."');
  }

  if (suggestions.length === 0) {
    if (metrics.example_ratio >= 1) {
      suggestions.push('Eccellente uso di esempi - il messaggio è chiaro e concreto');
    } else {
      suggestions.push('Buon livello di concretezza');
    }
  }

  return suggestions;
}

// ============================================================
// EXPORTS AGGIUNTIVI
// ============================================================

/**
 * Suggerisce un esempio per un concetto specifico
 */
export function suggestExampleFor(concept: string): string | null {
  const conceptLower = concept.toLowerCase();
  const info = ABSTRACT_CONCEPTS[conceptLower];

  if (info) {
    return `"Per esempio, ${info.examplePrompt}"`;
  }

  // Fallback generico
  return `"Per esempio, pensa a una situazione concreta in cui ${concept} ha fatto la differenza"`;
}

/**
 * Ottiene lista concetti astratti per categoria
 */
export function getConceptsByCategory(category: string): string[] {
  return Object.entries(ABSTRACT_CONCEPTS)
    .filter(([_, info]) => info.category === category)
    .map(([concept, _]) => concept);
}

/**
 * Verifica se un testo ha abbastanza esempi per la sua lunghezza
 */
export function hasAdequateExamples(text: string): boolean {
  const length = text.length;
  const examplesCount = countExamples(text) + countMetaphors(text) + countScenarios(text);

  // Soglie basate sulla lunghezza
  if (length < 200) return true; // Testi brevi non richiedono esempi
  if (length < 500) return examplesCount >= 1;
  if (length < 1000) return examplesCount >= 2;
  return examplesCount >= 3;
}
