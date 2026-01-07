/**
 * Verifica schema database per challenge email system
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('\n=== VERIFICA SCHEMA DATABASE CHALLENGE ===\n');

  // 1. Verifica colonne challenge_subscribers
  console.log('1. CHALLENGE_SUBSCRIBERS');

  const { data: subSample, error: subError } = await supabase
    .from('challenge_subscribers')
    .select('*')
    .limit(1);

  if (subError) {
    console.log(`   ❌ Errore: ${subError.message}`);
  } else if (subSample && subSample.length > 0) {
    console.log('   Colonne presenti:');
    const cols = Object.keys(subSample[0]);
    cols.forEach(c => console.log(`     - ${c}`));

    // Verifica colonne critiche
    const required = [
      'id', 'email', 'challenge', 'current_day', 'status',
      'last_email_sent_at', 'last_email_type', 'completed_at',
      'post_email_1_sent', 'post_email_2_sent', 'post_email_3_sent'
    ];
    console.log('\n   Verifica colonne critiche:');
    required.forEach(r => {
      const exists = cols.includes(r);
      console.log(`     ${exists ? '✅' : '❌'} ${r}`);
    });
  } else {
    console.log('   ⚠️  Tabella vuota, verifico struttura...');
    // Prova a inserire e vedere cosa fallisce
    const testInsert = await supabase
      .from('challenge_subscribers')
      .insert({
        email: 'test-schema@test.com',
        challenge: 'leadership-autentica',
        current_day: 0,
        status: 'test'
      })
      .select();

    if (testInsert.error) {
      console.log(`   Errore inserimento: ${testInsert.error.message}`);
    } else {
      // Elimina il record di test
      await supabase
        .from('challenge_subscribers')
        .delete()
        .eq('email', 'test-schema@test.com');
      console.log('   ✅ Struttura base OK');
    }
  }

  // 2. Verifica challenge_day_completions
  console.log('\n2. CHALLENGE_DAY_COMPLETIONS');

  const { data: dayCompSample, error: dayCompError } = await supabase
    .from('challenge_day_completions')
    .select('*')
    .limit(1);

  if (dayCompError) {
    if (dayCompError.message.includes('does not exist')) {
      console.log('   ❌ TABELLA NON ESISTE - Deve essere creata!');
    } else {
      console.log(`   ❌ Errore: ${dayCompError.message}`);
    }
  } else {
    console.log('   ✅ Tabella esiste');
    if (dayCompSample && dayCompSample.length > 0) {
      console.log('   Colonne: ' + Object.keys(dayCompSample[0]).join(', '));
    }
  }

  // 3. Verifica challenge_email_events
  console.log('\n3. CHALLENGE_EMAIL_EVENTS');

  const { data: emailEvSample, error: emailEvError } = await supabase
    .from('challenge_email_events')
    .select('*')
    .limit(1);

  if (emailEvError) {
    if (emailEvError.message.includes('does not exist')) {
      console.log('   ❌ TABELLA NON ESISTE - Deve essere creata!');
    } else {
      console.log(`   ❌ Errore: ${emailEvError.message}`);
    }
  } else {
    console.log('   ✅ Tabella esiste');
    if (emailEvSample && emailEvSample.length > 0) {
      console.log('   Colonne: ' + Object.keys(emailEvSample[0]).join(', '));
    }
  }

  // 4. Verifica ab_test_events
  console.log('\n4. AB_TEST_EVENTS');

  const { data: abSample, error: abError } = await supabase
    .from('ab_test_events')
    .select('*')
    .limit(1);

  if (abError) {
    if (abError.message.includes('does not exist')) {
      console.log('   ❌ TABELLA NON ESISTE');
    } else {
      console.log(`   ❌ Errore: ${abError.message}`);
    }
  } else {
    console.log('   ✅ Tabella esiste');
    if (abSample && abSample.length > 0) {
      console.log('   Colonne: ' + Object.keys(abSample[0]).join(', '));
    }
  }

  // 5. Statistiche utili
  console.log('\n5. STATISTICHE');

  const { count: subCount } = await supabase
    .from('challenge_subscribers')
    .select('*', { count: 'exact', head: true });
  console.log(`   Subscribers: ${subCount || 0}`);

  const { count: completionsCount } = await supabase
    .from('challenge_day_completions')
    .select('*', { count: 'exact', head: true })
    .catch(() => ({ count: 0 }));
  console.log(`   Day completions: ${completionsCount || 0}`);

  const { count: emailEvCount } = await supabase
    .from('challenge_email_events')
    .select('*', { count: 'exact', head: true })
    .catch(() => ({ count: 0 }));
  console.log(`   Email events: ${emailEvCount || 0}`);

  console.log('\n=== FINE VERIFICA ===\n');
}

main().catch(console.error);
