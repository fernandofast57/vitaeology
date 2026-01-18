#!/usr/bin/env npx tsx
/**
 * VITAEOLOGY RAG - Aggiorna da sorgenti LaTeX
 *
 * Questo script:
 * 1. Estrae una ZIP contenente i 3 libri in formato LaTeX
 * 2. Parsa i file .tex seguendo \include e \input
 * 3. Divide in chunks con overlap
 * 4. Genera embeddings con OpenAI
 * 5. Carica su Supabase (book_knowledge)
 *
 * Uso: npx tsx scripts/update-rag-from-latex.ts --zip=./books/libri.zip --clear
 *
 * Flags:
 *   --zip=PATH      Path alla ZIP (required)
 *   --clear         Svuota chunks esistenti prima di caricare
 *   --dry-run       Mostra parsing senza caricare
 *   --book=SLUG     Processa solo un libro specifico (leadership|ostacoli|microfelicita)
 */

import AdmZip from 'adm-zip';
import * as path from 'path';
import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

// Carica variabili ambiente
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// ============================================
// CONFIGURAZIONE
// ============================================

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;
const BATCH_SIZE = 50;
const MAX_TOKENS_PER_CHUNK = 800;
const OVERLAP_TOKENS = 100;

// Mapping cartelle → slug e book_title
const FOLDER_TO_BOOK: Record<string, { slug: string; title: string }> = {
  'Libro 1': { slug: 'leadership', title: 'Leadership Autentica' },
  'Libro 2': { slug: 'ostacoli', title: 'Oltre gli Ostacoli' },
  'Libro 3': { slug: 'microfelicita', title: 'Microfelicità' },
  // Varianti comuni
  'Leadership': { slug: 'leadership', title: 'Leadership Autentica' },
  'leadership': { slug: 'leadership', title: 'Leadership Autentica' },
  'Leadership Autentica': { slug: 'leadership', title: 'Leadership Autentica' },
  'Ostacoli': { slug: 'ostacoli', title: 'Oltre gli Ostacoli' },
  'ostacoli': { slug: 'ostacoli', title: 'Oltre gli Ostacoli' },
  'Oltre gli Ostacoli': { slug: 'ostacoli', title: 'Oltre gli Ostacoli' },
  'Microfelicita': { slug: 'microfelicita', title: 'Microfelicità' },
  'microfelicita': { slug: 'microfelicita', title: 'Microfelicità' },
  'Microfelicità': { slug: 'microfelicita', title: 'Microfelicità' },
  'Microfelicità Digitale': { slug: 'microfelicita', title: 'Microfelicità' },
};

// ============================================
// TYPES
// ============================================

interface Section {
  book: string;
  bookTitle: string;
  chapter: string;
  section: string;
  subsection: string;
  content: string;
}

interface Chunk {
  book_title: string;
  chapter: string;
  section: string;
  content: string;
  chunk_type: string;
  keywords: string[];
  embedding?: number[];
}

interface BookFiles {
  slug: string;
  title: string;
  files: Map<string, string>;
}

interface CLIArgs {
  zip: string;
  clear: boolean;
  dryRun: boolean;
  book?: string;
}

// ============================================
// CLI PARSING
// ============================================

function parseArgs(): CLIArgs {
  const args: CLIArgs = {
    zip: '',
    clear: false,
    dryRun: false,
    book: undefined,
  };

  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--zip=')) {
      args.zip = arg.substring(6);
    } else if (arg === '--clear') {
      args.clear = true;
    } else if (arg === '--dry-run') {
      args.dryRun = true;
    } else if (arg.startsWith('--book=')) {
      args.book = arg.substring(7);
    }
  }

  return args;
}

// ============================================
// 1. EXTRACT ZIP
// ============================================

