// Script per verificare la tabella characteristics
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCharacteristics() {
  console.log('🔍 Verifica tabella characteristics...\n');

  // 1. Verifica se la tabella esiste e ha dati
  const { data, error, count } = await supabase
    .from('characteristics')
    .select('*', { count: 'exact' });

  if (error) {
    console.error('❌ Errore:', error.message);
    console.log('\n📝 La tabella potrebbe non esistere o avere problemi RLS');
    return;
  }

  console.log(`📊 Caratteristiche trovate: ${count || data?.length || 0}`);

  if (data && data.length > 0) {
    console.log('\n📋 Struttura colonne (primo record):');
    console.log(JSON.stringify(data[0], null, 2));
    console.log('\n📋 Tutte le colonne:', Object.keys(data[0]));
  } else {
    console.log('\n⚠️ TABELLA VUOTA! Devi popolare la tabella characteristics.');
  }

  // 2. Verifica anche assessment_questions per vedere i characteristic_id usati
  const { data: questions, error: qError } = await supabase
    .from('assessment_questions')
    .select('characteristic_id')
    .eq('book_id', 1);

  if (!qError && questions) {
    const uniqueCharIds = [...new Set(questions.map(q => q.characteristic_id))].sort((a,b) => a-b);
    console.log(`\n📊 Characteristic IDs usati nelle domande: ${uniqueCharIds.join(', ')}`);
    console.log(`   Totale IDs unici: ${uniqueCharIds.length}`);
  }
}

checkCharacteristics().catch(console.error);
