/**
 * Script per verificare lo stato dettagliato dei challenge subscribers
 * e capire perché le email non vengono inviate
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('\n=== STATO DETTAGLIATO CHALLENGE SUBSCRIBERS ===\n');

  // Query dettagliata
  const { data: subscribers, error } = await supabase
    .from('challenge_subscribers')
    .select('*')
    .order('subscribed_at', { ascending: false });

  if (error) {
    console.error('Errore:', error.message);
    return;
  }

  // Analizza ogni subscriber
  for (const sub of subscribers) {
    console.log(`\n📧 ${sub.email}`);
    console.log(`   Challenge: ${sub.challenge}`);
    console.log(`   Status: ${sub.status}`);
    console.log(`   Current Day: ${sub.current_day}/7`);
    console.log(`   Variant: ${sub.variant || 'A'}`);
    console.log(`   Subscribed: ${sub.subscribed_at}`);
    console.log(`   Last Email Sent: ${sub.last_email_sent_at || 'MAI'}`);
    console.log(`   Last Email Type: ${sub.last_email_type || 'NESSUNO'}`);
    console.log(`   Completed At: ${sub.completed_at || '-'}`);

    // Calcola quando dovrebbe ricevere la prossima email
    if (sub.status === 'active' && sub.current_day < 7) {
      if (!sub.last_email_sent_at) {
        console.log(`   ⚠️  PROBLEMA: Nessuna email inviata - dovrebbe ricevere Day ${sub.current_day + 1}`);
      } else {
        const lastSent = new Date(sub.last_email_sent_at);
        const now = new Date();
        const hoursAgo = Math.round((now - lastSent) / (1000 * 60 * 60));

        console.log(`   ⏰ Ore dall'ultima email: ${hoursAgo}`);

        if (sub.last_email_type === 'day_content' && hoursAgo >= 48) {
          console.log(`   📨 DOVREBBE RICEVERE: Reminder (48h passate)`);
        } else if (sub.last_email_type === 'reminder' && hoursAgo >= 72) {
          console.log(`   📨 DOVREBBE RICEVERE: Force Advance Day ${sub.current_day + 1}`);
        } else if (sub.last_email_type === 'day_content' && hoursAgo >= 24) {
          console.log(`   📨 DOVREBBE RICEVERE: Day ${sub.current_day + 1} content (se attivo)`);
        }
      }
    }
  }

  // Riepilogo problemi
  console.log('\n\n=== RIEPILOGO PROBLEMI ===');

  const noEmailSent = subscribers.filter(s => !s.last_email_sent_at);
  if (noEmailSent.length > 0) {
    console.log(`\n❌ ${noEmailSent.length} subscriber senza email inviate:`);
    noEmailSent.forEach(s => console.log(`   - ${s.email} (${s.challenge})`));
    console.log('\n   CAUSA PROBABILE: L\'email di welcome non viene loggata in last_email_sent_at');
  }

  // Check colonne della tabella
  console.log('\n\n=== STRUTTURA TABELLA ===');
  const { data: columns } = await supabase.rpc('get_table_columns', {
    table_name: 'challenge_subscribers'
  }).catch(() => ({ data: null }));

  if (!columns) {
    // Fallback - verifica esistenza colonne key
    const sampleSub = subscribers[0];
    if (sampleSub) {
      console.log('Colonne presenti nel primo record:');
      Object.keys(sampleSub).forEach(k => console.log(`   - ${k}: ${typeof sampleSub[k]}`));
    }
  }
}

main().catch(console.error);
