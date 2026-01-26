# CODE QUALITY GUARD - Vitaeology

**Versione:** 1.0  
**Data:** 26 Gennaio 2026  
**Conformità:** MEGA_PROMPT v4.2 - Sezione Qualità e Istituzione

---

## 1. Scopo del Documento

Questo documento definisce il sistema di controllo qualità del codice per Vitaeology, progettato per identificare pattern problematici tipici del codice AI-generato prima che raggiungano la produzione.

### Principio Guida

> "Il codice AI può avere 'cecità' verso i propri errori. Un secondo occhio automatizzato mitiga questo rischio."

Riferimento ai 4 Prodotti: questo sistema appartiene alla categoria **Correzione di Ciò che Produce** - assicura che lo strumento di produzione (il codice) sia privo di difetti.

---

## 2. Pattern Problematici da Rilevare

### 2.1 Categorie di Code Smell

| Categoria | Descrizione | Rischio | Priorità |
|-----------|-------------|---------|----------|
| **Errori Silenziati** | Catch vuoti, errori ignorati | Bug invisibili | 🔴 Critico |
| **Complessità Eccessiva** | Funzioni >50 righe, nesting >4 | Manutenibilità | 🟡 Alto |
| **Type Safety** | Uso di `any`, cast non sicuri | Bug runtime | 🟡 Alto |
| **Resource Leak** | Connessioni non chiuse | Memory leak | 🔴 Critico |
| **Async Pericolosi** | Promise non gestite | Crash silenziosi | 🔴 Critico |
| **Codice Duplicato** | Copy-paste senza refactor | Inconsistenza | 🟡 Alto |
| **Security** | Secret hardcoded, input non validati | Vulnerabilità | 🔴 Critico |
| **Performance** | N+1 query, await sequenziali | Lentezza | 🟠 Medio |

### 2.2 Pattern Specifici AI-Generato

Il codice prodotto da modelli come Claude tende a:

1. **Over-engineering**: Creare astrazioni non necessarie
2. **Verbosità**: Scrivere 50 righe dove ne bastano 10
3. **Inconsistenza**: Usare pattern diversi per problemi simili
4. **Commenti ridondanti**: Commentare l'ovvio invece del perché
5. **Error handling incompleto**: Gestire alcuni errori, dimenticarne altri

---

## 3. Configurazione ESLint Potenziato

### 3.1 Regole Base

