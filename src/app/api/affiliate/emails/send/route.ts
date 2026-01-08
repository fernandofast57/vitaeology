/**
 * API: Invio Email Affiliati
 * POST /api/affiliate/emails/send
 *
 * Invia email singola a un affiliato
 * Richiede autenticazione admin o service role
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import {
  sendAffiliateEmail,
  type AffiliateEmailType,
  type AffiliateEmailData,
} from '@/lib/email/affiliate-emails';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verifica autenticazione
    const { data: { user } } = await supabase.auth.getUser();

    // Verifica se è admin o chiamata interna con cron secret
    const authHeader = request.headers.get('authorization');
    const isCronCall = authHeader === `Bearer ${process.env.CRON_SECRET}`;

    if (!user && !isCronCall) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    // Se utente, verifica sia admin
    if (user && !isCronCall) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        return NextResponse.json({ error: 'Accesso negato' }, { status: 403 });
      }
    }

    const body = await request.json();
    const { affiliateId, emailType, metadata } = body as {
      affiliateId: string;
      emailType: AffiliateEmailType;
      metadata?: Record<string, unknown>;
    };

    if (!affiliateId || !emailType) {
      return NextResponse.json(
        { error: 'affiliateId e emailType sono richiesti' },
        { status: 400 }
      );
    }

    // Ottieni dati affiliato dalla view
    const { data: affiliate, error: fetchError } = await supabase
      .from('v_affiliates_email_data')
      .select('*')
      .eq('affiliate_id', affiliateId)
      .single();

    if (fetchError || !affiliate) {
      return NextResponse.json(
        { error: 'Affiliato non trovato' },
        { status: 404 }
      );
    }

    // Prepara dati email
    const emailData: AffiliateEmailData = {
      nome: affiliate.nome,
      email: affiliate.email,
      ref_code: affiliate.ref_code,
      abbonamento_utente: affiliate.abbonamento_utente,
      commissione_base: affiliate.commissione_base,
      bonus_performance: affiliate.bonus_performance,
      commissione_totale: affiliate.commissione_totale,
      clienti_attivi: affiliate.clienti_attivi,
      saldo_disponibile: affiliate.saldo_disponibile,
      giorni_iscrizione: affiliate.giorni_iscrizione,
      esercizi_completati: affiliate.esercizi_completati,
      conversazioni_coach: affiliate.conversazioni_coach,
      // Aggiungi eventuali dati extra da metadata
      ...(metadata as Partial<AffiliateEmailData>),
    };

    // Invia email
    const result = await sendAffiliateEmail(emailType, emailData, {
      affiliateId,
      ...metadata,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Errore invio email' },
        { status: 500 }
      );
    }

    // Se email sequenza, avanza step
    if (emailType.startsWith('D')) {
      await supabase.rpc('advance_sequence_step', {
        p_affiliate_id: affiliateId,
      });
    }

    return NextResponse.json({
      success: true,
      emailId: result.emailId,
      emailType,
    });

  } catch (error) {
    console.error('Errore API affiliate/emails/send:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
