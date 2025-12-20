// Script per verificare la tabella assessment_results
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAssessmentResults() {
  console.log('🔍 Verifica tabella assessment_results...\n');

  // 1. Verifica se la tabella esiste
  const { data, error } = await supabase
    .from('assessment_results')
    .select('*')
    .limit(5);

  if (error) {
    console.error('❌ Errore:', error.message);

    // Prova a creare la tabella se non esiste
    console.log('\n📝 La tabella potrebbe non esistere. Ecco lo SQL per crearla:');
    console.log(`
CREATE TABLE IF NOT EXISTS assessment_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID REFERENCES user_assessments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pillar_scores JSONB,
  characteristic_scores JSONB,
  total_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own results" ON assessment_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own results" ON assessment_results FOR INSERT WITH CHECK (auth.uid() = user_id);
    `);
    return;
  }

  console.log(`📊 Record trovati: ${data?.length || 0}`);

  if (data && data.length > 0) {
    console.log('\n📋 Struttura (primo record):');
    console.log(JSON.stringify(data[0], null, 2));
  } else {
    console.log('\n⚠️ Tabella vuota - i risultati non vengono salvati qui!');
  }

  // 2. Verifica se ci sono assessment completati senza risultati
  const { data: completedAssessments } = await supabase
    .from('user_assessments')
    .select('id, user_id, total_score')
    .eq('status', 'completed');

  if (completedAssessments && completedAssessments.length > 0) {
    console.log(`\n📊 Assessment completati: ${completedAssessments.length}`);

    for (const assessment of completedAssessments) {
      const { data: result } = await supabase
        .from('assessment_results')
        .select('id')
        .eq('assessment_id', assessment.id)
        .single();

      if (!result) {
        console.log(`   ⚠️ Assessment ${assessment.id} non ha risultati salvati in assessment_results!`);
      }
    }
  }
}

checkAssessmentResults().catch(console.error);
