// ============================================================================
// API: /api/admin/affiliates/payouts
// Descrizione: Gestione amministrativa payouts affiliati
// Metodi: GET (lista), PATCH (approva/completa/rifiuta)
// Auth: Richiede autenticazione admin
// Conformità: VITAEOLOGY_MEGA_PROMPT v4.3 | Framework 4P/12F
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Helper: Verifica admin
async function verifyAdmin(supabase: any) {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return { error: 'Non autenticato', status: 401 };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return { error: 'Accesso non autorizzato', status: 403 };
  }

  return { user };
}

// GET: Lista payouts con filtri
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const auth = await verifyAdmin(supabase);
    
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Parametri query
    const searchParams = request.nextUrl.searchParams;
    const stato = searchParams.get('stato');
    const affiliateId = searchParams.get('affiliate_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Query base con join affiliato
    let query = supabase
      .from('affiliate_payouts')
      .select(`
        *,
        affiliate:affiliate_id (
          id,
          email,
          nome,
          cognome,
          ref_code,
          categoria
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filtri
    if (stato) {
      query = query.eq('stato', stato);
    }
    if (affiliateId) {
      query = query.eq('affiliate_id', affiliateId);
    }

    const { data: payouts, error, count } = await query;

    if (error) {
      console.error('Errore query payouts:', error);
      return NextResponse.json(
        { error: 'Errore nel recupero dei payouts' },
        { status: 500 }
      );
    }

    // Stats payouts
    const { data: stats } = await supabase
      .from('affiliate_payouts')
      .select('stato, importo_richiesto_euro');

    const totaliPerStato = {
      pending: { count: 0, importo: 0 },
      processing: { count: 0, importo: 0 },
      completed: { count: 0, importo: 0 },
      failed: { count: 0, importo: 0 },
      cancelled: { count: 0, importo: 0 }
    };

    stats?.forEach((p: { stato: string; importo_richiesto_euro: number }) => {
      if (p.stato in totaliPerStato) {
        totaliPerStato[p.stato as keyof typeof totaliPerStato].count++;
        totaliPerStato[p.stato as keyof typeof totaliPerStato].importo += Number(p.importo_richiesto_euro);
      }
    });

    return NextResponse.json({
      success: true,
      payouts: payouts || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      },
      stats: totaliPerStato
    });

  } catch (error) {
    console.error('Errore API admin/affiliates/payouts GET:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// PATCH: Modifica stato payout
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const auth = await verifyAdmin(supabase);
    
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();

    if (!body.payout_id) {
      return NextResponse.json(
        { error: 'payout_id richiesto' },
        { status: 400 }
      );
    }

    // Recupera payout
    const { data: payout, error: fetchError } = await supabase
      .from('affiliate_payouts')
      .select('*, affiliate:affiliate_id(email, nome)')
      .eq('id', body.payout_id)
      .single();

    if (fetchError || !payout) {
      return NextResponse.json(
        { error: 'Payout non trovato' },
        { status: 404 }
      );
    }

    // Azioni
    const azione = body.azione; // 'approve', 'process', 'complete', 'fail', 'cancel'

    switch (azione) {
      case 'approve':
        // Da pending a processing
        if (payout.stato !== 'pending') {
          return NextResponse.json(
            { error: 'Solo payouts pending possono essere approvati' },
            { status: 400 }
          );
        }

        await supabase
          .from('affiliate_payouts')
          .update({
            stato: 'processing',
            approvato_at: new Date().toISOString(),
            approvato_da: auth.user.id,
            processing_at: new Date().toISOString()
          })
          .eq('id', body.payout_id);

        break;

      case 'complete':
        // Da processing a completed
        if (payout.stato !== 'processing') {
          return NextResponse.json(
            { error: 'Solo payouts in processing possono essere completati' },
            { status: 400 }
          );
        }

        if (!body.riferimento_pagamento) {
          return NextResponse.json(
            { error: 'riferimento_pagamento richiesto per completare' },
            { status: 400 }
          );
        }

        // Usa funzione database
        const { error: completeError } = await supabase
          .rpc('complete_affiliate_payout', {
            p_payout_id: body.payout_id,
            p_riferimento: body.riferimento_pagamento,
            p_importo_effettivo: body.importo_effettivo || null
          });

        if (completeError) {
          console.error('Errore complete payout:', completeError);
          return NextResponse.json(
            { error: 'Errore nel completamento del payout' },
            { status: 500 }
          );
        }

        // TODO: Notifica affiliato pagamento completato
        // await notifyAffiliatePayoutCompleted(payout);

        break;

      case 'fail':
        // Da processing a failed
        if (payout.stato !== 'processing') {
          return NextResponse.json(
            { error: 'Solo payouts in processing possono fallire' },
            { status: 400 }
          );
        }

        if (!body.motivo) {
          return NextResponse.json(
            { error: 'motivo richiesto per fallimento' },
            { status: 400 }
          );
        }

        await supabase
          .from('affiliate_payouts')
          .update({
            stato: 'failed',
            motivo_stato: body.motivo,
            failed_at: new Date().toISOString()
          })
          .eq('id', body.payout_id);

        // Rilascia commissioni
        await supabase
          .from('affiliate_commissions')
          .update({ payout_id: null })
          .eq('payout_id', body.payout_id);

        // TODO: Notifica affiliato
        // await notifyAffiliatePayoutFailed(payout, body.motivo);

        break;

      case 'cancel':
        // Cancella payout pending o processing
        if (!['pending', 'processing'].includes(payout.stato)) {
          return NextResponse.json(
            { error: 'Solo payouts pending o processing possono essere cancellati' },
            { status: 400 }
          );
        }

        const { error: cancelError } = await supabase
          .rpc('cancel_affiliate_payout', {
            p_payout_id: body.payout_id,
            p_motivo: body.motivo || 'Cancellato da admin'
          });

        if (cancelError) {
          console.error('Errore cancel payout:', cancelError);
          return NextResponse.json(
            { error: 'Errore nella cancellazione del payout' },
            { status: 500 }
          );
        }

        break;

      default:
        return NextResponse.json(
          { error: 'Azione non valida. Valori: approve, complete, fail, cancel' },
          { status: 400 }
        );
    }

    // Recupera payout aggiornato
    const { data: updatedPayout } = await supabase
      .from('affiliate_payouts')
      .select('*')
      .eq('id', body.payout_id)
      .single();

    return NextResponse.json({
      success: true,
      payout: updatedPayout,
      azione
    });

  } catch (error) {
    console.error('Errore API admin/affiliates/payouts PATCH:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
