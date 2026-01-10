/**
 * Script per testare il flusso Discovery → Mini-Profilo
 *
 * 1. Verifica utenti esistenti con dati challenge
 * 2. Se non ci sono, inserisce dati test per un utente
 * 3. Testa il calcolo del profilo
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Risposte test per simulare una challenge completata
// Mix di A, B, C per avere un profilo realistico
const TEST_RESPONSES = {
  leadership: [
    // Giorno 1: Visione, Relazioni, Azione
    { day: 1, q1: 'A', q2: 'B', q3: 'A' },
    // Giorno 2: Adattamento, Visione, Relazioni
    { day: 2, q1: 'B', q2: 'A', q3: 'B' },
    // Giorno 3: Visione, Visione, Azione
    { day: 3, q1: 'A', q2: 'B', q3: 'A' },
    // Giorno 4: Azione, Azione, Adattamento
    { day: 4, q1: 'A', q2: 'A', q3: 'B' },
    // Giorno 5: Relazioni, Adattamento, Azione
    { day: 5, q1: 'B', q2: 'A', q3: 'A' },
    // Giorno 6: Adattamento, Adattamento, Visione
    { day: 6, q1: 'A', q2: 'B', q3: 'A' },
    // Giorno 7: Visione, Relazioni, Azione
    { day: 7, q1: 'A', q2: 'A', q3: 'B' }
  ],
  ostacoli: [
    // Giorno 1: Pattern, Segnali, Risorse
    { day: 1, q1: 'A', q2: 'B', q3: 'A' },
    // Giorno 2: Pattern, Pattern, Pattern
    { day: 2, q1: 'A', q2: 'A', q3: 'B' },
    // Giorno 3: Segnali, Segnali, Segnali
    { day: 3, q1: 'B', q2: 'A', q3: 'A' },
    // Giorno 4: Risorse, Risorse, Risorse
    { day: 4, q1: 'A', q2: 'B', q3: 'A' },
    // Giorno 5: Pattern, Segnali, Risorse
    { day: 5, q1: 'B', q2: 'A', q3: 'A' },
    // Giorno 6: Pattern, Segnali, Risorse
    { day: 6, q1: 'A', q2: 'B', q3: 'B' },
    // Giorno 7: Pattern, Segnali, Risorse
    { day: 7, q1: 'A', q2: 'A', q3: 'A' }
  ],
  microfelicita: [
    // Giorno 1: Rileva, Rileva, Accogli
    { day: 1, q1: 'A', q2: 'B', q3: 'A' },
    // Giorno 2: Distingui, Amplifica, Rileva
    { day: 2, q1: 'B', q2: 'A', q3: 'A' },
    // Giorno 3: Rileva, Accogli, Accogli
    { day: 3, q1: 'A', q2: 'A', q3: 'B' },
    // Giorno 4: Distingui, Amplifica, Resta
    { day: 4, q1: 'A', q2: 'B', q3: 'A' },
    // Giorno 5: Distingui, Amplifica, Accogli
    { day: 5, q1: 'B', q2: 'A', q3: 'A' },
    // Giorno 6: Resta, Resta, Amplifica
    { day: 6, q1: 'A', q2: 'A', q3: 'B' },
    // Giorno 7: Rileva, Distingui, Resta
    { day: 7, q1: 'A', q2: 'B', q3: 'A' }
  ]
};

async function main() {
  console.log('🔍 Verifica dati challenge esistenti...\n');

  // 1. Cerca utenti con risposte discovery
  const { data: existingResponses, error: searchError } = await supabase
    .from('challenge_discovery_responses')
    .select('user_id, challenge_type, day_number')
    .order('created_at', { ascending: false })
    .limit(50);

  if (searchError) {
    console.error('❌ Errore ricerca:', searchError.message);
    return;
  }

  // Raggruppa per utente e challenge
  const userChallenges = {};
  if (existingResponses && existingResponses.length > 0) {
    existingResponses.forEach(r => {
      const key = `${r.user_id}|${r.challenge_type}`;
      if (!userChallenges[key]) {
        userChallenges[key] = new Set();
      }
      userChallenges[key].add(r.day_number);
    });

    console.log('📊 Utenti con dati challenge:');
    for (const [key, days] of Object.entries(userChallenges)) {
      const [userId, challengeType] = key.split('|');
      const daysCompleted = days.size;
      const isComplete = daysCompleted === 7;
      console.log(`   ${challengeType}: ${daysCompleted}/7 giorni ${isComplete ? '✅' : '⏳'} (user: ${userId.slice(0, 8)}...)`);
    }
    console.log('');
  } else {
    console.log('   Nessun dato trovato\n');
  }

  // 2. Cerca un utente completato o il primo utente disponibile
  let testUserId = null;
  let testChallengeType = null;

  // Prima cerca challenge complete
  for (const [key, days] of Object.entries(userChallenges)) {
    if (days.size === 7) {
      const [userId, challengeType] = key.split('|');
      testUserId = userId;
      testChallengeType = challengeType;
      console.log(`✅ Trovata challenge completa: ${challengeType} (user: ${userId.slice(0, 8)}...)\n`);
      break;
    }
  }

  // Se non ci sono challenge complete, prendi il primo utente dal DB
  if (!testUserId) {
    console.log('⚠️  Nessuna challenge completa trovata. Cerco un utente per creare dati test...\n');

    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .limit(1);

    if (userError || !users || users.length === 0) {
      console.error('❌ Nessun utente trovato nel database.');
      console.log('   Crea prima un utente registrandoti su /auth/signup');
      return;
    }

    testUserId = users[0].id;
    testChallengeType = 'leadership'; // Default
    console.log(`👤 Utente trovato: ${users[0].email} (${testUserId.slice(0, 8)}...)`);
    console.log(`   Inserisco dati test per challenge "${testChallengeType}"...\n`);

    // Inserisci dati test
    const responses = TEST_RESPONSES[testChallengeType];
    const records = [];

    for (const dayData of responses) {
      records.push(
        { user_id: testUserId, challenge_type: testChallengeType, day_number: dayData.day, question_number: 1, response: dayData.q1 },
        { user_id: testUserId, challenge_type: testChallengeType, day_number: dayData.day, question_number: 2, response: dayData.q2 },
        { user_id: testUserId, challenge_type: testChallengeType, day_number: dayData.day, question_number: 3, response: dayData.q3 }
      );
    }

    // Prima elimina eventuali dati esistenti per questo utente/challenge
    await supabase
      .from('challenge_discovery_responses')
      .delete()
      .eq('user_id', testUserId)
      .eq('challenge_type', testChallengeType);

    // Inserisci nuovi dati
    const { error: insertError } = await supabase
      .from('challenge_discovery_responses')
      .insert(records);

    if (insertError) {
      console.error('❌ Errore inserimento:', insertError.message);
      return;
    }

    console.log(`✅ Inseriti ${records.length} record di test (7 giorni × 3 domande)\n`);
  }

  // 3. Verifica i dati inseriti
  console.log('📋 Verifica dati per calcolo profilo...');

  const { data: testData, error: testError } = await supabase
    .from('challenge_discovery_responses')
    .select('day_number, question_number, response')
    .eq('user_id', testUserId)
    .eq('challenge_type', testChallengeType)
    .order('day_number')
    .order('question_number');

  if (testError) {
    console.error('❌ Errore lettura:', testError.message);
    return;
  }

  console.log(`   Trovate ${testData.length} risposte per ${testChallengeType}\n`);

  // 4. Simula il calcolo del profilo (come fa l'API)
  console.log('🧮 Simulazione calcolo profilo...\n');

  // Trasforma in formato per calculateDiscoveryProfile
  const formattedResponses = {};
  for (const r of testData) {
    if (!formattedResponses[r.day_number]) {
      formattedResponses[r.day_number] = {};
    }
    formattedResponses[r.day_number][r.question_number - 1] = r.response;
  }

  // Mostra le risposte formattate
  console.log('   Risposte formattate:');
  for (let day = 1; day <= 7; day++) {
    const dayResponses = formattedResponses[day] || {};
    console.log(`   Giorno ${day}: Q1=${dayResponses[0] || '-'}, Q2=${dayResponses[1] || '-'}, Q3=${dayResponses[2] || '-'}`);
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📍 Per testare l\'API, esegui:');
  console.log(`   curl "http://localhost:3000/api/challenge/mini-profile?type=${testChallengeType}"`);
  console.log('   (richiede autenticazione - testa dalla pagina /challenge/${testChallengeType}/complete)');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log(`✅ Test completato. Visita /challenge/${testChallengeType}/complete per vedere il mini-profilo.`);
}

main().catch(console.error);
