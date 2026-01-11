/**
 * Verifica stato tabelle Assessment usando service role key
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Mancano variabili ambiente SUPABASE');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkTable(tableName, description) {
  try {
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        return { exists: false, count: 0, error: 'NON ESISTE' };
      }
      return { exists: false, count: 0, error: error.message };
    }

    // Get sample data
    const { data: sample } = await supabase
      .from(tableName)
      .select('*')
      .limit(3);

    return { exists: true, count, sample };
  } catch (err) {
    return { exists: false, count: 0, error: err.message };
  }
}

async function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   VERIFICA TABELLE ASSESSMENT - VITAEOLOGY                     ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log(`\n📅 ${new Date().toISOString()}\n`);

  const tables = {
    // RISOLUTORE
    risolutore_dimensions: 'Dimensioni Risolutore (7)',
    risolutore_questions: 'Domande Risolutore (48)',
    risolutore_results: 'Risultati utenti',
    risolutore_level_results: 'Risultati per livello',
    risolutore_answers: 'Risposte utenti',

    // MICROFELICITA
    microfelicita_dimensions: 'Dimensioni Microfelicità (13)',
    microfelicita_questions: 'Domande Microfelicità (52)',
    microfelicita_results: 'Risultati utenti',
    microfelicita_level_results: 'Risultati per livello',
    microfelicita_answers: 'Risposte utenti',

    // ASSESSMENT LITE (riferimento)
    characteristics: '24 Caratteristiche Leadership',
    assessment_questions: 'Domande Assessment LITE (72)',
    user_assessments: 'Sessioni assessment utenti',
    user_answers: 'Risposte assessment LITE',
    characteristic_scores: 'Punteggi caratteristiche',

    // BOOKS
    books: 'Catalogo libri',
    user_books: 'Libri acquistati utenti',

    // ASSESSMENT ACCESS
    assessment_access: 'Accessi assessment per utente',
  };

  const results = {};

  console.log('┌────────────────────────────────┬──────────┬─────────┬─────────────────────────┐');
  console.log('│ Tabella                        │ Esiste   │ Righe   │ Note                    │');
  console.log('├────────────────────────────────┼──────────┼─────────┼─────────────────────────┤');

  for (const [table, desc] of Object.entries(tables)) {
    const result = await checkTable(table, desc);
    results[table] = result;

    const exists = result.exists ? '✅' : '❌';
    const count = result.exists ? result.count?.toString() : '-';
    const note = result.error || (result.count === 0 ? 'VUOTA' : 'OK');

    console.log(`│ ${table.padEnd(30)} │ ${exists.padEnd(8)} │ ${(count || '0').padStart(7)} │ ${note.padEnd(23).substring(0, 23)} │`);
  }

  console.log('└────────────────────────────────┴──────────┴─────────┴─────────────────────────┘');

  // Report dettagliato
  console.log('\n\n📋 REPORT DETTAGLIATO:\n');

  // RISOLUTORE
  console.log('══════════════════════════════════════════════════════════');
  console.log('🔧 RISOLUTORE (Oltre gli Ostacoli)');
  console.log('══════════════════════════════════════════════════════════');

  if (!results.risolutore_dimensions?.exists) {
    console.log('   ❌ Tabella risolutore_dimensions NON ESISTE');
    console.log('   → Eseguire: sql/risolutore/step1-dimensions.sql');
  } else if (results.risolutore_dimensions.count === 0) {
    console.log('   ⚠️ risolutore_dimensions VUOTA');
    console.log('   → Eseguire INSERT in step1-dimensions.sql');
  } else {
    console.log(`   ✅ risolutore_dimensions: ${results.risolutore_dimensions.count} dimensioni`);
    if (results.risolutore_dimensions.sample) {
      results.risolutore_dimensions.sample.forEach(d => {
        console.log(`      - ${d.code}: ${d.name} (${d.category})`);
      });
    }
  }

  if (!results.risolutore_questions?.exists) {
    console.log('   ❌ Tabella risolutore_questions NON ESISTE');
    console.log('   → Eseguire: sql/risolutore/step2-questions-table.sql');
  } else if (results.risolutore_questions.count === 0) {
    console.log('   ⚠️ risolutore_questions VUOTA');
    console.log('   → Eseguire: step3, step4, step5 per inserire domande');
  } else {
    console.log(`   ✅ risolutore_questions: ${results.risolutore_questions.count} domande`);
  }

  // MICROFELICITA
  console.log('\n══════════════════════════════════════════════════════════');
  console.log('🌟 MICROFELICITA');
  console.log('══════════════════════════════════════════════════════════');

  if (!results.microfelicita_dimensions?.exists) {
    console.log('   ❌ Tabella microfelicita_dimensions NON ESISTE');
    console.log('   → Eseguire: sql/microfelicita/step1-dimensions.sql');
  } else if (results.microfelicita_dimensions.count === 0) {
    console.log('   ⚠️ microfelicita_dimensions VUOTA');
    console.log('   → Eseguire INSERT in step1-dimensions.sql');
  } else {
    console.log(`   ✅ microfelicita_dimensions: ${results.microfelicita_dimensions.count} dimensioni`);
    if (results.microfelicita_dimensions.sample) {
      results.microfelicita_dimensions.sample.forEach(d => {
        console.log(`      - ${d.code}: ${d.name} (${d.category})`);
      });
    }
  }

  if (!results.microfelicita_questions?.exists) {
    console.log('   ❌ Tabella microfelicita_questions NON ESISTE');
    console.log('   → Eseguire: sql/microfelicita/step2-questions-table.sql');
  } else if (results.microfelicita_questions.count === 0) {
    console.log('   ⚠️ microfelicita_questions VUOTA');
    console.log('   → Eseguire: step3, step4, step5 per inserire domande');
  } else {
    console.log(`   ✅ microfelicita_questions: ${results.microfelicita_questions.count} domande`);
  }

  // ASSESSMENT LITE (riferimento)
  console.log('\n══════════════════════════════════════════════════════════');
  console.log('📊 ASSESSMENT LITE (Riferimento - già implementato)');
  console.log('══════════════════════════════════════════════════════════');
  console.log(`   characteristics: ${results.characteristics?.exists ? results.characteristics.count : 'NON ESISTE'}`);
  console.log(`   assessment_questions: ${results.assessment_questions?.exists ? results.assessment_questions.count : 'NON ESISTE'}`);
  console.log(`   user_assessments: ${results.user_assessments?.exists ? results.user_assessments.count : 'NON ESISTE'}`);

  // BOOKS
  console.log('\n══════════════════════════════════════════════════════════');
  console.log('📚 LIBRI');
  console.log('══════════════════════════════════════════════════════════');
  console.log(`   books: ${results.books?.exists ? results.books.count : 'NON ESISTE'}`);
  console.log(`   user_books: ${results.user_books?.exists ? results.user_books.count : 'NON ESISTE'}`);

  if (results.books?.sample) {
    console.log('   Libri presenti:');
    results.books.sample.forEach(b => {
      console.log(`      - ${b.slug}: ${b.title || b.titolo || 'N/A'}`);
    });
  }

  // ASSESSMENT ACCESS
  console.log('\n══════════════════════════════════════════════════════════');
  console.log('🔐 ASSESSMENT ACCESS');
  console.log('══════════════════════════════════════════════════════════');
  console.log(`   assessment_access: ${results.assessment_access?.exists ? results.assessment_access.count : 'NON ESISTE'}`);

  // RIEPILOGO IMPLEMENTAZIONE
  console.log('\n\n');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║               RIEPILOGO STATO IMPLEMENTAZIONE                  ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');

  const risolReady = results.risolutore_dimensions?.exists &&
                     results.risolutore_dimensions?.count > 0 &&
                     results.risolutore_questions?.exists &&
                     results.risolutore_questions?.count > 0;

  const microReady = results.microfelicita_dimensions?.exists &&
                     results.microfelicita_dimensions?.count > 0 &&
                     results.microfelicita_questions?.exists &&
                     results.microfelicita_questions?.count > 0;

  const liteReady = results.characteristics?.exists &&
                    results.characteristics?.count > 0 &&
                    results.assessment_questions?.exists &&
                    results.assessment_questions?.count > 0;

  console.log(`\n  RISOLUTORE:    ${risolReady ? '✅ PRONTO' : '❌ DA COMPLETARE'}`);
  console.log(`  MICROFELICITA: ${microReady ? '✅ PRONTO' : '❌ DA COMPLETARE'}`);
  console.log(`  LITE:          ${liteReady ? '✅ PRONTO' : '❌ DA COMPLETARE'}`);

  if (!risolReady || !microReady) {
    console.log('\n\n📝 PROSSIMI PASSI:');
    if (!risolReady) {
      console.log('\n  Per RISOLUTORE, eseguire in ordine:');
      console.log('    1. sql/risolutore/step1-dimensions.sql');
      console.log('    2. sql/risolutore/step2-questions-table.sql');
      console.log('    3. sql/risolutore/step3-questions-filtri.sql');
      console.log('    4. sql/risolutore/step4-questions-traditori.sql');
      console.log('    5. sql/risolutore/step5-questions-scala.sql');
      console.log('    6. sql/risolutore/step6-results-tables.sql');
      console.log('    7. sql/risolutore/step7-update-constraint.sql');
      console.log('    8. sql/risolutore/step8-rls-indexes.sql');
    }
    if (!microReady) {
      console.log('\n  Per MICROFELICITA, eseguire in ordine:');
      console.log('    1. sql/microfelicita/step1-dimensions.sql');
      console.log('    2. sql/microfelicita/step2-questions-table.sql');
      console.log('    3. sql/microfelicita/step3-questions-radar.sql');
      console.log('    4. sql/microfelicita/step4-questions-sabotatori.sql');
      console.log('    5. sql/microfelicita/step5-questions-livelli.sql');
      console.log('    6. sql/microfelicita/step6-results-tables.sql');
      console.log('    7. sql/microfelicita/step7-rls-indexes.sql');
    }
  }

  console.log('\n\n✅ Verifica completata.\n');
}

main().catch(console.error);
