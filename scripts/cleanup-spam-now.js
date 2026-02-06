const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function isRandomName(name) {
  if (!name) return false;
  return name.length > 15 && !name.includes(' ') && /^[a-zA-Z]+$/.test(name);
}

const WHITELIST = [
  'fernando@vitaeology.com',
  'fernandomarongiu@hotmail.com',
  'marongiu.luca8@gmail.com',
  'fabrizio.ciancio@gmail.com',
  'fabrizio.ciancio@protonmail.com',
  'olivaalessio00@gmail.com',
  'test@vitaeology.com',
  'fernandospammato@gmail.com'
];

async function cleanSubscribers() {
  console.log('=== PULIZIA CHALLENGE SUBSCRIBERS ===\n');

  // 1. Trova subscribers da eliminare
  const { data: subs } = await supabase
    .from('challenge_subscribers')
    .select('id, email, nome');

  const subsToDelete = subs?.filter(s => {
    if (WHITELIST.includes(s.email)) return false;
    if (s.email?.includes('@test.vitaeology.com')) return false;
    return isRandomName(s.nome);
  }) || [];

  console.log('Subscribers con nomi random da eliminare:', subsToDelete.length);

  if (subsToDelete.length > 0) {
    const idsToDelete = subsToDelete.map(s => s.id);

    // 2. Prima elimina ab_test_events collegati
    console.log('\n1. Eliminazione ab_test_events collegati...');
    const { error: abError } = await supabase
      .from('ab_test_events')
      .delete()
      .in('subscriber_id', idsToDelete);

    if (abError) {
      console.log('   ERRORE:', abError.message);
    } else {
      console.log('   OK - Eliminati ab_test_events');
    }

    // 3. Poi elimina challenge_day_completions collegati
    console.log('\n2. Eliminazione challenge_day_completions collegati...');
    const { error: compError } = await supabase
      .from('challenge_day_completions')
      .delete()
      .in('subscriber_id', idsToDelete);

    if (compError) {
      console.log('   ERRORE:', compError.message);
    } else {
      console.log('   OK - Eliminati challenge_day_completions');
    }

    // 4. Elimina challenge_email_events collegati
    console.log('\n3. Eliminazione challenge_email_events collegati...');
    const { error: emailError } = await supabase
      .from('challenge_email_events')
      .delete()
      .in('subscriber_id', idsToDelete);

    if (emailError) {
      console.log('   ERRORE:', emailError.message);
    } else {
      console.log('   OK - Eliminati challenge_email_events');
    }

    // 5. Finalmente elimina subscribers
    console.log('\n4. Eliminazione challenge_subscribers...');
    const { error: subError } = await supabase
      .from('challenge_subscribers')
      .delete()
      .in('id', idsToDelete);

    if (subError) {
      console.log('   ERRORE:', subError.message);
    } else {
      console.log('   OK - Eliminati', subsToDelete.length, 'subscribers');
    }
  }

  // 6. Verifica finale
  console.log('\n=== VERIFICA FINALE ===');

  const { count: finalSubs } = await supabase
    .from('challenge_subscribers')
    .select('*', { count: 'exact', head: true });

  console.log('Challenge subscribers rimanenti:', finalSubs);

  const { data: remaining } = await supabase
    .from('challenge_subscribers')
    .select('email, nome, challenge, current_day, status')
    .order('subscribed_at', { ascending: true });

  console.log('\nDettaglio:');
  remaining?.forEach(s => {
    const marker = s.nome === 'Visitatore' ? '[Visitatore]' : '';
    console.log(`  ${(s.email || '').padEnd(45)} | ${(s.nome || 'null').padEnd(20)} | ${s.challenge} | day ${s.current_day} ${marker}`);
  });
}

cleanSubscribers().catch(console.error);
