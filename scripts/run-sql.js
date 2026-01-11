// Script per eseguire file SQL su Supabase
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:ekZp4mH5mbMK3X%26@db.sayquehhyyxwtrphysqe.supabase.co:5432/postgres';

async function runSQL(filePath) {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log(`Connesso al database. Esecuzione: ${path.basename(filePath)}`);

    const sql = fs.readFileSync(filePath, 'utf8');
    const result = await client.query(sql);

    console.log(`✅ ${path.basename(filePath)} eseguito con successo`);
    if (result.command) {
      console.log(`   Comando: ${result.command}, Righe: ${result.rowCount || 0}`);
    }
    // Mostra risultati per SELECT
    if (result.rows && result.rows.length > 0 && result.command === 'SELECT') {
      console.log('\nRisultati:');
      console.table(result.rows.slice(0, 50)); // Max 50 righe
    }
    return true;
  } catch (error) {
    console.error(`❌ Errore in ${path.basename(filePath)}:`);
    console.error(`   ${error.message}`);
    return false;
  } finally {
    await client.end();
  }
}

const filePath = process.argv[2];
if (!filePath) {
  console.error('Uso: node run-sql.js <percorso-file-sql>');
  process.exit(1);
}

runSQL(filePath).then(success => {
  process.exit(success ? 0 : 1);
});
