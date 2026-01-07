require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data } = await supabase
    .from('challenge_subscribers')
    .select('email, challenge, current_day, status, last_email_type, last_email_sent_at')
    .order('subscribed_at', { ascending: false });

  console.log('\nALL SUBSCRIBERS STATUS:\n');
  data.forEach(s => {
    const hours = s.last_email_sent_at ? Math.round((Date.now() - new Date(s.last_email_sent_at).getTime()) / (1000 * 60 * 60)) : 'N/A';
    console.log(`${s.email.padEnd(40)} | ${s.challenge.padEnd(20)} | Day ${s.current_day} | ${s.status.padEnd(10)} | ${(s.last_email_type || 'N/A').padEnd(15)} | ${hours}h ago`);
  });
}

main().catch(console.error);
