// Script per identificare e pulire utenti spam dalla tabella auth.users
// ATTENZIONE: Elimina utenti dal sistema di autenticazione Supabase

const { Client } = require('pg');
const readline = require('readline');

const connectionString = 'postgresql://postgres:ekZp4mH5mbMK3X%26@db.sayquehhyyxwtrphysqe.supabase.co:5432/postgres';

// Funzione per identificare email spam
function isSpamEmail(email) {
  const localPart = email.split('@')[0];
  const dots = (localPart.match(/\./g) || []).length;
  const letters = localPart.replace(/[^a-zA-Z]/g, '').length;

  // Pattern 1: più di 3 punti E meno di 15 lettere
  if (dots > 3 && letters < 15) {
    return { spam: true, reason: `${dots} punti, ${letters} lettere`, severity: 'high' };
  }

  // Pattern 2: sequenza tipo a.b.c.d (singole lettere separate da punti)
  const singleLetterPattern = /^([a-z]\.){3,}/i;
  if (singleLetterPattern.test(localPart)) {
    return { spam: true, reason: 'pattern a.b.c.d', severity: 'high' };
  }

  // Pattern 3: punti malformati
  if (localPart.includes('..') || localPart.startsWith('.') || localPart.endsWith('.')) {
    return { spam: true, reason: 'punti malformati', severity: 'medium' };
  }

  // Pattern 4: 3 punti con poche lettere (sospetto)
  if (dots === 3 && letters < 12) {
    return { spam: true, reason: `3 punti, ${letters} lettere (sospetto)`, severity: 'medium' };
  }

  return { spam: false };
}

function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.toLowerCase());
    });
  });
}

