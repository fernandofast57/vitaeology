// API: /api/affiliate/payouts - Richieste payout
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
