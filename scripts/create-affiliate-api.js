#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'src', 'app', 'api', 'affiliate');

// Ensure directories exist
const dirs = ['stats', 'links', 'commissions', 'payouts'];
dirs.forEach(dir => {
  const fullPath = path.join(baseDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Stats route
const statsContent = `// API: /api/affiliate/stats - Statistiche affiliato
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliates')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (affiliateError || !affiliate) {
      return NextResponse.json({ error: 'Non sei un affiliato registrato' }, { status: 404 });
    }

    const { data: stats } = await supabase
      .rpc('get_affiliate_stats', { p_affiliate_id: affiliate.id });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentClicks } = await supabase
      .from('affiliate_clicks')
      .select('clicked_at, landing_page, challenge_type, stato_conversione')
      .eq('affiliate_id', affiliate.id)
      .gte('clicked_at', thirtyDaysAgo.toISOString())
      .order('clicked_at', { ascending: false });

    const { data: pendingCommissions } = await supabase
      .from('affiliate_commissions')
      .select('importo_commissione_euro, created_at, prodotto')
      .eq('affiliate_id', affiliate.id)
      .eq('stato', 'pending');

    return NextResponse.json({
      affiliate: {
        id: affiliate.id,
        nome: affiliate.nome,
        email: affiliate.email,
        ref_code: affiliate.ref_code,
        categoria: affiliate.categoria,
        commissione_percentuale: affiliate.commissione_percentuale,
        stato: affiliate.stato,
      },
      stats: stats || {
        totale_click: affiliate.totale_click || 0,
        totale_conversioni: affiliate.totale_conversioni || 0,
        totale_commissioni_euro: affiliate.totale_commissioni_euro || 0,
        saldo_disponibile_euro: affiliate.saldo_disponibile_euro || 0,
        totale_pagato_euro: affiliate.totale_pagato_euro || 0,
      },
      recent_clicks: recentClicks || [],
      pending_commissions: pendingCommissions || [],
    });

  } catch (error) {
    console.error('Errore API affiliate/stats:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
`;

// Links route
const linksContent = `// API: /api/affiliate/links - Gestione link affiliato
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!affiliate) {
      return NextResponse.json({ error: 'Non sei un affiliato' }, { status: 404 });
    }

    const { data: links, error } = await supabase
      .from('affiliate_links')
      .select('*')
      .eq('affiliate_id', affiliate.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Errore recupero link' }, { status: 500 });
    }

    return NextResponse.json({ links: links || [] });

  } catch (error) {
    console.error('Errore API affiliate/links GET:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('id, ref_code, stato')
      .eq('user_id', user.id)
      .single();

    if (!affiliate || affiliate.stato !== 'active') {
      return NextResponse.json({ error: 'Affiliato non attivo' }, { status: 403 });
    }

    const body = await request.json();
    const { destination_type, challenge_type, nome_link, utm_source, utm_medium, utm_campaign } = body;

    const { data: urlResult } = await supabase.rpc('build_affiliate_url', {
      p_ref_code: affiliate.ref_code,
      p_destination_type: destination_type || 'challenge',
      p_challenge_type: challenge_type || 'leadership',
      p_utm_source: utm_source,
      p_utm_medium: utm_medium,
      p_utm_campaign: utm_campaign,
    });

    const { data: link, error } = await supabase
      .from('affiliate_links')
      .insert({
        affiliate_id: affiliate.id,
        destination_type: destination_type || 'challenge',
        challenge_type: challenge_type || null,
        url_generato: urlResult || 'https://vitaeology.com?ref=' + affiliate.ref_code,
        nome_link: nome_link || null,
        utm_source,
        utm_medium,
        utm_campaign,
      })
      .select()
      .single();

    if (error) {
      console.error('Errore creazione link:', error);
      return NextResponse.json({ error: 'Errore creazione link' }, { status: 500 });
    }

    return NextResponse.json({ success: true, link }, { status: 201 });

  } catch (error) {
    console.error('Errore API affiliate/links POST:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
`;

// Commissions route
const commissionsContent = `// API: /api/affiliate/commissions - Storico commissioni
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!affiliate) {
      return NextResponse.json({ error: 'Non sei un affiliato' }, { status: 404 });
    }

    const { data: commissions, error } = await supabase
      .from('affiliate_commissions')
      .select('id, prodotto, prezzo_prodotto_euro, percentuale_commissione, importo_commissione_euro, tipo, stato, created_at, approved_at, paid_at')
      .eq('affiliate_id', affiliate.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Errore recupero commissioni' }, { status: 500 });
    }

    const totals = { pending: 0, approved: 0, paid: 0 };
    commissions?.forEach(c => {
      if (c.stato === 'pending') totals.pending += Number(c.importo_commissione_euro);
      else if (c.stato === 'approved') totals.approved += Number(c.importo_commissione_euro);
      else if (c.stato === 'paid') totals.paid += Number(c.importo_commissione_euro);
    });

    return NextResponse.json({ commissions: commissions || [], totals });

  } catch (error) {
    console.error('Errore API affiliate/commissions:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
`;

// Payouts route
const payoutsContent = `// API: /api/affiliate/payouts - Richieste payout
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('id, saldo_disponibile_euro, soglia_payout_euro')
      .eq('user_id', user.id)
      .single();

    if (!affiliate) {
      return NextResponse.json({ error: 'Non sei un affiliato' }, { status: 404 });
    }

    const { data: payouts, error } = await supabase
      .from('affiliate_payouts')
      .select('*')
      .eq('affiliate_id', affiliate.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Errore recupero payouts' }, { status: 500 });
    }

    return NextResponse.json({
      payouts: payouts || [],
      saldo_disponibile: affiliate.saldo_disponibile_euro,
      soglia_minima: affiliate.soglia_payout_euro,
    });

  } catch (error) {
    console.error('Errore API affiliate/payouts GET:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('id, stato')
      .eq('user_id', user.id)
      .single();

    if (!affiliate || affiliate.stato !== 'active') {
      return NextResponse.json({ error: 'Affiliato non attivo' }, { status: 403 });
    }

    const body = await request.json();
    const { metodo } = body;

    const { data: payoutId, error } = await supabase.rpc('create_affiliate_payout_request', {
      p_affiliate_id: affiliate.id,
      p_metodo: metodo || null,
    });

    if (error) {
      console.error('Errore creazione payout:', error);
      return NextResponse.json({ error: error.message || 'Errore creazione richiesta' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      payout_id: payoutId,
      message: 'Richiesta payout inviata. Riceverai il pagamento entro 7 giorni lavorativi.',
    }, { status: 201 });

  } catch (error) {
    console.error('Errore API affiliate/payouts POST:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
`;

// Write files
fs.writeFileSync(path.join(baseDir, 'stats', 'route.ts'), statsContent);
console.log('✅ stats/route.ts created');

fs.writeFileSync(path.join(baseDir, 'links', 'route.ts'), linksContent);
console.log('✅ links/route.ts created');

fs.writeFileSync(path.join(baseDir, 'commissions', 'route.ts'), commissionsContent);
console.log('✅ commissions/route.ts created');

fs.writeFileSync(path.join(baseDir, 'payouts', 'route.ts'), payoutsContent);
console.log('✅ payouts/route.ts created');

console.log('\n✅ All affiliate API routes created!');
