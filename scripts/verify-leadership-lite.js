// Verifica Leadership LITE v2
const { Client } = require('pg');

const connectionString = 'postgresql://postgres:ekZp4mH5mbMK3X%26@db.sayquehhyyxwtrphysqe.supabase.co:5432/postgres';

async function verify() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('='.repeat(70));
    console.log('VERIFICA LEADERSHIP LITE v2');
    console.log('='.repeat(70));

    // 1. Caratteristiche
    const chars = await client.query(`
      SELECT pillar, COUNT(*) as count
      FROM characteristics_v2
      GROUP BY pillar
      ORDER BY MIN(pillar_order)
    `);

    console.log('\n✅ CARATTERISTICHE per PILASTRO:');
    let totalChars = 0;
    chars.rows.forEach(r => {
      totalChars += parseInt(r.count);
      console.log(`   ${r.pillar.padEnd(12)}: ${r.count}`);
    });
    console.log(`   TOTALE: ${totalChars}`);

    // 2. Domande LITE
    const liteCount = await client.query(`
      SELECT COUNT(*) as count FROM assessment_questions_v2 WHERE is_lite = TRUE
    `);
    console.log(`\n✅ DOMANDE LITE: ${liteCount.rows[0].count}`);

    // 3. Distribuzione per tipo
    const byType = await client.query(`
      SELECT question_type, scoring_type, COUNT(*) as count
      FROM assessment_questions_v2
      GROUP BY question_type, scoring_type
      ORDER BY question_type
    `);

    console.log('\n✅ DISTRIBUZIONE PER TIPO:');
    byType.rows.forEach(r => {
      console.log(`   ${r.question_type.padEnd(13)} (${r.scoring_type.padEnd(7)}): ${r.count}`);
    });

    // 4. Domande per caratteristica
    const byChar = await client.query(`
      SELECT c.name, c.code, COUNT(q.id) as count
      FROM characteristics_v2 c
      LEFT JOIN assessment_questions_v2 q ON q.characteristic_id = c.id
      GROUP BY c.id, c.name, c.code
      ORDER BY c.pillar_order
    `);

    console.log('\n✅ DOMANDE PER CARATTERISTICA:');
    byChar.rows.forEach(r => {
      const status = r.count == 3 ? '✓' : '✗';
      console.log(`   ${status} ${r.code} ${r.name.padEnd(25)}: ${r.count} domande`);
    });

    // 5. Esempio domande
    const sample = await client.query(`
      SELECT q.code, q.question_type, q.scoring_type,
             SUBSTRING(q.question_text, 1, 50) as text_preview
      FROM assessment_questions_v2 q
      ORDER BY q.code
      LIMIT 9
    `);

    console.log('\n✅ ESEMPIO DOMANDE (prime 9):');
    sample.rows.forEach(r => {
      console.log(`   ${r.code}: [${r.question_type}/${r.scoring_type}] "${r.text_preview}..."`);
    });

    console.log('\n' + '='.repeat(70));
    console.log('RIEPILOGO:');
    console.log(`  - Caratteristiche: ${totalChars} (atteso: 24)`);
    console.log(`  - Domande LITE: ${liteCount.rows[0].count} (atteso: 72)`);
    console.log('='.repeat(70));

  } catch (error) {
    console.error('Errore:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

verify().catch(() => process.exit(1));
