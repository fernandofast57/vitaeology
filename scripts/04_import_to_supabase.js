/**
 * VITAEOLOGY RAG - Importa Chunks con Embeddings in Supabase
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local'), override: true });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const INPUT_FILE = path.join(__dirname, 'book_chunks_with_embeddings.json');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log('=== VITAEOLOGY RAG - Import in Supabase ===\n');

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('ERRORE: Configura SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  // Leggi chunks
  const chunks = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
  const withEmbeddings = chunks.filter(c => c.embedding).length;

  console.log(`${chunks.length} chunks (${withEmbeddings} con embedding)\n`);

  let imported = 0;
  let errors = 0;
  const BATCH_SIZE = 50;

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);

    // Mappa i campi del JSON ai campi della tabella
    const records = batch.map(chunk => ({
      book_title: chunk.book_title || 'Unknown',
      chapter: chunk.chapter_title || chunk.chapter_number?.toString() || null,
      section: chunk.section_title || null,
      content: chunk.content || '',
      chunk_type: chunk.content_type || 'paragraph',
      keywords: chunk.metadata?.keywords || chunk.metadata?.characteristics || [],
      embedding: chunk.embedding || null,
    }));

    const { data, error } = await supabase
      .from('book_knowledge')
      .insert(records)
      .select('id');

    if (error) {
      console.error(`Batch ${Math.floor(i/BATCH_SIZE)+1}: ERRORE - ${error.message}`);
      errors += batch.length;
    } else {
      imported += data.length;
      console.log(`Batch ${Math.floor(i/BATCH_SIZE)+1}: OK (${imported} totali)`);
    }
  }

  // Verifica finale
  const { count } = await supabase
    .from('book_knowledge')
    .select('*', { count: 'exact', head: true });

  console.log(`\n=== COMPLETATO ===`);
  console.log(`Importati: ${imported}`);
  console.log(`Errori: ${errors}`);
  console.log(`Totale in DB: ${count}`);
}

main().catch(console.error);
