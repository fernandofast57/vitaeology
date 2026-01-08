// API: /api/affiliate/commissions - Storico commissioni
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
