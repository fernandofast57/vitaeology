#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('=== Verifico struttura tabelle ===\n');

  // Books
  console.log('📚 BOOKS:');
  const { data: books } = await supabase.from('books').select('id, slug, title').limit(5);
  console.table(books);

  // Characteristics (verifica colonne)
  console.log('\n🎯 CHARACTERISTICS:');
  const { data: chars } = await supabase.from('characteristics').select('*').limit(3);
  if (chars && chars.length > 0) {
    console.log('Colonne:', Object.keys(chars[0]));
    console.table(chars);
  }

  // User Assessments
  console.log('\n📊 USER_ASSESSMENTS:');
  const { data: ua } = await supabase.from('user_assessments').select('*').limit(3);
  if (ua && ua.length > 0) {
    console.log('Colonne:', Object.keys(ua[0]));
    console.table(ua);
  } else {
    console.log('Nessun assessment trovato');
  }

  // User Assessments V2
  console.log('\n📊 USER_ASSESSMENTS_V2:');
  const { data: uav2 } = await supabase.from('user_assessments_v2').select('*').limit(3);
  if (uav2 && uav2.length > 0) {
    console.log('Colonne:', Object.keys(uav2[0]));
    console.table(uav2);
  } else {
    console.log('Nessun assessment v2 trovato');
  }

  // Characteristic Scores
  console.log('\n📈 CHARACTERISTIC_SCORES:');
  const { data: cs } = await supabase.from('characteristic_scores').select('*').limit(3);
  if (cs && cs.length > 0) {
    console.log('Colonne:', Object.keys(cs[0]));
    console.table(cs);
  } else {
    console.log('Nessun punteggio trovato');
  }
}

main().catch(console.error);
