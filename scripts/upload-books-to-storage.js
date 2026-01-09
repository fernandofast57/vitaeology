/**
 * Script per caricare i PDF dei libri su Supabase Storage
 *
 * Uso: node scripts/upload-books-to-storage.js
 *
 * Richiede: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nel .env.local
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Mancano le variabili NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const BUCKET_NAME = 'books';

const BOOKS = [
  {
    localPath: 'docs/Leadership_Autentica_PROVVISORIO.pdf',
    storagePath: 'Leadership_Autentica_PROVVISORIO.pdf',
    envVar: 'PDF_URL_LEADERSHIP'
  },
  {
    localPath: 'docs/Oltre_gli_Ostacoli_PROVVISORIO.pdf',
    storagePath: 'Oltre_gli_Ostacoli_PROVVISORIO.pdf',
    envVar: 'PDF_URL_RISOLUTORE'
  },
  {
    localPath: 'docs/Microfelicita_PROVVISORIO.pdf',
    storagePath: 'Microfelicita_PROVVISORIO.pdf',
    envVar: 'PDF_URL_MICROFELICITA'
  }
];

async function ensureBucketExists() {
  console.log(`\n📦 Verifico bucket "${BUCKET_NAME}"...`);

  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error('Errore lista bucket:', listError);
    return false;
  }

  const bucketExists = buckets.some(b => b.name === BUCKET_NAME);

  if (!bucketExists) {
    console.log(`   Creo bucket "${BUCKET_NAME}"...`);
    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true, // I PDF devono essere scaricabili pubblicamente
      fileSizeLimit: 50 * 1024 * 1024, // 50MB max
      allowedMimeTypes: ['application/pdf']
    });

    if (createError) {
      console.error('Errore creazione bucket:', createError);
      return false;
    }
    console.log(`   ✅ Bucket creato`);
  } else {
    console.log(`   ✅ Bucket già esistente`);
  }

  return true;
}

async function uploadBook(book) {
  const fullPath = path.join(process.cwd(), book.localPath);

  if (!fs.existsSync(fullPath)) {
    console.error(`   ❌ File non trovato: ${book.localPath}`);
    return null;
  }

  const fileBuffer = fs.readFileSync(fullPath);
  const fileSizeMB = (fileBuffer.length / (1024 * 1024)).toFixed(2);

  console.log(`\n📤 Caricamento: ${book.localPath} (${fileSizeMB} MB)`);

  // Elimina file esistente se presente
  await supabase.storage.from(BUCKET_NAME).remove([book.storagePath]);

  // Carica nuovo file
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(book.storagePath, fileBuffer, {
      contentType: 'application/pdf',
      upsert: true
    });

  if (error) {
    console.error(`   ❌ Errore upload: ${error.message}`);
    return null;
  }

  // Genera URL pubblico
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(book.storagePath);

  console.log(`   ✅ Caricato!`);
  console.log(`   📎 URL: ${urlData.publicUrl}`);

  return {
    envVar: book.envVar,
    url: urlData.publicUrl
  };
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   UPLOAD LIBRI PDF SU SUPABASE STORAGE');
  console.log('═══════════════════════════════════════════════════════════');

  // Verifica/crea bucket
  const bucketReady = await ensureBucketExists();
  if (!bucketReady) {
    console.error('\n❌ Impossibile preparare il bucket. Aborting.');
    process.exit(1);
  }

  // Carica ogni libro
  const results = [];
  for (const book of BOOKS) {
    const result = await uploadBook(book);
    if (result) {
      results.push(result);
    }
  }

  // Mostra riepilogo
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   RIEPILOGO - Aggiungi queste variabili a .env.local');
  console.log('═══════════════════════════════════════════════════════════\n');

  if (results.length === 0) {
    console.log('❌ Nessun file caricato con successo.');
  } else {
    results.forEach(r => {
      console.log(`${r.envVar}=${r.url}`);
    });

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`✅ ${results.length}/${BOOKS.length} libri caricati con successo!`);
    console.log('═══════════════════════════════════════════════════════════\n');
  }
}

main().catch(console.error);