function extractZip(zipPath: string): Map<string, BookFiles> {
  console.log('📦 Estrazione ZIP...');

  if (!fs.existsSync(zipPath)) {
    throw new Error(`File ZIP non trovato: ${zipPath}`);
  }

  const zip = new AdmZip(zipPath);
  const entries = zip.getEntries();

  // Mappa: bookSlug → { slug, title, files: Map<filename, content> }
  const books = new Map<string, BookFiles>();

  // Trova cartelle root (primo livello della ZIP)
  const rootFolders = new Set<string>();

  for (const entry of entries) {
    if (entry.isDirectory) continue;

    const entryPath = entry.entryName.replace(/\\/g, '/');
    const parts = entryPath.split('/');

    // Ignora file alla root (non in cartelle)
    if (parts.length < 2) continue;

    // Prima cartella = libro
    const rootFolder = parts[0];
    rootFolders.add(rootFolder);

    // Solo file .tex
    if (!entryPath.endsWith('.tex')) continue;

    // Identifica libro
    const bookInfo = identifyBook(rootFolder);
    if (!bookInfo) {
      console.warn(`   ⚠️  Cartella non riconosciuta: ${rootFolder}`);
      continue;
    }

    // Inizializza book se non esiste
    if (!books.has(bookInfo.slug)) {
      books.set(bookInfo.slug, {
        slug: bookInfo.slug,
        title: bookInfo.title,
        files: new Map(),
      });
    }

    // Aggiungi file
    const fileName = parts.slice(1).join('/'); // Path relativo alla cartella libro
    const content = entry.getData().toString('utf8');
    books.get(bookInfo.slug)!.files.set(fileName, content);
  }

  console.log(`   Trovate ${rootFolders.size} cartelle: ${Array.from(rootFolders).join(', ')}`);

  for (const [slug, book] of Array.from(books.entries())) {
    console.log(`   📚 ${book.title} (${slug}): ${book.files.size} file .tex`);
  }

  return books;
}

function identifyBook(folderName: string): { slug: string; title: string } | null {
  // Check diretto
  if (FOLDER_TO_BOOK[folderName]) {
    return FOLDER_TO_BOOK[folderName];
  }

  // Check case-insensitive e parziale
  const lowerName = folderName.toLowerCase();

  if (lowerName.includes('leadership') || lowerName.includes('libro 1') || lowerName.includes('libro1')) {
    return { slug: 'leadership', title: 'Leadership Autentica' };
  }
  if (lowerName.includes('ostacol') || lowerName.includes('risolutor') || lowerName.includes('libro 2') || lowerName.includes('libro2')) {
    return { slug: 'ostacoli', title: 'Oltre gli Ostacoli' };
  }
  if (lowerName.includes('microfelicit') || lowerName.includes('benessere') || lowerName.includes('libro 3') || lowerName.includes('libro3')) {
    return { slug: 'microfelicita', title: 'Microfelicità' };
  }

  return null;
}

// ============================================
// 2. PARSE LATEX
// ============================================

function parseLatex(book: BookFiles): Section[] {
  const sections: Section[] = [];

  // Trova main.tex o file con \begin{document}
  let mainFile = findMainFile(book.files);
  if (!mainFile) {
    console.warn(`   ⚠️  Nessun main.tex trovato per ${book.title}, processo tutti i file`);
    // Fallback: processa tutti i file
    for (const [fileName, content] of Array.from(book.files.entries())) {
      const fileSections = parseTexFile(content, book, fileName);
      sections.push(...fileSections);
    }
    return sections;
  }

  console.log(`   📄 Main file: ${mainFile}`);

  // Parsing ordinato seguendo \include e \input
  const processedFiles = new Set<string>();
  const orderedContent = resolveIncludes(mainFile, book.files, processedFiles);

  // Estrai struttura dal contenuto ordinato
  return parseTexContent(orderedContent, book);
}

