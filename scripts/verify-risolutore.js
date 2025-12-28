// Verifica setup tabelle Risolutore
const { Client } = require('pg');

const connectionString = 'postgresql://postgres:ekZp4mH5mbMK3X%26@db.sayquehhyyxwtrphysqe.supabase.co:5432/postgres';

async function verify() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🔍 Verifica tabelle Risolutore...\n');

    // Conta righe per tabella
    const counts = await client.query(`
      SELECT 'risolutore_dimensions' as tabella, COUNT(*)::int as righe FROM risolutore_dimensions
      UNION ALL
      SELECT 'risolutore_questions', COUNT(*)::int FROM risolutore_questions
      UNION ALL
      SELECT 'risolutore_results', COUNT(*)::int FROM risolutore_results
      UNION ALL
      SELECT 'risolutore_level_results', COUNT(*)::int FROM risolutore_level_results
      UNION ALL
      SELECT 'risolutore_answers', COUNT(*)::int FROM risolutore_answers
    `);

    console.log('📊 Conteggio righe:');
    counts.rows.forEach(row => {
      const status = (row.tabella === 'risolutore_dimensions' && row.righe === 7) ||
                     (row.tabella === 'risolutore_questions' && row.righe === 48) ||
                     (row.righe === 0) ? '✅' : '❌';
      console.log(`   ${status} ${row.tabella}: ${row.righe}`);
    });

    // Verifica domande per dimensione
    const byDimension = await client.query(`
      SELECT dimension_code, COUNT(*)::int as count
      FROM risolutore_questions
      GROUP BY dimension_code
      ORDER BY dimension_code
    `);

    console.log('\n📋 Domande per dimensione:');
    byDimension.rows.forEach(row => {
      const expected = row.dimension_code === 'SR' ? 12 : 6;
      const status = row.count === expected ? '✅' : '❌';
      console.log(`   ${status} ${row.dimension_code}: ${row.count} (atteso: ${expected})`);
    });

    // Verifica constraint
    const constraint = await client.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'user_assessments_v2'
      AND constraint_type = 'CHECK'
    `);

    console.log('\n🔒 Constraint user_assessments_v2:');
    constraint.rows.forEach(row => {
      console.log(`   ✅ ${row.constraint_name}`);
    });

    console.log('\n✅ Verifica completata!');

  } catch (error) {
    console.error('❌ Errore:', error.message);
  } finally {
    await client.end();
  }
}

verify();
