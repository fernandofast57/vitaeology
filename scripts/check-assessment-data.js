// Script per verificare lo stato dell'assessment nel database
// Uso: node scripts/check-assessment-data.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Usa service role per bypassare RLS
);

async function checkAssessmentData() {
  console.log('🔍 Verifica dati assessment...\n');

  // 1. Trova tutti gli assessment recenti
  const { data: assessments, error: assessmentError } = await supabase
    .from('user_assessments')
    .select('id, user_id, status, total_score, started_at, completed_at')
    .order('started_at', { ascending: false })
    .limit(10);

  if (assessmentError) {
    console.error('❌ Errore caricamento assessments:', assessmentError.message);
    return;
  }

  console.log('📋 Ultimi 10 assessments:');
  console.table(assessments);

  // 2. Per ogni assessment, conta le risposte
  for (const assessment of assessments) {
    const { count, error: countError } = await supabase
      .from('user_answers')
      .select('*', { count: 'exact', head: true })
      .eq('assessment_id', assessment.id);

    if (countError) {
      console.error(`❌ Errore conteggio risposte per ${assessment.id}:`, countError.message);
    } else {
      console.log(`\n📊 Assessment ${assessment.id}:`);
      console.log(`   - Status: ${assessment.status}`);
      console.log(`   - Risposte salvate: ${count}/240`);
      console.log(`   - Score: ${assessment.total_score || 'N/A'}`);

      if (count === 240 && assessment.status !== 'completed') {
        console.log('   ⚠️ ATTENZIONE: 240 risposte ma status non completed!');
        console.log('   🔧 Puoi completare manualmente con:');
        console.log(`      UPDATE user_assessments SET status = 'completed', completed_at = NOW() WHERE id = '${assessment.id}';`);
      }
    }
  }

  // 3. Cerca risposte orfane (senza assessment valido)
  const { data: orphanAnswers, error: orphanError } = await supabase
    .from('user_answers')
    .select('assessment_id')
    .limit(1000);

  if (!orphanError && orphanAnswers) {
    const uniqueAssessmentIds = [...new Set(orphanAnswers.map(a => a.assessment_id))];
    console.log(`\n📦 Assessment IDs con risposte: ${uniqueAssessmentIds.length}`);
  }

  console.log('\n✅ Verifica completata');
}

checkAssessmentData().catch(console.error);
