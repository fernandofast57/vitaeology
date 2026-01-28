// Script per identificare e pulire subscriber spam dalla tabella challenge_subscribers
// Pattern spam da CLAUDE.md: più di 3 punti nella parte locale + meno di 15 lettere

const { Client } = require('pg');
const readline = require('readline');

const connectionString = 'postgresql://postgres:ekZp4mH5mbMK3X%26@db.sayquehhyyxwtrphysqe.supabase.co:5432/postgres';

// Funzione per identificare email spam (pattern da CLAUDE.md)
function isSpamEmail(email) {
  const localPart = email.split('@')[0];
  const dots = (localPart.match(/\./g) || []).length;
  const letters = localPart.replace(/[^a-zA-Z]/g, '').length;

  // Pattern 1: più di 3 punti E meno di 15 lettere (da CLAUDE.md)
  if (dots > 3 && letters < 15) {
    return { spam: true, reason: `${dots} punti, ${letters} lettere` };
  }

  // Pattern 2: sequenza tipo a.b.c.d (singole lettere separate da punti)
  const singleLetterPattern = /^([a-z]\.){3,}/i;
  if (singleLetterPattern.test(localPart)) {
    return { spam: true, reason: 'pattern singole lettere (a.b.c.d)' };
  }

  // Pattern 3: troppi punti consecutivi o punti all'inizio/fine
  if (localPart.includes('..') || localPart.startsWith('.') || localPart.endsWith('.')) {
    return { spam: true, reason: 'punti malformati' };
  }

  return { spam: false };
}

// Funzione per chiedere conferma
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
  console.log('║       VITAEOLOGY - SPAM SUBSCRIBER CLEANUP SCRIPT          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  if (dryRun) {
    console.log('📋 MODALITÀ: DRY RUN (solo analisi, nessuna eliminazione)');
    console.log('   Per eliminare, esegui: node cleanup-spam-subscribers.js --delete\n');
  } else {
    console.log('⚠️  MODALITÀ: DELETE (verranno eliminati i record spam)\n');
  }

  try {
    await client.connect();
    console.log('✅ Connesso al database\n');

    // 1. Recupera tutti i subscriber
    const { rows: subscribers } = await client.query(`
      SELECT id, email, nome, challenge, status, current_day, subscribed_at, email_errors_count, last_email_error
      FROM challenge_subscribers
      ORDER BY subscribed_at DESC
    `);

    console.log(`📊 Totale subscriber: ${subscribers.length}\n`);

    // 2. Analizza per spam
    const spamSubscribers = [];
    const validSubscribers = [];

    for (const sub of subscribers) {
      const check = isSpamEmail(sub.email);
      if (check.spam) {
        spamSubscribers.push({ ...sub, reason: check.reason });
      } else {
        validSubscribers.push(sub);
      }
    }

    // 3. Report
    console.log('═══════════════════════════════════════════════════════════');
    console.log('                    RISULTATI ANALISI                       ');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log(`✅ Email valide:     ${validSubscribers.length}`);
    console.log(`❌ Email spam:       ${spamSubscribers.length}`);
    console.log(`📈 % spam:           ${((spamSubscribers.length / subscribers.length) * 100).toFixed(1)}%\n`);

    if (spamSubscribers.length > 0) {
      console.log('───────────────────────────────────────────────────────────');
      console.log('                    EMAIL SPAM RILEVATE                     ');
      console.log('───────────────────────────────────────────────────────────\n');

      // Raggruppa per challenge
      const byChallenge = {};
      for (const spam of spamSubscribers) {
        if (!byChallenge[spam.challenge]) byChallenge[spam.challenge] = [];
        byChallenge[spam.challenge].push(spam);
      }

      for (const [challenge, subs] of Object.entries(byChallenge)) {
        console.log(`\n📁 Challenge: ${challenge} (${subs.length} spam)`);
        console.log('─'.repeat(60));

        for (const sub of subs.slice(0, 20)) { // Max 20 per challenge per leggibilità
          const date = sub.subscribed_at ? new Date(sub.subscribed_at).toLocaleDateString('it-IT') : 'N/A';
          const errors = sub.email_errors_count > 0 ? ` [${sub.email_errors_count} err]` : '';
          console.log(`  ❌ ${sub.email.padEnd(35)} | ${sub.reason.padEnd(25)} | ${date}${errors}`);
        }

        if (subs.length > 20) {
          console.log(`  ... e altri ${subs.length - 20} email spam`);
        }
      }

      // 4. Analisi statistica dei pattern
      console.log('\n───────────────────────────────────────────────────────────');
      console.log('                  ANALISI PATTERN SPAM                      ');
      console.log('───────────────────────────────────────────────────────────\n');

      const domains = {};
      for (const spam of spamSubscribers) {
        const domain = spam.email.split('@')[1];
        domains[domain] = (domains[domain] || 0) + 1;
      }

      const sortedDomains = Object.entries(domains).sort((a, b) => b[1] - a[1]);
      console.log('Top domini spam:');
      for (const [domain, count] of sortedDomains.slice(0, 10)) {
        console.log(`  ${domain.padEnd(25)} ${count} occorrenze`);
      }

      // 5. Eliminazione (se --delete)
      if (!dryRun) {
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('                      ELIMINAZIONE                          ');
        console.log('═══════════════════════════════════════════════════════════\n');

        const confirm = await askQuestion(
          `⚠️  Confermi l'eliminazione di ${spamSubscribers.length} record spam? (yes/no): `
        );

        if (confirm === 'yes' || confirm === 'y') {
          const spamIds = spamSubscribers.map(s => s.id);

          // Elimina prima le risposte discovery associate
          const { rowCount: discoveryDeleted } = await client.query(`
            DELETE FROM challenge_discovery_responses
            WHERE subscriber_id = ANY($1::uuid[])
          `, [spamIds]);

          // Elimina i completamenti giorno
          const { rowCount: completionsDeleted } = await client.query(`
            DELETE FROM challenge_day_completions
            WHERE subscriber_id = ANY($1::uuid[])
          `, [spamIds]);

          // Elimina i subscriber
          const { rowCount: subscribersDeleted } = await client.query(`
            DELETE FROM challenge_subscribers
            WHERE id = ANY($1::uuid[])
          `, [spamIds]);

          console.log(`\n✅ Eliminazione completata:`);
          console.log(`   - ${subscribersDeleted} subscriber spam eliminati`);
          console.log(`   - ${discoveryDeleted} risposte discovery eliminate`);
          console.log(`   - ${completionsDeleted} completamenti giorno eliminati`);
        } else {
          console.log('\n❌ Eliminazione annullata');
        }
      }
    } else {
      console.log('\n🎉 Nessun email spam rilevata! Il database è pulito.');
    }

    // 6. Statistiche finali
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('                   STATISTICHE FINALI                       ');
    console.log('═══════════════════════════════════════════════════════════\n');

    const { rows: stats } = await client.query(`
      SELECT
        challenge,
        status,
        COUNT(*) as count
      FROM challenge_subscribers
      GROUP BY challenge, status
      ORDER BY challenge, status
    `);

    console.log('Distribuzione per challenge e status:');
    for (const stat of stats) {
      console.log(`  ${stat.challenge.padEnd(25)} ${stat.status.padEnd(12)} ${stat.count}`);
    }

  } catch (error) {
    console.error('❌ Errore:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
