/**
 * Fix script per allineare gli slug degli esercizi con le caratteristiche
 *
 * PROBLEMA: Gli esercizi usano slug diversi dalle caratteristiche,
 * impedendo al sistema di raccomandazioni di funzionare.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Mapping degli slug esercizi -> slug caratteristiche validi
const SLUG_MAPPING = {
  // Esercizi con slug che non matchano
  'autenticita': 'autoconsapevolezza',
  'integrita': 'valori',
  'consapevolezza-di-se': 'autoconsapevolezza',
  'presenza': 'autoconsapevolezza',
  'vulnerabilita': 'coraggio',
  'intelligenza-emotiva': 'empatia',
  'motivazione': 'perseveranza',
  'ispirazione': 'visione',
  'decision-making': 'decisionalita',
  'execution': 'disciplina',
  'team-leadership': 'sviluppo-team',
  'leadership-impact': 'responsabilita',

  // Slug già corretti (non modificare)
  // 'resilienza': 'resilienza',
  // 'empatia': 'empatia',
  // 'comunicazione': 'comunicazione',
  // 'pensiero-strategico': 'pensiero-strategico',
  // 'innovazione': 'innovazione',
};

async function fixExerciseSlugs() {
  console.log('=== FIX EXERCISE SLUGS ===\n');

  // 1. Verifica caratteristiche disponibili
  const { data: chars } = await supabase
    .from('characteristics')
    .select('slug')
    .eq('is_active', true);

  const validSlugs = new Set(chars.map(c => c.slug));
  console.log(`Caratteristiche valide: ${validSlugs.size}`);

  // 2. Carica esercizi da aggiornare
  const { data: exercises } = await supabase
    .from('exercises')
    .select('id, title, characteristic_slug')
    .eq('is_active', true);

  console.log(`Esercizi da verificare: ${exercises.length}\n`);

  // 3. Identifica esercizi da aggiornare
  const toUpdate = [];
  const alreadyCorrect = [];
  const noMapping = [];

  exercises.forEach(ex => {
    const currentSlug = ex.characteristic_slug;

    if (validSlugs.has(currentSlug)) {
      // Slug già corretto
      alreadyCorrect.push(ex);
    } else if (SLUG_MAPPING[currentSlug]) {
      // Ha un mapping
      toUpdate.push({
        ...ex,
        newSlug: SLUG_MAPPING[currentSlug]
      });
    } else {
      // Nessun mapping definito
      noMapping.push(ex);
    }
  });

  console.log(`Già corretti: ${alreadyCorrect.length}`);
  console.log(`Da aggiornare: ${toUpdate.length}`);
  console.log(`Senza mapping: ${noMapping.length}\n`);

  // 4. Mostra dettagli
  if (alreadyCorrect.length > 0) {
    console.log('SLUG GIÀ CORRETTI:');
    alreadyCorrect.forEach(ex => {
      console.log(`  ✅ "${ex.title}" -> ${ex.characteristic_slug}`);
    });
  }

  if (toUpdate.length > 0) {
    console.log('\nDA AGGIORNARE:');
    toUpdate.forEach(ex => {
      console.log(`  🔄 "${ex.title}": ${ex.characteristic_slug} -> ${ex.newSlug}`);
    });
  }

  if (noMapping.length > 0) {
    console.log('\n⚠️  SENZA MAPPING (assegnazione manuale richiesta):');
    noMapping.forEach(ex => {
      console.log(`  ❓ "${ex.title}": ${ex.characteristic_slug}`);
    });
  }

  // 5. Esegui aggiornamenti
  if (toUpdate.length > 0) {
    console.log('\n--- ESECUZIONE AGGIORNAMENTI ---\n');

    for (const ex of toUpdate) {
      const { error } = await supabase
        .from('exercises')
        .update({ characteristic_slug: ex.newSlug })
        .eq('id', ex.id);

      if (error) {
        console.log(`❌ Errore per "${ex.title}": ${error.message}`);
      } else {
        console.log(`✅ Aggiornato "${ex.title}": ${ex.characteristic_slug} -> ${ex.newSlug}`);
      }
    }
  }

  // 6. Verifica finale
  console.log('\n--- VERIFICA FINALE ---\n');

  const { data: finalExercises } = await supabase
    .from('exercises')
    .select('characteristic_slug')
    .eq('is_active', true);

  const finalUnmatched = finalExercises.filter(ex => !validSlugs.has(ex.characteristic_slug));

  if (finalUnmatched.length === 0) {
    console.log('✅ TUTTI GLI ESERCIZI ORA HANNO SLUG VALIDI!');
  } else {
    console.log(`⚠️  Ancora ${finalUnmatched.length} esercizi con slug non validi`);
    console.log('Slug mancanti:', [...new Set(finalUnmatched.map(e => e.characteristic_slug))]);
  }

  console.log('\n=== FIX COMPLETATO ===');
}

fixExerciseSlugs().catch(console.error);
