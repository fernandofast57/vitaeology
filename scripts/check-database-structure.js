/**
 * Script per verificare la struttura del database Supabase
 * Esegui con: node scripts/check-database-structure.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabaseStructure() {
  console.log('='.repeat(60));
  console.log('VERIFICA STRUTTURA DATABASE SUPABASE - VITAEOLOGY');
  console.log('='.repeat(60));
  console.log(`URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
  console.log(`Data: ${new Date().toISOString()}`);
  console.log('='.repeat(60));

  // 1. Lista tutte le tabelle nello schema public
  console.log('\n📋 TABELLE NELLO SCHEMA PUBLIC:\n');

  const { data: tables, error: tablesError } = await supabase.rpc('exec_sql', {
    query: `
      SELECT table_name,
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `
  });

  if (tablesError) {
    // Fallback: usa query diretta sulle tabelle conosciute
    console.log('Usando metodo alternativo per elencare tabelle...\n');

    // Prova a fare SELECT su tabelle comuni
    const knownTables = [
      'profiles',
      'users',
      'roles',
      'permissions',
      'user_roles',
      'exercises',
      'user_exercises',
      'test_results',
      'ai_coach_conversations',
      'ai_coach_feedback',
      'ai_coach_patterns',
      'ai_coach_metrics_daily',
      'ai_coach_weekly_reports',
      'ai_coach_user_memory',
      'ai_coach_prompt_versions',
      'book_knowledge',
      'subscriptions',
      'stripe_customers'
    ];

    const existingTables = [];

    for (const table of knownTables) {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (!error) {
        existingTables.push(table);
      }
    }

    console.log('Tabelle trovate:');
    existingTables.forEach(t => console.log(`  ✅ ${t}`));
    console.log(`\nTotale: ${existingTables.length} tabelle\n`);

    // 2. Dettaglio struttura tabelle rilevanti per autorizzazioni
    console.log('='.repeat(60));
    console.log('📊 STRUTTURA TABELLE RILEVANTI PER AUTORIZZAZIONI');
    console.log('='.repeat(60));

    // Profiles
    if (existingTables.includes('profiles')) {
      console.log('\n🔹 TABELLA: profiles');
      console.log('-'.repeat(40));
      const { data: profileSample } = await supabase.from('profiles').select('*').limit(1);
      if (profileSample && profileSample.length > 0) {
        const columns = Object.keys(profileSample[0]);
        columns.forEach(col => {
          const value = profileSample[0][col];
          const type = value === null ? 'unknown' : typeof value;
          console.log(`  - ${col}: ${type}`);
        });
      }

      // Conta records
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      console.log(`  📈 Records totali: ${count || 0}`);

      // Verifica campo is_admin
      const { data: adminCheck } = await supabase.from('profiles').select('is_admin').limit(1);
      if (adminCheck && adminCheck.length > 0 && 'is_admin' in adminCheck[0]) {
        console.log('  ✅ Campo is_admin: PRESENTE');
        const { data: admins } = await supabase.from('profiles').select('id, full_name, email').eq('is_admin', true);
        console.log(`  👑 Admin configurati: ${admins?.length || 0}`);
        admins?.forEach(a => console.log(`     - ${a.full_name || a.email || a.id}`));
      } else {
        console.log('  ❌ Campo is_admin: NON PRESENTE');
      }
    }

    // Roles
    if (existingTables.includes('roles')) {
      console.log('\n🔹 TABELLA: roles');
      console.log('-'.repeat(40));
      const { data: rolesSample } = await supabase.from('roles').select('*');
      console.log(`  Records: ${rolesSample?.length || 0}`);
      rolesSample?.forEach(r => console.log(`  - ${r.name || r.role_name}: ${r.description || ''}`));
    } else {
      console.log('\n❌ TABELLA roles: NON ESISTE');
    }

    // User Roles
    if (existingTables.includes('user_roles')) {
      console.log('\n🔹 TABELLA: user_roles');
      console.log('-'.repeat(40));
      const { count } = await supabase.from('user_roles').select('*', { count: 'exact', head: true });
      console.log(`  Records: ${count || 0}`);
    } else {
      console.log('\n❌ TABELLA user_roles: NON ESISTE');
    }

    // Permissions
    if (existingTables.includes('permissions')) {
      console.log('\n🔹 TABELLA: permissions');
      console.log('-'.repeat(40));
      const { data: permsSample } = await supabase.from('permissions').select('*');
      console.log(`  Records: ${permsSample?.length || 0}`);
    } else {
      console.log('\n❌ TABELLA permissions: NON ESISTE');
    }

    // 3. Altre tabelle esistenti
    console.log('\n' + '='.repeat(60));
    console.log('📦 ALTRE TABELLE ESISTENTI');
    console.log('='.repeat(60));

    for (const table of existingTables) {
      if (!['profiles', 'roles', 'user_roles', 'permissions'].includes(table)) {
        const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
        console.log(`\n🔹 ${table}: ${count || 0} records`);
      }
    }

    // 4. Verifica auth.users
    console.log('\n' + '='.repeat(60));
    console.log('👥 UTENTI REGISTRATI (auth.users)');
    console.log('='.repeat(60));

    // Non possiamo accedere direttamente a auth.users, ma possiamo vedere i profiles collegati
    const { data: allProfiles } = await supabase.from('profiles').select('id, full_name, email, created_at, is_admin');
    console.log(`\nUtenti con profilo: ${allProfiles?.length || 0}`);
    allProfiles?.forEach(p => {
      const admin = p.is_admin ? ' 👑' : '';
      console.log(`  - ${p.full_name || 'N/A'} (${p.email || p.id})${admin}`);
    });

    // 5. Riepilogo per sistema Ruoli
    console.log('\n' + '='.repeat(60));
    console.log('📝 RIEPILOGO PER SISTEMA RUOLI E AUTORIZZAZIONI');
    console.log('='.repeat(60));

    console.log('\nStato attuale:');
    console.log(`  ✅ Tabella profiles: ${existingTables.includes('profiles') ? 'ESISTE' : 'NON ESISTE'}`);
    console.log(`  ${existingTables.includes('roles') ? '✅' : '❌'} Tabella roles: ${existingTables.includes('roles') ? 'ESISTE' : 'DA CREARE'}`);
    console.log(`  ${existingTables.includes('user_roles') ? '✅' : '❌'} Tabella user_roles: ${existingTables.includes('user_roles') ? 'ESISTE' : 'DA CREARE'}`);
    console.log(`  ${existingTables.includes('permissions') ? '✅' : '❌'} Tabella permissions: ${existingTables.includes('permissions') ? 'ESISTE' : 'DA CREARE'}`);

    console.log('\nCampo is_admin in profiles:');
    const { data: checkAdmin } = await supabase.from('profiles').select('is_admin').limit(1);
    if (checkAdmin && checkAdmin.length > 0 && 'is_admin' in checkAdmin[0]) {
      console.log('  ✅ Già presente - può essere usato come base');
    } else {
      console.log('  ❌ Non presente - da aggiungere');
    }

    console.log('\n' + '='.repeat(60));
    console.log('FINE VERIFICA');
    console.log('='.repeat(60));

    return existingTables;
  }

  return tables;
}

checkDatabaseStructure().catch(console.error);
