import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkUsers() {
  // Get profiles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, subscription_tier, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  // Get auth users for email confirmation status
  const { data: authData } = await supabase.auth.admin.listUsers();

  const usersMap = new Map<string, { email_confirmed: string; confirmed_at: string | null; last_sign_in: string | null }>();
  if (authData?.users) {
    for (const u of authData.users) {
      usersMap.set(u.id, {
        email_confirmed: u.email_confirmed_at ? 'Confermata' : 'Non confermata',
        confirmed_at: u.email_confirmed_at || null,
        last_sign_in: u.last_sign_in_at || null
      });
    }
  }

  console.log('\n📊 UTENTI REGISTRATI\n');

  for (const p of profiles || []) {
    const auth = usersMap.get(p.id);
    const lastLogin = auth?.last_sign_in ? new Date(auth.last_sign_in).toLocaleString('it-IT') : 'Mai';
    const emailStatus = auth?.email_confirmed || 'N/A';

    console.log(`👤 ${p.full_name || 'N/A'}`);
    console.log(`   Email: ${p.email || 'N/A'}`);
    console.log(`   Tier: ${p.subscription_tier || 'explorer'}`);
    console.log(`   Email: ${emailStatus}`);
    console.log(`   Ultimo login: ${lastLogin}`);
    console.log(`   Registrato: ${new Date(p.created_at).toLocaleDateString('it-IT')}`);
    console.log('');
  }

  // Summary
  const total = profiles?.length || 0;
  const confirmed = profiles?.filter(p => usersMap.get(p.id)?.email_confirmed === 'Confermata').length || 0;

  console.log('📈 RIEPILOGO');
  console.log(`   Totale utenti: ${total}`);
  console.log(`   Email confermate: ${confirmed}`);
  console.log(`   Email non confermate: ${total - confirmed}`);
  console.log('');
}

checkUsers();
