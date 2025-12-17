const { Client } = require('pg');

const connectionString = 'postgresql://postgres:ekZp4mH5mbMK3X%26@db.sayquehhyyxwtrphysqe.supabase.co:5432/postgres';

async function verifyTables() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connesso al database.\n');

    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name LIKE 'ai_coach%'
      ORDER BY table_name;
    `);

    console.log('Tabelle AI Coach Learning System:');
    console.log('='.repeat(40));
    result.rows.forEach((row, i) => {
      console.log(`${i + 1}. ${row.table_name}`);
    });
    console.log('='.repeat(40));
    console.log(`Totale: ${result.rows.length} tabelle`);

    if (result.rows.length === 9) {
      console.log('\n✅ Tutte le 9 tabelle sono state create con successo!');
    } else {
      console.log(`\n⚠️ Attese 9 tabelle, trovate ${result.rows.length}`);
    }

  } catch (error) {
    console.error('❌ Errore:', error.message);
  } finally {
    await client.end();
  }
}

verifyTables();
