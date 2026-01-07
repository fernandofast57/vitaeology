/**
 * Genera una mappa completa della struttura dell'applicazione
 * - Tutte le pagine (routes)
 * - Tutti gli API endpoints
 * - Collegamenti tra componenti
 */

const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'src');
const appPath = path.join(srcPath, 'app');

// Risultati
const pages = [];
const apiEndpoints = [];
const components = [];
const libs = [];

function scanDirectory(dir, basePath = '') {
  if (!fs.existsSync(dir)) return;

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Gestisci route groups (parentesi)
      const routePath = item.startsWith('(') ? basePath : `${basePath}/${item}`;
      scanDirectory(fullPath, routePath);
    } else if (item === 'page.tsx' || item === 'page.ts') {
      // È una pagina
      const route = basePath || '/';
      const content = fs.readFileSync(fullPath, 'utf-8');
      const hasClient = content.includes("'use client'");
      const hasAuth = content.includes('getUser') || content.includes('useAuth');

      pages.push({
        route,
        file: fullPath.replace(srcPath, 'src'),
        type: hasClient ? 'client' : 'server',
        requiresAuth: hasAuth
      });
    } else if (item === 'route.tsx' || item === 'route.ts') {
      // È un API endpoint
      const route = basePath;
      const content = fs.readFileSync(fullPath, 'utf-8');
      const methods = [];
      if (content.includes('export async function GET') || content.includes('export function GET')) methods.push('GET');
      if (content.includes('export async function POST') || content.includes('export function POST')) methods.push('POST');
      if (content.includes('export async function PUT') || content.includes('export function PUT')) methods.push('PUT');
      if (content.includes('export async function DELETE') || content.includes('export function DELETE')) methods.push('DELETE');
      if (content.includes('export async function PATCH') || content.includes('export function PATCH')) methods.push('PATCH');

      apiEndpoints.push({
        route,
        file: fullPath.replace(srcPath, 'src'),
        methods
      });
    }
  }
}

function scanComponents(dir) {
  if (!fs.existsSync(dir)) return;

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanComponents(fullPath);
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      const relativePath = fullPath.replace(path.join(srcPath, 'components'), '');
      components.push({
        name: item.replace('.tsx', '').replace('.ts', ''),
        path: `src/components${relativePath}`,
        category: relativePath.split(path.sep)[1] || 'root'
      });
    }
  }
}

function scanLib(dir) {
  if (!fs.existsSync(dir)) return;

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanLib(fullPath);
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      const relativePath = fullPath.replace(path.join(srcPath, 'lib'), '');
      libs.push({
        name: item.replace('.tsx', '').replace('.ts', ''),
        path: `src/lib${relativePath}`,
        category: relativePath.split(path.sep)[1] || 'root'
      });
    }
  }
}

// Esegui scan
console.log('Scanning application structure...\n');
scanDirectory(appPath);
scanComponents(path.join(srcPath, 'components'));
scanLib(path.join(srcPath, 'lib'));

// Ordina
pages.sort((a, b) => a.route.localeCompare(b.route));
apiEndpoints.sort((a, b) => a.route.localeCompare(b.route));

// Output
console.log('='.repeat(80));
console.log('VITAEOLOGY - STRUTTURA APPLICAZIONE COMPLETA');
console.log('='.repeat(80));

console.log('\n' + '─'.repeat(80));
console.log('📄 PAGINE (Frontend Routes)');
console.log('─'.repeat(80));

// Raggruppa pagine per sezione
const pageGroups = {};
pages.forEach(p => {
  const section = p.route.split('/')[1] || 'home';
  if (!pageGroups[section]) pageGroups[section] = [];
  pageGroups[section].push(p);
});

Object.keys(pageGroups).sort().forEach(section => {
  console.log(`\n┌─ ${section.toUpperCase()} ─────────────────────────────────────`);
  pageGroups[section].forEach(p => {
    const auth = p.requiresAuth ? '🔒' : '🌐';
    const type = p.type === 'client' ? '⚡' : '🖥️';
    console.log(`│  ${auth} ${type} ${p.route.padEnd(45)}`);
  });
  console.log('└' + '─'.repeat(50));
});

console.log('\n' + '─'.repeat(80));
console.log('🔌 API ENDPOINTS');
console.log('─'.repeat(80));

// Raggruppa API per sezione
const apiGroups = {};
apiEndpoints.forEach(e => {
  const parts = e.route.split('/').filter(Boolean);
  const section = parts[1] || 'root'; // dopo /api/
  if (!apiGroups[section]) apiGroups[section] = [];
  apiGroups[section].push(e);
});

Object.keys(apiGroups).sort().forEach(section => {
  console.log(`\n┌─ /api/${section} ─────────────────────────────────────`);
  apiGroups[section].forEach(e => {
    const methods = e.methods.join(', ').padEnd(15);
    console.log(`│  [${methods}] ${e.route}`);
  });
  console.log('└' + '─'.repeat(50));
});

console.log('\n' + '─'.repeat(80));
console.log('🧩 COMPONENTI');
console.log('─'.repeat(80));

const compGroups = {};
components.forEach(c => {
  if (!compGroups[c.category]) compGroups[c.category] = [];
  compGroups[c.category].push(c);
});

Object.keys(compGroups).sort().forEach(cat => {
  console.log(`\n┌─ ${cat} ─────────────────────────────────────`);
  compGroups[cat].forEach(c => {
    console.log(`│  ${c.name}`);
  });
  console.log('└' + '─'.repeat(50));
});