function findMainFile(files: Map<string, string>): string | null {
  const entries = Array.from(files.entries());

  // Priorità 1: main.tex
  for (const [fileName] of entries) {
    if (fileName.toLowerCase() === 'main.tex' || fileName.toLowerCase().endsWith('/main.tex')) {
      return fileName;
    }
  }

  // Priorità 2: file con \begin{document}
  for (const [fileName, content] of entries) {
    if (content.includes('\\begin{document}')) {
      return fileName;
    }
  }

  // Priorità 3: libro.tex o simili
  for (const [fileName] of entries) {
    if (fileName.toLowerCase().includes('libro') && fileName.endsWith('.tex')) {
      return fileName;
    }
  }

  return null;
}

function resolveIncludes(
  fileName: string,
  files: Map<string, string>,
  processed: Set<string>
): string {
  if (processed.has(fileName)) return '';
  processed.add(fileName);

  let content = files.get(fileName) || '';

  // Estrai directory del file corrente per risolvere path relativi
  const currentDir = path.dirname(fileName);

  // Pattern per vari tipi di include:
  // - \include{file}
  // - \input{file}
  // - \safeinput{file}
  // - \safeinput[title]{file}
  // - \IfFileExists{file.tex}{\input{file}}{}
  const patterns = [
    /\\(?:include|input)\s*\{([^}]+)\}/g,
    /\\safeinput\s*(?:\[[^\]]*\])?\s*\{([^}]+)\}/g,
    /\\IfFileExists\s*\{([^}]+)\.tex\}\s*\{\\input\{[^}]+\}\}\s*\{\}/g,
  ];

  const replacements: Array<{ full: string; replacement: string; index: number }> = [];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      let includePath = match[1];

      // Salta setup/preamble e file non rilevanti
      if (includePath.includes('preamble') || includePath.includes('../setup')) {
        continue;
      }

      // Aggiungi .tex se mancante
      const texPath = includePath.endsWith('.tex') ? includePath : `${includePath}.tex`;

      // Prova vari path
      const possiblePaths = [
        texPath,
        path.join(currentDir, texPath).replace(/\\/g, '/'),
        // Rimuovi ../ se presente
        texPath.replace(/^\.\.\//g, ''),
      ];

      let foundPath: string | null = null;
      for (const p of possiblePaths) {
        // Normalizza path
        const normalizedPath = p.replace(/\\/g, '/');

        if (files.has(normalizedPath)) {
          foundPath = normalizedPath;
          break;
        }

        // Prova anche cercando per nome file
        const baseName = path.basename(normalizedPath);
        for (const key of Array.from(files.keys())) {
          if (key.endsWith('/' + baseName) || key === baseName) {
            foundPath = key;
            break;
          }
        }
        if (foundPath) break;
      }

      if (foundPath) {
        replacements.push({
          full: match[0],
          replacement: `\n\n${resolveIncludes(foundPath, files, processed)}\n\n`,
          index: match.index,
        });
      }
    }
  }

  // Ordina per indice decrescente per applicare da fine a inizio
  replacements.sort((a, b) => b.index - a.index);

  // Applica sostituzioni
  for (const { full, replacement } of replacements) {
    content = content.replace(full, replacement);
  }

  return content;
}

