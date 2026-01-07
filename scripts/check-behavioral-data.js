/**
 * Script per verificare i dati behavioral_events in Supabase
 * Usa il service role key per accesso diretto al DB
 *
 * Esegui: node scripts/check-behavioral-data.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variabili ambiente mancanti: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkBehavioralData() {
  console.log('📊 Verifica dati Behavioral Events\n');
  console.log('='.repeat(60));

  // 1. Conteggio totale
  const { count: totalCount, error: countError } = await supabase
    .from('behavioral_events')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ Errore conteggio:', countError.message);
    return;
  }

  console.log(`\n📈 TOTALE EVENTI: ${totalCount || 0}`);

  if (totalCount === 0) {
    console.log('\n⚠️  Nessun dato ancora raccolto.');
    console.log('   Visita una landing page per generare eventi:');
    console.log('   - https://www.vitaeology.com/challenge/leadership');
    console.log('   - https://www.vitaeology.com/challenge/ostacoli');
    console.log('   - https://www.vitaeology.com/challenge/microfelicita');
    return;
  }

  // 2. Eventi per challenge
  console.log('\n📊 EVENTI PER CHALLENGE:');
  console.log('-'.repeat(40));

  const { data: byChallenge, error: challengeError } = await supabase
    .from('behavioral_events')
    .select('challenge_type');

  if (!challengeError && byChallenge) {
    const challengeCounts = byChallenge.reduce((acc, e) => {
      acc[e.challenge_type] = (acc[e.challenge_type] || 0) + 1;
      return acc;
    }, {});

    Object.entries(challengeCounts).forEach(([challenge, count]) => {
      console.log(`   ${challenge}: ${count} eventi`);
    });
  }

  // 3. Sessioni uniche
  const { data: sessions, error: sessionsError } = await supabase
    .from('behavioral_events')
    .select('session_id');

  if (!sessionsError && sessions) {
    const uniqueSessions = new Set(sessions.map(s => s.session_id)).size;
    console.log(`\n👥 SESSIONI UNICHE: ${uniqueSessions}`);
  }

  // 4. Tipi di evento
  console.log('\n🎯 TIPI DI EVENTO:');
  console.log('-'.repeat(40));

  const { data: eventTypes, error: eventError } = await supabase
    .from('behavioral_events')
    .select('event_type');

  if (!eventError && eventTypes) {
    const typeCounts = eventTypes.reduce((acc, e) => {
      acc[e.event_type] = (acc[e.event_type] || 0) + 1;
      return acc;
    }, {});

    Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`);
      });
  }

  // 5. Device breakdown
  console.log('\n📱 DISPOSITIVI:');
  console.log('-'.repeat(40));

  const { data: devices, error: deviceError } = await supabase
    .from('behavioral_events')
    .select('device_type, session_id');

  if (!deviceError && devices) {
    const deviceSessions = {};
    devices.forEach(d => {
      const device = d.device_type || 'unknown';
      if (!deviceSessions[device]) deviceSessions[device] = new Set();
      deviceSessions[device].add(d.session_id);
    });

    Object.entries(deviceSessions).forEach(([device, sessions]) => {
      console.log(`   ${device}: ${sessions.size} sessioni`);
    });
  }

  // 6. Ultimi 5 eventi
  console.log('\n🕐 ULTIMI 5 EVENTI:');
  console.log('-'.repeat(40));

  const { data: recentEvents, error: recentError } = await supabase
    .from('behavioral_events')
    .select('created_at, challenge_type, event_type, engagement_score')
    .order('created_at', { ascending: false })
    .limit(5);

  if (!recentError && recentEvents) {
    recentEvents.forEach(e => {
      const date = new Date(e.created_at).toLocaleString('it-IT');
      console.log(`   ${date} | ${e.challenge_type} | ${e.event_type} | eng: ${e.engagement_score || '-'}`);
    });
  }

  // 7. Varianti A/B/C
  console.log('\n🔬 VARIANTI A/B TEST:');
  console.log('-'.repeat(40));

  const { data: variants, error: variantError } = await supabase
    .from('behavioral_events')
    .select('challenge_type, variant, session_id')
    .not('variant', 'is', null);

  if (!variantError && variants) {
    const variantData = {};
    variants.forEach(v => {
      const key = `${v.challenge_type} - ${v.variant}`;
      if (!variantData[key]) variantData[key] = new Set();
      variantData[key].add(v.session_id);
    });

    Object.entries(variantData)
      .sort()
      .forEach(([key, sessions]) => {
        console.log(`   ${key}: ${sessions.size} sessioni`);
      });
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Verifica completata');
}

checkBehavioralData().catch(console.error);
