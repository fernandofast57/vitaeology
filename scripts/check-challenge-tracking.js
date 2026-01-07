#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('=== VERIFICA TRACKING CHALLENGE PER TEST 100 CLICK ===\n');

  // 1. Iscritti per challenge
  console.log('📊 ISCRITTI PER CHALLENGE:');
  const { data: subs } = await supabase
    .from('challenge_subscribers')
    .select('challenge, variant, status');

  const byChallengeVariant = {};
  subs?.forEach(s => {
    const key = `${s.challenge}`;
    if (!byChallengeVariant[key]) byChallengeVariant[key] = { A: 0, B: 0, C: 0, total: 0 };
    byChallengeVariant[key][s.variant || 'A']++;
    byChallengeVariant[key].total++;
  });
  console.table(byChallengeVariant);

  // 2. Eventi A/B test
  console.log('\n📈 EVENTI A/B TEST:');
  const { data: abEvents, error: abError } = await supabase
    .from('ab_test_events')
    .select('challenge, variant, event_type, created_at')
    .order('created_at', { ascending: false })
    .limit(20);

  if (abError) {
    console.log('Tabella ab_test_events non esiste o errore:', abError.message);
  } else if (abEvents && abEvents.length > 0) {
    console.log(`Ultimi ${abEvents.length} eventi:`);
    console.table(abEvents.map(e => ({
      challenge: e.challenge,
      variant: e.variant,
      event: e.event_type,
      date: new Date(e.created_at).toLocaleString('it-IT')
    })));
  } else {
    console.log('Nessun evento A/B registrato');
  }

  // 3. Riepilogo per il test
  console.log('\n🎯 RIEPILOGO PER TEST 100 CLICK:');
  const challenges = ['leadership-autentica', 'oltre-ostacoli', 'microfelicita'];

  for (const ch of challenges) {
    const stats = byChallengeVariant[ch] || { A: 0, B: 0, C: 0, total: 0 };
    console.log(`\n${ch}:`);
    console.log(`  Totale: ${stats.total}`);
    console.log(`  Variante A: ${stats.A} (${stats.total > 0 ? Math.round(stats.A/stats.total*100) : 0}%)`);
    console.log(`  Variante B: ${stats.B} (${stats.total > 0 ? Math.round(stats.B/stats.total*100) : 0}%)`);
    console.log(`  Variante C: ${stats.C} (${stats.total > 0 ? Math.round(stats.C/stats.total*100) : 0}%)`);
  }

  // 4. URL per il test
  console.log('\n\n🔗 URL PER IL TEST 100 CLICK:\n');
  console.log('LEADERSHIP:');
  console.log('  https://www.vitaeology.com/challenge/leadership');
  console.log('  https://www.vitaeology.com/challenge/leadership?v=A');
  console.log('  https://www.vitaeology.com/challenge/leadership?v=B');
  console.log('  https://www.vitaeology.com/challenge/leadership?v=C');

  console.log('\nOSTACOLI:');
  console.log('  https://www.vitaeology.com/challenge/ostacoli');
  console.log('  https://www.vitaeology.com/challenge/ostacoli?v=A');
  console.log('  https://www.vitaeology.com/challenge/ostacoli?v=B');
  console.log('  https://www.vitaeology.com/challenge/ostacoli?v=C');

  console.log('\nMICROFELICITÀ:');
  console.log('  https://www.vitaeology.com/challenge/microfelicita');
  console.log('  https://www.vitaeology.com/challenge/microfelicita?v=A');
  console.log('  https://www.vitaeology.com/challenge/microfelicita?v=B');
  console.log('  https://www.vitaeology.com/challenge/microfelicita?v=C');

  console.log('\n\n💡 NOTA: Senza ?v= la variante è assegnata random');
}

main().catch(console.error);