function parseTexContent(content: string, book: BookFiles): Section[] {
  const sections: Section[] = [];

  // Rimuovi commenti LaTeX
  content = content.replace(/%.*$/gm, '');

  // Rimuovi preambolo (tutto prima di \begin{document})
  const docMatch = content.match(/\\begin\{document\}([\s\S]*?)\\end\{document\}/);
  if (docMatch) {
    content = docMatch[1];
  }

  // Estrai struttura gerarchica
  let currentChapter = '';
  let currentSection = '';
  let currentSubsection = '';
  let currentContent = '';

  // Pattern per struttura
  const structurePattern = /\\(chapter|section|subsection)\*?\s*\{([^}]+)\}/g;

  let lastIndex = 0;
  let match;

  while ((match = structurePattern.exec(content)) !== null) {
    // Salva contenuto precedente
    if (lastIndex > 0 || currentContent.trim()) {
      const textBefore = content.substring(lastIndex, match.index);
      currentContent += textBefore;

      if (currentContent.trim().length > 50) {
        sections.push({
          book: book.slug,
          bookTitle: book.title,
          chapter: currentChapter || 'Introduzione',
          section: currentSection || '',
          subsection: currentSubsection || '',
          content: cleanLatexContent(currentContent),
        });
      }
      currentContent = '';
    }

    const type = match[1];
    const title = match[2].trim();

    if (type === 'chapter') {
      currentChapter = title;
      currentSection = '';
      currentSubsection = '';
    } else if (type === 'section') {
      currentSection = title;
      currentSubsection = '';
    } else if (type === 'subsection') {
      currentSubsection = title;
    }

    lastIndex = match.index + match[0].length;
  }

  // Contenuto finale
  const remainingContent = content.substring(lastIndex);
  currentContent += remainingContent;

  if (currentContent.trim().length > 50) {
    sections.push({
      book: book.slug,
      bookTitle: book.title,
      chapter: currentChapter || 'Contenuto',
      section: currentSection || '',
      subsection: currentSubsection || '',
      content: cleanLatexContent(currentContent),
    });
  }

  return sections;
}

function parseTexFile(content: string, book: BookFiles, fileName: string): Section[] {
  // Wrapper per file singoli senza struttura
  const sections = parseTexContent(content, book);

  // Se non trovata struttura, crea sezione unica dal file
  if (sections.length === 0 && content.trim().length > 100) {
    const cleanContent = cleanLatexContent(content);
    if (cleanContent.length > 50) {
      sections.push({
        book: book.slug,
        bookTitle: book.title,
        chapter: path.basename(fileName, '.tex'),
        section: '',
        subsection: '',
        content: cleanContent,
      });
    }
  }

  return sections;
}

