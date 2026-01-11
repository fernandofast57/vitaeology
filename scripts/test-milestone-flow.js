/**
 * Test del flusso milestone con completamento esercizio
 * Usa direttamente Supabase senza TypeScript
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Implementazione locale delle funzioni milestone
async function hasMilestone(userId, milestoneCode, pathType) {
  const { data } = await supabase
    .from('user_milestones')
    .select('id')
    .eq('user_id', userId)
    .eq('milestone_type', milestoneCode)
    .eq('path_type', pathType)
    .single();
  return !!data;
}

async function awardMilestone(userId, milestoneCode, pathType, milestoneData = {}) {
  const exists = await hasMilestone(userId, milestoneCode, pathType);
  if (exists) {
    return { success: true, alreadyExists: true };
  }

  const { data, error } = await supabase
    .from('user_milestones')
    .insert({
      user_id: userId,
      milestone_type: milestoneCode,
      path_type: pathType,
      milestone_data: milestoneData,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { success: true, alreadyExists: true };
    }
    console.error('Errore assegnazione milestone:', error);
    return { success: false };
  }

  // Recupera definizione
  const { data: definition } = await supabase
    .from('milestone_definitions')
    .select('*')
    .eq('code', milestoneCode)
    .single();

  return {
    success: true,
    milestoneId: data.id,
    milestone: {
      milestoneType: data.milestone_type,
      pathType: data.path_type,
      definition: definition ? {
        name: definition.name,
        xpReward: definition.xp_reward,
      } : undefined,
    },
  };
}

async function getUserTotalXP(userId) {
  const { data: userMilestones } = await supabase
    .from('user_milestones')
    .select('milestone_type')
    .eq('user_id', userId);

  if (!userMilestones || userMilestones.length === 0) return 0;

  const milestoneCodes = userMilestones.map(m => m.milestone_type);
  const { data: definitions } = await supabase
    .from('milestone_definitions')
    .select('code, xp_reward')
    .in('code', milestoneCodes);

  return (definitions || []).reduce((total, d) => total + (d.xp_reward || 0), 0);
}

// Mappa threshold -> milestone per ostacoli
const EXERCISE_THRESHOLDS = [1, 5, 10, 24];
const EXERCISE_MILESTONE_MAP = {
  1: 'exercises_1_ostacoli',
  5: 'exercises_5_ostacoli',
  10: 'exercises_10_ostacoli',
  24: 'exercises_24_ostacoli',
};

async function checkExerciseMilestones(userId, bookSlug) {
  const results = [];

  // Mappa book_slug -> path_type
  const bookToPath = {
    'leadership': 'leadership',
    'risolutore': 'ostacoli',
    'microfelicita': 'microfelicita',
  };
  const pathType = bookToPath[bookSlug] || 'global';

  // Mappa threshold -> milestone per path
  const milestoneMapByPath = {
    'leadership': { 1: 'exercises_1_leadership', 5: 'exercises_5_leadership', 10: 'exercises_10_leadership', 24: 'exercises_24_leadership' },
    'ostacoli': { 1: 'exercises_1_ostacoli', 5: 'exercises_5_ostacoli', 10: 'exercises_10_ostacoli', 24: 'exercises_24_ostacoli' },
    'microfelicita': { 1: 'exercises_1_microfelicita', 5: 'exercises_5_microfelicita', 10: 'exercises_10_microfelicita', 24: 'exercises_24_microfelicita' },
  };

  // Conta esercizi completati
  const { data: completed } = await supabase
    .from('user_exercise_progress')
    .select('exercise_id, exercises!inner(book_slug)')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .eq('exercises.book_slug', bookSlug);

  const exerciseCount = completed?.length || 0;
  console.log('   Esercizi completati per', bookSlug + ':', exerciseCount);

  // Verifica soglie
  const milestoneMap = milestoneMapByPath[pathType] || {};
  for (const threshold of EXERCISE_THRESHOLDS) {
    if (exerciseCount >= threshold) {
      const milestoneCode = milestoneMap[threshold];
      if (milestoneCode) {
        const exists = await hasMilestone(userId, milestoneCode, pathType);
        if (!exists) {
          results.push({
            milestoneCode,
            pathType,
            data: { exerciseCount, threshold },
          });
        }
      }
    }
  }

  return results;
}

// Funzione principale per check e award milestones
async function checkAndAwardMilestones(userId, context) {
  const results = [];
  const { action, pathType, bookSlug } = context;

  if (action === 'exercise_complete' && bookSlug) {
    // Check exercise milestones
    const pendingMilestones = await checkExerciseMilestones(userId, bookSlug);

    // Award each pending milestone
    for (const pending of pendingMilestones) {
      const result = await awardMilestone(
        userId,
        pending.milestoneCode,
        pending.pathType,
        pending.data
      );
      results.push(result);
    }
  }

  return results;
}

async function testMilestoneFlow() {
  const userId = 'bd29799d-14b6-465c-91ac-21b386e4aa75';
  const exerciseId = 'a48643ae-b10b-4778-b53f-5a0633353c54'; // risolutore exercise

  console.log('=== TEST FLUSSO MILESTONE ===\n');

  // 1. Verifica milestone PRIMA
  const { data: beforeMilestones } = await supabase
    .from('user_milestones')
    .select('milestone_type, path_type')
    .eq('user_id', userId);

  console.log('1. Milestone PRIMA:', beforeMilestones?.length || 0);
  beforeMilestones?.forEach(m => console.log('   -', m.milestone_type, '(' + m.path_type + ')'));

  // 2. Verifica esercizio
  const { data: exercise } = await supabase
    .from('exercises')
    .select('id, title, book_slug')
    .eq('id', exerciseId)
    .single();

  console.log('\n2. Esercizio da completare:');
  console.log('   -', exercise?.title);
  console.log('   - book_slug:', exercise?.book_slug);

  // 3. Simula completamento esercizio
  console.log('\n3. Simulazione completamento esercizio...');

  // Prima inserisci/aggiorna progress
  const { error: progressError } = await supabase
    .from('user_exercise_progress')
    .upsert({
      user_id: userId,
      exercise_id: exerciseId,
      status: 'completed',
      completed_at: new Date().toISOString(),
      notes: 'Test milestone flow',
    }, { onConflict: 'user_id,exercise_id' });

  if (progressError) {
    console.log('   Errore progress:', progressError.message);
  } else {
    console.log('   Progress salvato!');
  }

  // 4. Chiama checkAndAwardMilestones
  console.log('\n4. Chiamata checkAndAwardMilestones...');

  const results = await checkAndAwardMilestones(userId, {
    action: 'exercise_complete',
    pathType: 'ostacoli',
    bookSlug: 'risolutore',
  });

  console.log('   Milestone processate:', results.length);
  results.forEach(r => {
    if (r.success && r.alreadyExists !== true) {
      console.log('   - NUOVA:', r.milestone?.milestoneType, '(' + r.milestone?.pathType + ')',
                  r.milestone?.definition?.xpReward + ' XP');
    } else if (r.alreadyExists) {
      console.log('   - Già esistente');
    } else {
      console.log('   - Fallita');
    }
  });

  // 5. Verifica milestone DOPO
  const { data: afterMilestones } = await supabase
    .from('user_milestones')
    .select('milestone_type, path_type, achieved_at')
    .eq('user_id', userId)
    .order('achieved_at', { ascending: false });

  console.log('\n5. Milestone DOPO:', afterMilestones?.length || 0);
  afterMilestones?.forEach(m => console.log('   -', m.milestone_type, '(' + m.path_type + ')'));

  // 6. Calcola XP totale
  const totalXP = await getUserTotalXP(userId);
  console.log('\n6. XP Totale utente:', totalXP);

  console.log('\n=== TEST COMPLETATO ===');
}

testMilestoneFlow().catch(e => {
  console.error('Errore:', e.message);
  console.error(e.stack);
});
