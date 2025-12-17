const { Client } = require('pg');

const connectionString = 'postgresql://postgres:ekZp4mH5mbMK3X%26@db.sayquehhyyxwtrphysqe.supabase.co:5432/postgres';

async function checkConversations() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    // Check conversations
    const convResult = await client.query(`
      SELECT id, user_id, user_message, created_at
      FROM ai_coach_conversations
      ORDER BY created_at DESC
      LIMIT 5;
    `);

    console.log('Conversazioni salvate:', convResult.rows.length);
    convResult.rows.forEach((row, i) => {
      console.log(`${i + 1}. ${row.id}`);
      console.log(`   User: ${row.user_id}`);
      console.log(`   Messaggio: ${row.user_message.substring(0, 50)}...`);
    });

    // Try manual insert
    console.log('\nTest inserimento manuale...');
    const testResult = await client.query(`
      INSERT INTO ai_coach_conversations
        (user_id, session_id, user_message, ai_response)
      VALUES
        ('c7981336-ed0e-42da-9278-bbb8d852c87b', gen_random_uuid(), 'Test message', 'Test response')
      RETURNING id;
    `);
    console.log('Inserimento OK! ID:', testResult.rows[0].id);

    // Check user memory
    const memResult = await client.query(`
      SELECT id, user_id, communication_style
      FROM ai_coach_user_memory
      ORDER BY created_at DESC
      LIMIT 3;
    `);
    console.log('\nMemoria utente:', memResult.rows.length, 'record');

  } catch (error) {
    console.error('Errore:', error.message);
  } finally {
    await client.end();
  }
}

checkConversations();