function cleanLatexContent(content: string): string {
  let text = content;

  // Rimuovi prima i titoli di struttura (chapter, section, etc.) che sono già estratti
  text = text.replace(/\\(?:chapter|section|subsection|subsubsection|part)\*?\s*\{[^}]*\}/g, '\n\n');

  // Rimuovi addcontentsline e altri comandi di indice
  text = text.replace(/\\addcontentsline\s*\{[^}]*\}\s*\{[^}]*\}\s*\{[^}]*\}/g, '');

  // Rimuovi cleardoublepage, clearpage etc
  text = text.replace(/\\(?:cleardoublepage|clearpage|newpage|thispagestyle\{[^}]*\})/g, '\n');

  // Rimuovi frontmatter, mainmatter, backmatter
  text = text.replace(/\\(?:frontmatter|mainmatter|backmatter|pagestyle\{[^}]*\})/g, '');

  // Rimuovi tableofcontents e simili
  text = text.replace(/\\tableofcontents/g, '');

  // Rimuovi comandi comuni preservando il testo
  const commandsWithArg = [
    'textbf', 'textit', 'emph', 'underline', 'textsc',
    'footnote', 'marginpar', 'caption', 'label', 'ref',
    'cite', 'citep', 'citet', 'href', 'url',
    'hypersetup', 'title', 'author',
  ];

  for (const cmd of commandsWithArg) {
    // \cmd{testo} → testo
    text = text.replace(new RegExp(`\\\\${cmd}\\s*\\{([^}]*)\\}`, 'g'), '$1');
  }

  // Rimuovi vspace, hspace con argomenti
  text = text.replace(/\\[vh]space\*?\s*\{[^}]*\}/g, ' ');
  text = text.replace(/\\vspace\*?\s*\{[^}]*\}/g, '\n');

  // Rimuovi comandi senza argomento
  const commandsNoArg = [
    'par', 'noindent', 'newline', 'linebreak', 'pagebreak',
    'clearpage', 'newpage', 'bigskip', 'medskip', 'smallskip',
    'hfill', 'vfill', 'centering', 'raggedright', 'raggedleft',
    'maketitle', 'frontmatter', 'mainmatter', 'backmatter',
  ];

  for (const cmd of commandsNoArg) {
    text = text.replace(new RegExp(`\\\\${cmd}\\b`, 'g'), ' ');
  }

  // Gestisci liste
  text = text.replace(/\\begin\{itemize\}/g, '\n');
  text = text.replace(/\\end\{itemize\}/g, '\n');
  text = text.replace(/\\begin\{enumerate\}/g, '\n');
  text = text.replace(/\\end\{enumerate\}/g, '\n');
  text = text.replace(/\\begin\{description\}/g, '\n');
  text = text.replace(/\\end\{description\}/g, '\n');
  text = text.replace(/\\item\s*(\[[^\]]*\])?\s*/g, '\n• ');

  // Rimuovi altri ambienti (figure, table, etc.)
  text = text.replace(/\\begin\{(figure|table|tabular|center|quote|quotation|abstract|titlepage)\*?\}[\s\S]*?\\end\{\1\*?\}/g, '');

  // Rimuovi math mode inline e display
  text = text.replace(/\$[^$]+\$/g, ' ');
  text = text.replace(/\\\[[\s\S]*?\\\]/g, ' ');
  text = text.replace(/\\begin\{(equation|align|gather|multline)\*?\}[\s\S]*?\\end\{\1\*?\}/g, ' ');

  // Rimuovi copyright e simili
  text = text.replace(/Copyright\\copyright\{\}[^\n]*/g, '');

  // Rimuovi comandi rimanenti non riconosciuti (incluso quelli con argomenti opzionali)
  text = text.replace(/\\[a-zA-Z@]+\*?(\[[^\]]*\])*(\{[^}]*\})*/g, ' ');

  // Pulisci caratteri speciali LaTeX
  text = text.replace(/\\&/g, '&');
  text = text.replace(/\\%/g, '%');
  text = text.replace(/\\\$/g, '$');
  text = text.replace(/\\_/g, '_');
  text = text.replace(/\\#/g, '#');
  text = text.replace(/\\{/g, '{');
  text = text.replace(/\\}/g, '}');
  text = text.replace(/\\\\/g, '\n');  // \\ = newline
  text = text.replace(/~~/g, ' ');
  text = text.replace(/~/g, ' ');
  text = text.replace(/``/g, '"');
  text = text.replace(/''/g, '"');
  text = text.replace(/---/g, '—');
  text = text.replace(/--/g, '–');

  // Rimuovi graffe rimaste
  text = text.replace(/\{|\}/g, '');

  // Pulisci whitespace
  text = text.replace(/\r\n/g, '\n');
  text = text.replace(/[ \t]+/g, ' ');
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.trim();

  return text;
}

// ============================================
// 3. CREATE CHUNKS
// ============================================

function createChunks(sections: Section[]): Chunk[] {
  const chunks: Chunk[] = [];

  for (const section of sections) {
    const sectionChunks = chunkSection(section);
    chunks.push(...sectionChunks);
  }

  return chunks;
}

