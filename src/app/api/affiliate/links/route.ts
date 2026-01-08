// API: /api/affiliate/links - Gestione link affiliato
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
