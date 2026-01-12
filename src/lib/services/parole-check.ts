/**
 * PAROLE Check Service
 *
 * Principio di Comprensione - Difficoltà #1: PAROLE
 * "Ogni termine non comune deve essere spiegato"
 *
 * Verifica:
 * - Termini tecnici/inglesi usati senza spiegazione
 * - Acronimi non espansi
 * - Gergo settoriale non chiarito
 * - Parole complesse quando esistono alternative semplici
 */

// ============================================================
// TYPES
// ============================================================

export interface ParoleIssue {
  type: 'technical_term' | 'acronym' | 'jargon' | 'complex_word' | 'anglicism';
  severity: 'low' | 'medium' | 'high';
  term: string;
  category: string;
  simpleAlternative: string;
  context: string;
  suggestion: string;
  position: number;
}

export interface ParoleCheckResult {
  score: number; // 0-100
  passed: boolean;
  issues: ParoleIssue[];
  metrics: {
    technical_terms: number;
    acronyms: number;
    jargon: number;
    complex_words: number;
    anglicisms: number;
    total_issues: number;
    terms_explained: number;
  };
  suggestions: string[];
}

// ============================================================
// DIZIONARIO TERMINI
// ============================================================

// Termini tecnici business/leadership
const TECHNICAL_TERMS: Record<string, {
  category: string;
  simpleAlternative: string;
  severity: 'low' | 'medium' | 'high';
}> = {
  // Business/Management - Alta severità
  'framework': { category: 'management', simpleAlternative: 'schema/metodo strutturato', severity: 'high' },
  'stakeholder': { category: 'business', simpleAlternative: 'persone coinvolte/interessate', severity: 'high' },
  'accountability': { category: 'management', simpleAlternative: 'responsabilità diretta', severity: 'high' },
  'benchmark': { category: 'business', simpleAlternative: 'punto di riferimento/confronto', severity: 'medium' },
  'best practice': { category: 'management', simpleAlternative: 'pratica efficace collaudata', severity: 'medium' },
  'value proposition': { category: 'business', simpleAlternative: 'proposta di valore', severity: 'high' },
  'scalabilità': { category: 'business', simpleAlternative: 'capacità di crescere', severity: 'medium' },
  'pivot': { category: 'startup', simpleAlternative: 'cambio di direzione strategico', severity: 'high' },
  'disruptive': { category: 'innovazione', simpleAlternative: 'che cambia le regole del gioco', severity: 'high' },
  'leverage': { category: 'business', simpleAlternative: 'leva/vantaggio', severity: 'high' },
  'deliverable': { category: 'project', simpleAlternative: 'risultato da consegnare', severity: 'high' },
  'milestone': { category: 'project', simpleAlternative: 'tappa importante', severity: 'medium' },
  'roadmap': { category: 'planning', simpleAlternative: 'piano di sviluppo', severity: 'medium' },
  'workflow': { category: 'process', simpleAlternative: 'flusso di lavoro', severity: 'medium' },
  'bottleneck': { category: 'process', simpleAlternative: 'collo di bottiglia/ostacolo', severity: 'medium' },
  'outsourcing': { category: 'business', simpleAlternative: 'esternalizzazione', severity: 'medium' },
  'core business': { category: 'business', simpleAlternative: 'attività principale', severity: 'medium' },

  // HR/People - Media severità
  'soft skills': { category: 'hr', simpleAlternative: 'competenze relazionali', severity: 'medium' },
  'hard skills': { category: 'hr', simpleAlternative: 'competenze tecniche', severity: 'medium' },
  'onboarding': { category: 'hr', simpleAlternative: 'inserimento/accoglienza', severity: 'medium' },
  'team building': { category: 'hr', simpleAlternative: 'costruzione del gruppo', severity: 'low' },
  'empowerment': { category: 'management', simpleAlternative: 'responsabilizzazione', severity: 'high' },
  'coaching': { category: 'sviluppo', simpleAlternative: 'accompagnamento/guida', severity: 'low' },
  'mentoring': { category: 'sviluppo', simpleAlternative: 'tutoraggio', severity: 'low' },
  'performance review': { category: 'hr', simpleAlternative: 'valutazione delle prestazioni', severity: 'medium' },
  'turnover': { category: 'hr', simpleAlternative: 'ricambio del personale', severity: 'medium' },

  // Psicologia/Comportamento - Alta severità (concetti complessi)
  'mindset': { category: 'psicologia', simpleAlternative: 'mentalità/modo di pensare', severity: 'medium' },
  'resilienza': { category: 'psicologia', simpleAlternative: 'capacità di riprendersi', severity: 'medium' },
  'proattivo': { category: 'comportamento', simpleAlternative: 'che prende l\'iniziativa', severity: 'medium' },
  'intelligenza emotiva': { category: 'psicologia', simpleAlternative: 'capacità di gestire le emozioni', severity: 'high' },
  'growth mindset': { category: 'psicologia', simpleAlternative: 'mentalità di crescita', severity: 'high' },
  'fixed mindset': { category: 'psicologia', simpleAlternative: 'mentalità rigida', severity: 'high' },
  'self-efficacy': { category: 'psicologia', simpleAlternative: 'fiducia nelle proprie capacità', severity: 'high' },
  'metacognizione': { category: 'psicologia', simpleAlternative: 'riflettere sul proprio modo di pensare', severity: 'high' },
  'neuroplasticità': { category: 'neuroscienze', simpleAlternative: 'capacità del cervello di cambiare', severity: 'high' },
  'trigger': { category: 'psicologia', simpleAlternative: 'innesco/stimolo', severity: 'medium' },
  'pattern': { category: 'comportamento', simpleAlternative: 'schema ricorrente', severity: 'medium' },
  'bias': { category: 'psicologia', simpleAlternative: 'pregiudizio/distorsione', severity: 'high' },
  'heuristica': { category: 'psicologia', simpleAlternative: 'scorciatoia mentale', severity: 'high' },
  'cognitive load': { category: 'psicologia', simpleAlternative: 'carico mentale', severity: 'high' },
  'flow': { category: 'psicologia', simpleAlternative: 'stato di concentrazione totale', severity: 'high' },
  'assertività': { category: 'comunicazione', simpleAlternative: 'capacità di esprimersi con fermezza', severity: 'medium' },
  'autoregolazione': { category: 'psicologia', simpleAlternative: 'controllo di sé', severity: 'medium' },
  'locus of control': { category: 'psicologia', simpleAlternative: 'senso di controllo sulla propria vita', severity: 'high' },
  'procrastinazione': { category: 'comportamento', simpleAlternative: 'rimandare continuamente', severity: 'low' },

  // Leadership - Termini specifici
  'leadership situazionale': { category: 'leadership', simpleAlternative: 'adattare lo stile alla situazione', severity: 'high' },
  'leadership trasformazionale': { category: 'leadership', simpleAlternative: 'leadership che ispira il cambiamento', severity: 'high' },
  'servant leadership': { category: 'leadership', simpleAlternative: 'leadership al servizio degli altri', severity: 'high' },
  'visionary leadership': { category: 'leadership', simpleAlternative: 'leadership con visione chiara', severity: 'high' },

  // Comunicazione
  'feedback': { category: 'comunicazione', simpleAlternative: 'riscontro/opinione', severity: 'low' },
  'briefing': { category: 'comunicazione', simpleAlternative: 'riunione informativa', severity: 'low' },
  'debriefing': { category: 'comunicazione', simpleAlternative: 'analisi post-evento', severity: 'medium' },
  'brainstorming': { category: 'creatività', simpleAlternative: 'sessione di idee libere', severity: 'low' },

  // Anglicismi comuni
  'skill': { category: 'generale', simpleAlternative: 'competenza/abilità', severity: 'low' },
  'goal': { category: 'generale', simpleAlternative: 'obiettivo', severity: 'low' },
  'target': { category: 'generale', simpleAlternative: 'obiettivo/traguardo', severity: 'low' },
  'focus': { category: 'generale', simpleAlternative: 'concentrazione/attenzione', severity: 'low' },
  'step': { category: 'generale', simpleAlternative: 'passo/fase', severity: 'low' },
  'approach': { category: 'generale', simpleAlternative: 'approccio/metodo', severity: 'low' },
  'challenge': { category: 'generale', simpleAlternative: 'sfida', severity: 'low' },
  'insight': { category: 'generale', simpleAlternative: 'intuizione/comprensione profonda', severity: 'medium' },
  'mindfulness': { category: 'benessere', simpleAlternative: 'consapevolezza del momento presente', severity: 'high' },
};