**File:** `.eslintrc.json` o `eslint.config.js`

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:promise/recommended"
  ],
  "plugins": [
    "@typescript-eslint",
    "promise"
  ],
  "rules": {
    "complexity": ["warn", 10],
    "max-depth": ["warn", 4],
    "max-lines-per-function": ["warn", { "max": 50, "skipBlankLines": true, "skipComments": true }],
    "max-params": ["warn", 4],
    
    "no-empty": "error",
    "@typescript-eslint/no-empty-function": "error",
    
    "require-await": "warn",
    "promise/no-nesting": "warn",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-misused-promises": "error",
    
    "no-async-promise-executor": "error",
    
    "@typescript-eslint/no-unused-vars": "error",
    "no-unreachable": "error",
    
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

### 3.2 Installazione Dipendenze

```bash
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-promise
```

---

## 4. Script Code Quality Check

### 4.1 Struttura dello Script

**File:** `scripts/code-quality-check.ts`

```typescript
#!/usr/bin/env npx ts-node

/**
 * CODE QUALITY GUARD
 * Rileva pattern problematici tipici di codice AI-generato
 * 
 * Uso: npx ts-node scripts/code-quality-check.ts [--fix] [--output=json]
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

// ============================================
// TIPI
// ============================================

interface CodeSmell {
  file: string;
  line: number;
  column?: number;
  severity: 'error' | 'warning' | 'info';
  rule: string;
  message: string;
  suggestion?: string;
}

interface SmellPattern {
  name: string;
  pattern: RegExp;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
}

interface QualityReport {
  timestamp: string;
  score: number;
  totalFiles: number;
  smells: CodeSmell[];
  summary: {
    errors: number;
    warnings: number;
    info: number;
  };
  topIssues: string[];
}

// ============================================
// PATTERN DA CERCARE
// ============================================

const SMELL_PATTERNS: SmellPattern[] = [
  // ERRORI SILENZIATI
  {
    name: 'empty-catch',
    pattern: /catch\s*\([^)]*\)\s*\{\s*\}/g,
    severity: 'error',
    message: 'Catch vuoto - gli errori vengono silenziati',
    suggestion: 'Aggiungi logging o gestione dell\'errore'
  },
  {
    name: 'catch-without-handling',
    pattern: /catch\s*\([^)]*\)\s*\{\s*\/\/.*\s*\}/g,
    severity: 'warning',
    message: 'Catch con solo commento - errore probabilmente non gestito',
    suggestion: 'Implementa gestione errore o usa logSystem()'
  },
  
  // CONSOLE IN PRODUZIONE
  {
    name: 'console-log',
    pattern: /console\.(log|debug|info)\(/g,
    severity: 'warning',
    message: 'Console.log in codice - rimuovere o sostituire con logger',
    suggestion: 'Usa logSystem() per logging strutturato'
  },
  
  // TYPE SAFETY
  {
    name: 'any-type',
    pattern: /:\s*any\b/g,
    severity: 'warning',
    message: 'Tipo "any" - perdita di type safety',
    suggestion: 'Definisci un tipo specifico o usa unknown'
  },
  {
    name: 'type-assertion-any',
    pattern: /as\s+any\b/g,
    severity: 'warning',
    message: 'Cast a "any" - bypass del type system',
    suggestion: 'Usa type guard o tipo specifico'
  },
  
  // TODO/FIXME
  {
    name: 'todo-fixme',
    pattern: /(TODO|FIXME|HACK|XXX):/gi,
    severity: 'info',
    message: 'TODO/FIXME trovato - verificare se risolto',
    suggestion: 'Risolvi o crea issue per tracciamento'
  },
  
  // SECURITY
  {
    name: 'hardcoded-secret',
    pattern: /(password|secret|api_key|apikey|token)\s*[=:]\s*['"][^'"]{8,}['"]/gi,
    severity: 'error',
    message: 'Possibile secret hardcoded - usare env variables',
    suggestion: 'Sposta in .env e usa process.env.NOME_VAR'
  },
  {
    name: 'exposed-credentials',
    pattern: /(sk-|pk_live_|sk_live_|ghp_|gho_)[a-zA-Z0-9]+/g,
    severity: 'error',
    message: 'Credenziale API esposta nel codice',
    suggestion: 'RIMUOVI IMMEDIATAMENTE e ruota la chiave'
  },
  
  // SUPABASE SPECIFICI
  {
    name: 'supabase-no-error-check',
    pattern: /const\s*\{\s*data\s*\}\s*=\s*await\s+supabase/g,
    severity: 'warning',
    message: 'Query Supabase senza destructuring di error',
    suggestion: 'Usa: const { data, error } = await supabase...'
  },
  
  // ASYNC PROBLEMATICI
  {
    name: 'promise-without-catch',
    pattern: /\.then\([^)]+\)(?!\s*\.catch)/g,
    severity: 'warning',
    message: 'Promise .then() senza .catch()',
    suggestion: 'Aggiungi .catch() o usa async/await con try/catch'
  },
  
  // DUPLICAZIONE
  {
    name: 'duplicate-import',
    pattern: /import\s+.*from\s+['"]([^'"]+)['"][\s\S]*?import\s+.*from\s+['"]\1['"]/g,
    severity: 'info',
    message: 'Import duplicato dallo stesso modulo',
    suggestion: 'Combina gli import in una singola dichiarazione'
  }
];

// ============================================
// FUNZIONI PRINCIPALI
// ============================================

async function scanFile(filePath: string): Promise<CodeSmell[]> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const smells: CodeSmell[] = [];
  
  for (const pattern of SMELL_PATTERNS) {
    let match;
    const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
    
    while ((match = regex.exec(content)) !== null) {
      // Trova la linea del match
      const beforeMatch = content.substring(0, match.index);
      const lineNumber = beforeMatch.split('\n').length;
      
      smells.push({
        file: filePath,
        line: lineNumber,
        severity: pattern.severity,
        rule: pattern.name,
        message: pattern.message,
        suggestion: pattern.suggestion
      });
    }
  }
  
  return smells;
}

async function scanDirectory(dir: string): Promise<CodeSmell[]> {
  const files = await glob(`${dir}/**/*.{ts,tsx}`, {
    ignore: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/*.test.ts',
      '**/*.spec.ts'
    ]
  });
  
  const allSmells: CodeSmell[] = [];
  
  for (const file of files) {
    const fileSmells = await scanFile(file);
    allSmells.push(...fileSmells);
  }
  
  return allSmells;
}

function calculateScore(smells: CodeSmell[]): number {
  let score = 100;
  
  for (const smell of smells) {
    switch (smell.severity) {
      case 'error': score -= 10; break;
      case 'warning': score -= 3; break;
      case 'info': score -= 1; break;
    }
  }
  
  return Math.max(0, score);
}

function generateReport(smells: CodeSmell[], totalFiles: number): QualityReport {
  const errors = smells.filter(s => s.severity === 'error').length;
  const warnings = smells.filter(s => s.severity === 'warning').length;
  const info = smells.filter(s => s.severity === 'info').length;
  
  // Top issues raggruppati per regola
  const byRule = smells.reduce((acc, s) => {
    acc[s.rule] = (acc[s.rule] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topIssues = Object.entries(byRule)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([rule, count]) => `${rule}: ${count} occorrenze`);
  
  return {
    timestamp: new Date().toISOString(),
    score: calculateScore(smells),
    totalFiles,
    smells,
    summary: { errors, warnings, info },
    topIssues
  };
}

function formatConsoleOutput(report: QualityReport): void {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('           CODE QUALITY GUARD - REPORT');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const scoreEmoji = report.score >= 80 ? '🟢' : report.score >= 60 ? '🟡' : '🔴';
  console.log(`Score: ${report.score}/100 ${scoreEmoji}\n`);
  
  console.log(`Riepilogo:`);
  console.log(`  🔴 Errori:   ${report.summary.errors}`);
  console.log(`  🟡 Warning:  ${report.summary.warnings}`);
  console.log(`  ℹ️  Info:     ${report.summary.info}`);
  console.log(`  📁 File:     ${report.totalFiles}\n`);
  
  if (report.topIssues.length > 0) {
    console.log('Top Issues:');
    report.topIssues.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue}`);
    });
    console.log('');
  }
  
  // Dettagli errori critici
  const criticalSmells = report.smells.filter(s => s.severity === 'error');
  if (criticalSmells.length > 0) {
    console.log('Errori Critici da Risolvere:');
    criticalSmells.forEach(smell => {
      console.log(`  🔴 ${smell.file}:${smell.line}`);
      console.log(`     ${smell.message}`);
      if (smell.suggestion) {
        console.log(`     💡 ${smell.suggestion}`);
      }
    });
  }
  
  console.log('\n═══════════════════════════════════════════════════════\n');
}

