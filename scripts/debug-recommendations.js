/**
 * Debug script per verificare il sistema di raccomandazioni esercizi
 * Controlla:
 * 1. Se ci sono esercizi nel database
 * 2. Se gli slug corrispondono tra exercises e characteristics
 * 3. Se l'utente ha un assessment completato
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debug() {
  console.log('=== DEBUG SISTEMA RACCOMANDAZIONI ===\n');

  // 1. Verifica esercizi
  console.log('1. ESERCIZI NEL DATABASE:');
  const { data: exercises, error: exError } = await supabase
    .from('exercises')
    .select('id, title, characteristic_slug, is_active')
    .eq('is_active', true)
    .limit(10);

  if (exError) {
    console.log('   ERRORE:', exError.message);
  } else if (!exercises || exercises.length === 0) {
    console.log('   ❌ NESSUN ESERCIZIO ATTIVO TROVATO!');
  } else {
    console.log(`   ✅ ${exercises.length} esercizi attivi trovati`);
    console.log('   Esempio slug usati:');
    const uniqueSlugs = [...new Set(exercises.map(e => e.characteristic_slug))];
    uniqueSlugs.slice(0, 5).forEach(s => console.log(`      - "${s}"`));
  }

  // 2. Verifica caratteristiche
  console.log('\n2. CARATTERISTICHE NEL DATABASE:');
  const { data: chars, error: charError } = await supabase
    .from('characteristics')
    .select('id, slug, name_familiar, pillar, is_active')
    .eq('is_active', true)
    .limit(10);

  if (charError) {
    console.log('   ERRORE:', charError.message);
  } else if (!chars || chars.length === 0) {
    console.log('   ❌ NESSUNA CARATTERISTICA ATTIVA TROVATA!');
  } else {
    console.log(`   ✅ ${chars.length} caratteristiche attive trovate`);
    console.log('   Esempio slug usati:');
    chars.slice(0, 5).forEach(c => console.log(`      - "${c.slug}" (${c.name_familiar})`));
  }

  // 3. Verifica match tra slug
  console.log('\n3. MATCH TRA SLUG ESERCIZI E CARATTERISTICHE:');
  const { data: allExercises } = await supabase
    .from('exercises')
    .select('characteristic_slug')
    .eq('is_active', true);

  const { data: allChars } = await supabase
    .from('characteristics')
    .select('slug')
    .eq('is_active', true);

  if (allExercises && allChars) {
    const exerciseSlugs = new Set(allExercises.map(e => e.characteristic_slug));
    const charSlugs = new Set(allChars.map(c => c.slug));

    // Esercizi senza match
    const unmatchedExercises = [...exerciseSlugs].filter(s => !charSlugs.has(s));
    const matchedCount = [...exerciseSlugs].filter(s => charSlugs.has(s)).length;

    console.log(`   Esercizi con slug che matchano: ${matchedCount}/${exerciseSlugs.size}`);

    if (unmatchedExercises.length > 0) {
      console.log('   ❌ Slug esercizi SENZA match in characteristics:');
      unmatchedExercises.forEach(s => console.log(`      - "${s}"`));
    } else {
      console.log('   ✅ Tutti gli slug corrispondono!');
    }

    // Mostra alcuni esempi di slug caratteristiche
    console.log('\n   Slug disponibili in characteristics:');
    [...charSlugs].slice(0, 10).forEach(s => console.log(`      - "${s}"`));
  }

  // 4. Verifica assessments completati
  console.log('\n4. ASSESSMENTS COMPLETATI:');
  const { data: assessments, error: assError } = await supabase
    .from('user_assessments')
    .select('id, user_id, status, completed_at')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(5);

  if (assError) {
    console.log('   ERRORE:', assError.message);
  } else if (!assessments || assessments.length === 0) {
    console.log('   ❌ NESSUN ASSESSMENT COMPLETATO!');
  } else {
    console.log(`   ✅ ${assessments.length} assessment completati`);
    assessments.forEach(a => {
      console.log(`      - User: ${a.user_id.substring(0, 8)}... Status: ${a.status}`);
    });

    // Verifica risposte per primo assessment
    const firstAssessment = assessments[0];
    const { data: answers, count } = await supabase
      .from('user_answers')
      .select('*', { count: 'exact', head: true })
      .eq('assessment_id', firstAssessment.id);

    console.log(`   Risposte per assessment ${firstAssessment.id.substring(0, 8)}...: ${count || 0}`);
  }

  // 5. Test generazione raccomandazioni
  console.log('\n5. TEST GENERAZIONE RACCOMANDAZIONI:');
  if (assessments && assessments.length > 0) {
    const testUserId = assessments[0].user_id;
    console.log(`   Testing per user: ${testUserId.substring(0, 8)}...`);

    // Simula la logica del service
    const { data: assessment } = await supabase
      .from('user_assessments')
      .select('id')
      .eq('user_id', testUserId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    if (assessment) {
      console.log(`   Assessment trovato: ${assessment.id.substring(0, 8)}...`);

      // Carica risposte
      const { data: answers } = await supabase
        .from('user_answers')
        .select(`
          question_id,
          points_earned,
          assessment_questions (
            characteristic_id
          )
        `)
        .eq('assessment_id', assessment.id);

      console.log(`   Risposte caricate: ${answers?.length || 0}`);

      if (answers && answers.length > 0) {
        // Calcola punteggi per caratteristica
        const scoresByChar = {};
        let answersWithCharId = 0;
        answers.forEach(answer => {
          const charId = answer.assessment_questions?.characteristic_id;
          if (charId) {
            answersWithCharId++;
            if (!scoresByChar[charId]) scoresByChar[charId] = { points: 0, count: 0 };
            scoresByChar[charId].points += answer.points_earned || 0;
            scoresByChar[charId].count += 1;
          }
        });

        console.log(`   Risposte con characteristic_id: ${answersWithCharId}`);
        console.log(`   Caratteristiche con punteggi: ${Object.keys(scoresByChar).length}`);

        // Carica caratteristiche e match con esercizi
        const { data: charsWithSlug } = await supabase
          .from('characteristics')
          .select('id, slug')
          .eq('is_active', true);

        const charIdToSlug = {};
        charsWithSlug?.forEach(c => { charIdToSlug[c.id] = c.slug; });

        // Verifica match
        let matchCount = 0;
        const scoredSlugs = [];
        Object.keys(scoresByChar).forEach(charId => {
          const slug = charIdToSlug[charId];
          if (slug) {
            scoredSlugs.push(slug);
          }
        });

        console.log(`   Slug caratteristiche con punteggi: ${scoredSlugs.length}`);
        console.log('   Primi 5:', scoredSlugs.slice(0, 5));

        // Verifica quanti esercizi matchano
        const { data: matchingEx } = await supabase
          .from('exercises')
          .select('id, characteristic_slug')
          .eq('is_active', true)
          .in('characteristic_slug', scoredSlugs);

        console.log(`\n   ✅ ESERCIZI CHE MATCHANO: ${matchingEx?.length || 0}`);
        if (matchingEx && matchingEx.length > 0) {
          console.log('   Esempio:');
          matchingEx.slice(0, 3).forEach(e => {
            console.log(`      - ${e.characteristic_slug}`);
          });
        }
      }
    }
  }

  console.log('\n=== FINE DEBUG ===');
}

debug().catch(console.error);
