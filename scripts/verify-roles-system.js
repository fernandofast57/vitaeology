/**
 * Verifica sistema Ruoli e Autorizzazioni
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verify() {
  console.log('='.repeat(60));
  console.log('VERIFICA SISTEMA RUOLI E AUTORIZZAZIONI');
  console.log('='.repeat(60));

  // 1. Verifica tabella roles
  console.log('\n📋 RUOLI:');
  const { data: roles, error: rolesErr } = await supabase
    .from('roles')
    .select('*')
    .order('level', { ascending: false });

  if (rolesErr) {
    console.log('❌ Errore:', rolesErr.message);
  } else {
    roles.forEach(r => {
      console.log(`  [${r.level}] ${r.name} - ${r.display_name} ${r.is_system ? '(sistema)' : ''}`);
    });
    console.log(`  Totale: ${roles.length} ruoli`);
  }

  // 2. Verifica tabella permissions
  console.log('\n🔑 PERMESSI:');
  const { data: perms, error: permsErr } = await supabase
    .from('permissions')
    .select('*')
    .order('category');

  if (permsErr) {
    console.log('❌ Errore:', permsErr.message);
  } else {
    const byCategory = {};
    perms.forEach(p => {
      if (!byCategory[p.category]) byCategory[p.category] = [];
      byCategory[p.category].push(p.name);
    });

    Object.keys(byCategory).forEach(cat => {
      console.log(`  [${cat}]`);
      byCategory[cat].forEach(p => console.log(`    - ${p}`));
    });
    console.log(`  Totale: ${perms.length} permessi`);
  }

  // 3. Verifica role_permissions
  console.log('\n🔗 ASSOCIAZIONI RUOLO-PERMESSO:');
  const { data: rp, error: rpErr } = await supabase
    .from('role_permissions')
    .select(`
      role_id,
      roles!inner(name),
      permission_id,
      permissions!inner(name)
    `);

  if (rpErr) {
    console.log('❌ Errore:', rpErr.message);
  } else {
    const byRole = {};
    rp.forEach(r => {
      const roleName = r.roles?.name || r.role_id;
      if (!byRole[roleName]) byRole[roleName] = [];
      byRole[roleName].push(r.permissions?.name || r.permission_id);
    });

    Object.keys(byRole).forEach(role => {
      console.log(`  ${role}: ${byRole[role].length} permessi`);
    });
    console.log(`  Totale: ${rp.length} associazioni`);
  }

  // 4. Verifica utenti con ruoli
  console.log('\n👥 UTENTI CON RUOLI:');
  const { data: users, error: usersErr } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      full_name,
      is_admin,
      role_id,
      roles(name, display_name, level)
    `);

  if (usersErr) {
    console.log('❌ Errore:', usersErr.message);
  } else {
    users.forEach(u => {
      const roleName = u.roles?.name || 'nessun ruolo';
      const admin = u.is_admin ? ' 👑' : '';
      console.log(`  ${u.email}: ${roleName} (level: ${u.roles?.level || 0})${admin}`);
    });
    console.log(`  Totale: ${users.length} utenti`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('VERIFICA COMPLETATA');
  console.log('='.repeat(60));
}

verify().catch(console.error);