// ============================================
// MAIN
// ============================================

async function main() {
  const args = process.argv.slice(2);
  const outputJson = args.includes('--output=json');
  const failOnError = args.includes('--fail-on-error');
  
  const srcDir = path.join(process.cwd(), 'src');
  
  console.log('Scanning codebase...');
  const smells = await scanDirectory(srcDir);
  
  const files = await glob(`${srcDir}/**/*.{ts,tsx}`, {
    ignore: ['**/node_modules/**', '**/.next/**']
  });
  
  const report = generateReport(smells, files.length);
  
  if (outputJson) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    formatConsoleOutput(report);
  }
  
  // Exit con errore se richiesto e ci sono errori critici
  if (failOnError && report.summary.errors > 0) {
    process.exit(1);
  }
}

main().catch(console.error);
```

### 4.2 NPM Scripts

Aggiungi a `package.json`:

```json
{
  "scripts": {
    "quality": "npx ts-node scripts/code-quality-check.ts",
    "quality:json": "npm run quality -- --output=json",
    "quality:ci": "npm run quality -- --fail-on-error",
    "quality:full": "npm run lint && npm run quality"
  }
}
```

---

## 5. Checklist Review Manuale

Per aspetti che l'automazione non può verificare, usa questa checklist.

### 5.1 Checklist Pre-Deploy

```markdown
## Review Codice AI-Generato

