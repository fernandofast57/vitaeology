const { Client } = require('pg');

const connectionString = 'postgresql://postgres:ekZp4mH5mbMK3X%26@db.sayquehhyyxwtrphysqe.supabase.co:5432/postgres';

async function checkUsers() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    // Recupera utenti
    const result = await client.query(`
      SELECT id, email, created_at
      FROM auth.users
      ORDER BY created_at DESC
      LIMIT 5;
    `);

    console.log('Utenti nel database:');
    console.log('='.repeat(60));
    result.rows.forEach((row, i) => {
      console.log(`${i + 1}. ${row.id}`);
      console.log(`   Email: ${row.email}`);
      console.log(`   Creato: ${row.created_at}`);
      console.log('');
    });

    if (result.rows.length > 0) {
      console.log('Per testare, usa questo userId:');
      console.log(result.rows[0].id);
    }

  } catch (error) {
    console.error('Errore:', error.message);
  } finally {
    await client.end();
  }
}

checkUsers();
