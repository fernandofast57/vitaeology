/**
 * VITAEOLOGY RAG - Aggiorna Embeddings da PDF
 *
 * Questo script:
 * 1. Estrae testo dai 3 PDF dei libri
 * 2. Divide in chunks intelligenti
 * 3. Genera embeddings con OpenAI
 * 4. Aggiorna la tabella book_knowledge in Supabase
 *
 * Uso: node scripts/update-rag-embeddings.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// pdf-parse (v1.1.1)
const pdfParse = require('pdf-parse');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local'), override: true });

// Configurazione
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EMBEDDING_MODEL = 'text-embedding-3-small';
const BATCH_SIZE = 50;
const CHUNK_SIZE = 1000; // caratteri per chunk (ottimale per RAG)
const CHUNK_OVERLAP = 150; // overlap per continuità semantica

// Mapping libri
const BOOKS = [
  {
    file: 'Libro Aggiornato.pdf',
    title: 'Leadership Autentica',
    path: 'leadership'
  },
  {
    file: 'Oltre_gli_Ostacoli__Potenzia_il_risolutore_che_hai_in_te__.pdf',
    title: 'Oltre gli Ostacoli',
    path: 'problemi'
  },
  {
    file: 'Microfelicità Digitale.pdf',
    title: 'Microfelicità',
    path: 'benessere'
  }
];

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Estrai testo da PDF
 */
async function extractTextFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

/**
 * Divide testo in chunks con overlap
 */
function chunkText(text, bookTitle) {
  const chunks = [];

  // Pulisci il testo mantenendo struttura paragrafi
  const cleanText = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Dividi in frasi/paragrafi
  const sentences = cleanText.split(/(?<=[.!?])\s+|\n\n+/);

  let currentChunk = '';
  let chunkIndex = 0;

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.length < 20) continue; // Salta frasi troppo corte

    // Se aggiungere questa frase supera il limite, salva il chunk corrente
    if (currentChunk.length + trimmed.length > CHUNK_SIZE && currentChunk.length > 200) {
      chunks.push({
        book_title: bookTitle,
        chapter: `Sezione ${Math.floor(chunkIndex / 10) + 1}`,
        section: `Parte ${(chunkIndex % 10) + 1}`,
        content: currentChunk.trim(),
        chunk_type: 'paragraph',
        keywords: extractKeywords(currentChunk),
      });
      chunkIndex++;

      // Mantieni overlap (ultime ~30 parole)
      const words = currentChunk.split(/\s+/);
      const overlapWords = words.slice(-30).join(' ');
      currentChunk = overlapWords + ' ' + trimmed;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + trimmed;
    }
  }

  // Ultimo chunk
  if (currentChunk.trim().length > 200) {
    chunks.push({
      book_title: bookTitle,
      chapter: `Sezione ${Math.floor(chunkIndex / 10) + 1}`,
      section: `Parte ${(chunkIndex % 10) + 1}`,
      content: currentChunk.trim(),
      chunk_type: 'paragraph',
      keywords: extractKeywords(currentChunk),
    });
  }

  return chunks;
}

/**
 * Estrai keyword dal testo
 */
function extractKeywords(text) {
  const stopwords = [
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
  ];

  const words = text
    .toLowerCase()
    .replace(/[^\w\sàèéìòù]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopwords.includes(w));

  // Conta frequenze
  const freq = {};
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });

  // Top 10 keywords
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

/**
 * Genera embeddings in batch
 */
