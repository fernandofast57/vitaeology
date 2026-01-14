/**
 * Changelog Automatico
 *
 * Genera un changelog leggibile dai commit git recenti.
 * Uso: npm run changelog
 *
 * Il changelog viene salvato in CHANGELOG.md con:
 * - Data di ogni modifica
 * - Descrizione semplice
 * - Tipo di modifica (feat, fix, docs, etc.)
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Configurazione
const CHANGELOG_PATH = path.join(process.cwd(), 'CHANGELOG.md');
const MAX_COMMITS = 100; // Ultimi N commit da includere

interface Commit {
  hash: string;
  date: string;
  type: string;
  scope: string | null;
  message: string;
  body: string;
  author: string;
}

// Colori per output console
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

/**
 * Ottiene i commit da git log
 */
function getCommits(): Commit[] {
  try {
    // Usa un delimitatore unico per separare i commit
    const DELIMITER = '---COMMIT_END---';

    // Formato: hash|date|subject|author (senza body per evitare problemi multiline)
    const log = execSync(
      `git log --pretty=format:"%h|%ad|%s|%an${DELIMITER}" --date=short -n ${MAX_COMMITS}`,
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    );

    const commits: Commit[] = [];
    const entries = log.split(DELIMITER);

    for (const entry of entries) {
      const trimmed = entry.trim();
      if (!trimmed) continue;

      const parts = trimmed.split('|');
      if (parts.length < 4) continue;

      const [hash, date, subject, author] = parts;

      // Parse conventional commit format: type(scope): message
      const match = subject.match(/^(\w+)(?:\(([^)]+)\))?:\s*(.+)$/);

      if (match) {
        commits.push({
          hash,
          date,
          type: match[1],
          scope: match[2] || null,
          message: match[3],
          body: '',
          author
        });
      } else {
        // Commit non conventional - usa come "other"
        commits.push({
          hash,
          date,
          type: 'other',
          scope: null,
          message: subject,
          body: '',
          author
        });
      }
    }

    return commits;
  } catch (err) {
    console.error('Errore lettura git log:', err);
    return [];
  }
}

/**
 * Traduce il tipo di commit in italiano
 */
function translateType(type: string): string {
  const translations: Record<string, string> = {
    feat: '✨ Nuova Funzionalità',
    fix: '🐛 Correzione Bug',
    docs: '📚 Documentazione',
    style: '💄 Stile/Formattazione',
    refactor: '♻️ Refactoring',
    perf: '⚡ Performance',
    test: '🧪 Test',
    build: '📦 Build/Deploy',
    ci: '🔧 CI/CD',
    chore: '🔨 Manutenzione',
    revert: '⏪ Revert',
    other: '📝 Altro'
  };

  return translations[type] || `📝 ${type}`;
}

/**
 * Raggruppa i commit per data
 */
function groupByDate(commits: Commit[]): Map<string, Commit[]> {
  const grouped = new Map<string, Commit[]>();

  for (const commit of commits) {
    const existing = grouped.get(commit.date) || [];
    existing.push(commit);
    grouped.set(commit.date, existing);
  }

  return grouped;
}

/**
 * Formatta una data in italiano
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Genera il contenuto del changelog
 */
function generateChangelog(commits: Commit[]): string {
  const grouped = groupByDate(commits);
  const sortedDates = Array.from(grouped.keys()).sort().reverse();

  let content = `# Changelog Vitaeology

> Registro automatico delle modifiche al progetto.
> Ultimo aggiornamento: ${new Date().toLocaleString('it-IT')}

---

`;

  for (const date of sortedDates) {
    const dayCommits = grouped.get(date) || [];
    const formattedDate = formatDate(date);

    content += `## 📅 ${formattedDate}\n\n`;

    // Raggruppa per tipo
    const byType = new Map<string, Commit[]>();
    for (const commit of dayCommits) {
      const existing = byType.get(commit.type) || [];
      existing.push(commit);
      byType.set(commit.type, existing);
    }

    // Ordine preferito dei tipi
    const typeOrder = ['feat', 'fix', 'perf', 'refactor', 'docs', 'test', 'build', 'ci', 'chore', 'other'];

    for (const type of typeOrder) {
      const typeCommits = byType.get(type);
      if (!typeCommits || typeCommits.length === 0) continue;

      content += `### ${translateType(type)}\n\n`;

      for (const commit of typeCommits) {
        const scope = commit.scope ? `**${commit.scope}**: ` : '';
        content += `- ${scope}${commit.message} (\`${commit.hash}\`)\n`;
      }

      content += '\n';
    }

    content += '---\n\n';
  }

  // Footer
  content += `
## 📊 Statistiche

- **Totale commit**: ${commits.length}
- **Nuove funzionalità**: ${commits.filter(c => c.type === 'feat').length}
- **Bug fix**: ${commits.filter(c => c.type === 'fix').length}
- **Refactoring**: ${commits.filter(c => c.type === 'refactor').length}

---

*Generato automaticamente da \`npm run changelog\`*
`;

  return content;
}

/**
 * Main
 */
function main() {
  console.log(`\n${YELLOW}📋 Generazione Changelog...${RESET}\n`);

  const commits = getCommits();

  if (commits.length === 0) {
    console.log('Nessun commit trovato.');
    return;
  }

  console.log(`Trovati ${commits.length} commit\n`);

  const changelog = generateChangelog(commits);

  fs.writeFileSync(CHANGELOG_PATH, changelog, 'utf-8');

  console.log(`${GREEN}✅ Changelog aggiornato: CHANGELOG.md${RESET}`);
  console.log(`   ${commits.length} commit documentati\n`);

  // Mostra statistiche
  const stats = {
    feat: commits.filter(c => c.type === 'feat').length,
    fix: commits.filter(c => c.type === 'fix').length,
    docs: commits.filter(c => c.type === 'docs').length,
    refactor: commits.filter(c => c.type === 'refactor').length,
  };

  console.log('Statistiche:');
  console.log(`  ✨ Nuove funzionalità: ${stats.feat}`);
  console.log(`  🐛 Bug fix: ${stats.fix}`);
  console.log(`  📚 Documentazione: ${stats.docs}`);
  console.log(`  ♻️  Refactoring: ${stats.refactor}`);
  console.log('');
}

main();
