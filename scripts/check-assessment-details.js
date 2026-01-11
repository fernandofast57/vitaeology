/**
 * Verifica dettagliata tabelle Assessment
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║   VERIFICA DETTAGLIATA ASSESSMENT                              ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // 1. BOOKS TABLE
  console.log('═══════════════════════════════════════════════════');
  console.log('📚 TABELLA BOOKS');
  console.log('═══════════════════════════════════════════════════');

  const { data: books, error: booksErr } = await supabase
    .from('books')
    .select('*');

  if (booksErr) {
    console.log('❌ Errore:', booksErr.message);
  } else {
    console.log(`Totale libri: ${books?.length || 0}`);
    if (books && books.length > 0) {
      console.log('\nLibri presenti:');
      books.forEach(b => {
        console.log(`  - slug: "${b.slug}"`);
        console.log(`    titolo: ${b.title || b.titolo || 'N/A'}`);
        console.log(`    colonne: ${Object.keys(b).join(', ')}`);
        console.log('');
      });
    }

    // Verifica libri mancanti
    const expectedSlugs = ['leadership', 'risolutore', 'microfelicita'];
    const presentSlugs = books?.map(b => b.slug) || [];
    const missingSlugs = expectedSlugs.filter(s => !presentSlugs.includes(s));

    if (missingSlugs.length > 0) {
      console.log('⚠️ LIBRI MANCANTI:');
      missingSlugs.forEach(s => console.log(`   - ${s}`));
    }
  }

  // 2. RISOLUTORE QUESTIONS BY DIMENSION
  console.log('\n═══════════════════════════════════════════════════');
  console.log('🔧 RISOLUTORE - DOMANDE PER DIMENSIONE');
  console.log('═══════════════════════════════════════════════════');

  const { data: risolDims } = await supabase
    .from('risolutore_dimensions')
    .select('code, name, category')
    .order('sort_order');

  for (const dim of risolDims || []) {
    const { count } = await supabase
      .from('risolutore_questions')
      .select('*', { count: 'exact', head: true })
      .eq('dimension_code', dim.code);

    console.log(`  ${dim.code} (${dim.category}): ${count} domande - ${dim.name}`);
  }

  const { count: risolTotal } = await supabase
    .from('risolutore_questions')
    .select('*', { count: 'exact', head: true });
  console.log(`\n  TOTALE: ${risolTotal} domande`);

  // 3. MICROFELICITA QUESTIONS BY DIMENSION
  console.log('\n═══════════════════════════════════════════════════');
  console.log('🌟 MICROFELICITA - DOMANDE PER DIMENSIONE');
  console.log('═══════════════════════════════════════════════════');

  const { data: microDims } = await supabase
    .from('microfelicita_dimensions')
    .select('code, name, category')
    .order('sort_order');

  let microByCategory = {};
  for (const dim of microDims || []) {
    const { count } = await supabase
      .from('microfelicita_questions')
      .select('*', { count: 'exact', head: true })
      .eq('dimension_code', dim.code);

    console.log(`  ${dim.code} (${dim.category}): ${count} domande - ${dim.name}`);

    if (!microByCategory[dim.category]) microByCategory[dim.category] = 0;
    microByCategory[dim.category] += count || 0;
  }

  const { count: microTotal } = await supabase
    .from('microfelicita_questions')
    .select('*', { count: 'exact', head: true });
  console.log(`\n  TOTALE: ${microTotal} domande`);
  console.log('\n  Per categoria:');
  for (const [cat, cnt] of Object.entries(microByCategory)) {
    console.log(`    - ${cat}: ${cnt}`);
  }

  // Check expected vs actual
  const expectedMicro = 47; // 20 radar + 15 sabotatori + 12 livelli
  if (microTotal !== expectedMicro) {
    console.log(`\n  ⚠️ Attese ${expectedMicro} domande, trovate ${microTotal}`);
  }

  // 4. ASSESSMENT LITE
  console.log('\n═══════════════════════════════════════════════════');
  console.log('📊 ASSESSMENT LITE - DOMANDE PER TIPO');
  console.log('═══════════════════════════════════════════════════');

  const { data: assessTypes } = await supabase
    .from('assessment_questions')
    .select('assessment_type');

  const typeCounts = {};
  for (const q of assessTypes || []) {
    const t = q.assessment_type || 'unknown';
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  }

  for (const [type, cnt] of Object.entries(typeCounts)) {
    console.log(`  ${type}: ${cnt} domande`);
  }

  // 5. STRUTTURA TABELLE RESULTS
  console.log('\n═══════════════════════════════════════════════════');
  console.log('📋 STRUTTURA TABELLE RESULTS');
  console.log('═══════════════════════════════════════════════════');

  // Check risolutore_results columns
  const { data: risolResultsSample } = await supabase
    .from('risolutore_results')
    .select('*')
    .limit(1);

  if (risolResultsSample && risolResultsSample.length > 0) {
    console.log('\nrisolutore_results colonne:');
    console.log('  ' + Object.keys(risolResultsSample[0]).join(', '));
  } else {
    // Try to get table structure by checking error message
    const { error: structErr } = await supabase
      .from('risolutore_results')
      .select('id')
      .limit(0);
    console.log('\nrisolutore_results: tabella vuota ma esiste');
  }

  // Check microfelicita_results columns
  const { data: microResultsSample } = await supabase
    .from('microfelicita_results')
    .select('*')
    .limit(1);

  if (microResultsSample && microResultsSample.length > 0) {
    console.log('\nmicrofelicita_results colonne:');
    console.log('  ' + Object.keys(microResultsSample[0]).join(', '));
  } else {
    console.log('\nmicrofelicita_results: tabella vuota ma esiste');
  }

  console.log('\n✅ Verifica completata.\n');
}

main().catch(console.error);
