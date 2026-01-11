/**
 * Script per analizzare lo stato del database per Assessment Ostacoli e Microfelicità
 *
 * Verifica:
 * - risolutore_* tables
 * - microfelicita_* tables
 * - books table
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sayquehhyyxwtrphysqe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNheXF1ZWhoeXl4d3RycGh5c3FlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4NDY3MjAsImV4cCI6MjA0OTQyMjcyMH0.BMGK5pEKMGL0Jz1sDqe8T_jGnrHSFQpaQduKdXQsZvA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function analyzeTable(tableName, description) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 ${tableName.toUpperCase()}`);
  console.log(`   ${description}`);
  console.log('='.repeat(60));

  try {
    // Conta righe
    const { count, error: countError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log(`❌ ERRORE: ${countError.message}`);
      if (countError.code === '42P01') {
        console.log(`   → Tabella NON ESISTE`);
      }
      return { exists: false, count: 0, data: null };
    }

    console.log(`✅ Tabella ESISTE`);
    console.log(`📈 Righe totali: ${count}`);

    // Recupera sample data
    const { data, error: dataError } = await supabase
      .from(tableName)
      .select('*')
      .limit(5);

    if (dataError) {
      console.log(`⚠️ Errore recupero dati: ${dataError.message}`);
      return { exists: true, count, data: null };
    }

    if (data && data.length > 0) {
      console.log(`\n📋 Struttura colonne:`);
      const columns = Object.keys(data[0]);
      columns.forEach(col => {
        const sampleValue = data[0][col];
        const type = typeof sampleValue;
        console.log(`   - ${col}: ${type} ${sampleValue === null ? '(null)' : ''}`);
      });

      console.log(`\n📝 Sample data (prime ${data.length} righe):`);
      data.forEach((row, i) => {
        console.log(`   [${i + 1}] ${JSON.stringify(row).substring(0, 200)}...`);
      });
    } else {
      console.log(`\n⚠️ Tabella VUOTA - nessun dato`);
    }

    return { exists: true, count, data };
  } catch (err) {
    console.log(`❌ ECCEZIONE: ${err.message}`);
    return { exists: false, count: 0, data: null };
  }
}

async function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║     ANALISI DATABASE SUPABASE - ASSESSMENT IMPLEMENTATION      ║');
  console.log('║     Vitaeology - Ostacoli & Microfelicità                      ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log(`\n📅 Data analisi: ${new Date().toISOString()}`);

  const results = {};

  // ============================================
  // SEZIONE 1: TABELLE RISOLUTORE (Ostacoli)
  // ============================================
  console.log('\n\n' + '█'.repeat(60));
  console.log('█  SEZIONE 1: RISOLUTORE (Oltre gli Ostacoli)');
  console.log('█'.repeat(60));

  results.risolutore_dimensions = await analyzeTable(
    'risolutore_dimensions',
    'Dimensioni/Aree del test Risolutore'
  );

  results.risolutore_questions = await analyzeTable(
    'risolutore_questions',
    'Domande del test Risolutore'
  );

  results.risolutore_answers = await analyzeTable(
    'risolutore_answers',
    'Risposte utenti al test Risolutore'
  );

  results.risolutore_results = await analyzeTable(
    'risolutore_results',
    'Risultati finali test Risolutore'
  );

  results.risolutore_level_results = await analyzeTable(
    'risolutore_level_results',
    'Risultati per livello test Risolutore'
  );

  // ============================================
  // SEZIONE 2: TABELLE MICROFELICITA
  // ============================================
  console.log('\n\n' + '█'.repeat(60));
  console.log('█  SEZIONE 2: MICROFELICITA');
  console.log('█'.repeat(60));

  results.microfelicita_dimensions = await analyzeTable(
    'microfelicita_dimensions',
    'Dimensioni/Aree del test Microfelicità'
  );

  results.microfelicita_questions = await analyzeTable(
    'microfelicita_questions',
    'Domande del test Microfelicità'
  );

  results.microfelicita_answers = await analyzeTable(
    'microfelicita_answers',
    'Risposte utenti al test Microfelicità'
  );

  results.microfelicita_results = await analyzeTable(
    'microfelicita_results',
    'Risultati finali test Microfelicità'
  );

  results.microfelicita_level_results = await analyzeTable(
    'microfelicita_level_results',
    'Risultati per livello test Microfelicità'
  );

  // ============================================
  // SEZIONE 3: TABELLA BOOKS
  // ============================================
  console.log('\n\n' + '█'.repeat(60));
  console.log('█  SEZIONE 3: BOOKS');
  console.log('█'.repeat(60));

  results.books = await analyzeTable(
    'books',
    'Catalogo libri Vitaeology'
  );

  // ============================================
  // SEZIONE 4: TABELLE ASSESSMENT LITE (riferimento)
  // ============================================
  console.log('\n\n' + '█'.repeat(60));
  console.log('█  SEZIONE 4: ASSESSMENT LITE (riferimento esistente)');
  console.log('█'.repeat(60));

  results.characteristics = await analyzeTable(
    'characteristics',
    '24 caratteristiche Leadership Autentica'
  );

  results.assessment_questions = await analyzeTable(
    'assessment_questions',
    'Domande Assessment LITE (72 domande)'
  );

  // ============================================
  // REPORT FINALE
  // ============================================
  console.log('\n\n');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                    REPORT IMPLEMENTAZIONE                      ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');

  console.log('\n📊 RIEPILOGO STATO TABELLE:\n');
  console.log('┌────────────────────────────────┬──────────┬─────────┐');
  console.log('│ Tabella                        │ Esiste   │ Righe   │');
  console.log('├────────────────────────────────┼──────────┼─────────┤');

  for (const [name, result] of Object.entries(results)) {
    const exists = result.exists ? '✅ SÌ' : '❌ NO';
    const count = result.exists ? result.count?.toString() || '0' : '-';
    console.log(`│ ${name.padEnd(30)} │ ${exists.padEnd(8)} │ ${count.padStart(7)} │`);
  }

  console.log('└────────────────────────────────┴──────────┴─────────┘');

  // Analisi implementazione
  console.log('\n\n📋 ANALISI PER IMPLEMENTAZIONE:\n');

  // Risolutore
  const risolExists = results.risolutore_dimensions?.exists && results.risolutore_questions?.exists;
  const risolPopulated = (results.risolutore_dimensions?.count || 0) > 0 &&
                         (results.risolutore_questions?.count || 0) > 0;

  console.log('🔧 RISOLUTORE (Oltre gli Ostacoli):');
  if (!risolExists) {
    console.log('   ❌ Tabelle NON esistono - necessaria creazione schema');
  } else if (!risolPopulated) {
    console.log('   ⚠️ Tabelle esistono ma VUOTE - necessario popolamento dati');
    console.log(`   → risolutore_dimensions: ${results.risolutore_dimensions?.count || 0} righe`);
    console.log(`   → risolutore_questions: ${results.risolutore_questions?.count || 0} righe`);
  } else {
    console.log('   ✅ Tabelle esistono e popolate');
    console.log(`   → risolutore_dimensions: ${results.risolutore_dimensions?.count} righe`);
    console.log(`   → risolutore_questions: ${results.risolutore_questions?.count} righe`);
  }

  // Microfelicità
  const microExists = results.microfelicita_dimensions?.exists && results.microfelicita_questions?.exists;
  const microPopulated = (results.microfelicita_dimensions?.count || 0) > 0 &&
                         (results.microfelicita_questions?.count || 0) > 0;

  console.log('\n🌟 MICROFELICITA:');
  if (!microExists) {
    console.log('   ❌ Tabelle NON esistono - necessaria creazione schema');
  } else if (!microPopulated) {
    console.log('   ⚠️ Tabelle esistono ma VUOTE - necessario popolamento dati');
    console.log(`   → microfelicita_dimensions: ${results.microfelicita_dimensions?.count || 0} righe`);
    console.log(`   → microfelicita_questions: ${results.microfelicita_questions?.count || 0} righe`);
  } else {
    console.log('   ✅ Tabelle esistono e popolate');
    console.log(`   → microfelicita_dimensions: ${results.microfelicita_dimensions?.count} righe`);
    console.log(`   → microfelicita_questions: ${results.microfelicita_questions?.count} righe`);
  }

  // Books
  console.log('\n📚 BOOKS:');
  if (!results.books?.exists) {
    console.log('   ❌ Tabella books NON esiste');
  } else {
    console.log(`   ✅ Tabella exists con ${results.books?.count || 0} libri`);
  }

  // Assessment Lite (riferimento)
  console.log('\n📊 ASSESSMENT LITE (riferimento):');
  console.log(`   → characteristics: ${results.characteristics?.count || 0} righe`);
  console.log(`   → assessment_questions: ${results.assessment_questions?.count || 0} righe`);

  console.log('\n\n✅ Analisi completata.\n');
}

main().catch(console.error);