function chunkSection(section: Section): Chunk[] {
  const chunks: Chunk[] = [];
  const content = section.content;

  // Stima tokens (approssimativo: 1 token ≈ 4 caratteri per italiano)
  const estimateTokens = (text: string) => Math.ceil(text.length / 4);

  const tokens = estimateTokens(content);

  if (tokens <= MAX_TOKENS_PER_CHUNK) {
    // Sezione già abbastanza piccola
    chunks.push(createChunkFromSection(section, content));
  } else {
    // Dividi per paragrafi
    const paragraphs = content.split(/\n\n+/);
    let currentChunk = '';
    let overlapBuffer = '';

    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) continue;

      const combinedTokens = estimateTokens(currentChunk + ' ' + trimmed);

      if (combinedTokens > MAX_TOKENS_PER_CHUNK && currentChunk.length > 0) {
        // Salva chunk corrente
        chunks.push(createChunkFromSection(section, currentChunk.trim()));

        // Prepara overlap
        const words = currentChunk.split(/\s+/);
        const overlapWords = words.slice(-Math.floor(OVERLAP_TOKENS / 1.5));
        overlapBuffer = overlapWords.join(' ');

        // Inizia nuovo chunk con overlap
        currentChunk = overlapBuffer + ' ' + trimmed;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + trimmed;
      }
    }

    // Ultimo chunk
    if (currentChunk.trim().length > 50) {
      chunks.push(createChunkFromSection(section, currentChunk.trim()));
    }
  }

  return chunks;
}

function createChunkFromSection(section: Section, content: string): Chunk {
  const sectionLabel = [section.section, section.subsection]
    .filter(Boolean)
    .join(' - ') || undefined;

  return {
    book_title: section.bookTitle,
    chapter: section.chapter,
    section: sectionLabel || '',
    content: content,
    chunk_type: 'paragraph',
    keywords: extractKeywords(content),
  };
}

function extractKeywords(text: string): string[] {
  const stopwords = new Set([
    'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una',
    'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra',
    'che', 'e', 'o', 'ma', 'se', 'come', 'quando', 'dove',
    'chi', 'cosa', 'quale', 'quanto', 'perché', 'non', 'sono',
    'ho', 'hai', 'ha', 'mi', 'ti', 'ci', 'vi', 'si', 'questo',
    'quello', 'essere', 'avere', 'fare', 'della', 'delle', 'dello',
    'degli', 'nella', 'nelle', 'nello', 'negli', 'alla', 'alle',
    'allo', 'agli', 'dalla', 'dalle', 'dallo', 'dagli', 'più',
    'può', 'ogni', 'proprio', 'anche', 'solo', 'sempre', 'ancora',
    'però', 'quindi', 'così', 'tutto', 'tutti', 'tutte', 'molto',
    'poi', 'ora', 'già', 'dopo', 'prima', 'quando', 'mentre',
    'sua', 'suo', 'suoi', 'sue', 'loro', 'nostro', 'nostra',
    'nostri', 'nostre', 'vostro', 'vostra', 'vostri', 'vostre',
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\sàèéìòù]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopwords.has(w));

  // Conta frequenze
  const freq: Record<string, number> = {};
  for (const w of words) {
    freq[w] = (freq[w] || 0) + 1;
  }

  // Top 10 keywords
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

// ============================================
// 4. GENERATE EMBEDDINGS
// ============================================

async function generateEmbeddings(chunks: Chunk[]): Promise<Chunk[]> {
  console.log(`\n🧠 Generazione embeddings (${chunks.length} totali)...`);

  const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });

  const totalBatches = Math.ceil(chunks.length / BATCH_SIZE);
  let completed = 0;
  let errors = 0;

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const batch = chunks.slice(i, i + BATCH_SIZE);

    // Prepara testi (max 8191 tokens per OpenAI)
    const texts = batch.map(c => c.content.substring(0, 8000) || ' ');

    try {
      const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: texts,
      });

      // Assegna embeddings
      for (let idx = 0; idx < batch.length; idx++) {
        const embedding = response.data[idx]?.embedding;
        if (embedding) {
          chunks[i + idx].embedding = embedding;
          completed++;
        }
      }

      // Progress bar
      const progress = Math.round((completed / chunks.length) * 20);
      const bar = '█'.repeat(progress) + '░'.repeat(20 - progress);
      process.stdout.write(`\r   [${bar}] ${completed}/${chunks.length}`);

      // Rate limiting
      await sleep(200);
    } catch (error: any) {
      console.error(`\n   ❌ Batch ${batchNum}: ${error.message}`);
      errors += batch.length;
    }
  }

  console.log('\n');

  if (errors > 0) {
    console.warn(`   ⚠️  ${errors} chunks senza embedding`);
  }

  return chunks;
}

