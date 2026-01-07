#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('=== Verifica month_name ===\n');

  // Stato generale
  const { data: all } = await supabase.from('exercises').select('book_slug, month_name');
  const stats = {};
  all?.forEach(e => {
    const book = e.book_slug;
    if (!stats[book]) stats[book] = { total: 0, withMonth: 0, withoutMonth: 0 };
    stats[book].total++;
    if (e.month_name && e.month_name.trim()) {
      stats[book].withMonth++;
    } else {
      stats[book].withoutMonth++;
    }
  });

  console.log('Stato per libro:');
  console.table(stats);

  // Dettaglio risolutore
  console.log('\n--- RISOLUTORE (24 esercizi) ---');
  const { data: risolutore } = await supabase
    .from('exercises')
    .select('week_number, source_type, title')
    .eq('book_slug', 'risolutore')
    .order('week_number')
    .order('source_type');

  console.log('Distribuzione per week_number e source_type:');
  const risoByWeek = {};
  risolutore?.forEach(e => {
    const key = `week ${e.week_number || 'NULL'} - ${e.source_type}`;
    risoByWeek[key] = (risoByWeek[key] || 0) + 1;
  });
  console.table(risoByWeek);

  // Dettaglio microfelicita
  console.log('\n--- MICROFELICITÀ (24 esercizi) ---');
  const { data: micro } = await supabase
    .from('exercises')
    .select('week_number, source_type, title')
    .eq('book_slug', 'microfelicita')
    .order('week_number')
    .order('source_type');

  const microByWeek = {};
  micro?.forEach(e => {
    const key = `week ${e.week_number || 'NULL'} - ${e.source_type}`;
    microByWeek[key] = (microByWeek[key] || 0) + 1;
  });
  console.table(microByWeek);
}

main().catch(console.error);
