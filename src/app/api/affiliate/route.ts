// ============================================================================
// API: /api/affiliate/commissions
// Descrizione: Storico commissioni affiliato
// Metodo: GET
// Auth: Richiede autenticazione (affiliato)
// Conformità: VITAEOLOGY_MEGA_PROMPT v4.3 | Framework 4P/12F
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verifica autenticazione
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    // Trova affiliato
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliates')
      .select('id, stato, saldo_disponibile_euro, totale_commissioni_euro, totale_pagato_euro')
      .eq('user_id', user.id)
      .single();

    if (affiliateError || !affiliate) {
      return NextResponse.json(
        { error: 'Account affiliato non trovato' },
        { status: 404 }
      );
    }

    // Parametri query
    const searchParams = request.nextUrl.searchParams;
    const stato = searchParams.get('stato'); // pending, approved, paid, cancelled, refunded
    const tipo = searchParams.get('tipo'); // initial, recurring, bonus, upgrade
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const dataInizio = searchParams.get('data_inizio');
    const dataFine = searchParams.get('data_fine');

    // Query commissioni
    let query = supabase
      .from('affiliate_commissions')
      .select(`
        id,
        prodotto,
        prezzo_prodotto_euro,
        percentuale_commissione,
        importo_commissione_euro,
        tipo,
        stato,
        periodo_inizio,
        periodo_fine,
        created_at,
        approved_at,
        paid_at
      `, { count: 'exact' })
      .eq('affiliate_id', affiliate.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filtri opzionali
    if (stato) {
      query = query.eq('stato', stato);
    }
    if (tipo) {
      query = query.eq('tipo', tipo);
    }
    if (dataInizio) {
      query = query.gte('created_at', dataInizio);
    }
    if (dataFine) {
      query = query.lte('created_at', dataFine);
    }

    const { data: commissions, error, count } = await query;

    if (error) {
      console.error('Errore recupero commissioni:', error);
      return NextResponse.json(
        { error: 'Errore nel recupero delle commissioni' },
        { status: 500 }
      );
    }

    // Calcola totali per stato
    const { data: totaliPerStato } = await supabase
      .from('affiliate_commissions')
      .select('stato, importo_commissione_euro')
      .eq('affiliate_id', affiliate.id);

    const totali = {
      pending: 0,
      approved: 0,
      paid: 0,
      cancelled: 0,
      refunded: 0
    };

    totaliPerStato?.forEach((c: { stato: string; importo_commissione_euro: number }) => {
      if (c.stato in totali) {
        totali[c.stato as keyof typeof totali] += Number(c.importo_commissione_euro);
      }
    });

    return NextResponse.json({
      success: true,
      commissions: commissions || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      },
      riepilogo: {
        saldo_disponibile: affiliate.saldo_disponibile_euro,
        totale_guadagnato: affiliate.totale_commissioni_euro,
        totale_pagato: affiliate.totale_pagato_euro,
        per_stato: totali
      }
    });

  } catch (error) {
    console.error('Errore API affiliate/commissions:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
