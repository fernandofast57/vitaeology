// API per checkout libri (one-time payment) con tracking affiliato
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { getLibroBySlug } from '@/data/libri';

export const dynamic = 'force-dynamic';

const AFFILIATE_COOKIE_NAME = 'vitae_ref';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const { libroSlug, priceId } = await request.json();

    // Valida libro
    const libro = getLibroBySlug(libroSlug);
    if (!libro) {
      return NextResponse.json(
        { error: `Libro non trovato: ${libroSlug}` },
        { status: 400 }
      );
    }

    // Verifica priceId
    if (!priceId || priceId.startsWith('price_')) {
      // Se non c'è un price ID valido, usa un prezzo dinamico
    }

    const stripe = getStripe();
    const supabase = getSupabase();

    // =========================================================================
    // AFFILIATE TRACKING - Leggi cookie e trova affiliato
    // =========================================================================
    let affiliateId: string | null = null;
    let clickId: string | null = null;

    const refCode = request.cookies.get(AFFILIATE_COOKIE_NAME)?.value;

    if (refCode) {
      // Cerca affiliato per ref_code
      const { data: affiliate } = await supabase
        .from('affiliates')
        .select('id')
        .eq('ref_code', refCode)
        .eq('stato', 'attivo')
        .single();

      if (affiliate) {
        affiliateId = affiliate.id;

        // Cerca click più recente per questo affiliato (non ancora convertito)
        const { data: click } = await supabase
          .from('affiliate_clicks')
          .select('id')
          .eq('affiliate_id', affiliateId)
          .in('stato_conversione', ['click', 'signup', 'challenge_started', 'challenge_complete'])
          .order('clicked_at', { ascending: false })
          .limit(1)
          .single();

        if (click) {
          clickId = click.id;
        }

        console.log(`📊 Affiliate tracking: ref=${refCode}, affiliate_id=${affiliateId}, click_id=${clickId}`);
      }
    }

    // Prepara metadata con tracking affiliato
    const sessionMetadata: Record<string, string> = {
      libro_slug: libro.slug,
      libro_titolo: libro.titolo,
      tipo: 'libro_pdf',
    };

    if (affiliateId) {
      sessionMetadata.affiliate_id = affiliateId;
    }
    if (clickId) {
      sessionMetadata.affiliate_click_id = clickId;
    }

    // Crea sessione checkout per pagamento singolo
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: libro.titolo,
              description: libro.sottotitolo,
              metadata: {
                libro_slug: libro.slug,
              },
            },
            unit_amount: Math.round(libro.prezzo * 100), // Stripe usa centesimi
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/libro/${libro.slug}/grazie?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/libro/${libro.slug}?canceled=true`,
      metadata: sessionMetadata,
      // Raccogli email per invio PDF
      customer_creation: 'always',
      // Permetti codici promo
      allow_promotion_codes: true,
      // Configura email automatica
      payment_intent_data: {
        metadata: sessionMetadata,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Errore checkout libro:', error);
    return NextResponse.json(
      { error: 'Errore creazione checkout' },
      { status: 500 }
    );
  }
}
