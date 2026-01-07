#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('=== Setup dati test per raccomandazione esercizi ===\n');

  // 1. Trova un utente esistente
  console.log('1. Cerco utenti esistenti...');
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .limit(5);

  if (!profiles || profiles.length === 0) {
    console.log('❌ Nessun utente trovato nel database');
    return;
  }

  console.table(profiles);
  const testUserId = profiles[0].id;
  console.log(`\n→ Userò l'utente: ${testUserId}\n`);

  // 2. Trova book_id per leadership
  console.log('2. Trovo book_id per leadership...');
  const { data: book } = await supabase
    .from('books')
    .select('id, slug')
    .eq('slug', 'leadership-autentica')
    .single();

  if (!book) {
    console.log('❌ Libro leadership-autentica non trovato');
    return;
  }
  console.log(`   → Book: ${book.slug} (id: ${book.id})`);

  // 3. Crea assessment completato (usa user_assessments, non v2)
  console.log('\n3. Creo assessment completato...');
  const { data: existingAssessment } = await supabase
    .from('user_assessments')
    .select('id')
    .eq('user_id', testUserId)
    .eq('book_id', book.id)
    .eq('status', 'completed')
    .single();

  let assessmentId;
  if (existingAssessment) {
    console.log(`   → Assessment già esistente: ${existingAssessment.id}`);
    assessmentId = existingAssessment.id;
  } else {
    const { data: newAssessment, error } = await supabase
      .from('user_assessments')
      .insert({
        user_id: testUserId,
        book_id: book.id,
        status: 'completed',
        started_at: new Date(Date.now() - 3600000).toISOString(),
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Errore creazione assessment:', error);
      return;
    }
    console.log(`   → Nuovo assessment creato: ${newAssessment.id}`);
    assessmentId = newAssessment.id;
  }

  // 4. Carica caratteristiche e mappa pillar
  console.log('\n4. Carico caratteristiche...');
  const { data: chars } = await supabase
    .from('characteristics')
    .select('id, slug, pillar')
    .order('id');

  console.log(`   → ${chars.length} caratteristiche trovate`);

  // Mappa pillar DB → pillar API (Vision → ESSERE, etc.)
  const pillarMap = {
    'Vision': 'ESSERE',
    'Relations': 'SENTIRE',
    'Adaptation': 'PENSARE',
    'Action': 'AGIRE'
  };

  // Score percentage (0-100) per testare priorità
  const pillarTargetScores = {
    'Vision': 30,       // ESSERE - basso (priorità alta)
    'Relations': 50,    // SENTIRE - medio
    'Adaptation': 70,   // PENSARE - medio-alto
    'Action': 85        // AGIRE - alto (priorità bassa)
  };

  // 5. Crea punteggi test
  console.log('\n5. Creo punteggi caratteristiche test...');

  const maxPoints = 15; // 3 domande × 5 punti max
  const scoresToInsert = chars.map(char => {
    const scorePercentage = pillarTargetScores[char.pillar] || 50;
    const totalPoints = Math.round((scorePercentage / 100) * maxPoints);
    return {
      assessment_id: assessmentId,
      characteristic_id: char.id,
      total_points: totalPoints,
      max_points: maxPoints,
      score_percentage: scorePercentage
    };
  });

  // Prima elimina punteggi esistenti
  await supabase
    .from('characteristic_scores')
    .delete()
    .eq('assessment_id', assessmentId);

  const { error: insertError } = await supabase
    .from('characteristic_scores')
    .insert(scoresToInsert);

  if (insertError) {
    console.error('Errore inserimento punteggi:', insertError);
    return;
  }

  console.log(`   → ${scoresToInsert.length} punteggi inseriti`);

  // 6. Verifica finale
  console.log('\n6. Verifica punteggi per pillar...');
  const { data: verifyScores } = await supabase
    .from('characteristic_scores')
    .select(`
      score_percentage,
      characteristics (pillar)
    `)
    .eq('assessment_id', assessmentId);

  const pillarAverages = {};
  verifyScores.forEach(s => {
    const pillar = s.characteristics?.pillar;
    if (pillar) {
      if (!pillarAverages[pillar]) pillarAverages[pillar] = [];
      pillarAverages[pillar].push(s.score_percentage);
    }
  });

  console.log('\n   Punteggi medi per pillar:');
  Object.entries(pillarAverages).forEach(([pillar, scores]) => {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    console.log(`   ${pillar} (${pillarMap[pillar]}): ${avg.toFixed(0)}%`);
  });

  console.log('\n✅ Setup completato!');
  console.log(`   User ID: ${testUserId}`);
  console.log(`   Assessment ID: ${assessmentId}`);
  console.log('\n   Ora puoi testare /api/exercises/recommended');
  console.log('   Aspettati: priorità alta per ESSERE (Vision) = 30%');
}

main().catch(console.error);
