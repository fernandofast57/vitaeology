// Verifica setup tabelle Microfelicità
const { Client } = require('pg');

const connectionString = 'postgresql://postgres:ekZp4mH5mbMK3X%26@db.sayquehhyyxwtrphysqe.supabase.co:5432/postgres';

async function verify() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🔍 Verifica tabelle Microfelicità...\n');

    // Conta righe per tabella
    const counts = await client.query(`
      SELECT 'microfelicita_dimensions' as tabella, COUNT(*)::int as righe FROM microfelicita_dimensions
      UNION ALL
      SELECT 'microfelicita_questions', COUNT(*)::int FROM microfelicita_questions
      UNION ALL
      SELECT 'microfelicita_results', COUNT(*)::int FROM microfelicita_results
      UNION ALL
      SELECT 'microfelicita_level_results', COUNT(*)::int FROM microfelicita_level_results
      UNION ALL
      SELECT 'microfelicita_answers', COUNT(*)::int FROM microfelicita_answers
    `);

    console.log('📊 Conteggio righe:');
    counts.rows.forEach(row => {
      const status = (row.tabella === 'microfelicita_dimensions' && row.righe === 13) ||
                     (row.tabella === 'microfelicita_questions' && row.righe === 47) ||
                     (row.righe === 0) ? '✅' : '❌';
      console.log(`   ${status} ${row.tabella}: ${row.righe}`);
    });

    // Verifica domande per dimensione
    const byDimension = await client.query(`
      SELECT dimension_code, COUNT(*)::int as count
      FROM microfelicita_questions
      GROUP BY dimension_code
      ORDER BY dimension_code
    `);

    console.log('\n📋 Domande per dimensione:');
    byDimension.rows.forEach(row => {
      // RADAR: 4 ciascuno, Sabotatori: 3 ciascuno, Livelli: 4 ciascuno
      let expected = 4;
      if (['SM', 'SA', 'SI', 'SC', 'SE'].includes(row.dimension_code)) expected = 3;
      const status = row.count === expected ? '✅' : '❌';
      console.log(`   ${status} ${row.dimension_code}: ${row.count} (atteso: ${expected})`);
    });

    console.log('\n✅ Verifica completata!');

  } catch (error) {
    console.error('❌ Errore:', error.message);
  } finally {
    await client.end();
  }
}

verify();
