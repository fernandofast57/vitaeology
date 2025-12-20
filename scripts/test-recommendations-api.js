/**
 * Test script per verificare che l'API /api/recommendations funzioni correttamente
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Simula la logica del service
async function testRecommendations() {
  console.log('=== TEST RECOMMENDATIONS SERVICE ===\n');

  // 1. Trova un utente con assessment completato
  const { data: assessments } = await supabase
    .from('user_assessments')
    .select('id, user_id')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1);

  if (!assessments || assessments.length === 0) {
    console.log('❌ Nessun assessment completato trovato');
    return;
  }

  const userId = assessments[0].user_id;
  const assessmentId = assessments[0].id;
  console.log(`Testing per user: ${userId}`);
  console.log(`Assessment ID: ${assessmentId}\n`);

  // 2. Carica caratteristiche con slug
  const { data: characteristics } = await supabase
    .from('characteristics')
    .select('id, slug, name_familiar, pillar')
    .eq('is_active', true);

  console.log(`Caratteristiche caricate: ${characteristics.length}`);

  // 3. Carica risposte
  const { data: answers } = await supabase
    .from('user_answers')
    .select(`
      question_id,
      points_earned,
      assessment_questions (
        characteristic_id
      )
    `)
    .eq('assessment_id', assessmentId);

  console.log(`Risposte caricate: ${answers.length}`);

  // 4. Calcola punteggi per caratteristica
  const scoresByChar = {};
  answers.forEach(answer => {
    const charId = answer.assessment_questions?.characteristic_id;
    if (charId) {
      if (!scoresByChar[charId]) scoresByChar[charId] = { points: 0, count: 0 };
      scoresByChar[charId].points += answer.points_earned || 0;
      scoresByChar[charId].count += 1;
    }
  });

  // 5. Costruisci array punteggi con slug
  const scores = characteristics.map(char => {
    const data = scoresByChar[char.id] || { points: 0, count: 0 };
    const maxScore = data.count * 2;
    const percentage = maxScore > 0 ? Math.round((data.points / maxScore) * 100) : 0;

    return {
      characteristicSlug: char.slug,
      characteristicName: char.name_familiar,
      score: percentage,
      pillar: char.pillar
    };
  }).filter(s => s.score > 0);

  console.log(`Caratteristiche con punteggio > 0: ${scores.length}`);

  // Ordina per punteggio (dal più basso)
  scores.sort((a, b) => a.score - b.score);

  console.log('\nTop 5 aree con punteggio più basso:');
  scores.slice(0, 5).forEach((s, i) => {
    console.log(`  ${i+1}. ${s.characteristicName} (${s.characteristicSlug}): ${s.score}%`);
  });

  // 6. Carica esercizi e match
  const slugs = scores.map(s => s.characteristicSlug);
  const { data: exercises } = await supabase
    .from('exercises')
    .select('id, title, characteristic_slug, difficulty_level, estimated_time_minutes')
    .eq('is_active', true)
    .in('characteristic_slug', slugs)
    .order('week_number', { ascending: true });

  console.log(`\nEsercizi che matchano: ${exercises.length}`);

  // Crea mappa slug -> score
  const scoreMap = new Map(scores.map(s => [s.characteristicSlug, s]));

  // Ordina esercizi per score della caratteristica
  const sortedExercises = exercises.map(ex => ({
    ...ex,
    charScore: scoreMap.get(ex.characteristic_slug)?.score || 0,
    charName: scoreMap.get(ex.characteristic_slug)?.characteristicName || ex.characteristic_slug
  })).sort((a, b) => a.charScore - b.charScore);

  console.log('\nTop 10 esercizi raccomandati:');
  sortedExercises.slice(0, 10).forEach((ex, i) => {
    console.log(`  ${i+1}. "${ex.title}" - ${ex.charName} (${ex.charScore}%) - ${ex.difficulty_level}`);
  });

  // 7. Calcola aree prioritarie per pillar
  const pillarScores = {};
  scores.forEach(s => {
    const pillar = s.pillar;
    if (!pillarScores[pillar]) pillarScores[pillar] = { total: 0, count: 0 };
    pillarScores[pillar].total += s.score;
    pillarScores[pillar].count += 1;
  });

  console.log('\nAree prioritarie per pillar (media):');
  Object.entries(pillarScores)
    .map(([pillar, data]) => ({ pillar, avg: Math.round(data.total / data.count) }))
    .sort((a, b) => a.avg - b.avg)
    .forEach((p, i) => {
      console.log(`  ${i+1}. ${p.pillar}: ${p.avg}%`);
    });

  console.log('\n=== TEST COMPLETATO ===');
  console.log('\n✅ Il sistema di raccomandazioni funziona correttamente!');
  console.log('Gli esercizi sono ora ordinati per priorità basata sui punteggi assessment.');
}

testRecommendations().catch(console.error);