// Acronimi che richiedono espansione
const ACRONYMS: Record<string, {
  expansion: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
}> = {
  'KPI': { expansion: 'indicatore chiave di performance', category: 'business', severity: 'high' },
  'ROI': { expansion: 'ritorno sull\'investimento', category: 'business', severity: 'high' },
  'OKR': { expansion: 'obiettivi e risultati chiave', category: 'management', severity: 'high' },
  'CEO': { expansion: 'amministratore delegato', category: 'business', severity: 'low' },
  'CFO': { expansion: 'direttore finanziario', category: 'business', severity: 'medium' },
  'HR': { expansion: 'risorse umane', category: 'business', severity: 'low' },
  'B2B': { expansion: 'business tra aziende', category: 'business', severity: 'medium' },
  'B2C': { expansion: 'business verso consumatori', category: 'business', severity: 'medium' },
  'MVP': { expansion: 'prodotto minimo funzionante', category: 'startup', severity: 'high' },
  'CRM': { expansion: 'gestione relazioni clienti', category: 'business', severity: 'medium' },
  'EQ': { expansion: 'intelligenza emotiva', category: 'psicologia', severity: 'high' },
  'IQ': { expansion: 'quoziente intellettivo', category: 'psicologia', severity: 'low' },
  'SWOT': { expansion: 'punti di forza, debolezza, opportunità, minacce', category: 'business', severity: 'high' },
  'SMART': { expansion: 'specifico, misurabile, raggiungibile, rilevante, temporizzato', category: 'planning', severity: 'medium' },
};

