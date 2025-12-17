/**
 * Verifica setup admin - Controllo database roles e profilo
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyAdminSetup() {
  console.log('🔍 Verifica setup admin...\n');

  // 1. Verifica che la tabella roles esista
  console.log('1. Controllo tabella roles...');
  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('*')
    .order('level', { ascending: false });

  if (rolesError) {
    console.error('❌ Errore: tabella roles non accessibile:', rolesError.message);
    console.log('\n💡 Esegui le migration SQL per creare la tabella roles');
    return;
  }

  console.log(`✅ Tabella roles: ${roles.length} ruoli trovati`);
  roles.forEach(r => {
    console.log(`   - ${r.name} (level: ${r.level}) - ${r.display_name}`);
  });

  // 2. Verifica profilo Fernando
  console.log('\n2. Controllo profilo admin (fernando@vitaeology.com)...');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      full_name,
      is_admin,
      role_id,
      roles (
        name,
        level,
        display_name
      )
    `)
    .eq('email', 'fernando@vitaeology.com')
    .single();

  if (profileError) {
    console.error('❌ Errore caricamento profilo:', profileError.message);
    return;
  }

  console.log(`✅ Profilo trovato: ${profile.email}`);
  console.log(`   - ID: ${profile.id}`);
  console.log(`   - Nome: ${profile.full_name || 'N/A'}`);
  console.log(`   - is_admin (legacy): ${profile.is_admin}`);
  console.log(`   - role_id: ${profile.role_id || 'NULL'}`);

  if (profile.roles) {
    console.log(`   - Ruolo: ${profile.roles.name} (level: ${profile.roles.level})`);
  } else {
    console.log('   - Ruolo: NESSUNO');
  }

  // 3. Verifica accesso admin
  console.log('\n3. Verifica accesso admin...');
  const roleLevel = profile.roles?.level ?? 0;
  const isAdminByLegacy = profile.is_admin === true;
  const isAdminByRole = roleLevel >= 80;

  console.log(`   - Admin per is_admin legacy: ${isAdminByLegacy}`);
  console.log(`   - Admin per role level >= 80: ${isAdminByRole}`);
  console.log(`   - ACCESSO ADMIN: ${isAdminByLegacy || isAdminByRole ? '✅ SI' : '❌ NO'}`);

  // 4. Se non è admin, suggerisci fix
  if (!isAdminByLegacy && !isAdminByRole) {
    console.log('\n🔧 Per abilitare accesso admin, esegui:');
    console.log(`
-- Opzione 1: Imposta is_admin = true (legacy)
UPDATE profiles SET is_admin = true WHERE email = 'fernando@vitaeology.com';

-- Opzione 2: Assegna ruolo super_admin
UPDATE profiles
SET role_id = (SELECT id FROM roles WHERE name = 'super_admin')
WHERE email = 'fernando@vitaeology.com';
    `);
  }

  // 5. Verifica permessi tabella
  console.log('\n4. Controllo tabella permissions...');
  const { data: permissions, error: permError } = await supabase
    .from('permissions')
    .select('name, category')
    .limit(5);

  if (permError) {
    console.log('⚠️ Tabella permissions non trovata o vuota');
  } else {
    console.log(`✅ Tabella permissions: ${permissions.length}+ permessi trovati`);
  }

  console.log('\n✨ Verifica completata!');
}

verifyAdminSetup().catch(console.error);
