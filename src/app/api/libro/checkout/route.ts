// API per checkout libri (one-time payment) con tracking affiliato
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServiceClient } from '@/lib/supabase/service';
import { getLibroBySlug, getTrilogia } from '@/data/libri';
import { alertPaymentError } from '@/lib/error-alerts';

export const dynamic = 'force-dynamic';

const AFFILIATE_COOKIE_NAME = 'vitae_ref';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST(request: NextRequest) {
  try {
    const { libroSlug, priceId, otoDiscount, source, isTrilogia } = await request.json();

    // =========================================================================
    // TRILOGIA BUNDLE CHECKOUT
    // =========================================================================
    if (isTrilogia || libroSlug === 'trilogia') {
      return handleTrilogiaCheckout(request);
    }

    // =========================================================================
    // SINGLE BOOK CHECKOUT
    // =========================================================================
    // Valida libro
    const libro = getLibroBySlug(libroSlug);
    if (!libro) {
      return NextResponse.json(
        { error: `Libro non trovato: ${libroSlug}` },
        { status: 400 }
      );
    }

    // Calcola prezzo: OTO sconto €2 se proveniente da challenge thank you page
    const OTO_DISCOUNT = 2.00;
    const finalPrice = (otoDiscount && source === 'challenge_oto')
      ? Math.max(libro.prezzo - OTO_DISCOUNT, 0)
      : libro.prezzo;

    // Verifica priceId
    if (!priceId || priceId.startsWith('price_')) {
      // Se non c'è un price ID valido, usa un prezzo dinamico
    }

    const stripe = getStripe();
    const supabase = getServiceClient();

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
      }
    }

    // Prepara metadata con tracking affiliato e OTO
    const sessionMetadata: Record<string, string> = {
      libro_slug: libro.slug,
      libro_titolo: libro.titolo,
      tipo: 'libro_pdf',
    };

    if (otoDiscount && source === 'challenge_oto') {
      sessionMetadata.oto_discount = 'true';
      sessionMetadata.oto_source = 'challenge_thank_you';
    }

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
            unit_amount: Math.round(finalPrice * 100), // Stripe usa centesimi
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
    await alertPaymentError(
      error instanceof Error ? error : new Error('Checkout creation failed'),
      { endpoint: '/api/libro/checkout' }
    );
    return NextResponse.json(
      { error: 'Errore creazione checkout' },
      { status: 500 }
    );
  }
}

// ============================================================================
// TRILOGIA BUNDLE CHECKOUT HANDLER
// ============================================================================
async function handleTrilogiaCheckout(request: NextRequest) {
  const trilogia = getTrilogia();
  const stripe = getStripe();
  const supabase = getServiceClient();

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
    }
  }

  // Prepara metadata
  const sessionMetadata: Record<string, string> = {
    tipo: 'trilogy',
    libri: 'leadership,risolutore,microfelicita',
  };

  if (affiliateId) {
    sessionMetadata.affiliate_id = affiliateId;
  }
  if (clickId) {
    sessionMetadata.affiliate_click_id = clickId;
  }

  // Crea sessione checkout per trilogia bundle
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: trilogia.titolo,
            description: `${trilogia.sottotitolo} - Include: Leadership Autentica, Oltre gli Ostacoli, Microfelicità Digitale`,
            metadata: {
              type: 'trilogy',
              libri: 'leadership,risolutore,microfelicita',
            },
          },
          unit_amount: Math.round(trilogia.prezzo * 100), // Stripe usa centesimi
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/libro/trilogia/grazie?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/libro/trilogia?canceled=true`,
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
}