// Pattern per rilevare spiegazioni inline
const EXPLANATION_PATTERNS = [
  /,\s*(cioè|ovvero|ossia|vale a dire)\s+/i,
  /\s*\([^)]+\)\s*/,  // parentesi con spiegazione
  /:\s*[^.]+/,  // due punti seguiti da spiegazione
  /,\s*che (significa|vuol dire)\s+/i,
  /—\s*[^—]+\s*—/,  // trattini con spiegazione
];

// ============================================================
// MAIN SERVICE
// ============================================================

/**
 * Verifica l'uso di parole/termini secondo il principio PAROLE
 */
export function checkParole(
  text: string,
  previousContent: string = ''
): ParoleCheckResult {
  const issues: ParoleIssue[] = [];
  let termsExplained = 0;

  // 1. Check termini tecnici
  const technicalIssues = findTechnicalTerms(text, previousContent);
  issues.push(...technicalIssues.issues);
  termsExplained += technicalIssues.explained;

  // 2. Check acronimi
  const acronymIssues = findAcronyms(text, previousContent);
  issues.push(...acronymIssues.issues);
  termsExplained += acronymIssues.explained;

  // 3. Check anglicismi eccessivi
  const anglicismIssues = findAnglicisms(text);
  issues.push(...anglicismIssues);

  // Calcola metriche
  const metrics = {
    technical_terms: issues.filter(i => i.type === 'technical_term').length,
    acronyms: issues.filter(i => i.type === 'acronym').length,
    jargon: issues.filter(i => i.type === 'jargon').length,
    complex_words: issues.filter(i => i.type === 'complex_word').length,
    anglicisms: issues.filter(i => i.type === 'anglicism').length,
    total_issues: issues.length,
    terms_explained: termsExplained,
  };

  // Calcola score
  let score = 100;

  // Penalità per severità
  for (const issue of issues) {
    switch (issue.severity) {
      case 'high': score -= 20; break;
      case 'medium': score -= 12; break;
      case 'low': score -= 5; break;
    }
  }

  // Bonus per termini spiegati
  score += Math.min(15, termsExplained * 5);

  // Normalizza
  score = Math.max(0, Math.min(100, score));

  // Genera suggerimenti
  const suggestions = generateParoleSuggestions(issues);

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
function findTechnicalTerms(
  text: string,
  previousContent: string
): { issues: ParoleIssue[]; explained: number } {
  const issues: ParoleIssue[] = [];
  let explained = 0;
  const textLower = text.toLowerCase();
  const previousLower = previousContent.toLowerCase();

  for (const [term, info] of Object.entries(TECHNICAL_TERMS)) {
    const termLower = term.toLowerCase();
    // Match come parola intera (con confini)
    const termRegex = new RegExp(`\\b${escapeRegex(termLower)}\\b`, 'gi');
    const matches = text.match(termRegex);

    if (matches && matches.length > 0) {
      const position = textLower.indexOf(termLower);

      // Verifica se spiegato nel testo corrente
      const isExplainedInText = isTermExplained(text, term);

      // Verifica se già spiegato in precedenza
      const wasExplainedBefore = previousLower.includes(termLower) &&
        (previousLower.includes('significa') ||
         previousLower.includes('cioè') ||
         previousLower.includes('ovvero'));

      if (isExplainedInText || wasExplainedBefore) {
        explained++;
      } else {
        issues.push({
          type: 'technical_term',
          severity: info.severity,
          term,
          category: info.category,
          simpleAlternative: info.simpleAlternative,
          context: extractContext(text, term),
          suggestion: `Sostituisci "${term}" con "${info.simpleAlternative}" oppure spiega: "${term}, cioè ${info.simpleAlternative}"`,
          position,
        });
      }
    }
  }

  return { issues, explained };
}

/**
 * Trova acronimi non espansi
 */
function findAcronyms(
  text: string,
  previousContent: string
): { issues: ParoleIssue[]; explained: number } {
  const issues: ParoleIssue[] = [];
  let explained = 0;

  for (const [acronym, info] of Object.entries(ACRONYMS)) {
    // Match acronimo come parola intera (case sensitive per acronimi)
    const acronymRegex = new RegExp(`\\b${acronym}\\b`, 'g');
    const matches = text.match(acronymRegex);

    if (matches && matches.length > 0) {
      const position = text.indexOf(acronym);

      // Verifica se espanso nel testo
      const expansionRegex = new RegExp(`${acronym}\\s*\\([^)]+\\)`, 'i');
      const isExpanded = expansionRegex.test(text) ||
        text.toLowerCase().includes(info.expansion.toLowerCase());

      // Verifica se già espanso prima
      const wasExpandedBefore = previousContent.includes(acronym) &&
        previousContent.toLowerCase().includes(info.expansion.toLowerCase());

      if (isExpanded || wasExpandedBefore) {
        explained++;
      } else {
        issues.push({
          type: 'acronym',
          severity: info.severity,
          term: acronym,
          category: info.category,
          simpleAlternative: info.expansion,
          context: extractContext(text, acronym),
          suggestion: `Espandi "${acronym}" alla prima occorrenza: "${acronym} (${info.expansion})"`,
          position,
        });
      }
    }
  }

  return { issues, explained };
}

/**
 * Trova anglicismi quando esistono alternative italiane
 */
function findAnglicisms(text: string): ParoleIssue[] {
  const issues: ParoleIssue[] = [];

  // Lista di anglicismi con alternative italiane preferibili
  const anglicisms: Record<string, { italian: string; severity: 'low' | 'medium' }> = {
    'meeting': { italian: 'riunione', severity: 'low' },
    'call': { italian: 'chiamata/telefonata', severity: 'low' },
    'mail': { italian: 'email/posta', severity: 'low' },
    'job': { italian: 'lavoro', severity: 'low' },
    'task': { italian: 'compito/attività', severity: 'low' },
    'planning': { italian: 'pianificazione', severity: 'low' },
    'training': { italian: 'formazione', severity: 'low' },
    'report': { italian: 'rapporto/resoconto', severity: 'low' },
    'business': { italian: 'attività/affari', severity: 'low' },
    'management': { italian: 'gestione', severity: 'low' },
    'marketing': { italian: 'promozione', severity: 'low' },
    'budget': { italian: 'bilancio preventivo', severity: 'low' },
    'deadline': { italian: 'scadenza', severity: 'medium' },
    'performance': { italian: 'prestazione/rendimento', severity: 'low' },
    'gap': { italian: 'divario/lacuna', severity: 'medium' },
  };

  // Conta anglicismi (solo se ce ne sono troppi)
  let anglicismCount = 0;
  const textLower = text.toLowerCase();

  for (const [english, info] of Object.entries(anglicisms)) {
    if (new RegExp(`\\b${english}\\b`, 'i').test(textLower)) {
      anglicismCount++;
    }
  }

  // Segnala solo se ci sono più di 3 anglicismi (uso eccessivo)
  if (anglicismCount > 3) {
    for (const [english, info] of Object.entries(anglicisms)) {
      const regex = new RegExp(`\\b${english}\\b`, 'gi');
      if (regex.test(text)) {
        const position = textLower.indexOf(english.toLowerCase());
        issues.push({
          type: 'anglicism',
          severity: info.severity,
          term: english,
          category: 'anglicismo',
          simpleAlternative: info.italian,
          context: extractContext(text, english),
          suggestion: `Considera l'alternativa italiana: "${info.italian}" invece di "${english}"`,
          position,
        });
      }
    }
  }

  return issues;
}

/**
 * Verifica se un termine è spiegato nel testo
 */
function isTermExplained(text: string, term: string): boolean {
  const termLower = term.toLowerCase();
  const textLower = text.toLowerCase();

  // Pattern che indicano una spiegazione
  const patterns = [
    new RegExp(`${escapeRegex(termLower)}[,:]?\\s*(cioè|ovvero|ossia|significa|vale a dire)`, 'i'),
    new RegExp(`(cioè|ovvero|ossia)\\s+[^.]*${escapeRegex(termLower)}`, 'i'),
    new RegExp(`${escapeRegex(termLower)}\\s*\\([^)]+\\)`, 'i'),
    new RegExp(`cosa (significa|vuol dire)\\s+[^.]*${escapeRegex(termLower)}`, 'i'),
    new RegExp(`${escapeRegex(termLower)}[^.]*—[^—]+—`, 'i'),
  ];

  return patterns.some(p => p.test(textLower));
}

/**
 * Estrae contesto attorno a un termine
 */
function extractContext(text: string, term: string): string {
  const index = text.toLowerCase().indexOf(term.toLowerCase());
  if (index === -1) return text.substring(0, 80);

  const start = Math.max(0, index - 40);
  const end = Math.min(text.length, index + term.length + 40);

  let context = text.substring(start, end);
  if (start > 0) context = '...' + context;
  if (end < text.length) context = context + '...';

  return context;
}

/**
 * Escape caratteri speciali per regex
 */
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Genera suggerimenti basati sugli issues
 */
function generateParoleSuggestions(issues: ParoleIssue[]): string[] {
  const suggestions: string[] = [];

  const highSeverity = issues.filter(i => i.severity === 'high');
  const mediumSeverity = issues.filter(i => i.severity === 'medium');

  if (highSeverity.length > 0) {
    suggestions.push(`${highSeverity.length} termini complessi richiedono spiegazione immediata`);
  }

  if (mediumSeverity.length > 2) {
    suggestions.push('Troppi termini tecnici - semplifica il linguaggio');
  }

  if (issues.filter(i => i.type === 'acronym').length > 0) {
    suggestions.push('Espandi gli acronimi alla prima occorrenza');
  }

  if (issues.filter(i => i.type === 'anglicism').length > 2) {
    suggestions.push('Riduci gli anglicismi - usa alternative italiane quando possibile');
  }

  if (suggestions.length === 0) {
    suggestions.push('Ottimo uso del linguaggio - chiaro e accessibile');
  }

  return suggestions;
}

// ============================================================
// EXPORTS AGGIUNTIVI
// ============================================================

/**
 * Suggerisce riscrittura per un termine specifico
 */
export function suggestParoleRewrite(term: string): string | null {
  const termLower = term.toLowerCase();

  // Check termini tecnici
  if (TECHNICAL_TERMS[termLower]) {
    const info = TECHNICAL_TERMS[termLower];
    return `"${info.simpleAlternative}" oppure "${term}, cioè ${info.simpleAlternative}"`;
  }

  // Check acronimi
  if (ACRONYMS[term]) {
    const info = ACRONYMS[term];
    return `"${term} (${info.expansion})"`;
  }

  return null;
}

/**
 * Ottiene lista termini tecnici per categoria
 */
export function getTermsByCategory(category: string): string[] {
  return Object.entries(TECHNICAL_TERMS)
    .filter(([_, info]) => info.category === category)
    .map(([term, _]) => term);
}
