// API per checkout libri (one-time payment)
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getLibroBySlug } from '@/data/libri';

export const dynamic = 'force-dynamic';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
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
      metadata: {
        libro_slug: libro.slug,
        libro_titolo: libro.titolo,
        tipo: 'libro_pdf',
      },
      // Raccogli email per invio PDF
      customer_creation: 'always',
      // Permetti codici promo
      allow_promotion_codes: true,
      // Configura email automatica
      payment_intent_data: {
        metadata: {
          libro_slug: libro.slug,
          tipo: 'libro_pdf',
        },
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