// ============================================
// 5. UPLOAD TO SUPABASE
// ============================================

async function uploadToSupabase(chunks: Chunk[], clearFirst: boolean): Promise<void> {
  console.log('☁️  Upload Supabase...');

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Clear esistenti se richiesto
  if (clearFirst) {
    console.log('   🗑️  Cancellazione chunks esistenti...');
    const { error: deleteError, data: deletedData } = await supabase
      .from('book_knowledge')
      .delete()
      .neq('id', 0)
      .select('id');

    if (deleteError) {
      console.error(`   ❌ Errore cancellazione: ${deleteError.message}`);
    } else {
      console.log(`   🗑️  Cancellati ${deletedData?.length || 0} chunks esistenti`);
    }
  }

  // Filtra chunks con embedding
  const validChunks = chunks.filter(c => c.embedding && c.embedding.length === EMBEDDING_DIMENSIONS);
  console.log(`   📤 Chunks validi da caricare: ${validChunks.length}`);

  let imported = 0;
  const totalBatches = Math.ceil(validChunks.length / BATCH_SIZE);

  for (let i = 0; i < validChunks.length; i += BATCH_SIZE) {
    const batch = validChunks.slice(i, i + BATCH_SIZE);

    const records = batch.map(chunk => ({
      book_title: chunk.book_title,
      chapter: chunk.chapter,
      section: chunk.section,
      content: chunk.content,
      chunk_type: chunk.chunk_type,
      keywords: chunk.keywords,
      embedding: chunk.embedding,
    }));

    const { data, error } = await supabase
      .from('book_knowledge')
      .insert(records)
      .select('id');

    if (error) {
      console.error(`   ❌ Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`);
    } else {
      imported += data?.length || 0;

      // Progress bar
      const progress = Math.round((imported / validChunks.length) * 20);
      const bar = '█'.repeat(progress) + '░'.repeat(20 - progress);
      process.stdout.write(`\r   [${bar}] ${imported}/${validChunks.length}`);
    }
  }

  console.log('\n');
}

// ============================================
// UTILITIES
// ============================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function printUsage(): void {
  console.log(`
Uso: npx tsx scripts/update-rag-from-latex.ts --zip=PATH [opzioni]

Opzioni:
  --zip=PATH      Path alla ZIP contenente i libri LaTeX (richiesto)
  --clear         Svuota tutti i chunks esistenti prima di caricare
  --dry-run       Mostra parsing senza generare embeddings/caricare
  --book=SLUG     Processa solo un libro (leadership|ostacoli|microfelicita)

Esempi:
  npx tsx scripts/update-rag-from-latex.ts --zip=./books/libri.zip --clear
  npx tsx scripts/update-rag-from-latex.ts --zip=./books/libri.zip --dry-run
  npx tsx scripts/update-rag-from-latex.ts --zip=./books/libri.zip --book=leadership
`);
}

// ============================================
// MAIN
// ============================================

