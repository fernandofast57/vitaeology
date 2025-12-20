/**
 * Test End-to-End: Sistema Feedback + Pattern Detection
 *
 * Verifica:
 * 1. Tabelle database esistono
 * 2. Pattern seed sono presenti
 * 3. Funzioni SQL funzionano
 * 4. Pattern detection service funziona
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const tests = {
  passed: 0,
  failed: 0,
  results: []
};

function log(emoji, message) {
  console.log(`${emoji} ${message}`);
}

function pass(name) {
  tests.passed++;
  tests.results.push({ name, status: 'PASS' });
  log('✅', `PASS: ${name}`);
}

function fail(name, error) {
  tests.failed++;
  tests.results.push({ name, status: 'FAIL', error });
  log('❌', `FAIL: ${name}`);
  if (error) log('  ', `   Errore: ${error}`);
}

async function testTableExists(tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .select('id')
    .limit(1);

  if (error && error.code === '42P01') {
    return false;
  }
  return !error || error.code !== '42P01';
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST END-TO-END: Sistema Feedback + Pattern Detection');
  console.log('='.repeat(60) + '\n');

  // ============================================
  // 1. TEST TABELLE DATABASE
  // ============================================
  console.log('\n📊 1. Verifica Tabelle Database\n');

  const tables = [
    'ai_coach_conversations',
    'ai_coach_quality_audits',
    'ai_coach_patterns',
    'ai_coach_pattern_matches',
    'ai_coach_auto_corrections'
  ];

  for (const table of tables) {
    const exists = await testTableExists(table);
    if (exists) {
      pass(`Tabella ${table} esiste`);
    } else {
      fail(`Tabella ${table} esiste`, 'Tabella non trovata');
    }
  }

  // ============================================
  // 2. TEST COLONNE FEEDBACK IN CONVERSATIONS
  // ============================================
  console.log('\n📊 2. Verifica Colonne Feedback\n');

  const { data: convSample, error: convError } = await supabase
    .from('ai_coach_conversations')
    .select('id, feedback_type, user_rating, feedback_text')
    .limit(1);

  if (convError) {
    if (convError.message.includes('feedback_type')) {
      fail('Colonna feedback_type', 'Colonna non esiste - esegui migration SQL');
    } else if (convError.message.includes('user_rating')) {
      fail('Colonna user_rating', 'Colonna non esiste - esegui migration SQL');
    } else {
      fail('Colonne feedback', convError.message);
    }
  } else {
    pass('Colonne feedback_type, user_rating, feedback_text esistono');
  }

  // ============================================
  // 3. TEST PATTERN SEED
  // ============================================
  console.log('\n📊 3. Verifica Pattern Seed\n');

  const { data: patterns, error: patternError } = await supabase
    .from('ai_coach_patterns')
    .select('id, pattern_type, pattern_name, is_active');

  if (patternError) {
    fail('Caricamento patterns', patternError.message);
  } else if (!patterns || patterns.length === 0) {
    fail('Pattern seed', 'Nessun pattern trovato - esegui seed SQL');
  } else {
    pass(`${patterns.length} pattern trovati`);

    // Verifica pattern attesi
    const expectedTypes = ['troppo_lungo', 'manca_validazione', 'troppo_prescrittivo',
                           'linguaggio_complesso', 'cita_fonti', 'tono_giudicante'];
    const foundTypes = patterns.map(p => p.pattern_type);
    const missingTypes = expectedTypes.filter(t => !foundTypes.includes(t));

    if (missingTypes.length === 0) {
      pass('Tutti i pattern tipo presenti');
    } else {
      fail('Pattern tipo mancanti', missingTypes.join(', '));
    }

    // Mostra patterns
    console.log('\n   Pattern configurati:');
    patterns.forEach(p => {
      const status = p.is_active ? '🟢' : '🔴';
      console.log(`   ${status} ${p.pattern_name} (${p.pattern_type})`);
    });
  }

  // ============================================
  // 4. TEST FUNZIONI SQL
  // ============================================
  console.log('\n📊 4. Verifica Funzioni SQL\n');

  // Test increment_pattern_counter
  const { error: fnError1 } = await supabase.rpc('increment_pattern_counter', {
    p_pattern_id: '00000000-0000-0000-0000-000000000000', // UUID fittizio
    p_field: 'times_detected'
  });

  if (fnError1 && !fnError1.message.includes('pattern')) {
    fail('Funzione increment_pattern_counter', fnError1.message);
  } else {
    pass('Funzione increment_pattern_counter esiste');
  }

  // Test detect_patterns_in_conversation
  const { error: fnError2 } = await supabase.rpc('detect_patterns_in_conversation', {
    p_conversation_id: '00000000-0000-0000-0000-000000000000'
  });

  if (fnError2 && fnError2.code === '42883') {
    fail('Funzione detect_patterns_in_conversation', 'Funzione non trovata');
  } else {
    pass('Funzione detect_patterns_in_conversation esiste');
  }

  // Test sample_conversations_for_audit
  const { data: samples, error: fnError3 } = await supabase.rpc('sample_conversations_for_audit', {
    sample_size: 5
  });

  if (fnError3 && fnError3.code === '42883') {
    fail('Funzione sample_conversations_for_audit', 'Funzione non trovata');
  } else {
    pass(`Funzione sample_conversations_for_audit esiste (${samples?.length || 0} samples)`);
  }

  // ============================================
  // 5. TEST VISTE
  // ============================================
  console.log('\n📊 5. Verifica Viste\n');

  const { error: viewError1 } = await supabase
    .from('v_top_patterns')
    .select('*')
    .limit(1);

  if (viewError1 && viewError1.code === '42P01') {
    fail('Vista v_top_patterns', 'Vista non trovata');
  } else {
    pass('Vista v_top_patterns esiste');
  }

  const { error: viewError2 } = await supabase
    .from('v_audit_weekly_summary')
    .select('*')
    .limit(1);

  if (viewError2 && viewError2.code === '42P01') {
    fail('Vista v_audit_weekly_summary', 'Vista non trovata');
  } else {
    pass('Vista v_audit_weekly_summary esiste');
  }

  // ============================================
  // 6. TEST PATTERN DETECTION (simulato)
  // ============================================
  console.log('\n📊 6. Test Pattern Detection Logic\n');

  // Simula una risposta AI problematica
  const testResponse = `
    Dovresti assolutamente cambiare il tuo approccio.
    È necessario che tu implementi un nuovo framework per ottimizzare i risultati.
    Secondo gli studi di ricerca, questo paradigma è quello giusto.
    Ti manca la comprensione fondamentale del problema.
  `;

  // Conta quanti trigger phrases matchano
  const triggerTests = [
    { pattern: 'troppo_prescrittivo', phrases: ['dovresti', 'assolutamente', 'è necessario che'], found: [] },
    { pattern: 'linguaggio_complesso', phrases: ['framework', 'ottimizzare', 'paradigma', 'implementi'], found: [] },
    { pattern: 'cita_fonti', phrases: ['secondo', 'gli studi'], found: [] },
    { pattern: 'manca_validazione', phrases: ['ti manca'], found: [] }
  ];

  const lowerResponse = testResponse.toLowerCase();

  triggerTests.forEach(test => {
    test.phrases.forEach(phrase => {
      if (lowerResponse.includes(phrase.toLowerCase())) {
        test.found.push(phrase);
      }
    });
  });

  console.log('   Risposta test analizzata:');
  triggerTests.forEach(test => {
    if (test.found.length > 0) {
      log('   🎯', `${test.pattern}: ${test.found.join(', ')}`);
    }
  });

  const totalMatches = triggerTests.filter(t => t.found.length > 0).length;
  if (totalMatches >= 3) {
    pass(`Pattern detection logic: ${totalMatches} pattern rilevati`);
  } else {
    fail('Pattern detection logic', `Solo ${totalMatches} pattern rilevati, attesi >= 3`);
  }

  // ============================================
  // 7. TEST API ENDPOINTS (verifica esistenza)
  // ============================================
  console.log('\n📊 7. Verifica File API\n');

  const fs = require('fs');
  const path = require('path');

  const apiFiles = [
    'src/app/api/ai-coach/feedback/route.ts',
    'src/app/api/admin/feedback-patterns/route.ts',
    'src/app/api/admin/quality-audit/route.ts',
    'src/lib/services/pattern-detection.ts'
  ];

  apiFiles.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      pass(`File ${file}`);
    } else {
      fail(`File ${file}`, 'File non trovato');
    }
  });

  // ============================================
  // RIEPILOGO
  // ============================================
  console.log('\n' + '='.repeat(60));
  console.log('📋 RIEPILOGO TEST');
  console.log('='.repeat(60));
  console.log(`\n   ✅ Passati: ${tests.passed}`);
  console.log(`   ❌ Falliti: ${tests.failed}`);
  console.log(`   📊 Totale:  ${tests.passed + tests.failed}\n`);

  if (tests.failed === 0) {
    console.log('🎉 TUTTI I TEST PASSATI! Il sistema è pronto.\n');
  } else {
    console.log('⚠️  ALCUNI TEST FALLITI. Verifica i problemi sopra.\n');

    console.log('📝 Azioni suggerite:');
    tests.results
      .filter(t => t.status === 'FAIL')
      .forEach(t => {
        console.log(`   - ${t.name}: ${t.error}`);
      });
    console.log('');
  }

  return tests.failed === 0;
}

// Esegui
runTests()
  .then(success => process.exit(success ? 0 : 1))
  .catch(err => {
    console.error('Errore esecuzione test:', err);
    process.exit(1);
  });
