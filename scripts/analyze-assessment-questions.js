// Analisi struttura assessment_questions
const { Client } = require('pg');

const connectionString = 'postgresql://postgres:ekZp4mH5mbMK3X%26@db.sayquehhyyxwtrphysqe.supabase.co:5432/postgres';

async function analyze() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('='.repeat(70));
    console.log('STRUTTURA TABELLA assessment_questions');
    console.log('='.repeat(70));

    // 1. Colonne assessment_questions
    const cols = await client.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'assessment_questions'
      ORDER BY ordinal_position
    `);

    console.log('\nCOLONNE:');
    cols.rows.forEach(c => {
      const def = c.column_default ? c.column_default.substring(0, 30) : '';
      console.log(`  ${c.column_name.padEnd(25)} ${c.data_type.padEnd(25)} ${def}`);
    });

    // 2. Colonne characteristics
    console.log('\n' + '='.repeat(70));
    console.log('STRUTTURA TABELLA characteristics');
    console.log('='.repeat(70));

    const charCols = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'characteristics'
      ORDER BY ordinal_position
    `);

    console.log('\nCOLONNE:');
    charCols.rows.forEach(c => {
      console.log(`  ${c.column_name.padEnd(25)} ${c.data_type}`);
    });

    // 3. Lista characteristics
    const chars = await client.query(`
      SELECT id, slug, name_familiar, pillar
      FROM characteristics
      ORDER BY id
    `);

    console.log('\nCARATTERISTICHE (24):');
    chars.rows.forEach(c => {
      console.log(`  ID ${String(c.id).padEnd(3)} ${c.slug.padEnd(15)} ${c.name_familiar.padEnd(20)} (${c.pillar})`);
    });

    // 4. Conteggio domande per characteristic
    const counts = await client.query(`
      SELECT c.id, c.name_familiar, c.slug, COUNT(q.id) as question_count
      FROM characteristics c
      LEFT JOIN assessment_questions q ON q.characteristic_id = c.id
      GROUP BY c.id, c.name_familiar, c.slug
      ORDER BY c.id
    `);

    console.log('\nDOMANDE PER CARATTERISTICA:');
    let totalQuestions = 0;
    counts.rows.forEach(r => {
      totalQuestions += parseInt(r.question_count);
      console.log(`  ${r.name_familiar.padEnd(20)} (${r.slug.padEnd(15)}): ${r.question_count} domande`);
    });
    console.log(`\nTOTALE DOMANDE: ${totalQuestions}`);

    // 5. Esempio domande per Motivazione
    const sampleQuestions = await client.query(`
      SELECT q.id, q.order_index, q.scoring_type, q.question_text, c.slug
      FROM assessment_questions q
      JOIN characteristics c ON q.characteristic_id = c.id
      WHERE c.slug = 'motivazione'
      ORDER BY q.order_index
    `);

    console.log('\nDOMANDE MOTIVAZIONE (esempio):');
    sampleQuestions.rows.forEach(r => {
      const text = r.question_text.substring(0, 55);
      console.log(`  order ${String(r.order_index).padEnd(2)}: ${r.scoring_type.padEnd(10)} "${text}..."`);
    });

    // 6. Verifica scoring_type
    const scoringTypes = await client.query(`
      SELECT scoring_type, COUNT(*) as count
      FROM assessment_questions
      GROUP BY scoring_type
    `);

    console.log('\nSCORING TYPE DISTRIBUTION:');
    scoringTypes.rows.forEach(r => {
      console.log(`  ${r.scoring_type}: ${r.count} domande`);
    });

    // 7. Mappa slug -> prefisso codice
    console.log('\n' + '='.repeat(70));
    console.log('MAPPA CODICI (per identificare le 72 domande LITE)');
    console.log('='.repeat(70));
    console.log('\nIl "code" MO02 significa: characteristic_id per "motivazione" + order_index = 2');
    console.log('\nMappa slug -> prefisso:');

    const codeMap = {
      'motivazione': 'MO',
      'coraggio': 'CO',
      'dedizione': 'DE',
      'conoscenza': 'CN',
      'onesta': 'ON',
      'ottimismo': 'OT',
      'sicurezza': 'SI',
      'resilienza': 'RE',
      'rischio': 'RI',
      'energia': 'ED', // ED non EN
      'intraprendenza': 'IN',
      'persuasione': 'PE',
      'socievolezza': 'SO',
      'comunicazione': 'CM',
      'pazienza': 'PA',
      'percezione': 'PC',
      'empatia': 'EM',
      'umorismo': 'UM',
      'versatilita': 'VE',
      'adattabilita': 'AD',
      'curiosita': 'CU',
      'individualismo': 'ID',
      'idealismo': 'IL',
      'immaginazione': 'IM'
    };

    chars.rows.forEach(c => {
      const prefix = codeMap[c.slug] || '??';
      console.log(`  ${c.slug.padEnd(15)} -> ${prefix}`);
    });

  } catch (error) {
    console.error('Errore:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

analyze().catch(() => process.exit(1));
