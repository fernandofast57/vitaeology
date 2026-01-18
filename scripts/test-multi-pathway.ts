import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMultiPathway() {
  console.log('\n🧪 TEST MULTI-PATHWAY SYSTEM\n');
  console.log('='.repeat(50));

  // Test 1: Verifica tabella pathways
  console.log('\n1️⃣ Test: Tabella pathways');
  const { data: pathways, error: pathwaysError } = await supabase
    .from('pathways')
    .select('*')
    .eq('is_active', true);

  if (pathwaysError) {
    console.log('   ❌ Errore:', pathwaysError.message);
  } else {
    console.log('   ✅ Trovati', pathways.length, 'percorsi attivi:');
    pathways.forEach(p => console.log('      - ' + p.slug + ': ' + p.name));
  }

  // Test 2: Verifica user_pathways
  console.log('\n2️⃣ Test: Tabella user_pathways');
  const { data: userPathways, error: upError } = await supabase
    .from('user_pathways')
    .select(`
      id,
      user_id,
      progress_percentage,
      is_active,
      pathway:pathways(slug, name)
    `)
    .eq('is_active', true);

  if (upError) {
    console.log('   ❌ Errore:', upError.message);
  } else {
    console.log('   ✅ Trovati', userPathways.length, 'user_pathways attivi:');
    userPathways.forEach(up => {
      const pathway = up.pathway as any;
      console.log('      - User ' + up.user_id.substring(0,8) + '... → ' + pathway.slug + ' (' + up.progress_percentage + '%)');
    });
  }

  // Test 3: Simula getUserPathways per un utente
  console.log('\n3️⃣ Test: getUserPathways function');
  if (userPathways && userPathways.length > 0) {
    const testUserId = userPathways[0].user_id;
    const { data: userPaths, error: getUserError } = await supabase
      .from('user_pathways')
      .select(`
        id,
        pathway_id,
        progress_percentage,
        is_active,
        started_at,
        last_assessment_at,
        pathway:pathways(id, slug, name, description, color, icon)
      `)
      .eq('user_id', testUserId)
      .eq('is_active', true)
      .order('started_at', { ascending: true });

    if (getUserError) {
      console.log('   ❌ Errore:', getUserError.message);
    } else {
      console.log('   ✅ Percorsi per utente ' + testUserId.substring(0,8) + '...:');
      userPaths.forEach(p => {
        const pathway = p.pathway as any;
        console.log('      - ' + pathway.name + ' (' + p.progress_percentage + '% completato)');
      });
    }
  }

  // Test 4: Conta percorsi per utente
  console.log('\n4️⃣ Test: Conteggio percorsi per utente');
  if (userPathways && userPathways.length > 0) {
    const testUserId = userPathways[0].user_id;

    const { count: currentCount } = await supabase
      .from('user_pathways')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', testUserId)
      .eq('is_active', true);

    console.log('   ℹ️  Utente ' + testUserId.substring(0,8) + '... ha ' + currentCount + ' percorso/i attivo/i');

    if (currentCount === 1) {
      // Aggiungi secondo percorso (risolutore) per test
      console.log('\n5️⃣ Test: Aggiunta secondo percorso');
      const { data: newPathway, error: addError } = await supabase
        .from('user_pathways')
        .insert({
          user_id: testUserId,
          pathway_id: 2, // risolutore
          is_active: true,
          progress_percentage: 0
        })
        .select()
        .single();

      if (addError) {
        if (addError.code === '23505') {
          console.log('   ℹ️  Percorso già esistente (duplicate key)');
        } else {
          console.log('   ❌ Errore aggiunta percorso:', addError.message);
        }
      } else {
        console.log('   ✅ Aggiunto secondo percorso (risolutore) per test multi-pathway');

        // Verifica
        const { count: newCount } = await supabase
          .from('user_pathways')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', testUserId)
          .eq('is_active', true);

        console.log('   ✅ Utente ora ha ' + newCount + ' percorsi attivi');
      }
    } else {
      console.log('   ℹ️  Utente già ha ' + currentCount + ' percorsi, ottimo per test multi-pathway!');
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ TEST COMPLETATI\n');
  console.log('📍 Verifica manuale nel browser:');
  console.log('   - http://localhost:3000/dashboard');
  console.log('   - http://localhost:3000/dashboard/leadership');
  console.log('   - http://localhost:3000/dashboard/ostacoli');
  console.log('   - http://localhost:3000/profile');
  console.log('   - http://localhost:3000/progress');
  console.log('   - http://localhost:3000/subscription');
  console.log('   - http://localhost:3000/exercises');
  console.log('');
}

testMultiPathway().catch(console.error);