async function main(): Promise<void> {
  console.log('\n════════════════════════════════════════════════════════');
  console.log('   VITAEOLOGY RAG - Aggiornamento da LaTeX');
  console.log('════════════════════════════════════════════════════════\n');

  const args = parseArgs();

  // Validazione argomenti
  if (!args.zip) {
    console.error('❌ ERRORE: --zip è richiesto\n');
    printUsage();
    process.exit(1);
  }

  // Validazione ambiente
  if (!args.dryRun) {
    if (!OPENAI_API_KEY) {
      console.error('❌ ERRORE: OPENAI_API_KEY non configurata in .env.local');
      process.exit(1);
    }
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.error('❌ ERRORE: Configura SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY in .env.local');
      process.exit(1);
    }
    console.log(`OpenAI API Key: ${OPENAI_API_KEY.substring(0, 10)}...`);
    console.log(`Supabase URL: ${SUPABASE_URL}`);
  }

  if (args.dryRun) {
    console.log('🔍 Modalità DRY-RUN: nessun caricamento verrà effettuato\n');
  }

  // 1. Estrai ZIP
  const books = extractZip(args.zip);

  if (books.size === 0) {
    console.error('❌ Nessun libro trovato nella ZIP');
    process.exit(1);
  }

  // Filtra per libro specifico se richiesto
  let booksToProcess = books;
  if (args.book) {
    if (!books.has(args.book)) {
      console.error(`❌ Libro "${args.book}" non trovato nella ZIP`);
      console.log(`   Libri disponibili: ${Array.from(books.keys()).join(', ')}`);
      process.exit(1);
    }
    booksToProcess = new Map([[args.book, books.get(args.book)!]]);
    console.log(`\n📖 Processo solo: ${args.book}`);
  }

  // 2. Parse LaTeX e crea chunks
  const allChunks: Chunk[] = [];
  const stats: Record<string, { files: number; chapters: number; sections: number; chunks: number }> = {};

  for (const [slug, book] of Array.from(booksToProcess.entries())) {
    console.log(`\n📚 ${book.title} → ${slug}`);
    console.log(`   ${book.files.size} file .tex`);

    const sections = parseLatex(book);

    // Conta capitoli e sezioni uniche
    const uniqueChapters = new Set(sections.map(s => s.chapter));
    const uniqueSections = new Set(sections.map(s => s.section).filter(Boolean));

    console.log(`   ${uniqueChapters.size} capitoli, ${uniqueSections.size} sezioni`);

    const chunks = createChunks(sections);
    console.log(`   ✂️  ${chunks.length} chunks creati`);

    stats[slug] = {
      files: book.files.size,
      chapters: uniqueChapters.size,
      sections: uniqueSections.size,
      chunks: chunks.length,
    };

    allChunks.push(...chunks);
  }

  console.log(`\n📊 Totale chunks: ${allChunks.length}`);

  // Dry run: mostra sample e esci
  if (args.dryRun) {
    console.log('\n📋 Sample chunks (primi 3):');
    for (const chunk of allChunks.slice(0, 3)) {
      console.log(`\n   📖 ${chunk.book_title} - ${chunk.chapter}`);
      console.log(`   📁 ${chunk.section || '(root)'}`);
      console.log(`   📝 ${chunk.content.substring(0, 200)}...`);
      console.log(`   🏷️  Keywords: ${chunk.keywords.slice(0, 5).join(', ')}`);
    }

    console.log('\n✅ DRY-RUN completato (nessun dato caricato)');
    printSummary(stats, allChunks.length, true);
    return;
  }

  // 3. Genera embeddings
  await generateEmbeddings(allChunks);

  // 4. Upload a Supabase
  await uploadToSupabase(allChunks, args.clear);

  // Summary finale
  printSummary(stats, allChunks.length, false);
}

function printSummary(
  stats: Record<string, { files: number; chapters: number; sections: number; chunks: number }>,
  totalChunks: number,
  isDryRun: boolean
): void {
  console.log('\n════════════════════════════════════════════════════════');
  console.log(isDryRun ? '   ✅ DRY-RUN COMPLETATO' : '   ✅ COMPLETATO');
  console.log('════════════════════════════════════════════════════════\n');

  for (const [slug, stat] of Object.entries(stats)) {
    console.log(`   ${slug.padEnd(15)} ${stat.chunks} chunks`);
  }

  console.log(`   ${'─'.repeat(25)}`);
  console.log(`   ${'TOTALE'.padEnd(15)} ${totalChunks} chunks`);
  console.log('');
}

// Run
main().catch(error => {
  console.error('\n❌ FATAL ERROR:', error);
  process.exit(1);
});
