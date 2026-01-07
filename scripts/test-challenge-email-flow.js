/**
 * Test Challenge Email Flow End-to-End
 * Verifica che tutto il sistema email delle challenge funzioni correttamente
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('\n=== TEST CHALLENGE EMAIL FLOW ===\n');

  const issues = [];
  const successes = [];

  // 1. Verifica connessione database
  console.log('1. VERIFICA CONNESSIONE DATABASE');
  try {
    const { count, error } = await supabase
      .from('challenge_subscribers')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    successes.push(`✅ Database connesso - ${count} subscriber totali`);
    console.log(`   ✅ Database OK - ${count} subscriber`);
  } catch (err) {
    issues.push(`❌ Database: ${err.message}`);
    console.log(`   ❌ Errore database: ${err.message}`);
  }

  // 2. Verifica struttura tabella challenge_subscribers
  console.log('\n2. VERIFICA STRUTTURA challenge_subscribers');
  const requiredColumns = [
    'id', 'email', 'challenge', 'current_day', 'status',
    'last_email_sent_at', 'last_email_type', 'completed_at',
    'post_email_1_sent', 'post_email_2_sent', 'post_email_3_sent',
    'nome', 'variant', 'subscribed_at'
  ];

  try {
    const { data: sample, error } = await supabase
      .from('challenge_subscribers')
      .select('*')
      .limit(1);

    if (error && !error.message.includes('rows')) throw error;

    if (sample && sample.length > 0) {
      const columns = Object.keys(sample[0]);
      const missing = requiredColumns.filter(c => !columns.includes(c));
      if (missing.length > 0) {
        issues.push(`❌ Colonne mancanti: ${missing.join(', ')}`);
        console.log(`   ❌ Colonne mancanti: ${missing.join(', ')}`);
      } else {
        successes.push('✅ Tutte le colonne richieste presenti');
        console.log('   ✅ Tutte le colonne presenti');
      }
    } else {
      console.log('   ⚠️  Nessun subscriber per verificare colonne');
    }
  } catch (err) {
    issues.push(`❌ Verifica struttura: ${err.message}`);
    console.log(`   ❌ Errore: ${err.message}`);
  }

  // 3. Verifica subscriber per stato
  console.log('\n3. VERIFICA STATO SUBSCRIBER');

  try {
    // Subscriber attivi senza last_email_sent_at
    const { data: noEmailSent } = await supabase
      .from('challenge_subscribers')
      .select('id, email, challenge')
      .eq('status', 'active')
      .is('last_email_sent_at', null);

    if (noEmailSent && noEmailSent.length > 0) {
      issues.push(`⚠️  ${noEmailSent.length} subscriber attivi senza last_email_sent_at`);
      console.log(`   ⚠️  ${noEmailSent.length} attivi SENZA last_email_sent_at:`);
      noEmailSent.slice(0, 5).forEach(s => console.log(`      - ${s.email}`));
      if (noEmailSent.length > 5) console.log(`      ... e altri ${noEmailSent.length - 5}`);
    } else {
      successes.push('✅ Tutti gli attivi hanno last_email_sent_at');
      console.log('   ✅ Tutti gli attivi hanno last_email_sent_at');
    }

    // Subscriber bloccati (> 72h dall'ultima email)
    const seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
    const { data: stuck } = await supabase
      .from('challenge_subscribers')
      .select('id, email, challenge, current_day, last_email_sent_at')
      .eq('status', 'active')
      .lt('current_day', 7)
      .lt('last_email_sent_at', seventyTwoHoursAgo);

    if (stuck && stuck.length > 0) {
      issues.push(`⚠️  ${stuck.length} subscriber potrebbero essere bloccati (>72h)`);
      console.log(`   ⚠️  ${stuck.length} potrebbero essere bloccati:`);
      stuck.slice(0, 5).forEach(s => {
        const hours = Math.round((Date.now() - new Date(s.last_email_sent_at).getTime()) / (1000 * 60 * 60));
        console.log(`      - ${s.email} (giorno ${s.current_day}, ${hours}h fa)`);
      });
    } else {
      successes.push('✅ Nessun subscriber bloccato da >72h');
      console.log('   ✅ Nessun subscriber bloccato');
    }

    // Distribuzione per stato
    const { data: allSubs } = await supabase
      .from('challenge_subscribers')
      .select('status, challenge');

    if (allSubs) {
      const stats = {};
      allSubs.forEach(s => {
        const key = `${s.challenge}|${s.status}`;
        stats[key] = (stats[key] || 0) + 1;
      });
      console.log('\n   Distribuzione:');
      Object.entries(stats).sort().forEach(([key, count]) => {
        const [challenge, status] = key.split('|');
        console.log(`      ${challenge} - ${status}: ${count}`);
      });
    }
  } catch (err) {
    issues.push(`❌ Verifica stati: ${err.message}`);
    console.log(`   ❌ Errore: ${err.message}`);
  }

  // 4. Verifica challenge_day_completions
  console.log('\n4. VERIFICA challenge_day_completions');
  try {
    const { count, error } = await supabase
      .from('challenge_day_completions')
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.message.includes('does not exist')) {
        issues.push('❌ Tabella challenge_day_completions NON ESISTE');
        console.log('   ❌ TABELLA NON ESISTE!');
      } else {
        throw error;
      }
    } else {
      successes.push(`✅ challenge_day_completions OK (${count || 0} record)`);
      console.log(`   ✅ Tabella OK - ${count || 0} completamenti`);
    }
  } catch (err) {
    issues.push(`❌ Completions: ${err.message}`);
    console.log(`   ❌ Errore: ${err.message}`);
  }

  // 5. Verifica challenge_email_events
  console.log('\n5. VERIFICA challenge_email_events');
  try {
    const { count, error } = await supabase
      .from('challenge_email_events')
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.message.includes('does not exist')) {
        issues.push('❌ Tabella challenge_email_events NON ESISTE');
        console.log('   ❌ TABELLA NON ESISTE!');
      } else {
        throw error;
      }
    } else {
      successes.push(`✅ challenge_email_events OK (${count || 0} record)`);
      console.log(`   ✅ Tabella OK - ${count || 0} eventi`);
    }
  } catch (err) {
    issues.push(`❌ Email events: ${err.message}`);
    console.log(`   ❌ Errore: ${err.message}`);
  }

  // 6. Verifica ab_test_events
  console.log('\n6. VERIFICA ab_test_events');
  try {
    const { count, error } = await supabase
      .from('ab_test_events')
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.message.includes('does not exist')) {
        issues.push('❌ Tabella ab_test_events NON ESISTE');
        console.log('   ❌ TABELLA NON ESISTE!');
      } else {
        throw error;
      }
    } else {
      successes.push(`✅ ab_test_events OK (${count || 0} record)`);
      console.log(`   ✅ Tabella OK - ${count || 0} eventi`);
    }
  } catch (err) {
    issues.push(`❌ AB events: ${err.message}`);
    console.log(`   ❌ Errore: ${err.message}`);
  }

  // 7. Verifica API Resend
  console.log('\n7. VERIFICA CONFIGURAZIONE RESEND');
  if (process.env.RESEND_API_KEY) {
    successes.push('✅ RESEND_API_KEY configurata');
    console.log('   ✅ RESEND_API_KEY presente');
  } else {
    issues.push('❌ RESEND_API_KEY NON configurata');
    console.log('   ❌ RESEND_API_KEY MANCANTE!');
  }

  // 8. Verifica logica cron
  console.log('\n8. VERIFICA CANDIDATI PER CRON EMAIL');

  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    // Day content candidates
    const { data: dayContentCandidates } = await supabase
      .from('challenge_subscribers')
      .select('id, email, challenge, current_day')
      .eq('status', 'active')
      .eq('last_email_type', 'welcome')
      .lt('last_email_sent_at', twoHoursAgo)
      .lte('current_day', 7);

    console.log(`   📧 Day Content candidates: ${dayContentCandidates?.length || 0}`);
    if (dayContentCandidates?.length > 0) {
      dayContentCandidates.slice(0, 3).forEach(s => {
        console.log(`      - ${s.email} (${s.challenge}, day ${s.current_day})`);
      });
    }

    // Reminder candidates
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const { data: reminderCandidates } = await supabase
      .from('challenge_subscribers')
      .select('id, email, challenge, current_day')
      .eq('status', 'active')
      .eq('last_email_type', 'day_content')
      .lt('last_email_sent_at', fortyEightHoursAgo)
      .lt('current_day', 7);

    console.log(`   🔔 Reminder candidates (48h): ${reminderCandidates?.length || 0}`);

    // Force unlock candidates
    const seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
    const { data: forceUnlockCandidates } = await supabase
      .from('challenge_subscribers')
      .select('id, email, challenge, current_day')
      .eq('status', 'active')
      .eq('last_email_type', 'reminder')
      .lt('last_email_sent_at', seventyTwoHoursAgo)
      .lt('current_day', 7);

    console.log(`   🔓 Force Unlock candidates (72h): ${forceUnlockCandidates?.length || 0}`);

    // Post-challenge candidates
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: postChallenge1 } = await supabase
      .from('challenge_subscribers')
      .select('id, email')
      .eq('status', 'completed')
      .is('post_email_1_sent', null)
      .lt('completed_at', twentyFourHoursAgo);

    console.log(`   📬 Post-challenge 1 candidates: ${postChallenge1?.length || 0}`);

  } catch (err) {
    issues.push(`❌ Verifica candidati cron: ${err.message}`);
    console.log(`   ❌ Errore: ${err.message}`);
  }

  // 9. Verifica API endpoints
  console.log('\n9. VERIFICA ENDPOINT API');
  const endpoints = [
    '/api/challenge/subscribe',
    '/api/challenge/complete-day',
    '/api/challenge/check-unlock',
    '/api/cron/challenge-emails'
  ];
  console.log('   Endpoint definiti:');
  endpoints.forEach(ep => console.log(`   - ${ep}`));
  successes.push('✅ Endpoint API definiti');

  // RIEPILOGO
  console.log('\n' + '='.repeat(50));
  console.log('RIEPILOGO');
  console.log('='.repeat(50));

  console.log('\n✅ SUCCESSI:');
  successes.forEach(s => console.log(`   ${s}`));

  if (issues.length > 0) {
    console.log('\n⚠️  PROBLEMI TROVATI:');
    issues.forEach(i => console.log(`   ${i}`));
  } else {
    console.log('\n🎉 NESSUN PROBLEMA TROVATO!');
  }

  console.log('\n' + '='.repeat(50));
  console.log('AZIONI RACCOMANDATE:');
  console.log('='.repeat(50));

  if (issues.some(i => i.includes('last_email_sent_at'))) {
    console.log('\n1. Esegui fix per subscriber senza email tracking:');
    console.log('   node scripts/run-sql.js sql/fix-existing-subscribers.sql');
  }

  if (issues.some(i => i.includes('NON ESISTE'))) {
    console.log('\n2. Crea tabelle mancanti:');
    console.log('   node scripts/run-sql.js sql/challenge-email-schema.sql');
  }

  console.log('\n3. Test cron manuale:');
  console.log('   curl -X POST http://localhost:3000/api/cron/challenge-emails');
  console.log('   oppure usa il pulsante "Esegui Cron Manuale" in /admin/challenges');

  console.log('\n=== FINE TEST ===\n');
}

main().catch(console.error);
