require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('Verifica tabella user_assessments_v2...\n');

  // Check user_assessments_v2
  const { count, error } = await supabase
    .from('user_assessments_v2')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.log('❌ user_assessments_v2:', error.message);
  } else {
    console.log('✅ user_assessments_v2 esiste:', count, 'righe');
  }

  // Check risolutore_answers structure
  const { data: answersSample, error: ansErr } = await supabase
    .from('risolutore_answers')
    .select('*')
    .limit(1);

  if (ansErr) {
    console.log('❌ risolutore_answers:', ansErr.message);
  } else {
    console.log('✅ risolutore_answers esiste');
    if (answersSample && answersSample.length > 0) {
      console.log('   Colonne:', Object.keys(answersSample[0]).join(', '));
    }
  }

  // Check microfelicita_answers structure
  const { data: microAns, error: microErr } = await supabase
    .from('microfelicita_answers')
    .select('*')
    .limit(1);

  if (microErr) {
    console.log('❌ microfelicita_answers:', microErr.message);
  } else {
    console.log('✅ microfelicita_answers esiste');
    if (microAns && microAns.length > 0) {
      console.log('   Colonne:', Object.keys(microAns[0]).join(', '));
    }
  }
}

main().catch(console.error);
