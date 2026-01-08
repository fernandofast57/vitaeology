// API: /api/admin/affiliates - Gestione affiliati admin con struttura commissioni
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    // Verifica admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 });
    }

    // Query affiliati con tutti i campi commissioni
    const { data: affiliates, error } = await supabase
      .from('affiliates')
      .select(`
        id,
        user_id,
        ref_code,
        email,
        nome,
        cognome,
        stato,
        categoria,
        abbonamento_utente,
        commissione_base,
        bonus_performance,
        bonus_milestone_mensile,
        commissione_percentuale,
        totale_clienti_attivi,
        totale_click,
        totale_conversioni,
        saldo_disponibile_euro,
        totale_commissioni_euro,
        totale_pagato_euro,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calcola statistiche globali
    const affiliatesList = affiliates || [];

    const totals = {
      affiliati_totali: affiliatesList.length,
      affiliati_attivi: affiliatesList.filter(a => a.stato === 'attivo').length,
      affiliati_pending: affiliatesList.filter(a => a.stato === 'pending').length,
      saldo_totale_pending: affiliatesList.reduce(
        (sum, a) => sum + (Number(a.saldo_disponibile_euro) || 0), 0
      ),
      commissioni_totali_pagate: affiliatesList.reduce(
        (sum, a) => sum + (Number(a.totale_pagato_euro) || 0), 0
      ),
      commissioni_totali_generate: affiliatesList.reduce(
        (sum, a) => sum + (Number(a.totale_commissioni_euro) || 0), 0
      ),
      bonus_milestone_mensili: affiliatesList.reduce(
        (sum, a) => sum + (Number(a.bonus_milestone_mensile) || 0), 0
      ),
      totale_click: affiliatesList.reduce(
        (sum, a) => sum + (a.totale_click || 0), 0
      ),
      totale_conversioni: affiliatesList.reduce(
        (sum, a) => sum + (a.totale_conversioni || 0), 0
      ),
      totale_clienti_attivi: affiliatesList.reduce(
        (sum, a) => sum + (a.totale_clienti_attivi || 0), 0
      ),
    };

    // Formatta affiliati con commissione totale calcolata
    const formattedAffiliates = affiliatesList.map(a => ({
      ...a,
      commissione_totale: (Number(a.commissione_base) || 25) + (Number(a.bonus_performance) || 0),
    }));

    return NextResponse.json({
      affiliates: formattedAffiliates,
      totals,
    });

  } catch (error) {
    console.error('Errore API admin/affiliates:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 });
    }

    const body = await request.json();
    const { id, stato, categoria, commissione_percentuale } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID mancante' }, { status: 400 });
    }

    const updateData: Record<string, any> = {};
    if (stato) updateData.stato = stato;
    if (categoria) updateData.categoria = categoria;
    if (commissione_percentuale) updateData.commissione_percentuale = commissione_percentuale;
    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('affiliates')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Errore API admin/affiliates PATCH:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