async function generateEmbeddingsBatch(texts) {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: texts,
    }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message || JSON.stringify(data.error));
  }

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${JSON.stringify(data)}`);
  }

  const sorted = data.data.sort((a, b) => a.index - b.index);
  return sorted.map(d => d.embedding);
}

/**
 * Main
 */
async function main() {
  console.log('=== VITAEOLOGY RAG - Aggiornamento Embeddings ===\n');

  // Verifica configurazione
  if (!OPENAI_API_KEY) {
    console.error('ERRORE: OPENAI_API_KEY non configurata');
    process.exit(1);
  }
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('ERRORE: Configura SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  console.log('OpenAI API Key: ' + OPENAI_API_KEY.substring(0, 10) + '...');
  console.log('Supabase URL: ' + SUPABASE_URL + '\n');

  // 1. ESTRAI TESTO DA PDF
  console.log('--- FASE 1: Estrazione PDF ---\n');

  const allChunks = [];

  for (const book of BOOKS) {
    const pdfPath = path.join(__dirname, '..', 'docs', book.file);

    if (!fs.existsSync(pdfPath)) {
      console.log(`⚠️  File non trovato: ${book.file}`);
      continue;
    }

    console.log(`📖 ${book.title}...`);

    try {
      const text = await extractTextFromPDF(pdfPath);
      console.log(`   Estratti ${text.length} caratteri`);

      const chunks = chunkText(text, book.title);
      console.log(`   Creati ${chunks.length} chunks\n`);

      allChunks.push(...chunks);
    } catch (error) {
      console.error(`   ERRORE: ${error.message}\n`);
    }
  }

  if (allChunks.length === 0) {
    console.error('Nessun chunk estratto. Verifica i file PDF.');
    process.exit(1);
  }

  console.log(`Totale chunks: ${allChunks.length}\n`);

  // Salva backup JSON
  const backupPath = path.join(__dirname, 'book_chunks_backup.json');
  fs.writeFileSync(backupPath, JSON.stringify(allChunks, null, 2));
  console.log(`Backup salvato: ${backupPath}\n`);

  // 2. GENERA EMBEDDINGS
  console.log('--- FASE 2: Generazione Embeddings ---\n');

  const totalBatches = Math.ceil(allChunks.length / BATCH_SIZE);
  let withEmbedding = 0;
  let errors = 0;

  for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const batch = allChunks.slice(i, i + BATCH_SIZE);

    const texts = batch.map(c => c.content.substring(0, 8000) || ' ');

    process.stdout.write(`Batch ${batchNum}/${totalBatches}... `);

    try {
      const embeddings = await generateEmbeddingsBatch(texts);

      for (let idx = 0; idx < batch.length; idx++) {
        allChunks[i + idx].embedding = embeddings[idx] || null;
        if (embeddings[idx]) withEmbedding++;
      }

      console.log(`OK (${withEmbedding} totali)`);

      // Rate limiting
      await new Promise(r => setTimeout(r, 200));

    } catch (error) {
      console.log(`ERRORE: ${error.message}`);
      errors += batch.length;
    }
  }

  console.log(`\nEmbeddings generati: ${withEmbedding}/${allChunks.length}`);
  console.log(`Errori: ${errors}\n`);

  // 3. AGGIORNA SUPABASE
  console.log('--- FASE 3: Aggiornamento Supabase ---\n');

  // Elimina dati esistenti
  console.log('Eliminazione dati esistenti...');
  const { error: deleteError } = await supabase
    .from('book_knowledge')
    .delete()
    .neq('id', 0); // Elimina tutti

  if (deleteError) {
    console.error(`Errore eliminazione: ${deleteError.message}`);
  } else {
    console.log('Dati esistenti eliminati.\n');
  }

  // Inserisci nuovi dati
  let imported = 0;

  for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
    const batch = allChunks.slice(i, i + BATCH_SIZE);

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
      console.error(`Batch ${Math.floor(i/BATCH_SIZE)+1}: ERRORE - ${error.message}`);
    } else {
      imported += data.length;
      console.log(`Batch ${Math.floor(i/BATCH_SIZE)+1}: OK (${imported} totali)`);
    }
  }

  // Verifica finale
  const { count } = await supabase
    .from('book_knowledge')
    .select('*', { count: 'exact', head: true });

  console.log('\n=== COMPLETATO ===');
  console.log(`Chunks importati: ${imported}`);
  console.log(`Totale in DB: ${count}`);
  console.log(`\n✅ RAG aggiornato con successo!`);
}

main().catch(e => {
  console.error('\nFATAL:', e);
  process.exit(1);
});
