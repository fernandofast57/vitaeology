#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  // Verifica month_name per libro
  const { data } = await supabase
    .from('exercises')
    .select('book_slug, month_name, week_number')
    .order('book_slug')
    .order('week_number');

  // Conta per libro e month_name
  const bookMonths = {};
  data?.forEach(e => {
    const key = e.book_slug;
    if (!bookMonths[key]) bookMonths[key] = new Set();
    bookMonths[key].add(e.month_name || 'NULL');
  });

  console.log('Month names per libro:');
  Object.entries(bookMonths).forEach(([book, months]) => {
    const arr = [...months];
    console.log(`  ${book}: ${arr.slice(0, 5).join(', ')}${months.size > 5 ? '...' : ''} (${months.size} mesi)`);
  });

  // Verifica quanti hanno month_name null
  const nullCount = data?.filter(e => !e.month_name).length || 0;
  console.log('\nEsercizi senza month_name:', nullCount);

  // Esempio esercizi
  console.log('\nEsempio per libro:');
  ['leadership', 'risolutore', 'microfelicita'].forEach(book => {
    const ex = data?.find(e => e.book_slug === book);
    console.log(`  ${book}: week=${ex?.week_number}, month="${ex?.month_name}"`);
  });
}

main().catch(console.error);