### Logica di Business
- [ ] Il codice fa effettivamente quello che dovrebbe?
- [ ] Ci sono edge case non gestiti?
- [ ] La logica rispetta il Principio Validante?
- [ ] Il flusso ESSERE→FARE→AVERE è rispettato?

### Sicurezza
- [ ] Input utente validati e sanitizzati?
- [ ] Query SQL parametrizzate (no string concat)?
- [ ] Auth/authz verificati su ogni endpoint?
- [ ] Nessun secret in chiaro nel codice?

### Performance
- [ ] Query N+1 assenti?
- [ ] Dati non necessari non caricati?
- [ ] Paginazione implementata dove serve?

### UX / Principio Validante
- [ ] Messaggi errore non colpevolizzanti?
- [ ] Feedback positivo prima di critica?
- [ ] Linguaggio che valida, non che giudica?

### Manutenibilità
- [ ] Codice leggibile senza commenti eccessivi?
- [ ] Nomi variabili/funzioni chiari e in italiano dove serve?
- [ ] Struttura file conforme a MEGA_PROMPT?
```

### 5.2 Quando Usare la Checklist

| Momento | Checklist Richiesta |
|---------|---------------------|
| Prima di ogni merge a main | ✅ Completa |
| Durante sviluppo feature | ✅ Logica + Sicurezza |
| Hotfix urgente | ✅ Sicurezza minima |
| Refactoring | ✅ Manutenibilità |

---

## 6. Integrazione con Dashboard Health

### 6.1 API Endpoint

**File:** `src/app/api/admin/code-quality/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Verifica admin...
    
    const { stdout } = await execAsync('npm run quality:json');
    const report = JSON.parse(stdout);
    
    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to run quality check' },
      { status: 500 }
    );
  }
}
```

### 6.2 Sezione Dashboard

Aggiungi alla pagina `/admin/health`:

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 CODE QUALITY SCORE                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Score Complessivo: 87/100  🟢                                  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ❌ Errori critici:     2                                 │  │
│  │ ⚠️  Warning:           12                                │  │
│  │ ℹ️  Info:              8                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  TOP PROBLEMI:                                                  │
│  1. 🔴 empty-catch: 2 occorrenze                               │
│  2. 🟡 any-type: 5 occorrenze                                  │
│  3. 🟡 console-log: 4 occorrenze                               │
│                                                                 │
│  [Esegui Analisi]  [Scarica Report JSON]                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Soglie e Calibrazione

### 7.1 Soglie Consigliate

| Metrica | Verde | Giallo | Rosso |
|---------|-------|--------|-------|
| Score | ≥80 | 60-79 | <60 |
| Errori Critici | 0 | 1-3 | >3 |
| Complessità Funzione | ≤10 | 11-15 | >15 |
| Righe per Funzione | ≤50 | 51-80 | >80 |
| Tipo `any` | 0 | 1-5 | >5 |

### 7.2 Calibrazione Periodica

Ogni mese, rivedi le soglie basandoti su:
- Numero di bug in produzione
- Tempo medio di debug
- Feedback del team

---

## 8. Checklist Implementazione

- [ ] Aggiornare `.eslintrc.json` con regole potenziate
- [ ] Installare dipendenze ESLint aggiuntive
- [ ] Creare `scripts/code-quality-check.ts`
- [ ] Aggiungere npm scripts a `package.json`
- [ ] Testare su codebase esistente
- [ ] Calibrare soglie se necessario
- [ ] Creare API `/api/admin/code-quality`
- [ ] Integrare sezione in `/admin/health`
- [ ] Creare file `docs/CODE_REVIEW_CHECKLIST.md`

---

## 9. Riferimenti MEGA_PROMPT

| Sezione | Allineamento |
|---------|--------------|
| 4 Prodotti | Correzione di Ciò che Produce |
| Qualità | Grado di perfezione del codice |
| Quantità | Copertura analisi su tutto il codebase |
| Viability | Prevenzione bug prima della produzione |
| Framework Comprensione | Report chiari con suggerimenti concreti |

---

*Documento generato il 26/01/2026 - Vitaeology Code Quality Guard v1.0*
