/**
 * Script per completare una challenge di test
 * Crea tutti i record necessari per simulare una challenge completa
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Risposte test per leadership challenge
const TEST_RESPONSES = [
  { day: 1, q1: 'A', q2: 'B', q3: 'A' },
  { day: 2, q1: 'B', q2: 'A', q3: 'B' },
  { day: 3, q1: 'A', q2: 'B', q3: 'A' },
  { day: 4, q1: 'A', q2: 'A', q3: 'B' },
  { day: 5, q1: 'B', q2: 'A', q3: 'A' },
  { day: 6, q1: 'A', q2: 'B', q3: 'A' },
  { day: 7, q1: 'A', q2: 'A', q3: 'B' }
];

async function main() {
  const challengeType = process.argv[2] || 'leadership';
  const normalizedChallenge = challengeType === 'leadership' ? 'leadership-autentica' :
                               challengeType === 'ostacoli' ? 'oltre-ostacoli' :
                               'microfelicita';

  console.log('═══════════════════════════════════════════════════════════');
  console.log(`   COMPLETAMENTO TEST CHALLENGE: ${challengeType.toUpperCase()}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  // 1. Trova utente test
  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', 'fernando@vitaeology.com')
    .single();

  if (userError || !user) {
    console.error('❌ Utente fernando@vitaeology.com non trovato');
    return;
  }

  console.log(`👤 Utente: ${user.email} (${user.id.slice(0, 8)}...)\n`);

  // 2. Crea/aggiorna subscriber
  console.log('📝 Creazione subscriber...');

  const subscriberData = {
    email: user.email,
    challenge: normalizedChallenge,
    nome: 'Fernando',
    status: 'completed',
    current_day: 7,
    variant: 'A',
    subscribed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 giorni fa
    completed_at: new Date().toISOString(),
    last_activity_at: new Date().toISOString()
  };

  // Prima elimina subscriber esistente
  await supabase
    .from('challenge_subscribers')
    .delete()
    .eq('email', user.email)
    .eq('challenge', normalizedChallenge);

  const { data: subscriber, error: subError } = await supabase
    .from('challenge_subscribers')
    .insert(subscriberData)
    .select()
    .single();

  if (subError) {
    console.error('❌ Errore creazione subscriber:', subError.message);
    return;
  }

  console.log(`   ✅ Subscriber creato (ID: ${subscriber.id})\n`);

  // 3. Crea day completions
  console.log('📅 Creazione completamenti giornalieri...');

  const dayCompletions = [];
  for (let day = 1; day <= 7; day++) {
    dayCompletions.push({
      subscriber_id: subscriber.id,
      challenge: normalizedChallenge,
      day_number: day,
      email_sent_at: new Date(Date.now() - (7 - day + 1) * 24 * 60 * 60 * 1000).toISOString(),
      email_opened_at: new Date(Date.now() - (7 - day) * 24 * 60 * 60 * 1000).toISOString(),
      action_completed_at: new Date(Date.now() - (7 - day) * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  // Prima elimina completamenti esistenti
  await supabase
    .from('challenge_day_completions')
    .delete()
    .eq('subscriber_id', subscriber.id);

  const { error: compError } = await supabase
    .from('challenge_day_completions')
    .insert(dayCompletions);

  if (compError) {
    console.error('❌ Errore creazione completamenti:', compError.message);
    // Continua comunque
  } else {
    console.log(`   ✅ 7 giorni completati\n`);
  }

  // 4. Crea/aggiorna discovery responses
  console.log('📊 Creazione risposte Discovery...');

  const discoveryRecords = [];
  for (const dayData of TEST_RESPONSES) {
    discoveryRecords.push(
      { user_id: user.id, challenge_type: challengeType, day_number: dayData.day, question_number: 1, response: dayData.q1 },
      { user_id: user.id, challenge_type: challengeType, day_number: dayData.day, question_number: 2, response: dayData.q2 },
      { user_id: user.id, challenge_type: challengeType, day_number: dayData.day, question_number: 3, response: dayData.q3 }
    );
  }

  // Prima elimina risposte esistenti
  await supabase
    .from('challenge_discovery_responses')
    .delete()
    .eq('user_id', user.id)
    .eq('challenge_type', challengeType);

  const { error: discError } = await supabase
    .from('challenge_discovery_responses')
    .insert(discoveryRecords);

  if (discError) {
    console.error('❌ Errore creazione risposte Discovery:', discError.message);
  } else {
    console.log(`   ✅ 21 risposte Discovery create\n`);
  }

  // 5. Verifica finale
  console.log('🔍 Verifica finale...\n');

  const { data: verifySubscriber } = await supabase
    .from('challenge_subscribers')
    .select('*')
    .eq('id', subscriber.id)
    .single();

  const { count: dayCount } = await supabase
    .from('challenge_day_completions')
    .select('*', { count: 'exact', head: true })
    .eq('subscriber_id', subscriber.id);

  const { count: responseCount } = await supabase
    .from('challenge_discovery_responses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('challenge_type', challengeType);

  console.log('   Subscriber:');
  console.log(`     - Status: ${verifySubscriber.status}`);
  console.log(`     - Current Day: ${verifySubscriber.current_day}`);
  console.log(`     - Completed At: ${verifySubscriber.completed_at}`);
  console.log(`   Day Completions: ${dayCount}/7`);
  console.log(`   Discovery Responses: ${responseCount}/21`);

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   ✅ CHALLENGE COMPLETATA!');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(`   Visita: http://localhost:3000/challenge/${challengeType}/complete`);
  console.log('   (login come fernando@vitaeology.com)\n');
}

main().catch(console.error);
