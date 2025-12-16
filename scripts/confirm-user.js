// Conferma manualmente un utente in Supabase
const { Client } = require('pg');

const connectionString = 'postgresql://postgres:ekZp4mH5mbMK3X%26@db.sayquehhyyxwtrphysqe.supabase.co:5432/postgres';
const userEmail = process.argv[2] || 'fernando@vitaeology.com';

async function confirmUser() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connesso al database...');

    // Trova l'utente
    const users = await client.query(
      `SELECT id, email, email_confirmed_at, created_at
       FROM auth.users
       WHERE email = $1`,
      [userEmail]
    );

    if (users.rows.length === 0) {
      console.log('❌ Utente non trovato:', userEmail);
      return;
    }

    const user = users.rows[0];
    console.log('Utente trovato:', user.email);
    console.log('Creato:', user.created_at);
    console.log('Email confermata:', user.email_confirmed_at || 'NO');

    if (!user.email_confirmed_at) {
      // Conferma l'email
      await client.query(
        `UPDATE auth.users
         SET email_confirmed_at = NOW(),
             updated_at = NOW()
         WHERE email = $1`,
        [userEmail]
      );
      console.log('✅ Email confermata manualmente!');
      console.log('Ora puoi fare login su http://localhost:3001/auth/login');
    } else {
      console.log('✅ Email già confermata');
    }

  } catch (error) {
    console.error('❌ Errore:', error.message);
  } finally {
    await client.end();
  }
}

confirmUser();
