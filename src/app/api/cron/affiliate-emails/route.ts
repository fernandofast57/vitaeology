/**
 * CRON JOB: Processamento Email Affiliati
 * GET /api/cron/affiliate-emails
 *
 * Eseguito ogni giorno alle 9:00 UTC (10:00 Italia)
 * Processa:
 * 1. Nuovi affiliati senza T1 → invia T1 + crea sequenza
 * 2. Affiliati in sequenza → invia D1-D7 (ogni 2 giorni)
 * 3. Affiliati inattivi → invia E1 (14 giorni senza click)
 */

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import {
  sendAffiliateEmail,
  type AffiliateEmailData,
} from '@/lib/email/affiliate-emails';

// Supabase con service role per accesso completo
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: Request) {
  // Verifica header cron (Vercel Cron o simile)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  const results = {
    t1: { sent: 0, errors: 0 },
    sequence: { sent: 0, errors: 0 },
    e1: { sent: 0, errors: 0 },
  };

  try {
    // ========================================
    // 1. NUOVI AFFILIATI SENZA T1
    // ========================================
    console.log('📧 [Affiliate Cron] Processando nuovi affiliati...');

    const { data: newAffiliates } = await supabase
      .from('v_affiliates_need_t1')
      .select('*');

    for (const affiliate of newAffiliates || []) {
      try {
        // Recupera dati completi
        const { data: fullData } = await supabase
          .from('v_affiliates_email_data')
          .select('*')
          .eq('affiliate_id', affiliate.id)
          .single();

        if (!fullData) continue;

        const emailData: AffiliateEmailData = {
          nome: fullData.nome,
          email: fullData.email,
          ref_code: fullData.ref_code,
          abbonamento_utente: fullData.abbonamento_utente,
          commissione_base: fullData.commissione_base,
          bonus_performance: fullData.bonus_performance,
          commissione_totale: fullData.commissione_totale,
          clienti_attivi: fullData.clienti_attivi,
          saldo_disponibile: fullData.saldo_disponibile,
          giorni_iscrizione: fullData.giorni_iscrizione,
          esercizi_completati: fullData.esercizi_completati,
          conversazioni_coach: fullData.conversazioni_coach,
        };

        // Invia T1
        const result = await sendAffiliateEmail('T1', emailData, {
          affiliateId: affiliate.id,
        });

        if (result.success) {
          // Crea record sequenza
          await supabase.rpc('create_affiliate_email_sequence', {
            p_affiliate_id: affiliate.id,
          });
          results.t1.sent++;
        } else {
          results.t1.errors++;
          console.error(`Errore T1 per ${affiliate.email}:`, result.error);
        }
      } catch (err) {
        results.t1.errors++;
        console.error(`Errore processando ${affiliate.id}:`, err);
      }
    }

    // ========================================
    // 2. AFFILIATI IN SEQUENZA (D1-D7)
    // ========================================
    console.log('📧 [Affiliate Cron] Processando sequenze...');

    const { data: inSequence } = await supabase
      .from('v_affiliates_sequence_ready')
      .select('*');

    for (const record of inSequence || []) {
      try {
        // Recupera dati completi
        const { data: fullData } = await supabase
          .from('v_affiliates_email_data')
          .select('*')
          .eq('affiliate_id', record.affiliate_id)
          .single();

        if (!fullData) continue;

        const emailData: AffiliateEmailData = {
          nome: fullData.nome,
          email: fullData.email,
          ref_code: fullData.ref_code,
          abbonamento_utente: fullData.abbonamento_utente,
          commissione_base: fullData.commissione_base,
          bonus_performance: fullData.bonus_performance,
          commissione_totale: fullData.commissione_totale,
          clienti_attivi: fullData.clienti_attivi,
          saldo_disponibile: fullData.saldo_disponibile,
          giorni_iscrizione: fullData.giorni_iscrizione,
          esercizi_completati: fullData.esercizi_completati,
          conversazioni_coach: fullData.conversazioni_coach,
        };

        const nextStep = record.next_step;
        const emailType = `D${nextStep}` as 'D1' | 'D2' | 'D3' | 'D4' | 'D5' | 'D6' | 'D7';

        // Invia email sequenza
        const result = await sendAffiliateEmail(emailType, emailData, {
          affiliateId: record.affiliate_id,
        });

        if (result.success) {
          // Avanza step (già fatto nella sendAffiliateEmail per tipo D*)
          results.sequence.sent++;
        } else {
          results.sequence.errors++;
          console.error(`Errore ${emailType} per ${fullData.email}:`, result.error);
        }
      } catch (err) {
        results.sequence.errors++;
        console.error(`Errore processando sequenza ${record.affiliate_id}:`, err);
      }
    }

    // ========================================
    // 3. AFFILIATI INATTIVI (E1)
    // ========================================
    console.log('📧 [Affiliate Cron] Processando inattivi...');

    const { data: inactive } = await supabase
      .from('v_affiliates_inactive')
      .select('*');

    for (const affiliate of inactive || []) {
      try {
        // Recupera dati completi
        const { data: fullData } = await supabase
          .from('v_affiliates_email_data')
          .select('*')
          .eq('affiliate_id', affiliate.affiliate_id)
          .single();

        if (!fullData) continue;

        const emailData: AffiliateEmailData = {
          nome: fullData.nome,
          email: fullData.email,
          ref_code: fullData.ref_code,
          abbonamento_utente: fullData.abbonamento_utente,
          commissione_base: fullData.commissione_base,
          bonus_performance: fullData.bonus_performance,
          commissione_totale: fullData.commissione_totale,
          clienti_attivi: fullData.clienti_attivi,
          saldo_disponibile: fullData.saldo_disponibile,
        };

        // Invia E1
        const result = await sendAffiliateEmail('E1', emailData, {
          affiliateId: affiliate.affiliate_id,
        });

        if (result.success) {
          results.e1.sent++;
        } else {
          results.e1.errors++;
          console.error(`Errore E1 per ${affiliate.email}:`, result.error);
        }
      } catch (err) {
        results.e1.errors++;
        console.error(`Errore processando inattivo ${affiliate.affiliate_id}:`, err);
      }
    }

    // ========================================
    // RIEPILOGO
    // ========================================

    return NextResponse.json({
      success: true,
      processed: results,
      timestamp: new Date().toISOString(),
    });

  } catch {
    return NextResponse.json(
      { error: 'Errore processamento' },
      { status: 500 }
    );
  }
}
