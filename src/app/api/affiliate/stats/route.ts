// API: /api/affiliate/stats - Statistiche affiliato con struttura commissioni
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Calcola il prossimo obiettivo in base ai clienti attivi
function calcolaProssimoObiettivo(clientiAttivi: number) {
  if (clientiAttivi < 10) {
    return {
      tipo: 'bonus_performance',
      clienti_necessari: 10 - clientiAttivi,
      bonus: '+3%',
      descrizione: `Porta ancora ${10 - clientiAttivi} clienti per sbloccare +3%`,
    };
  }
  if (clientiAttivi < 30) {
    return {
      tipo: 'bonus_performance',
      clienti_necessari: 30 - clientiAttivi,
      bonus: '+5%',
      descrizione: `Porta ancora ${30 - clientiAttivi} clienti per sbloccare +5% (totale)`,
    };
  }
  if (clientiAttivi < 50) {
    return {
      tipo: 'milestone',
      clienti_necessari: 50 - clientiAttivi,
      bonus: '€500/mese',
      descrizione: `Porta ancora ${50 - clientiAttivi} clienti per €500/mese`,
    };
  }
  if (clientiAttivi < 100) {
    return {
      tipo: 'milestone',
      clienti_necessari: 100 - clientiAttivi,
      bonus: '€1000/mese',
      descrizione: `Porta ancora ${100 - clientiAttivi} clienti per €1000/mese`,
    };
  }
  return null; // Ha raggiunto tutto
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    // Query affiliato con tutti i nuovi campi commissioni
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliates')
      .select(`
        id,
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
        created_at
      `)
      .eq('user_id', user.id)
      .single();

    if (affiliateError || !affiliate) {
      return NextResponse.json({ error: 'Non sei un affiliato registrato' }, { status: 404 });
    }

    // Query milestone raggiunti
    const { data: milestones } = await supabase
      .from('affiliate_milestone_bonuses')
      .select('milestone_type, importo, is_recurring, achieved_at')
      .eq('affiliate_id', affiliate.id)
      .order('achieved_at', { ascending: true });

    // Click ultimi 30 giorni
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentClicks } = await supabase
      .from('affiliate_clicks')
      .select('clicked_at, landing_page, challenge_type, stato_conversione')
      .eq('affiliate_id', affiliate.id)
      .gte('clicked_at', thirtyDaysAgo.toISOString())
      .order('clicked_at', { ascending: false });

    // Commissioni pending
    const { data: pendingCommissions } = await supabase
      .from('affiliate_commissions')
      .select('importo_commissione_euro, created_at, prodotto')
      .eq('affiliate_id', affiliate.id)
      .eq('stato', 'pending');

    // Ultime commissioni
    const { data: recentCommissions } = await supabase
      .from('affiliate_commissions')
      .select('importo_commissione_euro, created_at, prodotto, stato, percentuale_applicata')
      .eq('affiliate_id', affiliate.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Calcola commissione totale e prossimo obiettivo
    const clientiAttivi = affiliate.totale_clienti_attivi || 0;
    const commissioneBase = Number(affiliate.commissione_base) || 25;
    const bonusPerformance = Number(affiliate.bonus_performance) || 0;
    const bonusMilestoneMensile = Number(affiliate.bonus_milestone_mensile) || 0;

    return NextResponse.json({
      affiliate: {
        id: affiliate.id,
        nome: affiliate.nome,
        cognome: affiliate.cognome,
        email: affiliate.email,
        ref_code: affiliate.ref_code,
        categoria: affiliate.categoria,
        stato: affiliate.stato,
        created_at: affiliate.created_at,
      },
      stats: {
        totale_click: affiliate.totale_click || 0,
        totale_conversioni: affiliate.totale_conversioni || 0,
        totale_commissioni_euro: Number(affiliate.totale_commissioni_euro) || 0,
        saldo_disponibile_euro: Number(affiliate.saldo_disponibile_euro) || 0,
        totale_pagato_euro: Number(affiliate.totale_pagato_euro) || 0,
        clienti_attivi: clientiAttivi,
      },
      // Struttura commissioni dettagliata
      commissioni: {
        abbonamento: affiliate.abbonamento_utente || 'leader',
        base: commissioneBase,
        bonus_performance: bonusPerformance,
        totale: commissioneBase + bonusPerformance,
        bonus_milestone_mensile: bonusMilestoneMensile,
        prossimo_obiettivo: calcolaProssimoObiettivo(clientiAttivi),
      },
      // Milestone raggiunti
      milestones: milestones || [],
      recent_clicks: recentClicks || [],
      pending_commissions: pendingCommissions || [],
      recent_commissions: recentCommissions || [],
    });

  } catch (error) {
    console.error('Errore API affiliate/stats:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
