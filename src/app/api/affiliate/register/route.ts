// ============================================================================
// API: /api/affiliate/register
// Descrizione: Registrazione nuovo affiliato
// Metodo: POST
// Auth: Pubblica (chiunque può registrarsi)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RegisterAffiliateInput {
  email: string;
  nome: string;
  cognome?: string;
  sito_web?: string;
  canali_promozione?: string[];
  come_promuovera?: string;
  accetta_termini: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body: RegisterAffiliateInput = await request.json();

    if (!body.email || !body.nome) {
      return NextResponse.json(
        { error: 'Email e nome sono obbligatori' },
        { status: 400 }
      );
    }

    if (!body.accetta_termini) {
      return NextResponse.json(
        { error: 'Devi accettare i termini del programma affiliati' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Formato email non valido' },
        { status: 400 }
      );
    }

    const { data: existingAffiliate } = await supabase
      .from('affiliates')
      .select('id, stato')
      .eq('email', body.email.toLowerCase())
      .single();

    if (existingAffiliate) {
      if (existingAffiliate.stato === 'terminated') {
        return NextResponse.json(
          { error: 'Questo indirizzo email non può essere utilizzato' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Email già registrata nel programma affiliati' },
        { status: 409 }
      );
    }

    const { data: { user } } = await supabase.auth.getUser();

    const { data: affiliate, error } = await supabase
      .from('affiliates')
      .insert({
        email: body.email.toLowerCase(),
        nome: body.nome.trim(),
        cognome: body.cognome?.trim() || null,
        sito_web: body.sito_web?.trim() || null,
        canali_promozione: body.canali_promozione || [],
        note_admin: body.come_promuovera || null,
        user_id: user?.id || null,
        stato: 'pending',
        categoria: 'BASE',
        commissione_percentuale: 30,
        termini_accettati: true,
        termini_accettati_at: new Date().toISOString(),
      })
      .select('id, ref_code, email, nome, stato, categoria')
      .single();

    if (error) {
      console.error('Errore creazione affiliato:', error);
      return NextResponse.json(
        { error: 'Errore durante la registrazione. Riprova più tardi.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Registrazione completata! Riceverai una email quando il tuo account sarà attivato.',
      affiliate: {
        id: affiliate.id,
        ref_code: affiliate.ref_code,
        email: affiliate.email,
        nome: affiliate.nome,
        stato: affiliate.stato,
        categoria: affiliate.categoria,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Errore API affiliate/register:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
