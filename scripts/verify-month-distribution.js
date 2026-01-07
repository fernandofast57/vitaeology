#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('=== Distribuzione month_name ===\n');

  for (const book of ['risolutore', 'microfelicita']) {
    console.log(`\n--- ${book.toUpperCase()} ---`);
    const { data } = await supabase
      .from('exercises')
      .select('month_name, week_number')
      .eq('book_slug', book)
      .order('week_number');

    const byMonth = {};
    data?.forEach(e => {
      const m = e.month_name;
      if (!byMonth[m]) byMonth[m] = [];
      byMonth[m].push(e.week_number);
    });

    Object.entries(byMonth).forEach(([month, weeks]) => {
      console.log(`  ${month}: week ${weeks[0]}-${weeks[weeks.length - 1]} (${weeks.length} esercizi)`);
    });
  }
}

main().catch(console.error);
