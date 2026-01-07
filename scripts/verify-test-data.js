#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const assessmentId = '82518161-9781-4609-aae4-c9ac207c350a';

  // Verifica punteggi inseriti
  const { data: scores } = await supabase
    .from('characteristic_scores')
    .select('score_percentage, characteristic_id')
    .eq('assessment_id', assessmentId);

  console.log('Punteggi trovati:', scores?.length || 0);

  // Carica caratteristiche separatamente
  const { data: chars } = await supabase
    .from('characteristics')
    .select('id, pillar');

  const charMap = {};
  chars.forEach(c => { charMap[c.id] = c.pillar; });

  const pillarAvg = {};
  scores?.forEach(s => {
    const pillar = charMap[s.characteristic_id];
    if (pillar) {
      if (!pillarAvg[pillar]) pillarAvg[pillar] = { sum: 0, count: 0 };
      pillarAvg[pillar].sum += s.score_percentage;
      pillarAvg[pillar].count++;
    }
  });

  console.log('\nMedia per pillar:');
  const pillarNames = {
    Vision: 'ESSERE',
    Relations: 'SENTIRE',
    Adaptation: 'PENSARE',
    Action: 'AGIRE'
  };

  Object.entries(pillarAvg).forEach(([p, v]) => {
    console.log(`  ${pillarNames[p]} (${p}): ${(v.sum / v.count).toFixed(0)}%`);
  });

  console.log('\n✅ Dati test pronti per API /api/exercises/recommended');
}

main().catch(console.error);