async function main() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  const dryRun = !process.argv.includes('--delete');

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║      VITAEOLOGY - AUTH USERS SPAM CLEANUP SCRIPT           ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  if (dryRun) {
    console.log('📋 MODALITÀ: DRY RUN (solo analisi)');
    console.log('   Per eliminare: node cleanup-spam-auth-users.js --delete\n');
  } else {
    console.log('⚠️  MODALITÀ: DELETE - Verranno eliminati utenti da auth.users!\n');
  }

  try {
    await client.connect();
    console.log('✅ Connesso al database\n');

    // 1. Recupera tutti gli utenti auth
    const { rows: users } = await client.query(`
      SELECT
        id,
        email,
        created_at,
        email_confirmed_at,
        last_sign_in_at,
        raw_user_meta_data
      FROM auth.users
      ORDER BY created_at DESC
    `);

    console.log(`📊 Totale utenti auth: ${users.length}\n`);

    // 2. Analizza per spam
    const spamUsers = [];
    const validUsers = [];

    for (const user of users) {
      const check = isSpamEmail(user.email);
      if (check.spam) {
        spamUsers.push({ ...user, reason: check.reason, severity: check.severity });
      } else {
        validUsers.push(user);
      }
    }

    // 3. Report
    console.log('═══════════════════════════════════════════════════════════');
    console.log('                    RISULTATI ANALISI                       ');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log(`✅ Utenti validi:    ${validUsers.length}`);
    console.log(`❌ Utenti spam:      ${spamUsers.length}`);
    console.log(`📈 % spam:           ${((spamUsers.length / users.length) * 100).toFixed(1)}%\n`);

    // Separa per severity
    const highSeverity = spamUsers.filter(u => u.severity === 'high');
    const mediumSeverity = spamUsers.filter(u => u.severity === 'medium');

    console.log(`   🔴 Alta severità:   ${highSeverity.length}`);
    console.log(`   🟡 Media severità:  ${mediumSeverity.length}\n`);

    if (spamUsers.length > 0) {
      console.log('───────────────────────────────────────────────────────────');
      console.log('                  UTENTI SPAM RILEVATI                      ');
      console.log('───────────────────────────────────────────────────────────\n');

      // Alta severità
      if (highSeverity.length > 0) {
        console.log('🔴 ALTA SEVERITÀ (pattern chiaro):');
        for (const user of highSeverity) {
          const date = new Date(user.created_at).toLocaleDateString('it-IT');
          const confirmed = user.email_confirmed_at ? '✓ confermato' : '✗ non confermato';
          const signedIn = user.last_sign_in_at ? '✓ login' : '✗ mai loggato';
          console.log(`  ${user.email.padEnd(40)} | ${user.reason.padEnd(20)} | ${date} | ${confirmed} | ${signedIn}`);
        }
      }

      // Media severità
      if (mediumSeverity.length > 0) {
        console.log('\n🟡 MEDIA SEVERITÀ (da verificare):');
        for (const user of mediumSeverity) {
          const date = new Date(user.created_at).toLocaleDateString('it-IT');
          const confirmed = user.email_confirmed_at ? '✓ confermato' : '✗ non confermato';
          console.log(`  ${user.email.padEnd(40)} | ${user.reason.padEnd(20)} | ${date} | ${confirmed}`);
        }
      }

      // Analisi dati collegati
      console.log('\n───────────────────────────────────────────────────────────');
      console.log('              VERIFICA DATI COLLEGATI                       ');
      console.log('───────────────────────────────────────────────────────────\n');

      const spamIds = spamUsers.map(u => u.id);

      // Verifica profiles
      const { rows: profiles } = await client.query(`
        SELECT COUNT(*) as count FROM profiles WHERE id = ANY($1::uuid[])
      `, [spamIds]);
      console.log(`  Profiles collegati:        ${profiles[0].count}`);

      // Verifica assessment
      const { rows: assessments } = await client.query(`
        SELECT COUNT(*) as count FROM user_assessments_v2 WHERE user_id = ANY($1::uuid[])
      `, [spamIds]);
      console.log(`  Assessment completati:     ${assessments[0].count}`);

      // Verifica conversazioni AI
      const { rows: conversations } = await client.query(`
        SELECT COUNT(*) as count FROM ai_coach_conversations WHERE user_id = ANY($1::uuid[])
      `, [spamIds]);
      console.log(`  Conversazioni AI Coach:    ${conversations[0].count}`);

      // Verifica exercise progress
      const { rows: exercises } = await client.query(`
        SELECT COUNT(*) as count FROM user_exercise_progress WHERE user_id = ANY($1::uuid[])
      `, [spamIds]);
      console.log(`  Esercizi completati:       ${exercises[0].count}`);

      // 5. Eliminazione
      if (!dryRun) {
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('                      ELIMINAZIONE                          ');
        console.log('═══════════════════════════════════════════════════════════\n');

        // Prima chiedi se eliminare solo alta severità o tutti
        console.log('Opzioni:');
        console.log('  1) Elimina solo ALTA severità (' + highSeverity.length + ' utenti)');
        console.log('  2) Elimina TUTTI gli spam (' + spamUsers.length + ' utenti)');
        console.log('  3) Annulla\n');

        const choice = await askQuestion('Scegli (1/2/3): ');

        let toDelete = [];
        if (choice === '1') {
          toDelete = highSeverity;
        } else if (choice === '2') {
          toDelete = spamUsers;
        } else {
          console.log('\n❌ Eliminazione annullata');
          await client.end();
          return;
        }

        const confirm = await askQuestion(`\n⚠️  Confermi eliminazione di ${toDelete.length} utenti? (yes/no): `);

        if (confirm === 'yes' || confirm === 'y') {
          const idsToDelete = toDelete.map(u => u.id);

          // Elimina dati collegati prima (per evitare FK violations)
          console.log('\nEliminazione dati collegati...');

          // Profiles (ha ON DELETE CASCADE, ma per sicurezza)
          await client.query(`DELETE FROM profiles WHERE id = ANY($1::uuid[])`, [idsToDelete]);

          // Assessment answers
          await client.query(`
            DELETE FROM user_answers_v2
            WHERE assessment_id IN (
              SELECT id FROM user_assessments_v2 WHERE user_id = ANY($1::uuid[])
            )
          `, [idsToDelete]);

          // Assessments
          await client.query(`DELETE FROM user_assessments_v2 WHERE user_id = ANY($1::uuid[])`, [idsToDelete]);

          // AI conversations messages
          await client.query(`
            DELETE FROM ai_coach_messages
            WHERE conversation_id IN (
              SELECT id FROM ai_coach_conversations WHERE user_id = ANY($1::uuid[])
            )
          `, [idsToDelete]);

          // AI conversations
          await client.query(`DELETE FROM ai_coach_conversations WHERE user_id = ANY($1::uuid[])`, [idsToDelete]);

          // Exercise progress
          await client.query(`DELETE FROM user_exercise_progress WHERE user_id = ANY($1::uuid[])`, [idsToDelete]);

          // AI memory
          await client.query(`DELETE FROM ai_coach_user_memory WHERE user_id = ANY($1::uuid[])`, [idsToDelete]);

          // Infine elimina gli utenti auth
          console.log('Eliminazione utenti auth...');
          const { rowCount } = await client.query(`
            DELETE FROM auth.users WHERE id = ANY($1::uuid[])
          `, [idsToDelete]);

          console.log(`\n✅ Eliminazione completata: ${rowCount} utenti rimossi`);
        } else {
          console.log('\n❌ Eliminazione annullata');
        }
      }
    } else {
      console.log('\n🎉 Nessun utente spam rilevato!');
    }

    // 6. Statistiche utenti recenti
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('                UTENTI RECENTI (ultimi 7 giorni)            ');
    console.log('═══════════════════════════════════════════════════════════\n');

    const { rows: recent } = await client.query(`
      SELECT email, created_at, email_confirmed_at
      FROM auth.users
      WHERE created_at > NOW() - INTERVAL '7 days'
      ORDER BY created_at DESC
    `);

    for (const user of recent) {
      const date = new Date(user.created_at).toLocaleString('it-IT');
      const spam = isSpamEmail(user.email);
      const status = spam.spam ? '❌ SPAM' : '✅';
      const confirmed = user.email_confirmed_at ? '(confermato)' : '(non confermato)';
      console.log(`  ${status} ${user.email.padEnd(40)} | ${date} ${confirmed}`);
    }

  } catch (error) {
    console.error('❌ Errore:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
