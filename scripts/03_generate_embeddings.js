/**
 * VITAEOLOGY RAG - Genera Embeddings per Book Chunks (BATCH MODE)
 *
 * Usa batch input: 50 testi per richiesta
 * 565 chunks / 50 = 12 richieste
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local'), override: true });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const INPUT_FILE = path.join(__dirname, 'book_chunks.json');
const OUTPUT_FILE = path.join(__dirname, 'book_chunks_with_embeddings.json');
const EMBEDDING_MODEL = 'text-embedding-3-small';
const BATCH_SIZE = 50;

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

  // Debug: mostra errore se presente
  if (data.error) {
    throw new Error(data.error.message || JSON.stringify(data.error));
  }

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${JSON.stringify(data)}`);
  }

  if (!data.data || !Array.isArray(data.data)) {
    throw new Error(`Risposta senza data: ${JSON.stringify(data)}`);
  }

  // Ordina per index e restituisci embeddings
  const sorted = data.data.sort((a, b) => a.index - b.index);
  return sorted.map(d => d.embedding);
}

async function main() {
  console.log('=== VITAEOLOGY RAG - Embeddings (BATCH MODE) ===\n');

  if (!OPENAI_API_KEY) {
    console.error('ERRORE: OPENAI_API_KEY non trovata');
    process.exit(1);
  }
  console.log('API Key: ' + OPENAI_API_KEY.substring(0, 10) + '...\n');

  const chunks = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
  const totalBatches = Math.ceil(chunks.length / BATCH_SIZE);

  console.log(`${chunks.length} chunks, ${totalBatches} batch da ${BATCH_SIZE}\n`);

  const results = [];
  let withEmbedding = 0;
  let errors = 0;

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const batch = chunks.slice(i, i + BATCH_SIZE);

    // Prepara testi - assicurati che non siano vuoti
    const texts = batch.map(c => {
      const text = c.content || '';
      return text.length > 0 ? text.substring(0, 8000) : ' ';
    });

    process.stdout.write(`Batch ${batchNum}/${totalBatches} (${batch.length} chunks)... `);

    try {
      const embeddings = await generateEmbeddingsBatch(texts);

      for (let idx = 0; idx < batch.length; idx++) {
        results.push({
          ...batch[idx],
          embedding: embeddings[idx] || null
        });
        if (embeddings[idx]) withEmbedding++;
      }

      console.log(`OK (${withEmbedding} totali)`);

    } catch (error) {
      console.log(`ERRORE: ${error.message}`);
      errors += batch.length;
      for (const chunk of batch) {
        results.push({ ...chunk, embedding: null });
      }
    }

    // Salva dopo ogni batch
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  }

  console.log(`\n=== COMPLETATO ===`);
  console.log(`Con embedding: ${withEmbedding}/${chunks.length}`);
  console.log(`Errori: ${errors}`);
  console.log(`Output: ${OUTPUT_FILE}`);
}

main().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});
