const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Email da NON eliminare (utenti reali)
const WHITELIST = [
  'fernando@vitaeology.com',
  'fernandomarongiu@hotmail.com',
  'marongiu.luca8@gmail.com',
  'fabrizio.ciancio@gmail.com',
  'fabrizio.ciancio@protonmail.com',
  'olivaalessio00@gmail.com',
  'test@vitaeology.com',
  'fernandospammato@gmail.com'
];

async function cleanAuthUsers() {
  console.log('=== PULIZIA AUTH.USERS ===\n');

  // 1. Lista tutti gli utenti auth
  const { data: { users }, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000
  });

  if (error) {
    console.error('Errore nel recupero utenti:', error.message);
    return;
  }

  console.log('Utenti totali in auth.users:', users.length);

  // 2. Separa whitelisted da spam
  const whitelisted = users.filter(u => WHITELIST.includes(u.email?.toLowerCase()));
  const toDelete = users.filter(u => !WHITELIST.includes(u.email?.toLowerCase()));

  console.log('Utenti whitelisted (da mantenere):', whitelisted.length);
  whitelisted.forEach(u => console.log(`  ✅ ${u.email}`));

  console.log('\nUtenti spam da eliminare:', toDelete.length);

  if (toDelete.length === 0) {
    console.log('Nessun utente spam da eliminare.');
    return;
  }

  // 3. Elimina utenti spam
  console.log('\nEliminazione in corso...\n');

  let deleted = 0;
  let errors = 0;

  for (const user of toDelete) {
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.log(`  ❌ Errore eliminazione ${user.email}: ${deleteError.message}`);
      errors++;
    } else {
      console.log(`  🗑️  Eliminato: ${user.email}`);
      deleted++;
    }
  }

  // 4. Riepilogo finale
  console.log('\n=== RIEPILOGO ===');
  console.log(`Eliminati: ${deleted}`);
  console.log(`Errori: ${errors}`);
  console.log(`Rimanenti: ${whitelisted.length}`);

  // 5. Verifica finale
  const { data: { users: remaining } } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 100
  });

  console.log('\n=== UTENTI RIMANENTI ===');
  remaining?.forEach(u => {
    console.log(`  ${u.email} (creato: ${u.created_at?.split('T')[0]})`);
  });
}

cleanAuthUsers().catch(console.error);
