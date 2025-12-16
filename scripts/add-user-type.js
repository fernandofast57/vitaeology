// Aggiunge colonna user_type a profiles
const { Client } = require('pg');

const connectionString = 'postgresql://postgres:ekZp4mH5mbMK3X%26@db.sayquehhyyxwtrphysqe.supabase.co:5432/postgres';

async function addUserType() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connesso. Aggiungo colonna user_type...');

    await client.query(`
      ALTER TABLE public.profiles
      ADD COLUMN IF NOT EXISTS user_type VARCHAR(20) DEFAULT 'User';
    `);

    console.log('✅ Colonna user_type aggiunta con successo');
    return true;
  } catch (error) {
    console.error('❌ Errore:', error.message);
    return false;
  } finally {
    await client.end();
  }
}

addUserType().then(success => process.exit(success ? 0 : 1));