console.log('\n' + '─'.repeat(80));
console.log('📚 LIBRERIE (src/lib)');
console.log('─'.repeat(80));

const libGroups = {};
libs.forEach(l => {
  if (!libGroups[l.category]) libGroups[l.category] = [];
  libGroups[l.category].push(l);
});

Object.keys(libGroups).sort().forEach(cat => {
  console.log(`\n┌─ ${cat} ─────────────────────────────────────`);
  libGroups[cat].forEach(l => {
    console.log(`│  ${l.name}`);
  });
  console.log('└' + '─'.repeat(50));
});

// Statistiche
console.log('\n' + '='.repeat(80));
console.log('📊 STATISTICHE');
console.log('='.repeat(80));
console.log(`\n  Pagine totali:      ${pages.length}`);
console.log(`  API endpoints:      ${apiEndpoints.length}`);
console.log(`  Componenti:         ${components.length}`);
console.log(`  Librerie:           ${libs.length}`);

// Genera anche file markdown
const mdContent = generateMarkdown(pages, apiEndpoints, components, libs, pageGroups, apiGroups);
const mdPath = path.join(__dirname, '..', 'docs', 'APP_STRUCTURE.md');
fs.writeFileSync(mdPath, mdContent);
console.log(`\n✅ Documentazione salvata in: docs/APP_STRUCTURE.md`);

function generateMarkdown(pages, apiEndpoints, components, libs, pageGroups, apiGroups) {
  let md = `# Vitaeology - Struttura Applicazione

> Generato automaticamente il ${new Date().toLocaleDateString('it-IT')}

## Indice

- [Pagine Frontend](#pagine-frontend)
- [API Endpoints](#api-endpoints)
- [Componenti](#componenti)
- [Librerie](#librerie)
- [Flussi Principali](#flussi-principali)

---

## Pagine Frontend

| Route | Tipo | Auth | Descrizione |
|-------|------|------|-------------|
`;

  pages.forEach(p => {
    const auth = p.requiresAuth ? '🔒' : '🌐';
    const type = p.type === 'client' ? 'Client' : 'Server';
    md += `| \`${p.route}\` | ${type} | ${auth} | |\n`;
  });

  md += `\n### Legenda
- 🔒 Richiede autenticazione
- 🌐 Pubblica
- Client = Rendering lato client
- Server = Rendering lato server

---

## API Endpoints

`;

  Object.keys(apiGroups).sort().forEach(section => {
    md += `### /api/${section}\n\n`;
    md += `| Endpoint | Metodi | Descrizione |\n`;
    md += `|----------|--------|-------------|\n`;
    apiGroups[section].forEach(e => {
      md += `| \`${e.route}\` | ${e.methods.join(', ')} | |\n`;
    });
    md += '\n';
  });

  md += `---

## Componenti

`;

  const compGroups = {};
  components.forEach(c => {
    if (!compGroups[c.category]) compGroups[c.category] = [];
    compGroups[c.category].push(c);
  });

  Object.keys(compGroups).sort().forEach(cat => {
    md += `### ${cat}\n\n`;
    compGroups[cat].forEach(c => {
      md += `- \`${c.name}\`\n`;
    });
    md += '\n';
  });

  md += `---

## Librerie

`;

  const libGroups = {};
  libs.forEach(l => {
    if (!libGroups[l.category]) libGroups[l.category] = [];
    libGroups[l.category].push(l);
  });

  Object.keys(libGroups).sort().forEach(cat => {
    md += `### ${cat}\n\n`;
    libGroups[cat].forEach(l => {
      md += `- \`${l.name}\`\n`;
    });
    md += '\n';
  });

  md += `---

## Flussi Principali

### 1. Challenge 7 Giorni

\`\`\`
/challenge/[type]        → Landing page con form iscrizione
    ↓ POST /api/challenge/subscribe
    ↓ Welcome email (Resend)
    ↓
/challenge/[type]/day/[1-7]  → Contenuto giornaliero
    ↓ POST /api/challenge/complete-day
    ↓ Email giorno successivo
    ↓
/challenge/[type]/complete   → Pagina completamento
    ↓ Accesso assessment sbloccato
\`\`\`

### 2. Assessment

\`\`\`
/assessment/lite              → Assessment Leadership (72 domande)
/assessment/risolutore        → Assessment Risolutore (47 domande)
/assessment/microfelicita     → Assessment Microfelicità (47 domande)
    ↓ POST /api/assessment/[type]/session
    ↓ POST /api/assessment/[type]/answer (per ogni risposta)
    ↓ POST /api/assessment/[type]/complete
    ↓
/assessment/[type]/results    → Risultati con radar chart
\`\`\`

### 3. AI Coach

\`\`\`
/dashboard                    → Widget chat AI Coach
    ↓ POST /api/ai-coach      → Claude API + RAG
    ↓ Memoria conversazione salvata
\`\`\`

### 4. Acquisto Libri

\`\`\`
/libro/[slug]                 → Landing libro
    ↓ POST /api/libro/checkout
    ↓ Stripe Checkout
    ↓
/libro/[slug]/grazie          → Thank you page
\`\`\`

---

## Statistiche

- **Pagine totali:** ${pages.length}
- **API endpoints:** ${apiEndpoints.length}
- **Componenti:** ${components.length}
- **Librerie:** ${libs.length}

---

*Documentazione generata automaticamente da \`scripts/generate-app-structure.js\`*
`;

  return md;
}
